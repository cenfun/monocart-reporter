# Tag Deep Linking Tests

This directory contains end-to-end tests for the tag deep linking feature.

## Overview

These tests verify that the URL hash parameter `tags` works correctly for filtering tests by tags in the monocart-reporter HTML report.

## Prerequisites

**IMPORTANT:** These tests require a pre-generated report at `.temp/monocart/index.html`

The tests will automatically skip if the report doesn't exist.

## Running the Tests

### Option 1: Run tests in correct order (Recommended)

```bash
# First, generate the report with example tests
npm run test-example

# Then run the tag deep linking tests
npm run test-tag-linking
```

### Option 2: Run all tests together

```bash
# The tag deep linking tests will automatically skip if report doesn't exist
npm test
```

The tag tests will be skipped during the main test run (before report generation) and should be run separately after.

## Test Coverage

The test suite includes 12 comprehensive tests:

1. **Initialization from Hash**
   - Single tag: `#tags=smoke`
   - Multiple tags: `#tags=smoke,slow`
   - Combined with caseType: `#caseType=failed&tags=sanity`

2. **Bidirectional Sync (Keywords ↔ Hash)**
   - Typing tags updates hash
   - Clearing search removes tags from hash
   - Mixed content (tags + text) only syncs tags to hash
   - Multiple tags extracted from keywords

3. **Browser Navigation**
   - Back/forward button restores tag state correctly

4. **Edge Cases**
   - Invalid/non-existent tags handled gracefully
   - Tags with dashes work correctly
   - URL encoding handled properly
   - Tags persist when changing filters

## Expected Results

When the report exists:
```
12 passed (5-6 seconds)
```

When the report doesn't exist:
```
12 skipped
```

## Test Report Location

The tests look for the report at:
```
.temp/monocart/index.html
```

This is the default location where `npm run test-example` generates the report.

## Implementation Files

The feature is implemented in:
- `packages/app/src/modules/state.js` - Initializes keywords from tags hash
- `packages/app/src/app.vue` - Syncs keywords to/from hash, handles popstate

## Manual Testing

You can also manually test the feature by opening the generated report:

```bash
# Generate report
npm run test-example

# Open report
open .temp/monocart/index.html

# Or view with monocart CLI
npx monocart show-report .temp/monocart/index.html
```

Then try these URLs:
- `file:///.../index.html#tags=smoke`
- `file:///.../index.html#tags=smoke,slow`
- `file:///.../index.html#caseType=failed&tags=sanity`
