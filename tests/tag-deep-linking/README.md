# Keyword Deep Linking Tests

This directory contains end-to-end tests for restoring the complete report search input from the Vue Router query.

## Overview

The report stores the complete search value in the `keywords` query parameter. This includes regular text, tags, or a mixture of both.

Examples:

```text
#/?keywords=login%20failed
#/?keywords=%40smoke%20%40slow
#/?caseType=failed&keywords=%40smoke%20login
```

## Prerequisites

These tests require a pre-generated report at:

```text
.temp/monocart/index.html
```

Generate it first with:

```bash
npm run test-example
```

## Test coverage

The suite covers:

- regular search text initialization;
- tag keyword initialization;
- mixed tags and regular text;
- synchronization from the search input to the route;
- clearing the search query;
- browser back and forward navigation;
- special-character encoding;
- non-existent keywords;
- combination with `caseType`;
- preservation on the report route.

## Implementation files

- `src/app/router.js` - Defines the standard Vue Router hash routes.
- `src/app/modules/state.js` - Contains report UI state.
- `src/app/app.vue` - Synchronizes `state.keywords` with `route.query.keywords`.

## Manual testing

Open the generated report and try URLs such as:

```text
file:///.../index.html#/?keywords=login%20failed
file:///.../index.html#/?keywords=%40smoke%20%40slow
file:///.../index.html#/?caseType=failed&keywords=%40smoke%20login
```
