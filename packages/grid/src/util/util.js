import { Util as util } from 'turbogrid';

const Util = {
    ... util,

    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    toNum: function(num, toInt) {
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
    },

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, '0');
    },

    //command log to html
    CH: function(data) {
        const arr = `${data}`.split(/\n/g);
        arr.forEach(function(str, i) {

            // space to &nbsp;
            str = str.replace(/ +/g, function(word) {
                const ls = [];
                ls.length = word.length + 1;
                return ls.join('&nbsp;');
            });
            str = str.replace(/</g, '&lt;');
            str = str.replace(/>/g, '&gt;');

            // 0-7
            // 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'

            // font color
            str = str.replace(/\033\[39m/g, '</span>');
            str = str.replace(/\033\[(3[0-7])m/g, '<span class="c$1">');
            str = str.replace(/\033\[(9[0-7])m/g, '<span class="c$1">');

            // background color
            str = str.replace(/\033\[49m/g, '</span>');
            str = str.replace(/\033\[(4[0-7])m/g, '<span class="bg$1">');
            str = str.replace(/\033\[(10[0-7])m/g, '<span class="bg$1">');

            // bold
            str = str.replace(/\033\[1m/g, '<span class="bold">');
            str = str.replace(/\033\[22m/g, '</span>');

            // italic
            str = str.replace(/\033\[3m/g, '<span class="italic">');
            str = str.replace(/\033\[23m/g, '</span>');

            // underline
            str = str.replace(/\033\[4m/g, '<span class="underline">');
            str = str.replace(/\033\[24m/g, '</span>');

            // blink
            str = str.replace(/\033\[5m/g, '<span class="blink">');
            str = str.replace(/\033\[25m/g, '</span>');

            // inverse
            str = str.replace(/\033\[7m/g, '<span class="inverse">');
            str = str.replace(/\033\[27m/g, '</span>');

            // strike
            str = str.replace(/\033\[9m/g, '<span class="strike">');
            str = str.replace(/\033\[29m/g, '</span>');

            // other
            str = str.replace(/\033\[(\d+)m/g, '');

            // link
            const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
            str = str.replace(re, function(a) {
                return `<a href="${a}" target="_blank">${a}</a>`;
            });

            arr[i] = str;
        });

        return `<div>${arr.join('</div><div>')}</div>`;
    },

    //number
    NF: function(v) {
        v = Util.toNum(v);
        return v.toLocaleString();
    },

    //percent
    PF: function(v, t = 1, digits = 1) {
        v = Util.toNum(v);
        t = Util.toNum(t);
        let per = 0;
        if (t) {
            per = v / t;
        }
        return `${(per * 100).toFixed(digits)}%`;
    },

    //time
    TF: function(v, unit, digits = 1) {
        v = Util.toNum(v, true);
        if (unit) {
            if (unit === 's') {
                v = (v / 1000).toFixed(digits);
            } else if (unit === 'm') {
                v = (v / 1000 / 60).toFixed(digits);
            } else if (unit === 'h') {
                v = (v / 1000 / 60 / 60).toFixed(digits);
            }
            return `${Util.NF(v)} ${unit}`;
        }
        const s = v / 1000;
        const hours = Math.floor(s / 60 / 60);
        const minutes = Math.floor((s - (hours * 60 * 60)) / 60);
        const seconds = Math.round(s - (hours * 60 * 60) - (minutes * 60));
        return `${hours}:${Util.zero(minutes)}:${Util.zero(seconds)}`;
    },

    //duration time
    DTF: function(v, maxV) {
        maxV = maxV || v;
        if (maxV > 60 * 1000) {
            return Util.TF(v);
        }
        return Util.TF(v, 'ms');
    }
};


export default Util;
