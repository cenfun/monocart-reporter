
import { components } from 'vine-ui';
import { Grid } from 'turbogrid';
import Util from '../util/util.js';
import formatters from './formatters.js';
import store from '../util/store.js';
const { VuiTooltip } = components;

export default {

    computed: {
        dataChange() {
            return [
                this.caseType,
                this.suiteVisible,
                this.stepVisible
            ];
        }
    },

    watch: {
        keywords: function() {
            if (this.grid) {
                this.grid.update();
            }
        },
        dataChange: function() {
            this.hideFlyover();
            store.set('suiteVisible', this.suiteVisible);
            store.set('stepVisible', this.stepVisible);
            if (this.grid) {
                const gridData = this.getGridData();
                this.grid.setData(gridData);
                this.grid.render();
            }
        }
    },

    methods: {

        createGrid() {
            const grid = new Grid('.prg-grid');
            this.grid = grid;
            this.bindGridEvents();

            let rowNumber = 1;

            grid.setOption({
                selectMultiple: false,
                bindWindowResize: true,
                scrollbarFade: true,
                scrollbarRound: true,
                collapseAllVisible: false,
                rowNumberVisible: true,
                rowNumberFilter: (rowItem) => {
                    if (rowItem.type === 'case') {
                        return rowNumber++;
                    }
                },
                rowNotFound: 'No Results',
                frozenColumn: 1,
                columnTypes: {
                    title: 'tree'
                },
                rowFilter: (rowItem) => {
                    if (!this.keywords) {
                        return true;
                    }
                    const arr = this.keywords.toLowerCase().split(/\s+/g);
                    const name = (`${rowItem.title}`).toLowerCase();
                    for (const item of arr) {
                        if (item && name.indexOf(item) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            grid.setFormatter(formatters);
            const data = this.getGridData();
            grid.setData(data);
            grid.render();
        },

        isNodeTruncated(node) {
            if (!node) {
                return false;
            }
            node = node.querySelector('.tg-tree-name') || node;
            if (node.clientWidth < node.scrollWidth) {
                return true;
            }
            return false;
        },

        bindGridEvents() {

            const grid = this.grid;

            grid.bind('onCellMouseOver', (e, d) => {
                const cellNode = d.cellNode;
                if (this.isNodeTruncated(cellNode)) {
                    this.showTooltip(cellNode, cellNode.innerText);
                }
            }).bind('onCellMouseOut', (e, d) => {
                this.hideTooltip();
            });

            grid.bind('onClick', (e, d) => {
                if (!d.cellNode) {
                    return;
                }
                const rowItem = d.rowItem;
                grid.setRowSelected(rowItem);

                const caseItem = this.getClickCaseItem(rowItem);
                if (!caseItem) {
                    return;
                }

                if (this.flyoverVisible) {
                    this.showFlyover(caseItem);
                    return;
                }

                const columnItem = d.columnItem;
                const target = d.e.target;
                if (target.classList.contains('vui-icon')) {
                    this.showFlyover(caseItem, columnItem.id);
                }


            });

            grid.bind('onDblClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                if (rowItem.type === 'case' && !this.flyoverVisible) {
                    this.showFlyover(rowItem);
                } else {
                    this.hideFlyover();
                }
            });
        },

        getClickCaseItem(rowItem) {
            if (rowItem.type === 'case') {
                return rowItem;
            }
            if (rowItem.type === 'step') {
                let parent = rowItem.parent;
                while (parent) {
                    if (parent.type === 'case') {
                        return parent;
                    }
                    parent = parent.parent;
                }
            }
        },

        getGridData() {
            const key = [this.caseType, this.suiteVisible, this.stepVisible].join('_');
            if (this.gridDataMap[key]) {
                return this.gridDataMap[key];
            }
            //console.log(key);
            const allData = JSON.parse(JSON.stringify(this.gridDataAll));
            this.initTreeList(allData.rows, null, -1);
            const data = this.getGridDataByType(allData, this.caseType, this.suiteVisible, this.stepVisible);
            console.log(key, data);
            this.gridDataMap[key] = data;
            return data;
        },

        initTreeList(list, parent, level) {
            if (!Util.isList(list)) {
                return;
            }
            level += 1;
            list.forEach((item) => {
                item.parent = parent;
                item.level = level;
                if (item.type === 'case') {
                    item.steps = item.subs;
                }
                this.initItemErrors(item);
                this.initTreeList(item.subs, item, level);
            });
        },

        initItemErrors(item) {
            if (!item.errors) {
                return;
            }
            item.errors = item.errors.map((index) => {
                return this.reportData.errors[index];
            });
        },

        getGridDataByType(allData, caseType, suiteVisible, stepVisible) {

            allData.rows = this.getFilteredRows(allData.rows, caseType);

            if (!suiteVisible) {
                const list = [];
                Util.forEachTree(allData.rows, function(item) {
                    if (item.type === 'case') {
                        list.push(item);
                    }
                });
                allData.rows = list;
            }

            if (!stepVisible) {
                Util.forEachTree(allData.rows, function(item) {
                    if (item.type === 'case') {
                        delete item.subs;
                    }
                });
            }

            return allData;

        },

        getFilteredRows(rows, caseType) {

            if (caseType === 'all') {
                return rows;
            }

            rows = rows.filter((it) => {
                if (it.type === 'case' && it.caseType !== caseType) {
                    return false;
                }
                return true;
            });
            rows.forEach((item) => {
                if (item.subs) {
                    const subs = this.getFilteredRows(item.subs, caseType);
                    if (subs.length) {
                        item.subs = subs;
                        return;
                    }
                    delete item.subs;
                }
            });

            rows = rows.filter((it) => {
                if (it.type === 'suite' && !it.subs) {
                    return false;
                }
                return true;
            });

            return rows;

        },

        showFlyover(rowItem, position) {
            this.detailTitle = rowItem.title;
            this.$refs.detail.update(rowItem, position);
            this.flyoverVisible = true;
        },

        hideFlyover() {
            this.flyoverVisible = false;
        },

        hideTooltip: function() {
            if (this.tooltip) {
                this.tooltip.unmount();
                this.tooltip = null;
            }
        },

        showTooltip: function(elem, message) {

            this.hideTooltip();

            if (!message) {
                return;
            }

            this.tooltip = VuiTooltip.createComponent({
                target: elem,
                maxWidth: 500,
                html: message
            });

        }
    }
};
