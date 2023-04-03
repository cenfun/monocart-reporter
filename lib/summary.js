module.exports = {
    tests: {
        name: 'Tests',
        value: 0,
        nav: true
    },
    passed: {
        name: 'Passed',
        value: 0,
        color: 'green',
        nav: true
    },
    flaky: {
        name: 'Flaky',
        value: 0,
        color: 'orange',
        nav: true
    },
    skipped: {
        name: 'Skipped',
        value: 0,
        color: 'gray',
        nav: true
    },
    failed: {
        name: 'Failed',
        value: 0,
        color: '#d00',
        nav: true
    },

    steps: {
        name: 'Steps',
        value: 0
    },

    suites: {
        name: 'Suites',
        value: 0
    },

    projects: {
        name: 'Projects',
        description: 'Suite type is project',
        value: 0
    },
    files: {
        name: 'Files',
        description: 'Suite type is file',
        value: 0
    },
    describes: {
        name: 'Describes',
        description: 'Suite type is describe',
        value: 0
    },
    // only in sharding test
    shards: {
        name: 'Shards',
        description: 'Suite type is shard',
        value: 0
    },

    retries: {
        name: 'Retries',
        value: 0
    },

    errors: {
        name: 'Errors',
        value: 0
    },
    logs: {
        name: 'Logs',
        value: 0
    },
    attachments: {
        name: 'Attachments',
        value: 0
    }
};
