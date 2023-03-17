import { reactive } from 'vue';
import Util from '../utils/util.js';

const state = reactive({
    title: '',
    date: '',
    titlePlaywright: '',
    titleReporter: `Monocart Reporter v${window.VERSION}`,
    summary: {},

    // filter
    keywords: '',
    searchableTitle: '',

    caseType: Util.getHash('caseType') || 'tests',
    suiteVisible: true,
    stepVisible: true,

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
    flyoverTitle: '',

    $detail: null,
    caseItem: null,
    position: 0,

    // grid data
    gridDataAll: null,
    gridDataMap: {},
    grid: null,

    pieData: null,
    testInfo: []

});

export default state;
