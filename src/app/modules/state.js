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

// Extract @tag patterns from keywords and sync to hash
// support tag names with special chars: @feature:tags, @failed@flaky, @some-tag
export const tagPattern = /@[\w:-]+(?:@[\w:-]+)*/g;

// Convert comma-separated tags from hash to @tag keywords format
// support both old format (smoke,slow) and new format (already with @)
export const getTagsKeywords = () => {
    const tags = hash.get('tags');
    if (tags) {
        return tags.split(',').map((t) => {
            t = t.trim();
            if (!t) {
                return '';
            }
            return t.startsWith('@') ? t : `@${t}`;
        }).filter(Boolean).join(' ');
    }
    return '';
};

// Extract @tag patterns from keywords and sync to hash
export const syncTagsToHash = (keywords) => {
    const tagMatches = `${keywords}`.match(tagPattern);
    if (tagMatches && tagMatches.length > 0) {
        hash.set('tags', tagMatches.map((t) => t.slice(1)).join(','));
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
