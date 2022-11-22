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

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
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
