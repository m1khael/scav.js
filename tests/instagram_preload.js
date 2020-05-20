const {ipcRenderer} = window.require('electron');

let links = [];
let prev_links= [];
ipcRenderer.on('check-more-button', ()=>{
    console.log("hello")
    var checkExists = setInterval(function(){
        if(document.getElementsByClassName("tCibT").length > 0){
            console.log("exists!");
            document.getElementsByClassName("tCibT")[0].click();
            clearInterval(checkExists);
            var temp = Array.from(document.querySelectorAll("div.v1Nh3 > a")).map((a)=>{return a.href})
            //ipcRenderer.send('start-crawl', temp);
        }
    }, 150);
})

ipcRenderer.on("crawl-crawl", (evt, length)=>{
    console.log("crawl-crawl", length);
    window.scrollTo(0, document.body.scrollHeight);
    var temp = Array.from(document.querySelectorAll("div.v1Nh3 > a")).map((a)=>{return a.href});
    if(prev_links[prev_links.length -1] == temp[temp.length -1]){

    }else{
        prev_links = temp;
        ipcRenderer.send('crawl-crawl', temp);
    }
})

var checkLoginPopup = setInterval(()=>{
    if(document.getElementsByClassName('RnEpo').length > 0){
        var node = document.getElementsByClassName('RnEpo')[0]
        var parent = node.parentNode;
        parent.removeChild(node);
        document.body.setAttribute('style','');
        clearInterval(checkLoginPopup);
    }
}, 150);
var checkScroll = setInterval(()=>{
    if(document.body.style.cssText.includes("hidden")){
        console.log("scroll bar!")
        document.body.style.cssText.replace('hidden','');
        clearInterval(checkScroll);
    }
}, 500);