const {
    Worker, isMainThread, parentPort
} = require('worker_threads');

if (isMainThread) {

    const decodeMappings = (mappings = '') => {
        if (typeof text !== 'string') {
            mappings = String(mappings);
        }

        return new Promise((resolve) => {

            const worker = new Worker(__filename);

            worker.on('message', (message) => {
                if (message === 'workerReady') {
                    worker.postMessage(mappings);
                    return;
                }
                resolve(message);
                worker.terminate();
            });

            worker.on('error', (err) => {
                resolve({
                    error: err
                });
                worker.terminate();
            });

        });
    };

    module.exports = decodeMappings;

} else {

    const { decode } = require('../../../runtime/monocart-coverage.js');

    parentPort.on('message', (message) => {
        const result = decode(message);
        parentPort.postMessage(result);
    });

    parentPort.postMessage('workerReady');

}

