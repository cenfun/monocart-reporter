<script setup>
import { watchEffect, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';
import generateWaterfallChart from '../../../modules/waterfall.js';

const { VuiFlex } = components;

const props = defineProps({
    data: {
        type: Object,
        default: () => {}
    }
});

const d = shallowReactive({
    pages: []
});

const initReportData = (report) => {

    const {
        summary, pages, browser, creator
    } = report;

    d.summary = summary;

    d.status = [];
    Object.keys(summary.status).forEach((k) => {
        const s = `${k}`;
        let color = '';
        if (s.startsWith('2')) {
            color = 'color: green;';
        } else if (s.startsWith('4')) {
            color = 'color: red;';
        }
        const count = summary.status[k];
        d.status.push({
            name: s,
            color,
            count
        });
    });

    d.methods = [];
    Object.keys(summary.methods).forEach((k) => {
        d.methods.push({
            name: k,
            count: summary.methods[k]
        });
    });

    d.browser = browser;
    d.creator = creator;

    d.pages = [];
    if (!Util.isList(pages)) {
        return '';
    }

    pages.forEach((page, i) => {
        const { onContentLoad, onLoad } = page.pageTimings;
        const title = page.title;
        let number = '';
        if (pages.length > 1) {
            number = ` ${i + 1}`;
        }
        const waterfall = summary.waterfalls[page.id];
        const waterfallChart = generateWaterfallChart(waterfall);

        d.pages.push({
            title,
            number,
            onContentLoad,
            onLoad,
            waterfall,
            waterfallChart
        });

    });


};

watchEffect(() => {
    const report = props.data.report;
    if (report) {
        initReportData(report);
    }
});
</script>

<template>
  <VuiFlex
    class="mcr-attachment-network"
    padding="10px"
    direction="column"
    gap="10px"
  >
    <div
      v-for="(item, i) of d.pages"
      :key="i"
    >
      <VuiFlex
        gap="10px"
      >
        <div><b>Page{{ item.number }}</b></div>
        <div>{{ item.title }}</div>

        <div
          v-if="item.onContentLoad>0"
          style="color: #1a1aa6;"
        >
          ContendLoaded {{ Util.TF(item.onContentLoad) }}
        </div>

        <div
          v-if="item.onLoad>0"
          style="color: #c80000;"
        >
          Load {{ Util.TF(item.onLoad) }}
        </div>

        <div>Duration {{ Util.TF(item.waterfall.time) }}</div>
      </VuiFlex>

      <div
        class="mcr-network-waterfall"
        v-html="item.waterfallChart"
      />
    </div>

    <VuiFlex gap="10px">
      <div><b>Requests</b> <span class="mcr-num">{{ d.summary.requests }}</span></div>
      <div><b>Transferred</b> {{ Util.BF(d.summary.size) }}</div>
    </VuiFlex>

    <VuiFlex gap="10px">
      <div><b>Status</b></div>
      <div
        v-for="(item, i) of d.status"
        :key="i"
      >
        <span :style="item.color">{{ item.name }}</span> <span class="mcr-num">{{ item.count }}</span>
      </div>
    </VuiFlex>

    <VuiFlex gap="10px">
      <div><b>Methods</b></div>
      <div
        v-for="(item, i) of d.methods"
        :key="i"
      >
        {{ item.name }} <span class="mcr-num">{{ item.count }}</span>
      </div>
    </VuiFlex>

    <VuiFlex
      v-if="d.browser||d.creator"
      gap="10px"
    >
      <div v-if="d.browser">
        <b>Browser</b> {{ d.browser.name }} {{ d.browser.version }}
      </div>
      <div v-if="d.creator">
        <b>Creator</b> {{ d.creator.name }} {{ d.creator.version }}
      </div>
    </VuiFlex>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-attachment-network {
    .mcr-network-waterfall {
        width: 100%;
        height: 30px;
        margin-top: 10px;
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
