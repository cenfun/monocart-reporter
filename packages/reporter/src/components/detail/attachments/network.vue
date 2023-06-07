<script setup>
import Util from '../../../utils/util.js';
import generateWaterfallChart from '../../../modules/waterfall.js';

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});


const getNetworkBody = (report) => {
    if (!report) {
        return '';
    }

    const {
        summary, pages, browser, creator
    } = report;

    if (!Util.isList(pages)) {
        return '';
    }

    const list = [];

    pages.forEach((page, i) => {
        const { onContentLoad, onLoad } = page.pageTimings;
        const title = page.title;
        let number = '';
        if (pages.length > 1) {
            number = ` ${i + 1}`;
        }
        list.push('<div class="mcr-attachment-group">');
        list.push(`<div><b>Page${number}</b></div>`);
        list.push(`<div>${title}</div>`);

        if (onContentLoad > 0) {
            list.push(`<div style="color:#1A1AA6;">ContendLoaded ${Util.TF(onContentLoad)}</div>`);
        }

        if (onLoad > 0) {
            list.push(`<div style="color:#C80000;">Load ${Util.TF(onLoad)}</div>`);
        }

        const waterfall = summary.waterfalls[page.id];
        list.push(`<div>Duration ${Util.TF(waterfall.time)}</div>`);

        list.push('</div>');

        const waterfallChart = generateWaterfallChart(waterfall);
        list.push('<div class="mcr-attachment-group">');
        list.push(`<div class="mcr-network-waterfall">${waterfallChart}</div>`);
        list.push('</div>');
    });

    list.push('<div class="mcr-attachment-group">');
    list.push(`<div><b>Requests</b> <span class="mcr-num">${summary.requests}</span></div>`);
    list.push(`<div><b>Transferred</b> ${Util.BF(summary.size)}</div>`);
    list.push('</div>');

    list.push('<div class="mcr-attachment-group">');
    list.push('<div><b>Status</b></div>');
    Object.keys(summary.status).forEach((k) => {
        let s = `${k}`;
        if (s.startsWith('2')) {
            s = `<span style="color:green;">${s}</span>`;
        } else if (s.startsWith('4')) {
            s = `<span style="color:red;">${s}</span>`;
        }
        list.push(`<div>${s} <span class="mcr-num">${summary.status[k]}</span></div>`);
    });
    list.push('</div>');

    list.push('<div class="mcr-attachment-group">');
    list.push('<div><b>Method</b></div>');
    Object.keys(summary.methods).forEach((k) => {
        list.push(`<div>${k} <span class="mcr-num">${summary.methods[k]}</span></div>`);
    });
    list.push('</div>');


    list.push('<div class="mcr-attachment-group">');
    if (browser) {
        list.push(`<div><b>Browser</b> ${browser.name} v${browser.version}</div>`);
    }
    if (creator) {
        list.push(`<div><b>Creator</b> ${creator.name} v${creator.version}</div>`);
    }
    list.push('</div>');


    const body = list.join('');

    return body;
};


</script>

<template>
  <div class="mcr-attachment-network">
    <div class="mcr-attachment-head">
      <a
        :href="props.data.path"
        target="_blank"
        class="mcr-item"
      >{{ props.data.name }}</a>
    </div>
    <div class="mcr-attachment-body">
      ${body}
    </div>
  </div>
</template>

<style lang="scss">
.mcr-attachment-network {
    .mcr-network-waterfall {
        width: 100%;
        height: 30px;
    }

    .mcr-waterfall {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #f8f8f8;
    }

    .mcr-waterfall-line {
        position: absolute;
        top: 0;
        width: 1px;
        height: 100%;
    }

    .mcr-waterfall-rect {
        position: absolute;
        top: 50%;
        height: 50%;
        transform: translateY(-50%);
    }
}
</style>
