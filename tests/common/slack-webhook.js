const { IncomingWebhook } = require('@slack/webhook');
const EC = require('eight-colors');
module.exports = async (reportData, capacity) => {

    // send notifications to a single channel which the user picks on installation
    // Sending messages using Incoming Webhooks: https://api.slack.com/messaging/webhooks

    // do not store your slack webhook url in the source code
    // but pass your slack webhook url from environment variables, like: const url = process.env.SLACK_WEBHOOK_URL;
    const url = 'https://hooks.slack.com/services/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';

    const {
        name, dateH, durationH, summary
    } = reportData;

    // Creating interactive messages: https://api.slack.com/messaging/interactivity
    const message = {
        blocks: [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${name}* ${dateH} (${durationH})`
            }
        }, {
            type: 'divider'
        }, {
            type: 'section',
            // no more than 10 fields
            fields: ['tests', 'passed', 'flaky', 'skipped', 'failed'].map((k) => {
                const item = summary[k];
                const percent = item.percent ? ` (${item.percent})` : '';
                return {
                    type: 'mrkdwn',
                    text: `*${item.name}:* ${item.value} ${percent}`
                };
            })
        }]
    };

    if (summary.passed.value === summary.tests.value) {
        message.blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '✔ Congratulations! All tests passed.'
            }
        });
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capacity.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            message.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hey ${owners.join(' ')}, please fix the failed cases and run test again.`
                }
            });
        }
    }

    // console.log(JSON.stringify(message));

    // https://slack.dev/node-slack-sdk/webhook
    const webhook = new IncomingWebhook(url);
    await webhook.send(message).catch((err) => {
        EC.logRed(err.message);
        EC.logRed('[slack] failed to send notifications to slack channel');
    });

};
