<template>
  <div class="mcr-timing">
    <div class="mcr-timing-waterfall">
      <Waterfall
        :timings="data.timings"
        :page-timings="data.pageTimings"
      />
    </div>
  </div>
</template>
<script setup>
import {
    inject, shallowReactive, watchEffect
} from 'vue';
import Waterfall from './waterfall.vue';

const props = defineProps({
    entry: {
        type: Object,
        default: null
    }
});

const state = inject('state');

const data = shallowReactive({});

const update = (entry) => {
    if (!entry) {
        return;
    }

    console.log(entry);

    data.timings = null;
    data.pageTimings = null;

    let currentPage;
    if (entry.type === 'page') {
        currentPage = entry;
    } else {
        data.timings = {
            ... entry.timings,
            timestampStart: entry.timestampStart
        };
        currentPage = state.pageMap[entry.pageref];
    }

    if (currentPage) {
        data.pageTimings = {
            ... currentPage.pageTimings,
            timestampStart: currentPage.timestampStart,
            timestampEnd: currentPage.timestampEnd
        };
    }

};

watchEffect(() => {
    update(props.entry);
});

</script>
<style lang="scss">
.mcr-timing {
    position: relative;
}

.mcr-timing-waterfall {
    height: 32px;
}
</style>
