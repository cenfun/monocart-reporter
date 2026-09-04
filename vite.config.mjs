import fs from 'fs';
import path from 'path';
import vue from '@vitejs/plugin-vue';

import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import { visualizer } from 'rollup-plugin-visualizer';
import { build as esbuild } from 'esbuild';
import { createScriptLoader, deflateSync } from 'lz-utils';
import { build as viteBuild, defineConfig } from 'vite';

const APP_ID = 'monocart-reporter-app';
const NETWORK_ID = 'monocart-reporter-network';
const rootDir = import.meta.dirname;

const timestamp = (postfix) => {
    let ts = new Date(Date.now() - new Date().getTimezoneOffset() * 60 * 1000).toISOString().slice(2, 19);
    ts = ts.replace(/[-:]/g, '').replace('T', '-');
    return postfix ? `${ts}-${postfix}` : ts;
};

const getCommit = () => {
    const headPath = path.resolve(rootDir, '.git/HEAD');
    if (!fs.existsSync(headPath)) {
        return '';
    }
    const rev = fs.readFileSync(headPath, 'utf8').trim();
    if (!rev.includes(':')) {
        return rev.slice(0, 8);
    }
    const refPath = rev.split(':').pop().trim();
    const commitPath = path.resolve(rootDir, '.git', refPath);
    return fs.existsSync(commitPath) ? fs.readFileSync(commitPath, 'utf8').trim().slice(0, 8) : '';
};

const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf8'));
const tag = {
    timestamp: timestamp(),
    commit: getCommit()
};

const writeDevFile = (filename, content) => {
    const targetPath = path.resolve(rootDir, 'dist', filename);
    fs.mkdirSync(path.dirname(targetPath), {
        recursive: true
    });
    fs.writeFileSync(targetPath, content || '');
    console.log(`prepared dev data: ${path.relative(rootDir, targetPath)}`);
};

const prepareReporterData = () => {
    const jsonPath = path.resolve(rootDir, '.temp/monocart/index.json');
    if (!fs.existsSync(jsonPath)) {
        console.warn(`test report data not found: ${path.relative(rootDir, jsonPath)}`);
        writeDevFile('report-data.js', '');
        return;
    }

    let reportData;
    try {
        reportData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (error) {
        console.warn(`invalid test report data: ${path.relative(rootDir, jsonPath)} (${error.message})`);
        writeDevFile('report-data.js', '');
        return;
    }

    const convertDevPath = (filePath) => {
        if (!filePath) {
            return filePath;
        }
        const absolutePath = path.resolve(reportData.cwd, reportData.outputDir, filePath);
        return path.relative(rootDir, absolutePath).replace(/\\/g, '/');
    };

    const visitRows = (rows) => {
        if (!Array.isArray(rows)) {
            return;
        }
        rows.forEach((row) => {
            if (row.type === 'case' && row.attachments) {
                row.attachments.forEach((attachment) => {
                    attachment.path = convertDevPath(attachment.path);
                });
            }
            visitRows(row.subs);
        });
    };
    visitRows(reportData.rows);

    if (reportData.artifacts) {
        reportData.artifacts.forEach((artifact) => {
            artifact.path = convertDevPath(artifact.path);
        });
    }

    if (reportData.mermaid?.scriptSrc?.startsWith('assets')) {
        reportData.mermaid.scriptSrc = convertDevPath(reportData.mermaid.scriptSrc);
    }

    const compressed = deflateSync(JSON.stringify(reportData));
    writeDevFile('report-data.js', `window.reportData = '${compressed}';`);
};

const prepareNetworkData = () => {
    const dataFile = 'network-data.js';
    const reporterDir = path.resolve(rootDir, '.temp/monocart');
    let sourcePath;

    if (fs.existsSync(reporterDir)) {
        const networkDir = fs.readdirSync(reporterDir).find((item) => item.startsWith('network-'));
        if (networkDir) {
            sourcePath = path.resolve(reporterDir, networkDir, dataFile);
        }
    }

    if (!sourcePath || !fs.existsSync(sourcePath)) {
        console.warn(`network test data not found in: ${path.relative(rootDir, reporterDir)}`);
        writeDevFile(dataFile, '');
        return;
    }

    writeDevFile(dataFile, fs.readFileSync(sourcePath));
};

const createUiBuild = (id, entry, emptyOutDir) => ({
    configFile: false,
    root: rootDir,
    plugins: [
        vue(),
        cssInjectedByJs()
    ],
    publicDir: false,
    build: {
        outDir: path.resolve(rootDir, 'dist'),
        rolldownOptions: {
            input: path.resolve(rootDir, entry),
            output: {
                format: 'iife',
                name: id.replaceAll('-', '_'),
                entryFileNames: `${id}.js`
            }
        },
        chunkSizeWarningLimit: 1500,
        sourcemap: false,
        cssCodeSplit: false,
        emptyOutDir
    }
});

const logBuilt = (filePath) => {
    const size = (fs.statSync(filePath).size / 1024).toFixed(2);
    console.log(`built ${path.relative(rootDir, filePath)} ${size} kB`);
};

function buildEndPlugin() {
    return {
        name: 'build-end',
        async closeBundle() {
            // Build the second browser application with Vite as a standalone IIFE.
            await viteBuild(createUiBuild(NETWORK_ID, 'src/network/index.js', false));

            const packagesDir = path.resolve(rootDir, 'lib/packages');
            fs.rmSync(packagesDir, {
                force: true,
                recursive: true,
                maxRetries: 10
            });
            fs.mkdirSync(packagesDir, {
                recursive: true
            });

            // Bundle dependencies used by the Node.js runtime into CommonJS.
            const vendorPath = path.resolve(packagesDir, 'monocart-reporter-vendor.js');
            await esbuild({
                entryPoints: [path.resolve(rootDir, 'src/vendor/index.js')],
                outfile: vendorPath,
                bundle: true,
                platform: 'node',
                format: 'cjs',
                minify: true,
                sourcemap: false
            });
            logBuilt(vendorPath);

            // Convert shared ESM utilities to CommonJS for the Node.js runtime.
            const sharedPath = path.resolve(packagesDir, 'monocart-reporter-shared.js');
            await esbuild({
                entryPoints: [path.resolve(rootDir, 'src/shared/index.js')],
                outfile: sharedPath,
                bundle: true,
                platform: 'node',
                format: 'cjs',
                minify: true,
                sourcemap: false
            });
            logBuilt(sharedPath);

            // Package the template and both browser applications for runtime use.
            const assetsPath = path.resolve(packagesDir, 'monocart-reporter-assets.js');
            const assetsMap = {
                template: fs.readFileSync(path.resolve(rootDir, 'lib/default/template.html'), 'utf8'),
                [APP_ID]: createScriptLoader(fs.readFileSync(path.resolve(rootDir, `dist/${APP_ID}.js`), 'utf8')),
                [NETWORK_ID]: createScriptLoader(fs.readFileSync(path.resolve(rootDir, `dist/${NETWORK_ID}.js`), 'utf8'))
            };
            fs.writeFileSync(assetsPath, `module.exports = ${JSON.stringify(assetsMap, null, 4)};`);
            logBuilt(assetsPath);
        }
    };
}

export default defineConfig(({ command, mode }) => {
    const define = {
        'window.TAG': JSON.stringify(Object.values(tag).join('-')),
        'window.VERSION': JSON.stringify(pkg.version)
    };

    if (command === 'serve') {
        const networkMode = mode === 'network';
        if (networkMode) {
            prepareNetworkData();
        } else {
            prepareReporterData();
        }
        return {
            root: rootDir,
            publicDir: false,
            define,
            plugins: [
                vue()
            ],
            server: {
                open: networkMode ? '/network.html' : '/'
            }
        };
    }

    const config = createUiBuild(APP_ID, 'src/app/index.js', true);
    config.define = define;
    config.plugins.push(visualizer({
        filename: '.temp/build-stats.html'
    }), buildEndPlugin());
    return config;
});
