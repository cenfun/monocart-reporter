# Coverage integration

## Version and data contracts

Coverage uses **monocart-coverage-reports 3.x**, requiring **Node.js >=22.15.0**. Inspect its installed manifest, types, defaults, and bundled skill for detailed filters, sourcemaps, reports, and thresholds. Do not use MCR 2.x recipes or `require('monocart-coverage-reports')` as though it were the old CJS API. Reporter helpers are available through both CJS and ESM.

- `addCoverageReport(data, testInfo)`: contribute data to the global coverage report; configure global options in reporter `coverage`.
- `attachCoverageReport(data, testInfo, options)`: generate and attach an independent per-test report.
- V8 input is an array (JS entries with source/function ranges, CSS entries with text/ranges). Istanbul input is an instrumented coverage object. A Node envelope `{ result: [...] }` is not an Istanbul object.
- These helpers consume coverage; they do not instrument source or turn on browser collection.
- The fixture below covers only its `page`. Popups, extra pages/contexts, service/server processes, and component-test targets need their own collection plan. Do not claim complete application coverage from one page.
- Retries/repeated tests can all contribute; decide whether all attempts or a selected attempt should count. Do not silently discard failing attempts to improve percentages.

## Automatic Chromium fixture

```js
// fixtures.cjs — tests must import this test, not the base test
const { test: base, expect } = require('@playwright/test');
const { addCoverageReport } = require('monocart-reporter');

const test = base.extend({
    autoCoverage: [async ({ page, browserName }, use, testInfo) => {
        if (browserName !== 'chromium') {
            await use();
            return;
        }
        await Promise.all([
            page.coverage.startJSCoverage({ resetOnNavigation: false }),
            page.coverage.startCSSCoverage({ resetOnNavigation: false })
        ]);
        try {
            await use();
        } finally {
            const [js, css] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            await addCoverageReport([...js, ...css], testInfo);
        }
    }, { auto: true }]
});

module.exports = { test, expect };
```

Start collection before navigation/execution, stop before closing the page. Tests that close this page early need a different lifecycle. Browser coverage is Chromium-only; use `browserName`, not a guessed project name. Firefox/WebKit require a different collection/instrumentation strategy.

Reporter options, merged into the existing config:

```js
coverage: {
    sourceFilter: (sourcePath) => sourcePath.includes('src/'),
    reports: ['v8', 'console-summary', 'raw']
}
```

Adapt scope to actual normalized paths and build sourcemaps. `entryFilter` filters generated entries; `sourceFilter` filters mapped sources. Make sure intended files remain included. Coverage only includes executed inputs by default; configure MCR's untested-file options when required. Do not add exclusions or ignores solely to pass a threshold.

## Per-test reports and cache ownership

Choose global aggregation (`addCoverageReport`) or independent per-test attachment (`attachCoverageReport`) based on the requested output. Replace the final fixture submission with this only when a per-test report is wanted:

```js
const { attachCoverageReport } = require('monocart-reporter');
const results = await attachCoverageReport([...js, ...css], testInfo, {
    name: `Coverage - ${testInfo.title}`,
    reports: ['v8']
});
if (!results || !results.reportPath) {
    throw new Error('Expected a generated per-test coverage report');
}
```

Here `js` and `css` are the stopped coverage arrays from the fixture. Do not call both helpers just to get a single report: that duplicates processing. Generate both only when the user actually wants global and per-test artifacts.

Global collection shares the reporter's coverage cache across workers. Do not set `coverage.cleanCache: true` in each test/worker or delete the cache while tests are active. Keep run/shard output directories independent; also preserve the build and sourcemaps until generation completes.

For advanced MCR filters, untested sources, metrics, raw reports, and thresholds, resolve and read the installed coverage skill instead of copying an unrelated version's recipe:

```sh
node -p "require.resolve('monocart-coverage-reports/skills/monocart-coverage-reports/SKILL.md')"
```

If the installed version does not ship that skill, use its matching README/types. Do not install a different MCR major just to get documentation.

## Shards, Node, and CI

For shard merging include `raw` in each shard's coverage reports; Monocart can merge raw coverage with the test reports. Keep all raw artifacts in JSON/ZIP transfers, and preserve the exact tested source/build/maps.

For server-side Node coverage, start the server with `NODE_V8_COVERAGE`, flush/terminate gracefully, read each envelope's `result`, and attach source for file URLs before passing entries to the reporter helper. Never read a still-running server's directory as proof of complete collection. Use standalone MCR collection APIs for complicated Node workflows rather than inventing reporter APIs.

Watermarks only control colors, not CI thresholds. Validate fresh nonempty input and implement explicit threshold checks through coverage `onEnd` using actual MCR metric schema. Preserve nonzero test/report/threshold status; absence of a thrown error does not prove coverage was collected.
