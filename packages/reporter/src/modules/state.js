import { shallowReactive } from 'vue';
import { hash } from 'monocart-common';


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

    position: 0,

    // grid data
    gridDataMap: {},
    grid: null,

    loading: false,
    initializing: true

});

export default state;
