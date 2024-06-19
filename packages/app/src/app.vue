<script setup>
import {
    watch, onMounted, reactive, computed, watchEffect
} from 'vue';
import { components, generateTooltips } from 'vine-ui';
import {
    debounce, microtask, inflate, store, hash, setFavicon
} from 'monocart-common';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, removeSort, initCustomsFormatters, displayFlyoverWithHash, expandRowLevel
} from './modules/grid.js';

import Flyover from './components/flyover.vue';
import IconLabel from './components/icon-label.vue';

import state, { defaultGroups } from './modules/state.js';

import { loadMermaid } from './modules/mermaid.js';

const {
    VuiInput,
    VuiFlex,
    VuiSwitch,
    VuiPopover,
    VuiTooltip,
    VuiButton,
    VuiDialog,
    VuiLoading
} = components;

// =================================================================================

const searchable = reactive({
    columns: []
});

const tooltip = reactive({
    visible: false,
    target: null,
    text: '',
    html: false
});

state.tooltip = tooltip;

const dialog = reactive({
    visible: false,
    message: '',
    ok: 'OK'
});

watchEffect(() => {
    let t = state.title;
    if (state.flyoverVisible) {
        t = `${state.flyoverTitle} - ${t}`;
    }
    document.title = t;
});

// =================================================================================

const navItemClass = (item) => {
    return ['mcr-nav-item', item.classMap, item.id === state.caseType ? 'mcr-nav-selected' : ''];
};

// =================================================================================

const initStore = () => {

    const imageZoom = store.get('imageZoom');
    if (imageZoom === 'true') {
        state.imageZoom = true;
    }

    const groupsStr = store.get('groups');
    if (!groupsStr) {
        return;
    }

    const groups = JSON.parse(groupsStr);
    if (!groups) {
        return;
    }

    Object.keys(groups).forEach((k) => {
        state.groups[k] = groups[k];
    });

};

const initSearchableColumns = (columns) => {
    Util.forEachTree(columns, (column) => {
        if (!column.searchable) {
            return;
        }
        searchable.columns.push({
            id: column.id,
            name: column.name,
            checked: true
        });
        if (column.classMap) {
            column.classMap += ' mcr-searchable';
        } else {
            column.classMap = 'mcr-searchable';
        }
    });

    state.searchableAllKeys = searchable.columns.map((it) => it.id);

};

// =================================================================================

const caseHandler = (item) => {
    // collapsed case in grid by default
    if (item.subs) {
        item.collapsed = true;
    }
    item.classMap = `mcr-case-${item.caseType}`;
};

const stepHandler = (item) => {
    // collapsed step group in grid by default
    if (item.subs) {
        item.collapsed = true;
    }
    if (item.errorNum) {
        item.classMap = 'mcr-step-error';
    } else if (item.status === 'retry') {
        item.classMap = 'mcr-step-retry';
    }
};

const initTagList = (tagMap) => {
    state.tagMap = tagMap;
    // tag and style
    const tagList = [];
    Object.keys(tagMap).forEach((tag) => {
        tagList.push({
            name: tag,
            ... tagMap[tag]
        });
    });

    if (!tagList.length) {
        return;
    }

    tagList.sort((a, b) => {
        return b.value - a.value;
    });

    state.tagList = tagList;
};

const initData = (reportData) => {

    const {
        columns, rows, summary, system, tags
    } = reportData;

    // init searchable info
    initSearchableColumns(columns);

    Util.forEach(rows, function(item) {
        item.selectable = true;
        if (item.type === 'case') {
            summary.tests.icon = 'case';
            caseHandler(item);
            return;
        }
        if (item.type === 'step') {
            summary.steps.icon = 'step';
            stepHandler(item);
            return;
        }
        summary.suites.icon = 'suite';
    });

    initTagList(tags);

    // summary.failed.value = 0;
    // summary.flaky.value = 0;

    summary.passed.classMap = (summary.failed.value === 0 && summary.passed.value > 0) ? 'mcr-nav-passed' : '';
    summary.flaky.classMap = summary.flaky.value > 0 ? 'mcr-nav-flaky' : 'mcr-nav-skipped';
    summary.skipped.classMap = 'mcr-nav-skipped';
    summary.failed.classMap = summary.failed.value > 0 ? 'mcr-nav-failed' : 'mcr-nav-skipped';

    summary.projects.icon = 'project';
    summary.files.icon = 'file';
    summary.shards.icon = 'shard';

    state.summary = summary;

    // nav
    const navList = Object.values(summary).filter((it) => it.nav);
    state.navList = navList;

    if (Array.isArray(system)) {
        state.system = system[0];
        state.systemList = system;
    } else {
        state.system = system;
        // debug
        // state.systemList = [system, system];
    }

};

// case map with tree info for detail page
const initCaseMap = (rows) => {
    rows = JSON.parse(JSON.stringify(rows));
    const detailMap = {};
    Util.forEach(rows, function(item, parent) {
        item.tg_parent = parent;
        if (parent) {
            item.tg_level = parent.tg_level + 1;
        } else {
            item.tg_level = 0;
        }
        // remove all collapsed
        if (item.collapsed) {
            item.collapsed = false;
        }
        if (item.type === 'case') {
            detailMap[item.id] = item;
        }
    });
    state.detailMap = detailMap;
};

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

const initFlyoverSize = () => {
    state.windowWidth = window.innerWidth;

    let flyoverWidth = '60%';
    if (state.windowWidth < 600) {
        flyoverWidth = '100%';
    } else if (state.windowWidth < 800) {
        flyoverWidth = '80%';
    }
    state.flyoverWidth = flyoverWidth;
};

// =================================================================================

const onNavItemClick = (item) => {
    if (item.id !== state.caseType) {
        state.caseType = item.id;
    }
};

// =================================================================================

const onSearchFocus = (e) => {

    state.flyoverVisible = false;

    if (!state.tagList && !state.searchList) {
        return;
    }

    const target = e.target;

    const br = target.getBoundingClientRect();

    const left = `${br.left}px`;
    const top = `${(br.top + br.height + 3)}px`;
    const width = `${br.width}px`;

    state.searchHelperStyle = {
        left,
        top,
        width
    };

    state.searchHelperTarget = target;
    state.searchHelperVisible = true;

};

const onSearchBlur = debounce(() => {
    state.searchHelperVisible = false;
    state.searchHelperTarget = null;
});

const onTagItemClick = (item) => {
    // console.log(item);

    // force to check title column
    const titleColumn = searchable.columns.find((it) => it.id === 'title');
    if (titleColumn) {
        titleColumn.checked = true;
    }

    let tag = `${item.name} `;
    if (state.keywords) {

        const target = state.searchHelperTarget;
        if (target) {

            if (target.selectionStart) {
                const str = target.value.slice(0, target.selectionStart);
                if (str) {
                    // not ends with space
                    const regex = /\s$/;
                    if (!regex.test(str)) {
                        tag = ` ${tag}`;
                    }
                }
            }

            target.setRangeText(tag);
            state.keywords = target.value;
            return;
        }

    }

    state.keywords = tag;
};

const onSearchItemClick = (item) => {
    state.keywords = item;
};

const onSearchDropdownClick = (e) => {
    state.searchDropdownVisible = true;
    state.searchDropdownTarget = e.target;
};


const resetGroups = () => {
    removeSort();
    Object.keys(defaultGroups).forEach((k) => {
        state.groups[k] = defaultGroups[k];
    });
};

const isGroupsChanged = computed(() => {
    const keys = Object.keys(defaultGroups);
    for (const k of keys) {
        if (state.groups[k] !== defaultGroups[k]) {
            return true;
        }
    }
    return false;
});

// =================================================================================

const onSuiteDropdownClick = (e) => {
    state.suiteDropdownVisible = true;
    state.suiteDropdownTarget = e.target;
};

// =================================================================================

const onMenuClick = (e) => {
    hash.set('page', 'report');
};

const onExportClick = () => {

    const grid = state.grid;

    const selectedRows = grid.getSelectedRows();

    if (!selectedRows.length) {
        dialog.message = 'No rows selected, nothing to export.';
        dialog.ok = 'Continue';
        dialog.onOkClick = () => {
            dialog.visible = false;
        };
        dialog.onCancelClick = () => {
            state.exportSelected = false;
            dialog.visible = false;
        };
        dialog.visible = true;
        return;
    }

    selectedRows.sort((a, b) => {
        return a.tg_index - b.tg_index;
    });

    const excludes = ['subs', 'selected'];

    const list = selectedRows.map((item) => {
        const row = {};
        Object.keys(item).forEach((k) => {
            if (excludes.includes(k)) {
                return;
            }
            if (k.startsWith('tg_')) {
                return;
            }
            row[k] = item[k];
        });
        return row;
    });

    // console.log(list);

    const name = [state.title, state.date, 'selected-rows'].join('-').replace(/[\s:/]+/g, '-');
    Util.exportJson(list, name);

    grid.selectAll(false);
    state.exportSelected = false;

};

// =================================================================================
const init = async () => {
    initStore();

    const reportStr = await inflate(window.reportData);
    const reportData = JSON.parse(reportStr);
    console.log(reportData);

    initData(reportData);

    // for export all data JSON able
    state.reportData = reportData;

    state.gridDataAll = {
        columns: reportData.columns,
        rows: reportData.rows
    };

    initCaseMap(reportData.rows);

    // for custom column  formatters
    state.formatters = reportData.formatters;

    const cloneColumns = JSON.parse(JSON.stringify(reportData.columns));
    initCustomsFormatters(cloneColumns, state.formatters);
    state.columns = cloneColumns;

    state.title = reportData.name;
    state.date = reportData.dateH;
    state.duration = reportData.durationH;
    state.mermaid = reportData.mermaid;

    initFlyoverSize();

    createGrid();

    initTooltip();

    setFavicon();

    state.initializing = false;
};

onMounted(() => {
    init();
});

const updateSearchHistoryAsync = debounce(() => {
    const v = `${state.keywords}`.trim();
    // do not store length < 3
    if (v.length < 3) {
        return;
    }

    // already in tag list
    if (state.tagList) {
        const hasTag = state.tagList.find((it) => {
            return it.name === v || `@${it.name}` === v;
        });
        if (hasTag) {
            return;
        }
    }

    // not found results
    const elem = state.grid.find('.tg-body-message');
    const display = elem.css('display');
    if (display === 'block') {
        return;
    }

    // store
    if (state.searchList) {
        const st = new Set(state.searchList.reverse());
        if (st.has(v)) {
            st.delete(v);
        }
        st.add(v);
        const ls = Array.from(st).reverse();
        if (ls.length > 5) {
            ls.length = 5;
        }
        state.searchList = ls;
    } else {
        state.searchList = [v];
    }
}, 1000);

const updateGridAsync = debounce(updateGrid, 200);
watch(() => state.keywords, (v) => {
    updateGridAsync();
    updateSearchHistoryAsync();
});

watch(() => searchable.columns, (v) => {
    state.searchableKeys = v.filter((item) => item.checked).map((item) => item.id);
    if (state.keywords) {
        updateGrid();
    }
}, {
    deep: true
});

watch(() => state.caseType, (v) => {
    if (v === 'tests') {
        hash.remove('caseType');
    } else {
        hash.set('caseType', v);
        hash.remove('page');
    }
    renderGrid();
});

watch(() => state.groups, (v) => {
    store.set('groups', JSON.stringify(state.groups));
    renderGrid();
}, {
    deep: true
});

watch(() => state.imageZoom, () => {
    store.set('imageZoom', state.imageZoom);
});

watch([
    () => state.exportSelected
], () => {
    renderGrid();
});

watch(() => state.mermaidEnabled, (v) => {
    if (v && !state.mermaidLoaded) {
        loadMermaid();
    }
});

window.addEventListener('popstate', microtask(() => {
    const caseType = hash.get('caseType');
    state.caseType = caseType || 'tests';
    displayFlyoverWithHash();
}));

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

window.addEventListener('message', (e) => {
    const data = e.data;
    if (data && typeof data === 'object') {
        Object.assign(state, data);
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

        <IconLabel
          icon="calendar"
          size="16px"
          :button="false"
        >
          {{ state.date }}
        </IconLabel>

        <IconLabel
          icon="time"
          size="16px"
          :button="false"
        >
          {{ state.duration }}
        </IconLabel>
      </VuiFlex>

      <div class="vui-flex-auto" />

      <IconLabel
        icon="menu"
        size="20px"
        @click="onMenuClick"
      />
    </VuiFlex>

    <VuiFlex
      class="mcr-filter"
      gap="10px"
      padding="10px"
      wrap
      shrink
    >
      <VuiButton
        v-if="state.exportSelected"
        primary
        @click="onExportClick"
      >
        Export
      </VuiButton>

      <div class="mcr-nav">
        <div
          v-for="(item, i) in state.navList"
          :key="i"
          :class="navItemClass(item)"
          @click="onNavItemClick(item)"
        >
          <VuiFlex
            gap="5px"
            wrap
            center
          >
            <b>{{ item.name }}</b>
            <span>{{ Util.NF(item.value) }}</span>
          </VuiFlex>
        </div>
      </div>

      <div class="mcr-search-holder vui-flex-auto">
        <div class="mcr-search">
          <VuiInput
            v-model="state.keywords"
            width="100%"
            :class="state.keywords?'mcr-search-keywords':''"
            :select-on-focus="false"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
          <IconLabel
            class="mcr-search-icon"
            icon="search"
            :button="false"
          />
          <IconLabel
            v-if="state.keywords"
            class="mcr-search-clear"
            icon="close"
            @click="state.keywords = ''"
          />
          <IconLabel
            class="mcr-search-option"
            icon="triangle-down"
            @click="onSearchDropdownClick"
          />
        </div>
      </div>

      <VuiFlex gap="8px">
        <VuiSwitch
          v-model="state.groups.group"
          :label-clickable="true"
          label-position="right"
        >
          Group
        </VuiSwitch>
        <IconLabel
          icon="drop-down"
          @click="onSuiteDropdownClick"
        />
      </VuiFlex>
    </VuiFlex>

    <div class="mcr-grid vui-flex-auto" />

    <Flyover />

    <div
      v-show="state.searchHelperVisible"
      class="mcr-search-helper"
      :style="state.searchHelperStyle"
    >
      <VuiFlex
        direction="column"
        gap="5px"
      >
        <VuiFlex
          v-if="state.searchList"
          gap="10px"
          padding="5px"
          wrap
          shrink
        >
          <div
            v-for="(item, i) of state.searchList"
            :key="i"
            class="mcr-search-item"
            @mousedown="onSearchItemClick(item)"
          >
            {{ item }}
          </div>
        </VuiFlex>
        <VuiFlex
          v-if="state.tagList"
          gap="10px"
          padding="5px"
          wrap
          shrink
        >
          <div
            v-for="(item, i) of state.tagList"
            :key="i"
            :style="item.style"
            :title="item.description"
            class="mcr-tag"
            @mousedown="onTagItemClick(item)"
          >
            {{ item.name }}
          </div>
        </VuiFlex>
      </VuiFlex>
    </div>

    <VuiPopover
      v-model="state.searchDropdownVisible"
      :target="state.searchDropdownTarget"
      positions="bottom"
      title="Searchable Fields"
    >
      <VuiFlex
        direction="column"
        class="mcr-searchable-list"
      >
        <VuiSwitch
          v-for="(item, i) in searchable.columns"
          :key="i"
          v-model="item.checked"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-searchable-item"
        >
          {{ item.name }}
        </VuiSwitch>
      </VuiFlex>
    </VuiPopover>

    <VuiPopover
      v-model="state.suiteDropdownVisible"
      :target="state.suiteDropdownTarget"
      positions="bottom"
      title="Show Group Levels"
    >
      <VuiFlex
        direction="column"
        class="mcr-groups-list"
      >
        <VuiSwitch
          v-if="state.systemList"
          v-model="state.groups.shard"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-groups-item"
        >
          Shard
        </VuiSwitch>

        <VuiSwitch
          v-model="state.groups.project"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-groups-item"
        >
          Project
        </VuiSwitch>
        <VuiSwitch
          v-model="state.groups.file"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-groups-item"
        >
          File
        </VuiSwitch>
        <VuiSwitch
          v-model="state.groups.describe"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-groups-item"
        >
          Describe
        </VuiSwitch>

        <VuiSwitch
          v-model="state.groups.step"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-groups-item"
        >
          Step
        </VuiSwitch>

        <div class="mcr-groups-line">
          <VuiSwitch
            v-model="state.groups.merge"
            :label-clickable="true"
            label-position="right"
            width="28px"
            height="16px"
            class="mcr-groups-item"
          >
            <VuiFlex gap="10px">
              <div>Merge Groups</div>
              <IconLabel
                icon="help"
                tooltip="Whether to merge groups by title when the parent group is hidden"
              />
            </VuiFlex>
          </VuiSwitch>
        </div>

        <div
          v-if="isGroupsChanged"
          class="mcr-groups-line"
        >
          <IconLabel
            icon="reload"
            class="mcr-groups-item"
            @click="resetGroups()"
          >
            Reset
          </IconLabel>
        </div>
      </VuiFlex>
    </VuiPopover>

    <VuiPopover
      v-model="state.levelPopoverVisible"
      :target="state.levelPopoverTarget"
      :positions="['bottom','right']"
      title="Expand to Level"
    >
      <VuiFlex
        direction="column"
        class="mcr-expand-list"
      >
        <template v-if="state.groups.group">
          <IconLabel
            v-if="state.groups.shard && state.systemList"
            icon="shard"
            class="mcr-expand-item"
            @click="expandRowLevel('shard')"
          >
            Shard
          </IconLabel>

          <IconLabel
            v-if="state.groups.project"
            icon="project"
            class="mcr-expand-item"
            @click="expandRowLevel('project')"
          >
            Project
          </IconLabel>

          <IconLabel
            v-if="state.groups.file"
            icon="file"
            class="mcr-expand-item"
            @click="expandRowLevel('file')"
          >
            File
          </IconLabel>

          <IconLabel
            v-if="state.groups.describe"
            icon="suite"
            class="mcr-expand-item"
            @click="expandRowLevel('describe')"
          >
            Describe
          </IconLabel>
        </template>
        <IconLabel
          icon="case"
          class="mcr-expand-item"
          @click="expandRowLevel('case')"
        >
          Case
        </IconLabel>
        <IconLabel
          v-if="state.groups.step"
          icon="step"
          class="mcr-expand-item"
          @click="expandRowLevel('step')"
        >
          Step
        </IconLabel>
      </VuiFlex>
    </VuiPopover>

    <VuiTooltip
      :class="tooltip.classMap"
      :visible="tooltip.visible"
      :target="tooltip.target"
      :text="tooltip.text"
      :html="tooltip.html"
    />

    <VuiDialog v-model="dialog.visible">
      <VuiFlex
        direction="column"
        gap="0"
      >
        <h3>{{ dialog.message }}</h3>
        <div>
          <VuiFlex
            gap="10px"
            padding="5px"
          >
            <VuiButton
              primary
              width="80px"
              @click="dialog.onOkClick"
            >
              {{ dialog.ok }}
            </VuiButton>
            <VuiButton
              width="80px"
              @click="dialog.onCancelClick"
            >
              Cancel
            </VuiButton>
          </VuiFlex>
        </div>
      </VuiFlex>
    </VuiDialog>

    <VuiLoading
      :visible="state.initializing"
      size="l"
      center
    />
  </div>
</template>

<style lang="scss">
@keyframes mcr-blink-fade-in {
    0% {
        opacity: 0;
    }

    50% {
        opacity: 0.3;
    }

    100% {
        opacity: 0;
    }
}

.mcr-blink::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 10;
    width: 100%;
    height: 100%;
    background: gray;
    animation-name: mcr-blink-fade-in;
    animation-duration: 0.3s;
    animation-timing-function: linear;
}

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
    --image-shadow: rgb(0 0 0 / 35%) 0 2px 8px;

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

/* icon */

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

/* tag */
.mcr-tag {
    display: inline-block;
    min-width: 20px;
    min-height: 20px;
    padding: 0 5px;
    box-sizing: border-box;
    color: #fff;
    font-weight: normal;
    line-height: 20px;
    text-align: center;
    border-radius: 5px;
    background: gray;
}

.mcr-tag-before {
    margin-left: 5px;
}

.mcr-tag-after {
    margin-right: 5px;
}

/* header */

.mcr-header {
    color: #fff;
    background-color: #24292f;

    .mcr-title {
        height: 22px;
        font-size: 18px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;

        a {
            color: #fff;
            text-decoration: none;
        }
    }

    .mcr-icon-label {
        color: #ccc;
        font-size: 14px;
    }
}

.mcr-filter {
    border-bottom: 1px solid #ddd;
    overflow: hidden;
}

.mcr-nav {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    border: thin solid #6c757d;
    border-radius: 5px;
    overflow: hidden;
}

.mcr-nav-item {
    padding: 8px 10px;
    border-left: thin solid #6c757d;
    cursor: pointer;

    &:first-child {
        border-left: none;
    }

    .vui-flex {
        align-items: baseline;
    }

    i {
        font-size: 13px;
    }
}

.mcr-nav-item:hover,
.mcr-nav-selected {
    color: #fff;
    background-color: #6c757d;
}

.mcr-nav-passed {
    color: var(--color-passed);
}

.mcr-nav-passed:hover,
.mcr-nav-passed.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-passed);
}

.mcr-nav-failed {
    color: var(--color-failed);
}

.mcr-nav-failed:hover,
.mcr-nav-failed.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-failed);
}

.mcr-nav-flaky {
    color: var(--color-flaky);
}

.mcr-nav-flaky:hover,
.mcr-nav-flaky.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-flaky);
}

.mcr-nav-skipped {
    color: var(--color-skipped);
}

.mcr-nav-skipped:hover,
.mcr-nav-skipped.mcr-nav-selected {
    color: #fff;
    background-color: var(--color-skipped);
}

.mcr-nav-value {
    width: 81px;
    margin: 0 auto 5px;
    padding: 5px;
    font-size: 16px;
    text-align: center;
    border-radius: 10px;
    background-color: #f5f5f5;

    span {
        display: block;
        height: 20px;
        margin-top: 3px;
        font-size: 12px;
        line-height: 20px;
    }
}

.mcr-search-holder {
    min-width: 150px;
}

.mcr-search {
    position: relative;
    width: 100%;
    max-width: 350px;
    padding: 5px;

    input {
        height: 30px;
        padding-right: 50px;
        padding-left: 30px;
        border-radius: 10px;
    }
}

.mcr-search-icon {
    position: absolute;
    top: 50%;
    left: 13px;
    color: gray;
    transform: translate(0, -50%);
}

.mcr-search-clear {
    position: absolute;
    top: 50%;
    right: 33px;
    transform: translate(0, -50%);
}

.mcr-search-option {
    position: absolute;
    top: 50%;
    right: 13px;
    color: gray;
    transform: translate(0, -50%);
}

.mcr-search-keywords {
    input {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
    }
}

.mcr-search-helper {
    position: absolute;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    background-color: #fff;
    filter: drop-shadow(1px 2px 2px rgb(0 0 0 / 20%));

    .mcr-tag {
        cursor: pointer;
    }

    .mcr-tag:hover {
        opacity: 0.9;
    }

    .mcr-search-item {
        padding: 0.2em 0.4em;
        border-radius: 6px;
        background-color: rgb(175 184 193 / 20%);
        cursor: pointer;
    }

    .mcr-search-item:hover {
        text-decoration: underline;
    }
}

.mcr-search-keywords.vui-input:hover {
    input {
        border-color: #5dabfd;
    }
}

.mcr-groups-list {
    .mcr-groups-line {
        margin-top: 5px;
        padding-top: 5px;
        border-top: 1px solid #ccc;
    }

    .mcr-groups-item {
        padding: 5px 0;
    }

    .mcr-groups-item:hover {
        background-color: #f8f8f8;
    }
}

.mcr-searchable-list {
    .mcr-searchable-item {
        padding: 5px 0;
    }

    .mcr-searchable-item:hover {
        background-color: #f8f8f8;
    }
}

.mcr-expand-list {
    .mcr-expand-item {
        padding: 5px 0;
    }

    .mcr-expand-item:hover {
        background-color: #f8f8f8;
    }
}

.mcr-case-failed {
    background-color: var(--bg-failed);
}

.mcr-case-flaky {
    background-color: var(--bg-flaky);
}

.mcr-step-retry,
.mcr-step-retry.tg-row .tg-cell {
    color: var(--color-flaky);
}

.mcr-step-error,
.mcr-step-error.tg-row .tg-cell {
    color: var(--color-failed);
}

.mcr-grid {
    .tg-pane.tg-frozen-line-v {
        border-right: thin solid #ddd;
    }

    .tg-row-not-found .tg-frozen-line-v {
        border-right: none;
    }

    .tg-column-name {
        user-select: none;
    }

    // group normal by row type
    .tg-step.tg-group.tg-row,
    .tg-case.tg-group.tg-row {
        font-weight: normal;
    }

    .tg-cell-open {
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .tg-cell .mcr-icon,
    .tg-cell .mcr-icon-label {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        transform: translate(-50%, -50%);
    }

    .tg-body-message {
        .mcr-no-results {
            position: relative;
            top: 0;
            left: 0;
            margin: 10px;
            padding: 20px 20px 20px 70px;
            color: gray;
            font-size: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background-image: url("./images/search-results.svg");
            background-repeat: no-repeat;
            background-position: 20px center;
            background-size: 30px 30px;
            opacity: 0.8;
            transform: none;
        }
    }

    // only grid tests type
    .mcr-case-skipped.tg-row .tg-cell {
        color: var(--color-skipped);
    }

    .mcr-clickable {
        cursor: pointer;
    }

    .mcr-location {
        font-weight: normal;
    }
}

.mcr-percent-chart {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 10px;
    box-sizing: border-box;
    border-radius: 3px;
    background-color: #ee442f;
    overflow: hidden;
}

.mcr-percent-chart::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    width: var(--mcr-percent);
    height: 100%;
    background-color: #4d9221;
}

.mcr-details-summary {
    details {
        position: relative;
    }

    summary {
        position: relative;
        padding: 3px 0;
        padding-left: 20px;
        background: url("./images/arrow-right.svg") left center no-repeat;
        background-size: 16px 16px;
        list-style: none;
        cursor: default;
    }

    summary:hover {
        background-color: #f8f8f8;
    }

    details[open] > summary {
        background-image: url("./images/arrow-down.svg");
    }
}

.mcr-num {
    display: inline-block;
    min-width: 18px;
    min-height: 18px;
    padding: 0 5px;
    color: #fff;
    font-weight: normal;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 18px;
    text-align: center;
    border-radius: 10px;
    background: #7e939c;
}

.mcr-count {
    position: relative;
    padding-left: 15px;

    &::before {
        position: absolute;
        top: 0;
        left: 6px;
        content: "x";
        color: #fff;
    }
}

.mcr-readme {
    line-height: 1.2;

    code {
        margin: 0;
        padding: 0.2em 0.4em;
        font-size: 85%;
        font-family: var(--font-monospace);
        white-space: break-spaces;
        border-radius: 6px;
        background-color: rgb(175 184 193 / 20%);
    }
}

.mcr-item {
    position: relative;
    display: inline-block;
    min-height: 20px;
    margin: 0;
    padding-left: 20px;
    line-height: 20px;

    &::before {
        position: absolute;
        top: 8px;
        left: 6px;
        content: "";
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #333;
    }
}

.mcr-focus {
    position: relative;
}

.mcr-focus::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 1;
    width: 100%;
    height: 100%;
    border: 2px solid #6bbbf7;
}

</style>
