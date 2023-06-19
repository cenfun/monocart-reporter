import Util from '../utils/util.js';


const getRowsByCaseType = (rows, caseType) => {

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
            const subs = getRowsByCaseType(item.subs, caseType);
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

const removeSteps = (item) => {
    if (Util.hasOwn(item, 'collapsed')) {
        item.collapsed = false;
    }
    if (Util.hasOwn(item, 'subs')) {
        delete item.subs;
    }
};

const getRowsByGroup = (parentSubs, rows, groups) => {
    rows.forEach((item) => {

        // suite
        if (item.type === 'suite') {

            const isShow = groups[item.suiteType];
            if (isShow) {
                if (item.subs) {
                    const subs = [];
                    getRowsByGroup(subs, item.subs, groups);
                    item.subs = subs;
                }
                parentSubs.push(item);
            } else {
                if (item.subs) {
                    getRowsByGroup(parentSubs, item.subs, groups);
                }
            }

            return;
        }

        // case and step
        if (item.type === 'case') {
            if (!groups.step) {
                removeSteps(item);
            }
            parentSubs.push(item);
        }

    });
};

const mergeRowsGroups = (rows) => {

    const map = new Map();
    const indexes = [];
    rows.forEach((item, i) => {
        if (item.type === 'suite' && item.subs) {

            const title = item.title;

            const prev = map.get(title);
            if (prev) {
                indexes.push(i);
                // merge subs
                prev.caseNum += item.caseNum;
                prev.subs = prev.subs.concat(item.subs);
                mergeRowsGroups(prev.subs);

            } else {
                map.set(title, item);
                mergeRowsGroups(item.subs);
            }

        }
    });

    if (indexes.length) {
        indexes.reverse();
        indexes.forEach((i) => {
            rows.splice(i, 1);
        });
    }

    map.clear();

};


export const getGridRows = (allRows, caseType, groups) => {
    const rows = getRowsByCaseType(allRows, caseType);

    // no group, only case, flat list
    if (!groups.group) {
        const caseList = [];
        Util.forEachTree(rows, function(item) {
            if (item.type === 'case') {
                removeSteps(item);
                caseList.push(item);
            }
        });
        return caseList;
    }

    // with group, tree list
    const list = [];
    getRowsByGroup(list, rows, groups);

    // merge group
    if (groups.merge) {
        mergeRowsGroups(list);
    }

    return list;
};
