#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const EC = require('eight-colors');
const KSR = require('koa-static-resolver');
const Koa = require('koa');
const CG = require('console-grid');

const { program, open } = require('./packages/monocart-reporter-vendor.js');
const getDefaultOptions = require('./default/options.js');
const version = require('../package.json').version;

const getInternalIps = () => {
    const n = os.networkInterfaces();
    // console.log(n);
    const list = [];
    for (const k in n) {
        const inter = n[k];
        for (const j in inter) {
            const item = inter[j];
            if (item.family === 'IPv4' && !item.internal) {
                const a = item.address;
                if (a.startsWith('192.') || a.startsWith('10.')) {
                    list.push(a);
                }
            }
        }
    }
    return list;
};


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

const showIpInfo = (protocol, port) => {
    const ips = getInternalIps();
    CG({
        options: {
            headerVisible: false
        },
        columns: [{
            id: 'type'
        }, {
            id: 'url',
            formatter: (v) => {
                return EC.green(v);
            }
        }],
        rows: [{
            url: `${protocol}://localhost:${port}`,
            type: 'Local'
        }, ... ips.map((ip) => {
            return {
                url: `${protocol}://${ip}:${port}`,
                type: 'Internal'
            };
        })]
    });
};

const openUrl = async (p) => {
    await open(p);
};

const createServer = (app, options) => {

    if (options.ssl) {
        const [keyPath, certPath] = options.ssl.split(',');
        const serverOptions = {
            key: fs.readFileSync(path.resolve(keyPath)),
            cert: fs.readFileSync(path.resolve(certPath))
        };
        return https.createServer(serverOptions, app.callback());
    }

    return http.createServer(app.callback());

};

const serveReport = async (p, options) => {

    if (!p) {
        p = getDefaultOptions().outputFile;
    }

    const dirs = [];
    let filename = '';
    if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        if (stat.isDirectory()) {
            dirs.push(p);
        } else if (stat.isFile()) {
            filename = path.basename(p);
            dirs.push(path.dirname(p));
        }
    } else {
        EC.logRed(`The path does not exists: ${p}`);
    }

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

    const server = createServer(app, options);

    const port = await generatePort(8090);
    const protocol = options.ssl ? 'https' : 'http';

    const url = `${protocol}://localhost:${port}/${filename}`;

    server.listen(port, function() {
        EC.logCyan(`${new Date().toLocaleString()} server listening on ${url}`);
        if (protocol === 'https') {
            showIpInfo(protocol, port);
        }
        if (options.open) {
            openUrl(url);
        }
    });

};

program
    .name('monocart')
    .description('CLI to serve monocart reporter')
    .version(version);

program.command('show-report')
    .alias('show')
    .description('Show report')
    .argument('<path-to-report>', 'Report dir or html path')
    .option('-s, --ssl <path-to-key,path-to-cert>', 'Start https server')
    .action((str, options) => {
        options.open = true;
        serveReport(str, options);
    });

program.command('serve-report')
    .alias('serve')
    .description('Serve report')
    .argument('<path-to-report>', 'Report dir or html path')
    .option('-s, --ssl <path-to-key,path-to-cert>', 'Start https server')
    .action((str, options) => {
        serveReport(str, options);
    });

program.addHelpText('after', `
Starts ${EC.cyan('https')} with option --ssl:
    npx monocart show-report <path-to-report> ${EC.cyan('--ssl <path-to-key,path-to-cert>')}
    # Create and install local CA with 'mkcert', see: https://mkcert.dev
`);

program.parse();
