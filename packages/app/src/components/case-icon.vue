<template>
  <div :class="state.icon" />
</template>
<script setup>
import { reactive, onMounted } from 'vue';
import Util from '../util/util.js';

const props = defineProps({
    caseItem: {
        type: Object,
        default: () => {
            return {};
        }
    }
});

const state = reactive({
    icon: ''
});

onMounted(() => {
    const list = ['mcr-icon'];
    if (props.caseItem.ok) {
        if (Util.isSkipped(props.caseItem)) {
            list.push('mcr-icon-skipped');
        } else {
            list.push('mcr-icon-passed');
        }
    } else {
        list.push('mcr-icon-failed');
    }

    state.icon = list.join(' ');
});

</script>
<style lang="scss">
.mcr-case-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

</style>
