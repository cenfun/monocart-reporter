const { WebSocket } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');

class Client {

    constructor(options) {
        this.options = options;
        this.requests = {};
        this.resolves = [];

        const ws = new WebSocket(options.serverUrl);

        ws.on('error', (e) => {

            if (this.resolves) {
                this.resolves.forEach((item) => {
                    item.reject(`[SWS] an error occurs: ${e.message}`);
                });
                this.resolves = null;
            }

        });

        ws.on('message', (data) => {
            this.onMessage(data);
        });

        ws.on('open', () => {
            this.ws = ws;
            if (this.resolves) {
                this.resolves.forEach((item) => {
                    item.resolve(ws);
                });
                this.resolves = null;
            }
        });
    }

    getConnect() {
        return new Promise((resolve, reject) => {

            if (this.ws) {
                resolve(this.ws);
                return;
            }

            if (this.resolves) {
                this.resolves.push({
                    resolve,
                    reject
                });
            } else {
                reject('[SWS] an error occurs when connecting websocket server');
            }
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

        let err;
        const ws = await this.getConnect().catch((e) => {
            err = e;
        });

        return new Promise((resolve, reject) => {

            if (!ws) {
                reject(err);
                return;
            }

            const timeout = this.options.timeout;
            const timeout_id = setTimeout(() => {
                delete this.requests[id];
                reject(`[SWS] Timed out receiving message from websocket server: ${timeout}ms`);
            }, timeout);

            this.requests[id] = {
                resolve,
                timeout_id
            };

            // console.log(Object.keys(this.requests));

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
