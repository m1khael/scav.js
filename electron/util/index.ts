import * as path from "path";
import * as fs from "fs";
import * as https from 'https';
import * as unzipper from "unzipper";


let isWin = process.platform === "win32" || process.env.NODE_PLATFORM === "windows";

function deleteForbiddenASCII(str : string) : string{
    // delete forbidden character for directory name
    // *nix, Windows

    // eslint-disable-next-line quotes
    var forbidden = ["<", ">", ":", '"', "/", "\\", "|", "?", "*"];

    forbidden.forEach((character)=>{
        str = str.split(character).join("_");
    });
    
    return str;
}

// for naming a file from gallery padded like 0001X
function getPaddedNumber(fileNum : string) : string{
    return "000000".substr(0, "000000".length-fileNum.length)+fileNum;
}

const checkFFMPEG = async() : Promise<boolean> =>{
    let bin = isWin? "ffmpeg.exe" : "ffmpeg";
    try{
        if(fs.existsSync(path.resolve(`./ffmpeg/${bin}`))){
            return true;
        }else{
            return false;
        }
    } catch (err) {
        console.error(`[INIT][ERROR][FFMPEG] ${err}`);
        return false;
    }
};

const checkYtdl = async () : Promise<boolean> => {
    let bin =  "";
    if(process.platform == "win32"){
        bin = "youtube-dl.exe";
    }else if(process.platform =="darwin"){
        bin = "youtube-dl-osx";
    }else{
        bin = "youtube-dl-linux";
    }

    try{
        if(fs.existsSync(path.resolve(`./ytdl-binary/${bin}`))){
            return true;
        }else{
            return false;
        }
    } catch(err){
        console.error(`[INIT][ERROR][YTDL] ${err}`);
        return false;
    }
};

const downloadGithub = async (url : string, filepath : string, filename : string, progressbar? : any) : Promise<any> => {
    let bin : string;
    if(process.platform == "win32"){
        bin = `${filename}.exe`
    }else if(process.platform == "darwin"){
        bin = `${filename}-osx`
    }else{
        bin = `${filename}-linux`
    }

    fs.mkdirSync(filepath, {recursive: true});

    return new Promise((resolve, reject)=>{
        let req = https.get(url, (res)=>{
            let str : string;

            res.on('error', (err)=>{
                reject(err);
            });

            res.on("data", (chunk)=>{
                str += chunk;
            });

            res.on("close", async()=>{
                const realURL = (str.match(/(https:\/\/.*)"/) || "")[1]
                                    .replace(/amp;/g, "");
                console.log("hello", realURL);
                try{
                    if(progressbar){
                        var result = await downloadWrapper(realURL, filepath, bin, progressbar);
                    }else{
                        var result = await downloadWrapper(realURL, filepath,bin);
                    }

                    resolve(true)
                } catch(err){
                    reject(err)
                }

            });
        }).on("error", (error)=>{
            reject(error);
        });

        req.end();
    })
}

const downloadWrapper = (url : string, filepath : string, bin : string,progress? : any) => {
    return new Promise((resolve, reject)=>{
        let req = https.get(url, (res)=>{
            let fileSize = parseInt(res.headers["content-length"] || "", 10) / 1024 || undefined;
            let file = fs.createWriteStream(path.resolve(filepath+'/'+bin));
            let downloaded = 0;

            res.on("error", (error)=>{
                reject(error);
            });

            res.on("data", (chunk)=>{
                downloaded += chunk.length;
                console.log(downloaded);
                if(fileSize && progress){
                    progress.detail = `Downloading ${bin}... ${(downloaded/1024).toFixed(1)} KB / ${fileSize?.toFixed(1)}`;
                }

                file.write(chunk);
            });

            res.on("close", ()=>{
                console.log(url, filepath);
                file.close();
                resolve(true);
            });
        });
        req.on("error", (err)=>{
            reject(err);
        })
        req.end();
    })
}

export { deleteForbiddenASCII, getPaddedNumber, downloadGithub, checkFFMPEG, checkYtdl}