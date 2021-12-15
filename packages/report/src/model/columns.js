const columns = {
    create: function() {
        return [{
            id: 'ok',
            name: '',
            width: 30,
            align: 'center',
            formatter: 'ok'
        }, {
            id: 'title',
            name: 'Title'
        }, {
            id: 'type',
            name: 'Type',
            align: 'center'
        }, {
            id: 'status',
            name: 'Status'
        }, {
            id: 'expectedStatus',
            name: 'Expected'
        }, {
            id: 'outcome',
            name: 'Outcome',
            width: 85
        }, {
            id: 'duration',
            name: 'Duration',
            align: 'right',
            sortAsc: false,
            formatter: 'duration'
        }, {
            id: 'retry',
            name: 'Retry',
            align: 'center',
            width: 50
        }, {
            id: 'error',
            name: 'Error',
            width: 80,
            formatter: 'error'
        }, {
            id: 'location',
            name: 'Location',
            width: 120,
            formatter: 'location'
        }, {
            id: 'attachments',
            name: 'Attachments',
            formatter: 'attachments'
        }];
    }
};

export default columns;