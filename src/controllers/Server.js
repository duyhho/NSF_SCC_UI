class Server {
    constructor() {
        this.serverDomain = "http://5607e79c1246.ngrok.io";
    }

    getServerDomain() {
        var serverDomainEdit = this.serverDomain;

        if (this.serverDomain.search('https') === -1){
            serverDomainEdit = serverDomainEdit.replace("http", 'https')
        }
        return serverDomainEdit
    }
}

export let server = new Server();