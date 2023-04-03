
const EC = require('eight-colors');
const Util = require('./utils/util.js');
const defaultOptions = require('./options.js');


const checkReportData = (item) => {
    if (item && typeof item === 'object') {
        if (Util.isList(item.rows) && Util.isList(item.columns) && item.summary) {
            return true;
        }
    }
};

const initDataList = (reportDataList) => {
    if (!Util.isList(reportDataList)) {
        EC.logRed(`[MCR] invalid report data list: ${reportDataList}`);
        return;
    }

    const list = [];

    for (const item of reportDataList) {
        if (typeof item === 'string') {
            const data = Util.readJSONSync(item);
            if (!data) {
                EC.logRed(`[MCR] failed to load report data: ${item}`);
                return;
            }
            list.push(data);
            continue;
        }

        if (!checkReportData(item)) {
            EC.logRed(`[MCR] unmatched report data format: ${item}`);
            return;
        }
        list.push(item);
    }

    return list;
};

module.exports = async (reportDataList, userOptions = {}) => {

    const dataList = initDataList(reportDataList);
    if (!dataList) {
        EC.logRed('[MCR] not found report data');
        return 1;
    }

    const options = {
        ... defaultOptions,
        ... userOptions
    };

    console.log(dataList.length, options);

};
