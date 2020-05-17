import "@babel/polyfill";
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as ProgressBar from 'electron-progressbar';


import * as HideDPIProxy from "./proxy";


let mainWindow: Electron.BrowserWindow | null;

const init = async () => {
    var initProgress = new ProgressBar({
        "title": "Initializing Scav.js",
        "text": "Initializing...",
        "detail": "",
        browserWindow:{
            width: 400,
            height: 250,
            parent : mainWindow,
            webPreferences:{
                nodeIntegration: true
            }
        }
    })
    .on("completed", () => {
        createWindow();
    })
    .on("aborted", () => {
        app.quit();
    });

    // Check and Download Youtube-DL

    // Check and Download FFMPEG

    setTimeout(()=>{
        // close progressBar Dialog then launch main window
        initProgress.setCompleted();
    }, 1000);
}

const createWindow = async () => {
    console.log("cwd ->", path.resolve("."));
    console.log("dirname ->", __dirname);
    console.log("index.html ->", path.join(__dirname, "./index.html"));

    process.on("unhandledRejection", err=>{});
    process.on("uncaughtException", err=>{});

    mainWindow = new BrowserWindow({
        center : true,
        fullscreen : false,
        resizable : false,
        width : 1280,
        height: 720,
        title : "Scav.js",
        webPreferences:{
            nodeIntegration : true,
        }
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL(`http://localhost:4000`);
    } else {
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, '../index.html'),
                protocol: 'file:',
                slashes: true
            })
        );
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.on('ready', init);

app.allowRendererProcessReuse = true;