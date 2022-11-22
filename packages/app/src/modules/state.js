import { shallowReactive } from 'vue';

const state = shallowReactive({
    title: '',
    date: '',
    titlePlaywright: '',
    titleReporter: `Monocart Reporter v${window.VERSION}`,
    summary: {},

    // filter
    keywords: '',
    caseType: 'all',
    suiteVisible: true,
    stepVisible: true,

    // flyover detail
    flyoverVisible: false,
    detailTitle: '',
    $detail: null,
    caseItem: null,
    position: 0,

    // grid data
    reportData: null,
    gridDataAll: null,
    gridDataMap: {},
    grid: null

});

export default state;
