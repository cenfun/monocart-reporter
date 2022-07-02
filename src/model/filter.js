import Util from '../util/util.js';

const mixinFilter = {

    methods: {
        keywordsFilter(rowData) {
            if (!this.keywords) {
                return true;
            }
            const arr = this.keywords.toLowerCase().split(' ');
            const name = (`${rowData.title}`).toLowerCase();
            for (const item of arr) {
                if (item && name.indexOf(item) !== -1) {
                    return true;
                }
            }
            return false;
        },

        isCaseMatch(item, result) {
            if (!item) {
                return false;
            }
            const maps = {
                failed: 'unexpected',
                skipped: 'skipped',
                flaky: 'flaky',
                passed: 'expected'
            };
            if (item.outcome === maps[result]) {
                return true;
            }
            return false;
        },

        hasSubCaseMatch(rowData, result) {
            let has = false;
            Util.forEachTree(rowData.subs, (item) => {
                if (item.type === 'case' && this.isCaseMatch(item, result)) {
                    has = true;
                    return false;
                }
            });
            return has;
        },

        getParentCase(item) {
            while (item.tg_parent) {
                if (item.tg_parent.type === 'case') {
                    return item.tg_parent;
                }
                item = item.tg_parent;
            }
        },

        resultFilter(rowData) {
            if (!this.result) {
                return true;
            }
            //failed, skipped, flaky, passed
            if (rowData.type === 'case') {
                return this.isCaseMatch(rowData, this.result);
            }
            if (rowData.type === 'suite') {
                //sub case has failed
                return this.hasSubCaseMatch(rowData, this.result);
            }
            //if step, find parent case first
            const parentCase = this.getParentCase(rowData);
            if (!parentCase) {
                return true;
            }
            return this.isCaseMatch(parentCase, this.result);
        },

        rowFilter(rowData) {
            const filters = [
                this.resultFilter,
                this.keywordsFilter
            ];
            for (const item of filters) {
                const res = item.call(this, rowData);
                if (!res) {
                    return false;
                }
            }
            return true;
        }
    }
};

export default mixinFilter;
