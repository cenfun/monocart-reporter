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

export type MonocartReporterOptions = {
    // the report name
    name?: string,

    // the output file path (relative process.cwd)
    outputFile?: string,

    // attachment path handler
    attachmentPath?: (currentPath: string, extras: any) => string,
    // attachmentPath: (currentPath, extras) => `https://cenfun.github.io/monocart-reporter/${currentPath}`,

    traceViewerUrl?: string,

    // logging levels: off, error, info, debug
    logging?: string,

    // timezone offset in minutes, GMT+0800 = -480
    timezoneOffset?: number,

    // global coverage settings for addCoverageReport API
    coverage?: CoverageReportOptions,
    // coverage: {
    //     entryFilter: (entry) => true,
    //     sourceFilter: (sourcePath) => sourcePath.search(/src\/.+/) !== -1,
    // },

    state?: {
        data?: any,
        server?: {
            host?: string,
            port?: number
        }
        onReceive?: (...args: any[]) => any,
        onClose?: (data: any, config: any) => void
    },

    // trend data handler
    trend?: string | (() => Promise<string | object>),
    // trend: () => './test-results/report.json',

    // custom tags style
    tags?: object,
    // tags: {
    //     smoke: {
    //         'background': '#6F9913'
    //     },
    //     sanity: {
    //         'background': '#178F43'
    //     }
    // },

    // columns data handler
    columns?: (defaultColumns: object[]) => void,
    // columns: (defaultColumns) => {},

    // rows data handler (suite, case and step)
    visitor?: (data: any, metadata: any) => void,
    // visitor: (data, metadata) => {},

    // enable/disable custom fields in comments. Defaults to true.
    customFieldsInComments?: boolean,

    // onEnd hook
    onEnd?: (reportData: object, capability: {
        sendEmail?: (emailOptions: {
            transport: object,
            message: object
        }) => Promise<void>,
        forEach?: (callback: ((item: any) => void)) => void
    }) => Promise<void>
    // onEnd: async (reportData, capability) => {}
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
        (obj: object): Promise<void>
    },
    remove: {
        (key: string): Promise<void>,
        (...args: string[]): Promise<void>
    },
    send: (...args: any[]) => Promise<any>
}

export function useState(options?: StateOptions): State;
