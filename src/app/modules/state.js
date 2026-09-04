import { shallowReactive } from 'vue';

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
