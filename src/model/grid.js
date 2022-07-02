
import { components } from 'vine-ui';
import {
    Grid, VERSION, TIMESTAMP
} from 'turbogrid';
import Util from '../util/util.js';
import formatters from '../formatters/formatters.js';
import store from '../util/store.js';

const { VuiTooltip } = components;

const mixinGrid = {

    computed: {
        rowChange() {
            return [
                this.keywords,
                this.result
            ];
        },
        dataChange() {
            return [
                this.type,
                this.grouped
            ];
        }
    },

    watch: {
        rowChange: function() {
            store.set('result', this.result);
            this.grid.update();
        },
        dataChange: function() {
            const gridData = this.getGridData();
            this.grid.setData(gridData);
            this.grid.render();
        }
    },

    methods: {

        createGrid() {
            console.log(`grid version: ${VERSION} (${new Date(TIMESTAMP).toLocaleString()})`);
            const grid = new Grid('.prg-grid-container');
            this.grid = grid;
            this.bindGridEvents();
            grid.setOption({
                selectMultiple: false,
                bindWindowResize: true,
                rowNotFound: '<div>No Results</div>',
                frozenColumn: 1,
                columnTypes: {
                    title: 'tree'
                },
                rowFilter: (rowData) => {
                    return this.rowFilter(rowData);
                }
            });
            grid.setFormatter(formatters);
            const data = this.getGridData();
            console.log(data);
            grid.setData(data);
            grid.render();
        },

        bindGridEvents() {

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

            this.grid.bind('onCellMouseOver', (e, d) => {

                const elem = d.cellNode;
                const rowItem = this.grid.getRowItem(d.row);
                const columnItem = this.grid.getColumnItem(d.column);
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

            this.grid.bind('onClick', (e, d) => {
                if (!d.rowNode) {
                    return;
                }
                const rowItem = d.rowItem;
                this.grid.setRowSelected(rowItem);

                if (rowItem.type === 'case') {
                    if (d.columnItem.id === 'title') {
                        this.$refs.detail.update(rowItem);
                        this.showFlyover();
                    } else {
                        this.hideFlyover();
                    }
                }
            });

            this.grid.bind('onDblClick', (e, d) => {
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
            const key = [this.type, this.grouped].join('_');
            if (this.gridDataMap[key]) {
                return this.gridDataMap[key];
            }

            //console.log(key);

            const tempData = JSON.parse(JSON.stringify(this.gridDataMap.all));

            //type filter, default is step
            if (this.type === 'suite') {
                Util.forEachTree(tempData.rows, function(item) {
                    if (item.subs) {
                        if (item.subType === 'case') {
                            delete item.subs;
                        }
                    }
                });
            } else if (this.type === 'case') {
                Util.forEachTree(tempData.rows, function(item) {
                    if (item.subs) {
                        if (item.subType === 'step') {
                            delete item.subs;
                        }
                    }
                });
            }

            //if group
            if (!this.grouped) {
                const list = [];
                Util.forEachTree(tempData.rows, function(item) {
                    if (item.subs) {
                        return;
                    }
                    list.push(item);
                });
                tempData.rows = list;
            }
            this.gridDataMap[key] = tempData;
            return tempData;
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


export default mixinGrid;
