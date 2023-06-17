const EC = require('eight-colors');
const { WebSocket } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');

class Client {

    constructor(options) {
        this.options = options;
        this.requests = {};
        this.resolves = [];

        const ws = new WebSocket(options.serverUrl);

        ws.on('error', (e) => {
            EC.logRed(`[SWS] an error occurs: ${e.message}`);
        });

        ws.on('message', (data) => {
            this.onMessage(data);
        });

        ws.on('open', () => {
            this.ws = ws;
            if (this.resolves) {
                this.resolves.forEach((resolve) => {
                    resolve(ws);
                });
                this.resolves = null;
            }
        });
    }

    createConnect() {
        if (this.ws) {
            return this.ws;
        }
        return new Promise((resolve) => {
            this.resolves.push(resolve);
        });
    }

    onMessage(buf) {
        const message = JSON.parse(buf.toString());
        if (!message) {
            return;
        }
        const { id, data } = message;
        if (!id) {
            return;
        }

        const req = this.requests[id];
        if (!req) {
            return;
        }

        delete this.requests[id];

        clearTimeout(req.timeout_id);
        req.resolve(data);

    }

    async execute(data) {
        const id = Util.uid();
        const message = JSON.stringify({
            id,
            data
        });

        const ws = await this.createConnect();

        return new Promise((resolve, reject) => {
            const timeout = this.options.timeout;
            const timeout_id = setTimeout(() => {
                reject(`Timed out receiving message from websocket server: ${timeout}ms`);
            }, timeout);

            this.requests[id] = {
                resolve,
                timeout_id
            };

            ws.send(message);
        });
    }

    state() {
        return {
            get: (k) => {
                return this.execute(['get', k]);
            },

            set: (k, v) => {
                return this.execute(['set', k, v]);
            },

            remove: (k) => {
                return this.execute(['remove', k]);
            }
        };
    }


}


module.exports = Client;
