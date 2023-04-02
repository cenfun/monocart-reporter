const toNum = function(num, toInt) {
    if (typeof (num) !== 'number') {
        num = parseFloat(num);
    }
    if (isNaN(num)) {
        num = 0;
    }
    if (toInt) {
        num = Math.round(num);
    }
    return num;
};

const NF = function(v) {
    if (typeof v === 'number' && v) {
        return v.toLocaleString();
    }
    return v;
};

const point = (px, py) => {
    return `${dFixed(px)},${dFixed(py)}`;
};

const dFixed = (num, fixed = 1) => {
    if (Number.isInteger(num)) {
        return num;
    }
    return toNum(num.toFixed(fixed));
};

// const pxFixed = (num) => {
//     const floor = Math.floor(num);
//     if (num < floor + 0.5) {
//         return floor + 0.5;
//     }
//     return floor + 1.5;
// };

// ====================================================================================

const getSectorPath = function(x, y, r, from, till) {
    if (from === till) {
        return '';
    }

    const ds = [];

    // move to start point
    ds.push(`M${point(x, y)}`);

    // line to outer start point
    const osx = Math.cos(from) * r + x;
    const osy = Math.sin(from) * r + y;
    ds.push(`L${point(osx, osy)}`);

    const getLarge = (v) => {
        return v < Math.PI ? 0 : 1;
    };

    // 360 is a circle
    const radius = till - from;
    if (radius >= Math.PI * 2) {
        // draw two arc
        const tillM = from + radius * 0.5;
        const omx = Math.cos(tillM) * r + x;
        const omy = Math.sin(tillM) * r + y;
        ds.push(`A${point(r, r)} 0 ${getLarge(tillM - from)} 1 ${point(omx, omy)}`);

        // next arc
        const oex = Math.cos(till) * r + x;
        const oey = Math.sin(till) * r + y;
        ds.push(`A${point(r, r)} 0 ${getLarge(till - tillM)} 1 ${point(oex, oey)}`);

    } else {
        // small than 360
        // arc to outer end point
        const oex = Math.cos(till) * r + x;
        const oey = Math.sin(till) * r + y;
        ds.push(`A${point(r, r)} 0 ${getLarge(radius)} 1 ${point(oex, oey)}`);
    }
    // close
    ds.push('z');

    return ds.join(' ');
};

const getMovePos = (margin, from, till) => {
    const center = from + (till - from) * 0.5;
    const px = Math.cos(center) * margin;
    const py = Math.sin(center) * margin;
    return point(px, py);
};

const generatePieChart = (pieDataList) => {
    const o = {
        ns: 'mcr-pie',
        width: 150,
        height: 150,
        margin: 10,
        list: pieDataList
    };

    const pieWidth = o.height;
    const pieHeight = o.height;
    const margin = o.margin;

    const x = pieWidth / 2;
    const y = pieHeight / 2;
    const r = pieHeight / 2 - margin;

    const list = [];
    // start from 12 clock
    let start = 0.75;
    o.list.forEach((item, i) => {

        const from = 2 * Math.PI * start;
        const percent = parseFloat(item.percent) / 100 + start;
        const till = 2 * Math.PI * percent;
        start = percent;

        const d = getSectorPath(x, y, r, from, till);
        const pos = getMovePos(margin, from, till);
        // console.log(pos);

        list.push({
            id: item.id,
            name: item.name,
            value: item.value,
            color: item.color,
            percent: item.percent,
            from: '0,0',
            to: '0,0',
            pos,
            d
        });

    });

    const pies = [];

    // draw nothing bg
    const total = o.list.map((item) => item.value).reduce((a, v) => a + v, 0);
    if (total === 0) {
        pies.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#f5f5f5" />`);
    } else {
        list.forEach((item) => {
            pies.push(`<g class="${o.ns}-path-${item.id}">`);
            pies.push(`<path d="${item.d}" fill="${item.color}" />`);
            pies.push(`<animateTransform from="${item.from}" to="${item.to}" pos="${item.pos}" attributeName="transform" type="translate" dur="0.2s" fill="freeze" repeatCount="1" restart="always" />`);
            pies.push('</g>');
        });
    }

    // legends
    const legendWidth = 200;
    const legendHeight = Math.floor((o.height - margin * 2) / list.length);
    const legends = [`<g transform="translate(${pieWidth + margin} ${margin})">`];
    list.forEach((item, i) => {
        const midY = legendHeight * 0.5;
        legends.push(`<g class="${o.ns}-legend-${item.id}" transform="translate(0 ${legendHeight * i})">`);
        legends.push(`<circle cx="10" cy="${midY}" r="10" fill="${item.color}" />`);
        legends.push(`<text x="30" y="${midY}" alignment-baseline="middle">${item.name}</text>`);
        legends.push(`<text x="115" y="${midY}" alignment-baseline="middle" text-anchor="middle">${NF(item.value)}</text>`);
        legends.push(`<text x="${legendWidth - margin}" y="${midY}" alignment-baseline="middle" text-anchor="end">${item.percent}</text>`);
        legends.push('</g>');
    });
    legends.push('</g>');

    const height = o.height;
    const width = pieWidth + margin + legendWidth;
    o.width = width;

    const viewBox = `0 0 ${width} ${height}`;
    const ls = [`<svg viewBox="${viewBox}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`];
    ls.push(pies.join(''));
    ls.push(legends.join(''));
    ls.push('</svg>');
    o.svg = ls.join('');

    return o;
};

// ====================================================================================

module.exports = {
    generatePieChart
};
