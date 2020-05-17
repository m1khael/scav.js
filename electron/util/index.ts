import * as path from "path";
import * as fs from "fs";
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

const checkFFMPEG = async() =>{
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

const checkYtdl = async () => {
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