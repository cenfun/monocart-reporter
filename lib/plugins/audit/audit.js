const fs = require('fs');
const path = require('path');
const EC = require('eight-colors');
const Util = require('../../utils/util.js');

const getStatus = (s) => {
    if (s < 0.5) {
        return 'low';
    }
    if (s < 0.9) {
        return 'medium';
    }
    return 'high';
};

const getSummaryReport = (lhr) => {
    const summary = {};

    const props = [
        'lighthouseVersion',
        'requestedUrl',
        'fetchTime'
    ];
    props.forEach((k) => {
        summary[k] = lhr[k];
    });

    const audits = lhr.audits;
    const categories = lhr.categories;
    const performanceAudits = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index'
    ];

    summary.categories = Object.keys(categories).map((k) => {
        const category = categories[k];
        const item = {
            name: category.title,
            score: category.score,
            status: getStatus(category.score),
            value: '',
            description: category.description || ''
        };
        if (k === 'performance') {
            item.metrics = performanceAudits.map((id) => {
                const it = audits[id];
                return {
                    name: it.title,
                    score: it.score,
                    status: getStatus(it.score),
                    value: it.displayValue,
                    description: it.description || ''
                };
            });
        }

        return item;
    });

    return summary;
};

const attachAuditReport = async (runnerResult, testInfo, options = {}) => {

    if (!runnerResult || !runnerResult.lhr || !runnerResult.report) {
        EC.logRed('[MCR] invalid lighthouse runner result');
        return;
    }

    const title = options.title || `Lighthouse Report - ${testInfo.title}`;

    options = {
        title,
        outputDir: Util.resolveOutputDir(testInfo),
        outputName: `audit-${Util.shortTestId(testInfo.testId)}`,

        ... options
    };

    const htmlDir = path.resolve(options.outputDir, options.outputName);
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, {
            recursive: true
        });
    }
    options.htmlDir = htmlDir;

    // `.lhr` is the Lighthouse Result as a JS object
    const report = {
        title,
        ... getSummaryReport(runnerResult.lhr)
    };

    const htmlPath = path.resolve(htmlDir, 'index.html');
    // `.report` is the HTML report as a string
    await Util.writeFile(htmlPath, runnerResult.report);

    const definition = Util.attachments.audit;

    const reportPath = path.resolve(htmlDir, definition.reportFile);
    Util.writeJSONSync(reportPath, report);

    testInfo.attachments.push({
        name: definition.name,
        contentType: definition.contentType,
        path: path.resolve(htmlDir, 'index.html')
    });

    return report;
};


module.exports = {
    attachAuditReport
};
