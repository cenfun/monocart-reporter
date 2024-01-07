(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("coverage-v8", [], factory);
	else if(typeof exports === 'object')
		exports["coverage-v8"] = factory();
	else
		root["coverage-v8"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./test/mock/minify/comments.js":
/*!**************************************!*\
  !*** ./test/mock/minify/comments.js ***!
  \**************************************/
/***/ (() => {

/* eslint-disable no-trailing-spaces,line-comment-position,no-inline-comments,indent,no-multi-spaces,no-multiple-empty-lines */
// LineComment

console.log('some"//"\\\'thing\\'); // comment /*  

// comment /* ---
console.log('some//thing/*'); /*  
                              ddd
                              */
console.log('some/*/thing');
//
console.log(`
        '/*
            "//"
        */'
     `);

/**
    * BlockComment
    
 *
       
        */
console.log('some/*/thing');
console.log('some//thing'); // end of line

/*
    connected
*/
console.log('some*//thing'); /*
                             cross line
                             */

console.log('some*//thing'); /*
                             cross line
                             */

console.log('some*//thing'); /* inline */
console.log('some*//thing');

/*
 multiple line
//

 */

/**/
console.log('some*//thing'); /*
                             console.log('some//*thing')
                             */

/***/ }),

/***/ "./test/mock/minify/demo.js":
/*!**********************************!*\
  !*** ./test/mock/minify/demo.js ***!
  \**********************************/
/***/ (() => {

function callback() {}

/*
    block comment
*/

// v8 ignore next 3
function other() {}

/* inline block */
function method(v) {
  // console.log("method", v);
  if (v === 2) {
    console.log(v);
  }
  if (v % 3 === 0) {
    callback();
  }
  if (v === 3) {
    console.log(v);
  }
  return v === 'other' ? () => {
    console.log('never covered');
  } : other;
}
const main = () => {
  // console.log('main');
  method(1);
  method(2);
  const a = 10;
  if (a === 11) {
    callback();
  }
  for (let i = 0; i < 1000; i++) {
    method(i);
  }
  const f = false;
  if (f) {
    console.log('never covered');
  }
  const str = '📙 Emoji — 😃 💁👌🎍😍';
  const lz = window['lz-utils'];
  if (lz) {
    const {
      compress,
      decompress
    } = lz;
    console.assert(str === decompress(compress(str)));
  }
};
window.onload = () => {
  main();
};

/***/ }),

/***/ "./test/mock/src/branch.js":
/*!*********************************!*\
  !*** ./test/mock/src/branch.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* branches test cases */

const ConditionalExpression = __webpack_require__(/*! ./branch/conditional.js */ "./test/mock/src/branch/conditional.js");
const IfStatement = __webpack_require__(/*! ./branch/if.js */ "./test/mock/src/branch/if.js");
const LogicalExpression = __webpack_require__(/*! ./branch/logical.js */ "./test/mock/src/branch/logical.js");
const SwitchStatement = __webpack_require__(/*! ./branch/switch.js */ "./test/mock/src/branch/switch.js");
const uncoveredFunction = () => {
  const list = [1, 2, 3, 4, 5];
  list.forEach(v => {
    console.log(v);
  });
};
const coveredFunction = () => {
  for (let i = 0; i < 3; i++) {
    if (i > 1) {
      console.log(i);
    } else if (i > 100) {
      uncoveredFunction();
    }
  }
};

// AssignmentPattern
// ((a = 0) => {
//     console.log(a);
// })();

const branch = () => {
  coveredFunction();
  ConditionalExpression();
  IfStatement();
  LogicalExpression();
  SwitchStatement();
};
module.exports = branch;

/***/ }),

/***/ "./test/mock/src/branch/conditional.js":
/*!*********************************************!*\
  !*** ./test/mock/src/branch/conditional.js ***!
  \*********************************************/
/***/ ((module) => {

// 5 x 4 = 20
const ConditionalExpression = (tf1, tf2) => {
  const a = tf1 ? 'true' : 'false';
  console.log(a);
  const b = tf2 ? 'true' : 'false';
  console.log(b);
};
const ConditionalExpression_11 = (tf1, tf2) => {
  const a = tf1 ? 'true' : 'false';
  console.log(a);
  const b = tf2 ? 'true' : 'false';
  console.log(b);
  ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_10 = (tf1, tf2) => {
  const a = tf1 ? 'true' : 'false';
  console.log(a);
  const b = tf2 ? 'true' : 'false';
  console.log(b);
  ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_01 = (tf1, tf2) => {
  const a = tf1 ? 'true' : 'false';
  console.log(a);
  const b = tf2 ? 'true' : 'false';
  console.log(b);
  ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_00 = (tf1, tf2) => {
  const a = tf1 ? 'true' : 'false';
  console.log(a);
  const b = tf2 ? 'true' : 'false';
  console.log(b);
  ConditionalExpression(tf1, tf2);
};
module.exports = () => {
  ConditionalExpression_11(true, true);
  ConditionalExpression_10(true, false);
  ConditionalExpression_01(false, true);
  ConditionalExpression_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/if.js":
/*!************************************!*\
  !*** ./test/mock/src/branch/if.js ***!
  \************************************/
/***/ ((module) => {

// 5 x 10 = 50 ( (count if) x 2 )
const IfStatement = (tf1, tf2) => {
  if (tf1) {
    console.log('if1');
  }
  if (tf1) {
    console.log('if2');
  } else if (tf2) {
    console.log('ifelse2');
  }
  if (tf1) {
    console.log('if3');
  } else if (tf2) {
    console.log('ifelse3');
  } else {
    console.log('else3');
  }
};
const IfStatement_11 = (tf1, tf2) => {
  if (tf1) {
    console.log('if1');
  }
  if (tf1) {
    console.log('if2');
  } else if (tf2) {
    console.log('ifelse2');
  }
  if (tf1) {
    console.log('if3');
  } else if (tf2) {
    console.log('ifelse3');
  } else {
    console.log('else3');
  }
  IfStatement(tf1, tf2);
};
const IfStatement_10 = (tf1, tf2) => {
  if (tf1) {
    console.log('if1');
  }
  if (tf1) {
    console.log('if2');
  } else if (tf2) {
    console.log('ifelse2');
  }
  if (tf1) {
    console.log('if3');
  } else if (tf2) {
    console.log('ifelse3');
  } else {
    console.log('else3');
  }
  IfStatement(tf1, tf2);
};
const IfStatement_01 = (tf1, tf2) => {
  if (tf1) {
    console.log('if1');
  }
  if (tf1) {
    console.log('if2');
  } else if (tf2) {
    console.log('ifelse2');
  }
  if (tf1) {
    console.log('if3');
  } else if (tf2) {
    console.log('ifelse3');
  } else {
    console.log('else3');
  }
  IfStatement(tf1, tf2);
};
const IfStatement_00 = (tf1, tf2) => {
  if (tf1) {
    console.log('if1');
  }
  if (tf1) {
    console.log('if2');
  } else if (tf2) {
    console.log('ifelse2');
  }
  if (tf1) {
    console.log('if3');
  } else if (tf2) {
    console.log('ifelse3');
  } else {
    console.log('else3');
  }
  IfStatement(tf1, tf2);
};
module.exports = () => {
  IfStatement_11(true, true);
  IfStatement_10(true, false);
  IfStatement_01(false, true);
  IfStatement_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/logical.js":
/*!*****************************************!*\
  !*** ./test/mock/src/branch/logical.js ***!
  \*****************************************/
/***/ ((module) => {

// 5 x 5 = 25
const LogicalExpression = (tf1, tf2) => {
  for (let i = 0; i < 2; i++) {
    const a = tf1 || tf2;
    const b = tf2 || tf1 || a;
    console.log(b);
  }
  if (tf1) {
    const c = tf2 || 2;
    console.log(c);
  }
};
const LogicalExpression_11 = (tf1, tf2) => {
  const a = tf1 || tf2;
  const b = tf2 || tf1 || a;
  console.log(b);
  LogicalExpression(tf1, tf2);
};
const LogicalExpression_10 = (tf1, tf2) => {
  const a = tf1 || tf2;
  const b = tf2 || tf1 || a;
  console.log(b);
  LogicalExpression(tf1, tf2);
};
const LogicalExpression_01 = (tf1, tf2) => {
  const a = tf1 || tf2;
  const b = tf2 || tf1 || a;
  console.log(b);
  LogicalExpression(tf1, tf2);
};
const LogicalExpression_00 = (tf1, tf2) => {
  const a = tf1 || tf2;
  const b = tf2 || tf1 || a;
  console.log(b);
  LogicalExpression(tf1, tf2);
};
module.exports = () => {
  LogicalExpression_11(true, true);
  LogicalExpression_10(true, false);
  LogicalExpression_01(false, true);
  LogicalExpression_00(false, false);
};

/***/ }),

/***/ "./test/mock/src/branch/switch.js":
/*!****************************************!*\
  !*** ./test/mock/src/branch/switch.js ***!
  \****************************************/
/***/ ((module) => {

/* eslint-disable default-case */

// 4 + 3 + 4 + 4 + 4 + 3 = 22
const SwitchStatement = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
      break;
    default:
      console.log('default');
  }
};
const SwitchStatement_1 = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
  }
  SwitchStatement(n);
};
const SwitchStatement_2 = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
      break;
    default:
      console.log('default');
  }
  SwitchStatement(n);
};
const SwitchStatement_3 = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
      break;
    default:
      console.log('default');
  }
  SwitchStatement(n);
};
const SwitchStatement_4 = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
      break;
    default:
      console.log('default');
  }
  SwitchStatement(n);
};
const SwitchStatement_5 = n => {
  switch (n) {
    case 1:
      console.log(1);
      break;
    case 2:
    case 3:
      console.log(2);
      break;
  }
  SwitchStatement(n);
};
module.exports = () => {
  SwitchStatement_1(1);
  SwitchStatement_2(2);
  SwitchStatement_3(3);
  SwitchStatement_4(4);
  SwitchStatement_5(5);
};

/***/ }),

/***/ "./test/mock/src/component.js":
/*!************************************!*\
  !*** ./test/mock/src/component.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const ts = __webpack_require__(/*! ./typescript.ts */ "./test/mock/src/typescript.ts");
module.exports = () => {
  console.log('this is component');
  ts();
};

/***/ }),

/***/ "./test/mock/src/ignore.js":
/*!*********************************!*\
  !*** ./test/mock/src/ignore.js ***!
  \*********************************/
/***/ ((module) => {

const platform = 'wind32';

/* v8 ignore next */
if (platform === 'darwin') {
  console.info('hello darwin');
  // v8 ignore next
}

/* v8 ignore next 3 */
if (platform === 'linux') {
  console.info('hello linux');
}
const os = platform === 'wind32' ? 'Windows' /* v8 ignore next */ : 'Other';

/* v8 ignore start */
function uncovered(v) {
  console.log(os);
} /* v8 ignore stop */

const neverMind = /* v8 ignore start */() => {
  uncovered();
};

/* v8 ignore stop */

const ignore = v => {
  if (v) {
    neverMind();
  }
};
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

__webpack_require__(/*! ../minify/comments.js */ "./test/mock/minify/comments.js");
__webpack_require__(/*! ../minify/demo.js */ "./test/mock/minify/demo.js");
const {
  ignore
} = __webpack_require__(/*! ./ignore.js */ "./test/mock/src/ignore.js");
const branch = __webpack_require__(/*! ./branch.js */ "./test/mock/src/branch.js");
const typescript = __webpack_require__(/*! ./typescript.ts */ "./test/mock/src/typescript.ts");
const component = __webpack_require__(/*! ./component.js */ "./test/mock/src/component.js");
function foo(argument) {
  console.log('this is foo');
  if (argument) {
    console.log('covered foo argument');
  }
}
function bar(argument) {
  console.log('this is bar');
  if (argument) {
    console.log('covered bar argument');
  }
}
function start() {
  console.log('this is start');
  foo(true);
}
const out_fun = () => {
  const out_sub_fun = () => {};
  return out_sub_fun;
};
function privateFunction() {
  console.log('this is privateFunction');
  function sub_function() {
    console.log('this is sub function');
    out_fun();
  }
  sub_function();
  const af = () => {
    return [1, 2, 3];
  };
  af().forEach(function (it) {
    console.log(it);
  });
}
function init(stop) {
  console.log('this is init');
  start();
  if (stop) {
    console.log('stop in init');
    return;
  }
  const inline = a => {
    console.log('this is inline');
    if (a) {
      console.log('covered inline argument');
    }
  };
  const list = [inline];
  list.forEach(i => {
    i();
  });
  const f = false;
  if (f) {
    privateFunction();
  }
}
const onload = something => {
  console.log('this is onload');
  if (something) {
    console.log('stop with something');
    return;
  }
  console.log('on loaded');
  ignore();
  typescript();
  branch();
  component();
  const number = something ? 1 : 2;
  return number;
};

// one line but two statements
init(window._my_stop_key);
onload(window._my_something);
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
//# sourceMappingURL=coverage-v8.js.map