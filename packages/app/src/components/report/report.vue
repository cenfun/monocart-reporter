<script setup>
import {
    shallowReactive, watch, onActivated
} from 'vue';

import { components } from 'vine-ui';

import state from '../../modules/state.js';
import Util from '../../utils/util.js';
import {
    renderGrid, updateGrid, hideFlyover
} from '../../modules/grid.js';

import MetadataList from '../metadata-list.vue';
import IconLabel from '../icon-label.vue';
import Pie from './pie.vue';
import Timeline from './timeline.vue';
import Trend from './trend.vue';

const { VuiFlex, VuiSelect } = components;

const report = shallowReactive({
    systemIndex: 0
});

// ====================================================================================

const onExportClick = (item) => {
    if (typeof item.asyncExport === 'function') {
        item.asyncExport();
        return;
    }

    const d = item.getData();
    if (!d) {
        console.log('Not found data to export');
        return;
    }
    // without ext
    const name = [state.title, state.date, item.name].join('-').replace(/[\s:/]+/g, '-');
    Util.exportJson(d, name);
};

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

const exportHandler = () => {
    report.exportList = [{
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
            name: 'Pie Chart',
            icon: 'item',
            getData: () => {
                return report.pieChart;
            }
        }, {
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
        }, {
            name: 'Selected Rows',
            icon: 'item',
            asyncExport: () => {
                state.exportSelected = true;
                hideFlyover(true);
            }
        }]
    }];
};

// ====================================================================================

const systemHandler = () => {
    // for system options select
    if (!state.systemList) {
        return;
    }
    report.systemOptions = state.systemList.map((item, i) => {
        return {
            label: item.hostname,
            value: i
        };
    });
};


const timelineHandler = () => {
    const system = state.system;
    report.playwright = `Playwright Test v${system.playwright}`;
    report.monocart = `Monocart Reporter v${system.monocart}`;
    report.usageList = [{
        icon: 'worker',
        name: 'Workers',
        value: `${Util.NF(system.workers)} (Max)`
    }, {
        icon: 'cpu',
        name: 'CPU',
        value: `${system.cpu.model} (${system.cpu.count}T)`,
        color: system.cpu.color
    }, {
        icon: 'memory',
        name: 'Memory',
        value: Util.BF(system.mem.total),
        color: system.mem.color
    }];

    report.infoList = [{
        list: [{
            icon: 'host',
            name: 'Host',
            value: system.hostname
        }, {
            icon: 'os',
            name: 'OS',
            value: `${system.version} (${system.arch})`
        }, {
            icon: 'node',
            name: 'Node',
            value: system.node
        }, {
            icon: 'v8',
            name: 'V8',
            value: system.v8
        }]
    }, {
        list: [{
            icon: 'cwd',
            name: 'CWD',
            value: system.cwd
        }, {
            icon: 'config',
            name: 'Config File',
            value: system.configFile
        }, {
            icon: 'input',
            name: 'Test Dir',
            value: system.testDir
        }, {
            icon: 'output',
            name: 'Output Dir',
            value: system.outputDir
        }]
    }];
};

// ====================================================================================

const onTagClick = (tag) => {
    state.flyoverVisible = false;
    state.caseType = 'tests';
    state.keywords = `@${tag.name}`;
    updateGrid();
};

const tagsHandler = () => {
    if (state.tagList) {
        report.tagList = state.tagList;
    }
};

// ====================================================================================

const metadataHandler = () => {
    const metadataList = Util.getMetadataList(state.reportData.metadata);
    if (metadataList.length) {
        report.metadataList = metadataList;
    }
};

const artifactsHandler = () => {
    const artifacts = state.reportData.artifacts;
    if (!Util.isList(artifacts)) {
        return;
    }

    // console.log(artifacts);

    // props: type/name/path

    // group artifacts
    const globalGroup = {
        name: 'global',
        list: []
    };

    const groups = {};
    artifacts.forEach((item) => {
        if (item.global) {
            globalGroup.list.push(item);
            return;
        }
        const group = groups[item.type];
        if (group) {
            group.list.push(item);
        } else {
            groups[item.type] = shallowReactive({
                name: item.type,
                list: [item]
            });
        }
    });

    const artifactList = [];
    if (globalGroup.list.length) {
        artifactList.push(globalGroup);
    }

    const pageSize = 5;
    Object.values(groups).forEach((g) => {
        const list = g.list;
        if (list.length > pageSize) {
            g.totalList = list;
            g.list = list.slice(0, pageSize);
            g.showMore = true;
        } else {
            g.showMore = false;
        }

        artifactList.push(g);
    });

    report.artifactList = artifactList;
};

const onShowMoreClick = (group) => {
    group.showMore = false;
    group.list = group.totalList;
};

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

    // manual render when same value
    if (state.groups.group === false && state.caseType === caseType) {
        renderGrid();
        return;
    }

    // auto renderGrid by watch state change
    state.groups.group = false;
    state.caseType = caseType;

};

const pieHandler = () => {

    const reportData = state.reportData;

    report.pieChart = reportData.pieChart;

    const summary = state.summary;

    report.amountHeads = [summary.tests, summary.suites, summary.steps];
    report.amountList = [{
        icon: 'suite',
        button: false,
        list: [
            summary.projects,
            summary.files,
            summary.describes,
            summary.shards
        ]
    }, {
        icon: 'sort',
        button: true,
        primary: true,
        list: [
            summary.errors,
            summary.retries,
            summary.logs,
            summary.attachments
        ]
    }];

    // console.log(report.amountList, summary);

};

// ====================================================================================

watch(() => report.systemIndex, (v) => {
    state.system = state.systemList[v];
    timelineHandler();
});


onActivated(() => {
    pieHandler();
    systemHandler();
    timelineHandler();
    tagsHandler();
    metadataHandler();
    artifactsHandler();
    exportHandler();
});

</script>

<template>
  <VuiFlex
    direction="column"
    class="mcr-report"
  >
    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          v-if="report.amountHeads"
          gap="15px"
          padding="10px"
          wrap
        >
          <IconLabel
            v-for="(item, i) in report.amountHeads"
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
          <Pie :pie-chart="report.pieChart" />
          <VuiFlex
            gap="15px"
            direction="column"
            padding="10px"
          >
            <template v-if="report.amountList">
              <VuiFlex
                v-for="(group, i) in report.amountList"
                :key="i"
                gap="15px"
                wrap
              >
                <VuiFlex
                  v-for="(item, j) in group.list"
                  :key="j"
                  gap="5px"
                >
                  <IconLabel
                    :icon="item.icon || group.icon"
                    :button="group.button"
                    :primary="group.primary"
                    :tooltip="item.description"
                    @click="onAmountClick(item)"
                  >
                    {{ item.name }}
                  </IconLabel>
                  <span class="mcr-num">{{ Util.NF(item.value) }}</span>
                </VuiFlex>
              </VuiFlex>
            </template>

            <VuiFlex
              gap="15px"
              wrap
            >
              <IconLabel
                icon="sort"
                primary
                @click="onSortClick('tests','duration')"
              >
                Top Slowest
              </IconLabel>

              <IconLabel
                icon="sort"
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

    <Trend />

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          padding="10px"
          wrap
        >
          <IconLabel
            icon="timeline"
            :button="false"
          >
            <b>Timeline</b>
          </IconLabel>

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

          <VuiSelect
            v-if="report.systemOptions"
            v-model="report.systemIndex"
            tooltips="Sharding machines"
            :options="report.systemOptions"
            width="160px"
          />

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

        <VuiFlex
          v-if="report.usageList"
          gap="10px"
          padding="5px 10px 0 10px"
          wrap
        >
          <VuiFlex
            v-for="(item, j) in report.usageList"
            :key="j"
            gap="5px"
          >
            <IconLabel
              :icon="item.icon"
              :button="false"
              :style="'color:'+item.color"
            >
              <b>{{ item.name }}</b>
            </IconLabel>
            <div class="mcr-long-label">
              {{ item.value }}
            </div>
          </VuiFlex>
        </VuiFlex>

        <VuiFlex
          v-if="report.infoList"
          gap="10px"
          direction="column"
          padding="10px"
        >
          <VuiFlex
            v-for="(group, i) in report.infoList"
            :key="i"
            gap="10px"
            wrap
          >
            <VuiFlex
              v-for="(item, j) in group.list"
              :key="j"
              gap="5px"
            >
              <IconLabel
                :icon="item.icon"
                :button="false"
                :style="'color:'+item.color"
              >
                <b>{{ item.name }}</b>
              </IconLabel>
              <div class="mcr-long-label">
                {{ item.value }}
              </div>
            </VuiFlex>
          </VuiFlex>
        </VuiFlex>
      </div>
    </div>

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          padding="10px"
          wrap
        >
          <IconLabel
            icon="tag"
            :button="false"
          >
            <b>Tags</b> <span
              v-if="report.tagList"
              class="mcr-num"
            >{{ Util.NF(report.tagList.length) }}</span>
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
          v-if="report.tagList"
          gap="15px"
          padding="10px"
          wrap
        >
          <div
            v-for="(item, i) in report.tagList"
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
          padding="10px"
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
        <MetadataList
          v-if="report.metadataList"
          :list="report.metadataList"
        />
      </div>
    </div>

    <div
      v-if="report.artifactList"
      class="mcr-report-item"
    >
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          padding="10px"
          wrap
        >
          <IconLabel
            icon="artifact"
            :button="false"
          >
            <b>Artifacts</b>
          </IconLabel>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart">
        <VuiFlex
          gap="10px"
          padding="10px"
          class="mcr-details-summary"
          direction="column"
        >
          <details
            v-for="(group, i) in report.artifactList"
            :key="i"
            open
          >
            <summary class="mcr-artifact-name">
              {{ group.name }}
            </summary>
            <VuiFlex
              class="mcr-artifact-list"
              gap="5px"
              wrap
            >
              <VuiFlex
                v-for="(item, j) in group.list"
                :key="j"
                gap="5px"
                shrink
                class="mcr-artifact-item"
              >
                <IconLabel
                  :icon="item.global?'global':'link'"
                  :button="false"
                />
                <a
                  :href="item.path"
                  target="_blank"
                >{{ item.name }}</a>
              </VuiFlex>
              <IconLabel
                v-if="group.showMore"
                icon="triangle-right"
                class="mcr-show-more"
                @click="onShowMoreClick(group)"
              >
                Show more ...
              </IconLabel>
            </VuiFlex>
          </details>
        </VuiFlex>
      </div>
    </div>

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          padding="10px"
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
            v-for="(group, i) in report.exportList"
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

    <div class="mcr-report-item">
      <div class="mcr-report-head">
        <VuiFlex
          gap="15px"
          padding="10px"
          wrap
        >
          <a
            href="https://github.com/microsoft/playwright"
            target="_blank"
          ><IconLabel
            icon="playwright"
            size="20px"
          >
            {{ report.playwright }}
          </IconLabel>
          </a>

          <a
            href="https://github.com/cenfun/monocart-reporter"
            target="_blank"
          ><IconLabel
            icon="monocart"
            size="16px"
          >
            {{ report.monocart }}
          </IconLabel>
          </a>
        </VuiFlex>
      </div>
      <div class="mcr-report-chart" />
    </div>
  </VuiFlex>
</template>

<style lang="scss">
.mcr-report {
    overflow-y: auto;
}

.mcr-report-item {
    position: relative;
}

.mcr-report-head {
    border-bottom: 1px solid #dae9fa;
    background-color: #eef6ff;

    .mcr-num {
        background-color: #0888f0;
    }

    a {
        color: #333;
    }
}

.mcr-report-chart {
    padding: 10px;
}

.mcr-long-label {
    flex-shrink: 1;
    max-width: 300px;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
    overflow: hidden;
}

.mcr-report-tag {
    position: relative;
    cursor: pointer;

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

.mcr-report-tag:hover {
    .mcr-tag {
        opacity: 0.9;
    }
}

.mcr-artifact-name {
    text-transform: capitalize;
}

.mcr-artifact-list {
    margin-top: 5px;

    .mcr-artifact-item {
        margin-right: 10px;
    }

    .mcr-show-more {
        width: 100%;
    }
}
</style>
