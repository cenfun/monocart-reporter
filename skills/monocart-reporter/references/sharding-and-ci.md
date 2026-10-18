# Shards and CI

## Produce isolated, portable inputs

Configure `json: true` and preferably `zip` on each shard. Use unique paths/artifact names per shard, run ID, and retry. Never let parallel processes clean the same output directory. A simple per-job reporter config is:

```js
['monocart-reporter', {
    outputFile: './monocart-report/index.html',
    json: true,
    zip: true,
    coverage: {
        reports: ['v8', 'raw']
    }
}]
```

Omit `coverage` for ordinary reports. Upload the generated ZIP from each isolated job under a unique artifact name, even when tests fail. Do not add `|| true` or `|| exit 0` to test commands. CI upload steps can use `if: always()` without erasing test status.

## Validate all shards before merging

Maintain an explicit expected shard list/count from the CI matrix. Download into an input-only directory. Reject missing, empty, duplicated, stale, wrong-run, and unexpected inputs; a glob that matches one file does not prove a complete run.

```js
// merge.cjs — example for exactly three downloaded shard ZIPs
const fs = require('node:fs');
const path = require('node:path');
const { merge } = require('monocart-reporter');

async function main() {
    const inputs = [1, 2, 3].map((id) =>
        path.resolve('downloaded-shards', `shard-${id}`, 'index.zip'));
    for (const input of inputs) {
        if (!fs.statSync(input).isFile() || fs.statSync(input).size === 0) {
            throw new Error(`Invalid shard input: ${input}`);
        }
    }
    await merge(inputs, {
        name: 'Merged Test Report',
        outputFile: './merged-report/index.html',
        onEnd: async (reportData, helper) => {
            const failed = helper.filter((row) =>
                row.type === 'case' && row.caseType === 'failed');
            if (failed.length) {
                process.exitCode = 1;
            }
        }
    });
    // Use a fresh output directory so old artifacts cannot pass this check.
    if (fs.statSync('merged-report/index.html').size === 0) {
        throw new Error('Merged HTML is empty');
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

The explicit list checks presence/size, not run identity: ensure CI downloads only artifacts from the current run and reject extra artifacts before executing it. Start with a new dedicated `merged-report` directory. Do not infer test success from successful merging; preserve shard job results and enforce the desired failed/flaky/interrupted policy separately.

`merge` accepts Monocart JSON paths, ZIP paths, or valid report data objects. It adds a shard suite level, restates summaries, and copies attachments. Do not merge HTML, Playwright blobs, arbitrary JSON, or coverage percentages.

## CLI alternative

```sh
npx monocart merge "downloaded-shards/**/index.zip" -o merged-report/index.html
npx monocart merge "downloaded-shards/**/index.zip" -c mr.config.cjs
```

Aliases: `merge-reports` and `merge`. Config search order: `mr.config.js`, `.cjs`, `.mjs`, `.json`, `.ts`. `-n/--name` and `-o/--outputFile` override config. Quote glob patterns according to the host shell so the CLI receives a single pattern. For TS configs, follow the installed CLI preload support (e.g. approved `tsx` with `--import tsx`); it does not install transpilers for you.

## Coverage and publishing

Each coverage-producing shard must emit MCR `raw` reports; normal rendered coverage HTML is not merge input. Coverage merging requires Node.js >=22.15.0. Keep raw files referenced by JSON or use portable ZIPs.

Publish the complete merged directory, not HTML alone. Validate traces, screenshots, videos, custom artifacts, coverage links, and CORS from the hosted report. Review for secrets before uploading to a public site.
