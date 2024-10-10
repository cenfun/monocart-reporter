#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const { pathToFileURL } = require('url');
const EC = require('eight-colors');
const KSR = require('koa-static-resolver');
const Koa = require('koa');
const CG = require('console-grid');

const Util = require('./utils/util.js');
const {
    program, open, glob, findUpSync, supportsColor
} = require('./packages/monocart-reporter-vendor.js');
const getDefaultOptions = require('./default/options.js');
const merge = require('./merge-data.js');
const version = require('../package.json').version;

// https://github.com/chalk/supports-color
// disabled color if Terminal stdout does not support color
if (!supportsColor.stdout) {
    EC.disabled = true;
}


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

const findUpConfig = (customConfigFile) => {
    if (customConfigFile) {
        if (fs.existsSync(customConfigFile)) {
            return customConfigFile;
        }
        // custom config not found
        return;
    }

    const defaultConfigList = [
        'mr.config.js',
        'mr.config.cjs',
        'mr.config.mjs',
        'mr.config.json',
        'mr.config.ts'
    ];

    const configPath = findUpSync(defaultConfigList);
    if (configPath) {
        return configPath;
    }

    // default config not found
};

const checkRegisterFeature = () => {
    const nv = process.versions.node;

    // "module.register" added in Node.js: v20.6.0
    // if (Util.cmpVersion(nv, '20.6.0') >= 0) {
    //     return true;
    // }
    // but also added in: v18.19.0
    const requiredNV = '18.19.0';
    if (Util.cmpVersion(nv, requiredNV) < 0) {
        Util.logInfo(`The current Node.js version "${nv}" does NOT support "module.register", it requires "${requiredNV}" or higher.`);
        return false;
    }

    // could be < 20.6.0 but just ignore it, please using latest minor version

    return true;
};

const loadEnv = (cliOptions) => {
    if (!cliOptions.env) {
        return;
    }
    const envFile = cliOptions.env === true ? '.env' : cliOptions.env;
    const loadEnvFile = process.loadEnvFile;
    if (typeof loadEnvFile === 'function') {
        loadEnvFile(envFile);
    }
};


const initNodeOptions = async (cliOptions) => {

    loadEnv(cliOptions);

    const supportRegister = checkRegisterFeature();
    if (!supportRegister) {
        return;
    }

    // for loading mr.config.ts
    const modulePath = cliOptions.import || cliOptions.require;
    if (!modulePath) {
        return;
    }

    const res = await import(modulePath);
    if (res && typeof res.register === 'function') {
        await res.register();
    }

};


const resolveConfigOptions = async (configPath) => {
    // json format
    const ext = path.extname(configPath);
    if (ext === '.json' || configPath.slice(-2) === 'rc') {
        return JSON.parse(Util.readFileSync(configPath));
    }

    let configOptions;
    let err;
    try {
        configOptions = await import(pathToFileURL(configPath));
    } catch (ee) {
        err = ee;
    }

    if (err) {
        Util.logError(`ERROR: failed to load config "${configPath}": ${err && err.message} `);
        return;
    }

    // could be multiple level default
    while (configOptions && configOptions.default) {
        configOptions = configOptions.default;
    }

    return configOptions;
};

const exit = (code) => {
    if (code) {
        process.exit(code);
    }
};

const mergeReports = async (str, cliOptions) => {

    await initNodeOptions(cliOptions);

    const customConfig = cliOptions.config;
    const configPath = findUpConfig(customConfig);

    let configOptions = {};
    if (configPath) {
        configOptions = await resolveConfigOptions(configPath);
    } else {
        if (customConfig) {
            Util.logError(`ERROR: not found config file: ${customConfig}`);
            exit(1);
            return;
        }
    }

    const options = {
        ... getDefaultOptions(),
        ... configOptions,
        ... cliOptions
    };

    Util.initLoggingLevel(options.logging);

    Util.logInfo(`glob patterns: ${EC.cyan(str)}`);

    const files = await glob(str);
    if (!Util.isList(files)) {
        Util.logError(`ERROR: no files found with glob: ${str}`);
        exit(1);
        return;
    }

    Util.logInfo(`glob files: ${files.join(', ')}`);

    const reportData = await merge(files, options);
    if (!reportData) {
        exit(1);
    }
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

program.command('merge-reports')
    .alias('merge')
    .description('Merge reports')
    .argument('<path>', 'path to report dirs')
    .option('-c, --config <path>', 'config file')

    .option('-n, --name <name>', 'report name for title')
    .option('-o, --outputFile <path>', 'output file')

    .option('--import <module>', 'preload module at startup')
    .option('--require <module>', 'preload module at startup')

    .option('--env [path]', 'env file (default: ".env")')

    .action((str, options) => {
        mergeReports(str, options);
    });

program.addHelpText('after', `
Starts ${EC.cyan('https')} with option --ssl:
    npx monocart show-report <path-to-report> ${EC.cyan('--ssl <path-to-key,path-to-cert>')}
    # Create and install local CA with 'mkcert', see: https://mkcert.dev
`);

program.parse();
