class Server {
    constructor() {
        this.serverDomain = "http://49e90ad9bb6a.ngrok.io";
    }

    getServerDomain() {
        return this.serverDomain
    }
}

export let server = new Server();