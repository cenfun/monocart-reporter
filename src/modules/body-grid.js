
import { components } from 'vine-ui';
import { Grid } from 'turbogrid';
import Util from '../util/util.js';
import formatters from './body-formatters.js';

const { VuiTooltip } = components;

export default {

    computed: {
        dataChange() {
            return [
                this.dataType,
                this.grouped
            ];
        }
    },

    watch: {
        keywords: function() {
            this.bodyGrid.update();
        },
        dataChange: function() {
            const gridData = this.getBodyGridData();
            this.bodyGrid.setData(gridData);
            this.bodyGrid.render();
        }
    },

    methods: {

        createBodyGrid() {
            const grid = new Grid('.prg-body-grid');
            this.bodyGrid = grid;
            this.bindBodyGridEvents();

            let rowNumber = 1;

            grid.setOption({
                selectMultiple: false,
                bindWindowResize: true,
                scrollbarFade: true,
                scrollbarRound: true,
                rowNumberVisible: true,
                rowNumberFilter: (rowItem) => {
                    if (rowItem.type === this.type) {
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
            const data = this.getBodyGridData();
            grid.setData(data);
            grid.render();
        },

        bindBodyGridEvents() {

            const grid = this.bodyGrid;

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

        getDataKey() {
            if (this.dataType === 'suite') {
                return this.dataType;
            }
            return [this.dataType, this.grouped].join('_');
        },

        getBodyGridData() {
            const key = this.getDataKey();
            if (this.gridDataMap[key]) {
                return this.gridDataMap[key];
            }
            //console.log(key);
            const allData = JSON.parse(JSON.stringify(this.gridDataMap.all));
            const data = this.getGridDataByType(allData, this.dataType, this.grouped);
            this.gridDataMap[key] = data;
            return data;
        },

        getGridDataByType(allData, dataType, grouped) {
            if (dataType === 'suite') {
                return this.getGridDataBySuite(allData);
            }
            if (dataType === 'step') {
                return this.getGridDataByStep(allData, grouped);
            }
            return this.getGridDataByCase(allData, dataType, grouped);
        },

        getGridDataBySuite(allData) {
            const filter = function(list) {
                list = list.filter((it) => it.type === 'suite');
                list.forEach((item) => {
                    if (item.subs) {
                        const subs = filter(item.subs);
                        if (subs.length) {
                            item.subs = subs;
                            return;
                        }
                        delete item.subs;
                    }
                });
                return list;
            };
            allData.rows = filter(allData.rows);
            return allData;
        },

        getGridDataByStep(allData, grouped) {
            return this.getGridDataGrouped(allData, grouped);
        },

        getGridDataByCase(allData, dataType, grouped) {
            const filter = function(list) {
                list = list.filter((it) => {
                    if (it.type === 'suite') {
                        return true;
                    }
                    if (it.type === 'case') {
                        if (dataType === 'case') {
                            return true;
                        }
                        if (it.dataType === dataType) {
                            return true;
                        }
                    }

                });
                list.forEach((item) => {
                    if (item.subs) {
                        const subs = filter(item.subs);
                        if (subs.length) {
                            item.subs = subs;
                            return;
                        }
                        delete item.subs;
                    }
                });

                list = list.filter((it) => {
                    if (it.type === 'suite' && !it.subs) {
                        return false;
                    }
                    return true;
                });

                return list;
            };

            allData.rows = filter(allData.rows);

            return this.getGridDataGrouped(allData, grouped);
        },

        getGridDataGrouped(allData, grouped) {
            if (!grouped) {
                const list = [];
                Util.forEachTree(allData.rows, function(item) {
                    if (item.subs) {
                        return;
                    }
                    list.push(item);
                });
                allData.rows = list;
            }
            return allData;
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
