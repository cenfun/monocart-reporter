#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const EC = require('eight-colors');
const KSR = require('koa-static-resolver');
const { Koa, open } = require('./runtime/monocart-vendor.js');
const defaultOptions = require('./default/options.js');

const generatePort = (startPort) => {
    return new Promise((resolve) => {
        const server = net.createServer().listen(startPort);
        server.on('listening', function() {
            server.close();
            resolve(startPort);
        });
        server.on('error', function(err) {
            if (err.code === 'EADDRINUSE') {
                generatePort(startPort + 1).then((port) => {
                    resolve(port);
                });
            } else {
                resolve(startPort);
            }
        });
    });
};


const showReport = async (list) => {
    if (!list.length) {
        list.push(defaultOptions.outputFile);
    }

    list.forEach((item) => {
        if (!fs.existsSync(path.resolve(item))) {
            EC.logRed(`the path does not exists: ${item}`);
        }
    });

    console.log(list);

    const app = new Koa();
    app.use(KSR({
        dirs: [

            process.cwd()
        ],
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        gzip: false,
        // max-age=<seconds>
        maxAge: 1
    }));

    const server = http.createServer(app.callback());

    const port = await generatePort(8090);

    const url = `http://localhost:${port}`;

    server.listen(port, function() {
        EC.logCyan(`${new Date().toLocaleString()} server listening on ${url}`);
        open(url);
    });

};

const start = function() {
    const args = process.argv.slice(2);
    const command = args.shift();
    // console.log(command, args);
    if (command === 'show-report') {
        showReport(args);
    }
};

start();
