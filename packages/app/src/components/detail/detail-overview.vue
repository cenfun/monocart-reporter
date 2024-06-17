<script setup>
import {
    ref, watch, shallowReactive, onMounted
} from 'vue';
import { components } from 'vine-ui';
import { microtask } from 'monocart-common';

import 'github-markdown-css/github-markdown-light.css';

import Util from '../../utils/util.js';
import state from '../../modules/state.js';
import { getPositionId, initDataColumns } from '../../modules/detail-columns.js';
import { renderMermaid } from '../../modules/mermaid.js';

// import IconLabel from '../icon-label.vue';
import SimpleColumns from './simple-columns.vue';
import DetailColumns from './detail-columns.vue';
import DurationLocation from './duration-location.vue';
import RowTitle from './row-title.vue';

const { VuiFlex } = components;

const data = shallowReactive({
    list: []
});

const el = ref(null);

const isCurrentTab = () => {
    return state.tabIndex === 0;
};

// ===========================================================================

const collectErrorForAttachment = (collection) => {
    const { errors, attachments } = collection;

    if (!attachments.length || !errors.length) {
        return;
    }

    const list = attachments.filter((attachment) => {
        if (attachment.name) {
            // first one is expected
            const match = attachment.name.match(/^(.*)-expected(\.[^.]+)?$/);
            if (match) {
                return true;
            }
        }
    });

    if (!list.length) {
        return;
    }

    let index = 0;
    errors.forEach((item) => {
        const { error, position } = item;
        const match = error.match(/\d+ pixels \(ratio \d+\.\d+ of all image pixels\) are different/);
        if (match) {
            const attachment = list[index];
            if (attachment) {
                attachment.message = match[0];
                attachment.position = position;
                index += 1;
            }
        }
    });

};

const initDataList = (caseItem) => {

    const list = [];

    // suites
    let suite = caseItem.tg_parent;
    while (suite) {
        list.unshift(suite);
        suite = suite.tg_parent;
    }

    // case
    list.push(caseItem);

    // temp list for errors match to attachments
    const collection = {
        errors: [],
        attachments: []
    };

    list.forEach((item) => {

        initDataColumns(item, collection);

        item.tg_style = `margin-left: ${item.tg_level * 13}px;`;
        item.tg_positionId = getPositionId(item.id, 'title');

    });
    data.list = list;

    collectErrorForAttachment(collection);

    renderMermaid();

};

// ===========================================================================

const updatePosition = (position) => {

    if (!el.value) {
        return;
    }

    if (position.type === 'step') {
        return;
    }

    // check positionId first
    let found = false;
    const positionId = getPositionId(position.rowId, position.columnId);
    let elem = el.value.querySelector(`[position-id="${positionId}"]`);
    if (elem) {
        found = true;
    } else {
        // not found but try to find related type position
        elem = el.value.querySelector(`[position-type="${position.columnId}"]`);
    }

    // found case and suite
    if (elem) {
        if (typeof elem.scrollIntoViewIfNeeded === 'function') {
            elem.scrollIntoViewIfNeeded();
        } else {
            elem.scrollIntoView();
        }
        if (found) {
            Util.setFocus(elem);
        }
        return;
    }

    // not found
    Util.setFocus();
};

watch(() => state.position, (v) => {
    if (v && isCurrentTab()) {
        updatePosition(v);
    }
});

// ===========================================================================

const updateCase = microtask(() => {

    if (!isCurrentTab()) {
        return;
    }

    const caseId = state.flyoverData;
    if (!caseId) {
        return;
    }
    const caseItem = state.detailMap[caseId];
    if (!caseItem) {
        return;
    }

    initDataList(caseItem);

});

watch(() => state.flyoverData, (v) => {
    if (state.flyoverComponent === 'detail') {
        updateCase();
    }
});

watch(() => state.tabIndex, () => {
    updateCase();
});

onMounted(() => {
    updateCase();
});

const onFocus = (e) => {
    Util.setFocus();
};

</script>

<template>
  <div
    ref="el"
    class="mcr-detail-overview"
    tabindex="0"
    @focus="onFocus"
    @click="onFocus"
  >
    <div
      v-for="(item, i) in data.list"
      :key="item.id+i"
      class="mcr-detail-item"
      :style="item.tg_style"
    >
      <VuiFlex
        class="mcr-detail-head"
        gap="10px"
        :position-id="item.tg_positionId"
        wrap
      >
        <RowTitle :row-item="item" />

        <SimpleColumns :list="item.tg_simpleColumns" />

        <div class="vui-flex-auto" />

        <DurationLocation :row-item="item" />
      </VuiFlex>

      <DetailColumns
        class="mcr-detail-body"
        :list="item.tg_detailColumns"
      />
    </div>
  </div>
</template>

<style lang="scss">
.mcr-detail-overview {
    width: 100%;
    height: 100%;
    padding-bottom: 10px;
    overflow: hidden auto;
}

.mcr-detail-item {
    position: relative;
    border: thin solid #999;
    border-top: none;
    border-right: none;

    &:hover {
        border-left: thin solid #666;
    }
}

.mcr-detail-item:first-child {
    border-left: none;
}

.mcr-detail-head {
    position: relative;
    min-height: 36px;
    padding: 10px;
}

.mcr-detail-body {
    padding: 0 10px 10px;
}

.markdown-body {
    margin: 0;

    .mermaid {
        margin: 0;
    }
}
</style>
