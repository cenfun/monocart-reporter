const EC = require('eight-colors');
const { WebSocketServer } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');
const Client = require('./client.js');

// https://github.com/websockets/ws/blob/master/doc/ws.md
const defaultServerOptions = {
    host: 'localhost',
    port: 8130
};

const defaultClientOptions = {
    ... defaultServerOptions,
    timeout: 3000
};

const defaultStateOptions = {

    // key-value state data
    data: {},

    server: defaultServerOptions,

    onClose: async (data, config) => {

    }
};


const getServerUrl = (options = {}) => {
    return `ws://${options.host}:${options.port}`;
};

// ===============================================================================

let client;
const useState = (options = {}) => {
    if (!client) {
        const clientOptions = {
            ... defaultClientOptions,
            ... options
        };
        const serverUrl = getServerUrl(clientOptions);
        client = new Client({
            serverUrl,
            timeout: clientOptions.timeout
        });
    }
    return client.state();
};

// ===============================================================================

const getActions = (stateData) => {
    return {
        get: (... args) => {
            if (args.length) {
                const values = args.map((k) => stateData[k]);
                if (args.length === 1) {
                    return values[0];
                }
                return values;
            }
            return stateData;
        },
        set: (... args) => {
            if (args.length) {
                const first = args[0];
                if (args.length === 1 && typeof first === 'object') {
                    Object.keys(first).forEach((key) => {
                        stateData[key] = first[key];
                    });
                    return;
                }
                stateData[first] = args[1];
            }
        },
        remove: (... args) => {
            if (args.length) {
                args.forEach((k) => {
                    if (Util.hasOwn(stateData, k)) {
                        delete stateData[k];
                    }
                });
            }
        }
    };
};

const onMessage = (ws, buf, stateData) => {
    const message = JSON.parse(buf.toString());
    if (!message) {
        return;
    }
    const { id, data } = message;
    if (!id || !Util.isList(data)) {
        return;
    }

    const action = data.shift();
    const actions = getActions(stateData);

    const handler = actions[action];
    if (!handler) {
        return;
    }
    const res = handler.apply(null, data);

    const response = JSON.stringify({
        id,
        data: res
    });

    ws.send(response);

};

const createStateServer = (stateOptions) => {

    const options = Util.mergeOption(defaultStateOptions, stateOptions);

    if (!options.data || typeof options.data !== 'object') {
        options.data = {};
    }

    const serverOptions = options.server;

    const wss = new WebSocketServer(serverOptions);

    wss.on('error', (e) => {
        EC.logRed(`[SWS] websocket server error: ${e.message}`);
    });
    wss.on('wsClientError', (e) => {
        EC.logRed(`[SWS] websocket client error: ${e.message}`);
    });

    wss.on('connection', (ws) => {

        // data {Buffer|ArrayBuffer|Buffer[]}
        ws.on('message', (data) => {
            // console.log(data, isBinary);
            onMessage(ws, data, options.data);
        });
    });

    wss.on('listening', () => {
        const serverUrl = getServerUrl(serverOptions);
        console.log(`[SWS] state websocket server listening on ${EC.cyan(serverUrl)}`);
    });

    return {
        close: async (config) => {
            wss.close();
            if (typeof options.onClose === 'function') {
                await options.onClose(options.data, config);
            }
        }
    };
};

module.exports = {
    createStateServer,
    useState
};