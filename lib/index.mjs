import MonocartReporter from './index.js';

export default MonocartReporter;
export { MonocartReporter };

export const merge = MonocartReporter.merge;

export const addCoverageReport = MonocartReporter.addCoverageReport;

export const attachAuditReport = MonocartReporter.attachAuditReport;
export const attachCoverageReport = MonocartReporter.attachCoverageReport;
export const attachNetworkReport = MonocartReporter.attachNetworkReport;
