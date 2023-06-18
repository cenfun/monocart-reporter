const EC = require('eight-colors');
const { WebSocket } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');

const getServerUrl = (options = {}) => {
    return `ws://${options.host}:${options.port}`;
};

class Client {

    constructor(clientOptions) {
        this.options = clientOptions;
        this.requests = {};
        this.resolves = [];

        const serverUrl = getServerUrl(clientOptions);

        // https://github.com/websockets/ws/blob/master/doc/ws.md
        const ws = new WebSocket(serverUrl);

        ws.on('error', (err) => {

            // socket hang up: the port is exists but not websocket server
            // connect ECONNREFUSED: websocket server unavailable

            if (Util.isList(this.resolves)) {
                this.resolves.forEach((item) => {
                    item.reject(err);
                });
                this.resolves = null;
            } else {
                EC.logRed(`[SWS] websocket error: ${err.message}`);
            }

        });

        ws.on('message', (data) => {
            this.onMessage(data);
        });

        ws.on('open', () => {
            this.ws = ws;
            if (Util.isList(this.resolves)) {
                this.resolves.forEach((item) => {
                    item.resolve(ws);
                });
                this.resolves = null;
            }
        });
    }

    connect() {
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
                reject(new Error('[SWS] an error occurs when connecting websocket server'));
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

        let err;
        const ws = await this.connect().catch((e) => {
            err = e;
        });

        return new Promise((resolve, reject) => {

            if (!ws) {
                reject(err);
                return;
            }

            const id = Util.uid();
            const timeout = this.options.timeout;
            const timeout_id = setTimeout(() => {
                delete this.requests[id];
                reject(new Error(`[SWS] Timed out receiving message from websocket server: ${timeout}ms`));
            }, timeout);

            this.requests[id] = {
                resolve,
                timeout_id
            };

            // console.log(Object.keys(this.requests));

            const message = JSON.stringify({
                id,
                data
            });
            ws.send(message);
        });
    }

    state() {
        return {
            get: (... args) => {
                return this.execute(['get', ... args]);
            },

            set: (... args) => {
                return this.execute(['set', ... args]);
            },

            remove: (... args) => {
                return this.execute(['remove', ... args]);
            }
        };
    }

}


module.exports = {
    getServerUrl,
    Client
};
