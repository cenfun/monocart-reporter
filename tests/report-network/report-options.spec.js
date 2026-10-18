const fs = require('fs');
const path = require('path');
const { inflateSync } = require('lz-utils');
const { test, expect } = require('@playwright/test');
const { attachNetworkReport } = require('monocart-reporter');

const har = Buffer.from(JSON.stringify({
    log: {
        version: '1.2',
        creator: {
            name: 'report-options-test',
            version: '1'
        },
        pages: [],
        entries: []
    }
}));

const cases = [{
    label: 'default',
    options: {}
}, {
    label: 'name fallback',
    options: {
        name: 'Custom network report'
    },
    expected: 'Custom network report'
}, {
    label: 'title',
    options: {
        title: 'Custom network title'
    },
    expected: 'Custom network title'
}, {
    label: 'title takes precedence',
    options: {
        title: 'Preferred title',
        name: 'Ignored alias'
    },
    expected: 'Preferred title'
}, {
    label: 'escaped title',
    options: {
        title: 'Network "QA" & <dev>'
    },
    expected: 'Network "QA" & <dev>',
    escaped: 'Network &quot;QA&quot; &amp; &lt;dev&gt;'
}];

for (const item of cases) {
    test(`network report options: ${item.label}`, async () => {
        const testInfo = test.info();
        const report = await attachNetworkReport(har, testInfo, item.options);
        const expected = item.expected || `Network Report - ${testInfo.title}`;
        expect(report.title).toBe(expected);
        const htmlPath = testInfo.attachments[0].path;
        const reportDir = path.dirname(htmlPath);
        const saved = JSON.parse(fs.readFileSync(path.join(reportDir, 'network-report.json'), 'utf8'));
        expect(saved.title).toBe(expected);
        expect(saved).not.toHaveProperty('name');
        const dataScript = fs.readFileSync(path.join(reportDir, 'network-data.js'), 'utf8');
        const compressed = dataScript.match(/^window\.reportData = '([^']+)';$/);
        expect(compressed).not.toBeNull();
        const data = JSON.parse(inflateSync(compressed[1]));
        expect(data.title).toBe(expected);
        expect(data).not.toHaveProperty('name');
        const html = fs.readFileSync(htmlPath, 'utf8');
        const title = item.escaped || expected;
        expect(html).toContain(`<title>${title}</title>`);
        expect(html).toContain(`<meta property="og:title" content="${title}">`);
        expect(html).toContain(`<meta name="twitter:title" content="${title}">`);
    });
}
