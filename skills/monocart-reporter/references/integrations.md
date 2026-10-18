# Integrating reports with your toolchain

Monocart is a customizable Playwright reporter, not a built-in client for every external service. Use report data and lifecycle hooks with the host's approved HTTP/API clients. Do not invent options such as `slackWebhook` or `jiraProject`.

## Choose the integration boundary

| Need | Prefer | Important boundary |
| --- | --- | --- |
| Add custom fields or artifacts to serialized report data | `visitor` / `onData` | Changes must happen before writing HTML/JSON |
| Send a summary, map results to test-management records, or send email | `onEnd(reportData, helper)` | Monocart artifacts already exist; other reporters may still be finishing |
| Upload outputs from several Playwright reporters | `onExit(options)` or a later CI step | `onExit` receives options, not reportData/helper |
| Send one notification for a sharded run | Merged report's `onEnd`, or the aggregation CI job | Do not send the same run-level message from every shard |
| Retry/deduplicate uploads or manage deployment permissions | Dedicated CI/job tooling | Keep testing/report generation independent of external availability |

`onData` and `onEnd` also apply to the merge API; `onExit` is a Playwright reporter lifecycle hook and is not invoked by `merge()`. Capture data in an outer variable if an `onExit` callback needs values from `onEnd`. Unlike browser column formatters, these Node-side hooks can use closures.

## Data and lifecycle contracts

- `reportData.summary.tests.value`, `.passed.value`, `.failed.value`, `.flaky.value`, and `.skipped.value` are counts; the summary properties are not plain numbers. Check the installed schema.
- Use `helper.filter((row) => row.type === 'case')` for cases, not suites or steps. A row's `caseType` is Monocart's classification; `status`, `expectedStatus`, and `outcome` are separate fields. Do not equate every raw failed status with an unexpected failed test.
- Map stable external IDs using `setMetadata`, annotations, or comments plus a visitor. Validate the external ID and handle missing/duplicate IDs before posting. Titles alone can collide across files/projects; retries and shards can duplicate updates.
- Preserve failed, flaky, skipped, timed-out, and expected-failure semantics according to the destination's API. Do not silently turn unsupported states into passed.
- `reportData.htmlPath` and `jsonPath` are filesystem paths, not public URLs. Deploy first; use an explicitly configured, accessible report URL in notifications.
- `onEnd` runs after ZIP generation. Files created or changed inside that hook are not automatically included in an already-written ZIP.
- `onExit` exceptions are logged by the current reporter but do not automatically fail CI. Playwright CLI can overwrite `process.exitCode` after hooks finish, so use a separate CI step for required uploads/verification, or reject from `onEnd` when its earlier lifecycle is sufficient. Do not call `process.exit()` while artifacts/uploads are still pending.

## Bounded Slack webhook example

This is a **Slack incoming-webhook** payload, not a universal Teams/Discord/Jira payload. Confirm the destination and data-sharing permission first. This Node-side callback requires global `fetch` and `AbortSignal.timeout`; otherwise reuse the host's approved HTTP client. Do not upgrade the runtime just for this example.

Merge into the reporter options. No request is sent unless an approved webhook is configured:

```js
onEnd: async (reportData) => {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
        return;
    }
    const { tests, passed, failed, flaky, skipped } = reportData.summary;
    if (!Number.isInteger(tests.value) || tests.value <= 0) {
        throw new Error('Refusing to notify with an empty test report');
    }
    const text = [
        'Playwright test results',
        `Tests: ${tests.value}; passed: ${passed.value}; failed: ${failed.value}`,
        `Flaky: ${flaky.value}; skipped: ${skipped.value}`
    ].join('\n');
    const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
        throw new Error(`Slack notification failed: HTTP ${response.status}`);
    }
}
```

This example treats a configured notification failure as an error. If notifications are explicitly best-effort, catch/log a sanitized error while preserving any existing nonzero test status. Never log webhook URLs, authorization headers, or raw response bodies. Do not add automatic retries to non-idempotent result creation without a deduplication policy.

## Other destinations

- **Teams, Discord, DingTalk, Weixin, Feishu:** choose the destination's current webhook/API schema; do not reuse Slack's payload blindly.
- **Jira + Zephyr/Xray, TestRail, Qase:** map external IDs and case classifications, preserve project/environment/run identity, and use destination-specific authentication and deduplication. Avoid creating duplicate runs during retries.
- **BrowserStack:** inspect whether the integration updates session status, uploads report artifacts, or submits test-management results; these use different APIs.
- **GitHub Actions summary:** write approved Markdown to `GITHUB_STEP_SUMMARY` in CI. Avoid unescaped user-controlled titles and sensitive logs. Upload full artifacts separately.
- **Email:** `helper.sendEmail({ transport, message })` uses `nodemailer`, which is optional and must already be installed or added with approval. `reportData.summaryTable` is generated for the `onEnd` helper and can be used as the message HTML; review it for sensitive content. Keep SMTP credentials in secrets. Missing nodemailer is logged and can return without sending, so do not treat an awaited call alone as delivery confirmation.

See the project's [integration examples](https://github.com/cenfun/playwright-reporter-integrations) for destination-specific starting points. Verify current service APIs and installed reporter contracts rather than executing remote example code without review.
