const Util = require('./share.js');

const generateWaterfallChart = (data, options = {}) => {
    console.log(data);

    const o = {
        width: 800,
        height: 50,
        ... options
    };

    const { width, height } = o;

    const ls = ['<div class="mcr-waterfall">'];

    const lines = [];

    Util.pageTimings.forEach((pt) => {
        const v = data[pt.key];
        if (v > 0) {
            const left = Util.PF(v, data.time);
            lines.push(`<div class="mcr-waterfall-line" style="left:${left};background:${pt.color};"></div>`);
        }
    });

    const timings = {};
    Util.timings.forEach((item) => {
        timings[item.key] = {
            color: item.color,
            rects: []
        };
    });

    const heads = [{
        x: 0,
        y: 0
    }];
    data.entries.forEach((entry) => {
        const { start, time } = entry;
        let head = heads.find((h) => start >= h.x);
        if (!head) {
            head = {
                y: heads.length
            };
            heads.push(head);
        }

        const { y } = head;
        const h = 2;
        let p = 0;
        Util.timings.forEach((item) => {
            const v = entry[item.key];
            if (v > 0) {
                const rects = timings[item.key].rects;
                const w = Util.dFixed(v / data.time * width);
                const x = Util.dFixed((entry.start + p) / data.time * width);
                rects.push(`M${x},${y}v${h}h${w}v-${h}z`);
                p += v;
            }
        });

        head.x = Util.dFixed(start + time);

    });

    const viewBox = `0 0 ${width} ${height}`;
    ls.push(`<svg viewBox="${viewBox}" preserveAspectRatio="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`);

    Object.values(timings).forEach((item) => {
        if (item.rects.length) {
            const d = item.rects.join(' ');
            ls.push(`<path d="${d}" fill="${item.color}" />`);
        }
    });

    ls.push('</svg>');

    ls.push(lines.join(''));

    ls.push('</div>');

    return ls.join('');
};


module.exports = generateWaterfallChart;
