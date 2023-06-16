import { TestInfo } from "@playwright/test"

/**
 * merge
 */
export function merge(
    reportDataList: [],
    options?: any
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
    v8list: any[],
    testInfo: TestInfo
): Promise<any | void>;

export type CoverageReportOptions = {

    title?: string,
    // outputDir?: string,
    outputName?: string,

    toIstanbul?: boolean,

    entryFilter?: (entry: any) => boolean,

    unpackSourceMap?: boolean,
    excludeDistFile?: boolean,
    sourceFilter?: (sourcePath: string) => boolean,

    sourcePath?: (sourcePath: string) => string,

    lcov?: boolean,

    watermarks?: number[] | any,

    inline?: boolean

};

export function attachCoverageReport(
    coverage: any[] | any,
    testInfo: TestInfo,
    options?: CoverageReportOptions
): Promise<any>;



/**
 * network
 */
export function attachNetworkReport(
    har: string | Buffer,
    testInfo: TestInfo,
    options?: any
): Promise<any>;