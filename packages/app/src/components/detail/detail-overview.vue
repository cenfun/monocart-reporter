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

const itemClass = (d) => {
    const ls = ['mcr-detail-item'];
    if (d.classLevel) {
        ls.push(d.classLevel);
    }
    return ls;
};

const itemHeadClass = (d) => {
    return ['mcr-detail-head', `mcr-detail-${d.type}`, d.classMap];
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

    data.list = list.map((item) => {

        initDataColumns(item, collection);

        const left = item.tg_level * 13;
        let icon = Util.getTypeIcon(item.suiteType, item.type);
        if (item.caseType) {
            icon = item.caseType;
        }

        const positionId = getPositionId(item.id, 'title');

        return {
            data: item,
            state: shallowReactive({}),
            positionId,
            style: `margin-left:${left}px;`,
            icon,
            titleColumn: item.tg_titleColumn,
            simpleColumns: item.tg_simpleColumns,
            detailColumns: item.tg_detailColumns
        };
    });

    collectErrorForAttachment(collection);

};

const renderMermaid = async () => {
    // console.log('renderMermaid');
    await window.mermaid.run();
};

const loadMermaid = microtask(() => {
    // console.log('loadMermaid');

    const mermaidScript = document.querySelector("script[id='mermaid']");
    if (mermaidScript) {
        renderMermaid();
        return;
    }

    const mermaidOptions = state.mermaid;
    if (!mermaidOptions) {
        return;
    }

    const scriptSrc = mermaidOptions.scriptSrc;
    if (!scriptSrc) {
        return;
    }

    const config = {
        ... mermaidOptions.config
    };
    // console.log(config);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = () => {
        script.setAttribute('id', 'mermaid');
        window.mermaid.initialize(config);
        renderMermaid();
    };
    document.body.appendChild(script);
});

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

    if (state.mermaidEnabled) {
        loadMermaid();
    }

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
      v-for="item, ik in data.list"
      :key="ik"
      :class="itemClass(item.data)"
      :style="item.style"
    >
      <VuiFlex
        :class="itemHeadClass(item.data)"
        gap="10px"
        padding="5px"
        :position-id="item.positionId"
        wrap
      >
        <RowTitle :item="item" />

        <SimpleColumns :list="item.simpleColumns" />

        <div class="vui-flex-auto" />

        <DurationLocation :row-item="item.data" />
      </VuiFlex>

      <DetailColumns
        class="mcr-detail-body"
        :list="item.detailColumns"
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
    border-bottom: 1px solid #ccc;
}

.mcr-detail-body {
    padding: 10px;
    border-top: 1px solid #eee;
    border-left: 1px solid #ccc;
}

.mcr-detail-head {
    position: relative;
    z-index: 1;
    min-height: 35px;
    border-left: 1px solid #ccc;

    &:hover::after {
        position: absolute;
        top: 0;
        left: 0;
        content: "";
        display: block;
        width: 100%;
        height: 100%;
        background-color: rgb(0 0 0 / 2%);
        pointer-events: none;
    }

    &.mcr-case-failed + .mcr-detail-body,
    &.mcr-case-flaky + .mcr-detail-body {
        border-top: none;
    }
}

.mcr-detail-item:first-child {
    .mcr-detail-head,
    .mcr-detail-body {
        border-left: none;
    }
}

.mcr-detail-suite {
    .mcr-detail-title {
        font-weight: bold;
    }
}

.markdown-body {
    margin: 0;

    .mermaid {
        margin: 0;
    }
}
</style>
