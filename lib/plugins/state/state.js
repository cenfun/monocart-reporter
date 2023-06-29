const EC = require('eight-colors');
const { WebSocketServer } = require('../../runtime/monocart-vendor.js');
const Util = require('../../utils/util.js');
const { getServerUrl, Client } = require('./client.js');

// https://github.com/websockets/ws/blob/master/doc/ws.md
const defaultServerOptions = {
    host: 'localhost',
    port: 8130
};

const defaultClientOptions = {
    ... defaultServerOptions,
    timeout: 3000
};

// ===============================================================================

const clientMap = new Map();
const useState = (options = {}) => {
    const clientOptions = {
        ... defaultClientOptions,
        ... options
    };

    // when used in global-setup will be override reporter (main process)
    Util.initLoggingLevel(clientOptions.logging, 'state');

    const clientKey = Object.keys(defaultClientOptions).map((k) => clientOptions[k]).join('-');
    // console.log('client key', clientKey);

    let client = clientMap.get(clientKey);
    if (!client) {
        client = new Client(clientOptions);
        clientMap.set(clientKey, client);
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

const onMessage = async (ws, buf, options) => {
    const message = JSON.parse(buf.toString());
    if (!message) {
        return;
    }
    const { id, data } = message;
    if (!id || !Array.isArray(data)) {
        return;
    }

    // first argument is action name always
    const action = data.shift();

    let resData;
    if (action === 'send') {
        // send handler
        if (typeof options.onReceive === 'function') {
            resData = await options.onReceive(data);
        }
    } else {
        // get/set/remove handler
        const actions = getActions(options.data);
        const handler = actions[action];
        if (handler) {
            resData = handler.apply(options, data);
        }
    }

    const response = JSON.stringify({
        id,
        data: resData
    });

    // always response, like send action
    // otherwise the request will be timeout
    ws.send(response);

};

const createStateServer = (stateOptions) => {

    const defaultStateOptions = {

        // key-value state data
        data: {},

        server: {}

        // onReceive: function(... args) {
        //     console.log('receive on server', args);
        //     return ['custom response', ... args];
        // },

        // onClose: function(data, config) {
        //     Object.assign(config.metadata, data);
        // },

    };

    const options = Util.mergeOption(defaultStateOptions, stateOptions);

    if (!options.data || typeof options.data !== 'object') {
        options.data = {};
    }

    const serverOptions = {
        ... defaultServerOptions,
        ... options.server
    };

    const wss = new WebSocketServer(serverOptions);

    wss.on('error', (e) => {
        Util.logError(`websocket server error: ${e.message}`);
    });
    wss.on('wsClientError', (e) => {
        Util.logError(`websocket client error: ${e.message}`);
    });

    wss.on('connection', (ws) => {

        // data {Buffer|ArrayBuffer|Buffer[]}
        ws.on('message', (data) => {
            // console.log(data, isBinary);
            onMessage(ws, data, options);
        });
    });

    wss.on('listening', () => {
        const serverUrl = getServerUrl(serverOptions);
        Util.logInfo(`state websocket server listening on ${EC.cyan(serverUrl)}`);
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
