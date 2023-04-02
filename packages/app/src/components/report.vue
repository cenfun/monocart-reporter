<template>
  <VuiFlex
    direction="column"
    class="mcr-report"
  >
    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          v-if="state.pieHeads"
          gap="15px"
          wrap
        >
          <IconLabel
            v-for="(item, i) in state.pieHeads"
            :key="i"
            :icon="item.icon"
            :tooltip="item.description"
            :button="false"
          >
            <b>{{ item.name }}</b> <span class="mcr-num">{{ Util.NF(item.value) }}</span>
          </IconLabel>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <VuiFlex wrap>
          <Pie />
          <VuiFlex
            gap="15px"
            direction="column"
            padding="10px"
          >
            <template v-if="state.amounts">
              <VuiFlex
                v-for="(group, i) in state.amounts"
                :key="i"
                gap="15px"
                wrap
              >
                <IconLabel
                  v-for="(item, j) in group.list"
                  :key="j"
                  :icon="item.icon || group.icon"
                  :button="group.button"
                  :primary="group.primary"
                  :tooltip="item.description"
                  @click="onAmountClick(item)"
                >
                  {{ item.name }} <span class="mcr-num">{{ Util.NF(item.value) }}</span>
                </IconLabel>
              </VuiFlex>
            </template>

            <VuiFlex
              gap="15px"
              wrap
            >
              <IconLabel
                icon="time"
                primary
                @click="onSortClick('tests','duration')"
              >
                Top Slowest
              </IconLabel>

              <IconLabel
                icon="time"
                primary
                @click="onSortClick('failed','duration')"
              >
                Top Failed Slowest
              </IconLabel>
            </VuiFlex>
          </VuiFlex>
        </VuiFlex>
      </div>
    </div>

    <div
      v-if="state.tagList"
      class="mcr-report-item"
    >
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          wrap
        >
          <IconLabel
            icon="tag"
            :button="false"
          >
            <b>Tags</b> <span class="mcr-num">{{ Util.NF(state.tagList.length) }}</span>
          </IconLabel>
          <div class="vui-flex-auto" />
          <a
            href="https://playwright.dev/docs/test-annotations#tag-tests"
            target="_blank"
          >
            <IconLabel icon="help">
              Tag Tests
            </IconLabel>
          </a>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <VuiFlex
          gap="15px"
          wrap
          padding="10px"
        >
          <div
            v-for="(item, i) in state.tagList"
            :key="i"
            class="mcr-report-tag"
            @click="onTagClick(item)"
          >
            <span
              :style="item.style"
              :tooltip="item.description"
              class="mcr-tag"
            >{{ item.name }}</span>
            <span
              v-if="item.value>1"
              class="mcr-num"
            >{{ Util.NF(item.value) }}</span>
          </div>
        </VuiFlex>
      </div>
    </div>

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          wrap
        >
          <IconLabel
            icon="timeline"
            :button="false"
          >
            <b>Timeline</b> <span class="mcr-num">{{ state.duration }}</span>
          </IconLabel>

          <div class="vui-flex-auto" />

          <a
            href="https://playwright.dev/docs/test-parallel"
            target="_blank"
          >
            <IconLabel icon="help">
              Test Parallel
            </IconLabel>
          </a>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <Timeline />
      </div>
    </div>

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          wrap
        >
          <IconLabel
            icon="metadata"
            :button="false"
          >
            <b>Metadata</b>
          </IconLabel>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <VuiFlex
          v-if="state.metadataList"
          gap="10px"
          padding="10px"
          class="mcr-report-metadata"
          wrap
        >
          <IconLabel
            v-for="(item, i) in state.metadataList"
            :key="i"
            :icon="item.icon"
            :button="false"
          >
            <b>{{ item.name }}</b> {{ item.value }}
          </IconLabel>
        </VuiFlex>
      </div>
    </div>

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          wrap
        >
          <IconLabel
            icon="export"
            :button="false"
          >
            <b>Export</b>
          </IconLabel>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <VuiFlex
          gap="15px"
          direction="column"
          padding="10px"
          class="mcr-report-export"
        >
          <VuiFlex
            v-for="(group, i) in exportList"
            :key="i"
            gap="15px"
            wrap
          >
            <IconLabel
              v-for="(item, j) in group.list"
              :key="j"
              :icon="item.icon"
              primary
              @click="onExportClick(item)"
            >
              {{ item.name }}
            </IconLabel>
          </VuiFlex>
        </VuiFlex>
      </div>
    </div>

    <div class="mcr-report-item mcr-report-footer">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          wrap
        >
          <a
            href="https://github.com/microsoft/playwright"
            target="_blank"
          ><IconLabel
            icon="playwright"
            size="20px"
          >
            {{ state.playwright }}
          </IconLabel>
          </a>

          <a
            href="https://github.com/cenfun/monocart-reporter"
            target="_blank"
          ><IconLabel
            icon="github"
            size="20px"
          >
            {{ state.monocart }}
          </IconLabel>
          </a>
        </VuiFlex>
      </div>
    </div>
  </VuiFlex>
</template>

<script setup>
import { components } from 'vine-ui';
import { saveAs } from 'file-saver';

import state from '../modules/state.js';
import Util from '../utils/util.js';
import {
    renderGrid, updateGrid, hideFlyover
} from '../modules/grid.js';

import IconLabel from './icon-label.vue';
import Pie from './pie.vue';
import Timeline from './timeline.vue';

const { VuiFlex } = components;

// ====================================================================================

const onAmountClick = (item) => {

    const sortFields = {
        errors: 'errors',
        logs: 'logs',
        attachments: 'attachments',
        retries: 'retry'
    };

    const sortField = sortFields[item.id];
    if (sortField) {
        onSortClick('tests', sortField);
    }

};

const onSortClick = (caseType, sortField) => {
    hideFlyover(true);
    state.sortField = sortField;
    state.sortAsc = false;
    state.keywords = '';

    if (state.suiteVisible === false && state.caseType === caseType) {
        // manual render when same value
        renderGrid();
        return;
    }

    // auto renderGrid by watch state change
    state.suiteVisible = false;
    state.caseType = caseType;

};

// ====================================================================================

const onTagClick = (tag) => {
    state.flyoverVisible = false;
    state.caseType = 'tests';
    state.keywords = `@${tag.name}`;
    updateGrid();
};

// ====================================================================================

const getExportCases = (caseType) => {
    const list = [];
    Util.forEach(state.reportData.rows, (item) => {
        if (item.type === 'case' && item.caseType === caseType) {
            const it = {
                ... item
            };
            delete it.subs;
            delete it.steps;
            list.push(it);
        }
    });
    return list;
};

const exportList = [{
    list: [{
        name: 'Report Data',
        icon: 'item',
        getData: () => {
            return state.reportData;
        }
    }, {
        name: 'Summary',
        icon: 'item',
        getData: () => {
            return state.reportData.summary;
        }
    }, {
        name: 'Tags',
        icon: 'item',
        getData: () => {
            return state.tagList;
        }
    }, {
        name: 'Workers',
        icon: 'item',
        getData: () => {
            return state.workerList;
        }
    }]
}, {
    list: [{
        name: 'Errors',
        icon: 'item',
        getData: () => {
            const list = [];
            Util.forEach(state.reportData.rows, (item) => {
                if (item.errors) {
                    const it = {
                        ... item
                    };
                    delete it.subs;
                    delete it.steps;
                    list.push(it);
                }
            });
            return list;
        }
    }, {
        name: 'Failed Cases',
        icon: 'item',
        getData: () => {
            return getExportCases('failed');
        }
    }, {
        name: 'Skipped Cases',
        icon: 'item',
        getData: () => {
            return getExportCases('skipped');
        }
    }]
}];

const onExportClick = (item) => {
    const d = item.getData();
    if (!d) {
        return;
    }
    const string = JSON.stringify(d, null, 4);
    const blob = new Blob([string], {
        type: 'text/plain;charset=utf-8'
    });
    const filename = [state.title, state.date, item.name].join('-').replace(/[\s:/]+/g, '-');
    saveAs(blob, `${filename}.json`);
};

</script>
<style lang="scss">
.mcr-report {
    overflow-y: auto;
}

.mcr-report-item {
    position: relative;
}

.mcr-report-head {
    padding: 10px;
    border-bottom: 1px solid #dae9fa;
    background-color: #eef6ff;

    .mcr-num {
        background-color: #0888f0;
    }

    a {
        color: #333;
    }
}

.mcr-report-footer {
    .mcr-report-head {
        border: none;
    }
}

.mcr-report-chart {
    padding: 10px;

    .vui-flex {
        flex-shrink: 1;
    }
}

.mcr-report-tag {
    position: relative;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }

    .mcr-tag {
        position: relative;
        margin-top: 10px;
        vertical-align: middle;
    }

    .mcr-num {
        position: relative;
        margin-bottom: 10px;
        margin-left: -5px;
        vertical-align: middle;
    }
}

</style>
