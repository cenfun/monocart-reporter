# Configuration, output, traces, and hooks

## Reporter configuration

Use the installed `lib/default/options.js` and `lib/index.d.ts` as the option authority. Common settings:

| Option | Contract |
| --- | --- |
| `name`, `logo` | Report title and image URL/data URL |
| `outputFile` | HTML path relative to process.cwd(), default `./monocart-report/index.html` |
| `json` | Separate report data, default true; required for JSON-based merging |
| `zip` | false, true, a ZIP path, or `{ outputFile, clean }` |
| `clean` | Clean old output files, default true; only use dedicated directories |
| `copyAttachments` | Copy attachments to reporter output, default true |
| `attachmentPath` | Rewrite an attachment link; return a valid accessible URL/path |
| `logging` | off, error, info, debug |
| `locale`, `timezoneOffset` | Formatting locale and timezone offset in minutes |
| `groupOptions` | Group/shard/project/file/describe/step/merge visibility |
| `durationStrategy` | normal or exclude-idle |

The main reporter uses `name` for its title; `attachNetworkReport` uses `title`. Its returned data and saved network summary also use `title`. Keep these API-specific names distinct.

JSON is data, not a self-contained archive of attachments. ZIP is appropriate for transferring merge inputs. `zip: { outputFile: 'artifacts/shard-1.zip', clean: true }` removes other report files after archiving; preserve needed artifacts before enabling it.

## Traces and attachments

Enable collection in Playwright's `use` settings, for example `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`. Monocart does not create missing traces automatically.

```sh
npx monocart show-report monocart-report/index.html
npx monocart serve-report monocart-report/index.html
```

`show-report` opens a browser; `serve-report` only serves. Aliases: `show`, `serve`. The trace viewer needs HTTP(S) and working CORS, not file://. Serving supports `--ssl path/to/key.pem,path/to/cert.pem`. For a non-localhost host, HTTPS may be necessary for trace viewer private-network access. Never expose the CLI server to untrusted networks: its serving roots include cwd.

Default `traceViewerUrl`: `https://trace.playwright.dev/?trace={traceUrl}`. Hosting the HTML alone does not host its attachments. Verify deployed URLs and CORS before changing this option.

## Lifecycle hooks

For webhooks, external case IDs, notifications, email, CI summaries, and upload policies, read [integrations.md](integrations.md).

`onData(reportData, rawData)` runs before serialization: use it to change report data. `onEnd(reportData, helper)` runs after report generation: use it for integrations or inspection, not to retroactively change already-written HTML.

```js
onEnd: async (reportData, helper) => {
    const failed = helper.filter((row) =>
        row.type === 'case' && row.caseType === 'failed');
    console.log('Failed cases:', failed.length);
    console.log('Report:', reportData.htmlPath);
}
```

Helpers provide `find`, `filter`, `forEach`, and `sendEmail`. `forEach` visits suites, cases, and steps; return `'break'` to stop. Report fields include `rows`, `columns`, `summary`, `metadata`, `trends`, `htmlPath`, and `jsonPath`. Inspect actual schema instead of inventing summary fields.

`onExit(options)` runs immediately before Playwright exits, after reporters' onEnd callbacks; use it for final uploads. Await uploads and keep credentials in environment variables. In the current implementation, `onExit` exceptions are logged but do not automatically set a failing exit status. Do not rely on setting `process.exitCode` inside this hook: Playwright CLI can overwrite it with the final test status. If upload failure must fail CI, use a separate CI upload/verification step (or a rejecting `onEnd` callback when only Monocart artifacts are needed). Confirm hook availability in the installed version.
