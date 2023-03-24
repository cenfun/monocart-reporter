const os = require('os');

const getCpuMeasure = function() {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();
    const count = cpus.length;
    cpus.forEach((cpu) => {
        totalTick += Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        totalIdle += cpu.times.idle;
    });
    return {
        // totalTick: totalTick,
        avgIdle: totalIdle / count,
        avgTotal: totalTick / count
    };
};

const getCpuUsage = (time = 1000) => {
    return new Promise((resolve) => {
        const previousMeasure = getCpuMeasure();
        // const previousUsage = process.cpuUsage();
        setTimeout(() => {

            // total CPU
            const currentMeasure = getCpuMeasure();
            const totalIdleDiff = currentMeasure.avgIdle - previousMeasure.avgIdle;
            const totalAvgDiff = currentMeasure.avgTotal - previousMeasure.avgTotal;
            // to number for chart
            const totalPercent = parseFloat((100 - totalIdleDiff / totalAvgDiff * 100).toFixed(2));

            // process CPU
            // const currentUsage = process.cpuUsage(previousUsage);
            // microseconds to miliseconds
            // const processTime = (currentUsage.system + currentUsage.user) / 1000;
            // const totalDiff = currentMeasure.totalTick - previousMeasure.totalTick;
            // const processPercent = parseFloat((processTime / totalDiff * 100).toFixed(2));

            resolve({
                percent: totalPercent
                // process: processPercent
            });
        }, time);
    });
};

const getMemUsage = () => {
    const freeMem = os.freemem();
    // integer representing the Resident Set Size (RSS) in bytes.
    // const processMem = process.memoryUsage.rss();
    return {
        free: freeMem
    };
};


const getTickInfo = async () => {
    const cpu = await getCpuUsage();
    const mem = getMemUsage();
    return {
        cpu,
        mem,
        timestamp: Date.now()
    };
};

// =======================================================================================

const getCpuInfo = function() {
    const cpus = os.cpus();
    const cpu = cpus[0];
    return {
        color: '#117DBB',
        count: cpus.length,
        model: cpu.model,
        speed: cpu.speed
    };
};

const getMemInfo = () => {
    return {
        color: '#8B12AE',
        total: os.totalmem()
    };
};

const getSystemInfo = () => {
    const cpu = getCpuInfo();
    const mem = getMemInfo();
    return {
        cpu,
        mem,

        arch: os.arch(),
        platform: os.platform(),
        release: os.release(),
        type: os.type(),
        version: os.version(),
        // server up time
        uptime: os.uptime(),

        hostname: os.hostname(),
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),

        // Added in: v18.9.0
        // machine: os.machine(),

        // os.networkInterfaces()

        pid: process.pid,
        cwd: process.cwd()
    };
};

module.exports = {
    getSystemInfo,
    getTickInfo
};

// setInterval(async () => {
//     const info = await getSystemInfo();
//     console.log(info);
//     const tick = await getTickInfo();
//     console.log(tick);
// }, 1000);


// mock CPU load
// take 500ms in 1000ms
// = single cpu 50%
// = total 8 cpus 50%/8 = 6.25%

// setInterval(function() {
//     const now = Date.now();
//     while (Date.now() - now < 500) { }
// }, 1000);
