(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("coverage-istanbul", [], factory);
	else if(typeof exports === 'object')
		exports["coverage-istanbul"] = factory();
	else
		root["coverage-istanbul"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./test/mock/minify/comments.js":
/*!**************************************!*\
  !*** ./test/mock/minify/comments.js ***!
  \**************************************/
/***/ (() => {

function cov_1rblsb9a1x() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\minify\\comments.js";
  var hash = "270c133a894e491adea2d322b9453481478f193e";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\minify\\comments.js",
    statementMap: {
      "0": {
        start: {
          line: 4,
          column: 0
        },
        end: {
          line: 4,
          column: 35
        }
      },
      "1": {
        start: {
          line: 7,
          column: 0
        },
        end: {
          line: 7,
          column: 29
        }
      },
      "2": {
        start: {
          line: 10,
          column: 27
        },
        end: {
          line: 10,
          column: 55
        }
      },
      "3": {
        start: {
          line: 12,
          column: 5
        },
        end: {
          line: 16,
          column: 8
        }
      },
      "4": {
        start: {
          line: 23,
          column: 11
        },
        end: {
          line: 23,
          column: 39
        }
      },
      "5": {
        start: {
          line: 25,
          column: 0
        },
        end: {
          line: 25,
          column: 27
        }
      },
      "6": {
        start: {
          line: 29,
          column: 7
        },
        end: {
          line: 29,
          column: 35
        }
      },
      "7": {
        start: {
          line: 33,
          column: 0
        },
        end: {
          line: 33,
          column: 28
        }
      },
      "8": {
        start: {
          line: 38,
          column: 4
        },
        end: {
          line: 38,
          column: 32
        }
      },
      "9": {
        start: {
          line: 38,
          column: 46
        },
        end: {
          line: 38,
          column: 74
        }
      },
      "10": {
        start: {
          line: 46,
          column: 9
        },
        end: {
          line: 46,
          column: 37
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0
    },
    f: {},
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "270c133a894e491adea2d322b9453481478f193e"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1rblsb9a1x = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1rblsb9a1x();
cov_1rblsb9a1x().s[0]++;
/* eslint-disable no-trailing-spaces,line-comment-position,no-inline-comments,indent,no-multi-spaces,no-multiple-empty-lines */
// LineComment

console.log('some"//"\\\'thing\\'); // comment /*  

// comment /* ---
cov_1rblsb9a1x().s[1]++;
console.log('some//thing/*'); /*  
                              ddd
                              */
cov_1rblsb9a1x().s[2]++;
console.log('some/*/thing');
//
cov_1rblsb9a1x().s[3]++;
console.log(`
        '/*
            "//"
        */'
     `);

/**
    * BlockComment
    
 *
       
        */
cov_1rblsb9a1x().s[4]++;
console.log('some/*/thing');
cov_1rblsb9a1x().s[5]++;
console.log('some//thing'); // end of line

/*
    connected
*/
cov_1rblsb9a1x().s[6]++;
console.log('some*//thing'); /*
                             cross line
                             */
cov_1rblsb9a1x().s[7]++;
console.log('some*//thing'); /*
                             cross line
                             */
cov_1rblsb9a1x().s[8]++;
console.log('some*//thing'); /* inline */
cov_1rblsb9a1x().s[9]++;
console.log('some*//thing');

/*
 multiple line
//

 */

/**/
cov_1rblsb9a1x().s[10]++;
console.log('some*//thing'); /*
                             console.log('some//*thing')
                             */

/***/ }),

/***/ "./test/mock/minify/demo.js":
/*!**********************************!*\
  !*** ./test/mock/minify/demo.js ***!
  \**********************************/
/***/ (() => {

function cov_paohdvusi() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\minify\\demo.js";
  var hash = "7355e8761e3547d679cff9dc29cedcd958681b33";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\minify\\demo.js",
    statementMap: {
      "0": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 20,
          column: 5
        }
      },
      "1": {
        start: {
          line: 19,
          column: 8
        },
        end: {
          line: 19,
          column: 23
        }
      },
      "2": {
        start: {
          line: 21,
          column: 4
        },
        end: {
          line: 23,
          column: 5
        }
      },
      "3": {
        start: {
          line: 22,
          column: 8
        },
        end: {
          line: 22,
          column: 19
        }
      },
      "4": {
        start: {
          line: 24,
          column: 4
        },
        end: {
          line: 26,
          column: 5
        }
      },
      "5": {
        start: {
          line: 25,
          column: 8
        },
        end: {
          line: 25,
          column: 23
        }
      },
      "6": {
        start: {
          line: 28,
          column: 4
        },
        end: {
          line: 30,
          column: 14
        }
      },
      "7": {
        start: {
          line: 29,
          column: 8
        },
        end: {
          line: 29,
          column: 37
        }
      },
      "8": {
        start: {
          line: 33,
          column: 13
        },
        end: {
          line: 60,
          column: 1
        }
      },
      "9": {
        start: {
          line: 35,
          column: 4
        },
        end: {
          line: 35,
          column: 14
        }
      },
      "10": {
        start: {
          line: 36,
          column: 4
        },
        end: {
          line: 36,
          column: 14
        }
      },
      "11": {
        start: {
          line: 38,
          column: 14
        },
        end: {
          line: 38,
          column: 16
        }
      },
      "12": {
        start: {
          line: 39,
          column: 4
        },
        end: {
          line: 41,
          column: 5
        }
      },
      "13": {
        start: {
          line: 40,
          column: 8
        },
        end: {
          line: 40,
          column: 19
        }
      },
      "14": {
        start: {
          line: 43,
          column: 4
        },
        end: {
          line: 45,
          column: 5
        }
      },
      "15": {
        start: {
          line: 43,
          column: 17
        },
        end: {
          line: 43,
          column: 18
        }
      },
      "16": {
        start: {
          line: 44,
          column: 8
        },
        end: {
          line: 44,
          column: 18
        }
      },
      "17": {
        start: {
          line: 47,
          column: 14
        },
        end: {
          line: 47,
          column: 19
        }
      },
      "18": {
        start: {
          line: 48,
          column: 4
        },
        end: {
          line: 50,
          column: 5
        }
      },
      "19": {
        start: {
          line: 49,
          column: 8
        },
        end: {
          line: 49,
          column: 37
        }
      },
      "20": {
        start: {
          line: 52,
          column: 16
        },
        end: {
          line: 52,
          column: 40
        }
      },
      "21": {
        start: {
          line: 54,
          column: 15
        },
        end: {
          line: 54,
          column: 33
        }
      },
      "22": {
        start: {
          line: 55,
          column: 4
        },
        end: {
          line: 58,
          column: 5
        }
      },
      "23": {
        start: {
          line: 56,
          column: 41
        },
        end: {
          line: 56,
          column: 43
        }
      },
      "24": {
        start: {
          line: 57,
          column: 8
        },
        end: {
          line: 57,
          column: 58
        }
      },
      "25": {
        start: {
          line: 62,
          column: 0
        },
        end: {
          line: 64,
          column: 2
        }
      },
      "26": {
        start: {
          line: 63,
          column: 4
        },
        end: {
          line: 63,
          column: 11
        }
      }
    },
    fnMap: {
      "0": {
        name: "callback",
        decl: {
          start: {
            line: 2,
            column: 9
          },
          end: {
            line: 2,
            column: 17
          }
        },
        loc: {
          start: {
            line: 2,
            column: 20
          },
          end: {
            line: 4,
            column: 1
          }
        },
        line: 2
      },
      "1": {
        name: "other",
        decl: {
          start: {
            line: 11,
            column: 9
          },
          end: {
            line: 11,
            column: 14
          }
        },
        loc: {
          start: {
            line: 11,
            column: 17
          },
          end: {
            line: 13,
            column: 1
          }
        },
        line: 11
      },
      "2": {
        name: "method",
        decl: {
          start: {
            line: 16,
            column: 9
          },
          end: {
            line: 16,
            column: 15
          }
        },
        loc: {
          start: {
            line: 16,
            column: 19
          },
          end: {
            line: 31,
            column: 1
          }
        },
        line: 16
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 28,
            column: 27
          },
          end: {
            line: 28,
            column: 28
          }
        },
        loc: {
          start: {
            line: 28,
            column: 33
          },
          end: {
            line: 30,
            column: 5
          }
        },
        line: 28
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 33,
            column: 13
          },
          end: {
            line: 33,
            column: 14
          }
        },
        loc: {
          start: {
            line: 33,
            column: 19
          },
          end: {
            line: 60,
            column: 1
          }
        },
        line: 33
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 62,
            column: 16
          },
          end: {
            line: 62,
            column: 17
          }
        },
        loc: {
          start: {
            line: 62,
            column: 22
          },
          end: {
            line: 64,
            column: 1
          }
        },
        line: 62
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 18,
            column: 4
          },
          end: {
            line: 20,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 18,
            column: 4
          },
          end: {
            line: 20,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 18
      },
      "1": {
        loc: {
          start: {
            line: 21,
            column: 4
          },
          end: {
            line: 23,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 21,
            column: 4
          },
          end: {
            line: 23,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 21
      },
      "2": {
        loc: {
          start: {
            line: 24,
            column: 4
          },
          end: {
            line: 26,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 24,
            column: 4
          },
          end: {
            line: 26,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 24
      },
      "3": {
        loc: {
          start: {
            line: 28,
            column: 11
          },
          end: {
            line: 30,
            column: 13
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 28,
            column: 27
          },
          end: {
            line: 30,
            column: 5
          }
        }, {
          start: {
            line: 30,
            column: 8
          },
          end: {
            line: 30,
            column: 13
          }
        }],
        line: 28
      },
      "4": {
        loc: {
          start: {
            line: 39,
            column: 4
          },
          end: {
            line: 41,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 39,
            column: 4
          },
          end: {
            line: 41,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 39
      },
      "5": {
        loc: {
          start: {
            line: 48,
            column: 4
          },
          end: {
            line: 50,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 48,
            column: 4
          },
          end: {
            line: 50,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 48
      },
      "6": {
        loc: {
          start: {
            line: 55,
            column: 4
          },
          end: {
            line: 58,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 55,
            column: 4
          },
          end: {
            line: 58,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 55
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "7355e8761e3547d679cff9dc29cedcd958681b33"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_paohdvusi = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_paohdvusi();
function callback() {
  cov_paohdvusi().f[0]++;
}

/*
    block comment
*/

// v8 ignore next 3
function other() {
  cov_paohdvusi().f[1]++;
}

/* inline block */
function method(v) {
  cov_paohdvusi().f[2]++;
  cov_paohdvusi().s[0]++;
  // console.log("method", v);
  if (v === 2) {
    cov_paohdvusi().b[0][0]++;
    cov_paohdvusi().s[1]++;
    console.log(v);
  } else {
    cov_paohdvusi().b[0][1]++;
  }
  cov_paohdvusi().s[2]++;
  if (v % 3 === 0) {
    cov_paohdvusi().b[1][0]++;
    cov_paohdvusi().s[3]++;
    callback();
  } else {
    cov_paohdvusi().b[1][1]++;
  }
  cov_paohdvusi().s[4]++;
  if (v === 3) {
    cov_paohdvusi().b[2][0]++;
    cov_paohdvusi().s[5]++;
    console.log(v);
  } else {
    cov_paohdvusi().b[2][1]++;
  }
  cov_paohdvusi().s[6]++;
  return v === 'other' ? (cov_paohdvusi().b[3][0]++, () => {
    cov_paohdvusi().f[3]++;
    cov_paohdvusi().s[7]++;
    console.log('never covered');
  }) : (cov_paohdvusi().b[3][1]++, other);
}
cov_paohdvusi().s[8]++;
const main = () => {
  cov_paohdvusi().f[4]++;
  cov_paohdvusi().s[9]++;
  // console.log('main');
  method(1);
  cov_paohdvusi().s[10]++;
  method(2);
  const a = (cov_paohdvusi().s[11]++, 10);
  cov_paohdvusi().s[12]++;
  if (a === 11) {
    cov_paohdvusi().b[4][0]++;
    cov_paohdvusi().s[13]++;
    callback();
  } else {
    cov_paohdvusi().b[4][1]++;
  }
  cov_paohdvusi().s[14]++;
  for (let i = (cov_paohdvusi().s[15]++, 0); i < 1000; i++) {
    cov_paohdvusi().s[16]++;
    method(i);
  }
  const f = (cov_paohdvusi().s[17]++, false);
  cov_paohdvusi().s[18]++;
  if (f) {
    cov_paohdvusi().b[5][0]++;
    cov_paohdvusi().s[19]++;
    console.log('never covered');
  } else {
    cov_paohdvusi().b[5][1]++;
  }
  const str = (cov_paohdvusi().s[20]++, '📙 Emoji — 😃 💁👌🎍😍');
  const lz = (cov_paohdvusi().s[21]++, window['lz-utils']);
  cov_paohdvusi().s[22]++;
  if (lz) {
    cov_paohdvusi().b[6][0]++;
    const {
      compress,
      decompress
    } = (cov_paohdvusi().s[23]++, lz);
    cov_paohdvusi().s[24]++;
    console.assert(str === decompress(compress(str)));
  } else {
    cov_paohdvusi().b[6][1]++;
  }
};
cov_paohdvusi().s[25]++;
window.onload = () => {
  cov_paohdvusi().f[5]++;
  cov_paohdvusi().s[26]++;
  main();
};

/***/ }),

/***/ "./test/mock/src/branch.js":
/*!*********************************!*\
  !*** ./test/mock/src/branch.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function cov_25b77c5izp() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch.js";
  var hash = "ec3421f807104578175906657c366b79352e5129";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch.js",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 30
        },
        end: {
          line: 3,
          column: 64
        }
      },
      "1": {
        start: {
          line: 4,
          column: 20
        },
        end: {
          line: 4,
          column: 45
        }
      },
      "2": {
        start: {
          line: 5,
          column: 26
        },
        end: {
          line: 5,
          column: 56
        }
      },
      "3": {
        start: {
          line: 6,
          column: 24
        },
        end: {
          line: 6,
          column: 53
        }
      },
      "4": {
        start: {
          line: 8,
          column: 26
        },
        end: {
          line: 13,
          column: 1
        }
      },
      "5": {
        start: {
          line: 9,
          column: 17
        },
        end: {
          line: 9,
          column: 32
        }
      },
      "6": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 12,
          column: 7
        }
      },
      "7": {
        start: {
          line: 11,
          column: 8
        },
        end: {
          line: 11,
          column: 23
        }
      },
      "8": {
        start: {
          line: 15,
          column: 24
        },
        end: {
          line: 23,
          column: 1
        }
      },
      "9": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 22,
          column: 5
        }
      },
      "10": {
        start: {
          line: 16,
          column: 17
        },
        end: {
          line: 16,
          column: 18
        }
      },
      "11": {
        start: {
          line: 17,
          column: 8
        },
        end: {
          line: 21,
          column: 9
        }
      },
      "12": {
        start: {
          line: 18,
          column: 12
        },
        end: {
          line: 18,
          column: 27
        }
      },
      "13": {
        start: {
          line: 19,
          column: 15
        },
        end: {
          line: 21,
          column: 9
        }
      },
      "14": {
        start: {
          line: 20,
          column: 12
        },
        end: {
          line: 20,
          column: 32
        }
      },
      "15": {
        start: {
          line: 30,
          column: 15
        },
        end: {
          line: 38,
          column: 1
        }
      },
      "16": {
        start: {
          line: 31,
          column: 4
        },
        end: {
          line: 31,
          column: 22
        }
      },
      "17": {
        start: {
          line: 33,
          column: 4
        },
        end: {
          line: 33,
          column: 28
        }
      },
      "18": {
        start: {
          line: 34,
          column: 4
        },
        end: {
          line: 34,
          column: 18
        }
      },
      "19": {
        start: {
          line: 35,
          column: 4
        },
        end: {
          line: 35,
          column: 24
        }
      },
      "20": {
        start: {
          line: 36,
          column: 4
        },
        end: {
          line: 36,
          column: 22
        }
      },
      "21": {
        start: {
          line: 40,
          column: 0
        },
        end: {
          line: 40,
          column: 24
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 8,
            column: 26
          },
          end: {
            line: 8,
            column: 27
          }
        },
        loc: {
          start: {
            line: 8,
            column: 32
          },
          end: {
            line: 13,
            column: 1
          }
        },
        line: 8
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 10,
            column: 17
          },
          end: {
            line: 10,
            column: 18
          }
        },
        loc: {
          start: {
            line: 10,
            column: 24
          },
          end: {
            line: 12,
            column: 5
          }
        },
        line: 10
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 15,
            column: 24
          },
          end: {
            line: 15,
            column: 25
          }
        },
        loc: {
          start: {
            line: 15,
            column: 30
          },
          end: {
            line: 23,
            column: 1
          }
        },
        line: 15
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 30,
            column: 15
          },
          end: {
            line: 30,
            column: 16
          }
        },
        loc: {
          start: {
            line: 30,
            column: 21
          },
          end: {
            line: 38,
            column: 1
          }
        },
        line: 30
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 17,
            column: 8
          },
          end: {
            line: 21,
            column: 9
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 17,
            column: 8
          },
          end: {
            line: 21,
            column: 9
          }
        }, {
          start: {
            line: 19,
            column: 15
          },
          end: {
            line: 21,
            column: 9
          }
        }],
        line: 17
      },
      "1": {
        loc: {
          start: {
            line: 19,
            column: 15
          },
          end: {
            line: 21,
            column: 9
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 19,
            column: 15
          },
          end: {
            line: 21,
            column: 9
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 19
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "ec3421f807104578175906657c366b79352e5129"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_25b77c5izp = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_25b77c5izp();
/* branches test cases */

const ConditionalExpression = (cov_25b77c5izp().s[0]++, __webpack_require__(/*! ./branch/conditional.js */ "./test/mock/src/branch/conditional.js"));
const IfStatement = (cov_25b77c5izp().s[1]++, __webpack_require__(/*! ./branch/if.js */ "./test/mock/src/branch/if.js"));
const LogicalExpression = (cov_25b77c5izp().s[2]++, __webpack_require__(/*! ./branch/logical.js */ "./test/mock/src/branch/logical.js"));
const SwitchStatement = (cov_25b77c5izp().s[3]++, __webpack_require__(/*! ./branch/switch.js */ "./test/mock/src/branch/switch.js"));
cov_25b77c5izp().s[4]++;
const uncoveredFunction = () => {
  cov_25b77c5izp().f[0]++;
  const list = (cov_25b77c5izp().s[5]++, [1, 2, 3, 4, 5]);
  cov_25b77c5izp().s[6]++;
  list.forEach(v => {
    cov_25b77c5izp().f[1]++;
    cov_25b77c5izp().s[7]++;
    console.log(v);
  });
};
cov_25b77c5izp().s[8]++;
const coveredFunction = () => {
  cov_25b77c5izp().f[2]++;
  cov_25b77c5izp().s[9]++;
  for (let i = (cov_25b77c5izp().s[10]++, 0); i < 3; i++) {
    cov_25b77c5izp().s[11]++;
    if (i > 1) {
      cov_25b77c5izp().b[0][0]++;
      cov_25b77c5izp().s[12]++;
      console.log(i);
    } else {
      cov_25b77c5izp().b[0][1]++;
      cov_25b77c5izp().s[13]++;
      if (i > 100) {
        cov_25b77c5izp().b[1][0]++;
        cov_25b77c5izp().s[14]++;
        uncoveredFunction();
      } else {
        cov_25b77c5izp().b[1][1]++;
      }
    }
  }
};

// AssignmentPattern
// ((a = 0) => {
//     console.log(a);
// })();
cov_25b77c5izp().s[15]++;
const branch = () => {
  cov_25b77c5izp().f[3]++;
  cov_25b77c5izp().s[16]++;
  coveredFunction();
  cov_25b77c5izp().s[17]++;
  ConditionalExpression();
  cov_25b77c5izp().s[18]++;
  IfStatement();
  cov_25b77c5izp().s[19]++;
  LogicalExpression();
  cov_25b77c5izp().s[20]++;
  SwitchStatement();
};
cov_25b77c5izp().s[21]++;
module.exports = branch;

/***/ }),

/***/ "./test/mock/src/branch/conditional.js":
/*!*********************************************!*\
  !*** ./test/mock/src/branch/conditional.js ***!
  \*********************************************/
/***/ ((module) => {

function cov_214xx38dkg() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\conditional.js";
  var hash = "be29a72d70d7dab48882e004b92bee04233fa242";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\conditional.js",
    statementMap: {
      "0": {
        start: {
          line: 3,
          column: 30
        },
        end: {
          line: 8,
          column: 1
        }
      },
      "1": {
        start: {
          line: 4,
          column: 14
        },
        end: {
          line: 4,
          column: 36
        }
      },
      "2": {
        start: {
          line: 5,
          column: 4
        },
        end: {
          line: 5,
          column: 19
        }
      },
      "3": {
        start: {
          line: 6,
          column: 14
        },
        end: {
          line: 6,
          column: 36
        }
      },
      "4": {
        start: {
          line: 7,
          column: 4
        },
        end: {
          line: 7,
          column: 19
        }
      },
      "5": {
        start: {
          line: 9,
          column: 33
        },
        end: {
          line: 15,
          column: 1
        }
      },
      "6": {
        start: {
          line: 10,
          column: 14
        },
        end: {
          line: 10,
          column: 36
        }
      },
      "7": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 19
        }
      },
      "8": {
        start: {
          line: 12,
          column: 14
        },
        end: {
          line: 12,
          column: 36
        }
      },
      "9": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 19
        }
      },
      "10": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 14,
          column: 36
        }
      },
      "11": {
        start: {
          line: 16,
          column: 33
        },
        end: {
          line: 22,
          column: 1
        }
      },
      "12": {
        start: {
          line: 17,
          column: 14
        },
        end: {
          line: 17,
          column: 36
        }
      },
      "13": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 18,
          column: 19
        }
      },
      "14": {
        start: {
          line: 19,
          column: 14
        },
        end: {
          line: 19,
          column: 36
        }
      },
      "15": {
        start: {
          line: 20,
          column: 4
        },
        end: {
          line: 20,
          column: 19
        }
      },
      "16": {
        start: {
          line: 21,
          column: 4
        },
        end: {
          line: 21,
          column: 36
        }
      },
      "17": {
        start: {
          line: 23,
          column: 33
        },
        end: {
          line: 29,
          column: 1
        }
      },
      "18": {
        start: {
          line: 24,
          column: 14
        },
        end: {
          line: 24,
          column: 36
        }
      },
      "19": {
        start: {
          line: 25,
          column: 4
        },
        end: {
          line: 25,
          column: 19
        }
      },
      "20": {
        start: {
          line: 26,
          column: 14
        },
        end: {
          line: 26,
          column: 36
        }
      },
      "21": {
        start: {
          line: 27,
          column: 4
        },
        end: {
          line: 27,
          column: 19
        }
      },
      "22": {
        start: {
          line: 28,
          column: 4
        },
        end: {
          line: 28,
          column: 36
        }
      },
      "23": {
        start: {
          line: 30,
          column: 33
        },
        end: {
          line: 36,
          column: 1
        }
      },
      "24": {
        start: {
          line: 31,
          column: 14
        },
        end: {
          line: 31,
          column: 36
        }
      },
      "25": {
        start: {
          line: 32,
          column: 4
        },
        end: {
          line: 32,
          column: 19
        }
      },
      "26": {
        start: {
          line: 33,
          column: 14
        },
        end: {
          line: 33,
          column: 36
        }
      },
      "27": {
        start: {
          line: 34,
          column: 4
        },
        end: {
          line: 34,
          column: 19
        }
      },
      "28": {
        start: {
          line: 35,
          column: 4
        },
        end: {
          line: 35,
          column: 36
        }
      },
      "29": {
        start: {
          line: 39,
          column: 0
        },
        end: {
          line: 45,
          column: 2
        }
      },
      "30": {
        start: {
          line: 41,
          column: 4
        },
        end: {
          line: 41,
          column: 41
        }
      },
      "31": {
        start: {
          line: 42,
          column: 4
        },
        end: {
          line: 42,
          column: 42
        }
      },
      "32": {
        start: {
          line: 43,
          column: 4
        },
        end: {
          line: 43,
          column: 42
        }
      },
      "33": {
        start: {
          line: 44,
          column: 4
        },
        end: {
          line: 44,
          column: 43
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 3,
            column: 30
          },
          end: {
            line: 3,
            column: 31
          }
        },
        loc: {
          start: {
            line: 3,
            column: 44
          },
          end: {
            line: 8,
            column: 1
          }
        },
        line: 3
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 9,
            column: 33
          },
          end: {
            line: 9,
            column: 34
          }
        },
        loc: {
          start: {
            line: 9,
            column: 47
          },
          end: {
            line: 15,
            column: 1
          }
        },
        line: 9
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 16,
            column: 33
          },
          end: {
            line: 16,
            column: 34
          }
        },
        loc: {
          start: {
            line: 16,
            column: 47
          },
          end: {
            line: 22,
            column: 1
          }
        },
        line: 16
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 23,
            column: 33
          },
          end: {
            line: 23,
            column: 34
          }
        },
        loc: {
          start: {
            line: 23,
            column: 47
          },
          end: {
            line: 29,
            column: 1
          }
        },
        line: 23
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 30,
            column: 33
          },
          end: {
            line: 30,
            column: 34
          }
        },
        loc: {
          start: {
            line: 30,
            column: 47
          },
          end: {
            line: 36,
            column: 1
          }
        },
        line: 30
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 39,
            column: 17
          },
          end: {
            line: 39,
            column: 18
          }
        },
        loc: {
          start: {
            line: 39,
            column: 23
          },
          end: {
            line: 45,
            column: 1
          }
        },
        line: 39
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 4,
            column: 14
          },
          end: {
            line: 4,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 4,
            column: 20
          },
          end: {
            line: 4,
            column: 26
          }
        }, {
          start: {
            line: 4,
            column: 29
          },
          end: {
            line: 4,
            column: 36
          }
        }],
        line: 4
      },
      "1": {
        loc: {
          start: {
            line: 6,
            column: 14
          },
          end: {
            line: 6,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 6,
            column: 20
          },
          end: {
            line: 6,
            column: 26
          }
        }, {
          start: {
            line: 6,
            column: 29
          },
          end: {
            line: 6,
            column: 36
          }
        }],
        line: 6
      },
      "2": {
        loc: {
          start: {
            line: 10,
            column: 14
          },
          end: {
            line: 10,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 10,
            column: 20
          },
          end: {
            line: 10,
            column: 26
          }
        }, {
          start: {
            line: 10,
            column: 29
          },
          end: {
            line: 10,
            column: 36
          }
        }],
        line: 10
      },
      "3": {
        loc: {
          start: {
            line: 12,
            column: 14
          },
          end: {
            line: 12,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 12,
            column: 20
          },
          end: {
            line: 12,
            column: 26
          }
        }, {
          start: {
            line: 12,
            column: 29
          },
          end: {
            line: 12,
            column: 36
          }
        }],
        line: 12
      },
      "4": {
        loc: {
          start: {
            line: 17,
            column: 14
          },
          end: {
            line: 17,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 17,
            column: 20
          },
          end: {
            line: 17,
            column: 26
          }
        }, {
          start: {
            line: 17,
            column: 29
          },
          end: {
            line: 17,
            column: 36
          }
        }],
        line: 17
      },
      "5": {
        loc: {
          start: {
            line: 19,
            column: 14
          },
          end: {
            line: 19,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 19,
            column: 20
          },
          end: {
            line: 19,
            column: 26
          }
        }, {
          start: {
            line: 19,
            column: 29
          },
          end: {
            line: 19,
            column: 36
          }
        }],
        line: 19
      },
      "6": {
        loc: {
          start: {
            line: 24,
            column: 14
          },
          end: {
            line: 24,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 24,
            column: 20
          },
          end: {
            line: 24,
            column: 26
          }
        }, {
          start: {
            line: 24,
            column: 29
          },
          end: {
            line: 24,
            column: 36
          }
        }],
        line: 24
      },
      "7": {
        loc: {
          start: {
            line: 26,
            column: 14
          },
          end: {
            line: 26,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 26,
            column: 20
          },
          end: {
            line: 26,
            column: 26
          }
        }, {
          start: {
            line: 26,
            column: 29
          },
          end: {
            line: 26,
            column: 36
          }
        }],
        line: 26
      },
      "8": {
        loc: {
          start: {
            line: 31,
            column: 14
          },
          end: {
            line: 31,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 31,
            column: 20
          },
          end: {
            line: 31,
            column: 26
          }
        }, {
          start: {
            line: 31,
            column: 29
          },
          end: {
            line: 31,
            column: 36
          }
        }],
        line: 31
      },
      "9": {
        loc: {
          start: {
            line: 33,
            column: 14
          },
          end: {
            line: 33,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 33,
            column: 20
          },
          end: {
            line: 33,
            column: 26
          }
        }, {
          start: {
            line: 33,
            column: 29
          },
          end: {
            line: 33,
            column: 36
          }
        }],
        line: 33
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0],
      "8": [0, 0],
      "9": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "be29a72d70d7dab48882e004b92bee04233fa242"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_214xx38dkg = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_214xx38dkg();
cov_214xx38dkg().s[0]++;
// 5 x 4 = 20
const ConditionalExpression = (tf1, tf2) => {
  cov_214xx38dkg().f[0]++;
  const a = (cov_214xx38dkg().s[1]++, tf1 ? (cov_214xx38dkg().b[0][0]++, 'true') : (cov_214xx38dkg().b[0][1]++, 'false'));
  cov_214xx38dkg().s[2]++;
  console.log(a);
  const b = (cov_214xx38dkg().s[3]++, tf2 ? (cov_214xx38dkg().b[1][0]++, 'true') : (cov_214xx38dkg().b[1][1]++, 'false'));
  cov_214xx38dkg().s[4]++;
  console.log(b);
};
cov_214xx38dkg().s[5]++;
const ConditionalExpression_11 = (tf1, tf2) => {
  cov_214xx38dkg().f[1]++;
  const a = (cov_214xx38dkg().s[6]++, tf1 ? (cov_214xx38dkg().b[2][0]++, 'true') : (cov_214xx38dkg().b[2][1]++, 'false'));
  cov_214xx38dkg().s[7]++;
  console.log(a);
  const b = (cov_214xx38dkg().s[8]++, tf2 ? (cov_214xx38dkg().b[3][0]++, 'true') : (cov_214xx38dkg().b[3][1]++, 'false'));
  cov_214xx38dkg().s[9]++;
  console.log(b);
  cov_214xx38dkg().s[10]++;
  ConditionalExpression(tf1, tf2);
};
cov_214xx38dkg().s[11]++;
const ConditionalExpression_10 = (tf1, tf2) => {
  cov_214xx38dkg().f[2]++;
  const a = (cov_214xx38dkg().s[12]++, tf1 ? (cov_214xx38dkg().b[4][0]++, 'true') : (cov_214xx38dkg().b[4][1]++, 'false'));
  cov_214xx38dkg().s[13]++;
  console.log(a);
  const b = (cov_214xx38dkg().s[14]++, tf2 ? (cov_214xx38dkg().b[5][0]++, 'true') : (cov_214xx38dkg().b[5][1]++, 'false'));
  cov_214xx38dkg().s[15]++;
  console.log(b);
  cov_214xx38dkg().s[16]++;
  ConditionalExpression(tf1, tf2);
};
cov_214xx38dkg().s[17]++;
const ConditionalExpression_01 = (tf1, tf2) => {
  cov_214xx38dkg().f[3]++;
  const a = (cov_214xx38dkg().s[18]++, tf1 ? (cov_214xx38dkg().b[6][0]++, 'true') : (cov_214xx38dkg().b[6][1]++, 'false'));
  cov_214xx38dkg().s[19]++;
  console.log(a);
  const b = (cov_214xx38dkg().s[20]++, tf2 ? (cov_214xx38dkg().b[7][0]++, 'true') : (cov_214xx38dkg().b[7][1]++, 'false'));
  cov_214xx38dkg().s[21]++;
  console.log(b);
  cov_214xx38dkg().s[22]++;
  ConditionalExpression(tf1, tf2);
};
cov_214xx38dkg().s[23]++;
const ConditionalExpression_00 = (tf1, tf2) => {
  cov_214xx38dkg().f[4]++;
  const a = (cov_214xx38dkg().s[24]++, tf1 ? (cov_214xx38dkg().b[8][0]++, 'true') : (cov_214xx38dkg().b[8][1]++, 'false'));
  cov_214xx38dkg().s[25]++;
  console.log(a);
  const b = (cov_214xx38dkg().s[26]++, tf2 ? (cov_214xx38dkg().b[9][0]++, 'true') : (cov_214xx38dkg().b[9][1]++, 'false'));
  cov_214xx38dkg().s[27]++;
  console.log(b);
  cov_214xx38dkg().s[28]++;
  ConditionalExpression(tf1, tf2);
};
cov_214xx38dkg().s[29]++;
module.exports = () => {
  cov_214xx38dkg().f[5]++;
  cov_214xx38dkg().s[30]++;
  ConditionalExpression_11(true, true);
  cov_214xx38dkg().s[31]++;
  ConditionalExpression_10(true, false);
  cov_214xx38dkg().s[32]++;
  ConditionalExpression_01(false, true);
  cov_214xx38dkg().s[33]++;
  ConditionalExpression_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/if.js":
/*!************************************!*\
  !*** ./test/mock/src/branch/if.js ***!
  \************************************/
/***/ ((module) => {

function cov_x538tolzb() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\if.js";
  var hash = "ace9a980cb05f19ac36a4d35ed34b6659e77eaee";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\if.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 20
        },
        end: {
          line: 22,
          column: 1
        }
      },
      "1": {
        start: {
          line: 4,
          column: 4
        },
        end: {
          line: 6,
          column: 5
        }
      },
      "2": {
        start: {
          line: 5,
          column: 8
        },
        end: {
          line: 5,
          column: 27
        }
      },
      "3": {
        start: {
          line: 8,
          column: 4
        },
        end: {
          line: 12,
          column: 5
        }
      },
      "4": {
        start: {
          line: 9,
          column: 8
        },
        end: {
          line: 9,
          column: 27
        }
      },
      "5": {
        start: {
          line: 10,
          column: 11
        },
        end: {
          line: 12,
          column: 5
        }
      },
      "6": {
        start: {
          line: 11,
          column: 8
        },
        end: {
          line: 11,
          column: 31
        }
      },
      "7": {
        start: {
          line: 14,
          column: 4
        },
        end: {
          line: 20,
          column: 5
        }
      },
      "8": {
        start: {
          line: 15,
          column: 8
        },
        end: {
          line: 15,
          column: 27
        }
      },
      "9": {
        start: {
          line: 16,
          column: 11
        },
        end: {
          line: 20,
          column: 5
        }
      },
      "10": {
        start: {
          line: 17,
          column: 8
        },
        end: {
          line: 17,
          column: 31
        }
      },
      "11": {
        start: {
          line: 19,
          column: 8
        },
        end: {
          line: 19,
          column: 29
        }
      },
      "12": {
        start: {
          line: 24,
          column: 23
        },
        end: {
          line: 46,
          column: 1
        }
      },
      "13": {
        start: {
          line: 26,
          column: 4
        },
        end: {
          line: 28,
          column: 5
        }
      },
      "14": {
        start: {
          line: 27,
          column: 8
        },
        end: {
          line: 27,
          column: 27
        }
      },
      "15": {
        start: {
          line: 30,
          column: 4
        },
        end: {
          line: 34,
          column: 5
        }
      },
      "16": {
        start: {
          line: 31,
          column: 8
        },
        end: {
          line: 31,
          column: 27
        }
      },
      "17": {
        start: {
          line: 32,
          column: 11
        },
        end: {
          line: 34,
          column: 5
        }
      },
      "18": {
        start: {
          line: 33,
          column: 8
        },
        end: {
          line: 33,
          column: 31
        }
      },
      "19": {
        start: {
          line: 36,
          column: 4
        },
        end: {
          line: 42,
          column: 5
        }
      },
      "20": {
        start: {
          line: 37,
          column: 8
        },
        end: {
          line: 37,
          column: 27
        }
      },
      "21": {
        start: {
          line: 38,
          column: 11
        },
        end: {
          line: 42,
          column: 5
        }
      },
      "22": {
        start: {
          line: 39,
          column: 8
        },
        end: {
          line: 39,
          column: 31
        }
      },
      "23": {
        start: {
          line: 41,
          column: 8
        },
        end: {
          line: 41,
          column: 29
        }
      },
      "24": {
        start: {
          line: 44,
          column: 4
        },
        end: {
          line: 44,
          column: 26
        }
      },
      "25": {
        start: {
          line: 47,
          column: 23
        },
        end: {
          line: 69,
          column: 1
        }
      },
      "26": {
        start: {
          line: 49,
          column: 4
        },
        end: {
          line: 51,
          column: 5
        }
      },
      "27": {
        start: {
          line: 50,
          column: 8
        },
        end: {
          line: 50,
          column: 27
        }
      },
      "28": {
        start: {
          line: 53,
          column: 4
        },
        end: {
          line: 57,
          column: 5
        }
      },
      "29": {
        start: {
          line: 54,
          column: 8
        },
        end: {
          line: 54,
          column: 27
        }
      },
      "30": {
        start: {
          line: 55,
          column: 11
        },
        end: {
          line: 57,
          column: 5
        }
      },
      "31": {
        start: {
          line: 56,
          column: 8
        },
        end: {
          line: 56,
          column: 31
        }
      },
      "32": {
        start: {
          line: 59,
          column: 4
        },
        end: {
          line: 65,
          column: 5
        }
      },
      "33": {
        start: {
          line: 60,
          column: 8
        },
        end: {
          line: 60,
          column: 27
        }
      },
      "34": {
        start: {
          line: 61,
          column: 11
        },
        end: {
          line: 65,
          column: 5
        }
      },
      "35": {
        start: {
          line: 62,
          column: 8
        },
        end: {
          line: 62,
          column: 31
        }
      },
      "36": {
        start: {
          line: 64,
          column: 8
        },
        end: {
          line: 64,
          column: 29
        }
      },
      "37": {
        start: {
          line: 67,
          column: 4
        },
        end: {
          line: 67,
          column: 26
        }
      },
      "38": {
        start: {
          line: 70,
          column: 23
        },
        end: {
          line: 92,
          column: 1
        }
      },
      "39": {
        start: {
          line: 72,
          column: 4
        },
        end: {
          line: 74,
          column: 5
        }
      },
      "40": {
        start: {
          line: 73,
          column: 8
        },
        end: {
          line: 73,
          column: 27
        }
      },
      "41": {
        start: {
          line: 76,
          column: 4
        },
        end: {
          line: 80,
          column: 5
        }
      },
      "42": {
        start: {
          line: 77,
          column: 8
        },
        end: {
          line: 77,
          column: 27
        }
      },
      "43": {
        start: {
          line: 78,
          column: 11
        },
        end: {
          line: 80,
          column: 5
        }
      },
      "44": {
        start: {
          line: 79,
          column: 8
        },
        end: {
          line: 79,
          column: 31
        }
      },
      "45": {
        start: {
          line: 82,
          column: 4
        },
        end: {
          line: 88,
          column: 5
        }
      },
      "46": {
        start: {
          line: 83,
          column: 8
        },
        end: {
          line: 83,
          column: 27
        }
      },
      "47": {
        start: {
          line: 84,
          column: 11
        },
        end: {
          line: 88,
          column: 5
        }
      },
      "48": {
        start: {
          line: 85,
          column: 8
        },
        end: {
          line: 85,
          column: 31
        }
      },
      "49": {
        start: {
          line: 87,
          column: 8
        },
        end: {
          line: 87,
          column: 29
        }
      },
      "50": {
        start: {
          line: 90,
          column: 4
        },
        end: {
          line: 90,
          column: 26
        }
      },
      "51": {
        start: {
          line: 93,
          column: 23
        },
        end: {
          line: 115,
          column: 1
        }
      },
      "52": {
        start: {
          line: 95,
          column: 4
        },
        end: {
          line: 97,
          column: 5
        }
      },
      "53": {
        start: {
          line: 96,
          column: 8
        },
        end: {
          line: 96,
          column: 27
        }
      },
      "54": {
        start: {
          line: 99,
          column: 4
        },
        end: {
          line: 103,
          column: 5
        }
      },
      "55": {
        start: {
          line: 100,
          column: 8
        },
        end: {
          line: 100,
          column: 27
        }
      },
      "56": {
        start: {
          line: 101,
          column: 11
        },
        end: {
          line: 103,
          column: 5
        }
      },
      "57": {
        start: {
          line: 102,
          column: 8
        },
        end: {
          line: 102,
          column: 31
        }
      },
      "58": {
        start: {
          line: 105,
          column: 4
        },
        end: {
          line: 111,
          column: 5
        }
      },
      "59": {
        start: {
          line: 106,
          column: 8
        },
        end: {
          line: 106,
          column: 27
        }
      },
      "60": {
        start: {
          line: 107,
          column: 11
        },
        end: {
          line: 111,
          column: 5
        }
      },
      "61": {
        start: {
          line: 108,
          column: 8
        },
        end: {
          line: 108,
          column: 31
        }
      },
      "62": {
        start: {
          line: 110,
          column: 8
        },
        end: {
          line: 110,
          column: 29
        }
      },
      "63": {
        start: {
          line: 113,
          column: 4
        },
        end: {
          line: 113,
          column: 26
        }
      },
      "64": {
        start: {
          line: 117,
          column: 0
        },
        end: {
          line: 122,
          column: 2
        }
      },
      "65": {
        start: {
          line: 118,
          column: 4
        },
        end: {
          line: 118,
          column: 31
        }
      },
      "66": {
        start: {
          line: 119,
          column: 4
        },
        end: {
          line: 119,
          column: 32
        }
      },
      "67": {
        start: {
          line: 120,
          column: 4
        },
        end: {
          line: 120,
          column: 32
        }
      },
      "68": {
        start: {
          line: 121,
          column: 4
        },
        end: {
          line: 121,
          column: 33
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 2,
            column: 20
          },
          end: {
            line: 2,
            column: 21
          }
        },
        loc: {
          start: {
            line: 2,
            column: 34
          },
          end: {
            line: 22,
            column: 1
          }
        },
        line: 2
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 24,
            column: 23
          },
          end: {
            line: 24,
            column: 24
          }
        },
        loc: {
          start: {
            line: 24,
            column: 37
          },
          end: {
            line: 46,
            column: 1
          }
        },
        line: 24
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 47,
            column: 23
          },
          end: {
            line: 47,
            column: 24
          }
        },
        loc: {
          start: {
            line: 47,
            column: 37
          },
          end: {
            line: 69,
            column: 1
          }
        },
        line: 47
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 70,
            column: 23
          },
          end: {
            line: 70,
            column: 24
          }
        },
        loc: {
          start: {
            line: 70,
            column: 37
          },
          end: {
            line: 92,
            column: 1
          }
        },
        line: 70
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 93,
            column: 23
          },
          end: {
            line: 93,
            column: 24
          }
        },
        loc: {
          start: {
            line: 93,
            column: 37
          },
          end: {
            line: 115,
            column: 1
          }
        },
        line: 93
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 117,
            column: 17
          },
          end: {
            line: 117,
            column: 18
          }
        },
        loc: {
          start: {
            line: 117,
            column: 23
          },
          end: {
            line: 122,
            column: 1
          }
        },
        line: 117
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 4,
            column: 4
          },
          end: {
            line: 6,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 4,
            column: 4
          },
          end: {
            line: 6,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 4
      },
      "1": {
        loc: {
          start: {
            line: 8,
            column: 4
          },
          end: {
            line: 12,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 8,
            column: 4
          },
          end: {
            line: 12,
            column: 5
          }
        }, {
          start: {
            line: 10,
            column: 11
          },
          end: {
            line: 12,
            column: 5
          }
        }],
        line: 8
      },
      "2": {
        loc: {
          start: {
            line: 10,
            column: 11
          },
          end: {
            line: 12,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 10,
            column: 11
          },
          end: {
            line: 12,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 10
      },
      "3": {
        loc: {
          start: {
            line: 14,
            column: 4
          },
          end: {
            line: 20,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 14,
            column: 4
          },
          end: {
            line: 20,
            column: 5
          }
        }, {
          start: {
            line: 16,
            column: 11
          },
          end: {
            line: 20,
            column: 5
          }
        }],
        line: 14
      },
      "4": {
        loc: {
          start: {
            line: 16,
            column: 11
          },
          end: {
            line: 20,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 16,
            column: 11
          },
          end: {
            line: 20,
            column: 5
          }
        }, {
          start: {
            line: 18,
            column: 11
          },
          end: {
            line: 20,
            column: 5
          }
        }],
        line: 16
      },
      "5": {
        loc: {
          start: {
            line: 26,
            column: 4
          },
          end: {
            line: 28,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 26,
            column: 4
          },
          end: {
            line: 28,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 26
      },
      "6": {
        loc: {
          start: {
            line: 30,
            column: 4
          },
          end: {
            line: 34,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 30,
            column: 4
          },
          end: {
            line: 34,
            column: 5
          }
        }, {
          start: {
            line: 32,
            column: 11
          },
          end: {
            line: 34,
            column: 5
          }
        }],
        line: 30
      },
      "7": {
        loc: {
          start: {
            line: 32,
            column: 11
          },
          end: {
            line: 34,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 32,
            column: 11
          },
          end: {
            line: 34,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 32
      },
      "8": {
        loc: {
          start: {
            line: 36,
            column: 4
          },
          end: {
            line: 42,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 36,
            column: 4
          },
          end: {
            line: 42,
            column: 5
          }
        }, {
          start: {
            line: 38,
            column: 11
          },
          end: {
            line: 42,
            column: 5
          }
        }],
        line: 36
      },
      "9": {
        loc: {
          start: {
            line: 38,
            column: 11
          },
          end: {
            line: 42,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 38,
            column: 11
          },
          end: {
            line: 42,
            column: 5
          }
        }, {
          start: {
            line: 40,
            column: 11
          },
          end: {
            line: 42,
            column: 5
          }
        }],
        line: 38
      },
      "10": {
        loc: {
          start: {
            line: 49,
            column: 4
          },
          end: {
            line: 51,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 49,
            column: 4
          },
          end: {
            line: 51,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 49
      },
      "11": {
        loc: {
          start: {
            line: 53,
            column: 4
          },
          end: {
            line: 57,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 53,
            column: 4
          },
          end: {
            line: 57,
            column: 5
          }
        }, {
          start: {
            line: 55,
            column: 11
          },
          end: {
            line: 57,
            column: 5
          }
        }],
        line: 53
      },
      "12": {
        loc: {
          start: {
            line: 55,
            column: 11
          },
          end: {
            line: 57,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 55,
            column: 11
          },
          end: {
            line: 57,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 55
      },
      "13": {
        loc: {
          start: {
            line: 59,
            column: 4
          },
          end: {
            line: 65,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 59,
            column: 4
          },
          end: {
            line: 65,
            column: 5
          }
        }, {
          start: {
            line: 61,
            column: 11
          },
          end: {
            line: 65,
            column: 5
          }
        }],
        line: 59
      },
      "14": {
        loc: {
          start: {
            line: 61,
            column: 11
          },
          end: {
            line: 65,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 61,
            column: 11
          },
          end: {
            line: 65,
            column: 5
          }
        }, {
          start: {
            line: 63,
            column: 11
          },
          end: {
            line: 65,
            column: 5
          }
        }],
        line: 61
      },
      "15": {
        loc: {
          start: {
            line: 72,
            column: 4
          },
          end: {
            line: 74,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 72,
            column: 4
          },
          end: {
            line: 74,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 72
      },
      "16": {
        loc: {
          start: {
            line: 76,
            column: 4
          },
          end: {
            line: 80,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 76,
            column: 4
          },
          end: {
            line: 80,
            column: 5
          }
        }, {
          start: {
            line: 78,
            column: 11
          },
          end: {
            line: 80,
            column: 5
          }
        }],
        line: 76
      },
      "17": {
        loc: {
          start: {
            line: 78,
            column: 11
          },
          end: {
            line: 80,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 78,
            column: 11
          },
          end: {
            line: 80,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 78
      },
      "18": {
        loc: {
          start: {
            line: 82,
            column: 4
          },
          end: {
            line: 88,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 82,
            column: 4
          },
          end: {
            line: 88,
            column: 5
          }
        }, {
          start: {
            line: 84,
            column: 11
          },
          end: {
            line: 88,
            column: 5
          }
        }],
        line: 82
      },
      "19": {
        loc: {
          start: {
            line: 84,
            column: 11
          },
          end: {
            line: 88,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 84,
            column: 11
          },
          end: {
            line: 88,
            column: 5
          }
        }, {
          start: {
            line: 86,
            column: 11
          },
          end: {
            line: 88,
            column: 5
          }
        }],
        line: 84
      },
      "20": {
        loc: {
          start: {
            line: 95,
            column: 4
          },
          end: {
            line: 97,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 95,
            column: 4
          },
          end: {
            line: 97,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 95
      },
      "21": {
        loc: {
          start: {
            line: 99,
            column: 4
          },
          end: {
            line: 103,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 99,
            column: 4
          },
          end: {
            line: 103,
            column: 5
          }
        }, {
          start: {
            line: 101,
            column: 11
          },
          end: {
            line: 103,
            column: 5
          }
        }],
        line: 99
      },
      "22": {
        loc: {
          start: {
            line: 101,
            column: 11
          },
          end: {
            line: 103,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 101,
            column: 11
          },
          end: {
            line: 103,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 101
      },
      "23": {
        loc: {
          start: {
            line: 105,
            column: 4
          },
          end: {
            line: 111,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 105,
            column: 4
          },
          end: {
            line: 111,
            column: 5
          }
        }, {
          start: {
            line: 107,
            column: 11
          },
          end: {
            line: 111,
            column: 5
          }
        }],
        line: 105
      },
      "24": {
        loc: {
          start: {
            line: 107,
            column: 11
          },
          end: {
            line: 111,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 107,
            column: 11
          },
          end: {
            line: 111,
            column: 5
          }
        }, {
          start: {
            line: 109,
            column: 11
          },
          end: {
            line: 111,
            column: 5
          }
        }],
        line: 107
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 0,
      "64": 0,
      "65": 0,
      "66": 0,
      "67": 0,
      "68": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0],
      "7": [0, 0],
      "8": [0, 0],
      "9": [0, 0],
      "10": [0, 0],
      "11": [0, 0],
      "12": [0, 0],
      "13": [0, 0],
      "14": [0, 0],
      "15": [0, 0],
      "16": [0, 0],
      "17": [0, 0],
      "18": [0, 0],
      "19": [0, 0],
      "20": [0, 0],
      "21": [0, 0],
      "22": [0, 0],
      "23": [0, 0],
      "24": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "ace9a980cb05f19ac36a4d35ed34b6659e77eaee"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_x538tolzb = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_x538tolzb();
cov_x538tolzb().s[0]++;
// 5 x 10 = 50 ( (count if) x 2 )
const IfStatement = (tf1, tf2) => {
  cov_x538tolzb().f[0]++;
  cov_x538tolzb().s[1]++;
  if (tf1) {
    cov_x538tolzb().b[0][0]++;
    cov_x538tolzb().s[2]++;
    console.log('if1');
  } else {
    cov_x538tolzb().b[0][1]++;
  }
  cov_x538tolzb().s[3]++;
  if (tf1) {
    cov_x538tolzb().b[1][0]++;
    cov_x538tolzb().s[4]++;
    console.log('if2');
  } else {
    cov_x538tolzb().b[1][1]++;
    cov_x538tolzb().s[5]++;
    if (tf2) {
      cov_x538tolzb().b[2][0]++;
      cov_x538tolzb().s[6]++;
      console.log('ifelse2');
    } else {
      cov_x538tolzb().b[2][1]++;
    }
  }
  cov_x538tolzb().s[7]++;
  if (tf1) {
    cov_x538tolzb().b[3][0]++;
    cov_x538tolzb().s[8]++;
    console.log('if3');
  } else {
    cov_x538tolzb().b[3][1]++;
    cov_x538tolzb().s[9]++;
    if (tf2) {
      cov_x538tolzb().b[4][0]++;
      cov_x538tolzb().s[10]++;
      console.log('ifelse3');
    } else {
      cov_x538tolzb().b[4][1]++;
      cov_x538tolzb().s[11]++;
      console.log('else3');
    }
  }
};
cov_x538tolzb().s[12]++;
const IfStatement_11 = (tf1, tf2) => {
  cov_x538tolzb().f[1]++;
  cov_x538tolzb().s[13]++;
  if (tf1) {
    cov_x538tolzb().b[5][0]++;
    cov_x538tolzb().s[14]++;
    console.log('if1');
  } else {
    cov_x538tolzb().b[5][1]++;
  }
  cov_x538tolzb().s[15]++;
  if (tf1) {
    cov_x538tolzb().b[6][0]++;
    cov_x538tolzb().s[16]++;
    console.log('if2');
  } else {
    cov_x538tolzb().b[6][1]++;
    cov_x538tolzb().s[17]++;
    if (tf2) {
      cov_x538tolzb().b[7][0]++;
      cov_x538tolzb().s[18]++;
      console.log('ifelse2');
    } else {
      cov_x538tolzb().b[7][1]++;
    }
  }
  cov_x538tolzb().s[19]++;
  if (tf1) {
    cov_x538tolzb().b[8][0]++;
    cov_x538tolzb().s[20]++;
    console.log('if3');
  } else {
    cov_x538tolzb().b[8][1]++;
    cov_x538tolzb().s[21]++;
    if (tf2) {
      cov_x538tolzb().b[9][0]++;
      cov_x538tolzb().s[22]++;
      console.log('ifelse3');
    } else {
      cov_x538tolzb().b[9][1]++;
      cov_x538tolzb().s[23]++;
      console.log('else3');
    }
  }
  cov_x538tolzb().s[24]++;
  IfStatement(tf1, tf2);
};
cov_x538tolzb().s[25]++;
const IfStatement_10 = (tf1, tf2) => {
  cov_x538tolzb().f[2]++;
  cov_x538tolzb().s[26]++;
  if (tf1) {
    cov_x538tolzb().b[10][0]++;
    cov_x538tolzb().s[27]++;
    console.log('if1');
  } else {
    cov_x538tolzb().b[10][1]++;
  }
  cov_x538tolzb().s[28]++;
  if (tf1) {
    cov_x538tolzb().b[11][0]++;
    cov_x538tolzb().s[29]++;
    console.log('if2');
  } else {
    cov_x538tolzb().b[11][1]++;
    cov_x538tolzb().s[30]++;
    if (tf2) {
      cov_x538tolzb().b[12][0]++;
      cov_x538tolzb().s[31]++;
      console.log('ifelse2');
    } else {
      cov_x538tolzb().b[12][1]++;
    }
  }
  cov_x538tolzb().s[32]++;
  if (tf1) {
    cov_x538tolzb().b[13][0]++;
    cov_x538tolzb().s[33]++;
    console.log('if3');
  } else {
    cov_x538tolzb().b[13][1]++;
    cov_x538tolzb().s[34]++;
    if (tf2) {
      cov_x538tolzb().b[14][0]++;
      cov_x538tolzb().s[35]++;
      console.log('ifelse3');
    } else {
      cov_x538tolzb().b[14][1]++;
      cov_x538tolzb().s[36]++;
      console.log('else3');
    }
  }
  cov_x538tolzb().s[37]++;
  IfStatement(tf1, tf2);
};
cov_x538tolzb().s[38]++;
const IfStatement_01 = (tf1, tf2) => {
  cov_x538tolzb().f[3]++;
  cov_x538tolzb().s[39]++;
  if (tf1) {
    cov_x538tolzb().b[15][0]++;
    cov_x538tolzb().s[40]++;
    console.log('if1');
  } else {
    cov_x538tolzb().b[15][1]++;
  }
  cov_x538tolzb().s[41]++;
  if (tf1) {
    cov_x538tolzb().b[16][0]++;
    cov_x538tolzb().s[42]++;
    console.log('if2');
  } else {
    cov_x538tolzb().b[16][1]++;
    cov_x538tolzb().s[43]++;
    if (tf2) {
      cov_x538tolzb().b[17][0]++;
      cov_x538tolzb().s[44]++;
      console.log('ifelse2');
    } else {
      cov_x538tolzb().b[17][1]++;
    }
  }
  cov_x538tolzb().s[45]++;
  if (tf1) {
    cov_x538tolzb().b[18][0]++;
    cov_x538tolzb().s[46]++;
    console.log('if3');
  } else {
    cov_x538tolzb().b[18][1]++;
    cov_x538tolzb().s[47]++;
    if (tf2) {
      cov_x538tolzb().b[19][0]++;
      cov_x538tolzb().s[48]++;
      console.log('ifelse3');
    } else {
      cov_x538tolzb().b[19][1]++;
      cov_x538tolzb().s[49]++;
      console.log('else3');
    }
  }
  cov_x538tolzb().s[50]++;
  IfStatement(tf1, tf2);
};
cov_x538tolzb().s[51]++;
const IfStatement_00 = (tf1, tf2) => {
  cov_x538tolzb().f[4]++;
  cov_x538tolzb().s[52]++;
  if (tf1) {
    cov_x538tolzb().b[20][0]++;
    cov_x538tolzb().s[53]++;
    console.log('if1');
  } else {
    cov_x538tolzb().b[20][1]++;
  }
  cov_x538tolzb().s[54]++;
  if (tf1) {
    cov_x538tolzb().b[21][0]++;
    cov_x538tolzb().s[55]++;
    console.log('if2');
  } else {
    cov_x538tolzb().b[21][1]++;
    cov_x538tolzb().s[56]++;
    if (tf2) {
      cov_x538tolzb().b[22][0]++;
      cov_x538tolzb().s[57]++;
      console.log('ifelse2');
    } else {
      cov_x538tolzb().b[22][1]++;
    }
  }
  cov_x538tolzb().s[58]++;
  if (tf1) {
    cov_x538tolzb().b[23][0]++;
    cov_x538tolzb().s[59]++;
    console.log('if3');
  } else {
    cov_x538tolzb().b[23][1]++;
    cov_x538tolzb().s[60]++;
    if (tf2) {
      cov_x538tolzb().b[24][0]++;
      cov_x538tolzb().s[61]++;
      console.log('ifelse3');
    } else {
      cov_x538tolzb().b[24][1]++;
      cov_x538tolzb().s[62]++;
      console.log('else3');
    }
  }
  cov_x538tolzb().s[63]++;
  IfStatement(tf1, tf2);
};
cov_x538tolzb().s[64]++;
module.exports = () => {
  cov_x538tolzb().f[5]++;
  cov_x538tolzb().s[65]++;
  IfStatement_11(true, true);
  cov_x538tolzb().s[66]++;
  IfStatement_10(true, false);
  cov_x538tolzb().s[67]++;
  IfStatement_01(false, true);
  cov_x538tolzb().s[68]++;
  IfStatement_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/logical.js":
/*!*****************************************!*\
  !*** ./test/mock/src/branch/logical.js ***!
  \*****************************************/
/***/ ((module) => {

function cov_1cjqk4zfqm() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\logical.js";
  var hash = "14f61a988dcfbe3a7c6e9eeffab39902e46b7c50";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\logical.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 26
        },
        end: {
          line: 15,
          column: 1
        }
      },
      "1": {
        start: {
          line: 4,
          column: 4
        },
        end: {
          line: 8,
          column: 5
        }
      },
      "2": {
        start: {
          line: 4,
          column: 17
        },
        end: {
          line: 4,
          column: 18
        }
      },
      "3": {
        start: {
          line: 5,
          column: 18
        },
        end: {
          line: 5,
          column: 28
        }
      },
      "4": {
        start: {
          line: 6,
          column: 18
        },
        end: {
          line: 6,
          column: 33
        }
      },
      "5": {
        start: {
          line: 7,
          column: 8
        },
        end: {
          line: 7,
          column: 23
        }
      },
      "6": {
        start: {
          line: 10,
          column: 4
        },
        end: {
          line: 13,
          column: 5
        }
      },
      "7": {
        start: {
          line: 11,
          column: 18
        },
        end: {
          line: 11,
          column: 26
        }
      },
      "8": {
        start: {
          line: 12,
          column: 8
        },
        end: {
          line: 12,
          column: 23
        }
      },
      "9": {
        start: {
          line: 16,
          column: 29
        },
        end: {
          line: 21,
          column: 1
        }
      },
      "10": {
        start: {
          line: 17,
          column: 14
        },
        end: {
          line: 17,
          column: 24
        }
      },
      "11": {
        start: {
          line: 18,
          column: 14
        },
        end: {
          line: 18,
          column: 29
        }
      },
      "12": {
        start: {
          line: 19,
          column: 4
        },
        end: {
          line: 19,
          column: 19
        }
      },
      "13": {
        start: {
          line: 20,
          column: 4
        },
        end: {
          line: 20,
          column: 32
        }
      },
      "14": {
        start: {
          line: 22,
          column: 29
        },
        end: {
          line: 27,
          column: 1
        }
      },
      "15": {
        start: {
          line: 23,
          column: 14
        },
        end: {
          line: 23,
          column: 24
        }
      },
      "16": {
        start: {
          line: 24,
          column: 14
        },
        end: {
          line: 24,
          column: 29
        }
      },
      "17": {
        start: {
          line: 25,
          column: 4
        },
        end: {
          line: 25,
          column: 19
        }
      },
      "18": {
        start: {
          line: 26,
          column: 4
        },
        end: {
          line: 26,
          column: 32
        }
      },
      "19": {
        start: {
          line: 28,
          column: 29
        },
        end: {
          line: 33,
          column: 1
        }
      },
      "20": {
        start: {
          line: 29,
          column: 14
        },
        end: {
          line: 29,
          column: 24
        }
      },
      "21": {
        start: {
          line: 30,
          column: 14
        },
        end: {
          line: 30,
          column: 29
        }
      },
      "22": {
        start: {
          line: 31,
          column: 4
        },
        end: {
          line: 31,
          column: 19
        }
      },
      "23": {
        start: {
          line: 32,
          column: 4
        },
        end: {
          line: 32,
          column: 32
        }
      },
      "24": {
        start: {
          line: 34,
          column: 29
        },
        end: {
          line: 39,
          column: 1
        }
      },
      "25": {
        start: {
          line: 35,
          column: 14
        },
        end: {
          line: 35,
          column: 24
        }
      },
      "26": {
        start: {
          line: 36,
          column: 14
        },
        end: {
          line: 36,
          column: 29
        }
      },
      "27": {
        start: {
          line: 37,
          column: 4
        },
        end: {
          line: 37,
          column: 19
        }
      },
      "28": {
        start: {
          line: 38,
          column: 4
        },
        end: {
          line: 38,
          column: 32
        }
      },
      "29": {
        start: {
          line: 42,
          column: 0
        },
        end: {
          line: 48,
          column: 2
        }
      },
      "30": {
        start: {
          line: 44,
          column: 4
        },
        end: {
          line: 44,
          column: 37
        }
      },
      "31": {
        start: {
          line: 45,
          column: 4
        },
        end: {
          line: 45,
          column: 38
        }
      },
      "32": {
        start: {
          line: 46,
          column: 4
        },
        end: {
          line: 46,
          column: 38
        }
      },
      "33": {
        start: {
          line: 47,
          column: 4
        },
        end: {
          line: 47,
          column: 39
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 2,
            column: 26
          },
          end: {
            line: 2,
            column: 27
          }
        },
        loc: {
          start: {
            line: 2,
            column: 40
          },
          end: {
            line: 15,
            column: 1
          }
        },
        line: 2
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 16,
            column: 29
          },
          end: {
            line: 16,
            column: 30
          }
        },
        loc: {
          start: {
            line: 16,
            column: 43
          },
          end: {
            line: 21,
            column: 1
          }
        },
        line: 16
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 22,
            column: 29
          },
          end: {
            line: 22,
            column: 30
          }
        },
        loc: {
          start: {
            line: 22,
            column: 43
          },
          end: {
            line: 27,
            column: 1
          }
        },
        line: 22
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 28,
            column: 29
          },
          end: {
            line: 28,
            column: 30
          }
        },
        loc: {
          start: {
            line: 28,
            column: 43
          },
          end: {
            line: 33,
            column: 1
          }
        },
        line: 28
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 34,
            column: 29
          },
          end: {
            line: 34,
            column: 30
          }
        },
        loc: {
          start: {
            line: 34,
            column: 43
          },
          end: {
            line: 39,
            column: 1
          }
        },
        line: 34
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 42,
            column: 17
          },
          end: {
            line: 42,
            column: 18
          }
        },
        loc: {
          start: {
            line: 42,
            column: 23
          },
          end: {
            line: 48,
            column: 1
          }
        },
        line: 42
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 5,
            column: 18
          },
          end: {
            line: 5,
            column: 28
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 5,
            column: 18
          },
          end: {
            line: 5,
            column: 21
          }
        }, {
          start: {
            line: 5,
            column: 25
          },
          end: {
            line: 5,
            column: 28
          }
        }],
        line: 5
      },
      "1": {
        loc: {
          start: {
            line: 6,
            column: 18
          },
          end: {
            line: 6,
            column: 33
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 6,
            column: 18
          },
          end: {
            line: 6,
            column: 21
          }
        }, {
          start: {
            line: 6,
            column: 25
          },
          end: {
            line: 6,
            column: 28
          }
        }, {
          start: {
            line: 6,
            column: 32
          },
          end: {
            line: 6,
            column: 33
          }
        }],
        line: 6
      },
      "2": {
        loc: {
          start: {
            line: 10,
            column: 4
          },
          end: {
            line: 13,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 10,
            column: 4
          },
          end: {
            line: 13,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 10
      },
      "3": {
        loc: {
          start: {
            line: 11,
            column: 18
          },
          end: {
            line: 11,
            column: 26
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 11,
            column: 18
          },
          end: {
            line: 11,
            column: 21
          }
        }, {
          start: {
            line: 11,
            column: 25
          },
          end: {
            line: 11,
            column: 26
          }
        }],
        line: 11
      },
      "4": {
        loc: {
          start: {
            line: 17,
            column: 14
          },
          end: {
            line: 17,
            column: 24
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 17,
            column: 14
          },
          end: {
            line: 17,
            column: 17
          }
        }, {
          start: {
            line: 17,
            column: 21
          },
          end: {
            line: 17,
            column: 24
          }
        }],
        line: 17
      },
      "5": {
        loc: {
          start: {
            line: 18,
            column: 14
          },
          end: {
            line: 18,
            column: 29
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 18,
            column: 14
          },
          end: {
            line: 18,
            column: 17
          }
        }, {
          start: {
            line: 18,
            column: 21
          },
          end: {
            line: 18,
            column: 24
          }
        }, {
          start: {
            line: 18,
            column: 28
          },
          end: {
            line: 18,
            column: 29
          }
        }],
        line: 18
      },
      "6": {
        loc: {
          start: {
            line: 23,
            column: 14
          },
          end: {
            line: 23,
            column: 24
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 23,
            column: 14
          },
          end: {
            line: 23,
            column: 17
          }
        }, {
          start: {
            line: 23,
            column: 21
          },
          end: {
            line: 23,
            column: 24
          }
        }],
        line: 23
      },
      "7": {
        loc: {
          start: {
            line: 24,
            column: 14
          },
          end: {
            line: 24,
            column: 29
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 24,
            column: 14
          },
          end: {
            line: 24,
            column: 17
          }
        }, {
          start: {
            line: 24,
            column: 21
          },
          end: {
            line: 24,
            column: 24
          }
        }, {
          start: {
            line: 24,
            column: 28
          },
          end: {
            line: 24,
            column: 29
          }
        }],
        line: 24
      },
      "8": {
        loc: {
          start: {
            line: 29,
            column: 14
          },
          end: {
            line: 29,
            column: 24
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 29,
            column: 14
          },
          end: {
            line: 29,
            column: 17
          }
        }, {
          start: {
            line: 29,
            column: 21
          },
          end: {
            line: 29,
            column: 24
          }
        }],
        line: 29
      },
      "9": {
        loc: {
          start: {
            line: 30,
            column: 14
          },
          end: {
            line: 30,
            column: 29
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 30,
            column: 14
          },
          end: {
            line: 30,
            column: 17
          }
        }, {
          start: {
            line: 30,
            column: 21
          },
          end: {
            line: 30,
            column: 24
          }
        }, {
          start: {
            line: 30,
            column: 28
          },
          end: {
            line: 30,
            column: 29
          }
        }],
        line: 30
      },
      "10": {
        loc: {
          start: {
            line: 35,
            column: 14
          },
          end: {
            line: 35,
            column: 24
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 35,
            column: 14
          },
          end: {
            line: 35,
            column: 17
          }
        }, {
          start: {
            line: 35,
            column: 21
          },
          end: {
            line: 35,
            column: 24
          }
        }],
        line: 35
      },
      "11": {
        loc: {
          start: {
            line: 36,
            column: 14
          },
          end: {
            line: 36,
            column: 29
          }
        },
        type: "binary-expr",
        locations: [{
          start: {
            line: 36,
            column: 14
          },
          end: {
            line: 36,
            column: 17
          }
        }, {
          start: {
            line: 36,
            column: 21
          },
          end: {
            line: 36,
            column: 24
          }
        }, {
          start: {
            line: 36,
            column: 28
          },
          end: {
            line: 36,
            column: 29
          }
        }],
        line: 36
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0, 0],
      "6": [0, 0],
      "7": [0, 0, 0],
      "8": [0, 0],
      "9": [0, 0, 0],
      "10": [0, 0],
      "11": [0, 0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "14f61a988dcfbe3a7c6e9eeffab39902e46b7c50"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1cjqk4zfqm = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1cjqk4zfqm();
cov_1cjqk4zfqm().s[0]++;
// 5 x 5 = 25
const LogicalExpression = (tf1, tf2) => {
  cov_1cjqk4zfqm().f[0]++;
  cov_1cjqk4zfqm().s[1]++;
  for (let i = (cov_1cjqk4zfqm().s[2]++, 0); i < 2; i++) {
    const a = (cov_1cjqk4zfqm().s[3]++, (cov_1cjqk4zfqm().b[0][0]++, tf1) || (cov_1cjqk4zfqm().b[0][1]++, tf2));
    const b = (cov_1cjqk4zfqm().s[4]++, (cov_1cjqk4zfqm().b[1][0]++, tf2) || (cov_1cjqk4zfqm().b[1][1]++, tf1) || (cov_1cjqk4zfqm().b[1][2]++, a));
    cov_1cjqk4zfqm().s[5]++;
    console.log(b);
  }
  cov_1cjqk4zfqm().s[6]++;
  if (tf1) {
    cov_1cjqk4zfqm().b[2][0]++;
    const c = (cov_1cjqk4zfqm().s[7]++, (cov_1cjqk4zfqm().b[3][0]++, tf2) || (cov_1cjqk4zfqm().b[3][1]++, 2));
    cov_1cjqk4zfqm().s[8]++;
    console.log(c);
  } else {
    cov_1cjqk4zfqm().b[2][1]++;
  }
};
cov_1cjqk4zfqm().s[9]++;
const LogicalExpression_11 = (tf1, tf2) => {
  cov_1cjqk4zfqm().f[1]++;
  const a = (cov_1cjqk4zfqm().s[10]++, (cov_1cjqk4zfqm().b[4][0]++, tf1) || (cov_1cjqk4zfqm().b[4][1]++, tf2));
  const b = (cov_1cjqk4zfqm().s[11]++, (cov_1cjqk4zfqm().b[5][0]++, tf2) || (cov_1cjqk4zfqm().b[5][1]++, tf1) || (cov_1cjqk4zfqm().b[5][2]++, a));
  cov_1cjqk4zfqm().s[12]++;
  console.log(b);
  cov_1cjqk4zfqm().s[13]++;
  LogicalExpression(tf1, tf2);
};
cov_1cjqk4zfqm().s[14]++;
const LogicalExpression_10 = (tf1, tf2) => {
  cov_1cjqk4zfqm().f[2]++;
  const a = (cov_1cjqk4zfqm().s[15]++, (cov_1cjqk4zfqm().b[6][0]++, tf1) || (cov_1cjqk4zfqm().b[6][1]++, tf2));
  const b = (cov_1cjqk4zfqm().s[16]++, (cov_1cjqk4zfqm().b[7][0]++, tf2) || (cov_1cjqk4zfqm().b[7][1]++, tf1) || (cov_1cjqk4zfqm().b[7][2]++, a));
  cov_1cjqk4zfqm().s[17]++;
  console.log(b);
  cov_1cjqk4zfqm().s[18]++;
  LogicalExpression(tf1, tf2);
};
cov_1cjqk4zfqm().s[19]++;
const LogicalExpression_01 = (tf1, tf2) => {
  cov_1cjqk4zfqm().f[3]++;
  const a = (cov_1cjqk4zfqm().s[20]++, (cov_1cjqk4zfqm().b[8][0]++, tf1) || (cov_1cjqk4zfqm().b[8][1]++, tf2));
  const b = (cov_1cjqk4zfqm().s[21]++, (cov_1cjqk4zfqm().b[9][0]++, tf2) || (cov_1cjqk4zfqm().b[9][1]++, tf1) || (cov_1cjqk4zfqm().b[9][2]++, a));
  cov_1cjqk4zfqm().s[22]++;
  console.log(b);
  cov_1cjqk4zfqm().s[23]++;
  LogicalExpression(tf1, tf2);
};
cov_1cjqk4zfqm().s[24]++;
const LogicalExpression_00 = (tf1, tf2) => {
  cov_1cjqk4zfqm().f[4]++;
  const a = (cov_1cjqk4zfqm().s[25]++, (cov_1cjqk4zfqm().b[10][0]++, tf1) || (cov_1cjqk4zfqm().b[10][1]++, tf2));
  const b = (cov_1cjqk4zfqm().s[26]++, (cov_1cjqk4zfqm().b[11][0]++, tf2) || (cov_1cjqk4zfqm().b[11][1]++, tf1) || (cov_1cjqk4zfqm().b[11][2]++, a));
  cov_1cjqk4zfqm().s[27]++;
  console.log(b);
  cov_1cjqk4zfqm().s[28]++;
  LogicalExpression(tf1, tf2);
};
cov_1cjqk4zfqm().s[29]++;
module.exports = () => {
  cov_1cjqk4zfqm().f[5]++;
  cov_1cjqk4zfqm().s[30]++;
  LogicalExpression_11(true, true);
  cov_1cjqk4zfqm().s[31]++;
  LogicalExpression_10(true, false);
  cov_1cjqk4zfqm().s[32]++;
  LogicalExpression_01(false, true);
  cov_1cjqk4zfqm().s[33]++;
  LogicalExpression_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/switch.js":
/*!****************************************!*\
  !*** ./test/mock/src/branch/switch.js ***!
  \****************************************/
/***/ ((module) => {

function cov_1hungb6k2q() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\switch.js";
  var hash = "793d8e7aa4fcce5deafd67c9b84b196fca09fe6b";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\branch\\switch.js",
    statementMap: {
      "0": {
        start: {
          line: 4,
          column: 24
        },
        end: {
          line: 16,
          column: 1
        }
      },
      "1": {
        start: {
          line: 5,
          column: 4
        },
        end: {
          line: 15,
          column: 5
        }
      },
      "2": {
        start: {
          line: 7,
          column: 12
        },
        end: {
          line: 7,
          column: 27
        }
      },
      "3": {
        start: {
          line: 8,
          column: 12
        },
        end: {
          line: 8,
          column: 18
        }
      },
      "4": {
        start: {
          line: 11,
          column: 12
        },
        end: {
          line: 11,
          column: 27
        }
      },
      "5": {
        start: {
          line: 12,
          column: 12
        },
        end: {
          line: 12,
          column: 18
        }
      },
      "6": {
        start: {
          line: 14,
          column: 12
        },
        end: {
          line: 14,
          column: 35
        }
      },
      "7": {
        start: {
          line: 17,
          column: 26
        },
        end: {
          line: 27,
          column: 1
        }
      },
      "8": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 25,
          column: 5
        }
      },
      "9": {
        start: {
          line: 20,
          column: 12
        },
        end: {
          line: 20,
          column: 27
        }
      },
      "10": {
        start: {
          line: 21,
          column: 12
        },
        end: {
          line: 21,
          column: 18
        }
      },
      "11": {
        start: {
          line: 24,
          column: 12
        },
        end: {
          line: 24,
          column: 27
        }
      },
      "12": {
        start: {
          line: 26,
          column: 4
        },
        end: {
          line: 26,
          column: 23
        }
      },
      "13": {
        start: {
          line: 28,
          column: 26
        },
        end: {
          line: 41,
          column: 1
        }
      },
      "14": {
        start: {
          line: 29,
          column: 4
        },
        end: {
          line: 39,
          column: 5
        }
      },
      "15": {
        start: {
          line: 31,
          column: 12
        },
        end: {
          line: 31,
          column: 27
        }
      },
      "16": {
        start: {
          line: 32,
          column: 12
        },
        end: {
          line: 32,
          column: 18
        }
      },
      "17": {
        start: {
          line: 35,
          column: 12
        },
        end: {
          line: 35,
          column: 27
        }
      },
      "18": {
        start: {
          line: 36,
          column: 12
        },
        end: {
          line: 36,
          column: 18
        }
      },
      "19": {
        start: {
          line: 38,
          column: 12
        },
        end: {
          line: 38,
          column: 35
        }
      },
      "20": {
        start: {
          line: 40,
          column: 4
        },
        end: {
          line: 40,
          column: 23
        }
      },
      "21": {
        start: {
          line: 42,
          column: 26
        },
        end: {
          line: 55,
          column: 1
        }
      },
      "22": {
        start: {
          line: 43,
          column: 4
        },
        end: {
          line: 53,
          column: 5
        }
      },
      "23": {
        start: {
          line: 45,
          column: 12
        },
        end: {
          line: 45,
          column: 27
        }
      },
      "24": {
        start: {
          line: 46,
          column: 12
        },
        end: {
          line: 46,
          column: 18
        }
      },
      "25": {
        start: {
          line: 49,
          column: 12
        },
        end: {
          line: 49,
          column: 27
        }
      },
      "26": {
        start: {
          line: 50,
          column: 12
        },
        end: {
          line: 50,
          column: 18
        }
      },
      "27": {
        start: {
          line: 52,
          column: 12
        },
        end: {
          line: 52,
          column: 35
        }
      },
      "28": {
        start: {
          line: 54,
          column: 4
        },
        end: {
          line: 54,
          column: 23
        }
      },
      "29": {
        start: {
          line: 56,
          column: 26
        },
        end: {
          line: 69,
          column: 1
        }
      },
      "30": {
        start: {
          line: 57,
          column: 4
        },
        end: {
          line: 67,
          column: 5
        }
      },
      "31": {
        start: {
          line: 59,
          column: 12
        },
        end: {
          line: 59,
          column: 27
        }
      },
      "32": {
        start: {
          line: 60,
          column: 12
        },
        end: {
          line: 60,
          column: 18
        }
      },
      "33": {
        start: {
          line: 63,
          column: 12
        },
        end: {
          line: 63,
          column: 27
        }
      },
      "34": {
        start: {
          line: 64,
          column: 12
        },
        end: {
          line: 64,
          column: 18
        }
      },
      "35": {
        start: {
          line: 66,
          column: 12
        },
        end: {
          line: 66,
          column: 35
        }
      },
      "36": {
        start: {
          line: 68,
          column: 4
        },
        end: {
          line: 68,
          column: 23
        }
      },
      "37": {
        start: {
          line: 70,
          column: 26
        },
        end: {
          line: 81,
          column: 1
        }
      },
      "38": {
        start: {
          line: 71,
          column: 4
        },
        end: {
          line: 79,
          column: 5
        }
      },
      "39": {
        start: {
          line: 73,
          column: 12
        },
        end: {
          line: 73,
          column: 27
        }
      },
      "40": {
        start: {
          line: 74,
          column: 12
        },
        end: {
          line: 74,
          column: 18
        }
      },
      "41": {
        start: {
          line: 77,
          column: 12
        },
        end: {
          line: 77,
          column: 27
        }
      },
      "42": {
        start: {
          line: 78,
          column: 12
        },
        end: {
          line: 78,
          column: 18
        }
      },
      "43": {
        start: {
          line: 80,
          column: 4
        },
        end: {
          line: 80,
          column: 23
        }
      },
      "44": {
        start: {
          line: 84,
          column: 0
        },
        end: {
          line: 90,
          column: 2
        }
      },
      "45": {
        start: {
          line: 85,
          column: 4
        },
        end: {
          line: 85,
          column: 25
        }
      },
      "46": {
        start: {
          line: 86,
          column: 4
        },
        end: {
          line: 86,
          column: 25
        }
      },
      "47": {
        start: {
          line: 87,
          column: 4
        },
        end: {
          line: 87,
          column: 25
        }
      },
      "48": {
        start: {
          line: 88,
          column: 4
        },
        end: {
          line: 88,
          column: 25
        }
      },
      "49": {
        start: {
          line: 89,
          column: 4
        },
        end: {
          line: 89,
          column: 25
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 4,
            column: 24
          },
          end: {
            line: 4,
            column: 25
          }
        },
        loc: {
          start: {
            line: 4,
            column: 31
          },
          end: {
            line: 16,
            column: 1
          }
        },
        line: 4
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 17,
            column: 26
          },
          end: {
            line: 17,
            column: 27
          }
        },
        loc: {
          start: {
            line: 17,
            column: 33
          },
          end: {
            line: 27,
            column: 1
          }
        },
        line: 17
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 28,
            column: 26
          },
          end: {
            line: 28,
            column: 27
          }
        },
        loc: {
          start: {
            line: 28,
            column: 33
          },
          end: {
            line: 41,
            column: 1
          }
        },
        line: 28
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 42,
            column: 26
          },
          end: {
            line: 42,
            column: 27
          }
        },
        loc: {
          start: {
            line: 42,
            column: 33
          },
          end: {
            line: 55,
            column: 1
          }
        },
        line: 42
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 56,
            column: 26
          },
          end: {
            line: 56,
            column: 27
          }
        },
        loc: {
          start: {
            line: 56,
            column: 33
          },
          end: {
            line: 69,
            column: 1
          }
        },
        line: 56
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 70,
            column: 26
          },
          end: {
            line: 70,
            column: 27
          }
        },
        loc: {
          start: {
            line: 70,
            column: 33
          },
          end: {
            line: 81,
            column: 1
          }
        },
        line: 70
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 84,
            column: 17
          },
          end: {
            line: 84,
            column: 18
          }
        },
        loc: {
          start: {
            line: 84,
            column: 23
          },
          end: {
            line: 90,
            column: 1
          }
        },
        line: 84
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 5,
            column: 4
          },
          end: {
            line: 15,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 6,
            column: 8
          },
          end: {
            line: 8,
            column: 18
          }
        }, {
          start: {
            line: 9,
            column: 8
          },
          end: {
            line: 9,
            column: 15
          }
        }, {
          start: {
            line: 10,
            column: 8
          },
          end: {
            line: 12,
            column: 18
          }
        }, {
          start: {
            line: 13,
            column: 8
          },
          end: {
            line: 14,
            column: 35
          }
        }],
        line: 5
      },
      "1": {
        loc: {
          start: {
            line: 18,
            column: 4
          },
          end: {
            line: 25,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 19,
            column: 8
          },
          end: {
            line: 21,
            column: 18
          }
        }, {
          start: {
            line: 22,
            column: 8
          },
          end: {
            line: 22,
            column: 15
          }
        }, {
          start: {
            line: 23,
            column: 8
          },
          end: {
            line: 24,
            column: 27
          }
        }],
        line: 18
      },
      "2": {
        loc: {
          start: {
            line: 29,
            column: 4
          },
          end: {
            line: 39,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 30,
            column: 8
          },
          end: {
            line: 32,
            column: 18
          }
        }, {
          start: {
            line: 33,
            column: 8
          },
          end: {
            line: 33,
            column: 15
          }
        }, {
          start: {
            line: 34,
            column: 8
          },
          end: {
            line: 36,
            column: 18
          }
        }, {
          start: {
            line: 37,
            column: 8
          },
          end: {
            line: 38,
            column: 35
          }
        }],
        line: 29
      },
      "3": {
        loc: {
          start: {
            line: 43,
            column: 4
          },
          end: {
            line: 53,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 44,
            column: 8
          },
          end: {
            line: 46,
            column: 18
          }
        }, {
          start: {
            line: 47,
            column: 8
          },
          end: {
            line: 47,
            column: 15
          }
        }, {
          start: {
            line: 48,
            column: 8
          },
          end: {
            line: 50,
            column: 18
          }
        }, {
          start: {
            line: 51,
            column: 8
          },
          end: {
            line: 52,
            column: 35
          }
        }],
        line: 43
      },
      "4": {
        loc: {
          start: {
            line: 57,
            column: 4
          },
          end: {
            line: 67,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 58,
            column: 8
          },
          end: {
            line: 60,
            column: 18
          }
        }, {
          start: {
            line: 61,
            column: 8
          },
          end: {
            line: 61,
            column: 15
          }
        }, {
          start: {
            line: 62,
            column: 8
          },
          end: {
            line: 64,
            column: 18
          }
        }, {
          start: {
            line: 65,
            column: 8
          },
          end: {
            line: 66,
            column: 35
          }
        }],
        line: 57
      },
      "5": {
        loc: {
          start: {
            line: 71,
            column: 4
          },
          end: {
            line: 79,
            column: 5
          }
        },
        type: "switch",
        locations: [{
          start: {
            line: 72,
            column: 8
          },
          end: {
            line: 74,
            column: 18
          }
        }, {
          start: {
            line: 75,
            column: 8
          },
          end: {
            line: 75,
            column: 15
          }
        }, {
          start: {
            line: 76,
            column: 8
          },
          end: {
            line: 78,
            column: 18
          }
        }],
        line: 71
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    },
    b: {
      "0": [0, 0, 0, 0],
      "1": [0, 0, 0],
      "2": [0, 0, 0, 0],
      "3": [0, 0, 0, 0],
      "4": [0, 0, 0, 0],
      "5": [0, 0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "793d8e7aa4fcce5deafd67c9b84b196fca09fe6b"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1hungb6k2q = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1hungb6k2q();
cov_1hungb6k2q().s[0]++;
/* eslint-disable default-case */

// 4 + 3 + 4 + 4 + 4 + 3 = 22
const SwitchStatement = n => {
  cov_1hungb6k2q().f[0]++;
  cov_1hungb6k2q().s[1]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[0][0]++;
      cov_1hungb6k2q().s[2]++;
      console.log(1);
      cov_1hungb6k2q().s[3]++;
      break;
    case 2:
      cov_1hungb6k2q().b[0][1]++;
    case 3:
      cov_1hungb6k2q().b[0][2]++;
      cov_1hungb6k2q().s[4]++;
      console.log(2);
      cov_1hungb6k2q().s[5]++;
      break;
    default:
      cov_1hungb6k2q().b[0][3]++;
      cov_1hungb6k2q().s[6]++;
      console.log('default');
  }
};
cov_1hungb6k2q().s[7]++;
const SwitchStatement_1 = n => {
  cov_1hungb6k2q().f[1]++;
  cov_1hungb6k2q().s[8]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[1][0]++;
      cov_1hungb6k2q().s[9]++;
      console.log(1);
      cov_1hungb6k2q().s[10]++;
      break;
    case 2:
      cov_1hungb6k2q().b[1][1]++;
    case 3:
      cov_1hungb6k2q().b[1][2]++;
      cov_1hungb6k2q().s[11]++;
      console.log(2);
  }
  cov_1hungb6k2q().s[12]++;
  SwitchStatement(n);
};
cov_1hungb6k2q().s[13]++;
const SwitchStatement_2 = n => {
  cov_1hungb6k2q().f[2]++;
  cov_1hungb6k2q().s[14]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[2][0]++;
      cov_1hungb6k2q().s[15]++;
      console.log(1);
      cov_1hungb6k2q().s[16]++;
      break;
    case 2:
      cov_1hungb6k2q().b[2][1]++;
    case 3:
      cov_1hungb6k2q().b[2][2]++;
      cov_1hungb6k2q().s[17]++;
      console.log(2);
      cov_1hungb6k2q().s[18]++;
      break;
    default:
      cov_1hungb6k2q().b[2][3]++;
      cov_1hungb6k2q().s[19]++;
      console.log('default');
  }
  cov_1hungb6k2q().s[20]++;
  SwitchStatement(n);
};
cov_1hungb6k2q().s[21]++;
const SwitchStatement_3 = n => {
  cov_1hungb6k2q().f[3]++;
  cov_1hungb6k2q().s[22]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[3][0]++;
      cov_1hungb6k2q().s[23]++;
      console.log(1);
      cov_1hungb6k2q().s[24]++;
      break;
    case 2:
      cov_1hungb6k2q().b[3][1]++;
    case 3:
      cov_1hungb6k2q().b[3][2]++;
      cov_1hungb6k2q().s[25]++;
      console.log(2);
      cov_1hungb6k2q().s[26]++;
      break;
    default:
      cov_1hungb6k2q().b[3][3]++;
      cov_1hungb6k2q().s[27]++;
      console.log('default');
  }
  cov_1hungb6k2q().s[28]++;
  SwitchStatement(n);
};
cov_1hungb6k2q().s[29]++;
const SwitchStatement_4 = n => {
  cov_1hungb6k2q().f[4]++;
  cov_1hungb6k2q().s[30]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[4][0]++;
      cov_1hungb6k2q().s[31]++;
      console.log(1);
      cov_1hungb6k2q().s[32]++;
      break;
    case 2:
      cov_1hungb6k2q().b[4][1]++;
    case 3:
      cov_1hungb6k2q().b[4][2]++;
      cov_1hungb6k2q().s[33]++;
      console.log(2);
      cov_1hungb6k2q().s[34]++;
      break;
    default:
      cov_1hungb6k2q().b[4][3]++;
      cov_1hungb6k2q().s[35]++;
      console.log('default');
  }
  cov_1hungb6k2q().s[36]++;
  SwitchStatement(n);
};
cov_1hungb6k2q().s[37]++;
const SwitchStatement_5 = n => {
  cov_1hungb6k2q().f[5]++;
  cov_1hungb6k2q().s[38]++;
  switch (n) {
    case 1:
      cov_1hungb6k2q().b[5][0]++;
      cov_1hungb6k2q().s[39]++;
      console.log(1);
      cov_1hungb6k2q().s[40]++;
      break;
    case 2:
      cov_1hungb6k2q().b[5][1]++;
    case 3:
      cov_1hungb6k2q().b[5][2]++;
      cov_1hungb6k2q().s[41]++;
      console.log(2);
      cov_1hungb6k2q().s[42]++;
      break;
  }
  cov_1hungb6k2q().s[43]++;
  SwitchStatement(n);
};
cov_1hungb6k2q().s[44]++;
module.exports = () => {
  cov_1hungb6k2q().f[6]++;
  cov_1hungb6k2q().s[45]++;
  SwitchStatement_1(1);
  cov_1hungb6k2q().s[46]++;
  SwitchStatement_2(2);
  cov_1hungb6k2q().s[47]++;
  SwitchStatement_3(3);
  cov_1hungb6k2q().s[48]++;
  SwitchStatement_4(4);
  cov_1hungb6k2q().s[49]++;
  SwitchStatement_5(5);
};

/***/ }),

/***/ "./test/mock/src/component.js":
/*!************************************!*\
  !*** ./test/mock/src/component.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function cov_1g9bw2jfrk() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\component.js";
  var hash = "1dec7a9a1f86c652a1db4cebfcd2c6f95c773c91";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\component.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 11
        },
        end: {
          line: 2,
          column: 37
        }
      },
      "1": {
        start: {
          line: 4,
          column: 0
        },
        end: {
          line: 7,
          column: 2
        }
      },
      "2": {
        start: {
          line: 5,
          column: 4
        },
        end: {
          line: 5,
          column: 37
        }
      },
      "3": {
        start: {
          line: 6,
          column: 4
        },
        end: {
          line: 6,
          column: 9
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 4,
            column: 17
          },
          end: {
            line: 4,
            column: 18
          }
        },
        loc: {
          start: {
            line: 4,
            column: 23
          },
          end: {
            line: 7,
            column: 1
          }
        },
        line: 4
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "1dec7a9a1f86c652a1db4cebfcd2c6f95c773c91"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1g9bw2jfrk = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1g9bw2jfrk();
const ts = (cov_1g9bw2jfrk().s[0]++, __webpack_require__(/*! ./typescript.ts */ "./test/mock/src/typescript.ts"));
cov_1g9bw2jfrk().s[1]++;
module.exports = () => {
  cov_1g9bw2jfrk().f[0]++;
  cov_1g9bw2jfrk().s[2]++;
  console.log('this is component');
  cov_1g9bw2jfrk().s[3]++;
  ts();
};

/***/ }),

/***/ "./test/mock/src/ignore.js":
/*!*********************************!*\
  !*** ./test/mock/src/ignore.js ***!
  \*********************************/
/***/ ((module) => {

function cov_1exbckmi0h() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\ignore.js";
  var hash = "df1a4322768d7f53e593248ced6db7c9be217096";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\ignore.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 17
        },
        end: {
          line: 1,
          column: 25
        }
      },
      "1": {
        start: {
          line: 4,
          column: 0
        },
        end: {
          line: 7,
          column: 1
        }
      },
      "2": {
        start: {
          line: 5,
          column: 4
        },
        end: {
          line: 5,
          column: 33
        }
      },
      "3": {
        start: {
          line: 10,
          column: 0
        },
        end: {
          line: 12,
          column: 1
        }
      },
      "4": {
        start: {
          line: 11,
          column: 4
        },
        end: {
          line: 11,
          column: 32
        }
      },
      "5": {
        start: {
          line: 15,
          column: 11
        },
        end: {
          line: 15,
          column: 75
        }
      },
      "6": {
        start: {
          line: 18,
          column: 4
        },
        end: {
          line: 18,
          column: 20
        }
      },
      "7": {
        start: {
          line: 22,
          column: 40
        },
        end: {
          line: 24,
          column: 1
        }
      },
      "8": {
        start: {
          line: 23,
          column: 4
        },
        end: {
          line: 23,
          column: 16
        }
      },
      "9": {
        start: {
          line: 28,
          column: 15
        },
        end: {
          line: 32,
          column: 1
        }
      },
      "10": {
        start: {
          line: 29,
          column: 4
        },
        end: {
          line: 31,
          column: 5
        }
      },
      "11": {
        start: {
          line: 30,
          column: 8
        },
        end: {
          line: 30,
          column: 20
        }
      },
      "12": {
        start: {
          line: 34,
          column: 0
        },
        end: {
          line: 40,
          column: 2
        }
      }
    },
    fnMap: {
      "0": {
        name: "uncovered",
        decl: {
          start: {
            line: 17,
            column: 31
          },
          end: {
            line: 17,
            column: 40
          }
        },
        loc: {
          start: {
            line: 17,
            column: 44
          },
          end: {
            line: 19,
            column: 1
          }
        },
        line: 17
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 22,
            column: 40
          },
          end: {
            line: 22,
            column: 41
          }
        },
        loc: {
          start: {
            line: 22,
            column: 46
          },
          end: {
            line: 24,
            column: 1
          }
        },
        line: 22
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 28,
            column: 15
          },
          end: {
            line: 28,
            column: 16
          }
        },
        loc: {
          start: {
            line: 28,
            column: 22
          },
          end: {
            line: 32,
            column: 1
          }
        },
        line: 28
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 4,
            column: 0
          },
          end: {
            line: 7,
            column: 1
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 4,
            column: 0
          },
          end: {
            line: 7,
            column: 1
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 4
      },
      "1": {
        loc: {
          start: {
            line: 10,
            column: 0
          },
          end: {
            line: 12,
            column: 1
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 10,
            column: 0
          },
          end: {
            line: 12,
            column: 1
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 10
      },
      "2": {
        loc: {
          start: {
            line: 15,
            column: 11
          },
          end: {
            line: 15,
            column: 75
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 15,
            column: 35
          },
          end: {
            line: 15,
            column: 44
          }
        }, {
          start: {
            line: 15,
            column: 68
          },
          end: {
            line: 15,
            column: 75
          }
        }],
        line: 15
      },
      "3": {
        loc: {
          start: {
            line: 29,
            column: 4
          },
          end: {
            line: 31,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 29,
            column: 4
          },
          end: {
            line: 31,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 29
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "df1a4322768d7f53e593248ced6db7c9be217096"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_1exbckmi0h = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_1exbckmi0h();
const platform = (cov_1exbckmi0h().s[0]++, 'wind32');

/* v8 ignore next */
cov_1exbckmi0h().s[1]++;
if (platform === 'darwin') {
  cov_1exbckmi0h().b[0][0]++;
  cov_1exbckmi0h().s[2]++;
  console.info('hello darwin');
  // v8 ignore next
} else {
  cov_1exbckmi0h().b[0][1]++;
}

/* v8 ignore next 3 */
cov_1exbckmi0h().s[3]++;
if (platform === 'linux') {
  cov_1exbckmi0h().b[1][0]++;
  cov_1exbckmi0h().s[4]++;
  console.info('hello linux');
} else {
  cov_1exbckmi0h().b[1][1]++;
}
const os = (cov_1exbckmi0h().s[5]++, platform === 'wind32' ? (cov_1exbckmi0h().b[2][0]++, 'Windows' /* v8 ignore next */) : (cov_1exbckmi0h().b[2][1]++, 'Other'));

/* v8 ignore start */
function uncovered(v) {
  cov_1exbckmi0h().f[0]++;
  cov_1exbckmi0h().s[6]++;
  console.log(os);
} /* v8 ignore stop */
cov_1exbckmi0h().s[7]++;
const neverMind = /* v8 ignore start */() => {
  cov_1exbckmi0h().f[1]++;
  cov_1exbckmi0h().s[8]++;
  uncovered();
};

/* v8 ignore stop */
cov_1exbckmi0h().s[9]++;
const ignore = v => {
  cov_1exbckmi0h().f[2]++;
  cov_1exbckmi0h().s[10]++;
  if (v) {
    cov_1exbckmi0h().b[3][0]++;
    cov_1exbckmi0h().s[11]++;
    neverMind();
  } else {
    cov_1exbckmi0h().b[3][1]++;
  }
};
cov_1exbckmi0h().s[12]++;
module.exports = {
  ignore,
  neverMind,
  uncovered,
  os,
  platform
};

/***/ }),

/***/ "./test/mock/src/index.js":
/*!********************************!*\
  !*** ./test/mock/src/index.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function cov_9wnj9yq0u() {
  var path = "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\index.js";
  var hash = "663235ed06a99d6742040093fdc5920dc28ad6f8";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "F:\\workspace\\monocart-coverage-reports\\test\\mock\\src\\index.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 1,
          column: 33
        }
      },
      "1": {
        start: {
          line: 3,
          column: 0
        },
        end: {
          line: 3,
          column: 29
        }
      },
      "2": {
        start: {
          line: 5,
          column: 19
        },
        end: {
          line: 5,
          column: 41
        }
      },
      "3": {
        start: {
          line: 7,
          column: 15
        },
        end: {
          line: 7,
          column: 37
        }
      },
      "4": {
        start: {
          line: 8,
          column: 19
        },
        end: {
          line: 8,
          column: 45
        }
      },
      "5": {
        start: {
          line: 10,
          column: 18
        },
        end: {
          line: 10,
          column: 43
        }
      },
      "6": {
        start: {
          line: 13,
          column: 4
        },
        end: {
          line: 13,
          column: 31
        }
      },
      "7": {
        start: {
          line: 15,
          column: 4
        },
        end: {
          line: 17,
          column: 5
        }
      },
      "8": {
        start: {
          line: 16,
          column: 8
        },
        end: {
          line: 16,
          column: 44
        }
      },
      "9": {
        start: {
          line: 21,
          column: 4
        },
        end: {
          line: 21,
          column: 31
        }
      },
      "10": {
        start: {
          line: 23,
          column: 4
        },
        end: {
          line: 25,
          column: 5
        }
      },
      "11": {
        start: {
          line: 24,
          column: 8
        },
        end: {
          line: 24,
          column: 44
        }
      },
      "12": {
        start: {
          line: 29,
          column: 4
        },
        end: {
          line: 29,
          column: 33
        }
      },
      "13": {
        start: {
          line: 31,
          column: 4
        },
        end: {
          line: 31,
          column: 14
        }
      },
      "14": {
        start: {
          line: 34,
          column: 16
        },
        end: {
          line: 40,
          column: 1
        }
      },
      "15": {
        start: {
          line: 35,
          column: 24
        },
        end: {
          line: 37,
          column: 5
        }
      },
      "16": {
        start: {
          line: 39,
          column: 4
        },
        end: {
          line: 39,
          column: 23
        }
      },
      "17": {
        start: {
          line: 43,
          column: 4
        },
        end: {
          line: 43,
          column: 43
        }
      },
      "18": {
        start: {
          line: 46,
          column: 8
        },
        end: {
          line: 46,
          column: 44
        }
      },
      "19": {
        start: {
          line: 47,
          column: 8
        },
        end: {
          line: 47,
          column: 18
        }
      },
      "20": {
        start: {
          line: 50,
          column: 4
        },
        end: {
          line: 50,
          column: 19
        }
      },
      "21": {
        start: {
          line: 52,
          column: 15
        },
        end: {
          line: 54,
          column: 5
        }
      },
      "22": {
        start: {
          line: 53,
          column: 8
        },
        end: {
          line: 53,
          column: 25
        }
      },
      "23": {
        start: {
          line: 56,
          column: 4
        },
        end: {
          line: 58,
          column: 7
        }
      },
      "24": {
        start: {
          line: 57,
          column: 8
        },
        end: {
          line: 57,
          column: 24
        }
      },
      "25": {
        start: {
          line: 62,
          column: 4
        },
        end: {
          line: 62,
          column: 32
        }
      },
      "26": {
        start: {
          line: 63,
          column: 4
        },
        end: {
          line: 63,
          column: 12
        }
      },
      "27": {
        start: {
          line: 65,
          column: 4
        },
        end: {
          line: 68,
          column: 5
        }
      },
      "28": {
        start: {
          line: 66,
          column: 8
        },
        end: {
          line: 66,
          column: 36
        }
      },
      "29": {
        start: {
          line: 67,
          column: 8
        },
        end: {
          line: 67,
          column: 15
        }
      },
      "30": {
        start: {
          line: 70,
          column: 19
        },
        end: {
          line: 75,
          column: 5
        }
      },
      "31": {
        start: {
          line: 71,
          column: 8
        },
        end: {
          line: 71,
          column: 38
        }
      },
      "32": {
        start: {
          line: 72,
          column: 8
        },
        end: {
          line: 74,
          column: 9
        }
      },
      "33": {
        start: {
          line: 73,
          column: 12
        },
        end: {
          line: 73,
          column: 51
        }
      },
      "34": {
        start: {
          line: 77,
          column: 17
        },
        end: {
          line: 77,
          column: 25
        }
      },
      "35": {
        start: {
          line: 79,
          column: 4
        },
        end: {
          line: 81,
          column: 7
        }
      },
      "36": {
        start: {
          line: 80,
          column: 8
        },
        end: {
          line: 80,
          column: 12
        }
      },
      "37": {
        start: {
          line: 83,
          column: 14
        },
        end: {
          line: 83,
          column: 19
        }
      },
      "38": {
        start: {
          line: 84,
          column: 4
        },
        end: {
          line: 86,
          column: 5
        }
      },
      "39": {
        start: {
          line: 85,
          column: 8
        },
        end: {
          line: 85,
          column: 26
        }
      },
      "40": {
        start: {
          line: 90,
          column: 15
        },
        end: {
          line: 106,
          column: 1
        }
      },
      "41": {
        start: {
          line: 91,
          column: 4
        },
        end: {
          line: 91,
          column: 34
        }
      },
      "42": {
        start: {
          line: 92,
          column: 4
        },
        end: {
          line: 95,
          column: 5
        }
      },
      "43": {
        start: {
          line: 93,
          column: 8
        },
        end: {
          line: 93,
          column: 43
        }
      },
      "44": {
        start: {
          line: 94,
          column: 8
        },
        end: {
          line: 94,
          column: 15
        }
      },
      "45": {
        start: {
          line: 96,
          column: 4
        },
        end: {
          line: 96,
          column: 29
        }
      },
      "46": {
        start: {
          line: 98,
          column: 4
        },
        end: {
          line: 98,
          column: 13
        }
      },
      "47": {
        start: {
          line: 99,
          column: 4
        },
        end: {
          line: 99,
          column: 17
        }
      },
      "48": {
        start: {
          line: 100,
          column: 4
        },
        end: {
          line: 100,
          column: 13
        }
      },
      "49": {
        start: {
          line: 101,
          column: 4
        },
        end: {
          line: 101,
          column: 16
        }
      },
      "50": {
        start: {
          line: 103,
          column: 19
        },
        end: {
          line: 103,
          column: 36
        }
      },
      "51": {
        start: {
          line: 104,
          column: 4
        },
        end: {
          line: 104,
          column: 18
        }
      },
      "52": {
        start: {
          line: 110,
          column: 0
        },
        end: {
          line: 110,
          column: 26
        }
      },
      "53": {
        start: {
          line: 110,
          column: 27
        },
        end: {
          line: 110,
          column: 56
        }
      },
      "54": {
        start: {
          line: 113,
          column: 0
        },
        end: {
          line: 115,
          column: 2
        }
      }
    },
    fnMap: {
      "0": {
        name: "foo",
        decl: {
          start: {
            line: 12,
            column: 9
          },
          end: {
            line: 12,
            column: 12
          }
        },
        loc: {
          start: {
            line: 12,
            column: 23
          },
          end: {
            line: 18,
            column: 1
          }
        },
        line: 12
      },
      "1": {
        name: "bar",
        decl: {
          start: {
            line: 20,
            column: 9
          },
          end: {
            line: 20,
            column: 12
          }
        },
        loc: {
          start: {
            line: 20,
            column: 23
          },
          end: {
            line: 26,
            column: 1
          }
        },
        line: 20
      },
      "2": {
        name: "start",
        decl: {
          start: {
            line: 28,
            column: 9
          },
          end: {
            line: 28,
            column: 14
          }
        },
        loc: {
          start: {
            line: 28,
            column: 17
          },
          end: {
            line: 32,
            column: 1
          }
        },
        line: 28
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 34,
            column: 16
          },
          end: {
            line: 34,
            column: 17
          }
        },
        loc: {
          start: {
            line: 34,
            column: 22
          },
          end: {
            line: 40,
            column: 1
          }
        },
        line: 34
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 35,
            column: 24
          },
          end: {
            line: 35,
            column: 25
          }
        },
        loc: {
          start: {
            line: 35,
            column: 30
          },
          end: {
            line: 37,
            column: 5
          }
        },
        line: 35
      },
      "5": {
        name: "privateFunction",
        decl: {
          start: {
            line: 42,
            column: 9
          },
          end: {
            line: 42,
            column: 24
          }
        },
        loc: {
          start: {
            line: 42,
            column: 27
          },
          end: {
            line: 59,
            column: 1
          }
        },
        line: 42
      },
      "6": {
        name: "sub_function",
        decl: {
          start: {
            line: 45,
            column: 13
          },
          end: {
            line: 45,
            column: 25
          }
        },
        loc: {
          start: {
            line: 45,
            column: 28
          },
          end: {
            line: 48,
            column: 5
          }
        },
        line: 45
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 52,
            column: 15
          },
          end: {
            line: 52,
            column: 16
          }
        },
        loc: {
          start: {
            line: 52,
            column: 21
          },
          end: {
            line: 54,
            column: 5
          }
        },
        line: 52
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 56,
            column: 17
          },
          end: {
            line: 56,
            column: 18
          }
        },
        loc: {
          start: {
            line: 56,
            column: 30
          },
          end: {
            line: 58,
            column: 5
          }
        },
        line: 56
      },
      "9": {
        name: "init",
        decl: {
          start: {
            line: 61,
            column: 9
          },
          end: {
            line: 61,
            column: 13
          }
        },
        loc: {
          start: {
            line: 61,
            column: 20
          },
          end: {
            line: 88,
            column: 1
          }
        },
        line: 61
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 70,
            column: 19
          },
          end: {
            line: 70,
            column: 20
          }
        },
        loc: {
          start: {
            line: 70,
            column: 26
          },
          end: {
            line: 75,
            column: 5
          }
        },
        line: 70
      },
      "11": {
        name: "(anonymous_11)",
        decl: {
          start: {
            line: 79,
            column: 17
          },
          end: {
            line: 79,
            column: 18
          }
        },
        loc: {
          start: {
            line: 79,
            column: 24
          },
          end: {
            line: 81,
            column: 5
          }
        },
        line: 79
      },
      "12": {
        name: "(anonymous_12)",
        decl: {
          start: {
            line: 90,
            column: 15
          },
          end: {
            line: 90,
            column: 16
          }
        },
        loc: {
          start: {
            line: 90,
            column: 30
          },
          end: {
            line: 106,
            column: 1
          }
        },
        line: 90
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 15,
            column: 4
          },
          end: {
            line: 17,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 15,
            column: 4
          },
          end: {
            line: 17,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 15
      },
      "1": {
        loc: {
          start: {
            line: 23,
            column: 4
          },
          end: {
            line: 25,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 23,
            column: 4
          },
          end: {
            line: 25,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 23
      },
      "2": {
        loc: {
          start: {
            line: 65,
            column: 4
          },
          end: {
            line: 68,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 65,
            column: 4
          },
          end: {
            line: 68,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 65
      },
      "3": {
        loc: {
          start: {
            line: 72,
            column: 8
          },
          end: {
            line: 74,
            column: 9
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 72,
            column: 8
          },
          end: {
            line: 74,
            column: 9
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 72
      },
      "4": {
        loc: {
          start: {
            line: 84,
            column: 4
          },
          end: {
            line: 86,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 84,
            column: 4
          },
          end: {
            line: 86,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 84
      },
      "5": {
        loc: {
          start: {
            line: 92,
            column: 4
          },
          end: {
            line: 95,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 92,
            column: 4
          },
          end: {
            line: 95,
            column: 5
          }
        }, {
          start: {
            line: undefined,
            column: undefined
          },
          end: {
            line: undefined,
            column: undefined
          }
        }],
        line: 92
      },
      "6": {
        loc: {
          start: {
            line: 103,
            column: 19
          },
          end: {
            line: 103,
            column: 36
          }
        },
        type: "cond-expr",
        locations: [{
          start: {
            line: 103,
            column: 31
          },
          end: {
            line: 103,
            column: 32
          }
        }, {
          start: {
            line: 103,
            column: 35
          },
          end: {
            line: 103,
            column: 36
          }
        }],
        line: 103
      }
    },
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0
    },
    f: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0
    },
    b: {
      "0": [0, 0],
      "1": [0, 0],
      "2": [0, 0],
      "3": [0, 0],
      "4": [0, 0],
      "5": [0, 0],
      "6": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "663235ed06a99d6742040093fdc5920dc28ad6f8"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_9wnj9yq0u = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_9wnj9yq0u();
cov_9wnj9yq0u().s[0]++;
__webpack_require__(/*! ../minify/comments.js */ "./test/mock/minify/comments.js");
cov_9wnj9yq0u().s[1]++;
__webpack_require__(/*! ../minify/demo.js */ "./test/mock/minify/demo.js");
const {
  ignore
} = (cov_9wnj9yq0u().s[2]++, __webpack_require__(/*! ./ignore.js */ "./test/mock/src/ignore.js"));
const branch = (cov_9wnj9yq0u().s[3]++, __webpack_require__(/*! ./branch.js */ "./test/mock/src/branch.js"));
const typescript = (cov_9wnj9yq0u().s[4]++, __webpack_require__(/*! ./typescript.ts */ "./test/mock/src/typescript.ts"));
const component = (cov_9wnj9yq0u().s[5]++, __webpack_require__(/*! ./component.js */ "./test/mock/src/component.js"));
function foo(argument) {
  cov_9wnj9yq0u().f[0]++;
  cov_9wnj9yq0u().s[6]++;
  console.log('this is foo');
  cov_9wnj9yq0u().s[7]++;
  if (argument) {
    cov_9wnj9yq0u().b[0][0]++;
    cov_9wnj9yq0u().s[8]++;
    console.log('covered foo argument');
  } else {
    cov_9wnj9yq0u().b[0][1]++;
  }
}
function bar(argument) {
  cov_9wnj9yq0u().f[1]++;
  cov_9wnj9yq0u().s[9]++;
  console.log('this is bar');
  cov_9wnj9yq0u().s[10]++;
  if (argument) {
    cov_9wnj9yq0u().b[1][0]++;
    cov_9wnj9yq0u().s[11]++;
    console.log('covered bar argument');
  } else {
    cov_9wnj9yq0u().b[1][1]++;
  }
}
function start() {
  cov_9wnj9yq0u().f[2]++;
  cov_9wnj9yq0u().s[12]++;
  console.log('this is start');
  cov_9wnj9yq0u().s[13]++;
  foo(true);
}
cov_9wnj9yq0u().s[14]++;
const out_fun = () => {
  cov_9wnj9yq0u().f[3]++;
  cov_9wnj9yq0u().s[15]++;
  const out_sub_fun = () => {
    cov_9wnj9yq0u().f[4]++;
  };
  cov_9wnj9yq0u().s[16]++;
  return out_sub_fun;
};
function privateFunction() {
  cov_9wnj9yq0u().f[5]++;
  cov_9wnj9yq0u().s[17]++;
  console.log('this is privateFunction');
  function sub_function() {
    cov_9wnj9yq0u().f[6]++;
    cov_9wnj9yq0u().s[18]++;
    console.log('this is sub function');
    cov_9wnj9yq0u().s[19]++;
    out_fun();
  }
  cov_9wnj9yq0u().s[20]++;
  sub_function();
  cov_9wnj9yq0u().s[21]++;
  const af = () => {
    cov_9wnj9yq0u().f[7]++;
    cov_9wnj9yq0u().s[22]++;
    return [1, 2, 3];
  };
  cov_9wnj9yq0u().s[23]++;
  af().forEach(function (it) {
    cov_9wnj9yq0u().f[8]++;
    cov_9wnj9yq0u().s[24]++;
    console.log(it);
  });
}
function init(stop) {
  cov_9wnj9yq0u().f[9]++;
  cov_9wnj9yq0u().s[25]++;
  console.log('this is init');
  cov_9wnj9yq0u().s[26]++;
  start();
  cov_9wnj9yq0u().s[27]++;
  if (stop) {
    cov_9wnj9yq0u().b[2][0]++;
    cov_9wnj9yq0u().s[28]++;
    console.log('stop in init');
    cov_9wnj9yq0u().s[29]++;
    return;
  } else {
    cov_9wnj9yq0u().b[2][1]++;
  }
  cov_9wnj9yq0u().s[30]++;
  const inline = a => {
    cov_9wnj9yq0u().f[10]++;
    cov_9wnj9yq0u().s[31]++;
    console.log('this is inline');
    cov_9wnj9yq0u().s[32]++;
    if (a) {
      cov_9wnj9yq0u().b[3][0]++;
      cov_9wnj9yq0u().s[33]++;
      console.log('covered inline argument');
    } else {
      cov_9wnj9yq0u().b[3][1]++;
    }
  };
  const list = (cov_9wnj9yq0u().s[34]++, [inline]);
  cov_9wnj9yq0u().s[35]++;
  list.forEach(i => {
    cov_9wnj9yq0u().f[11]++;
    cov_9wnj9yq0u().s[36]++;
    i();
  });
  const f = (cov_9wnj9yq0u().s[37]++, false);
  cov_9wnj9yq0u().s[38]++;
  if (f) {
    cov_9wnj9yq0u().b[4][0]++;
    cov_9wnj9yq0u().s[39]++;
    privateFunction();
  } else {
    cov_9wnj9yq0u().b[4][1]++;
  }
}
cov_9wnj9yq0u().s[40]++;
const onload = something => {
  cov_9wnj9yq0u().f[12]++;
  cov_9wnj9yq0u().s[41]++;
  console.log('this is onload');
  cov_9wnj9yq0u().s[42]++;
  if (something) {
    cov_9wnj9yq0u().b[5][0]++;
    cov_9wnj9yq0u().s[43]++;
    console.log('stop with something');
    cov_9wnj9yq0u().s[44]++;
    return;
  } else {
    cov_9wnj9yq0u().b[5][1]++;
  }
  cov_9wnj9yq0u().s[45]++;
  console.log('on loaded');
  cov_9wnj9yq0u().s[46]++;
  ignore();
  cov_9wnj9yq0u().s[47]++;
  typescript();
  cov_9wnj9yq0u().s[48]++;
  branch();
  cov_9wnj9yq0u().s[49]++;
  component();
  const number = (cov_9wnj9yq0u().s[50]++, something ? (cov_9wnj9yq0u().b[6][0]++, 1) : (cov_9wnj9yq0u().b[6][1]++, 2));
  cov_9wnj9yq0u().s[51]++;
  return number;
};

// one line but two statements
cov_9wnj9yq0u().s[52]++;
init(window._my_stop_key);
cov_9wnj9yq0u().s[53]++;
onload(window._my_something);
cov_9wnj9yq0u().s[54]++;
module.exports = {
  foo,
  bar,
  start
};

/***/ }),

/***/ "./test/mock/src/typescript.ts":
/*!*************************************!*\
  !*** ./test/mock/src/typescript.ts ***!
  \*************************************/
/***/ ((module) => {

var fun = function (p, pointIn) {
    var str = "hello world";
    console.log(p, pointIn, str);
    return str;
};
var typescript = function (p, s) {
    /*
       typescript block comment
    */
    var pointIn = {
        x: 1,
        y: 2
    };
    // typescript line comment
    var v = fun(p, pointIn);
    console.log(p, s, v);
};
module.exports = typescript;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./test/mock/src/index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=coverage-istanbul.js.map