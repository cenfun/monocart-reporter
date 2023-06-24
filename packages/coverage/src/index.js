import istanbulLibCoverage from 'istanbul-lib-coverage';
import istanbulLibReport from 'istanbul-lib-report';

import * as convertSourceMap from 'convert-source-map';
import axios from 'axios';

import { decode } from '@jridgewell/sourcemap-codec';

import { mergeScriptCovs } from '@bcoe/v8-coverage';

export {

    istanbulLibCoverage,
    istanbulLibReport,

    convertSourceMap,
    axios,

    decode,

    mergeScriptCovs
};
