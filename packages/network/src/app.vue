<script setup>
import {
    shallowReactive, onMounted, provide, createApp, watchEffect
} from 'vue';
import { components, generateTooltips } from 'vine-ui';

import {
    Grid, inflate, setFavicon
} from 'monocart-common';

import Util from './utils/util.js';

import Flyover from './components/flyover.vue';
import Waterfall from './components/waterfall.vue';
import Timing from './components/timing.vue';

const {
    VuiFlex,
    VuiTooltip,
    VuiPopover,
    VuiLoading
} = components;

// =================================================================================
// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    summary: {},

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '61.8%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    loading: false,
    initializing: true

});

provide('state', state);

const tooltip = shallowReactive({
    visible: false,
    target: null,
    text: '',
    html: false
});

const popover = shallowReactive({
    visible: false,
    target: null
});

watchEffect(() => {
    document.title = state.flyoverVisible ? state.flyoverTitle : state.title;
});

// =================================================================================

// let timeout_tooltip;
const initTooltip = () => {
    generateTooltips((target, text) => {
        // clearTimeout(timeout_tooltip);

        if (Util.isTouchDevice()) {
            return;
        }

        tooltip.visible = true;
        tooltip.target = target;
        tooltip.text = text;

        // timeout_tooltip = setTimeout(() => {
        //     tooltip.visible = false;
        //     tooltip.text = '';
        // }, 2000);

    }, (target) => {
        //  clearTimeout(timeout_tooltip);
        tooltip.visible = false;
        tooltip.text = '';
    });
};

const hideTooltip = () => {
    if (Util.isTouchDevice()) {
        return;
    }

    tooltip.visible = false;
    tooltip.text = '';
    tooltip.html = false;
    tooltip.classMap = '';
};

const showTooltip = (elem, text, html) => {

    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!text) {
        return;
    }
    tooltip.target = elem;
    tooltip.text = text;
    tooltip.html = html;
    tooltip.classMap = 'mcr-searchable';
    tooltip.visible = true;

};

const isNodeTruncated = (node) => {
    if (!node) {
        return false;
    }
    node = node.querySelector('.tg-tree-name') || node;
    if (node.clientWidth < node.scrollWidth) {
        return true;
    }
    return false;
};

// =================================================================================

const showPopover = (rowItem, target) => {
    popover.target = target;
    popover.entry = state.entryMap[rowItem.id];
    popover.visible = true;
};

const hidePopover = () => {
    popover.visible = false;
};

// =================================================================================

const initFlyoverSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '61.8%';
    if (state.windowWidth < 600) {
        flyoverWidth = '100%';
    }
    state.flyoverWidth = flyoverWidth;
};

// const hideFlyover = () => {
//     state.flyoverVisible = false;
//     state.flyoverData = null;
// };

const showFlyover = (rowItem) => {
    state.flyoverData = rowItem.id;
    state.flyoverTitle = rowItem.name;
    state.flyoverVisible = true;
};

// =================================================================================

const bindGridEvents = (grid) => {

    grid.bind('onCellMouseEnter', (e, d) => {
        const {
            cellNode, rowItem, columnItem
        } = d;
        if (!cellNode) {
            return;
        }
        if (rowItem.type !== 'page' && columnItem.id === 'waterfall') {
            showPopover(rowItem, d.e.target);
            return;
        }

        if (isNodeTruncated(cellNode)) {
            const text = cellNode.innerText;
            showTooltip(cellNode, text);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
        hidePopover();
    });

    grid.bind('onClick', (e, d) => {

        const {
            cellNode, rowItem, columnItem
        } = d;

        if (!cellNode) {
            return;
        }

        if (rowItem.type === 'page') {
            return;
        }

        grid.setRowSelected(rowItem);

        if (state.flyoverVisible) {
            showFlyover(rowItem);
            return;
        }
        if (columnItem.id === 'name') {
            showFlyover(rowItem);
        }

    });


    grid.bind('onFirstUpdated', (e) => {

    });
};

const getUrl = (input) => {
    const empty = new URL('data:');
    if (!input) {
        return empty;
    }
    let url;
    try {
        url = new URL(input);
    } catch (e) {
        return empty;
    }
    return url;
};

// eslint-disable-next-line complexity
const resourceFromMimeType = (mimeType) => {
    if (!mimeType) {
        return 'other';
    }

    if (mimeType.startsWith('text/css')) {
        return 'css';
    }

    if (mimeType.startsWith('text/html')) {
        return 'html';
    }

    if (mimeType.startsWith('text/javascript')) {
        return 'js';
    }

    if (mimeType.startsWith('application/javascript')) {
        return 'js';
    }

    if (mimeType.startsWith('application/json')) {
        return 'json';
    }

    if (mimeType.includes('font')) {
        return 'font';
    }

    const [mainType, subType] = mimeType.split('/');

    if (mainType === 'image') {
        return 'image';
    }

    if (mainType === 'audio') {
        return 'media';
    }

    if (mainType === 'video') {
        return 'media';
    }

    if (!subType) {
        return 'other';
    }

    if (subType.includes('json')) {
        return 'json';
    }

    if (subType.includes('script')) {
        return 'js';
    }

    if (subType.includes('html')) {
        return 'html';
    }

    if (mainType === 'text') {
        return 'text';
    }

    return 'other';
};

const resourceTypeByExtension = new Map([
    ['js', 'js'],
    ['mjs', 'js'],

    ['css', 'css'],
    ['xsl', 'css'],

    ['avif', 'image'],
    ['avifs', 'image'],
    ['bmp', 'image'],
    ['gif', 'image'],
    ['ico', 'image'],
    ['jpeg', 'image'],
    ['jpg', 'image'],
    ['jxl', 'image'],
    ['png', 'image'],
    ['svg', 'image'],
    ['tif', 'image'],
    ['tiff', 'image'],

    ['webmanifest', 'json'],

    ['webp', 'media'],

    ['otf', 'font'],
    ['ttc', 'font'],
    ['ttf', 'font'],
    ['woff', 'font'],
    ['woff2', 'font'],

    ['wasm', 'wasm']
]);

const getUrlExt = (url) => {
    const pathname = url.pathname;
    const lastIndexOfDot = pathname.lastIndexOf('.');
    if (lastIndexOfDot !== -1) {
        const ext = pathname.substr(lastIndexOfDot + 1);
        const lastIndexOfPercent = ext.indexOf('%');
        if (lastIndexOfPercent !== -1) {
            return ext.substr(0, lastIndexOfPercent);
        }
        return ext;
    }
    return '';
};

const resourceFromURL = (url) => {
    const ext = getUrlExt(url);
    return resourceTypeByExtension.get(ext);
};

const getResourceType = (entry) => {
    const resourceTypeFromMime = resourceFromMimeType(entry.response.content.mimeType);
    if (resourceTypeFromMime !== 'other') {
        return resourceTypeFromMime;
    }

    const resourceTypeFromUrl = resourceFromURL(entry.url);
    if (resourceTypeFromUrl) {
        return resourceTypeFromUrl;
    }

    return 'other';
};

const getRemoveAddress = (entry) => {
    const port = entry.url.port || '80';
    return `${entry.serverIPAddress || ''}:${port}`;
};

const getEntryName = (entry) => {
    const { url, request } = entry;
    // console.log(url);
    const pathList = url.pathname.split('/');
    if (url.search) {
        pathList[pathList.length - 1] += url.search;
    }
    const list = [url.host].concat(pathList).filter((it) => it);
    // console.log(list);
    const basename = list.pop() || url.toString();

    return `${request.method} ${basename}`;
};

const getStatusType = (statusCode) => {
    // 4xx client and 5xx server error
    if (statusCode >= 400) {
        return 'error';
    }
    if (statusCode >= 300) {
        return 'redirect';
    }
    if (statusCode >= 200) {
        return 'ok';
    }
    return 'other';
};

const getColumns = () => {
    const columns = [{
        id: 'name',
        name: 'Name',
        classMap: 'mcr-column-name',
        width: 300,
        init: (entry) => {
            return getEntryName(entry);
        }
    }, {
        id: 'status',
        name: 'Status',
        width: 60,
        align: 'center',
        init: (entry) => {
            return entry.response.status;
        },
        formatter: (v, rowItem) => {
            return `<span class="mcr-status-${rowItem.statusType}">${v}</span>`;
        }
    }, {
        id: 'resourceType',
        name: 'Type',
        width: 60,
        align: 'center',
        init: (entry) => {
            const resourceType = getResourceType(entry);
            entry.resourceType = resourceType;
            return resourceType;
        }
    }, {
        id: 'size',
        name: 'Size',
        align: 'right',
        formatter: 'bytes',
        init: (entry) => {
            const contentSize = Math.max(entry.response.content.size, 0);
            const headersSize = Math.max(entry.response.headersSize, 0);
            const bodySize = Math.max(entry.response.bodySize, 0);
            return contentSize || (headersSize + bodySize);
        }
    }, {
        id: 'time',
        name: 'Time',
        align: 'right',
        formatter: 'time',
        init: (entry) => {
            return entry.time;
        }
    }, {
        id: 'waterfall',
        name: 'Waterfall',
        width: 300,
        formatter: 'waterfall'
    }, {
        id: 'protocol',
        name: 'Protocol',
        init: (entry) => {
            let protocol = entry.response.httpVersion.toLowerCase();
            if (protocol === 'http/2.0') {
                protocol = 'h2';
            }
            return protocol.replace(/^http\/2\.0?\+quic/, 'http/2+quic');
        }
    }, {
        id: 'domain',
        name: 'Domain',
        width: 150,
        init: (entry) => {
            return entry.url.hostname;
        }
    }, {
        id: 'path',
        name: 'Path',
        width: 150,
        init: (entry) => {
            return entry.url.pathname;
        }
    }, {
        id: 'url',
        name: 'Url',
        width: 300,
        init: (entry) => {
            return entry.request.url;
        }
    }, {
        id: 'removeAddress',
        name: 'Address',
        width: 150,
        align: 'right'
    }, {
        id: 'connection',
        name: 'Connection',
        with: 90,
        init: (entry) => {
            return entry.connection || '';
        }
    }, {
        id: 'comment',
        name: 'Comment',
        width: 200,
        init: (entry) => {
            return entry.comment || entry.request.comment || entry.response.comment || '';
        }
    }];

    return columns;
};

const getGridData = () => {
    const columns = getColumns();

    const pages = state.reportData.log.pages;
    pages.forEach((page) => {
        page.timestampStart = new Date(page.startedDateTime).getTime();
    });
    pages.sort((a, b) => a.timestampStart - b.timestampStart);

    const pageMap = {};
    const rows = pages.map((page, i) => {
        const emptyRow = {};
        columns.forEach((column) => {
            emptyRow[column.id] = '';
        });

        const pageTimings = page.pageTimings;
        const time = Math.max(pageTimings.onContentLoad, pageTimings.onLoad) || 0;

        const pageRow = {
            ... emptyRow,
            id: page.id,
            name: page.title,
            type: 'page',
            waterfall: i,
            pageTimings,
            timestampStart: page.timestampStart,
            start: 0,
            time,
            comment: page.comment,
            subs: []
        };

        pageMap[pageRow.id] = pageRow;

        return pageRow;
    });
    state.pageMap = pageMap;

    const entries = state.reportData.log.entries;
    const entryMap = {};
    entries.forEach((entry) => {
        const id = Util.uid();
        entry.id = id;
        entryMap[id] = entry;
        entry.timestampStart = new Date(entry.startedDateTime).getTime();
        entry.url = getUrl(entry.request.url);
        entry.statusType = getStatusType(entry.response.status);
        entry.removeAddress = getRemoveAddress(entry);
    });
    state.entryMap = entryMap;

    entries.sort((a, b) => a.timestampStart - b.timestampStart);

    entries.forEach((entry, i) => {

        const row = {
            id: entry.id,
            pageref: entry.pageref,

            // for sort
            waterfall: i,
            timestampStart: entry.timestampStart,
            start: 0,
            time: Math.max(entry.time, 0),
            timings: entry.timings,

            statusType: entry.statusType,
            removeAddress: entry.removeAddress
        };

        columns.forEach((column) => {
            if (typeof column.init === 'function') {
                row[column.id] = column.init(entry);
            }
        });

        row.classMap = `mcr-row-status-${entry.statusType}`;

        const page = pageMap[entry.pageref];
        if (page) {
            row.start = entry.timestampStart - page.timestampStart;
            page.time = Math.max(page.time, row.start + row.time);
            page.subs.push(row);
        }

    });

    const options = {};
    return {
        options,
        columns,
        rows
    };
};

const initGrid = () => {
    const grid = new Grid('.mcr-network-grid');
    state.grid = grid;
    bindGridEvents(grid);

    const options = {
        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: false,
        collapseAllVisible: true,
        selectMultiple: false,
        rowNumberVisible: true,
        frozenColumn: 0,
        columnProps: {
            maxWidth: 2000
        }
    };
    // no frozen in mini size
    if (state.windowWidth < 800) {
        options.frozenColumn = -1;
    }

    grid.setFormatter({
        bytes: (v) => {
            if (typeof v === 'number') {
                return Util.BSF(v, 1);
            }
            return v;
        },
        time: (v) => {
            if (typeof v === 'number') {
                return Util.TSF(v);
            }
            return v;
        },
        waterfall: (v, rowItem) => {
            const props = {};
            let currentPage;
            if (rowItem.type === 'page') {
                currentPage = rowItem;
            } else {
                props.timings = {
                    ... rowItem.timings,
                    timestampStart: rowItem.timestampStart,
                    start: rowItem.start,
                    time: rowItem.time
                };
                currentPage = state.pageMap[rowItem.pageref];
            }

            if (currentPage) {
                props.pageTimings = {
                    ... currentPage.pageTimings,
                    timestampStart: currentPage.timestampStart,
                    start: currentPage.start,
                    time: currentPage.time
                };
            }

            const div = document.createElement('div');
            const app = createApp(Waterfall, props);
            const vm = app.mount(div);
            return vm.$el;
        }
    });
    grid.setOption(options);
    grid.setData(getGridData());
    grid.render();
};

// =================================================================================

const init = async () => {
    const reportStr = await inflate(window.reportData);
    const reportData = JSON.parse(reportStr);
    console.log(reportData);

    // for export all data JSON able
    state.reportData = reportData;
    state.title = reportData.title || 'Network Report';

    initTooltip();

    initFlyoverSize();

    initGrid();

    setFavicon();

    state.initializing = false;
};

onMounted(() => {
    init();
});

window.addEventListener('resize', () => {
    state.windowWidth = window.innerWidth;
    if (state.windowWidth < 600) {
        state.flyoverWidth = '100%';
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        state.flyoverVisible = false;
    }
});

</script>

<template>
  <div class="mcr vui-flex-column">
    <VuiFlex
      class="mcr-header"
      padding="10px"
      gap="10px"
      shrink
    >
      <VuiFlex
        gap="10px"
        wrap
      >
        <div class="mcr-title">
          <a href="./">{{ state.title }}</a>
        </div>
      </VuiFlex>

      <div class="vui-flex-auto" />
    </VuiFlex>

    <div class="mcr-network-grid vui-flex-auto" />

    <Flyover />

    <VuiTooltip
      :class="tooltip.classMap"
      :visible="tooltip.visible"
      :target="tooltip.target"
      :text="tooltip.text"
      :html="tooltip.html"
    />

    <VuiPopover
      v-model="popover.visible"
      :target="popover.target"
      width="300px"
      class="mcr-popover-timing"
    >
      <Timing :entry="popover.entry" />
    </VuiPopover>

    <VuiLoading
      :visible="state.initializing"
      size="l"
      center
    />
  </div>
</template>

<style lang="scss">
html {
    height: 100%;
}

body {
    --font-monospace: sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;
    --bg-error: #fff0ef;
    --color-ok: green;
    --color-error: #d00;
    --color-redirect: orange;

    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: #333;
    font-size: 14px;
    font-family: arial, sans-serif;
    overflow: hidden;
}

svg {
    display: block;
}

a {
    color: #0d6efd;
    text-decoration: underline;
}

a:hover {
    color: #0a58ca;
}

a:not([href], [class]),
a:not([href], [class]):hover {
    color: inherit;
    text-decoration: none;
}

.mcr {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .mcr-searchable b {
        color: red;
    }
}

/*
icon
*/

.mcr-icon {
    display: block;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 20px 20px;
    cursor: pointer;
    opacity: 0.8;
    overflow: hidden;
}

.mcr-icon:hover {
    opacity: 1;
}

.mcr-header {
    height: 44px;
    color: #fff;
    line-height: 44px;
    background-color: #24292f;

    .mcr-title {
        font-size: 18px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;

        a {
            color: #fff;
            text-decoration: none;
        }
    }
}

.mcr-status-error {
    color: var(--color-error);
}

.mcr-status-redirect {
    color: var(--color-redirect);
}

.mcr-status-ok {
    color: var(--color-ok);
}

.mcr-network-grid {
    .tg-row:not(.tg-page) {
        .mcr-column-name {
            cursor: pointer;
        }

        .mcr-column-name:hover {
            text-decoration: underline;
        }
    }

    .mcr-row-status-error {
        background-color: var(--bg-error);

        .mcr-waterfall {
            background-color: var(--bg-error);
        }
    }
}

.mcr-popover-timing {
    pointer-events: none;
}

</style>
