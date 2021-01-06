class Server {
    constructor() {
        this.serverDomain = "http://31e1b63fe4ba.ngrok.io/";
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