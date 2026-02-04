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

// Convert comma-separated tags from hash to @tag keywords format
const getTagsKeywords = () => {
    const tags = hash.get('tags');
    if (tags) {
        return tags.split(',').map((t) => `@${t.trim()}`).filter((t) => t !== '@').join(' ');
    }
    return '';
};

// do not use reactive for grid data
const state = shallowReactive({
    title: '',
    date: '',
    summary: {},

    // filter
    keywords: getTagsKeywords(),
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
    collapseSteps: false,

    loading: false,
    initializing: true

});

export default state;
