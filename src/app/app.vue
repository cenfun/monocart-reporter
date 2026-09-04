<template>
  <div class="mcr">
    <div class="mcr-header">
      <div class="mcr-header-left">
        <img
          v-if="state.logo"
          class="mcr-logo"
          :src="state.logo"
          alt=""
          @click="onTitleClick"
        >

        <div
          class="mcr-title"
          @click="onTitleClick"
        >
          {{ state.title }}
        </div>

        <VuiIconLabel
          icon="calendar"
          size="16px"
          :button="false"
        >
          {{ state.date }}
        </VuiIconLabel>

        <VuiIconLabel
          icon="time"
          size="16px"
          :button="false"
        >
          {{ state.duration }}
        </VuiIconLabel>
      </div>

      <div class="mcr-flex-auto" />

      <div
        :class="['mcr-theme', 'mcr-theme-'+state.theme]"
        @click="onThemeClick"
      >
        <VuiIconLabel
          button
          :icon="state.theme + '-mode'"
          size="24px"
        />
      </div>

      <VuiIconLabel
        button
        icon="menu"
        size="20px"
        @click="onMenuClick"
      />
    </div>

    <div class="mcr-filter">
      <div class="mcr-filter-left">
        <VuiButton
          v-if="state.exportSelected"
          primary
          @click="onExportClick"
        >
          Export
        </VuiButton>

        <VuiInput
          v-model="state.keywords"
          width="100%"
          class="mcr-search"
          :select-on-focus="false"
          icon="search"
          icon-right="arrow-down"
          icon-color="gray"
          icon-right-clickable
          cleanable
          placeholder="Search"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          @icon-click="onSearchDropdownClick"
        />
        <VuiIconLabel
          icon="setting"
          button
          size="20px"
          @click="onSettingClick"
        />
      </div>
      <div class="mcr-filter-right">
        <div class="mcr-nav">
          <div
            v-for="(item, i) in state.navList"
            :key="i"
            :class="navItemClass(item)"
            @click="onNavItemClick(item)"
          >
            {{ item.name }}
            <span>{{ Util.NF(item.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mcr-grid" />

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
      title="Search Options"
    >
      <div class="mcr-searchable-list">
        <div class="mcr-searchable-section">
          Searchable Fields
        </div>
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
        <div class="mcr-searchable-section">
          Filtering
        </div>
        <VuiSwitch
          v-model="state.includeDescendants"
          :label-clickable="true"
          label-position="right"
          width="28px"
          height="16px"
          class="mcr-searchable-item"
        >
          Include descendants
        </VuiSwitch>
      </div>
    </VuiPopover>

    <VuiPopover
      v-model="state.groupsPopoverVisible"
      :target="state.groupsPopoverTarget"
      positions="bottom"
      title="Grouping Options"
      width="210px"
    >
      <div class="mcr-groups-list">
        <div class="mcr-groups-item">
          <div>Enable grouping</div>
          <VuiSwitch
            v-model="state.groups.group"
            width="28px"
            height="16px"
          />
        </div>

        <div
          v-for="item in groupList"
          :key="item.id"
          class="mcr-groups-item"
        >
          <VuiIconLabel
            :button="item.canNavigateToLevel"
            :icon="item.icon"
            :class="['mcr-groups-label', item.canNavigateToLevel ? '' : 'mcr-groups-label-disabled']"
            :tooltip="item.canNavigateToLevel ? `Expand to the ${item.label} level` : ''"
            tooltip-timeout="2000"
            @click="onGroupLevelClick(item)"
          >
            {{ item.label }}
            <VuiIcon
              v-if="item.canNavigateToLevel"
              icon="item-arrow"
            />
          </VuiIconLabel>
          <VuiSwitch
            v-if="item.switchable"
            v-model="state.groups[item.id]"
            :disabled="!state.groups.group"
            width="28px"
            height="16px"
          />
        </div>

        <div class="mcr-groups-item">
          <div :class="['mcr-groups-label', state.groups.group ? '' : 'mcr-groups-label-disabled']">
            <div>Merge Groups</div>
            <VuiIconLabel
              button
              icon="help"
              tooltip="Whether to merge groups by title when the parent group is hidden"
            />
          </div>
          <VuiSwitch
            v-model="state.groups.merge"
            :disabled="!state.groups.group"
            width="28px"
            height="16px"
          />
        </div>

        <div
          v-if="isGroupsChanged"
          class="mcr-groups-reset"
        >
          <VuiIconLabel
            button
            icon="reload"
            @click="resetGroups()"
          >
            Reset to defaults
          </VuiIconLabel>
        </div>
      </div>
    </VuiPopover>

    <VuiPopover
      v-if="state.trace"
      v-model="state.trace.popoverVisible"
      :target="state.trace.popoverTarget"
      width="320px"
    >
      <dl class="mcr-readme">
        <dd class="mcr-item">
          The <a
            href="https://trace.playwright.dev/"
            target="_blank"
          >Trace Viewer</a> requires that the trace file must be loaded over the http:// or https:// protocols (current protocol is <code :style="state.trace.color">{{ state.trace.protocol }}</code>)
          without <a
            href="https://developer.mozilla.org/en-US/docs/Glossary/CORS"
            target="_blank"
          >CORS</a> issue,
          try <code>npx monocart show-report &lt;your-outputFile-path&gt;</code> start a local web server, please keep attachments and reports under the same directory.
        </dd>
        <dd class="mcr-item">
          or download the trace file and load it to the page <a
            href="https://trace.playwright.dev/"
            target="_blank"
          >Trace Viewer</a> manually.
        </dd>
        <dd class="mcr-item">
          or customize a trace viewer url with option <code>traceViewerUrl: "{{ state.trace.defaultUrl }}"</code>
        </dd>
      </dl>
    </VuiPopover>

    <MetadataGrid />

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
<script setup>
import {
    watch, onMounted, reactive, computed, watchEffect
} from 'vue';
import { useRoute } from 'vue-router';
import {
    VuiInput,
    VuiFlex,
    VuiSwitch,
    VuiPopover,
    VuiTooltip,
    VuiButton,
    VuiDialog,
    VuiLoading,
    VuiIcon,
    VuiIconLabel
} from 'vine-ui';
import {
    debounce, inflate, store, setFavicon
} from './common/common.js';

import Util from './utils/util.js';
import {
    createGrid, renderGrid, updateGrid, removeSort, initCustomsFormatters, displayFlyoverWithRoute, expandRowLevel
} from './modules/grid.js';

import Flyover from './components/flyover.vue';
import MetadataGrid from './components/metadata-grid.vue';

import state, { defaultGroups } from './modules/state.js';
import {
    getQueryValue, openReportRoute, replaceQuery
} from './router.js';

import { loadMermaid, initMermaid } from './modules/mermaid.js';

import { initTooltip } from './modules/tooltip.js';


// =================================================================================

const route = useRoute();

const searchable = reactive({
    columns: []
});

const groupLevels = [{
    id: 'shard',
    label: 'Shard',
    icon: 'shard',
    switchable: true,
    requiresSystemList: true
}, {
    id: 'project',
    label: 'Project',
    icon: 'project',
    switchable: true
}, {
    id: 'file',
    label: 'File',
    icon: 'file',
    switchable: true
}, {
    id: 'describe',
    label: 'Describe',
    icon: 'suite',
    switchable: true
}, {
    id: 'case',
    label: 'Case',
    icon: 'case',
    switchable: false
}, {
    id: 'step',
    label: 'Step',
    icon: 'step',
    switchable: true
}];

const groupList = computed(() => groupLevels.filter((item) => {
    return !item.requiresSystemList || state.systemList;
}).map((item) => {
    const canNavigateToLevel = state.groups.group && (item.id === 'case' || state.groups[item.id]);
    return {
        ... item,
        canNavigateToLevel
    };
}));

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

const onTitleClick = () => {
    window.location.reload();
};

// =================================================================================

const navItemClass = (item) => {
    return ['mcr-nav-item', item.classMap, item.id === state.caseType ? 'mcr-nav-selected' : ''];
};

// =================================================================================

const initStore = () => {

    const includeDescendants = store.get('includeDescendants');
    if (includeDescendants === 'true') {
        state.includeDescendants = true;
    }

    const imageZoom = store.get('imageZoom');
    if (imageZoom === 'true') {
        state.imageZoom = true;
    }

    const collapseSteps = store.get('collapseSteps');
    if (collapseSteps === 'true') {
        state.collapseSteps = true;
    }

    const collapseAttachments = store.get('collapseAttachments');
    if (collapseAttachments === 'true') {
        state.collapseAttachments = true;
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
        return a.name.localeCompare(b.name);
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

    let tag = `@${item.name} `;
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

const onSettingClick = (e) => {

    state.groupsPopoverVisible = true;
    state.groupsPopoverTarget = e.target;

};


const configuredGroups = {
    ... defaultGroups
};

const resetGroups = () => {
    removeSort();
    Object.keys(configuredGroups).forEach((k) => {
        state.groups[k] = configuredGroups[k];
    });
};

const initGroups = (groupOptions) => {
    if (groupOptions) {
        Object.keys(configuredGroups).forEach((k) => {
            if (Util.hasOwn(groupOptions, k)) {
                configuredGroups[k] = Boolean(groupOptions[k]);
            }
        });
    }
    Object.keys(configuredGroups).forEach((k) => {
        state.groups[k] = configuredGroups[k];
    });
};

const isGroupsChanged = computed(() => {
    const keys = Object.keys(configuredGroups);
    for (const k of keys) {
        if (state.groups[k] !== configuredGroups[k]) {
            return true;
        }
    }
    return false;
});

const onGroupLevelClick = (item) => {
    if (item.canNavigateToLevel) {
        expandRowLevel(item.id);
    }
};

// =================================================================================
const updateTheme = () => {
    const html = document.documentElement.classList;
    if (html) {
        if (state.theme === 'dark') {
            html.add('mcr-dark');
        } else {
            html.remove('mcr-dark');
        }
    }

    const gridList = Array.from(document.querySelectorAll('.tg-turbogrid'));
    gridList.forEach((grid) => {
        if (state.theme === 'dark') {
            grid.classList.add('tg-dark');
        } else {
            grid.classList.remove('tg-dark');
        }
    });

    initMermaid();

};

const initTheme = () => {

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', (e) => {
        state.theme = e.matches ? 'dark' : 'light';
        localStorage.removeItem('mcr-theme');
        updateTheme();
    });

    const theme = localStorage.getItem('mcr-theme');
    if (theme === 'light' || theme === 'dark') {
        state.theme = theme;
    } else {
        // auto detect
        state.theme = darkQuery.matches ? 'dark' : 'light';
    }

};

const onThemeClick = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('mcr-theme', state.theme);
    updateTheme();
};

const onMenuClick = () => {
    openReportRoute();
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

    initTheme();
    updateTheme();

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
    state.logo = reportData.logo;
    state.locale = reportData.locale;
    state.date = Util.dateFormat(reportData.date, state.locale);
    state.duration = reportData.durationH;
    state.mermaid = reportData.mermaid;

    initGroups(reportData.groupOptions);

    // user changed options, after groupOptions
    initStore();

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


const syncRouteState = () => {
    const routeCaseType = getQueryValue(route.query.caseType) || 'tests';
    const routeKeywords = getQueryValue(route.query.keywords);
    const caseTypeChanged = state.caseType !== routeCaseType;
    if (!caseTypeChanged && state.keywords === routeKeywords) {
        return;
    }
    replaceQuery({
        caseType: state.caseType === 'tests' ? '' : state.caseType,
        keywords: state.keywords,
        title: caseTypeChanged ? '' : getQueryValue(route.query.title)
    }, caseTypeChanged ? 'home' : '');
};

watch(() => state.keywords, () => {
    updateGridAsync();
    updateSearchHistoryAsync();
    syncRouteState();
});

watch(() => searchable.columns, (v) => {
    state.searchableKeys = v.filter((item) => item.checked).map((item) => item.id);
    if (state.keywords) {
        updateGrid();
    }
}, {
    deep: true
});

watch(() => state.caseType, () => {
    syncRouteState();
    renderGrid();
});

watch(() => state.groups, (v) => {
    store.set('groups', JSON.stringify(state.groups));
    renderGrid();
}, {
    deep: true
});

watch(() => state.includeDescendants, () => {
    store.set('includeDescendants', state.includeDescendants);
    if (state.keywords) {
        updateGrid();
    }
});

watch(() => state.imageZoom, () => {
    store.set('imageZoom', state.imageZoom);
});

watch(() => state.collapseSteps, () => {
    store.set('collapseSteps', state.collapseSteps);
});

watch(() => state.collapseAttachments, () => {
    store.set('collapseAttachments', state.collapseAttachments);
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

watch(() => route.fullPath, () => {
    state.caseType = getQueryValue(route.query.caseType) || 'tests';
    state.keywords = getQueryValue(route.query.keywords);
    if (state.grid) {
        displayFlyoverWithRoute(route);
    }
}, {
    immediate: true
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

window.addEventListener('message', (e) => {
    const data = e.data;
    if (data && typeof data === 'object') {
        Object.assign(state, data);
    }
});
</script>

<style lang="scss">
@import url("./default.scss");
@import url("./dark.scss");
@import url("./markdown.scss");
</style>
