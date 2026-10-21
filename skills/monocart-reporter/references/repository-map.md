# Repository navigation and maintenance

## Installed-package authority

Resolve `monocart-reporter/package.json` from the host application. Read its version, exports, types, README, and `lib/default/options.js`. Public exports are the main CJS/ESM API, `/cli`, `/package.json`, and `/skills/*` file resolution. Markdown files are resolved/read, not imported as JavaScript.

The npm package ships `lib/` and the entire skill directory, plus normal package documentation. Repository `src/`, `tests/`, and `scripts/` are not needed for host integration. Do not run checkout development commands inside installed dependencies.

## Checkout map

When maintaining a source checkout, read the root `AGENTS.md` first; `.github/copilot-instructions.md` carries a self-contained summary for Copilot. These checkout-only guides cover command side effects, focused validation, generated output boundaries, and safety. They are not shipped in npm and are not prerequisites for host integration. Keep their shared rules aligned when updating them.

| Task | Source | Validation/examples |
| --- | --- | --- |
| Reporter lifecycle and exports | `lib/index.js`, `lib/index.mjs`, `lib/index.d.ts` | `tests/playwright.config.js` |
| Defaults, columns, report template | `lib/default/` | README Reporter Options and customization sections |
| Report data, visitors, generation | `lib/generate-data.js`, `lib/visitor.js`, `lib/generate-report.js`, `lib/common.js` | `tests/data/`, `tests/example/` |
| Merge/CLI | `lib/merge-data.js`, `lib/cli.js` | README Merge Shard Reports |
| Coverage integration | `lib/plugins/coverage/` | `tests/report-coverage/` |
| Network title/data/attachment display | `lib/plugins/network/network.js`, `lib/assets.js`, `lib/visitor.js`, `src/network/app.vue`, `src/app/components/detail/attachments/network.vue` | `tests/report-network/report-options.spec.js`, `tests/report-network/report-network.spec.js` |
| Shared state | `lib/plugins/state/`, `lib/index.js` | `tests/state/` |
| External integrations and hook lifecycle | `lib/generate-report.js`, `lib/index.js`, `lib/plugins/email.js` | [Integration recipes](integrations.md), README Integration Examples |
| Browser report UI | `src/app/`, `src/shared/`, `vite.config.mjs` | `npm run dev`, `npm run build` |
| Social preview | `scripts/og-image/`, `lib/default/template.html`, `scripts/docs.js` | `npm run docs-og-image`, `npm run docs` |
| Published skill | `skills/monocart-reporter/`, `package.json` | `npm pack --dry-run`; verify skill resolution and relative links |

Read scripts before running them. `npm test` runs Playwright integration/report generation, including deliberately failing/flaky examples and local web servers; it is not a lightweight unit suite. Use focused existing test targets when appropriate. `npm run link` prepares local package resolution. Browser runs require installed browsers; coverage needs the supported Node runtime. For preview generation, confirm permission before installing Chromium if needed (`npx playwright install chromium`), then run `npm run docs-og-image`. After report generation, `npm run docs` copies the image into `.temp/monocart/` (or pass another directory). It is not a posttest hook: local callers run it explicitly. The Pages workflow runs it once after tests, even if the demonstration tests fail. The shared template gives test and network reports their own titles with the same project description and hosted image.

`npm run lint` includes --fix; avoid unrelated changes. Do not hand-edit generated `dist/` or `lib/packages/`. `lib/assets.js` is maintained source code for HTML generation. Build after changing `lib/default/template.html` or browser bundle inputs; the runtime reads the template bundled in `lib/packages/`, not the source HTML directly.

For skill updates, validate relative Markdown links, API accuracy, public skill resolution, npm pack inclusion of all references, and affected examples. Use [troubleshooting.md](troubleshooting.md) for host-facing problems before inspecting internals. Do not make agent registration automatic.
