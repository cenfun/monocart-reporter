<script setup>
const props = defineProps({
    pieChart: {
        type: Object,
        default: null
    }
});

const pieStyle = (pieChart) => {
    return {
        'max-width': `${pieChart.width}px`,
        'max-height': `${pieChart.height}px`
    };
};

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

<template>
  <div
    v-if="props.pieChart"
    class="mcr-pie-chart"
    :style="pieStyle(props.pieChart)"
    @click="onPieClick($event)"
    v-html="props.pieChart.svg"
  />
</template>

<style lang="scss">
.mcr-pie-chart {
    position: relative;
    width: 100%;
    overflow: hidden;

    svg {
        path:hover {
            opacity: 1;
        }
    }
}

</style>
