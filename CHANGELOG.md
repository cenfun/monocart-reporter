## Changelog

* 2.4.8
  - fixed repeated columns (#122)

* 2.4.8
  - fixed highlight keywords

* 2.4.7
  - fixed UI supports tags column (#119)

* 2.4.6
  - fixed dependency formatter to locator

* 2.4.5
  - fixed CLI path issue

* 2.4.4
  - fixed trace url does not refresh

* 2.4.3
  - fixed `traceViewerUrl` for merging reports

* 2.4.2
  - fixed tag issue for both title and new syntax

* 2.4.1
  - added `helper.find()` and `helper.filter()` for onEnd hook

* 2.4.0
  - supports [new syntax](https://playwright.dev/docs/test-annotations) for tag and annotation in playwright v1.42.0

* 2.3.4
  - fixed dependency `open` to support Node 16
  - updated `mcr` version to support `all` for adding empty coverage for all files

* 2.3.3
  - updated dependencies

* 2.3.2
  - added warning for old collection comments

* 2.3.1
  - updated coverage reports

* 2.3.0
  - supports mermaid

* 2.2.5
  - updated dependencies

* 2.2.4
  - updated dependencies
  - fixed json report issue

* 2.2.3
  - supports https for monocart CLI

* 2.2.2
  - updated types

* 2.2.1
  - updated dependencies

* 2.2.0
  - (Breaking) new option `customFieldsInComments: true/false` instead of calling API `collect.comments(parserOptions)` in `visitor`. Migration: 
    ```js
    {
      customFieldsInComments: true,

      /* remove following, no need anymore
      visitor: (data, metadata, collect) => {
        const parserOptions = {
        };
        const comments = collect.comments(parserOptions);
        if (comments) {
            Object.assign(data, comments);
        }
      }
      */

    }
    ```

* 2.1.1
  - fixed logs undefined issue

* 2.1.0
  - updated monocart-coverage-reports to v2.0.0

* 2.0.4
  - fixed ordering for onEnd hook and showResults
  - fixed playwright version undefined if merging shards 

* 2.0.3
  - added onEnd hook for coverage

* 2.0.2
  - fixed pnpm issue

* 2.0.1
  - fixed reportPath issue
  - added type MonocartReporterOptions

* 2.0.0
  - (BREAKING CHANGES) integrated [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports)
  - fixed expected image path

* 1.7.13
  - supported multiple istanbul reports

* 1.7.12
  - improved public API options
  - added public API addGlobalCoverageReport

* 1.7.11
  - fixed #62

* 1.7.10
  - added option "timezoneOffset"
  - added text/json attachment view

* 1.7.9
  - sanitize filename for attachments

* 1.7.8
  - fixed #58 (load text content for comparison)

* 1.7.7
  - fixed #57 (dynamic video src)

* 1.7.6
  - added zoom in/out for screenshot comparison view

* 1.7.5
  - fixed issue #56 (multiple soft comparisons)

* 1.7.4
  - added istanbul support for global coverage report
  - fixed issue #54

* 1.7.3
  - added css coverage to lcov
  - added error message and size for the image comparison
  - fixed sourcePath option for istanbul data
  - fixed onReceive arguments

* 1.7.2
  - added logging option 
  - rewrote the source mappings for coverage report
  - fixed coverage multiple bgs in a line
  - fixed lcov works for v8
  - fixed reporter dir no init in next running
  - updated document title when open the item

* 1.7.1
  - added group feature to replace the previous suite and step group
  - removed unpackSourceMap option, it should be true always
  - removed excludeDistFile option, it should be replaced with debug option
  - updated istanbul report to html-spa


* 1.7.0
  - added types for package
  - added new feature Global State Management

---

* 1.6.36
  - fixed coverage filename

* 1.6.35
  - fixed monocart version issue #48
  - fixed retry issue #47
  - added retry for attachments
  - fixed retry id for all plugins
  - added global icon
  - added artifacts group and show more button
  - added cli `npx monocart serve-report`

* 1.6.34
  - fixed coverage issue #29
  - updated search input #39  
  - fixed source type to use ext name
  - fixed image diff not shown #47
  - added sourcePath handler for istanbul

* 1.6.33
  - fixed tag row underline
  - added project metadata
  - added line for frozen column
  - fixed group row underline
  - improved search box
  - added search history

* 1.6.32
  - fixed minor issues for image comparison

* 1.6.31
  - supported image diff
  - fixed UI issues
  - updated focus UI
  - added copy button for logs/errors

* 1.6.30
  - fixed metadata supported link
  - fixed flyover title of v8

* 1.6.29
  - fixed coverage issue
  - fixed sourcemap issue

* 1.6.28
  - fixed location issue for detail page
  - updated artifacts list

* 1.6.27
  - optimized package size

* 1.6.26
  - fixed coverage report UI issues
  - added counts of comments and blanks for coverage
  - added first screen loading

* 1.6.25
  - fixed indent for coverage report
  - added option traceViewerUrl

* 1.6.24
  - updated coverage counter
  - fixed repeated coverage file

* 1.6.23
  - added new API addCoverageReport for global coverage report
  - supported sourceMap unpacking
  - supported functional for options.outputFile
  - fixed UI issues

* 1.6.22
  - fixed code viewer for coverage
  - fixed error if throw a string
  - optimized code formatter for coverage and network

* 1.6.21
  - fixed timeline chart

* 1.6.20
  - fixed deduplication for steps
  - optimized libs size

* 1.6.19
  - added API attachAuditReport

* 1.6.18
  - fixed step issue (dedupe steps)

* 1.6.17
  - added network HTML report
  - optimized v8 HTML report

* 1.6.16
  - added v8 HTML report

* 1.6.15
  - rename takeCoverage to attachCoverageReport
  - added attachNetworkReport

* 1.6.14
  - fixed case number for merged report
  - added code coverage feature

* 1.6.13
  - added CLI to show report and view trace online

* 1.6.12
  - fixed UI issue

* 1.6.11
  - added feature collapse all steps

* 1.6.10
  - added feature showing failed step only

* 1.6.9
  - fixed collapsed step
  
* 1.6.8
  - added tag for describe suite

* 1.6.7
  - fixed issue #14

* 1.6.6
  - added comments parser options, support typescript

* 1.6.5
  - fixed tags counting only from case
  - fixed test duration format

* 1.6.4
  - added trend API

* 1.6.3
  - fixed attachment path

* 1.6.2
  - optimized report data
  - added new API to merge shard report

* 1.6.1
  - fixed duration
  - fixed suites counting

* 1.6.0
  - replaced use with metadata (deprecated use)
  - added project custom data from project metadata
  - added file custom data from file fist line comments
  - added metadata report
  - added trace viewer link for trace attachment
  - fixed searchable fields

---

* 1.5.5
  - fixed UI issues

* 1.5.4
  - fixed UI issues

* 1.5.3
  - fixed UI issues

* 1.5.1
  - updated UI/icons
  - fixed grid sort
  - added more summary information to report
  - added export feature


* 1.5.0
  - added pie chart animation
  - added tags feature
  - added workers summary
  - fixed retry logs
  - optimized errors (removed duplicated errors)

---

* 1.4.0
  - fixed collection of comments (support skipped empty lines)
  - fixed annotations formatter
  - updated UI/icons
  - added pie chart

---

* 1.3.3
  - added Testrail Integration

* 1.3.2
  - added new option attachmentPath

* 1.3.1
  - added new feature: send email

* 1.3.0
  - new custom columns visitor from comments
  - added custom formatter for custom columns

---

* 1.2.0
  - removed repeated errors
  - updated the order of columns
  - fixed UI layout (icon)

---


* 1.1.7
  - added search in reporter

* 1.1.6
  - fixed UI layout in small screen
  - fixed HTML escape

* 1.1.5
  - fixed UI issue (touch/mobile)

* 1.1.4
  - fixed UI issues (Mac)

* 1.1.3
  - fixed custom columns

* 1.1.2
  - added onEnd hook option
  - fixed some UI issues

* 1.1.1
  - fixed some UI issues

* 1.1.0
  - new feature: custom columns
  - fixed UI layout for mobile
  - fixed tooltips

---

* 1.0.10
  - fixed "id" argument must be of type string

* 1.0.9
  - fixed dependencies not found

* 1.0.8
  - supported custom annotations with markdown description

* 1.0.7
  - fixed skipped issue (thanks @i-novo)

* 1.0.6
  - fixed UI

* 1.0.5
  - fixed report title and date

* 1.0.4
  - minor fixing for style

* 1.0.3
  - updated customize options logic