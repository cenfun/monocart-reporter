const Testrail = require('testrail-api');
const EC = require('eight-colors');

const createClient = function(options) {
    const testrailApi = new Testrail(options);
    return {
        request: async function() {
            const args = Array.from(arguments);
            const name = args.shift();
            const fun = testrailApi[name];
            let err;
            const res = await fun.apply(testrailApi, args).catch(function(e) {
                err = e;
            });
            if (err) {
                EC.logRed(EC.red(`ERROR: Catch a error on: ${name}`));
                EC.logRed(err.message && err.message.error);
                return;
            }
            return res.body;
        }
    };
};

module.exports = async (reportData, capacity) => {

    const options = {
        host: 'https://cenfun.testrail.io',
        user: '',
        password: ''
    };

    if (!options.user) {
        return;
    }

    const client = createClient(options);

    EC.logCyan('[testrail] collect test results ...');
    const results = [];

    // add testrail case id to comments
    /**
     * @testrail 2126
     */
    // test('Test case', async () => { });

    capacity.forEach((item) => {
        if (item.type === 'case' && item.testrail) {
            // 1 Passed
            // 5 Failed
            const status_id = item.ok ? 1 : 5;
            results.push({
                case_id: item.testrail,
                status_id: status_id,
                comment: ''
            });
        }
    });

    if (!results.length) {
        EC.logRed('[testrail] no test results for testrail');
        return;
    }
    console.log(`[testrail] got test results: ${results.length}`);

    const projectId = 2;
    console.log(`[testrail] getting project info: ${projectId} ...`);
    const project = await client.request('getProject', projectId);
    if (!project) {
        return;
    }
    console.log(`[testrail] got project: ${project.name}`);

    const testRunName = `[${reportData.dateH}] ${reportData.name}`;
    console.log(`[testrail] add test run: ${testRunName} ...`);

    const run = await client.request('addRun', projectId, {
        name: testRunName,
        description: testRunName
        // include_all: false,
        // case_ids: []
    });
    if (!run) {
        return;
    }
    console.log(`[testrail] test run added: ${run.name}`);

    console.log('[testrail] add results for cases ...');
    const added = await client.request('addResultsForCases', run.id, results);
    if (!added) {
        return;
    }
    console.log('[testrail] close run ...');
    const closed = await client.request('closeRun', run.id);
    if (!closed) {
        return;
    }
    EC.logGreen('[testrail] completed');

};