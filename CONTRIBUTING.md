# Contributing

Thanks for helping improve Monocart Reporter! This document describes how to set up a local environment and what each development script does.

## Prerequisites

- **Node.js 20+** – Playwright and the build tooling rely on modern Node features.
- **npm** – Run `npm install` once after cloning. This installs every dependency, including the local `starfall-cli` binary that powers the build/dev workflows, so you never need a global install.

## Development Workflow

```sh
npm install        # install dependencies
npm run build      # lint + build via Starfall CLI (sf)
npm run test       # full Playwright test suite
npm run dev        # launch the Starfall dev server that watches .temp/monocart/index.json
```

### Test Scripts

All test commands automatically run `npm run link` first so the reporter is linked into the Playwright config. Then they execute a scoped set of specs:

- `npm run test` – runs every Playwright test in `tests/`.
- `npm run test-example` – only the example specifications in `tests/example/`.
- `npm run test-data` – tests focused on the sample data fixtures.
- `npm run test-page` – UI/screenshot assertions in `tests/home-page/` (updates snapshots located next to the spec file).
- `npm run test-coverage` – code coverage integration scenarios.
- `npm run test-network` – HAR ingestion/network report coverage.
- `npm run test-state` – shared state coordinator scenarios, including message passing between workers.

Use the targeted scripts when iterating on a particular feature; run `npm run test` before opening a PR to ensure the full suite passes.

### Dependencies

- UI Framework – [Vue 3](https://github.com/vuejs/core)
- UI Components – [vine-ui](https://github.com/cenfun/vine-ui)
- Grid – [turbogrid](https://github.com/cenfun/turbogrid)
- Compression – [lz-utils](https://github.com/cenfun/lz-utils)
- Coverage Reporter – [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports)

If you run into issues or have suggestions, please open an issue before submitting a large change.
