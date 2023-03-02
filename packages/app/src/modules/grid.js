import { Grid } from 'turbogrid';
import fuzzy from 'fuzzy';

import Util from '../util/util.js';
import {
    formatters, matchedFormatter, annotationsFormatter
} from './formatters.js';
import store from '../util/store.js';
import state from '../modules/state.js';

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

const hideFlyover = () => {
    state.flyoverVisible = false;
    state.caseItem = null;
};

const showFlyover = (rowItem, position) => {
    if (state.caseItem === rowItem) {
        return;
    }

    state.caseItem = rowItem;
    state.position = position;
    state.detailTitle = rowItem.title;
    // console.log('showFlyover position', position);

    let flyoverWidth = '60%';
    if (state.windowWidth < 768) {
        flyoverWidth = '100%';
    } else if (state.windowWidth < 1024) {
        flyoverWidth = '80%';
    }
    state.flyoverWidth = flyoverWidth;

    state.flyoverVisible = true;
};

export const displayFlyover = () => {

    const grid = state.grid;
    if (!grid) {
        return;
    }

    const hash = Util.getHash();

    // match index and title
    if (hash.index) {
        const rowItem = grid.getRowItem(parseInt(hash.index));
        if (rowItem && rowItem.title === hash.title) {
            showFlyover(rowItem);
            return;
        }
    }

    // only match title
    if (hash.title) {
        const rowItem = grid.getRowItemBy('title', hash.title);
        if (rowItem) {
            showFlyover(rowItem);
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

        const cl = d.e.target.classList;
        if (cl.contains('mcr-icon') || cl.contains('mcr-clickable')) {
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

    grid.bind('onFirstUpdated', (e) => {
        displayFlyover();
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


const rowFilterHandler = (rowItem, searchableKeys, keywords) => {

    if (!keywords) {
        searchableKeys.forEach((k) => {
            rowItem[`${k}_matched`] = null;
        });
        return true;
    }

    let hasMatched = false;
    searchableKeys.forEach((k) => {

        let matched = null;

        let str = rowItem[k];

        // annotations array
        if (k === 'annotations' && Util.isList(str)) {
            str = annotationsFormatter(str);
        }

        if (typeof str === 'string') {
            const res = fuzzy.match(keywords, str, {
                pre: '<b>',
                post: '</b>'
            });
            if (res) {
                //  console.log(res);
                hasMatched = true;
                matched = res.rendered;
            }
        }
        rowItem[`${k}_matched`] = matched;
    });

    return hasMatched;
};

const getSearchableColumns = (columns) => {
    const map = {};
    Util.forEachTree(columns, (column) => {
        if (column.searchable) {
            map[column.id] = column.name;
            if (column.classMap) {
                column.classMap += ' mcr-searchable';
            } else {
                column.classMap = 'mcr-searchable';
            }
        }
    });
    return map;
};


export const createGrid = () => {
    const grid = new Grid('.mcr-grid');
    state.grid = grid;

    bindGridEvents();

    const searchableColumns = getSearchableColumns(state.gridDataAll.columns);
    const searchableKeys = Object.keys(searchableColumns);
    state.searchableTitle = `searchable: ${Object.values(searchableColumns).join(', ')}`;

    let rowNumber = 1;

    grid.setOption({
        selectMultiple: false,
        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: true,
        collapseAllVisible: true,
        rowNumberVisible: true,
        // 9999 max
        rowNumberWidth: 45,
        rowNumberFilter: (rowItem) => {
            if (rowItem.type === 'case') {
                return rowNumber++;
            }
        },
        rowNotFound: '<div class="mcr-no-results">No Results</div>',
        frozenColumn: state.windowWidth < 768 ? -1 : 1,
        columnTypes: {
            title: 'tree'
        },
        rowFilter: (rowItem) => {
            return rowFilterHandler(rowItem, searchableKeys, state.keywords);
        }
    });
    grid.setFormatter(formatters);

    // first render
    const data = getGridData();
    grid.setData(data);

    grid.render();
};

export const renderGrid = () => {
    hideFlyover();
    store.set('suiteVisible', state.suiteVisible);
    store.set('stepVisible', state.stepVisible);
    if (state.grid) {
        const data = getGridData();
        state.grid.setData(data);
        state.grid.render();
    }
};

export const updateGrid = () => {
    if (state.grid) {
        state.grid.update();
    }
};

