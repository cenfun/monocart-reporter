<template>
  <div class="mcr-detail">
    <div
      ref="tree"
      class="mcr-tree"
    />
  </div>
</template>
<script>
import Convert from 'ansi-to-html';
import CaseIcon from './case-icon.vue';
import Util from '../util/util.js';

const convert = new Convert({
    fg: '#333',
    bg: '#F6F8FA',
    newline: true
});


export default {

    methods: {
        update(caseItem, position) {

            //console.log('update', caseItem, position);

            if (!caseItem) {
                return;
            }

            if (caseItem === this.caseItem) {
                this.positionHandler(position);
                return;
            }

            this.caseItem = caseItem;

            this.renderTree();

            this.positionHandler(position);

        },

        renderTree() {

            const list = [];

            //suites
            let suite = this.caseItem.parent;
            while (suite) {
                list.push(suite);
                suite = suite.parent;
            }
            list.reverse();

            //case
            list.push(this.caseItem);

            //steps
            this.generateSteps(list, this.caseItem.steps);

            let left = 0;
            const ls = list.map((item) => {
                left = item.level * 10;
                const head = this.renderItemHead(item);
                const body = this.renderItemBody(item);

                const cls = ['mcr-item'];
                if (item.classMap) {
                    cls.push(item.classMap);
                }

                return `<div class="${cls.join(' ')}" style="margin-left:${left}px;">
                  ${head}
                  ${body}
                </div>`;
            });

            this.$refs.tree.innerHTML = ls.join('');

        },

        renderItemHead(item) {

            const cls = ['mcr-item-head', `mcr-item-${item.type}`, 'vui-flex-row'];

            const list = [];
            if (item.level) {
                list.push('<div class="mcr-item-next">└</div>');
            }

            if (item.type === 'case') {

                const div = document.createElement('div');
                CaseIcon.createComponent({
                    caseItem: item
                }, null, div);

                list.push(div.innerHTML);
            }

            list.push(`<div class="mcr-item-title vui-flex-auto">${item.title}</div>`);

            if (item.duration) {
                list.push(`<div class="mcr-item-duration">${Util.DTF(item.duration)}</div>`);
            }
            if (item.location) {
                list.push(`<div class="mcr-item-location">${item.location}</div>`);
            }
            const head = list.join('');

            return `<div class="${cls.join(' ')}">
              ${head}
            </div>`;
        },

        renderItemBody(item) {
            if (item.type === 'suite') {
                return '';
            }

            const errors = this.renderItemErrors(item);
            const logs = this.renderItemLogs(item);
            const attachments = this.renderItemAttachments(item);

            const list = [errors, logs, attachments].filter((it) => it);
            if (!list.length) {
                return '';
            }

            return `<div class="mcr-item-body">
                ${list.join('')}
            </div>`;
        },


        renderItemErrors(item) {
            const errors = item.errors;
            if (!Util.isList(errors)) {
                return '';
            }

            const list = errors.map((err) => {
                return this.convertHtml(err);
            });

            let title = '';
            if (item.type === 'case') {
                title = '<a name="errors"></a><h3># Errors</h3>';
            }

            return `<div class="mcr-item-errors">
                ${title}
                <p>${list.join('</p><p>')}</p>
            </div>`;
        },

        renderItemLogs(item) {
            const logs = item.logs;
            if (!Util.isList(logs)) {
                return '';
            }

            const list = logs.map((log) => {
                return this.convertHtml(log);
            });

            let title = '';
            if (item.type === 'case') {
                title = '<a name="logs"></a><h3># Logs</h3>';
            }

            return `<div class="mcr-item-logs">
                ${title}
                <p>${list.join('</p><p>')}</p>
            </div>`;

        },

        renderItemAttachments(item) {
            const attachments = item.attachments;
            if (!Util.isList(attachments)) {
                return '';
            }

            const list = attachments.map((attachment) => {
                console.log(attachment);

                //contentType 'application/json' 'image/png' 'video/webm'
                const contentType = attachment.contentType;
                if (contentType) {
                    if (contentType.startsWith('image')) {
                        return `<p class="mcr-item-image">
                            <a href="${attachment.path}" target="_blank"><img src="${attachment.path}" alt="${attachment.name}" /></a>
                        </p>`;
                    } else if (contentType.startsWith('video')) {
                        return `<p class="mcr-item-video">
                            <video controls height="350">
                                <source src="${attachment.path}" type="${contentType}">
                                <p>Your browser doesn't support HTML5 video. Here is a <a href="${attachment.path}" target="_blank">link to the ${attachment.name}</a> instead.</p>
                            </video>
                        </p>`;
                    }
                }

                return `<p class="mcr-item-link">
                  <a href="${attachment.path}" target="_blank">${attachment.name}</a>
                </p>`;
            });

            let title = '';
            if (item.type === 'case') {
                title = '<a name="attachments"></a><h3># Attachments</h3>';
            }

            return `<div class="mcr-item-attachments">
                ${title}
                ${list.join('')}
            </div>`;

        },

        generateSteps(list, steps) {
            if (!Util.isList(steps)) {
                return;
            }
            steps.forEach((item) => {
                list.push(item);
                this.generateSteps(list, item.subs);
            });
        },

        convertHtml(str) {

            // link
            // const re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-./?%&=]*)?)/gi;
            // str = str.replace(re, function(a) {
            //     return `<a href="${a}" target="_blank">${a}</a>`;
            // });

            str = convert.toHtml(str);

            return str;
        },


        positionHandler(position) {

            //console.log('position', position);

            clearTimeout(this.timeout_position);

            if (!position) {
                this.$el.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            //wait for rendered like image
            this.timeout_position = setTimeout(() => {
                this.renderPosition(position);
            }, 100);

        },

        renderPosition(position) {
            const elem = this.$el.querySelector(`[name="${position}"]`);
            if (!elem) {
                return;
            }

            elem.scrollIntoView({
                behavior: 'smooth'
            });

        }

    }
};
</script>
<style lang="scss">
.mcr-detail {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}

.mcr-tree {
    padding: 0 0 10px 10px;
}

.mcr-item {
    border-bottom: thin solid #ccc;
}

.mcr-item-head {
    padding: 8px 10px 8px 0;
    opacity: 0.8;
    cursor: default;

    .mcr-icon {
        margin-right: 5px;
    }
}

.mcr-item-head:hover {
    opacity: 1;
}

.mcr-item-next {
    padding-right: 5px;
}

.tg-case-failed {
    background-color: var(--bg-failed);
    border: none;
}

.tg-case-flaky {
    background-color: var(--bg-flaky);
    border: none;
}

.tg-case-skipped {
    color: #999;
}

.tg-step-retry {
    color: orange;
}

.tg-step-error {
    color: red;
}

.mcr-item-suite .mcr-item-title {
    font-weight: bold;
}

.mcr-item-location {
    font-size: 13px;
    padding-left: 10px;
}

.mcr-item-body {
    padding: 0 10px 10px;

    > *:last-child {
        margin-bottom: 0;
    }

    h3 {
        padding: 5px 0;
        margin: 0;
    }
}

.mcr-item-errors,
.mcr-item-logs {
    background-color: #f6f8fa;
    color: #333;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    overflow-x: auto;

    p {
        white-space: pre;
        font-family: Menlo, Consolas, monospace;
        line-height: initial;
    }
}

.mcr-item-attachments {
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    background-color: #f6f8fa;
}

.mcr-item-image {
    a {
        display: block;
    }

    img {
        max-height: 350px;
        display: block;
    }
}

.mcr-detail-head {
    font-size: 16px;
    font-weight: bold;
    border-bottom: thin solid #ccc;
    padding: 10px;
}

.mcr-detail-body {
    padding: 10px;
}

.mcr-error {
    overflow: auto;
}

</style>
