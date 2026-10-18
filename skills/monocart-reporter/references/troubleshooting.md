# Troubleshooting by symptom

Start with the installed versions, exact command/config, cwd, selected tests/projects, output path, exit status, and relevant sanitized error. Reproduce with one existing test and a dedicated output directory. Do not solve failures by hiding tests or disabling assertions.

| Symptom | Check first | Next action |
| --- | --- | --- |
| No report or wrong output directory | Was the reporter selected? Did config/global setup fail? What is process.cwd()? | Inspect Playwright config and `outputFile`; reject stale artifacts from an earlier run |
| HTML/metadata changes do not appear in a checkout | Runtime template is bundled in `lib/packages/` | Run `npm run build`; do not patch generated bundles |
| Report opens, but screenshots/video/coverage links fail | Were attachments copied and deployed with relative paths preserved? | Check file existence and hosted URLs, then `copyAttachments` / `attachmentPath` |
| Trace viewer fails | file://, CORS, HTTP/HTTPS, private-network restrictions | Serve via `monocart show-report`; inspect actual viewer request/response |
| Custom field missing | Does the column ID match metadata? Does the visitor run on the intended row type? | Use a small JSON-enabled report; inspect rows before changing the formatter |
| Formatter works in Node but not in browser | Captured closures/imports; invalid HTML | Use a self-contained browser function and escape untrusted values |
| Step subtitle not searchable | Playwright version and visible grouping/search fields | For supported versions, enable Step grouping and Subtitle in Searchable Fields |
| Step params/subtitles missing | Playwright must emit these fields (1.63+ for the shown recipe) | Inspect fresh JSON and remove any visitor that accidentally drops them |
| Global coverage absent | Correct extended fixture imported? Chromium? Nonempty cache? | Confirm collection starts before execution and stops before page closure |
| Coverage shows generated code or wrong files | Exact tested build/maps and normalized source paths | Inspect MCR source/filter diagnostics; do not broaden exclusions blindly |
| Coverage disappears with workers | Shared cache cleaned or output directories collide | Do not enable per-worker cache cleanup; isolate independent runs/shards |
| Merge incomplete | Missing/old shard inputs or nonportable attachment paths | Validate the expected shard set and transfer ZIPs/raw coverage |
| State connection fails or times out | Reporter state enabled? Matching host/port? Port already used? | Check sanitized server/client logs and isolate simultaneous runs |
| State count is inconsistent | Non-atomic read then write across workers | Use a single reporter-side atomic handler or explicit locking |
| Integration “succeeds” without delivery | Hook availability, awaited requests, HTTP status, missing optional client | Read [integrations.md](integrations.md); validate delivery and failure policy |
| Trend history is missing | Prior JSON is readable, valid, and belongs to the intended report series | Preserve history outside current output; do not replace current results with old JSON |
| Network title differs between page and attachment | Correct `attachNetworkReport(..., { title })` option and installed version? | Inspect returned/saved `title` and rebuilt UI; main reporter naming still uses `name` |

## Inspect output without rewriting it

Enable `json: true` (default). Report JSON contains nested suites/cases/steps, not only a flat test list. Use the `onEnd` helper's `find`, `filter`, and `forEach` when possible; do not assume `rows.filter(...)` visits nested cases.

- Case `caseType`: `passed`, `failed`, `flaky`, `skipped`; keep distinct from raw Playwright statuses.
- Summary counts live under `summary.<metric>.value`.
- Rendered HTML contains compressed report data; editing it manually is not a repeatable fix.
- Logs, JSON, traces, HAR and source maps can contain secrets. Share the smallest sanitized reproduction, not a full private artifact.

Check the report in a browser and inspect console/request failures. Confirm any apparent issue is not saved grouping/search state or a missing dependency. Reset only the relevant UI setting, not all browser storage without approval.

## Avoid false success

A report file on disk does not prove the current run completed. Use fresh run-specific output/input directories and require the expected tests/shards/artifacts. Preserve the original test status through reporting, notifications, and uploads.

The repository's public demonstration workflow intentionally publishes failed/flaky fixtures; its test-error suppression is not a template for a production quality gate. Also, npm `posttest` does not run if `test` fails: use explicit CI artifact/upload steps when results must be retained after failures.

For host integrations, prefer [configuration.md](configuration.md), [coverage.md](coverage.md), and [sharding-and-ci.md](sharding-and-ci.md). Read [repository-map.md](repository-map.md) only when maintaining the package.
