import { Grid } from 'turbogrid';
import Util from '../utils/util.js';
import { formatters, matchedFormatter } from './formatters.js';
import state from '../modules/state.js';
import searchHandler from './search.js';

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

const hideTooltip = () => {
    if (Util.isTouchDevice()) {
        return;
    }

    if (state.tooltip) {
        state.tooltip.visible = false;
        state.tooltip.text = '';
    }
};

const showTooltip = (elem, message) => {
    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!message) {
        return;
    }
    if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = message;
        state.tooltip.visible = true;
    }

};

export const hideFlyover = (immediately) => {
    state.flyoverVisible = false;
    state.caseItem = null;
    if (immediately) {
        Util.delHash('page');
    }
};

export const showFlyover = (caseItem, position) => {
    if (caseItem) {

        if (state.caseItem === caseItem) {
            return;
        }

        state.caseItem = caseItem;
        state.position = position;
        state.flyoverTitle = caseItem.title;

        const { tg_index, title } = caseItem;
        Util.setHash('page', `${tg_index}/${title}`);

    } else {

        state.caseItem = null;

        state.flyoverTitle = state.title;
        Util.setHash('page', 'report');

    }

    state.flyoverVisible = true;
};

const displayFlyoverByIndex = (grid, index, title) => {
    if (index) {
        const rowItem = grid.getRowItem(parseInt(index));
        if (rowItem && rowItem.title === title) {
            showFlyover(rowItem);
            return true;
        }
    }
    return false;
};

const displayFlyoverByTitle = (grid, title) => {
    if (title) {
        const rowItem = grid.getRowItemBy('title', title);
        if (rowItem) {
            showFlyover(rowItem);
            return true;
        }
    }
    return false;
};

export const displayFlyoverWithHash = () => {

    const page = Util.getHash('page');

    if (page === 'report') {
        showFlyover();
        return;
    }

    const grid = state.grid;
    if (page && grid) {

        const list = page.split('/');
        const index = list.shift();
        const title = list.join('/');
        // console.log(page, index, title);

        // match index and title
        if (displayFlyoverByIndex(grid, index, title)) {
            return;
        }

        // only match title
        if (displayFlyoverByTitle(grid, title)) {
            return;
        }

    }

    hideFlyover();

};

const bindGridEvents = () => {

    const grid = state.grid;

    grid.bind('onCellMouseEnter', (e, d) => {
        const cellNode = d.cellNode;
        if (isNodeTruncated(cellNode)) {
            showTooltip(cellNode, cellNode.innerText);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });

    grid.bind('onClick', (e, d) => {
        if (!d.cellNode) {
            return;
        }
        const rowItem = d.rowItem;
        const columnItem = d.columnItem;
        const position = columnItem.id;

        grid.setRowSelected(rowItem);

        const caseItem = getClickCaseItem(rowItem);
        if (!caseItem) {
            return;
        }

        const cls = d.e.target.classList;

        const isInfo = position === 'title' && cls.contains('mcr-icon-open');

        const isClickColumn = [
            'ok',
            'errors',
            'logs',
            'annotations',
            'attachments'
        ].includes(position) && !cls.contains('tg-cell');

        if (isInfo || isClickColumn) {
            showFlyover(caseItem, position);
            return;
        }

        if (state.flyoverVisible) {
            showFlyover(caseItem, position);
        }
    });

    grid.bind('onDblClick', (e, d) => {
        if (!d || !d.rowNode) {
            return;
        }
        const rowItem = d.rowItem;
        if (rowItem.type === 'case' && !state.flyoverVisible) {
            showFlyover(rowItem);
        } else {
            hideFlyover();
        }
    });

    grid.bind('onSort', (e, d) => {
        const { columnItem } = d;
        if (columnItem) {
            state.sortField = columnItem.id;
            state.sortAsc = columnItem.sortAsc;
        }
    });

    grid.bind('onFirstUpdated', (e) => {
        displayFlyoverWithHash();
    });
};

const getClickCaseItem = (rowItem) => {
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
};

const getGridData = () => {
    const key = [state.caseType, state.suiteVisible, state.stepVisible].join('_');
    if (state.gridDataMap[key]) {
        return state.gridDataMap[key];
    }
    // console.log(key);
    const allData = JSON.parse(JSON.stringify(state.gridDataAll));

    initCustomsFormatters(allData.columns, state.formatters);

    initRowsToTreeList(allData.rows, null, -1);

    const data = getGridDataByType(allData, state.caseType, state.suiteVisible, state.stepVisible);

    console.log(key, data);
    state.gridDataMap[key] = data;
    return data;
};

export const initCustomsFormatters = (list, customFormatters) => {
    if (!Util.isList(list)) {
        return;
    }
    list.forEach((item) => {
        const formatterStr = customFormatters[item.id];
        if (formatterStr) {

            let formatter;

            try {
                formatter = new Function(`return (${formatterStr}).apply(this, arguments);`);
            } catch (e) {
                console.error('failed to deserialize formatter function');
            }

            // console.log(formatter);

            if (formatter) {
                item.formatter = function(value, rowItem, columnItem, cellNode) {

                    value = matchedFormatter(value, rowItem, columnItem);

                    return formatter.apply(this, [value, rowItem, columnItem, cellNode]);
                };
            }

        }

        // into subs
        initCustomsFormatters(item.subs, customFormatters);
    });
};

const initRowsToTreeList = (list, parent, level) => {
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

        // into subs
        initRowsToTreeList(item.subs, item, level);
    });
};

const getGridDataByType = (allData, caseType, suiteVisible, stepVisible) => {

    allData.rows = getFilteredRows(allData.rows, caseType);

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

};

const getFilteredRows = (rows, caseType) => {

    if (caseType === 'tests') {
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
            const subs = getFilteredRows(item.subs, caseType);
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

    // remove row classMap when caseType is skipped
    if (caseType === 'skipped') {
        rows.forEach((it) => {
            if (it.caseType === 'skipped') {
                it.classMap = '';
            }
        });
    }

    return rows;

};

const getRowNumberFilter = () => {
    let rowNumber = 1;
    return (rowItem) => {
        if (rowItem.type === 'case') {
            return rowNumber++;
        }
    };
};


const getGridSortComparers = () => {
    return {
        errors: function(a, b, o) {
            const valueComparer = this.getDefaultComparer('value');
            const numberValueComparer = this.getDefaultComparer('numberValue');
            o.sortField = 'numErrors';
            return valueComparer(a, b, o, (av, bv) => {
                return numberValueComparer(av, bv);
            });
        },
        logs: function(a, b, o) {
            const valueComparer = this.getDefaultComparer('value');
            const numberValueComparer = this.getDefaultComparer('numberValue');
            return valueComparer(a, b, o, (av, bv) => {
                if (Array.isArray(av)) {
                    av = av.length;
                }
                if (Array.isArray(bv)) {
                    bv = bv.length;
                }
                return numberValueComparer(av, bv);
            });
        },
        annotations: function(a, b, o) {
            const valueComparer = this.getDefaultComparer('value');
            const stringValueComparer = this.getDefaultComparer('stringValue');
            return valueComparer(a, b, o, (av, bv) => {
                if (Array.isArray(av)) {
                    av = av.map((it) => it.type).join(' ');
                }
                if (Array.isArray(bv)) {
                    bv = bv.map((it) => it.type).join(' ');
                }
                return stringValueComparer(av, bv);
            });
        }
    };
};

const getGridOption = () => {
    const options = {
        selectMultiple: false,
        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: true,
        collapseAllVisible: true,
        rowHeight: 36,
        rowNumberVisible: true,
        // 9999 max
        rowNumberWidth: 46,
        rowNumberFilter: getRowNumberFilter(),
        rowFilter: searchHandler(),
        rowNotFound: '<div class="mcr-no-results">No Results</div>',
        frozenColumn: 1,

        // do not watch sort in state
        sortField: state.sortField,
        sortAsc: state.sortAsc,
        sortOnInit: true,
        sortComparers: getGridSortComparers(),

        columnTypes: {
            title: 'tree'
        }
    };

    // no frozen in mini size
    if (state.windowWidth < 800) {
        options.frozenColumn = -1;
    }

    return options;
};

export const createGrid = () => {
    const grid = new Grid('.mcr-grid');
    state.grid = grid;

    bindGridEvents();

    grid.setFormatter(formatters);
    grid.setOption(getGridOption());
    grid.setData(getGridData());
    grid.render();
};

export const renderGrid = () => {
    const grid = state.grid;
    if (!grid) {
        return;
    }
    // console.log('render grid');
    grid.once('onUpdated', () => {
        if (state.sortField) {
            grid.scrollColumnIntoView(state.sortField);
        }
    });
    grid.setOption(getGridOption());
    grid.setData(getGridData());
    grid.render();
};

export const updateGrid = () => {
    const grid = state.grid;
    if (!grid) {
        return;
    }
    grid.update();
};
