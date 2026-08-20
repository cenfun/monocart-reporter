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
export const getTagsKeywords = () => {
    const tags = hash.get('tags');
    if (tags) {
        return tags.split(',').join(' ');
    }
    return '';
};

// Extract @tag patterns from keywords and sync to hash
export const syncTagsToHash = (keywords) => {
    if (keywords.includes('@')) {
        hash.set('tags', keywords.trim());
    } else {
        hash.remove('tags');
    }
};

// do not use reactive for grid data
const state = shallowReactive({
    theme: 'light',

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

    trace: shallowReactive({}),
    metadata: shallowReactive({}),

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
    collapseAttachments: false,

    loading: false,
    initializing: true

});

export default state;
