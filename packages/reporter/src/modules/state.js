import { shallowReactive } from 'vue';
import { hash } from 'monocart-common';

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
        group: true,

        shard: true,
        project: true,
        file: true,
        describe: true,
        step: false,

        merge: false
    }),

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
    grid: null,

    loading: false,
    initializing: true

});

export default state;
