import { TestInfo } from "@playwright/test"

export function merge(reportDataList: [], options?: object): Promise<void>;

export function attachAuditReport(runnerResult: object, testInfo: TestInfo, options?: object): Promise<object | void>;

export function addCoverageReport(v8list: object[], testInfo: TestInfo): Promise<object | void>;
export function attachCoverageReport(coverageInput: object[] | object, testInfo: TestInfo, options?: object): Promise<object | void>;

export function attachNetworkReport(har: string | Buffer, testInfo: TestInfo, options?: object): Promise<object | void>;