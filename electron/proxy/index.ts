import {Proxy} from "green-tunnel"

export default class HideDPIProxy{
    port : number;
    dns = "https://cloudflare-dns.com/dns-query";
    server : any;

    constructor(port? : number){
        if(port){
            this.port = port;
        }else{
            this.port = 22677;
        }
        
        this.server = new Proxy({
            ip: "127.0.0.1",
            port: this.port,
            dns: {
                type: "https",
                server : this.dns
            }
        });
    }

    async start(){
        await this.server.start({serProxy : false});
    }

    async stop(){
        await this.server.stop();
    }
}