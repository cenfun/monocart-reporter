const axios = require('axios');
const EC = require('eight-colors');
const JiraClient = require('jira-client');

module.exports = async (reportData, capability) => {

    // https://docs.getxray.app/display/XRAYCLOUD/REST+API
    const xray_host = 'https://xray.cloud.getxray.app/api/v2/';
    const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID;
    const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;
    const project = 'MON';

    const xrayClient = await createXrayClient(xray_host, XRAY_CLIENT_ID, XRAY_CLIENT_SECRET);
    if (!xrayClient) {
        // failed to get xray token
        return;
    }

    // https://github.com/jira-node/node-jira-client
    const JIRA_TOKEN = process.env.JIRA_TOKEN;
    const jiraClient = new JiraClient({
        protocol: 'https',
        host: 'cenfun.atlassian.net',
        username: 'cenfun@gmail.com',
        password: JIRA_TOKEN
    });

    // Step 1. Collect case keys
    EC.logCyan('[xray] collect test results ...');

    const {
        name, date, dateH, duration, durationH
    } = reportData;

    const summary = `${name} ${dateH} (${durationH})`;

    // Xray JSON format
    // https://docs.getxray.app/display/XRAYCLOUD/Using+Xray+JSON+format+to+import+execution+results
    const xrayResults = {
        info: {
            project,
            summary,
            startDate: new Date(date).toISOString(),
            finishDate: new Date(date + duration).toISOString()
        },
        tests: []
    };

    // 1. add xray key to comments
    /**
     * @xray MON-1
     */
    // test('Test case', async () => { });
    // 2. make sure the comments to be collected with visitor https://github.com/cenfun/monocart-reporter#collect-data-from-comments

    capability.forEach((item) => {
        if (item.type === 'case' && item.xray) {

            // [Xray] How to create another Test Status
            // https://docs.getxray.app/display/ProductKB/%5BXray%5D+How+to+create+another+Test+Status
            // the xray test run status are PASSED, FAILED, EXECUTING, TODO by default
            // please add FLAKY and SKIPPED to mapping playwright status
            const statusMap = {
                passed: 'PASSED',
                flaky: 'FLAKY',
                skipped: 'SKIPPED',
                failed: 'FAILED'
            };

            const status = statusMap[item.caseType];

            xrayResults.tests.push({
                testKey: item.xray,
                status
            });
        }
    });

    if (!xrayResults.tests.length) {
        EC.logRed('[xray] no test results for xray');
        return;
    }
    console.log(`[xray] got test results: ${xrayResults.tests.length}`);

    // Step 2. Import Execution Results
    // https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2
    const resExecution = await xrayClient.request('post', 'import/execution', xrayResults);
    if (!resExecution) {
        return;
    }

    const executionKey = resExecution.key;
    console.log(`[xray] test execution created: ${executionKey}`);

    // Step 3. Update Jira Issue Status to Done

    // you can find out which transition id is Done
    // const res = await jiraClient.listTransitions('MON-6');
    // console.log(res);

    // id: '11', name: 'Backlog',
    // id: '31', name: 'In Progress',
    // id: '41', name: 'Done',

    await jiraClient.transitionIssue(executionKey, {
        transition: {
            id: '41'
        }
    });

    EC.logGreen('[xray] done');

};

const createXrayClient = async (host, client_id, client_secret) => {

    // request xray token
    EC.logCyan('[xray] request xray token ...');
    let errToken;
    const resToken = await axios({
        method: 'post',
        url: `${host}authenticate`,
        data: {
            client_id,
            client_secret
        }
    }).catch(function(e) {
        errToken = e;
    });

    if (errToken) {
        EC.logRed(EC.red('ERROR: Catch a error on endpoint: authenticate'));
        EC.logRed(errToken.message);
        console.log(errToken.response && errToken.response.data);
        return;
    }

    const token = resToken.data;

    return {
        request: async function(method, endpoint, data, args = {}) {
            let err;
            const res = await axios({
                ... args,
                method,
                url: host + endpoint,
                data,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).catch(function(e) {
                err = e;
            });
            if (err) {
                //  console.log(err);
                EC.logRed(EC.red(`ERROR: Catch a error on endpoint: ${endpoint}`));
                EC.logRed(err.message);
                console.log(err.response && err.response.data);
                return;
            }
            return res.data;
        }
    };
};
