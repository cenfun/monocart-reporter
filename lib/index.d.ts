import type { TestInfo } from "@playwright/test"
import type {
    CoverageReportOptions,
    ReportDescription,
    V8CoverageEntry,
    Watermarks,
    CoverageResults,
    CoverageSummary,
    MetricsSummary,
    CoverageFile,
    CoverageRange,
    AddedResults
} from "monocart-coverage-reports";

export type {
    TestInfo,

    CoverageReportOptions,
    ReportDescription,
    V8CoverageEntry,
    Watermarks,
    CoverageResults,
    CoverageSummary,
    MetricsSummary,
    CoverageFile,
    CoverageRange,
    AddedResults
}

export interface Helper {

    find: (callback: ((item: any, parent: any) => void)) => any;
    filter: (callback: ((item: any, parent: any) => void)) => any[];
    /** Traverse all cases, suites, and steps. */
    forEach: (callback: ((item: any, parent: any) => void | "break")) => void;

    /** send email with nodemailer: https://nodemailer.com/ */
    sendEmail: (emailOptions: {
        /** email transport: https://nodemailer.com/smtp/ */
        transport: any,
        /** email message: https://nodemailer.com/message/ */
        message: any
    }) => Promise<void>;

}

export type MonocartReporterOptions = {
    /** the report name */
    name?: string,

    /** the output file path (relative process.cwd) */
    outputFile?: string,

    /** attachment path handler, for example:  
     * ```js
     * attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}` 
     * ```
     */
    attachmentPath?: (currentPath: string, extras: any) => string,

    /** custom trace viewer url: https://github.com/cenfun/monocart-reporter?#view-trace-online */
    traceViewerUrl?: string,

    /** logging levels: off, error, info, debug */
    logging?: string,

    /** timezone offset in minutes, For example: GMT+0800 = -480 */
    timezoneOffset?: number,

    /** global coverage options: https://github.com/cenfun/monocart-reporter?#code-coverage-report 
     * ```js
     * coverage: {
     *   entryFilter: (entry) => true,
     *   sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
     * }
     * ```
    */
    coverage?: CoverageReportOptions,

    /** Global State Management: https://github.com/cenfun/monocart-reporter?#global-state-management */
    state?: {
        data?: any,
        server?: {
            host?: string,
            port?: number
        }
        onReceive?: (...args: any[]) => any,
        onClose?: (data: any, config: any) => void
    },

    /** trend data handler: https://github.com/cenfun/monocart-reporter?#trend-chart 
     * ```js
     * trend: () => './test-results/report.json'
     * ```
    */
    trend?: string | (() => Promise<string | any>),

    /** custom tags style: https://github.com/cenfun/monocart-reporter?#style-tags 
     * ```js
     * tags: {
     *   smoke: {
     *     'background': '#6F9913'
     *   },
     *   sanity: {
     *     'background': '#178F43'
     *   }
     * }
     * ```
    */
    tags?: {
        [key: string]: any;
    },

    /** columns data handler: https://github.com/cenfun/monocart-reporter?#style-tags */
    columns?: (defaultColumns: any[]) => void,

    /** rows data handler (suite, case and step) https://github.com/cenfun/monocart-reporter?#custom-data-visitor */
    visitor?: (data: any, metadata: any) => void,

    /** enable/disable custom fields in comments. Defaults to true. */
    customFieldsInComments?: boolean,

    /** mermaid options */
    mermaid?: {
        /** mermaid script url, for example: https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js */
        scriptSrc?: string;
        /** mermaid config: https://mermaid.js.org/config/schema-docs/config.html */
        config?: any;
    }

    /** onEnd hook: https://github.com/cenfun/monocart-reporter?#onend-hook */
    onEnd?: (reportData: any, helper: Helper) => Promise<void>

}

/**
 * merge
 */
export function merge(
    reportDataList: any[],
    options?: MonocartReporterOptions
): Promise<void>;

/**
 * audit
 */
export type AuditReportOptions = {
    title?: string,
    outputDir?: string,
    outputName?: string
};

export function attachAuditReport(
    runnerResult: any,
    testInfo: TestInfo,
    options?: AuditReportOptions
): Promise<any>;


/**
 * coverage
 */

export function addCoverageReport(
    coverageData: any[] | any,
    testInfo: TestInfo
): Promise<AddedResults>;

export function attachCoverageReport(
    coverageData: any[] | any,
    testInfo: TestInfo,
    options?: CoverageReportOptions
): Promise<CoverageResults>;


/**
 * network
 */
export type NetworkReportOptions = {
    title?: string,
    outputDir?: string,
    outputName?: string,

    // Whether inline all scripts to the single HTML file.
    inline?: boolean
};

export function attachNetworkReport(
    har: string | Buffer,
    testInfo: TestInfo,
    options?: NetworkReportOptions
): Promise<any>;

export function setMetadata(
    data: {
        [key: string]: any;
    },
    testInfo: TestInfo
): void;

/**
 * state
 */
export type StateOptions = {
    host?: string,
    port?: number,
    timeout?: number
};

export type State = {
    get: {
        (key: string): Promise<any>,
        (...args: string[]): Promise<any[]>
    },
    set: {
        (key: string, value: any): Promise<void>,
        (obj: any): Promise<void>
    },
    remove: {
        (key: string): Promise<void>,
        (...args: string[]): Promise<void>
    },
    send: (...args: any[]) => Promise<any>
}

export function useState(options?: StateOptions): State;
