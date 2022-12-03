import { components } from 'vine-ui';
import { Grid } from 'turbogrid';
import Util from '../util/util.js';
import formatters from './formatters.js';
import store from '../util/store.js';
import state from '../modules/state.js';

const { VuiTooltip } = components;

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
    if (state.tooltip) {
        state.tooltip.unmount();
        state.tooltip = null;
    }
};

const showTooltip = (elem, message) => {

    hideTooltip();

    if (!message) {
        return;
    }

    state.tooltip = VuiTooltip.createComponent({
        target: elem,
        maxWidth: 500,
        text: message
    });

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
        if (cl.contains('mcr-icon') || cl.contains('mcr-annotation')) {
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
    initTreeList(allData.rows, null, -1);
    const data = getGridDataByType(allData, state.caseType, state.suiteVisible, state.stepVisible);
    console.log(key, data);
    state.gridDataMap[key] = data;
    return data;
};

const initTreeList = (list, parent, level) => {
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
        initItemErrors(item);
        initTreeList(item.subs, item, level);
    });
};

const initItemErrors = (item) => {
    if (!item.errors) {
        return;
    }
    item.errors = item.errors.map((index) => {
        return state.reportData.errors[index];
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


export const createGrid = () => {
    const grid = new Grid('.mcr-grid');
    state.grid = grid;

    bindGridEvents();

    let rowNumber = 1;

    grid.setOption({
        selectMultiple: false,
        bindWindowResize: true,
        scrollbarRound: true,
        collapseAllVisible: false,
        rowNumberVisible: true,
        // 9999 max
        rowNumberWidth: 45,
        rowNumberFilter: (rowItem) => {
            if (rowItem.type === 'case') {
                return rowNumber++;
            }
        },
        rowNotFound: 'No Results',
        frozenColumn: state.windowWidth < 768 ? -1 : 1,
        columnTypes: {
            title: 'tree'
        },
        rowFilter: (rowItem) => {
            if (!state.keywords) {
                return true;
            }
            const arr = state.keywords.toLowerCase().split(/\s+/g);
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

