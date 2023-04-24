import Util from '../utils/util.js';


export const getAttachment = (item) => {
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
            return getTrace(path, name);
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
            return getNetwork(path, name);
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

const getLink = (path, name, type = 'link', body = '') => {
    if (body) {
        body = `<div class="mcr-attachment-body">${body}</div>`;
    }
    return `<div class="mcr-detail-attachment mcr-attachment-${type}">
                <div class="mcr-attachment-head"><a href="${path}" target="_blank">${name}</a></div>
                ${body}
            </div>`;
};

// ================================================================================================

const getImage = (path, name) => {
    const body = `<img src="${path}" alt="${name}" />`;
    return getLink(path, name, 'image', body);
};

const getVideo = (path, name, contentType) => {
    const body = `<video controls height="350"><source src="${path}" type="${contentType}"></video>`;
    return getLink(path, name, 'video', body);
};

// ================================================================================================

const getTrace = (path, name) => {
    const protocol = window.location.protocol;
    const isOnline = ['http:', 'https:'].includes(protocol);

    const traceFile = `<a href="${path}" target="_blank">${name}</a>`;
    const traceViewer = '<a href="https://trace.playwright.dev/" target="_blank">Trace Viewer</a>';

    const traceUrl = new URL(path, window.location.href);
    const viewerUrl = `https://trace.playwright.dev/?trace=${encodeURIComponent(traceUrl)}`;

    const color = isOnline ? 'green' : 'red';
    const currentProtocol = `current protocol is <code style="color:${color}">${protocol}</code>`;

    const showReport = 'try <code>npx monocart show-report &lt;your-outputFile-path&gt;</code> start a local web server, please keep attachments and reports under the same directory.';
    const readme = `The Trace Viewer requires that the trace file must be loaded over the http:// or https:// protocols (${currentProtocol})  
            without <a href="https://developer.mozilla.org/en-US/docs/Glossary/CORS" target="_blank">CORS</a> issue,
            ${showReport}
        `;

    const ls = [];
    ls.push(`<li><a href="${viewerUrl}" target="_blank">View trace online</a> <span class="mcr-readme">${readme}</span></li>`);
    ls.push(`<li>or download the ${traceFile} file and load it on the page ${traceViewer}</li>`);

    const body = ls.join('');
    return getLink(path, name, 'trace', body);
};

// ================================================================================================

const getIstanbulSummary = (report) => {
    const files = report.files;
    const map = {
        statements: 'Statements',
        branches: 'Branches',
        functions: 'Functions',
        lines: 'Lines'
    };
    const items = [].concat(files);
    if (files.length > 1) {
        const summary = report.summary;
        summary.isSummary = true;
        summary.name = 'Summary';
        items.push(summary);
    }

    const ls = [];
    ls.push('<table>');

    ls.push('<tr class="mcr-head"><td></td><td class="mcr-column-file">File</td>');
    Object.keys(map).forEach((k) => {
        ls.push(`<td colspan="2">${map[k]}</td>`);
    });
    ls.push('</tr>');

    items.forEach((item, i) => {

        if (item.isSummary) {
            ls.push('<tr class="mcr-row-summary">');
        } else {
            ls.push('<tr>');
        }
        if (item.isSummary) {
            ls.push('<td></td>');
        } else {
            ls.push(`<td>${i + 1}</td>`);
        }
        ls.push(`<td class="mcr-column-file">${item.name}</td>`);

        Object.keys(map).forEach((k) => {
            const d = item[k] || {};
            ls.push(`<td class="mcr-${d.status}">${Util.NF(d.covered)}/${Util.NF(d.total)}</td>`);
            // low, medium, high, unknown
            ls.push(`<td class="mcr-${d.status}">${Util.PF(d.pct, 100, 2)}</td>`);
        });
        ls.push('</tr>');
    });
    ls.push('</table>');
    return ls.join('');
};


const getV8Summary = (report) => {
    const files = report.files;
    const items = [].concat(files);
    if (files.length > 1) {
        const summary = report.summary;
        summary.isSummary = true;
        summary.name = 'Summary';
        summary.type = '';
        items.push(summary);
    }

    const ls = [];
    ls.push('<table>');

    ls.push('<tr class="mcr-head"><td></td><td class="mcr-column-file">File</td>');
    ls.push('<td>Type</td><td>Total Bytes</td><td>Used Bytes</td><td>Coverage</td>');
    ls.push('</tr>');

    items.forEach((item, i) => {

        if (item.isSummary) {
            ls.push('<tr class="mcr-row-summary">');
        } else {
            ls.push('<tr>');
        }
        if (item.isSummary) {
            ls.push('<td></td>');
        } else {
            ls.push(`<td>${i + 1}</td>`);
        }
        ls.push(`<td class="mcr-column-file">${item.name}</td>`);

        ls.push(`<td>${item.type}</td>`);
        ls.push(`<td>${Util.BF(item.total)}</td>`);
        ls.push(`<td>${Util.BF(item.covered)}</td>`);
        // low, medium, high, unknown
        ls.push(`<td class="mcr-${item.status}">${Util.PF(item.pct, 100, 2)}</td>`);

        ls.push('</tr>');
    });
    ls.push('</table>');
    return ls.join('');
};

const getCoverageBody = (report) => {
    if (!report || !report.files || !report.summary) {
        return '';
    }

    if (report.type === 'istanbul') {
        return getIstanbulSummary(report);
    }

    return getV8Summary(report);
};

const getCoverage = (path, name, report) => {
    const body = getCoverageBody(report);
    return getLink(path, name, 'coverage', body);
};

// ================================================================================================

const getNetwork = (path, name) => {
    const jsonpUrl = new URL(path, window.location.href);
    const harPath = encodeURIComponent(`har/${jsonpUrl}`);
    const body = `<a href="#page=${harPath}">View HAR</a>`;
    return getLink(path, name, 'network', body);
};

