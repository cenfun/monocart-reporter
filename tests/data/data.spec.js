const { test, expect } = require('@playwright/test');
const { setMetadata } = require('monocart-reporter');

test.describe('Data Driven Tests with setMetadata(data, testInfo)', () => {
    const list = [{
        title: 'Example Case 1 Data Driven Test',
        owner: 'Jensen',
        jira: 'MCR-16889',
        index: 0
    }, {
        title: 'Example Case 2 Data Driven Test',
        owner: 'Mark',
        jira: 'MCR-16899',
        index: 1
    }];

    list.forEach((item, i) => {
        test(item.title, () => {
            setMetadata({
                owner: item.owner,
                jira: item.jira
            }, test.info());

            expect(i).toBe(item.index);

        });
    });
});
