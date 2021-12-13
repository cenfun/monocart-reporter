
import { LuiTooltip } from 'lithops-ui';
import {
    Grid, VERSION, TIMESTAMP
} from 'turbogrid';
import Util from '../util/util.js';
import formatters from '../formatters/formatters.js';

const mixinGrid = {
    
    computed: {
        rowChange() {
            return [
                this.nameKeywords,
                this.result
            ];
        },
        dataChange() {
            return [
                this.type,
                this.showGrouped
            ];
        }
    },

    watch: {
        rowChange: function() {
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
            const grid = new Grid('.pat-grid-container');
            this.grid = grid;
            this.bindGridEvents();
            grid.setOption({
                bindWindowResize: true,
                rowNotFound: '<div>No Results</div>',
                columnDefaultFormatter: {
                    title: 'tree'
                },
                rowFilter: (rowData) => {
                    return this.rowFilter(rowData);
                }
            });
            grid.setFilter({
                null: function() {
                    return '';
                }
            });
            grid.setFormatter(formatters);
            grid.setData(this.getGridData());
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

                //show tooltip if cell truncated
                const value = rowItem[columnItem.id];
                if (value && isNodeTruncated(elem)) {
                    this.showTooltip(elem, elem.innerText);
                }

            }).bind('onCellMouseOut', (e, d) => {
                this.hideTooltip();
            });
        },

        getGridData() {
            const key = [this.type, this.showGrouped].join('_');
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
            if (!this.showGrouped) {
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
        

        hideTooltip: function() {
            if (this.tooltip) {
                this.tooltip.$destroy();
                this.tooltip = null;
            }
        },

        showTooltip: function(elem, message) {

            //remove previous
            this.hideTooltip();

            if (!message) {
                return;
            }

            this.tooltip = LuiTooltip.create((h) => {
                return {
                    props: {
                        target: elem,
                        text: message
                    }
                };
            });

        }
    }
};


export default mixinGrid;