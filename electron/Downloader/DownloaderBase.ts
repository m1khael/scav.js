export interface DownloaderBase{
    info : DownloadInfo;

    on(event: 'read', listener: (info : object) => void) : this;
    on(event: 'start', listener: (uuid: string) => void) : this;
    on(event: 'downloading', listener: (uuid : string, total: number, downloaded: number) => void) : this;
    on(event: 'complete', listener: (info : object) => void): this;
    on(event: 'error', listener:(error: Error) => void) : this;
    read() : Promise<void>;
    download() : void;
}

export class DownloadInfo{
    id : string;
    uuid : string;
    title : string;
    author : string;
    type : string;
    lang : string;
    files : Array<String>;
    origin : string;
    filepath : string;

    constructor(){
        this.id = ""
        this.uuid = ""
        this.title = ""
        this.author = ""
        this.type = ""
        this.lang = ""
        this.files = [];
        this.origin = ""
        this.filepath = ""
    }
}