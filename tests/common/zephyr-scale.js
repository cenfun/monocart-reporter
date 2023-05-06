const axios = require('axios');
const EC = require('eight-colors');

module.exports = async (reportData, capability) => {

    // https://support.smartbear.com/zephyr-scale-cloud/api-docs/

    const host = 'https://api.zephyrscale.smartbear.com/v2/';
    // do not store your token in the source code, but pass it from environment variables
    const ZEPHYR_SCALE_TOKEN = process.env.ZEPHYR_SCALE_TOKEN;
    const projectKey = 'MON';

    const client = createClient(host, ZEPHYR_SCALE_TOKEN);

    // Step 1. Collect case keys
    EC.logCyan('[zephyr] collect test results ...');
    const results = [];

    // 1. add zephyr key to comments
    /**
     * @zephyr MON-T1
     */
    // test('Test case', async () => { });
    // 2. make sure the comments to be collected with visitor https://github.com/cenfun/monocart-reporter#collect-data-from-comments

    capability.forEach((item) => {
        if (item.type === 'case' && item.zephyr) {

            // The default execution status does not match between Zephyr Scale and Playwright
            // Please go to Zephyr Scale configuration page, and add Playwright 4 status: Passed, Flaky, Skipped, Failed
            const statusMap = {
                passed: 'Passed',
                flaky: 'Flaky',
                skipped: 'Skipped',
                failed: 'Failed'
            };

            const statusName = statusMap[item.caseType];

            results.push({
                testCaseKey: item.zephyr,
                statusName
            });
        }
    });

    if (!results.length) {
        EC.logRed('[zephyr] no test results for zephyr');
        return;
    }
    console.log(`[zephyr] got test results: ${results.length}`);

    const {
        name, dateH, durationH
    } = reportData;

    const testCaseName = `${name} ${dateH} (${durationH})`;

    // Step 2. Create a Test Cycle
    // https://support.smartbear.com/zephyr-scale-cloud/api-docs/#tag/Test-Cycles/operation/createTestCycle
    console.log('[zephyr] create a test cycle ...');
    const resCycle = await client.request('post', 'testcycles', {
        projectKey,
        name: testCaseName
    });

    if (!resCycle) {
        return;
    }

    // got test cycle key
    const testCycleKey = resCycle.key;
    console.log(`[zephyr] test cycle created: ${testCycleKey} ${testCaseName}`);

    // Step 3. Create test executions to cycle
    // https://support.smartbear.com/zephyr-scale-cloud/api-docs/#tag/Test-Executions/operation/createTestExecution

    console.log('[zephyr] create test executions ...');
    for (const item of results) {
        await client.request('post', 'testexecutions', {
            projectKey,
            testCycleKey,
            ... item
        });
    }

    EC.logGreen('[zephyr] done');

};

const createClient = function(host, ZEPHYR_SCALE_TOKEN) {
    return {
        request: async function(method, endpoint, data, args = {}) {
            let err;
            const res = await axios({
                ... args,
                method,
                url: host + endpoint,
                data,
                headers: {
                    Authorization: `Bearer ${ZEPHYR_SCALE_TOKEN}`
                }
            }).catch(function(e) {
                err = e;
            });
            if (err) {
                // console.log(err);
                EC.logRed(EC.red(`ERROR: Catch a error on endpoint: ${endpoint}`));
                EC.logRed(err.message);
                return;
            }
            return res.data;
        }
    };
};
