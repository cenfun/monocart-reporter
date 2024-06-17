<script setup>
import { onMounted, shallowReactive } from 'vue';
import { components } from 'vine-ui';

import { titleTagsFormatter } from '../../modules/formatters.js';
import Util from '../../utils/util.js';
import IconLabel from '../icon-label.vue';

const { VuiFlex } = components;

const props = defineProps({
    rowItem: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({});

onMounted(() => {
    const rowItem = props.rowItem;

    data.classTitle = ['mcr-detail-title', `mcr-detail-${rowItem.type}`];

    if (rowItem.type === 'suite') {
        data.icon = Util.getTypeIcon(rowItem.suiteType, rowItem.type);
        data.size = '16px';
    } else if (rowItem.type === 'case') {
        data.icon = rowItem.caseType;
        data.size = '20px';
        data.caseType = rowItem.caseType;
        data.classStatus = ['mcr-detail-status', `mcr-status-${rowItem.caseType}`];
        data.classTitle.push(`mcr-title-${rowItem.caseType}`);
    }

    data.html = titleTagsFormatter(rowItem, rowItem.tg_titleColumn);

});


</script>

<template>
  <VuiFlex gap="5px">
    <IconLabel
      v-if="data.icon"
      :icon="data.icon"
      :size="data.size"
      :button="false"
    />

    <div
      v-if="data.caseType"
      :class="data.classStatus"
    >
      {{ data.caseType }}
    </div>

    <div
      :class="data.classTitle"
      v-html="data.html"
    />
  </VuiFlex>
</template>

<style lang="scss">
.mcr-detail-case.mcr-detail-title {
    font-weight: bold;
}

.mcr-detail-status {
    padding: 5px 10px;
    color: #fff;
    font-weight: 400;
    text-transform: capitalize;
    border-radius: 5px;
}

.mcr-status-failed {
    background-color: var(--color-failed);
}

.mcr-status-passed {
    background-color: var(--color-passed);
}

.mcr-status-flaky {
    background-color: var(--color-flaky);
}

.mcr-status-skipped {
    background-color: var(--color-skipped);
}

.mcr-title-failed {
    color: var(--color-failed);
}

</style>
