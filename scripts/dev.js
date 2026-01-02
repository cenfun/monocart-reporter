const { spawn } = require('child_process');
const path = require('path');

const env = {
    ... process.env
};

if (!env.CHOKIDAR_USEPOLLING) {
    env.CHOKIDAR_USEPOLLING = '1';
}

if (!env.CHOKIDAR_INTERVAL) {
    env.CHOKIDAR_INTERVAL = '500';
}

const sfBin = path.resolve(__dirname, `../node_modules/.bin/sf${process.platform === 'win32' ? '.cmd' : ''}`);
const child = spawn(sfBin, ['d', 'app', '-w', '.temp/monocart/index.json'], {
    stdio: 'inherit',
    env
});

child.on('exit', (code) => {
    process.exit(code);
});

child.on('error', (error) => {
    console.error(error);
    process.exit(1);
});
