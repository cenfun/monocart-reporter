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
  </div>
</template>
<script setup>
import {
    shallowReactive, onMounted, reactive, provide
} from 'vue';
import { Grid } from 'turbogrid';
import { components, generateTooltips } from 'vine-ui';

import Util from './utils/util.js';

import Flyover from './components/flyover.vue';

const {
    VuiFlex,
    VuiTooltip

} = components;

// =================================================================================
// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    summary: {},

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '80%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    loading: false,

    grid: null

});

provide('state', state);

const tooltip = reactive({
    visible: false,
    target: null,
    text: '',
    html: false
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

    if (state.tooltip) {
        state.tooltip.visible = false;
        state.tooltip.text = '';
        state.tooltip.html = false;
        state.tooltip.classMap = '';
    }
};

const showTooltip = (elem, text, html) => {
    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!text) {
        return;
    }
    if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = text;
        state.tooltip.html = html;
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;
    }

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

const initFlyoverSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '80%';
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
        const cellNode = d.cellNode;
        if (isNodeTruncated(cellNode)) {
            const text = cellNode.innerText;
            showTooltip(cellNode, text);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });

    grid.bind('onClick', (e, d) => {

        const {
            cellNode, rowItem, columnItem
        } = d;

        if (!cellNode) {
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
    if (mimeType.startsWith('text/html')) {
        return 'document';
    }
    if (mimeType.startsWith('text/css')) {
        return 'stylesheet';
    }
    if (mimeType.startsWith('image/')) {
        return 'image';
    }
    if (mimeType.startsWith('text/')) {
        return 'script';
    }

    if (mimeType.includes('font')) {
        return 'font';
    }
    if (mimeType.includes('script')) {
        return 'script';
    }
    if (mimeType.includes('octet')) {
        return 'other';
    }
    if (mimeType.includes('application')) {
        return 'script';
    }

    return 'other';
};

const resourceTypeByExtension = new Map([
    ['js', 'script'],
    ['mjs', 'script'],

    ['css', 'stylesheet'],
    ['xsl', 'stylesheet'],

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

    ['webmanifest', 'manifest'],

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

const basename = (url) => {
    // console.log(url);
    const pathList = url.pathname.split('/');
    if (url.search) {
        pathList[pathList.length - 1] += url.search;
    }
    const list = [url.host].concat(pathList).filter((it) => it);
    // console.log(list);
    return list.pop() || url.toString();
};

const hasErrorStatusCode = (statusCode) => {
    return statusCode >= 400;
};

const getColumns = () => {
    const columns = [{
        id: 'name',
        name: 'Name',
        classMap: 'mcr-column-name',
        init: (entry) => {
            return basename(entry.url);
        }
    }, {
        id: 'path',
        name: 'Path',
        width: 120,
        init: (entry) => {
            return entry.url.pathname;
        }
    }, {
        id: 'url',
        name: 'Url',
        width: 120,
        invisible: true,
        init: (entry) => {
            return entry.request.url;
        }
    }, {
        id: 'domain',
        name: 'Domain',
        // invisible: true,
        init: (entry) => {
            return entry.url.hostname;
        }
    }, {
        id: 'method',
        name: 'Method',
        init: (entry) => {
            return entry.request.method;
        }
    }, {
        id: 'status',
        name: 'Status',
        init: (entry) => {
            return entry.response.status;
        },
        formatter: (v) => {
            if (hasErrorStatusCode(v)) {
                return `<span class="mcr-column-failed">${v}</span>`;
            }
            return v;
        }
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
        id: 'resourceType',
        name: 'Type',
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
        id: 'removeAddress',
        name: 'Address',
        align: 'right',
        init: (entry) => {
            const port = entry.url.port || '80';
            return `${entry.serverIPAddress || ''}:${port}`;
        }
    }, {
        id: 'waterfall',
        name: 'Waterfall',
        width: 200,
        formatter: 'waterfall'
    }];

    return columns;
};

const getGridData = () => {
    const entries = state.reportData.log.entries;
    const entryMap = {};
    entries.forEach((entry) => {
        const id = Util.uid();
        entry.id = id;
        entryMap[id] = entry;
        entry.startedDateTime = new Date(entry.startedDateTime).getTime();
        entry.url = getUrl(entry.request.url);
    });
    state.entryMap = entryMap;

    entries.sort((a, b) => a.startedDateTime - b.startedDateTime);

    const columns = getColumns();
    const rows = entries.map((entry, i) => {

        const row = {
            id: entry.id,
            // for sort
            waterfall: entry.startedDateTime
        };

        columns.forEach((column) => {
            if (typeof column.init === 'function') {
                row[column.id] = column.init(entry);
            }
        });

        if (hasErrorStatusCode(row.status)) {
            row.classMap = 'mcr-row-error';
        }

        return row;
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
        columnProps: {
            maxWidth: 2000
        }
    };
    grid.setFormatter({
        bytes: (v) => {
            return Util.BF(v, 1, 1024, ' ');
        },
        time: (v) => {
            return Util.TF(v, ' ');
        }
    });
    grid.setOption(options);
    grid.setData(getGridData());
    grid.render();
};

// =================================================================================

onMounted(() => {
    const reportData = JSON.parse(Util.decompress(window.reportData));
    console.log(reportData);

    // for export all data JSON able
    state.reportData = reportData;
    state.title = reportData.title || 'Network Report';

    initTooltip();

    initFlyoverSize();

    initGrid();

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
<style lang="scss">
html {
    height: 100%;
}

body {
    --font-monospace: sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;
    --bg-failed: #fff0ef;
    --bg-flaky: #fcf7de;
    --color-passed: green;
    --color-failed: #d00;
    --color-flaky: orange;
    --color-skipped: gray;

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

.mcr-network-grid {
    .mcr-column-name {
        text-decoration: underline;
        cursor: pointer;
    }

    .mcr-column-failed {
        color: var(--color-failed);
    }

    .mcr-row-error {
        background-color: var(--bg-failed);
    }
}

</style>
