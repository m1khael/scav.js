var electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const session = electron.session;
const path = require('path');
const https = require('https');

let mainWindow = null;
let links = [];
var tries = 0;

const createWindow = () => {
    
    mainWindow = new BrowserWindow({
        webPreferences:{
            preload:path.join(__dirname, "instagram_preload.js"),
            nodeIntegration: true,
        }
    });
    try{
        mainWindow.webContents.debugger.attach('1.2');
    } catch(err){
        console.log("debugger attach failed ->", err);
    }

    mainWindow.webContents.openDevTools();
    let item_number = 0;
    mainWindow.webContents.on('did-finish-load', (evt, input)=>{
        evt.sender.send("check-more-button")
    });
    ipcMain.on('start-crawl', (evt,l)=>{
        evt.sender.send('crawl-crawl');
    })
    ipcMain.on('crawl-crawl', (evt,l)=>{
        var prev_length = links.length;
        links = [...links,...l];
        links = links.filter((link,index)=>links.indexOf(link) == index);
        console.log(prev_length, links.length);

        mainWindow.webContents.send('crawl-crawl', links.length);
    })
    ipcMain.on('stop-crawl', (evt)=>{
        console.log(links);
    })

    mainWindow.webContents.debugger.on('detach', (event, reason)=>{
        console.log("Debugger Detached due to -> ", reason);
    })

    mainWindow.webContents.debugger.on('message', (event,method,params)=>{
        if(method === 'Network.responseReceived'){
            if(params.response.url.indexOf('?query_hash') > 0){
                mainWindow.webContents.debugger.sendCommand('Network.getResponseBody', {"requestId": params.requestId})
                                               .then((body, encoded)=>{
                                                   console.log(body);
                                               })
                                               .catch((err)=>{
                                                   console.log(err);
                                               })
            }
        }
    });
    mainWindow.webContents.debugger.sendCommand('Network.enable')

    mainWindow.webContents.session.clearStorageData({storages: "cookies"})
                                  .then(()=>{
                                      mainWindow.loadURL("https://www.instagram.com/stefania_model/?hl=ko");
                                      //mainWindow.loadURL("https://www.instagram.com/tpain/?hl=en");
                                  })
    
}

app.on('ready', createWindow);
app.allowRendererProcessReuse = true;