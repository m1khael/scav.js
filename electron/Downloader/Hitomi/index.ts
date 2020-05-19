import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import {EventEmitter} from "events";

import {v5 as uuidv5} from 'uuid';
import {eachOfLimit, IterableCollection} from 'async';
import {HttpsProxyAgent} from 'https-proxy-agent';


import * as HitomiHelper from './HitomiHelper';
import * as Util from '../../util';
import {DownloaderBase, DownloadInfo} from '../DownloaderBase';


class Hitomi extends EventEmitter implements DownloaderBase{
    info : DownloadInfo;
    images : Array<string> = [];
    proxyEnabled : boolean = false;
    proxyAgent : HttpsProxyAgent | undefined = undefined;
    downloaded : number = 0;
    fileSystemTitle : string = "";

    constructor(url : string, proxy? : boolean){
        super();
        this.info = new DownloadInfo();

        var re = /https:\/\/hitomi.la\/.+\/.*?-?(\d+)\.html.*/;
        this.info.type = "hitomi";
        this.info.origin = url;
        this.info.id = (url.match(re) || "")[1];
        if(this.info.id == undefined){
            this.emit('error', "[Hitomi] Invalid URL " + url);
            throw "[Hitomi] Invalid URL";
        }else{
            if(proxy){
                this.proxyAgent = new HttpsProxyAgent(`http://localhost:22677`);
                this.proxyAgent.maxSockets = 5;
                this.proxyEnabled = true;
            }
        }
    }

    async read(){
        let option : https.RequestOptions = {
            host : "ltn.hitomi.la",
            method: "GET",
            path :  `/galleries/${this.info.id}.js`,
            "headers":{
                "User-Agent": "Mozilla/5.0",
                "Content-Type" : "application/javascript; charset=UTF-8"
            },
        }

        if(this.proxyEnabled){
            option.agent = this.proxyAgent;
        }

        let result = await HitomiHelper.getGalleryInfo(option);
        
        // read info
        this.info.title = result.title;
        this.info.lang = result.language;

        this.info.author = await HitomiHelper.getAuthor(this.info.id);
        
        // read files
        for(var i=0; i<result.files.length; i++){
            this.images?.push(
                HitomiHelper.image_url_from_image(this.info.id, result.files[i])
            );
        }

        this.fileSystemTitle = Util.deleteForbiddenASCII(this.info.title);
        this.info.filepath = path.resolve(`./res/${this.fileSystemTitle} - ${this.info.lang} - ${this.info.id}`);

        var v5namespace = "37ae8350-d77d-4ba4-972b-0dc25688f4e9";
        this.info.uuid = uuidv5(this.info.title, v5namespace);

        this.emit('read', this.info);
    }

    async download(){
        fs.mkdirSync(this.info.filepath, {recursive: true});

        https.globalAgent.options.timeout = 8000;

        this.emit('start', this.info.uuid);
        eachOfLimit(this.images, 5, (image, idx, callback)=>{
            let option : any = {
                "host" : image.split("/")[2],
                "method" : "GET",
                "path" : image.slice(image.indexOf("image")-1),
                "headers":{
                    "Referer" : `https://hitomi.la/reader/${this.info.id}.html`,
                    "accept": "*/*",
                    "User-Agent" : "Mozilla/5.0"
                }
            };
            if(this.proxyEnabled){
                option.agent = this.proxyAgent;
            }

            let num = (idx as number + 1).toString();
            let ext = image.split(".").pop();

            let req = https.request(option, (res) => {
                let file = fs.createWriteStream(`${this.info.filepath}/${Util.getPaddedNumber(num)}.${ext}`)
                this.info.files.push(`${Util.getPaddedNumber(num)}.${ext}`);

                res.on("data", (chunk)=>{
                    file.write(chunk);
                });

                res.on("end", ()=>{
                    file.close();
                    this.downloaded++;
                    if(this.downloaded == this.images?.length){
                        this.emit('complete', this.info);
                    }else{
                        this.emit('downloading', this.info.uuid ,this.images?.length, this.downloaded);
                    }
                    callback();
                })
            }).on('error',(err)=>{
                this.emit('error', "Error during async download");
                callback();
            })

            req.end();
        }, (err) =>{
            this.emit('error', err);
        })
    }
}




(async()=>{
    var url = "";
    try{
        var h = new Hitomi(url);
        h.on('read', (info)=>{
            console.log(info);
            //h.download();
        });
        h.on('start', (uuid)=>{
            console.log("start ->", uuid);
        })
        h.on("downloading", (uuid,total,done)=>{
            console.log(`[Download] ${uuid} - ${done}/${total}`);
        })
        h.on('error',(err)=>{
            console.log(err);
        })
        h.on('complete', (info)=>{
            console.log("[COMPLETE] ",info);
        });
        await h.read();
    }catch (err){
        console.log(err.context);
    }
})();
