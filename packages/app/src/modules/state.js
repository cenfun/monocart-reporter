import { shallowReactive } from 'vue';
import Util from '../utils/util.js';

// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    date: '',
    summary: {},

    // filter
    keywords: '',
    searchableAllKeys: [],
    searchableKeys: [],

    caseType: Util.getHash('caseType') || 'tests',
    suiteVisible: true,
    stepVisible: false,

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    position: 0,

    // grid data
    gridDataMap: {},
    grid: null

});

export default state;
