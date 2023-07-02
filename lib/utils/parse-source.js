const {
    Worker, isMainThread, parentPort
} = require('worker_threads');
const Util = require('./util.js');
const { parse } = require('../runtime/monocart-vendor.js');

const parseSourceSync = (data) => {
    const {
        source, sourcePath, options
    } = data;

    let ast;
    try {
        ast = parse(source, options);
    } catch (e) {
        Util.logError(e.message);
        Util.logError(`failed to parse source file: ${Util.relativePath(sourcePath)}`);
    }
    return ast;
};


const parseSource = (data) => {
    return new Promise((resolve) => {

        const worker = new Worker(__filename);

        worker.on('message', (message) => {
            if (message === 'workerReady') {
                worker.postMessage(data);
                return;
            }
            resolve(message);
            worker.terminate();
        });

        worker.on('error', (e) => {
            Util.logError(e.message);
            resolve();
            worker.terminate();
        });

    });
};


if (isMainThread) {

    module.exports = {
        parseSource,
        parseSourceSync
    };

} else {

    parentPort.on('message', (message) => {
        const ast = parseSourceSync(message);
        parentPort.postMessage(ast);
    });

    parentPort.postMessage('workerReady');

}

