const { test, expect } = require('@playwright/test');
const Visitor = require('../../lib/visitor.js');

test('@util step duration progress follows the merged case timeline', () => {
    const start = Date.parse('2026-01-01T00:00:00.000Z');
    const steps = [{
        type: 'step',
        startTime: new Date(start + 100),
        duration: 400,
        subs: [{
            type: 'step', startTime: new Date(start + 200).toISOString(), duration: 100
        }]
    }, {
        type: 'step', count: 2, startTime: new Date(start + 300), duration: 200
    }, {
        type: 'step', startTime: new Date(start + 600), duration: 0
    }, {
        type: 'step', startTime: new Date(start + 700), duration: 1
    }, {
        type: 'step', startTime: new Date(start + 400), duration: -1
    }, {
        type: 'step', duration: 50
    }, {
        type: 'step', startTime: new Date(start + 333), duration: 1
    }, {
        type: 'step', stepType: 'retry'
    }, {
        type: 'step', startTime: new Date(start + 800), duration: 100
    }, {
        type: 'step', startTime: new Date(start + 950), duration: 50
    }];

    Visitor.prototype.setStepDurationProgress(steps, start, 1000);
    expect(steps[0].progress).toEqual([10, 50]);
    expect(steps[0].subs[0].progress).toEqual([20, 30]);
    expect(steps[1].progress).toEqual([30, 50]);
    expect(steps[2].progress).toEqual([60, 64]);
    expect(steps[3].progress).toEqual([70, 74]);
    expect(steps[4].progress).toEqual([40, 44]);
    expect(steps[5].progress).toBeUndefined();
    expect(steps[6].progress).toEqual([33.3, 37.3]);
    expect(steps[7].progress).toBeUndefined();
    expect(steps[8].progress).toEqual([80, 90]);
    expect(steps[9].progress).toEqual([95, 100]);

    const invalid = [{
        type: 'step', startTime: new Date(start + 100), duration: 100
    }];
    Visitor.prototype.setStepDurationProgress(invalid, start, NaN);
    expect(invalid[0].progress).toBeUndefined();
});

test('@util deduped steps use first start to last end for duration and progress', () => {
    const start = Date.parse('2026-01-01T00:00:00.000Z');
    const makeStep = (offset, duration) => ({
        type: 'step',
        title: 'repeat',
        stepType: 'test.step',
        location: 'example.spec.js:1:1',
        startTime: new Date(start + offset),
        duration
    });
    const steps = Visitor.prototype.dedupeSteps([
        makeStep(100, 10), makeStep(250, 30), makeStep(400, 20)
    ]);
    expect(steps).toHaveLength(1);

    // The final step ends at 420ms; the merged row starts at 100ms.
    expect(steps[0].duration).toBe(320);
    expect(steps[0].count).toBe(3);

    Visitor.prototype.setStepDurationProgress(steps, start, 1000);
    expect(steps[0].progress).toEqual([10, 42]);
});

test('@util dedupe preserves distinct step annotations, status and custom fields', () => {
    let index = 0;
    const makeStep = (fields = {}) => ({
        id: `step-${++index}`,
        title: 'repeat',
        stepType: 'test.step',
        location: 'example.spec.js:1:1',
        startTime: new Date('2026-01-01T00:00:00.000Z'),
        duration: 1,
        annotations: [],
        status: 'passed',
        owner: {
            name: 'Alice'
        },
        ... fields
    });
    const dedupe = (steps) => Visitor.prototype.dedupeSteps(steps);

    const same = dedupe([makeStep(), makeStep()]);
    expect(same).toHaveLength(1);
    expect(same[0].count).toBe(2);

    const skipped = makeStep({
        annotations: [{
            type: 'skip', description: 'not applicable'
        }]
    });
    const passed = makeStep();
    const distinct = dedupe([skipped, passed]);
    expect(distinct).toHaveLength(2);
    expect(distinct.map((step) => step.count)).toEqual([1, 1]);
    expect(distinct[0].annotations).toEqual(skipped.annotations);
    expect(distinct[1].annotations).toEqual(passed.annotations);
    expect(dedupe([makeStep({
        status: 'skipped'
    }), makeStep()])).toHaveLength(2);
    expect(dedupe([makeStep({
        owner: {
            name: 'Bob'
        }
    }), makeStep()])).toHaveLength(2);
    expect(dedupe([makeStep({
        jira: 'TICKET-1'
    }), makeStep()])).toHaveLength(2);
});

test.describe('parent group', () => {

    /**
     * @verify failed
     */
    test('@sanity case steps @slow', async () => {
        const result1 = await test.step('step 1', async () => {
            await test.step('sub step', async () => {
                await test.step('sub step', () => {
                });
            });
            return 'result';
        });

        const result2 = await test.step('step 2', () => {
            return 'result';
        });
        expect(result1).toBe(result2);

        // @owner Steve
        await test.step('step @slow (500ms)', () => {
            return new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        });

        test.step('step soft assertion failed', () => {
            expect.soft(1).toBe(2);
        });
    });

    test('@util dedupe step metadata', () => {
        const makeSteps = (paramsFor, subtitleFor) => Array.from({
            length: 9
        }, (_, i) => ({
            title: 'Select Customer Company',
            stepType: 'test.step',
            location: 'example.spec.js:1:1',
            duration: 1,
            params: paramsFor(i),
            subtitle: subtitleFor(i)
        }));
        const dedupe = (steps) => Visitor.prototype.dedupeSteps(steps);

        const same = dedupe(makeSteps(() => ({
            companyName: 'Acme'
        }), () => 'Acme'));
        expect(same).toHaveLength(1);
        expect(same[0].count).toBe(9);
        expect(same[0].duration).toBe(9);

        // HTML reporter merges even a pair; single/ineligible steps still have count 1.
        const pair = dedupe(makeSteps(() => ({
            companyName: 'Acme'
        }), () => 'Acme').slice(0, 2));
        expect(pair).toHaveLength(1);
        expect(pair[0].count).toBe(2);

        const noLocation = makeSteps(() => ({
            companyName: 'Acme'
        }), () => 'Acme').slice(0, 2);
        noLocation.forEach((step) => {
            step.location = '';
        });
        expect(dedupe(noLocation).map((step) => step.count)).toEqual([1, 1]);

        const unfinished = makeSteps(() => ({
            companyName: 'Acme'
        }), () => 'Acme').slice(0, 2);
        unfinished[0].duration = -1;
        expect(dedupe(unfinished).map((step) => step.count)).toEqual([1, 1]);

        const differentParams = dedupe(makeSteps((i) => ({
            companyName: i === 4 ? 'Globex' : 'Acme'
        }), () => 'Acme'));
        expect(differentParams).toHaveLength(3);
        expect(differentParams[1].params.companyName).toBe('Globex');
        expect(differentParams[1].count).toBe(1);

        const differentSubtitles = dedupe(makeSteps(() => ({
            companyName: 'Acme'
        }), (i) => (i === 4 ? 'Globex' : 'Acme')));
        expect(differentSubtitles).toHaveLength(3);
        expect(differentSubtitles[1].subtitle).toBe('Globex');
    });

    test('@smoke step params and subtitle', async () => {
        const companies = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Wonka', 'Hooli', 'Pied Piper'];

        // Repeated titles with distinct params must retain their individual report rows.
        for (const companyName of companies) {
            await test.step('Select Customer Company', () => {}, {
                params: {
                    companyName
                },
                subtitle: companyName === 'Acme' ? companyName : 'Customer'
            });
        }

        await test.step('Parameters only', () => {}, {
            params: {
                attempt: 0,
                companyName: 'Acme',
                subtitle: 'Customer'
            }
        });
        await test.step('Subtitle only', () => {}, {
            subtitle: 'No params'
        });
        await test.step('Subtitle in parameter value', () => {}, {
            params: {
                description: 'Customer: Acme'
            },
            subtitle: 'Acme'
        });
        await test.step('Long parameters', () => {}, {
            params: {
                note: 'A long parameter value. '.repeat(30)
            }
        });
        await test.step('Long unbroken parameter', () => {}, {
            params: {
                value: 'unbroken'.repeat(50)
            }
        });

        await test.step('Verify selected company', async () => {
            await test.step('Nested step', () => {}, {
                params: {
                    companyName: companies[0]
                },
                subtitle: companies[0]
            });
        });
    });
});

test.describe('group', () => {

    test('merge same steps - route.continue', async ({ page }) => {

        await page.route('**/*', (route) => {
            const url = route.request().url();
            // console.log(url);
            if (url.includes('abort')) {
                return route.abort();
            }
            return route.continue();
        });

        // mock requests
        await page.evaluate(() => {
            for (let i = 0; i < 30; i++) {
                const script = document.createElement('script');
                if (i === 5) {
                    script.src = `http://localhost/${i}/abort.js`;
                } else {
                    script.src = `http://localhost/${i}/continue.js`;
                }
                document.body.appendChild(script);
            }
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

    });

    test('merge same steps - for expect', () => {
        for (let i = 1; i < 30; i++) {
            // @title step title count ( i > 0 )
            expect(i).toBeGreaterThan(0);
        }
    });

});

test('my step test', async () => {
    await Promise.all([
        test.step('step 1', async () => {
            await test.info().attach('my step attachment 1', {
                body: 'foo'
            });
        }),
        test.step('step 2', async () => {
            await test.info().attach('my step attachment 2', {
                body: 'bar'
            });
        })
    ]);
});

test('A test with skipped steps', async ({ page }) => {

    await test.step('A step that is skipped unconditionally', (step) => {
        step.skip();
    });

    await test.step('A step that is skipped conditionally', (step) => {
        step.skip(true);
    });

    await test.step('A step that is skipped conditionally (with message)', (step) => {
        step.skip(true, 'This step is skipped because the condition was met.');
    });
});
