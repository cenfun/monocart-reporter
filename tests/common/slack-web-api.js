const path = require('path');
const { chromium } = require('@playwright/test');
const { WebClient } = require('@slack/web-api');
const EC = require('eight-colors');
const { delay } = require('../common/util.js');

module.exports = async (reportData, capability) => {

    // https://slack.dev/node-slack-sdk/web-api
    // do not store your slack token in the source code, but pass your slack token from environment variables
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);

    const {
        name, dateH, durationH, summary, htmlPath
    } = reportData;


    // ==========================================================================
    console.log('[slack] Step 1 - Take a screenshot from report ... ');

    const browser = await chromium.launch({
        // headless: false
    });
    const page = await browser.newPage();
    await page.setViewportSize({
        width: 860,
        height: 1060
    });
    await page.goto(path.resolve(htmlPath));
    await page.evaluate(() => {
        location.hash = 'page=report';
        window.postMessage({
            flyoverWidth: '100%'
        });
    });
    await delay(500);
    const screenshot = await page.screenshot({
        fullPage: true
    });
    await page.close();
    await browser.close();


    // ==========================================================================
    console.log('[slack] Step 2 - Upload image to Slack ... ');

    // API method: files.upload with no special arguments, but make sure to get the file ID from the response.
    // Don't include the channels argument or the image will be posted visible into those channel.

    // Given some known conversation ID (representing a public channel, private channel, DM or group DM)
    const channelId = 'C050T9D1CH5';

    await web.files.uploadV2({
        initial_comment: 'Here is the test report',
        channel_id: channelId,
        file_uploads: [{
            file: screenshot,
            filename: `${name}-${dateH}.png`
        }]
    }).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[slack] failed to upload file');
    });


    // ==========================================================================
    console.log('[slack] Step 4 - Send message to channel ... ');

    // Creating interactive messages: https://api.slack.com/messaging/interactivity
    const message = {
        channel: channelId,
        text: name,
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
                const icons = {
                    tests: '🧪',
                    passed: '✅',
                    failed: '❌',
                    skipped: '⏭️',
                    flaky: '⚠️'
                };
                const item = summary[k];
                const percent = item.percent ? ` (${item.percent})` : '';
                return {
                    type: 'mrkdwn',
                    text: `${icons[k]} *${item.name}:* ${item.value} ${percent}`
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
        capability.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {

            // replace owner name to slack member id
            const users = await web.users.list();
            users.members.forEach((member) => {
                owners.forEach((owner, i) => {
                    if (owner === member.real_name) {
                        owners[i] = `<@${member.id}>`;
                    }
                });
            });

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
    await web.chat.postMessage(message).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed(`[slack] failed to post message to channel ${channelId}`);
    });

};
