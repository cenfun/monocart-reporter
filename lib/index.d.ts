import { TestInfo } from "@playwright/test"

import type { CoverageReportOptions } from "monocart-coverage-reports";

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
    coverageData: any[] | any,
    testInfo: TestInfo
): Promise<any | void>;

export function attachCoverageReport(
    coverageData: any[] | any,
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