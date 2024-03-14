<script setup>
import { shallowReactive, watchEffect } from 'vue';
import { components } from 'vine-ui';

import Util from '../../../utils/util.js';

import Image from './image.vue';
import Video from './video.vue';
import Trace from './trace.vue';

import Audit from './audit.vue';
import Coverage from './coverage.vue';
import Network from './network.vue';

import Content from './content.vue';
import Link from './link.vue';

import Comparison from './comparison.vue';

const { VuiFlex } = components;

const props = defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const data = shallowReactive({
    list: []
});

const getPluginComponent = (contentType, name) => {
    const {
        audit, coverage, network
    } = Util.attachments;

    const definitions = [{
        ... audit,
        component: Audit
    }, {
        ... coverage,
        component: Coverage
    }, {
        ... network,
        component: Network
    }];

    for (const definition of definitions) {
        if (name === definition.name && contentType === definition.contentType) {
            return definition.component;
        }
    }

};

const getAttachmentComponent = (item) => {
    // contentType 'application/json' 'image/png' 'video/webm'
    const {
        contentType, name, content
    } = item;

    if (contentType.startsWith('image')) {
        return Image;
    }

    if (contentType.startsWith('video')) {
        return Video;
    }

    if (name === 'trace' && contentType === 'application/zip') {
        return Trace;
    }

    const pc = getPluginComponent(contentType, name);
    if (pc) {
        return pc;
    }

    if (content) {
        return Content;
    }

    return Link;
};

const initGroupList = (group) => {

    const ordering = ['diff', 'actual', 'expected'];
    group.data.list.sort((a, b) => {
        const ai = ordering.indexOf(a.category);
        const bi = ordering.indexOf(b.category);
        return ai - bi;
    });

    let filePath;
    group.data.list.forEach((it) => {
        const {
            category, name, path
        } = it;

        // fixed expected image path
        if (category === 'expected' && filePath) {
            const ls = filePath.split('/');
            ls.pop();
            ls.push(name);
            it.path = ls.join('/');
        } else {
            filePath = path;
        }

    });

};

const existsGroupItem = (group, groupName, retry) => {
    if (group.data.name === groupName && group.data.retry === retry) {
        return true;
    }
    return false;
};

const createGroup = (item, groupName, attachment) => {
    return {
        component: Comparison,
        data: {
            name: groupName,
            contentType: attachment.contentType,
            message: attachment.message,
            position: attachment.position,
            retry: attachment.retry,
            list: [item]
        }
    };
};

const initList = (attachments) => {
    if (!attachments) {
        return;
    }

    attachments = attachments.filter((item) => typeof item.name === 'string');

    const list = [];
    let group;
    attachments.forEach((attachment) => {
        const match = attachment.name.match(/^(.*)-(expected|actual|diff|previous)(\.[^.]+)?$/);
        if (match) {
            const [, name, category, extension = ''] = match;

            const item = {
                name: attachment.name,
                path: attachment.path,
                // content for text
                content: attachment.content,
                category
            };

            // multiple soft comparisons in one test, name with number
            // multiple-soft-comparisons-1.png
            // multiple-soft-comparisons-2.png
            const groupName = name + extension;

            if (group) {

                // there are two connected groups if retry happened
                if (existsGroupItem(group, groupName, attachment.retry)) {
                    group.data.list.push(item);
                } else {
                    initGroupList(group);
                    list.push(group);
                    group = createGroup(item, groupName, attachment);
                }

            } else {
                group = createGroup(item, groupName, attachment);
            }

        } else {

            // last one
            if (group) {
                initGroupList(group);
                list.push(group);
                group = null;
            }

            list.push({
                component: getAttachmentComponent(attachment),
                data: attachment
            });

        }
    });

    // last group
    if (group) {
        initGroupList(group);
        list.push(group);
    }

    // random id to force refresh attachments
    list.forEach((item) => {
        item.id = Util.uid();
    });

    return list;
};

watchEffect(() => {
    data.list = initList(props.column.list);
});

</script>

<template>
  <div class="mcr-details-summary">
    <VuiFlex
      direction="column"
      padding="10px"
      gap="10px"
    >
      <component
        :is="item.component"
        v-for="item of data.list"
        :key="item.id"
        :data="item.data"
      />
    </VuiFlex>
  </div>
</template>

<style lang="scss">
.mcr-attachment-body {
    margin-top: 5px;
    border: 1px solid #eee;
    overflow-x: auto;

    .mcr-low {
        background: #fce1e5;
    }

    .mcr-medium {
        background: #fff4c2;
    }

    .mcr-high {
        background: rgb(230 245 208);
    }

    .mcr-covered {
        color: green;
    }

    .mcr-uncovered {
        color: red;
    }

    table {
        width: 100%;
        border-collapse: collapse;

        tr {
            position: relative;
        }

        tr:not(:last-child) {
            border-bottom: 1px solid #eee;
        }

        tr.mcr-row-summary {
            border-top: 2px solid #eee;
        }

        tr:first-child {
            font-weight: bold;
        }

        tr:not(:first-child):hover::after {
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

        td {
            padding: 5px 8px;
            text-align: right;
        }

        .mcr-column-filename {
            min-width: 100px;
            text-align: left;
            word-break: break-all;
        }

        .mcr-column-left {
            min-width: 100px;
            white-space: nowrap;
            text-align: left;
        }

        .mcr-column-description {
            color: #666;
            font-size: 12px;
            text-align: left;
        }

        .mcr-head {
            background-color: #f8f8f8;
        }
    }
}
</style>
