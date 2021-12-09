import Util from '../util/util.js';

const mixinFilter = {

    data() {
        return {
           
            nameKeywords: '',

            type: 'case',
            showGrouped: true,

            status: ''
        
        };
    },

    methods: {
        keywordsFilter(rowData) {
            if (!this.nameKeywords) {
                return true;
            }
            const arr = this.nameKeywords.toLowerCase().split(' ');
            const name = (`${rowData.title}`).toLowerCase();
            for (const item of arr) {
                if (item && name.indexOf(item) !== -1) {
                    return true;
                }
            }
            return false;
        },

        isCaseFailed(item) {
            if (!item) {
                return false;
            }
            if (item.status === item.expectedStatus) {
                return false;
            }
            return true;
        },

        getParentCase(item) {
            while (item.tg_parent) {
                if (item.tg_parent.type === 'case') {
                    return item.tg_parent;
                }
                item = item.tg_parent;
            }
        },

        hasSubCaseFailed(rowData) {
            let has = false;
            Util.forEachTree(rowData.subs, function(item) {
                if (item.type === 'suite' && item.failedCases) {
                    has = true;
                    return false;
                }
            });
            return has;
        },

        statusFilter(rowData) {
            if (!this.status) {
                return true;
            }
            if (rowData.type === 'case') {
                return this.isCaseFailed(rowData);
            }
            if (rowData.type === 'suite') {
                //sub case has failed
                return this.hasSubCaseFailed(rowData);
            }
            //step
            const parentCase = this.getParentCase(rowData);
            if (!parentCase) {
                return true;
            }
            return this.isCaseFailed(parentCase);
        },

        rowFilter(rowData) {
            const filters = [
                this.statusFilter,
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