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

const forEachRow = (parentSubs, rows, groups) => {
    rows.forEach((item) => {

        // suite
        if (item.type === 'suite') {

            const isShow = groups[item.suiteType];
            if (isShow) {
                if (item.subs) {
                    const subs = [];
                    forEachRow(subs, item.subs, groups);
                    item.subs = subs;
                }
                parentSubs.push(item);
            } else {
                if (item.subs) {
                    forEachRow(parentSubs, item.subs, groups);
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
    forEachRow(list, rows, groups);

    // merge group

    return list;
};
