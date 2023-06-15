#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');
const EC = require('eight-colors');
const KSR = require('koa-static-resolver');
const Koa = require('koa');

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

const openUrl = async (p) => {
    const open = await import('open');
    await open.default(p);
};


const serveReport = async (list, openReport) => {
    if (!list.length) {
        list.push(defaultOptions.outputFile);
    }

    let filename = '';
    const dirs = list.filter((item) => {
        if (fs.existsSync(item)) {
            return true;
        }
        EC.logRed(`the path does not exists: ${item}`);
        return false;
    }).map((item) => {
        const stat = fs.statSync(item);
        if (stat.isDirectory()) {
            return item;
        }

        if (!filename) {
            filename = path.basename(item);
        }

        return path.dirname(item);
    });

    dirs.push('./');

    console.log('serve dirs', dirs);

    const app = new Koa();
    app.use(KSR({
        dirs,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        gzip: false,
        // max-age=<seconds>
        maxAge: 1
    }));

    const server = http.createServer(app.callback());

    const port = await generatePort(8090);

    const url = `http://localhost:${port}/${filename}`;

    server.listen(port, function() {
        EC.logCyan(`${new Date().toLocaleString()} server listening on ${url}`);
        if (openReport) {
            openUrl(url);
        }
    });

};

const start = function() {
    const args = process.argv.slice(2);
    const command = args.shift();
    // console.log(command, args);
    if (command === 'show-report') {
        serveReport(args, true);
        return;
    }

    if (command === 'serve-report') {
        serveReport(args, false);
    }
};

start();
