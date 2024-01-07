import Util from '../utils/util.js';

const generateWaterfallChart = (data) => {
    // console.log(data);

    const width = 500;

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
        y: 0,
        x: 0
    }];

    const duration = data.time;
    data.entries.forEach((entry) => {
        const { start, time } = entry;
        let head = heads.find((h) => start >= h.x);
        if (!head) {
            // console.log(start, start + time, heads.map((it) => it.x));
            head = {
                y: heads.length
            };
            heads.push(head);
        }
        head.x = start + time;

        const y = head.y;
        const h = 2;
        let p = 0;
        Util.timings.forEach((item) => {
            const v = entry[item.key];
            if (v > 0) {
                const rects = timings[item.key].rects;
                const w = Util.dFixed(v / duration * width);
                const x = Util.dFixed((start + p) / duration * width);
                rects.push(`M${x},${y}v${h}h${w}v-${h}z`);
                p += v;
            }
        });

    });

    const height = Math.max(heads.length, 30);

    const viewBox = `0 0 ${width} ${height}`;
    ls.push(`<svg viewBox="${viewBox}" preserveAspectRatio="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`);

    let margin = 0;
    if (heads.length < height) {
        margin = (height - heads.length) * 0.5;
    }
    ls.push(`<g transform="translate(0 ${margin})">`);
    Object.values(timings).forEach((item) => {
        if (item.rects.length) {
            const d = item.rects.join(' ');
            ls.push(`<path d="${d}" fill="${item.color}" />`);
        }
    });
    ls.push('</g>');
    ls.push('</svg>');

    ls.push(lines.join(''));

    ls.push('</div>');

    return ls.join('');
};

export default generateWaterfallChart;
