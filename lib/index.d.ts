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

    debug?: boolean,

    title?: string,
    outputDir?: string,
    outputName?: string,

    // Whether to convert to Istanbul report
    toIstanbul?: boolean,

    // A filter function to execute for each element in the V8 list.
    entryFilter?: (entry: any) => boolean,

    // Whether to unpack all sources from the source map if a related source map file is found.
    unpackSourceMap?: boolean,
    // Whether to exclude the dist file (usually minified) if the sources are successfully unpacked from the source map.
    excludeDistFile?: boolean,

    // A filter function to execute for each element in the sources which unpacked from the source map.
    sourceFilter?: (sourcePath: string) => boolean,

    sourcePath?: (sourcePath: string) => string,

    sourceFinder?: (filePath: string) => string,

    // Whether to create `lcov.info`
    lcov?: boolean,

    watermarks?: [number, number] | {
        statements: [number, number],
        functions: [number, number],
        branches: [number, number],
        lines: [number, number]
    },

    // Whether inline all scripts to the single HTML file.
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