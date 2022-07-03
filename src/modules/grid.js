
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
            this.hideFlyover();
            this.grid.update();
        },
        dataChange: function() {
            this.hideFlyover();
            store.set('suiteVisible', this.suiteVisible ? '1' : '');
            store.set('stepVisible', this.stepVisible ? '1' : '');
            const gridData = this.getGridData();
            this.grid.setData(gridData);
            this.grid.render();
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

        bindGridEvents() {

            const grid = this.grid;

            const isNodeTruncated = function(node) {
                if (!node) {
                    return false;
                }
                const itemNode = node.querySelector('.tg-tree-item');
                if (itemNode) {
                    node = itemNode;
                }
                if (node.clientWidth < node.scrollWidth) {
                    return true;
                }
                return false;
            };

            grid.bind('onCellMouseOver', (e, d) => {

                const elem = d.cellNode;
                const rowItem = grid.getRowItem(d.row);
                const columnItem = grid.getColumnItem(d.column);
                const value = rowItem[columnItem.id];
                if (!value) {
                    return;
                }

                if (columnItem.id === 'location') {
                    this.showTooltip(elem, `${value.file}:${value.line},${value.column}`);
                    return;
                }

                if (columnItem.id === 'error') {
                    let errorMsg = `<b>${rowItem.title}:</b>\n${value.message}`;
                    if (value.stack) {
                        errorMsg += `\n${value.stack}`;
                    }
                    this.showTooltip(elem, errorMsg);
                    return;
                }

                //show tooltip if cell truncated
                if (isNodeTruncated(elem)) {
                    this.showTooltip(elem, elem.innerText);
                }

            }).bind('onCellMouseOut', (e, d) => {
                this.hideTooltip();
            });

            grid.bind('onClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                grid.setRowSelected(rowItem);

                if (rowItem.type === 'case') {
                    if (d.columnItem.id === 'title') {
                        this.$refs.detail.update(rowItem);
                        this.showFlyover();
                    }
                } else {
                    this.hideFlyover();
                }
            });

            grid.bind('onDblClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                if (rowItem.type === 'case') {
                    this.showFlyover();
                } else {
                    this.hideFlyover();
                }
            });
        },

        getGridData() {
            const key = [this.caseType, this.suiteVisible, this.stepVisible].join('_');
            if (this.gridDataMap[key]) {
                return this.gridDataMap[key];
            }
            //console.log(key);
            const allData = JSON.parse(JSON.stringify(this.gridDataAll));
            const data = this.getGridDataByType(allData, this.caseType, this.suiteVisible, this.stepVisible);
            this.gridDataMap[key] = data;
            return data;
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


        showFlyover() {
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

            //remove previous
            this.hideTooltip();

            if (!message) {
                return;
            }

            const arr = message.split(/\r|\n/g);
            arr.forEach(function(str, i) {
                //space to &nbsp;
                str = str.replace(/ +/g, function(word) {
                    const ls = [];
                    ls.length = word.length + 1;
                    return ls.join('&nbsp;');
                });
                arr[i] = str;
            });

            message = `<div>${arr.join('</div><div>')}</div>`;

            this.tooltip = VuiTooltip.createComponent({
                target: elem
            }, {
                default: () => {
                    return message;
                }
            });

        }
    }
};
