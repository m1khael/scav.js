import * as https from 'https';
var adapose = false;

export function image_url_from_image(galleryid : any, image : any) {
    var no_webp = image.haswebp;
    var webp;
    if (image["hash"] && image["haswebp"] && !no_webp) {
        webp = "webp";
    }
    
    return url_from_url_from_hash(galleryid, image, webp, undefined, undefined);
}

function parse_rawData(rawData : any){
    return JSON.parse(rawData.slice(18));
}

export function getGalleryInfo(options : https.RequestOptions) : Promise<any>{
    return new Promise ((resolve, reject)=>{
        let req = https.request(options, (res)=>{
            let rawGalleryData = "";
                
            res.on("data", (chunk)=>{
                rawGalleryData += chunk.toString();
            });
        
            res.on("end", async()=>{
                resolve(parse_rawData(rawGalleryData));
            });
        }).on("error", (err)=>{
            reject(err);
        });
        req.end();
    });   
}

export function getAuthor(id: string) : Promise<string>{
    return new Promise(async (resolve, reject)=>{
        try{
            var url = await getPage(id);
            let req = https.get(url, (res)=>{
                var html = "";
                res.on("data", (chunk)=>{
                    html += chunk;
                });
                res.on("end", ()=>{
                    var re = /<h2>\s*<ul class="comma-list">\s*<li><a href=.*>(.*)<\/a><\/li>\s*<\/ul>\s*<\/h2>/;
                    var result = (html.match(re) || "")[1];
                    resolve((html.match(re)||"")[1])
                })
            }).on("error", (err)=>{
                reject(err);
            });
            req.end();
        }catch(err){
            reject(err);
        }
    })
}

function getPage(id:string) : Promise<string>{
    return new Promise((resolve, reject) => {
        let req = https.get(`https://hitomi.la/galleries/${id}.html`, (res)=>{
            let full = "";
            res.on("data", (c)=>{
                full += c;
            })
            res.on("end", () => {
                var re = /"(https:\/\/.*)"/;
                var result = (full.match(re)||"")[1];
                resolve((full.match(re)||"")[1])
            })
        }).on("error", (err)=>{
            reject(err);
        })
    })
}

// from hitomi.la common.js

function url_from_url_from_hash(galleryid : any, image : any, dir : any, ext : any, base : any) {
    return url_from_url(url_from_hash(galleryid, image, dir, ext), base);
}

function url_from_hash(galleryid : any, image : any, dir : any, ext : any) {
    ext = ext || dir || image.name.split(".").pop();
    dir = dir || "images";
    
    return "https://a.hitomi.la/"+dir+"/"+full_path_from_hash(image.hash)+"."+ext;
}


function url_from_url(url : any, base : any) {
    return url.replace(/\/\/..?\.hitomi\.la\//, "//"+subdomain_from_url(url, base)+".hitomi.la/");
}

function subdomain_from_url(url : any, base : any) {
    var retval = "a";
    if (base) {
        retval = base;
    }
    
    var number_of_frontends = 3;
    var b = 16;
    
    var r = /\/[0-9a-f]\/([0-9a-f]{2})\//;
    var m = r.exec(url);
    if (!m) {
        return retval;
    }
    
    var g = parseInt(m[1], b);
    if (!isNaN(g)) {
        if (g < 0x30) {
            number_of_frontends = 2;
        }
        if (g < 0x09) {
            g = 1;
        }
        retval = subdomain_from_galleryid(g, number_of_frontends) + retval;
    }
    
    return retval;
}

function subdomain_from_galleryid(g : any, number_of_frontends : any) {
    if (adapose) {
        return "0";
    }
    
    var o = g % number_of_frontends;

    return String.fromCharCode(97 + o);
}


function full_path_from_hash(hash : any) {
    if (hash.length < 3) {
        return hash;
    }
    return hash.replace(/^.*(..)(.)$/, "$2/$1/"+hash);
}