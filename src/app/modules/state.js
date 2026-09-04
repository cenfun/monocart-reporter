import { shallowReactive } from 'vue';
import { CommonUtil } from '../common/common.js';
import { getQueryValue } from '../router.js';

export const defaultGroups = {
    group: true,

    shard: true,
    project: true,
    file: true,
    describe: true,
    step: false,

    merge: false
};

// Convert comma-separated route tags to @tag keywords format.
// Support both old format (smoke,slow) and new format (already with @).
export const getTagsKeywords = (value) => {
    const tags = getQueryValue(value);
    if (!tags) {
        return '';
    }
    return tags.split(',').map((t) => {
        t = t.trim();
        if (!t) {
            return '';
        }
        return t.startsWith('@') ? t : `@${t}`;
    }).filter(Boolean).join(' ');
};

// Extract @tag patterns from keywords for the route query.
export const getTagsRouteValue = (keywords) => {
    const tagMatches = `${keywords}`.match(CommonUtil.tagPattern);
    return tagMatches && tagMatches.length ? tagMatches.map((t) => t.slice(1)).join(',') : '';
};

// do not use reactive for grid data
const state = shallowReactive({
    theme: 'light',

    title: '',
    date: '',
    summary: {},

    // filter
    keywords: '',
    searchableAllKeys: [],
    searchableKeys: [],
    includeDescendants: false,

    caseType: 'tests',

    groups: shallowReactive({
        ... defaultGroups
    }),
    groupsPopoverVisible: false,
    groupsPopoverTarget: null,

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
