class Server {
    constructor() {
        this.serverDomain = "https://a2361fd1c157.ngrok.io";
    }

    getServerDomain() {
        var serverDomainEdit = "";

        if (this.serverDomain.search('https') === -1){
            serverDomainEdit = this.serverDomain.replace("http", 'https')
        }
        return serverDomainEdit
    }
}

export let server = new Server();