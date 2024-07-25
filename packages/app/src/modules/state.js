import { shallowReactive } from 'vue';
import { hash } from '../common/common.js';


export const defaultGroups = {
    group: true,

    shard: true,
    project: true,
    file: true,
    describe: true,
    step: false,

    merge: false
};

// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    date: '',
    summary: {},

    // filter
    keywords: '',
    searchableAllKeys: [],
    searchableKeys: [],

    caseType: hash.get('caseType') || 'tests',

    groups: shallowReactive({
        ... defaultGroups
    }),

    windowWidth: window.innerWidth,

    // flyover detail
    flyoverVisible: false,
    flyoverWidth: '60%',
    flyoverTitle: '',
    flyoverComponent: '',
    flyoverData: null,

    imageZoom: false,

    position: null,

    // grid data
    gridDataMap: {},
    grid: null,

    onlyFailedSteps: false,

    loading: false,
    initializing: true

});

export default state;
