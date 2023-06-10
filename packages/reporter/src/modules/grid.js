import { Grid, hash } from 'monocart-common';

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
        state.tooltip.html = false;
        state.tooltip.classMap = '';
    }
};

const showTooltip = (elem, text, html) => {
    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!text) {
        return;
    }
    if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = text;
        state.tooltip.html = html;
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;
    }

};

export const hideFlyover = (immediately) => {
    state.flyoverVisible = false;
    state.flyoverData = null;
    if (immediately) {
        hash.remove('page');
    }
};

export const showFlyover = (component, data) => {
    state.flyoverComponent = component;
    state.flyoverData = data;
    const title = data ? data.title : state.title;
    state.flyoverTitle = title;
    state.flyoverVisible = true;
};

const showDetailById = (grid, id) => {
    if (id) {
        const rowItem = grid.getRowItemById(id);
        if (rowItem) {
            grid.scrollRowIntoView(rowItem);
            grid.setRowSelected(rowItem);
            showFlyover('detail', rowItem);
            return true;
        }
    }
};

const showDetailByTitle = (grid, title) => {
    if (title) {
        const rowItem = grid.getRowItemBy('title', title);
        if (rowItem) {
            grid.scrollRowIntoView(rowItem);
            grid.setRowSelected(rowItem);
            showFlyover('detail', rowItem);
            return true;
        }
    }
};

const showDetail = (pagePath) => {
    const grid = state.grid;
    if (!pagePath || !grid) {
        return;
    }

    const data = state.flyoverData;
    if (data) {
        showFlyover('detail', data);
        return true;
    }

    const list = pagePath.split('/');
    const id = list.shift();
    const title = list.join('/');
    // console.log('page:', page, 'id:', id, 'title:', title);

    // match id
    if (showDetailById(grid, id)) {
        return true;
    }

    // only match title
    if (showDetailByTitle(grid, title)) {
        return true;
    }
};

export const displayFlyoverWithHash = () => {

    const page = hash.get('page');
    if (page) {

        const list = page.split('/');
        const pageName = list.shift();
        const pagePath = list.join('/');

        if (pageName === 'report') {
            showFlyover('report');
            return;
        }

        if (pageName === 'detail') {
            if (showDetail(pagePath)) {
                return;
            }
        }

    }

    hideFlyover();

};

const getClickCaseItem = (rowItem) => {
    if (rowItem.type === 'case') {
        return rowItem;
    }
    if (rowItem.type === 'step') {
        let parent = rowItem.tg_parent;
        while (parent) {
            if (parent.type === 'case') {
                return parent;
            }
            parent = parent.tg_parent;
        }
    }
};

const showRowDetail = (data) => {
    state.flyoverData = data;
    const { id, title } = data;
    hash.set('page', `detail/${id}/${title}`);
};

const onRowClickHandler = (d, force) => {

    const {
        e, rowItem, columnItem
    } = d;

    const caseItem = getClickCaseItem(rowItem);
    if (!caseItem) {
        return;
    }

    if (state.flyoverVisible || force) {
        showRowDetail(caseItem);
        return;
    }

    const cls = e.target.classList;
    const columnId = columnItem.id;

    const isCaseTitle = columnId === 'title' && rowItem.type === 'case';

    const isClickColumn = [
        'ok',
        'errors',
        'logs',
        'annotations',
        'attachments'
    ].includes(columnId) && !cls.contains('tg-cell');

    if (isCaseTitle || isClickColumn) {
        showRowDetail(caseItem);
    }

};

const getClickPosition = (columnItem, rowItem) => {
    const columnId = columnItem.id;
    let rowId = rowItem.id;
    if (columnId === 'errors' && rowItem.errorId) {
        // use sub row errorId
        rowId = rowItem.errorId;
    }
    return {
        columnId,
        rowId
    };
};

const showPositionHandler = (d) => {
    const { rowItem, columnItem } = d;
    const position = getClickPosition(columnItem, rowItem);
    state.position = position;
};

const clickTitleHandler = (d) => {
    const { e, columnItem } = d;
    if (columnItem.id !== 'title') {
        return;
    }

    const cls = e.target.classList;
    if (!cls.contains('mcr-icon-label-icon')) {
        return;
    }

    // using native event
    e.preventDefault();

    state.levelPopoverVisible = true;
    state.levelPopoverTarget = e.target;

};

const expandParent = (row) => {
    while (row.tg_parent) {
        row = row.tg_parent;
        row.collapsed = false;
    }
};

export const expandRowLevel = (type) => {
    state.levelPopoverVisible = false;
    state.levelPopoverTarget = null;

    const grid = state.grid;

    if (type === 'step') {
        grid.expandAllRows();
        return;
    }

    if (type === 'shard') {
        grid.collapseAllRows();
        return;
    }

    if (type === 'project') {
        if (!state.systemList) {
            grid.collapseAllRows();
            return;
        }
        grid.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (rowItem.suiteType === 'shard') {
                    rowItem.collapsed = false;
                } else {
                    rowItem.collapsed = true;
                }
            }
        });
        grid.update();
        return;
    }

    if (type === 'file') {
        grid.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (rowItem.suiteType === 'project') {
                    rowItem.collapsed = false;
                    expandParent(rowItem);
                } else {
                    rowItem.collapsed = true;
                }
            }
        });
        grid.update();
        return;
    }

    if (type === 'suite') {
        grid.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (rowItem.type === 'suite') {

                    const subSuite = rowItem.subs.find((it) => it.type === 'suite');
                    if (!subSuite) {
                        rowItem.collapsed = true;
                        return;
                    }

                    rowItem.collapsed = false;
                    expandParent(rowItem);

                } else {
                    rowItem.collapsed = true;
                }
            }
        });
        grid.update();
        return;
    }

    if (type === 'case') {
        grid.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (rowItem.type === 'suite') {
                    rowItem.collapsed = false;
                    expandParent(rowItem);
                } else {
                    rowItem.collapsed = true;
                }
            }
        });
        grid.update();

    }

};

const initTitleWidthHandler = (grid) => {

    const { containerWidth, columnsWidth } = grid;
    if (containerWidth < columnsWidth) {
        return;
    }

    const spaceWidth = containerWidth - columnsWidth;
    // console.log(spaceWidth);
    const titleColumn = grid.getColumnItem('title');
    if (titleColumn.width < titleColumn.maxWidth) {
        grid.setColumnWidth(titleColumn, titleColumn.width + spaceWidth);
    }

};

const bindGridEvents = () => {

    const grid = state.grid;

    grid.bind('onCellMouseEnter', (e, d) => {
        const cellNode = d.cellNode;
        if (isNodeTruncated(cellNode)) {
            const { rowItem, columnItem } = d;
            let html = true;
            let text = rowItem[`${columnItem.id}_matched`];
            if (!text) {
                html = false;
                text = cellNode.innerText;
            }
            showTooltip(cellNode, text, html);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });

    grid.bind('onClick', (e, d) => {

        if (d.headerNode) {
            clickTitleHandler(d);
            return;
        }

        if (!d.cellNode) {
            return;
        }

        if (!state.exportSelected) {
            grid.selectAll(false);
            grid.setRowSelected(d.rowItem);
        }

        onRowClickHandler(d);
        showPositionHandler(d);

    });

    grid.bind('onDblClick', (ee, d) => {
        if (!d.cellNode) {
            return;
        }

        onRowClickHandler(d, true);
        showPositionHandler(d);

    });

    grid.bind('onSort', (e, d) => {
        const { columnItem } = d;
        if (columnItem) {
            state.sortField = columnItem.id;
            state.sortAsc = columnItem.sortAsc;
        }
    });

    grid.bind('onSelectChanged', (e, ls) => {
        if (!state.exportSelected) {
            return;
        }

        if (ls.length === 1) {
            const item = ls[0];
            if (item.subs) {
                const selected = !item.selected;
                const subs = [];
                Util.forEach(item.subs, (s) => {
                    s.selected = selected;
                    subs.push(s);
                });
                grid.setRowSelected(subs);
            }
        }
    });

    // grid.bind('onResize', (e, d) => {
    // });

    grid.bind('onFirstUpdated', (e) => {
        displayFlyoverWithHash();
        initTitleWidthHandler(grid);
    });
};

const getGridData = () => {
    const key = [state.caseType, state.suiteVisible, state.stepVisible].join('_');
    if (state.gridDataMap[key]) {
        return state.gridDataMap[key];
    }
    // console.log(key);
    const allData = JSON.parse(JSON.stringify(state.gridDataAll));

    initCustomsFormatters(allData.columns, state.formatters);

    const data = getGridDataByType(allData, state.caseType, state.suiteVisible, state.stepVisible);

    // console.log(key, data);

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
            o.sortField = 'errorNum';
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

        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: true,
        collapseAllVisible: true,
        rowHeight: 36,
        rowNumberVisible: true,
        // 9999 max
        rowNumberWidth: 46,
        rowNumberFilter: getRowNumberFilter(),
        rowFilter: searchHandler,
        rowNotFound: '<div class="mcr-no-results">No Results</div>',
        frozenColumn: 1,

        // scrollbarFade: true,

        // do not watch sort in state
        sortField: state.sortField,
        sortAsc: state.sortAsc,
        sortOnInit: true,
        sortComparers: getGridSortComparers(),

        columnTypes: {
            title: 'tree'
        }
    };

    if (state.exportSelected) {
        options.selectVisible = true;
        options.selectColumn = {
            width: 50
        };
    }

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
