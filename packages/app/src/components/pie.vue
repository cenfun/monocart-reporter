<template>
  <VuiFlex
    class="mcr-pie-chart"
    gap="20px"
  >
    <div
      @click="onPieClick($event)"
      v-html="state.charts.pie"
    />
  </VuiFlex>
</template>
<script setup>

import { components } from 'vine-ui';
import state from '../modules/state.js';

const { VuiFlex } = components;

const onPieClick = (e) => {

    const g = e.target.parentNode;
    if (!g) {
        return;
    }

    const cls = g.getAttribute('class');
    if (!cls || !cls.startsWith('mcr-pie-path-')) {
        return;
    }

    const at = g.querySelector('animateTransform');
    if (!at) {
        return;
    }

    const to = at.getAttribute('to');
    const pos = at.getAttribute('pos');

    if (to === '0,0') {
        at.setAttribute('from', '0,0');
        at.setAttribute('to', pos);
    } else {
        at.setAttribute('from', pos);
        at.setAttribute('to', '0,0');
    }

    at.beginElement();

};

</script>
<style lang="scss">
.mcr-pie-chart {
    position: relative;
    margin-right: 20px;
    overflow: hidden;

    svg {
        path:hover {
            opacity: 0.8;
        }
    }
}

</style>
