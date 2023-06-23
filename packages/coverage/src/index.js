
import istanbulLibCoverage from 'istanbul-lib-coverage';
import istanbulLibReport from 'istanbul-lib-report';

import * as convertSourceMap from 'convert-source-map';
import axios from 'axios';

import {
    TraceMap,
    originalPositionFor,
    generatedPositionFor,
    sourceContentFor,
    GREATEST_LOWER_BOUND,
    LEAST_UPPER_BOUND
} from '@jridgewell/trace-mapping';

import { mergeScriptCovs } from '@bcoe/v8-coverage';

const BIAS = {
    left: GREATEST_LOWER_BOUND,
    right: LEAST_UPPER_BOUND
};

export {

    istanbulLibCoverage,
    istanbulLibReport,

    convertSourceMap,
    axios,

    TraceMap,
    originalPositionFor,
    generatedPositionFor,
    sourceContentFor,
    BIAS,

    mergeScriptCovs
};
