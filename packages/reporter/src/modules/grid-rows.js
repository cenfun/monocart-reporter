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

export const getGridRows = (allRows, caseType, groups) => {
    const rows = getRowsByCaseType(allRows, caseType);

    if (!groups.group) {
        const list = [];
        Util.forEachTree(rows, function(item) {
            if (item.type === 'case') {
                removeSteps(item);
                list.push(item);
            }
        });
        return list;
    }

    if (!groups.step) {
        Util.forEachTree(rows, function(item) {
            if (item.type === 'case') {
                removeSteps(item);
            }
        });
    }

    return rows;
};
