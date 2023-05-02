const EC = require('eight-colors');
const Util = require('./utils/util.js');
const defaultSummary = require('./default/summary.js');
const generatePieChart = require('./utils/pie.js');

const caseHandler = (item, summary) => {
    summary.tests.value += 1;
    summary.retries.value += item.retry;

    if (item.errors) {
        summary.errors.value += item.errors.length;
    }

    if (item.logs) {
        summary.logs.value += item.logs.length;
    }

    if (item.attachments) {
        summary.attachments.value += item.attachments.length;
    }

    const type = summary[item.caseType];
    if (!type) {
        return;
    }
    type.value += 1;
};

const stepHandler = (item, summary) => {
    summary.steps.value += 1;

    if (item.errors) {
        summary.errors.value += item.errors.length;
    }
};

// ===========================================================================

const tagHandler = (item, tags, tagOptions) => {
    const matches = item.title.matchAll(Util.tagPattern);
    for (const match of matches) {
        const tag = match[1];
        let tagItem = tags[tag];
        if (!tagItem) {
            tagItem = {};
            const options = tagOptions[tag];
            if (options) {
                if (options.style) {
                    Object.assign(tagItem, options);
                } else {
                    tagItem.style = options;
                }
            }
            tagItem.value = 0;
            tags[tag] = tagItem;
        }
        tagItem.value += 1;
    }
};

const calculateSummary = (data, options) => {
    const tags = {};
    const tagOptions = options.tags || {};

    const summary = {
        ... defaultSummary
    };
    // init summary data
    Object.keys(summary).forEach((k) => {
        const item = summary[k];
        item.id = k;
        item.value = 0;
    });

    // ====================================================

    const suiteMap = {};
    data.suiteTypes.forEach((k) => {
        suiteMap[k] = `${k}s`;
    });

    // only counting case parent without duplicate
    const suiteSet = new Set();
    // Unique title
    const projectSet = new Set();
    const fileSet = new Set();

    const suiteHandler = (item) => {
        const suiteType = item.suiteType;
        if (suiteType === 'project') {
            projectSet.add(item.title);
            return;
        }

        if (suiteType === 'file') {
            fileSet.add(item.title);
            return;
        }

        // shards and describes
        const type = suiteMap[suiteType];
        if (!type) {
            return;
        }
        summary[type].value += 1;
    };

    // ====================================================

    Util.forEach(data.rows, (item, parent) => {

        // do NOT collect tags from step
        if (Util.isTagItem(item)) {
            tagHandler(item, tags, tagOptions);
        }

        if (item.type === 'case') {
            suiteSet.add(parent);
            caseHandler(item, summary);
            return;
        }

        if (item.type === 'step') {
            stepHandler(item, summary);
            return;
        }

        if (item.type === 'suite') {
            suiteHandler(item);
        }
    });

    // ====================================================

    summary.suites.value = suiteSet.size;
    suiteSet.clear();

    summary.projects.value = projectSet.size;
    projectSet.clear();

    summary.files.value = fileSet.size;
    fileSet.clear();

    // ====================================================

    data.tags = tags;
    data.summary = summary;

    // ====================================================

    const caseTypes = data.caseTypes;

    // percent and pie data list
    const pieDataList = [];
    caseTypes.forEach((k) => {
        const item = summary[k];
        item.percent = Util.PF(item.value, summary.tests.value);
        pieDataList.push({
            ... item
        });
    });

    data.pieChart = generatePieChart(pieDataList);

};

// ===========================================================================

const isTrendData = (data) => {
    if (!data.date) {
        return false;
    }
    if (!data.duration) {
        return false;
    }
    if (!data.summary) {
        return false;
    }
    return true;
};

const getTrendData = async (input) => {
    if (typeof input === 'function') {
        input = await input();
    }

    // path
    if (typeof input === 'string') {
        const data = Util.readJSONSync(input);
        if (data) {
            return data;
        }
    }

    if (input && typeof input === 'object') {
        return input;
    }
};

const getTrends = async (input) => {

    if (!input) {
        return [];
    }
    const data = await getTrendData(input);
    if (!data) {
        EC.logRed('[MCR] failed to load trend data');
        return [];
    }

    if (!isTrendData(data)) {
        EC.logRed('[MCR] trend data requires properties: date, duration and summary');
        return [];
    }

    // copy previous trends
    const trends = [].concat(data.trends || []);
    trends.push(Util.getCurrentTrendInfo(data));

    return trends;
};


module.exports = {
    calculateSummary,
    getTrends
};
