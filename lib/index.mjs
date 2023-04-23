import MonocartReporter from './index.js';

export default MonocartReporter;
export { MonocartReporter };

export const merge = MonocartReporter.merge;

// Deprecated
export const takeCoverage = MonocartReporter.attachCoverageReport;

export const attachCoverageReport = MonocartReporter.attachCoverageReport;
export const attachNetworkReport = MonocartReporter.attachNetworkReport;
