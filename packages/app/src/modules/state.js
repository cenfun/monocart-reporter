import { shallowReactive } from 'vue';
import Util from '../utils/util.js';

// dot not use reactive for grid data
const state = shallowReactive({
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

    caseItem: null,
    position: 0,

    // grid data
    gridDataAll: null,
    gridDataMap: {},
    grid: null,

    pieData: null,
    testInfo: null

});

export default state;
