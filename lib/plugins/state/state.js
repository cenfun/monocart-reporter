const EC = require('eight-colors');
const { WebSocketServer } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');
const Client = require('./client.js');

const defaultOptions = {
    data: {},
    // https://github.com/websockets/ws/blob/master/doc/ws.md
    server: {
        host: 'localhost',
        port: 8130
    },
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
        const { host, port } = defaultOptions.server;
        const clientOptions = {
            host,
            port,
            timeout: 3000,
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
    const actions = {
        get: (k) => {
            if (k) {
                return stateData[k];
            }
            return stateData;
        },
        set: (k, v) => {
            if (Util.hasOwn(stateData, k)) {
                if (v === stateData[k]) {
                    return;
                }
            }
            stateData[k] = v;
        },
        remove: (k) => {
            if (Util.hasOwn(stateData, k)) {
                delete stateData[k];
            }
        }
    };

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

    const options = Util.mergeOption(defaultOptions, stateOptions);

    if (!options.data || typeof options.data !== 'object') {
        options.data = {};
    }

    const serverOptions = options.server;

    const wss = new WebSocketServer(serverOptions);

    wss.on('error', (e) => {
        EC.logRed(`[SWS] an error occurs: ${e.message}`);
    });

    wss.on('connection', (ws) => {

        // data {Buffer|ArrayBuffer|Buffer[]}
        ws.on('message', (data) => {
            // console.log(data, isBinary);
            onMessage(ws, data, options.data, options.onChange);
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
