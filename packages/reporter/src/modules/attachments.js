import Util from '../utils/util.js';
import generateWaterfallChart from './waterfall.js';
import { markdownFormatter } from './formatters.js';

export const getAttachment = (item, options) => {
    // console.log(attachment);
    // contentType 'application/json' 'image/png' 'video/webm'
    const {
        contentType, name, path
    } = item;

    const list = [{
        condition: () => {
            return contentType.startsWith('image');
        },
        handler: () => {
            return getImage(path, name);
        }
    }, {
        condition: () => {
            return contentType.startsWith('video');
        },
        handler: () => {
            return getVideo(path, name, contentType);
        }
    }, {
        condition: () => {
            return name === 'trace' && contentType === 'application/zip';
        },
        handler: () => {
            return getTrace(path, name, options);
        }
    }, {
        condition: () => {
            const definition = Util.attachments.audit;
            return name === definition.name && contentType === definition.contentType;
        },
        handler: () => {
            return getAudit(path, name, item.report);
        }
    }, {
        condition: () => {
            const definition = Util.attachments.coverage;
            return name === definition.name && contentType === definition.contentType;
        },
        handler: () => {
            return getCoverage(path, name, item.report);
        }
    }, {
        condition: () => {
            const definition = Util.attachments.network;
            return name === definition.name && contentType === definition.contentType;
        },
        handler: () => {
            return getNetwork(path, name, item.report);
        }
    }];

    if (contentType) {
        const res = list.find((it) => it.condition());
        if (res) {
            return res.handler();
        }
    }
    return getLink(path, name);
};

const getLink = (path, name, title = '', type = 'link', body = '') => {
    if (body) {
        body = `<div class="mcr-attachment-body">${body}</div>`;
    }
    return `<div class="mcr-detail-attachment mcr-attachment-${type}">
                <div class="mcr-attachment-head"><a href="${path}" target="_blank" class="mcr-item">${name}</a> ${title}</div>
                ${body}
            </div>`;
};

// ================================================================================================

const getImage = (path, name) => {
    const body = `<a href="${path}" target="_blank"><img src="${path}" alt="${name}" /></a>`;
    return getLink(path, name, '', 'image', body);
};

const getVideo = (path, name, contentType) => {
    const body = `<video controls height="350"><source src="${path}" type="${contentType}"></video>`;
    return getLink(path, name, '', 'video', body);
};

// ================================================================================================

const getTrace = (path, name, options) => {
    const defaultUrl = 'https://trace.playwright.dev/?trace={traceUrl}';
    const traceViewerUrl = options.traceViewerUrl || defaultUrl;

    const protocol = window.location.protocol;
    const isOnline = ['http:', 'https:'].includes(protocol);

    const traceFile = `<a href="${path}" target="_blank">${name}</a>`;
    const traceViewer = '<a href="https://trace.playwright.dev/" target="_blank">Trace Viewer</a>';

    const traceUrl = new URL(path, window.location.href);
    const viewerUrl = Util.replace(traceViewerUrl, {
        traceUrl: encodeURIComponent(traceUrl)
    });

    const color = isOnline ? 'green' : 'red';
    const currentProtocol = `current protocol is <code style="color:${color}">${protocol}</code>`;

    const showReport = 'try <code>npx monocart show-report &lt;your-outputFile-path&gt;</code> start a local web server, please keep attachments and reports under the same directory.';
    const readme = `The ${traceViewer} requires that the ${traceFile} file must be loaded over the http:// or https:// protocols (${currentProtocol})  
            without <a href="https://developer.mozilla.org/en-US/docs/Glossary/CORS" target="_blank">CORS</a> issue,
            ${showReport}
        `;

    const ls = [];
    ls.push('<div class="mcr-trace-details">');
    ls.push(`<div><a class="mcr-icon-link" href="${viewerUrl}" target="_blank">View trace</a></div>`);
    ls.push('<details>');
    ls.push('<summary>NOTE</summary>');

    ls.push('<dl class="mcr-readme">');
    ls.push(`<dd class="mcr-item">${readme}</dd>`);
    ls.push(`<dd class="mcr-item">or download the ${traceFile} file and load it to the page ${traceViewer} manually.</dd>`);
    ls.push(`<dd class="mcr-item">or customize a trace viewer url with option <code>traceViewerUrl: "${defaultUrl}"</code>.</dd>`);
    ls.push('</dl>');

    ls.push('</details>');
    ls.push('</div">');

    const body = ls.join('');
    return getLink(path, name, '', 'trace', body);
};

// ================================================================================================

const getAuditBody = (report) => {
    if (!report || !report.categories) {
        return '';
    }

    const ls = [];
    ls.push('<table>');

    ls.push('<tr class="mcr-head">');
    ls.push('<td class="mcr-column-left">Name</td><td>Score</td><td></td><td></td>');
    ls.push('</tr>');

    report.categories.forEach((item, i) => {

        ls.push('<tr>');
        ls.push(`<td class="mcr-column-left"><b>${item.name}</b></td>`);
        ls.push(`<td class="mcr-${item.status}">${Util.PNF(item.score)}</td>`);
        ls.push(`<td>${item.value}</td>`);
        ls.push(`<td class="mcr-column-description">${markdownFormatter(item.description, true)}</td>`);
        ls.push('</tr>');

        if (item.metrics) {
            item.metrics.forEach((sub) => {
                ls.push('<tr>');
                ls.push(`<td class="mcr-column-left mcr-column-sub">${sub.name}</td>`);
                ls.push(`<td class="mcr-${sub.status}">${Util.PNF(sub.score)}</td>`);
                ls.push(`<td>${sub.value}</td>`);
                ls.push(`<td class="mcr-column-description">${markdownFormatter(sub.description, true)}</td>`);
                ls.push('</tr>');
            });
        }

    });

    ls.push('</table>');
    return ls.join('');
};

const getAudit = (path, name, report) => {
    const body = getAuditBody(report);
    return getLink(path, name, report.title, 'audit', body);
};

// ================================================================================================

const addCoverageGroup = (list, item) => {
    list.push('<div class="mcr-attachment-group">');
    list.push(`<div title="${item.totalTitle}"><b>${item.name}</b> ${Util.NF(item.total)}</div>`);
    list.push(`<div title="${item.coveredTitle}">Covered: <span class="${item.coveredClass}">${Util.NF(item.covered)}</span></div>`);
    list.push(`<div title="${item.uncoveredTitle}">Uncovered: <span class="${item.uncoveredClass}">${Util.NF(item.uncovered)}</span></div>`);

    list.push(`<div style="width:100px;">${item.percentChart}</div>`);
    list.push(`<div style="padding:0 5px;" class="mcr-${item.status}">${Util.PF(item.pct, 100)}</div>`);

    list.push('</div>');
};

const getIstanbulSummary = (report, list) => {

    const map = {
        statements: 'Statements',
        branches: 'Branches',
        functions: 'Functions',
        lines: 'Lines'
    };

    const summary = report.summary;
    // console.log(summary);

    Object.keys(map).forEach((k) => {
        const item = summary[k];
        if (!item) {
            return;
        }

        item.name = map[k];
        item.totalTitle = '';

        item.coveredTitle = '';
        item.coveredClass = item.covered > 0 ? 'mcr-covered' : '';

        // only covered in istanbul
        item.uncovered = item.total - item.covered;
        item.uncoveredTitle = '';
        item.uncoveredClass = item.uncovered > 0 ? 'mcr-uncovered' : '';

        item.percentChart = Util.generatePercentChart(item.pct);

        addCoverageGroup(list, item);

    });

    return list.join('');
};


const getV8Summary = (report, list) => {

    const item = report.summary;

    item.name = 'Bytes';
    item.totalTitle = `Total ${Util.BSF(item.total)}`;

    item.coveredTitle = `Covered ${Util.BSF(item.covered)}`;
    item.coveredClass = item.covered > 0 ? 'mcr-covered' : '';

    item.uncoveredTitle = `Uncovered ${Util.BSF(item.uncovered)}`;
    item.uncoveredClass = item.uncovered > 0 ? 'mcr-uncovered' : '';

    item.percentChart = Util.generatePercentChart(item.pct);

    addCoverageGroup(list, item);

    return list.join('');
};

const getCoverageBody = (report) => {
    if (!report || !report.files || !report.summary) {
        return '';
    }

    const list = [];
    list.push('<div class="mcr-attachment-group">');
    list.push(`<div><b>Files</b> <span class="mcr-num">${Util.NF(report.files.length)}</span></div>`);
    list.push(`<div><b>Type</b> ${report.type}</div>`);
    list.push('</div>');

    if (report.type === 'istanbul') {
        return getIstanbulSummary(report, list);
    }

    return getV8Summary(report, list);
};

const getCoverage = (path, name, report) => {
    const body = getCoverageBody(report);
    return getLink(path, name, report.title, 'coverage', body);
};

// ================================================================================================

const getNetworkBody = (report) => {
    if (!report) {
        return '';
    }

    const {
        summary, pages, browser, creator
    } = report;

    if (!Util.isList(pages)) {
        return '';
    }

    const list = [];

    pages.forEach((page, i) => {
        const { onContentLoad, onLoad } = page.pageTimings;
        const title = page.title;
        let number = '';
        if (pages.length > 1) {
            number = ` ${i + 1}`;
        }
        list.push('<div class="mcr-attachment-group">');
        list.push(`<div><b>Page${number}</b></div>`);
        list.push(`<div>${title}</div>`);

        if (onContentLoad > 0) {
            list.push(`<div style="color:#1A1AA6;">ContendLoaded ${Util.TF(onContentLoad)}</div>`);
        }

        if (onLoad > 0) {
            list.push(`<div style="color:#C80000;">Load ${Util.TF(onLoad)}</div>`);
        }

        const waterfall = summary.waterfalls[page.id];
        list.push(`<div>Duration ${Util.TF(waterfall.time)}</div>`);

        list.push('</div>');

        const waterfallChart = generateWaterfallChart(waterfall);
        list.push('<div class="mcr-attachment-group">');
        list.push(`<div class="mcr-network-waterfall">${waterfallChart}</div>`);
        list.push('</div>');
    });

    list.push('<div class="mcr-attachment-group">');
    list.push(`<div><b>Requests</b> <span class="mcr-num">${summary.requests}</span></div>`);
    list.push(`<div><b>Transferred</b> ${Util.BF(summary.size)}</div>`);
    list.push('</div>');

    list.push('<div class="mcr-attachment-group">');
    list.push('<div><b>Status</b></div>');
    Object.keys(summary.status).forEach((k) => {
        let s = `${k}`;
        if (s.startsWith('2')) {
            s = `<span style="color:green;">${s}</span>`;
        } else if (s.startsWith('4')) {
            s = `<span style="color:red;">${s}</span>`;
        }
        list.push(`<div>${s} <span class="mcr-num">${summary.status[k]}</span></div>`);
    });
    list.push('</div>');

    list.push('<div class="mcr-attachment-group">');
    list.push('<div><b>Method</b></div>');
    Object.keys(summary.methods).forEach((k) => {
        list.push(`<div>${k} <span class="mcr-num">${summary.methods[k]}</span></div>`);
    });
    list.push('</div>');


    list.push('<div class="mcr-attachment-group">');
    if (browser) {
        list.push(`<div><b>Browser</b> ${browser.name} v${browser.version}</div>`);
    }
    if (creator) {
        list.push(`<div><b>Creator</b> ${creator.name} v${creator.version}</div>`);
    }
    list.push('</div>');


    const body = list.join('');

    return body;
};

const getNetwork = (path, name, report) => {
    const body = getNetworkBody(report);
    return getLink(path, name, report.title, 'network', body);
};

