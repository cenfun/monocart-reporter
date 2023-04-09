const path = require('path');
const { chromium } = require('@playwright/test');
const axios = require('axios');
const EC = require('eight-colors');
const { delay } = require('../common/util.js');

module.exports = async (reportData, capability) => {

    // https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=dotnet

    // do not store your discord webhook url in the source code, but pass your discord webhook url from environment variables
    const url = process.env.TEAMS_WEBHOOK;

    const {
        name, dateH, durationH, summary, htmlPath
    } = reportData;

    // dataUrl image can NOT zoomin in Teams https://github.com/MicrosoftDocs/msteams-docs/issues/7427
    // so just take a small screenshot on pie chart
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

    const pie = page.locator('.mcr-pie-chart svg');
    const screenshot = await pie.screenshot();
    await page.close();
    await browser.close();

    // console.log(dataUrl);
    const dataUrl = `data:image/png;base64,${screenshot.toString('base64')}`;

    const title = `${name} ${dateH} (${durationH})`;

    const facts = ['tests', 'passed', 'flaky', 'skipped', 'failed'].map((k) => {
        const item = summary[k];
        const percent = item.percent ? ` (${item.percent})` : '';
        return {
            title: item.name,
            value: `${item.value} ${percent}`
        };
    });


    let description = '';
    if (summary.passed.value === summary.tests.value) {
        description = '✔ Congratulations! All tests passed.';
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capability.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            description = `Hey ${owners.join(' ')}, please fix the failed cases and run test again.`;
        }
    }

    // https://adaptivecards.io/explorer/AdaptiveCard.html
    const data = {
        'type': 'message',
        'attachments': [{
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                'type': 'AdaptiveCard',
                'body': [{
                    'type': 'TextBlock',
                    'size': 'medium',
                    'weight': 'bolder',
                    'text': title,
                    'style': 'heading',
                    'wrap': true
                }, {
                    'type': 'Image',
                    'url': dataUrl,
                    'width': '360px',
                    'msTeams': {
                        'allowExpand': true
                    }
                }, {
                    'type': 'FactSet',
                    'facts': facts
                }, {
                    'type': 'TextBlock',
                    'text': description,
                    'wrap': true
                }],
                '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                'version': '1.2'
            }
        }]
    };

    await axios.post(url, data).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed('[discord] failed to post message to Teams channel');
    });

};
