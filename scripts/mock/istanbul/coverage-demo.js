(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("coverage-demo", [], factory);
	else if(typeof exports === 'object')
		exports["coverage-demo"] = factory();
	else
		root["coverage-demo"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!****************************************!*\
  !*** ./packages/coverage/src/index.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EC": () => (/* binding */ EC)
/* harmony export */ });
function cov_15y6hsfnlz() {
  var path = "H:\\workspace\\monocart-reporter-test\\packages\\coverage\\src\\index.js";
  var hash = "e63054bae87caa20b0f7bc2916cbf57b1cc20a2d";
  var global = new Function("return this")();
  var gcv = "__coverage__";
  var coverageData = {
    path: "H:\\workspace\\monocart-reporter-test\\packages\\coverage\\src\\index.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 11
        },
        end: {
          line: 1,
          column: 13
        }
      },
      "1": {
        start: {
          line: 3,
          column: 12
        },
        end: {
          line: 5,
          column: 1
        }
      },
      "2": {
        start: {
          line: 4,
          column: 4
        },
        end: {
          line: 4,
          column: 46
        }
      },
      "3": {
        start: {
          line: 12,
          column: 13
        },
        end: {
          line: 12,
          column: 84
        }
      },
      "4": {
        start: {
          line: 15,
          column: 0
        },
        end: {
          line: 19,
          column: 3
        }
      },
      "5": {
        start: {
          line: 16,
          column: 4
        },
        end: {
          line: 18,
          column: 6
        }
      },
      "6": {
        start: {
          line: 17,
          column: 8
        },
        end: {
          line: 17,
          column: 39
        }
      },
      "7": {
        start: {
          line: 22,
          column: 0
        },
        end: {
          line: 22,
          column: 11
        }
      },
      "8": {
        start: {
          line: 23,
          column: 0
        },
        end: {
          line: 27,
          column: 3
        }
      },
      "9": {
        start: {
          line: 24,
          column: 4
        },
        end: {
          line: 26,
          column: 6
        }
      },
      "10": {
        start: {
          line: 25,
          column: 8
        },
        end: {
          line: 25,
          column: 39
        }
      },
      "11": {
        start: {
          line: 30,
          column: 0
        },
        end: {
          line: 30,
          column: 11
        }
      },
      "12": {
        start: {
          line: 31,
          column: 0
        },
        end: {
          line: 35,
          column: 3
        }
      },
      "13": {
        start: {
          line: 32,
          column: 4
        },
        end: {
          line: 34,
          column: 6
        }
      },
      "14": {
        start: {
          line: 33,
          column: 8
        },
        end: {
          line: 33,
          column: 39
        }
      },
      "15": {
        start: {
          line: 38,
          column: 0
        },
        end: {
          line: 38,
          column: 14
        }
      },
      "16": {
        start: {
          line: 39,
          column: 0
        },
        end: {
          line: 43,
          column: 3
        }
      },
      "17": {
        start: {
          line: 40,
          column: 4
        },
        end: {
          line: 42,
          column: 6
        }
      },
      "18": {
        start: {
          line: 41,
          column: 8
        },
        end: {
          line: 41,
          column: 40
        }
      },
      "19": {
        start: {
          line: 47,
          column: 0
        },
        end: {
          line: 49,
          column: 2
        }
      },
      "20": {
        start: {
          line: 48,
          column: 4
        },
        end: {
          line: 48,
          column: 30
        }
      },
      "21": {
        start: {
          line: 50,
          column: 0
        },
        end: {
          line: 52,
          column: 2
        }
      },
      "22": {
        start: {
          line: 51,
          column: 4
        },
        end: {
          line: 51,
          column: 31
        }
      },
      "23": {
        start: {
          line: 53,
          column: 0
        },
        end: {
          line: 55,
          column: 2
        }
      },
      "24": {
        start: {
          line: 54,
          column: 4
        },
        end: {
          line: 54,
          column: 31
        }
      },
      "25": {
        start: {
          line: 56,
          column: 0
        },
        end: {
          line: 58,
          column: 2
        }
      },
      "26": {
        start: {
          line: 57,
          column: 4
        },
        end: {
          line: 57,
          column: 31
        }
      },
      "27": {
        start: {
          line: 59,
          column: 0
        },
        end: {
          line: 61,
          column: 2
        }
      },
      "28": {
        start: {
          line: 60,
          column: 4
        },
        end: {
          line: 60,
          column: 31
        }
      },
      "29": {
        start: {
          line: 62,
          column: 0
        },
        end: {
          line: 64,
          column: 2
        }
      },
      "30": {
        start: {
          line: 63,
          column: 4
        },
        end: {
          line: 63,
          column: 31
        }
      },
      "31": {
        start: {
          line: 65,
          column: 0
        },
        end: {
          line: 67,
          column: 2
        }
      },
      "32": {
        start: {
          line: 66,
          column: 4
        },
        end: {
          line: 66,
          column: 31
        }
      },
      "33": {
        start: {
          line: 68,
          column: 0
        },
        end: {
          line: 70,
          column: 2
        }
      },
      "34": {
        start: {
          line: 69,
          column: 4
        },
        end: {
          line: 69,
          column: 31
        }
      },
      "35": {
        start: {
          line: 73,
          column: 0
        },
        end: {
          line: 75,
          column: 2
        }
      },
      "36": {
        start: {
          line: 74,
          column: 4
        },
        end: {
          line: 74,
          column: 49
        }
      },
      "37": {
        start: {
          line: 78,
          column: 0
        },
        end: {
          line: 80,
          column: 2
        }
      },
      "38": {
        start: {
          line: 79,
          column: 4
        },
        end: {
          line: 79,
          column: 42
        }
      },
      "39": {
        start: {
          line: 82,
          column: 0
        },
        end: {
          line: 95,
          column: 2
        }
      },
      "40": {
        start: {
          line: 83,
          column: 17
        },
        end: {
          line: 83,
          column: 38
        }
      },
      "41": {
        start: {
          line: 84,
          column: 18
        },
        end: {
          line: 84,
          column: 28
        }
      },
      "42": {
        start: {
          line: 86,
          column: 15
        },
        end: {
          line: 86,
          column: 24
        }
      },
      "43": {
        start: {
          line: 87,
          column: 4
        },
        end: {
          line: 92,
          column: 5
        }
      },
      "44": {
        start: {
          line: 88,
          column: 8
        },
        end: {
          line: 88,
          column: 33
        }
      },
      "45": {
        start: {
          line: 90,
          column: 8
        },
        end: {
          line: 90,
          column: 25
        }
      },
      "46": {
        start: {
          line: 91,
          column: 8
        },
        end: {
          line: 91,
          column: 29
        }
      },
      "47": {
        start: {
          line: 93,
          column: 4
        },
        end: {
          line: 93,
          column: 16
        }
      },
      "48": {
        start: {
          line: 94,
          column: 4
        },
        end: {
          line: 94,
          column: 15
        }
      },
      "49": {
        start: {
          line: 97,
          column: 0
        },
        end: {
          line: 104,
          column: 3
        }
      },
      "50": {
        start: {
          line: 98,
          column: 16
        },
        end: {
          line: 98,
          column: 70
        }
      },
      "51": {
        start: {
          line: 99,
          column: 4
        },
        end: {
          line: 103,
          column: 6
        }
      },
      "52": {
        start: {
          line: 100,
          column: 21
        },
        end: {
          line: 100,
          column: 42
        }
      },
      "53": {
        start: {
          line: 101,
          column: 8
        },
        end: {
          line: 101,
          column: 25
        }
      },
      "54": {
        start: {
          line: 102,
          column: 8
        },
        end: {
          line: 102,
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
            column: 12
          },
          end: {
            line: 3,
            column: 13
          }
        },
        loc: {
          start: {
            line: 3,
            column: 33
          },
          end: {
            line: 5,
            column: 1
          }
        },
        line: 3
      },
      "1": {
        name: "(anonymous_1)",
        decl: {
          start: {
            line: 15,
            column: 13
          },
          end: {
            line: 15,
            column: 14
          }
        },
        loc: {
          start: {
            line: 15,
            column: 26
          },
          end: {
            line: 19,
            column: 1
          }
        },
        line: 15
      },
      "2": {
        name: "(anonymous_2)",
        decl: {
          start: {
            line: 16,
            column: 15
          },
          end: {
            line: 16,
            column: 16
          }
        },
        loc: {
          start: {
            line: 16,
            column: 24
          },
          end: {
            line: 18,
            column: 5
          }
        },
        line: 16
      },
      "3": {
        name: "(anonymous_3)",
        decl: {
          start: {
            line: 23,
            column: 13
          },
          end: {
            line: 23,
            column: 14
          }
        },
        loc: {
          start: {
            line: 23,
            column: 26
          },
          end: {
            line: 27,
            column: 1
          }
        },
        line: 23
      },
      "4": {
        name: "(anonymous_4)",
        decl: {
          start: {
            line: 24,
            column: 18
          },
          end: {
            line: 24,
            column: 19
          }
        },
        loc: {
          start: {
            line: 24,
            column: 27
          },
          end: {
            line: 26,
            column: 5
          }
        },
        line: 24
      },
      "5": {
        name: "(anonymous_5)",
        decl: {
          start: {
            line: 31,
            column: 13
          },
          end: {
            line: 31,
            column: 14
          }
        },
        loc: {
          start: {
            line: 31,
            column: 26
          },
          end: {
            line: 35,
            column: 1
          }
        },
        line: 31
      },
      "6": {
        name: "(anonymous_6)",
        decl: {
          start: {
            line: 32,
            column: 18
          },
          end: {
            line: 32,
            column: 19
          }
        },
        loc: {
          start: {
            line: 32,
            column: 27
          },
          end: {
            line: 34,
            column: 5
          }
        },
        line: 32
      },
      "7": {
        name: "(anonymous_7)",
        decl: {
          start: {
            line: 39,
            column: 13
          },
          end: {
            line: 39,
            column: 14
          }
        },
        loc: {
          start: {
            line: 39,
            column: 26
          },
          end: {
            line: 43,
            column: 1
          }
        },
        line: 39
      },
      "8": {
        name: "(anonymous_8)",
        decl: {
          start: {
            line: 40,
            column: 21
          },
          end: {
            line: 40,
            column: 22
          }
        },
        loc: {
          start: {
            line: 40,
            column: 30
          },
          end: {
            line: 42,
            column: 5
          }
        },
        line: 40
      },
      "9": {
        name: "(anonymous_9)",
        decl: {
          start: {
            line: 47,
            column: 11
          },
          end: {
            line: 47,
            column: 12
          }
        },
        loc: {
          start: {
            line: 47,
            column: 20
          },
          end: {
            line: 49,
            column: 1
          }
        },
        line: 47
      },
      "10": {
        name: "(anonymous_10)",
        decl: {
          start: {
            line: 50,
            column: 10
          },
          end: {
            line: 50,
            column: 11
          }
        },
        loc: {
          start: {
            line: 50,
            column: 19
          },
          end: {
            line: 52,
            column: 1
          }
        },
        line: 50
      },
      "11": {
        name: "(anonymous_11)",
        decl: {
          start: {
            line: 53,
            column: 11
          },
          end: {
            line: 53,
            column: 12
          }
        },
        loc: {
          start: {
            line: 53,
            column: 20
          },
          end: {
            line: 55,
            column: 1
          }
        },
        line: 53
      },
      "12": {
        name: "(anonymous_12)",
        decl: {
          start: {
            line: 56,
            column: 12
          },
          end: {
            line: 56,
            column: 13
          }
        },
        loc: {
          start: {
            line: 56,
            column: 21
          },
          end: {
            line: 58,
            column: 1
          }
        },
        line: 56
      },
      "13": {
        name: "(anonymous_13)",
        decl: {
          start: {
            line: 59,
            column: 15
          },
          end: {
            line: 59,
            column: 16
          }
        },
        loc: {
          start: {
            line: 59,
            column: 24
          },
          end: {
            line: 61,
            column: 1
          }
        },
        line: 59
      },
      "14": {
        name: "(anonymous_14)",
        decl: {
          start: {
            line: 62,
            column: 13
          },
          end: {
            line: 62,
            column: 14
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
      },
      "15": {
        name: "(anonymous_15)",
        decl: {
          start: {
            line: 65,
            column: 12
          },
          end: {
            line: 65,
            column: 13
          }
        },
        loc: {
          start: {
            line: 65,
            column: 21
          },
          end: {
            line: 67,
            column: 1
          }
        },
        line: 65
      },
      "16": {
        name: "(anonymous_16)",
        decl: {
          start: {
            line: 68,
            column: 12
          },
          end: {
            line: 68,
            column: 13
          }
        },
        loc: {
          start: {
            line: 68,
            column: 21
          },
          end: {
            line: 70,
            column: 1
          }
        },
        line: 68
      },
      "17": {
        name: "(anonymous_17)",
        decl: {
          start: {
            line: 73,
            column: 12
          },
          end: {
            line: 73,
            column: 13
          }
        },
        loc: {
          start: {
            line: 73,
            column: 21
          },
          end: {
            line: 75,
            column: 1
          }
        },
        line: 73
      },
      "18": {
        name: "(anonymous_18)",
        decl: {
          start: {
            line: 78,
            column: 9
          },
          end: {
            line: 78,
            column: 10
          }
        },
        loc: {
          start: {
            line: 78,
            column: 20
          },
          end: {
            line: 80,
            column: 1
          }
        },
        line: 78
      },
      "19": {
        name: "(anonymous_19)",
        decl: {
          start: {
            line: 82,
            column: 14
          },
          end: {
            line: 82,
            column: 15
          }
        },
        loc: {
          start: {
            line: 82,
            column: 25
          },
          end: {
            line: 95,
            column: 1
          }
        },
        line: 82
      },
      "20": {
        name: "(anonymous_20)",
        decl: {
          start: {
            line: 97,
            column: 13
          },
          end: {
            line: 97,
            column: 14
          }
        },
        loc: {
          start: {
            line: 97,
            column: 24
          },
          end: {
            line: 104,
            column: 1
          }
        },
        line: 97
      },
      "21": {
        name: "(anonymous_21)",
        decl: {
          start: {
            line: 99,
            column: 14
          },
          end: {
            line: 99,
            column: 15
          }
        },
        loc: {
          start: {
            line: 99,
            column: 25
          },
          end: {
            line: 103,
            column: 5
          }
        },
        line: 99
      }
    },
    branchMap: {
      "0": {
        loc: {
          start: {
            line: 87,
            column: 4
          },
          end: {
            line: 92,
            column: 5
          }
        },
        type: "if",
        locations: [{
          start: {
            line: 87,
            column: 4
          },
          end: {
            line: 92,
            column: 5
          }
        }, {
          start: {
            line: 89,
            column: 11
          },
          end: {
            line: 92,
            column: 5
          }
        }],
        line: 87
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
    b: {
      "0": [0, 0]
    },
    _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
    hash: "e63054bae87caa20b0f7bc2916cbf57b1cc20a2d"
  };
  var coverage = global[gcv] || (global[gcv] = {});
  if (!coverage[path] || coverage[path].hash !== hash) {
    coverage[path] = coverageData;
  }
  var actualCoverage = coverage[path];
  {
    // @ts-ignore
    cov_15y6hsfnlz = function () {
      return actualCoverage;
    };
  }
  return actualCoverage;
}
cov_15y6hsfnlz();
const EC = (cov_15y6hsfnlz().s[0]++, {});
cov_15y6hsfnlz().s[1]++;
const add = (start, str, end) => {
  cov_15y6hsfnlz().f[0]++;
  cov_15y6hsfnlz().s[2]++;
  return `\x1b[${start}m${str}\x1b[${end}m`;
};

// https://en.wikipedia.org/wiki/ANSI_escape_code
// https://handwiki.org/wiki/ANSI_escape_code

// eight colors
// 0 - 7
const list = (cov_15y6hsfnlz().s[3]++, ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']);

// text color
cov_15y6hsfnlz().s[4]++;
list.forEach((name, i) => {
  cov_15y6hsfnlz().f[1]++;
  cov_15y6hsfnlz().s[5]++;
  EC[name] = str => {
    cov_15y6hsfnlz().f[2]++;
    cov_15y6hsfnlz().s[6]++;
    return add(`3${i}`, str, '39');
  };
});

// background color
cov_15y6hsfnlz().s[7]++;
EC.bg = {};
cov_15y6hsfnlz().s[8]++;
list.forEach((name, i) => {
  cov_15y6hsfnlz().f[3]++;
  cov_15y6hsfnlz().s[9]++;
  EC.bg[name] = str => {
    cov_15y6hsfnlz().f[4]++;
    cov_15y6hsfnlz().s[10]++;
    return add(`4${i}`, str, '49');
  };
});

// bright color
cov_15y6hsfnlz().s[11]++;
EC.br = {};
cov_15y6hsfnlz().s[12]++;
list.forEach((name, i) => {
  cov_15y6hsfnlz().f[5]++;
  cov_15y6hsfnlz().s[13]++;
  EC.br[name] = str => {
    cov_15y6hsfnlz().f[6]++;
    cov_15y6hsfnlz().s[14]++;
    return add(`9${i}`, str, '39');
  };
});

// bright background color
cov_15y6hsfnlz().s[15]++;
EC.br.bg = {};
cov_15y6hsfnlz().s[16]++;
list.forEach((name, i) => {
  cov_15y6hsfnlz().f[7]++;
  cov_15y6hsfnlz().s[17]++;
  EC.br.bg[name] = str => {
    cov_15y6hsfnlz().f[8]++;
    cov_15y6hsfnlz().s[18]++;
    return add(`10${i}`, str, '49');
  };
});

// styles
cov_15y6hsfnlz().s[19]++;
EC.reset = str => {
  cov_15y6hsfnlz().f[9]++;
  cov_15y6hsfnlz().s[20]++;
  return add('0', str, '0');
};
cov_15y6hsfnlz().s[21]++;
EC.bold = str => {
  cov_15y6hsfnlz().f[10]++;
  cov_15y6hsfnlz().s[22]++;
  return add('1', str, '21');
};
cov_15y6hsfnlz().s[23]++;
EC.faint = str => {
  cov_15y6hsfnlz().f[11]++;
  cov_15y6hsfnlz().s[24]++;
  return add('2', str, '22');
};
cov_15y6hsfnlz().s[25]++;
EC.italic = str => {
  cov_15y6hsfnlz().f[12]++;
  cov_15y6hsfnlz().s[26]++;
  return add('3', str, '23');
};
cov_15y6hsfnlz().s[27]++;
EC.underline = str => {
  cov_15y6hsfnlz().f[13]++;
  cov_15y6hsfnlz().s[28]++;
  return add('4', str, '24');
};
cov_15y6hsfnlz().s[29]++;
EC.inverse = str => {
  cov_15y6hsfnlz().f[14]++;
  cov_15y6hsfnlz().s[30]++;
  return add('7', str, '27');
};
cov_15y6hsfnlz().s[31]++;
EC.hidden = str => {
  cov_15y6hsfnlz().f[15]++;
  cov_15y6hsfnlz().s[32]++;
  return add('8', str, '28');
};
cov_15y6hsfnlz().s[33]++;
EC.strike = str => {
  cov_15y6hsfnlz().f[16]++;
  cov_15y6hsfnlz().s[34]++;
  return add('9', str, '29');
};

// remove color
cov_15y6hsfnlz().s[35]++;
EC.remove = str => {
  cov_15y6hsfnlz().f[17]++;
  cov_15y6hsfnlz().s[36]++;
  return `${str}`.replace(/\033\[(\d+)m/g, '');
};

// log hook
cov_15y6hsfnlz().s[37]++;
EC.log = function () {
  cov_15y6hsfnlz().f[18]++;
  cov_15y6hsfnlz().s[38]++;
  console.log.apply(console, arguments);
};
cov_15y6hsfnlz().s[39]++;
EC.logColor = function () {
  cov_15y6hsfnlz().f[19]++;
  const args = (cov_15y6hsfnlz().s[40]++, Array.from(arguments));
  const color = (cov_15y6hsfnlz().s[41]++, args.pop());
  let str;
  const fn = (cov_15y6hsfnlz().s[42]++, EC[color]);
  cov_15y6hsfnlz().s[43]++;
  if (typeof fn === 'function') {
    cov_15y6hsfnlz().b[0][0]++;
    cov_15y6hsfnlz().s[44]++;
    str = fn(args.join(' '));
  } else {
    cov_15y6hsfnlz().b[0][1]++;
    cov_15y6hsfnlz().s[45]++;
    args.push(color);
    cov_15y6hsfnlz().s[46]++;
    str = args.join(' ');
  }
  cov_15y6hsfnlz().s[47]++;
  EC.log(str);
  cov_15y6hsfnlz().s[48]++;
  return str;
};
cov_15y6hsfnlz().s[49]++;
list.forEach(color => {
  cov_15y6hsfnlz().f[20]++;
  const api = (cov_15y6hsfnlz().s[50]++, `log${color.charAt(0).toUpperCase()}${color.slice(1)}`);
  cov_15y6hsfnlz().s[51]++;
  EC[api] = function () {
    cov_15y6hsfnlz().f[21]++;
    const args = (cov_15y6hsfnlz().s[52]++, Array.from(arguments));
    cov_15y6hsfnlz().s[53]++;
    args.push(color);
    cov_15y6hsfnlz().s[54]++;
    return EC.logColor.apply(EC, args);
  };
});

/******/ 	return __webpack_exports__;
/******/ })()
;
});