# Columns, metadata, visitors, tags, and trends

## Custom columns and test metadata

```js
// Inside the Monocart reporter options
columns: (columns) => {
    const index = columns.findIndex((column) => column.id === 'duration');
    columns.splice(index < 0 ? columns.length : index, 0, {
        id: 'owner',
        name: 'Owner',
        searchable: true
    });
}
```

Set the matching field from a test:

```js
const { test, expect } = require('@playwright/test');
const { setMetadata } = require('monocart-reporter');

test('checkout', async () => {
    setMetadata({ owner: 'QA', jira: 'APP-123' }, test.info());
    expect(1 + 1).toBe(2);
});
```

`setMetadata` also supports dynamically generated tests. Static source comments support custom fields when `customFieldsInComments` is enabled (default true); read the installed README syntax before editing comments.

## Static fields, step metadata, and browser formatters

Static comments immediately before a case/suite/step can set fields when `customFieldsInComments` is enabled:

```js
/**
 * @owner QA
 * @jira APP-123
 */
test('checkout', async () => {
    // Keep the real test steps/assertions here.
});
```

Add corresponding columns to display custom fields. For dynamically generated tests or values known only at runtime, prefer `setMetadata`.

With Playwright 1.63+, a step can include extra context:

```js
await test.step('Choose company', async () => {
    // Perform the real action here.
}, {
    subtitle: 'Acme',
    params: { companyName: 'Acme' }
});
```

Both fields are included in HTML/JSON. In the main grid, subtitle search requires Step grouping and the Subtitle searchable field; in details, redundant subtitles may be hidden if already represented by params. Avoid tokens/private values in parameters, or redact them before serialization.

For richer columns use `width`, `align`, `searchable`, `markdown`, and `formatter`. A formatter receives `(value, rowItem, columnItem, cellNode)`; it is serialized for use in the browser. Do not capture Node-only imports or outer lexical variables. Escape text and validate link schemes before returning HTML; never interpolate untrusted logs/metadata directly. Preserve the built-in tree formatter when customizing the title column.

A plain text HTML formatter must escape values locally rather than capture an outer helper:

```js
formatter: (value) => {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
```

For links, validate the scheme, encode dynamic path/query components, and independently escape attribute values. Do not put authentication tokens into report links.

## Collect annotations with a visitor

```js
visitor: (data, metadata) => {
    if (Array.isArray(metadata.annotations)) {
        const owner = metadata.annotations.find((item) => item.type === 'owner');
        if (owner) {
            data.owner = owner.description;
        }
    }
}
```

A visitor processes suite, case, and step rows. Playwright metadata differs by row type; guard optional fields. Add annotations using `test.info().annotations.push({ type: 'owner', description: 'QA' })`.

## Redaction

Secrets can occur in titles, logs, errors, step `subtitle`, and nested step `params` (including object keys). Recursively redact string values and keys in a visitor; filter out empty secrets first. Also inspect global metadata, custom fields, attachments, HAR, traces, screenshots, ZIPs, and raw coverage. A row visitor alone does not sanitize binary or external artifacts. Read the README's “Remove Secrets and Sensitive Data” recipe for a complete recursive text helper.

## Tags and trends

Style title tags such as `@smoke` via `tags: { smoke: { background: '#6F9913' } }`; regex-style keys such as `'/^(slow|flaky)$/'` are supported. Tags style data; they are not test filtering policies.

`trend` accepts a previous report JSON path or a function returning a path/report object, optionally asynchronously. Preserve/download the previous report before output cleanup, preferably outside the current output directory. Validate remote response status/schema and use timeouts; do not let optional trend history mask the current test result. Never fetch private history or publish it without approval.
