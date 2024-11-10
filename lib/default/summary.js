module.exports = () => ({
    tests: {
        name: 'Tests',
        value: 0,
        nav: true
    },
    failed: {
        name: 'Failed',
        value: 0,
        color: '#d00',
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
    passed: {
        name: 'Passed',
        value: 0,
        color: 'green',
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
    shards: {
        name: 'Shards',
        description: 'Suite type is shard (only in shading mode)',
        value: 0
    },

    errors: {
        name: 'Errors',
        icon: 'error',
        value: 0
    },

    retries: {
        name: 'Retries',
        icon: 'retry',
        value: 0
    },

    logs: {
        name: 'Logs',
        icon: 'log',
        value: 0
    },

    attachments: {
        name: 'Attachments',
        icon: 'attachment',
        value: 0
    }
});
