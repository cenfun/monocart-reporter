<script setup>

import Image from './attachments/image.vue';
import Video from './attachments/video.vue';
import Trace from './attachments/trace.vue';

import Audit from './attachments/audit.vue';
import Coverage from './attachments/coverage.vue';
import Network from './attachments/network.vue';

import Content from './attachments/content.vue';
import Link from './attachments/link.vue';

import Comparison from './attachments/comparison.vue';

defineProps({
    column: {
        type: Object,
        default: () => {}
    }
});

const getComponent = (component) => {
    const comparisonMap = {
        image: Image,
        video: Video,
        trace: Trace,

        audit: Audit,
        coverage: Coverage,
        network: Network,

        content: Content,
        link: Link,

        comparison: Comparison
    };

    return comparisonMap[component] || comparisonMap.link;
};

</script>

<template>
  <component
    :is="getComponent(column.component)"
    :data="column.data"
    class="mcr-attachment-body"
  />
</template>

<style lang="scss">
.mcr-attachment-body {
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
