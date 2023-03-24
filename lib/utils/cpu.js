const os = require('os');

const getCpuMeasure = function() {
    let totalIdle = 0;
    let totalTick = 0;
    const cpus = os.cpus();
    const len = cpus.length;
    cpus.forEach((cpu) => {
        totalTick += Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
        totalIdle += cpu.times.idle;
    });
    return {
        totalIdle: totalIdle,
        totalTick: totalTick,
        avgIdle: totalIdle / len,
        avgTotal: totalTick / len
    };
};

const getCpuUsage = (time = 1000) => {
    return new Promise((resolve) => {
        const previousMeasure = getCpuMeasure();
        const previousUsage = process.cpuUsage();
        setTimeout(() => {

            // total CPU
            const currentMeasure = getCpuMeasure();
            const totalIdleDiff = currentMeasure.avgIdle - previousMeasure.avgIdle;
            const totalAvgDiff = currentMeasure.avgTotal - previousMeasure.avgTotal;
            // to number for chart
            const totalPercent = parseFloat((100 - totalIdleDiff / totalAvgDiff * 100).toFixed(2));

            // process CPU
            const currentUsage = process.cpuUsage(previousUsage);
            // microseconds to miliseconds
            const processTime = (currentUsage.system + currentUsage.user) / 1000;
            const totalDiff = currentMeasure.totalTick - previousMeasure.totalTick;
            const processPercent = parseFloat((processTime / totalDiff * 100).toFixed(2));

            resolve({
                total: totalPercent,
                process: processPercent,
                pid: process.pid
            });
        }, time);
    });
};

module.exports = getCpuUsage;

// setInterval(async () => {
//     const usage = await getCpuUsage();
//     console.log('CPU usage:', usage);
// }, 1000);


// mock CPU load
// take 500ms in 1000ms
// = single cpu 50%
// = total 8 cpus 50%/8 = 6.25%

// setInterval(function() {
//     const now = Date.now();
//     while (Date.now() - now < 500) { }
// }, 1000);
