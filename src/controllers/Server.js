class Server {
    constructor() {
        this.serverDomain = "http://a2361fd1c157.ngrok.io";
    }

    getServerDomain() {
        return this.serverDomain
    }
}

export let server = new Server();