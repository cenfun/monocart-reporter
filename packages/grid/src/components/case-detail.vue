<template>
  <div class="prg-detail">
    <div
      ref="tree"
      class="prg-tree"
    />
  </div>
</template>
<script>
import Util from '../util/util.js';

export default {

    data: function() {
        return {

        };
    },

    methods: {
        update(caseItem, position) {
            if (!caseItem) {
                return;
            }

            if (caseItem === this.caseItem) {
                return;
            }

            this.caseItem = caseItem;
            this.position = position;

            this.renderTree();
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
                return `<div class="prg-item" style="margin-left:${left}px;">
                  ${head}
                  ${body}
                </div>`;
            });

            this.$refs.tree.innerHTML = ls.join('');

        },

        renderItemHead(item) {

            const loc = item.location || '';
            let title = item.title;
            if (item.level) {
                title = `└ ${title}`;
            }

            return `<div class="prg-item-head prg-item-${item.type} vui-flex-row">
              <div class="prg-item-title vui-flex-auto">${title}</div>
              <div>${loc}</div>
            </div>`;
        },

        renderItemBody(item) {
            if (item.type === 'suite') {
                return '';
            }

            const errors = this.renderItemErrors(item);
            const logs = this.renderItemLogs(item);
            const attachments = this.renderItemAttachments(item);

            return `<div class="prg-item-body">
                ${errors}
                ${logs}
                ${attachments}
            </div>`;
        },


        renderItemErrors(item) {
            const errors = item.errors;
            if (!Util.isList(errors)) {
                return '';
            }

            const list = errors.map((err) => {
                const ls = [];

                if (err.stack) {
                    ls.push(`<div class="prg-error">${Util.CH(err.stack)}</div>`);
                } else if (err.message) {
                    ls.push(`<div class="prg-error">${Util.CH(err.message)}</div>`);
                }

                return ls.join('');
            });

            return list.join('');
        },

        renderItemLogs(item) {
            const logs = item.logs;
            if (!Util.isList(logs)) {
                return '';
            }

            const list = logs.map((log) => {
                return Util.CH(log);
            });

            return list.join('');

        },

        renderItemAttachments(item) {
            const attachments = item.attachments;
            if (!Util.isList(attachments)) {
                return '';
            }

            const list = attachments.map((attachment) => {
                const contentType = attachment.contentType;
                //contentType 'application/json' or 'image/png'.
                if (contentType && contentType.startsWith('image')) {
                    return `<div class="prg-item-image">
                      <img src="${attachment.path}" alt="${attachment.name}" />
                    </div>`;
                }

                return `<div class="prg-item-link">
                  <a href="${attachment.path}" target="_blank">${attachment.name}</a>
                </div>`;
            });

            return list.join('');

        },

        generateSteps(list, steps) {
            if (!Util.isList(steps)) {
                return;
            }
            steps.forEach((item) => {
                list.push(item);
                this.generateSteps(list, item.subs);
            });
        }

    }
};
</script>
<style lang="scss">
.prg-detail {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
}

.prg-tree {
    padding: 0 0 10px 10px;
}

.prg-item {
    border-bottom: thin solid #ccc;
}

.prg-item:hover {
    background-color: #f5f5f5;
}

.prg-item-head {
    padding: 5px 10px 5px 0;
}

.prg-item-suite .prg-item-title {
    font-weight: bold;
}

.prg-item-body {
    margin-left: 15px;
}

.prg-detail-head {
    font-size: 16px;
    font-weight: bold;
    border-bottom: thin solid #ccc;
    padding: 10px;
}

.prg-detail-body {
    padding: 10px;
}

.prg-error {
    overflow: auto;
}

</style>
