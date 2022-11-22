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

    detailTitle: '',
    $detail: null,

    flyoverVisible: false,

    reportData: null,
    gridDataAll: null,
    gridDataMap: {},
    grid: null

});

export default state;
