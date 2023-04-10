const axios = require('axios');
const EC = require('eight-colors');

module.exports = async (reportData, capability) => {

    // https://open.dingtalk.com/document/robots/custom-robot-access

    // do not store your discord webhook url in the source code, but pass your discord webhook url from environment variables
    const url = process.env.DINGTALK_WEBHOOK;

    const {
        name, dateH, durationH, summary
    } = reportData;

    const lines = [`## ${name}`, `> ${dateH} (${durationH})`];

    ['tests', 'passed', 'flaky', 'skipped', 'failed'].forEach((k) => {
        const item = summary[k];
        const percent = item.percent ? ` (${item.percent})` : '';
        lines.push(`- **${item.name}** ${item.value} ${percent}`);
    });

    lines.push('\n  ');

    if (summary.passed.value === summary.tests.value) {
        lines.push('✔ Congratulations! All tests passed.');
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capability.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            lines.push(`Hey ${owners.join(' ')}, please fix the failed cases and run test again.`);
        }
    }

    const data = {
        'msgtype': 'markdown',
        'markdown': {
            'title': 'test report',
            'text': lines.join('\n')
        }
    };

    const res = await axios.post(url, data).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[dingtalk] failed to post message to Teams channel');
    });

    if (res) {
        console.log(res.data);
    }

};
