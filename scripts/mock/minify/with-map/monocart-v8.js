(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("monocart-code-viewer"), require("monocart-formatter"));
	else if(typeof define === 'function' && define.amd)
		define("monocart-v8", ["monocart-code-viewer", "monocart-formatter"], factory);
	else if(typeof exports === 'object')
		exports["monocart-v8"] = factory(require("monocart-code-viewer"), require("monocart-formatter"));
	else
		root["monocart-v8"] = factory(root["monocart-code-viewer"], root["monocart-formatter"]);
})(self, (__WEBPACK_EXTERNAL_MODULE_monocart_code_viewer__, __WEBPACK_EXTERNAL_MODULE_monocart_formatter__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EffectScope": () => (/* binding */ EffectScope),
/* harmony export */   "ITERATE_KEY": () => (/* binding */ ITERATE_KEY),
/* harmony export */   "ReactiveEffect": () => (/* binding */ ReactiveEffect),
/* harmony export */   "computed": () => (/* binding */ computed),
/* harmony export */   "customRef": () => (/* binding */ customRef),
/* harmony export */   "deferredComputed": () => (/* binding */ deferredComputed),
/* harmony export */   "effect": () => (/* binding */ effect),
/* harmony export */   "effectScope": () => (/* binding */ effectScope),
/* harmony export */   "enableTracking": () => (/* binding */ enableTracking),
/* harmony export */   "getCurrentScope": () => (/* binding */ getCurrentScope),
/* harmony export */   "isProxy": () => (/* binding */ isProxy),
/* harmony export */   "isReactive": () => (/* binding */ isReactive),
/* harmony export */   "isReadonly": () => (/* binding */ isReadonly),
/* harmony export */   "isRef": () => (/* binding */ isRef),
/* harmony export */   "isShallow": () => (/* binding */ isShallow),
/* harmony export */   "markRaw": () => (/* binding */ markRaw),
/* harmony export */   "onScopeDispose": () => (/* binding */ onScopeDispose),
/* harmony export */   "pauseTracking": () => (/* binding */ pauseTracking),
/* harmony export */   "proxyRefs": () => (/* binding */ proxyRefs),
/* harmony export */   "reactive": () => (/* binding */ reactive),
/* harmony export */   "readonly": () => (/* binding */ readonly),
/* harmony export */   "ref": () => (/* binding */ ref),
/* harmony export */   "resetTracking": () => (/* binding */ resetTracking),
/* harmony export */   "shallowReactive": () => (/* binding */ shallowReactive),
/* harmony export */   "shallowReadonly": () => (/* binding */ shallowReadonly),
/* harmony export */   "shallowRef": () => (/* binding */ shallowRef),
/* harmony export */   "stop": () => (/* binding */ stop),
/* harmony export */   "toRaw": () => (/* binding */ toRaw),
/* harmony export */   "toRef": () => (/* binding */ toRef),
/* harmony export */   "toRefs": () => (/* binding */ toRefs),
/* harmony export */   "track": () => (/* binding */ track),
/* harmony export */   "trigger": () => (/* binding */ trigger),
/* harmony export */   "triggerRef": () => (/* binding */ triggerRef),
/* harmony export */   "unref": () => (/* binding */ unref)
/* harmony export */ });
/* harmony import */ var _vue_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/shared */ "./node_modules/@vue/shared/dist/shared.esm-bundler.js");


function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}

let activeEffectScope;
class EffectScope {
    constructor(detached = false) {
        this.detached = detached;
        /**
         * @internal
         */
        this._active = true;
        /**
         * @internal
         */
        this.effects = [];
        /**
         * @internal
         */
        this.cleanups = [];
        this.parent = activeEffectScope;
        if (!detached && activeEffectScope) {
            this.index =
                (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
        }
    }
    get active() {
        return this._active;
    }
    run(fn) {
        if (this._active) {
            const currentEffectScope = activeEffectScope;
            try {
                activeEffectScope = this;
                return fn();
            }
            finally {
                activeEffectScope = currentEffectScope;
            }
        }
        else if ((true)) {
            warn(`cannot run an inactive effect scope.`);
        }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
        activeEffectScope = this;
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
        activeEffectScope = this.parent;
    }
    stop(fromParent) {
        if (this._active) {
            let i, l;
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].stop();
            }
            for (i = 0, l = this.cleanups.length; i < l; i++) {
                this.cleanups[i]();
            }
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].stop(true);
                }
            }
            // nested scope, dereference from parent to avoid memory leaks
            if (!this.detached && this.parent && !fromParent) {
                // optimized O(1) removal
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.parent = undefined;
            this._active = false;
        }
    }
}
function effectScope(detached) {
    return new EffectScope(detached);
}
function recordEffectScope(effect, scope = activeEffectScope) {
    if (scope && scope.active) {
        scope.effects.push(effect);
    }
}
function getCurrentScope() {
    return activeEffectScope;
}
function onScopeDispose(fn) {
    if (activeEffectScope) {
        activeEffectScope.cleanups.push(fn);
    }
    else if ((true)) {
        warn(`onScopeDispose() is called when there is no active effect scope` +
            ` to be associated with.`);
    }
}

const createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].w |= trackOpBit; // set was tracked
        }
    }
};
const finalizeDepMarkers = (effect) => {
    const { deps } = effect;
    if (deps.length) {
        let ptr = 0;
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i];
            if (wasTracked(dep) && !newTracked(dep)) {
                dep.delete(effect);
            }
            else {
                deps[ptr++] = dep;
            }
            // clear bits
            dep.w &= ~trackOpBit;
            dep.n &= ~trackOpBit;
        }
        deps.length = ptr;
    }
};

const targetMap = new WeakMap();
// The number of effects currently being tracked recursively.
let effectTrackDepth = 0;
let trackOpBit = 1;
/**
 * The bitwise track markers support at most 30 levels of recursion.
 * This value is chosen to enable modern JS engines to use a SMI on all platforms.
 * When recursion depth is greater, fall back to using a full cleanup.
 */
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol(( true) ? 'iterate' : 0);
const MAP_KEY_ITERATE_KEY = Symbol(( true) ? 'Map key iterate' : 0);
class ReactiveEffect {
    constructor(fn, scheduler = null, scope) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this.parent = undefined;
        recordEffectScope(this, scope);
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        let parent = activeEffect;
        let lastShouldTrack = shouldTrack;
        while (parent) {
            if (parent === this) {
                return;
            }
            parent = parent.parent;
        }
        try {
            this.parent = activeEffect;
            activeEffect = this;
            shouldTrack = true;
            trackOpBit = 1 << ++effectTrackDepth;
            if (effectTrackDepth <= maxMarkerBits) {
                initDepMarkers(this);
            }
            else {
                cleanupEffect(this);
            }
            return this.fn();
        }
        finally {
            if (effectTrackDepth <= maxMarkerBits) {
                finalizeDepMarkers(this);
            }
            trackOpBit = 1 << --effectTrackDepth;
            activeEffect = this.parent;
            shouldTrack = lastShouldTrack;
            this.parent = undefined;
            if (this.deferStop) {
                this.stop();
            }
        }
    }
    stop() {
        // stopped while running itself - defer the cleanup
        if (activeEffect === this) {
            this.deferStop = true;
        }
        else if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}
function effect(fn, options) {
    if (fn.effect) {
        fn = fn.effect.fn;
    }
    const _effect = new ReactiveEffect(fn);
    if (options) {
        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.extend)(_effect, options);
        if (options.scope)
            recordEffectScope(_effect, options.scope);
    }
    if (!options || !options.lazy) {
        _effect.run();
    }
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
}
function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}
function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        const eventInfo = ( true)
            ? { effect: activeEffect, target, type, key }
            : 0;
        trackEffects(dep, eventInfo);
    }
}
function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit; // set newly tracked
            shouldTrack = !wasTracked(dep);
        }
    }
    else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect);
    }
    if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
        if (( true) && activeEffect.onTrack) {
            activeEffect.onTrack(Object.assign({ effect: activeEffect }, debuggerEventExtraInfo));
        }
    }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    let deps = [];
    if (type === "clear" /* TriggerOpTypes.CLEAR */) {
        // collection being cleared
        // trigger all effects for target
        deps = [...depsMap.values()];
    }
    else if (key === 'length' && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= newLength) {
                deps.push(dep);
            }
        });
    }
    else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }
        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case "add" /* TriggerOpTypes.ADD */:
                if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key)) {
                    // new index added to array -> length changes
                    deps.push(depsMap.get('length'));
                }
                break;
            case "delete" /* TriggerOpTypes.DELETE */:
                if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case "set" /* TriggerOpTypes.SET */:
                if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }
    const eventInfo = ( true)
        ? { target, type, key, newValue, oldValue, oldTarget }
        : 0;
    if (deps.length === 1) {
        if (deps[0]) {
            if ((true)) {
                triggerEffects(deps[0], eventInfo);
            }
            else {}
        }
    }
    else {
        const effects = [];
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep);
            }
        }
        if ((true)) {
            triggerEffects(createDep(effects), eventInfo);
        }
        else {}
    }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
    // spread into array for stabilization
    const effects = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(dep) ? dep : [...dep];
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
}
function triggerEffect(effect, debuggerEventExtraInfo) {
    if (effect !== activeEffect || effect.allowRecurse) {
        if (( true) && effect.onTrigger) {
            effect.onTrigger((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.extend)({ effect }, debuggerEventExtraInfo));
        }
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function getDepFromReactive(object, key) {
    var _a;
    return (_a = targetMap.get(object)) === null || _a === void 0 ? void 0 : _a.get(key);
}

const isNonTrackableKeys = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.makeMap)(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
/*#__PURE__*/
Object.getOwnPropertyNames(Symbol)
    // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
    // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
    // function
    .filter(key => key !== 'arguments' && key !== 'caller')
    .map(key => Symbol[key])
    .filter(_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol));
const get$1 = /*#__PURE__*/ createGetter();
const shallowGet = /*#__PURE__*/ createGetter(false, true);
const readonlyGet = /*#__PURE__*/ createGetter(true);
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
        instrumentations[key] = function (...args) {
            const arr = toRaw(this);
            for (let i = 0, l = this.length; i < l; i++) {
                track(arr, "get" /* TrackOpTypes.GET */, i + '');
            }
            // we run the method using the original args first (which may be reactive)
            const res = arr[key](...args);
            if (res === -1 || res === false) {
                // if that didn't work, run it again using raw values.
                return arr[key](...args.map(toRaw));
            }
            else {
                return res;
            }
        };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
        instrumentations[key] = function (...args) {
            pauseTracking();
            const res = toRaw(this)[key].apply(this, args);
            resetTracking();
            return res;
        };
    });
    return instrumentations;
}
function hasOwnProperty(key) {
    const obj = toRaw(this);
    track(obj, "has" /* TrackOpTypes.HAS */, key);
    return obj.hasOwnProperty(key);
}
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */) {
            return shallow;
        }
        else if (key === "__v_raw" /* ReactiveFlags.RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        const targetIsArray = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target);
        if (!isReadonly) {
            if (targetIsArray && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(arrayInstrumentations, key)) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }
            if (key === 'hasOwnProperty') {
                return hasOwnProperty;
            }
        }
        const res = Reflect.get(target, key, receiver);
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol)(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
        }
        if (!isReadonly) {
            track(target, "get" /* TrackOpTypes.GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isRef(res)) {
            // ref unwrapping - skip unwrap for Array + integer key.
            return targetIsArray && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key) ? res : res.value;
        }
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const set$1 = /*#__PURE__*/ createSetter();
const shallowSet = /*#__PURE__*/ createSetter(true);
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        let oldValue = target[key];
        if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
            return false;
        }
        if (!shallow) {
            if (!isShallow(value) && !isReadonly(value)) {
                oldValue = toRaw(oldValue);
                value = toRaw(value);
            }
            if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) && isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
        }
        const hadKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isIntegerKey)(key)
            ? Number(key) < target.length
            : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(target, key);
        const result = Reflect.set(target, key, value, receiver);
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                trigger(target, "add" /* TriggerOpTypes.ADD */, key, value);
            }
            else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(value, oldValue)) {
                trigger(target, "set" /* TriggerOpTypes.SET */, key, value, oldValue);
            }
        }
        return result;
    };
}
function deleteProperty(target, key) {
    const hadKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
        trigger(target, "delete" /* TriggerOpTypes.DELETE */, key, undefined, oldValue);
    }
    return result;
}
function has$1(target, key) {
    const result = Reflect.has(target, key);
    if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isSymbol)(key) || !builtInSymbols.has(key)) {
        track(target, "has" /* TrackOpTypes.HAS */, key);
    }
    return result;
}
function ownKeys(target) {
    track(target, "iterate" /* TrackOpTypes.ITERATE */, (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
}
const mutableHandlers = {
    get: get$1,
    set: set$1,
    deleteProperty,
    has: has$1,
    ownKeys
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        if ((true)) {
            warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    },
    deleteProperty(target, key) {
        if ((true)) {
            warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    }
};
const shallowReactiveHandlers = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.extend)({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
});
// Props handlers are special in the sense that it should not unwrap top-level
// refs (in order to allow refs to be explicitly passed down), but should
// retain the reactivity of the normal readonly object.
const shallowReadonlyHandlers = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.extend)({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly = false, isShallow = false) {
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw" /* ReactiveFlags.RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "get" /* TrackOpTypes.GET */, key);
        }
        track(rawTarget, "get" /* TrackOpTypes.GET */, rawKey);
    }
    const { has } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
    }
    else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
    }
    else if (target !== rawTarget) {
        // #3602 readonly(reactive(Map))
        // ensure that the nested reactive `Map` can do tracking for itself
        target.get(key);
    }
}
function has(key, isReadonly = false) {
    const target = this["__v_raw" /* ReactiveFlags.RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "has" /* TrackOpTypes.HAS */, key);
        }
        track(rawTarget, "has" /* TrackOpTypes.HAS */, rawKey);
    }
    return key === rawKey
        ? target.has(key)
        : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
    target = target["__v_raw" /* ReactiveFlags.RAW */];
    !isReadonly && track(toRaw(target), "iterate" /* TrackOpTypes.ITERATE */, ITERATE_KEY);
    return Reflect.get(target, 'size', target);
}
function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
        target.add(value);
        trigger(target, "add" /* TriggerOpTypes.ADD */, value, value);
    }
    return this;
}
function set(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else if ((true)) {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get.call(target, key);
    target.set(key, value);
    if (!hadKey) {
        trigger(target, "add" /* TriggerOpTypes.ADD */, key, value);
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(value, oldValue)) {
        trigger(target, "set" /* TriggerOpTypes.SET */, key, value, oldValue);
    }
    return this;
}
function deleteEntry(key) {
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else if ((true)) {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get ? get.call(target, key) : undefined;
    // forward the operation before queueing reactions
    const result = target.delete(key);
    if (hadKey) {
        trigger(target, "delete" /* TriggerOpTypes.DELETE */, key, undefined, oldValue);
    }
    return result;
}
function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = ( true)
        ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(target)
            ? new Map(target)
            : new Set(target)
        : 0;
    // forward the operation before queueing reactions
    const result = target.clear();
    if (hadItems) {
        trigger(target, "clear" /* TriggerOpTypes.CLEAR */, undefined, undefined, oldTarget);
    }
    return result;
}
function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw" /* ReactiveFlags.RAW */];
        const rawTarget = toRaw(target);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate" /* TrackOpTypes.ITERATE */, ITERATE_KEY);
        return target.forEach((value, key) => {
            // important: make sure the callback is
            // 1. invoked with the reactive map as `this` and 3rd arg
            // 2. the value received should be a corresponding reactive/readonly.
            return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
    };
}
function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
        const target = this["__v_raw" /* ReactiveFlags.RAW */];
        const rawTarget = toRaw(target);
        const targetIsMap = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isMap)(rawTarget);
        const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
        const isKeyOnly = method === 'keys' && targetIsMap;
        const innerIterator = target[method](...args);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly &&
            track(rawTarget, "iterate" /* TrackOpTypes.ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
        // return a wrapped iterator which returns observed versions of the
        // values emitted from the real iterator
        return {
            // iterator protocol
            next() {
                const { value, done } = innerIterator.next();
                return done
                    ? { value, done }
                    : {
                        value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                        done
                    };
            },
            // iterable protocol
            [Symbol.iterator]() {
                return this;
            }
        };
    };
}
function createReadonlyMethod(type) {
    return function (...args) {
        if ((true)) {
            const key = args[0] ? `on key "${args[0]}" ` : ``;
            console.warn(`${(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.capitalize)(type)} operation ${key}failed: target is readonly.`, toRaw(this));
        }
        return type === "delete" /* TriggerOpTypes.DELETE */ ? false : this;
    };
}
function createInstrumentations() {
    const mutableInstrumentations = {
        get(key) {
            return get(this, key);
        },
        get size() {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    const shallowInstrumentations = {
        get(key) {
            return get(this, key, false, true);
        },
        get size() {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    const readonlyInstrumentations = {
        get(key) {
            return get(this, key, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* TriggerOpTypes.ADD */),
        set: createReadonlyMethod("set" /* TriggerOpTypes.SET */),
        delete: createReadonlyMethod("delete" /* TriggerOpTypes.DELETE */),
        clear: createReadonlyMethod("clear" /* TriggerOpTypes.CLEAR */),
        forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations = {
        get(key) {
            return get(this, key, true, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* TriggerOpTypes.ADD */),
        set: createReadonlyMethod("set" /* TriggerOpTypes.SET */),
        delete: createReadonlyMethod("delete" /* TriggerOpTypes.DELETE */),
        clear: createReadonlyMethod("clear" /* TriggerOpTypes.CLEAR */),
        forEach: createForEach(true, true)
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach(method => {
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
    });
    return [
        mutableInstrumentations,
        readonlyInstrumentations,
        shallowInstrumentations,
        shallowReadonlyInstrumentations
    ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* #__PURE__*/ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
        ? isReadonly
            ? shallowReadonlyInstrumentations
            : shallowInstrumentations
        : isReadonly
            ? readonlyInstrumentations
            : mutableInstrumentations;
    return (target, key, receiver) => {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* ReactiveFlags.RAW */) {
            return target;
        }
        return Reflect.get((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasOwn)(instrumentations, key) && key in target
            ? instrumentations
            : target, key, receiver);
    };
}
const mutableCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has.call(target, rawKey)) {
        const type = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.toRawType)(target);
        console.warn(`Reactive ${type} contains both the raw and reactive ` +
            `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
            `which can lead to inconsistencies. ` +
            `Avoid differentiating between the raw and reactive versions ` +
            `of an object and only use the reactive version if possible.`);
    }
}

const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function targetTypeMap(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return 1 /* TargetType.COMMON */;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return 2 /* TargetType.COLLECTION */;
        default:
            return 0 /* TargetType.INVALID */;
    }
}
function getTargetType(value) {
    return value["__v_skip" /* ReactiveFlags.SKIP */] || !Object.isExtensible(value)
        ? 0 /* TargetType.INVALID */
        : targetTypeMap((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.toRawType)(value));
}
function reactive(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (isReadonly(target)) {
        return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
/**
 * Creates a readonly copy of the original object. Note the returned copy is not
 * made reactive, but `readonly` can be called on an already reactive object.
 */
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
/**
 * Returns a reactive-copy of the original object, where only the root level
 * properties are readonly, and does NOT unwrap refs nor recursively convert
 * returned properties.
 * This is used for creating the props proxy object for stateful components.
 */
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(target)) {
        if ((true)) {
            console.warn(`value cannot be made reactive: ${String(target)}`);
        }
        return target;
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (target["__v_raw" /* ReactiveFlags.RAW */] &&
        !(isReadonly && target["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */])) {
        return target;
    }
    // target already has corresponding Proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // only specific value types can be observed.
    const targetType = getTargetType(target);
    if (targetType === 0 /* TargetType.INVALID */) {
        return target;
    }
    const proxy = new Proxy(target, targetType === 2 /* TargetType.COLLECTION */ ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function isReactive(value) {
    if (isReadonly(value)) {
        return isReactive(value["__v_raw" /* ReactiveFlags.RAW */]);
    }
    return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */]);
}
function isShallow(value) {
    return !!(value && value["__v_isShallow" /* ReactiveFlags.IS_SHALLOW */]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* ReactiveFlags.RAW */];
    return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.def)(value, "__v_skip" /* ReactiveFlags.SKIP */, true);
    return value;
}
const toReactive = (value) => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(value) ? reactive(value) : value;
const toReadonly = (value) => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isObject)(value) ? readonly(value) : value;

function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        ref = toRaw(ref);
        if ((true)) {
            trackEffects(ref.dep || (ref.dep = createDep()), {
                target: ref,
                type: "get" /* TrackOpTypes.GET */,
                key: 'value'
            });
        }
        else {}
    }
}
function triggerRefValue(ref, newVal) {
    ref = toRaw(ref);
    const dep = ref.dep;
    if (dep) {
        if ((true)) {
            triggerEffects(dep, {
                target: ref,
                type: "set" /* TriggerOpTypes.SET */,
                key: 'value',
                newValue: newVal
            });
        }
        else {}
    }
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function ref(value) {
    return createRef(value, false);
}
function shallowRef(value) {
    return createRef(value, true);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this.dep = undefined;
        this.__v_isRef = true;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
        newVal = useDirectValue ? newVal : toRaw(newVal);
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.hasChanged)(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = useDirectValue ? newVal : toReactive(newVal);
            triggerRefValue(this, newVal);
        }
    }
}
function triggerRef(ref) {
    triggerRefValue(ref, ( true) ? ref.value : 0);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
    constructor(factory) {
        this.dep = undefined;
        this.__v_isRef = true;
        const { get, set } = factory(() => trackRefValue(this), () => triggerRefValue(this));
        this._get = get;
        this._set = set;
    }
    get value() {
        return this._get();
    }
    set value(newVal) {
        this._set(newVal);
    }
}
function customRef(factory) {
    return new CustomRefImpl(factory);
}
function toRefs(object) {
    if (( true) && !isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isArray)(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}
class ObjectRefImpl {
    constructor(_object, _key, _defaultValue) {
        this._object = _object;
        this._key = _key;
        this._defaultValue = _defaultValue;
        this.__v_isRef = true;
    }
    get value() {
        const val = this._object[this._key];
        return val === undefined ? this._defaultValue : val;
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
    get dep() {
        return getDepFromReactive(toRaw(this._object), this._key);
    }
}
function toRef(object, key, defaultValue) {
    const val = object[key];
    return isRef(val)
        ? val
        : new ObjectRefImpl(object, key, defaultValue);
}

var _a$1;
class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR) {
        this._setter = _setter;
        this.dep = undefined;
        this.__v_isRef = true;
        this[_a$1] = false;
        this._dirty = true;
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this["__v_isReadonly" /* ReactiveFlags.IS_READONLY */] = isReadonly;
    }
    get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        const self = toRaw(this);
        trackRefValue(self);
        if (self._dirty || !self._cacheable) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
_a$1 = "__v_isReadonly" /* ReactiveFlags.IS_READONLY */;
function computed(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    const onlyGetter = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_0__.isFunction)(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = ( true)
            ? () => {
                console.warn('Write operation failed: computed value is readonly');
            }
            : 0;
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
    if (( true) && debugOptions && !isSSR) {
        cRef.effect.onTrack = debugOptions.onTrack;
        cRef.effect.onTrigger = debugOptions.onTrigger;
    }
    return cRef;
}

var _a;
const tick = /*#__PURE__*/ Promise.resolve();
const queue = [];
let queued = false;
const scheduler = (fn) => {
    queue.push(fn);
    if (!queued) {
        queued = true;
        tick.then(flush);
    }
};
const flush = () => {
    for (let i = 0; i < queue.length; i++) {
        queue[i]();
    }
    queue.length = 0;
    queued = false;
};
class DeferredComputedRefImpl {
    constructor(getter) {
        this.dep = undefined;
        this._dirty = true;
        this.__v_isRef = true;
        this[_a] = true;
        let compareTarget;
        let hasCompareTarget = false;
        let scheduled = false;
        this.effect = new ReactiveEffect(getter, (computedTrigger) => {
            if (this.dep) {
                if (computedTrigger) {
                    compareTarget = this._value;
                    hasCompareTarget = true;
                }
                else if (!scheduled) {
                    const valueToCompare = hasCompareTarget ? compareTarget : this._value;
                    scheduled = true;
                    hasCompareTarget = false;
                    scheduler(() => {
                        if (this.effect.active && this._get() !== valueToCompare) {
                            triggerRefValue(this);
                        }
                        scheduled = false;
                    });
                }
                // chained upstream computeds are notified synchronously to ensure
                // value invalidation in case of sync access; normal effects are
                // deferred to be triggered in scheduler.
                for (const e of this.dep) {
                    if (e.computed instanceof DeferredComputedRefImpl) {
                        e.scheduler(true /* computedTrigger */);
                    }
                }
            }
            this._dirty = true;
        });
        this.effect.computed = this;
    }
    _get() {
        if (this._dirty) {
            this._dirty = false;
            return (this._value = this.effect.run());
        }
        return this._value;
    }
    get value() {
        trackRefValue(this);
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        return toRaw(this)._get();
    }
}
_a = "__v_isReadonly" /* ReactiveFlags.IS_READONLY */;
function deferredComputed(getter) {
    return new DeferredComputedRefImpl(getter);
}




/***/ }),

/***/ "./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseTransition": () => (/* binding */ BaseTransition),
/* harmony export */   "Comment": () => (/* binding */ Comment),
/* harmony export */   "EffectScope": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.EffectScope),
/* harmony export */   "Fragment": () => (/* binding */ Fragment),
/* harmony export */   "KeepAlive": () => (/* binding */ KeepAlive),
/* harmony export */   "ReactiveEffect": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect),
/* harmony export */   "Static": () => (/* binding */ Static),
/* harmony export */   "Suspense": () => (/* binding */ Suspense),
/* harmony export */   "Teleport": () => (/* binding */ Teleport),
/* harmony export */   "Text": () => (/* binding */ Text),
/* harmony export */   "assertNumber": () => (/* binding */ assertNumber),
/* harmony export */   "callWithAsyncErrorHandling": () => (/* binding */ callWithAsyncErrorHandling),
/* harmony export */   "callWithErrorHandling": () => (/* binding */ callWithErrorHandling),
/* harmony export */   "camelize": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize),
/* harmony export */   "capitalize": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize),
/* harmony export */   "cloneVNode": () => (/* binding */ cloneVNode),
/* harmony export */   "compatUtils": () => (/* binding */ compatUtils),
/* harmony export */   "computed": () => (/* binding */ computed),
/* harmony export */   "createBlock": () => (/* binding */ createBlock),
/* harmony export */   "createCommentVNode": () => (/* binding */ createCommentVNode),
/* harmony export */   "createElementBlock": () => (/* binding */ createElementBlock),
/* harmony export */   "createElementVNode": () => (/* binding */ createBaseVNode),
/* harmony export */   "createHydrationRenderer": () => (/* binding */ createHydrationRenderer),
/* harmony export */   "createPropsRestProxy": () => (/* binding */ createPropsRestProxy),
/* harmony export */   "createRenderer": () => (/* binding */ createRenderer),
/* harmony export */   "createSlots": () => (/* binding */ createSlots),
/* harmony export */   "createStaticVNode": () => (/* binding */ createStaticVNode),
/* harmony export */   "createTextVNode": () => (/* binding */ createTextVNode),
/* harmony export */   "createVNode": () => (/* binding */ createVNode),
/* harmony export */   "customRef": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.customRef),
/* harmony export */   "defineAsyncComponent": () => (/* binding */ defineAsyncComponent),
/* harmony export */   "defineComponent": () => (/* binding */ defineComponent),
/* harmony export */   "defineEmits": () => (/* binding */ defineEmits),
/* harmony export */   "defineExpose": () => (/* binding */ defineExpose),
/* harmony export */   "defineProps": () => (/* binding */ defineProps),
/* harmony export */   "devtools": () => (/* binding */ devtools),
/* harmony export */   "effect": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.effect),
/* harmony export */   "effectScope": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.effectScope),
/* harmony export */   "getCurrentInstance": () => (/* binding */ getCurrentInstance),
/* harmony export */   "getCurrentScope": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope),
/* harmony export */   "getTransitionRawChildren": () => (/* binding */ getTransitionRawChildren),
/* harmony export */   "guardReactiveProps": () => (/* binding */ guardReactiveProps),
/* harmony export */   "h": () => (/* binding */ h),
/* harmony export */   "handleError": () => (/* binding */ handleError),
/* harmony export */   "initCustomFormatter": () => (/* binding */ initCustomFormatter),
/* harmony export */   "inject": () => (/* binding */ inject),
/* harmony export */   "isMemoSame": () => (/* binding */ isMemoSame),
/* harmony export */   "isProxy": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy),
/* harmony export */   "isReactive": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive),
/* harmony export */   "isReadonly": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReadonly),
/* harmony export */   "isRef": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef),
/* harmony export */   "isRuntimeOnly": () => (/* binding */ isRuntimeOnly),
/* harmony export */   "isShallow": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isShallow),
/* harmony export */   "isVNode": () => (/* binding */ isVNode),
/* harmony export */   "markRaw": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.markRaw),
/* harmony export */   "mergeDefaults": () => (/* binding */ mergeDefaults),
/* harmony export */   "mergeProps": () => (/* binding */ mergeProps),
/* harmony export */   "nextTick": () => (/* binding */ nextTick),
/* harmony export */   "normalizeClass": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeClass),
/* harmony export */   "normalizeProps": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeProps),
/* harmony export */   "normalizeStyle": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeStyle),
/* harmony export */   "onActivated": () => (/* binding */ onActivated),
/* harmony export */   "onBeforeMount": () => (/* binding */ onBeforeMount),
/* harmony export */   "onBeforeUnmount": () => (/* binding */ onBeforeUnmount),
/* harmony export */   "onBeforeUpdate": () => (/* binding */ onBeforeUpdate),
/* harmony export */   "onDeactivated": () => (/* binding */ onDeactivated),
/* harmony export */   "onErrorCaptured": () => (/* binding */ onErrorCaptured),
/* harmony export */   "onMounted": () => (/* binding */ onMounted),
/* harmony export */   "onRenderTracked": () => (/* binding */ onRenderTracked),
/* harmony export */   "onRenderTriggered": () => (/* binding */ onRenderTriggered),
/* harmony export */   "onScopeDispose": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.onScopeDispose),
/* harmony export */   "onServerPrefetch": () => (/* binding */ onServerPrefetch),
/* harmony export */   "onUnmounted": () => (/* binding */ onUnmounted),
/* harmony export */   "onUpdated": () => (/* binding */ onUpdated),
/* harmony export */   "openBlock": () => (/* binding */ openBlock),
/* harmony export */   "popScopeId": () => (/* binding */ popScopeId),
/* harmony export */   "provide": () => (/* binding */ provide),
/* harmony export */   "proxyRefs": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.proxyRefs),
/* harmony export */   "pushScopeId": () => (/* binding */ pushScopeId),
/* harmony export */   "queuePostFlushCb": () => (/* binding */ queuePostFlushCb),
/* harmony export */   "reactive": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.reactive),
/* harmony export */   "readonly": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.readonly),
/* harmony export */   "ref": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref),
/* harmony export */   "registerRuntimeCompiler": () => (/* binding */ registerRuntimeCompiler),
/* harmony export */   "renderList": () => (/* binding */ renderList),
/* harmony export */   "renderSlot": () => (/* binding */ renderSlot),
/* harmony export */   "resolveComponent": () => (/* binding */ resolveComponent),
/* harmony export */   "resolveDirective": () => (/* binding */ resolveDirective),
/* harmony export */   "resolveDynamicComponent": () => (/* binding */ resolveDynamicComponent),
/* harmony export */   "resolveFilter": () => (/* binding */ resolveFilter),
/* harmony export */   "resolveTransitionHooks": () => (/* binding */ resolveTransitionHooks),
/* harmony export */   "setBlockTracking": () => (/* binding */ setBlockTracking),
/* harmony export */   "setDevtoolsHook": () => (/* binding */ setDevtoolsHook),
/* harmony export */   "setTransitionHooks": () => (/* binding */ setTransitionHooks),
/* harmony export */   "shallowReactive": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReactive),
/* harmony export */   "shallowReadonly": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly),
/* harmony export */   "shallowRef": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowRef),
/* harmony export */   "ssrContextKey": () => (/* binding */ ssrContextKey),
/* harmony export */   "ssrUtils": () => (/* binding */ ssrUtils),
/* harmony export */   "stop": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.stop),
/* harmony export */   "toDisplayString": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toDisplayString),
/* harmony export */   "toHandlerKey": () => (/* reexport safe */ _vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey),
/* harmony export */   "toHandlers": () => (/* binding */ toHandlers),
/* harmony export */   "toRaw": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw),
/* harmony export */   "toRef": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRef),
/* harmony export */   "toRefs": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRefs),
/* harmony export */   "transformVNodeArgs": () => (/* binding */ transformVNodeArgs),
/* harmony export */   "triggerRef": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.triggerRef),
/* harmony export */   "unref": () => (/* reexport safe */ _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.unref),
/* harmony export */   "useAttrs": () => (/* binding */ useAttrs),
/* harmony export */   "useSSRContext": () => (/* binding */ useSSRContext),
/* harmony export */   "useSlots": () => (/* binding */ useSlots),
/* harmony export */   "useTransitionState": () => (/* binding */ useTransitionState),
/* harmony export */   "version": () => (/* binding */ version),
/* harmony export */   "warn": () => (/* binding */ warn),
/* harmony export */   "watch": () => (/* binding */ watch),
/* harmony export */   "watchEffect": () => (/* binding */ watchEffect),
/* harmony export */   "watchPostEffect": () => (/* binding */ watchPostEffect),
/* harmony export */   "watchSyncEffect": () => (/* binding */ watchSyncEffect),
/* harmony export */   "withAsyncContext": () => (/* binding */ withAsyncContext),
/* harmony export */   "withCtx": () => (/* binding */ withCtx),
/* harmony export */   "withDefaults": () => (/* binding */ withDefaults),
/* harmony export */   "withDirectives": () => (/* binding */ withDirectives),
/* harmony export */   "withMemo": () => (/* binding */ withMemo),
/* harmony export */   "withScopeId": () => (/* binding */ withScopeId)
/* harmony export */ });
/* harmony import */ var _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/reactivity */ "./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");
/* harmony import */ var _vue_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @vue/shared */ "./node_modules/@vue/shared/dist/shared.esm-bundler.js");





const stack = [];
function pushWarningContext(vnode) {
    stack.push(vnode);
}
function popWarningContext() {
    stack.pop();
}
function warn(msg, ...args) {
    if (false)
        {}
    // avoid props formatting or warn handler tracking deps that might be mutated
    // during patch, leading to infinite recursion.
    (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
        callWithErrorHandling(appWarnHandler, instance, 11 /* ErrorCodes.APP_WARN_HANDLER */, [
            msg + args.join(''),
            instance && instance.proxy,
            trace
                .map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`)
                .join('\n'),
            trace
        ]);
    }
    else {
        const warnArgs = [`[Vue warn]: ${msg}`, ...args];
        /* istanbul ignore if */
        if (trace.length &&
            // avoid spamming console during tests
            !false) {
            warnArgs.push(`\n`, ...formatTrace(trace));
        }
        console.warn(...warnArgs);
    }
    (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
}
function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
        return [];
    }
    // we can't just use the stack because it will be incomplete during updates
    // that did not start from the root. Re-construct the parent chain using
    // instance parent pointers.
    const normalizedStack = [];
    while (currentVNode) {
        const last = normalizedStack[0];
        if (last && last.vnode === currentVNode) {
            last.recurseCount++;
        }
        else {
            normalizedStack.push({
                vnode: currentVNode,
                recurseCount: 0
            });
        }
        const parentInstance = currentVNode.component && currentVNode.component.parent;
        currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
}
/* istanbul ignore next */
function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
        logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
    });
    return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
    const close = `>` + postfix;
    return vnode.props
        ? [open, ...formatProps(vnode.props), close]
        : [open + close];
}
/* istanbul ignore next */
function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach(key => {
        res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
        res.push(` ...`);
    }
    return res;
}
/* istanbul ignore next */
function formatProp(key, value, raw) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(value)) {
        value = JSON.stringify(value);
        return raw ? value : [`${key}=${value}`];
    }
    else if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        value == null) {
        return raw ? value : [`${key}=${value}`];
    }
    else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(value)) {
        value = formatProp(key, (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(value.value), true);
        return raw ? value : [`${key}=Ref<`, value, `>`];
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) {
        return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    }
    else {
        value = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(value);
        return raw ? value : [`${key}=`, value];
    }
}
/**
 * @internal
 */
function assertNumber(val, type) {
    if (false)
        {}
    if (val === undefined) {
        return;
    }
    else if (typeof val !== 'number') {
        warn(`${type} is not a valid number - ` + `got ${JSON.stringify(val)}.`);
    }
    else if (isNaN(val)) {
        warn(`${type} is NaN - ` + 'the duration expression might be incorrect.');
    }
}

const ErrorTypeStrings = {
    ["sp" /* LifecycleHooks.SERVER_PREFETCH */]: 'serverPrefetch hook',
    ["bc" /* LifecycleHooks.BEFORE_CREATE */]: 'beforeCreate hook',
    ["c" /* LifecycleHooks.CREATED */]: 'created hook',
    ["bm" /* LifecycleHooks.BEFORE_MOUNT */]: 'beforeMount hook',
    ["m" /* LifecycleHooks.MOUNTED */]: 'mounted hook',
    ["bu" /* LifecycleHooks.BEFORE_UPDATE */]: 'beforeUpdate hook',
    ["u" /* LifecycleHooks.UPDATED */]: 'updated',
    ["bum" /* LifecycleHooks.BEFORE_UNMOUNT */]: 'beforeUnmount hook',
    ["um" /* LifecycleHooks.UNMOUNTED */]: 'unmounted hook',
    ["a" /* LifecycleHooks.ACTIVATED */]: 'activated hook',
    ["da" /* LifecycleHooks.DEACTIVATED */]: 'deactivated hook',
    ["ec" /* LifecycleHooks.ERROR_CAPTURED */]: 'errorCaptured hook',
    ["rtc" /* LifecycleHooks.RENDER_TRACKED */]: 'renderTracked hook',
    ["rtg" /* LifecycleHooks.RENDER_TRIGGERED */]: 'renderTriggered hook',
    [0 /* ErrorCodes.SETUP_FUNCTION */]: 'setup function',
    [1 /* ErrorCodes.RENDER_FUNCTION */]: 'render function',
    [2 /* ErrorCodes.WATCH_GETTER */]: 'watcher getter',
    [3 /* ErrorCodes.WATCH_CALLBACK */]: 'watcher callback',
    [4 /* ErrorCodes.WATCH_CLEANUP */]: 'watcher cleanup function',
    [5 /* ErrorCodes.NATIVE_EVENT_HANDLER */]: 'native event handler',
    [6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */]: 'component event handler',
    [7 /* ErrorCodes.VNODE_HOOK */]: 'vnode hook',
    [8 /* ErrorCodes.DIRECTIVE_HOOK */]: 'directive hook',
    [9 /* ErrorCodes.TRANSITION_HOOK */]: 'transition hook',
    [10 /* ErrorCodes.APP_ERROR_HANDLER */]: 'app errorHandler',
    [11 /* ErrorCodes.APP_WARN_HANDLER */]: 'app warnHandler',
    [12 /* ErrorCodes.FUNCTION_REF */]: 'ref function',
    [13 /* ErrorCodes.ASYNC_COMPONENT_LOADER */]: 'async component loader',
    [14 /* ErrorCodes.SCHEDULER */]: 'scheduler flush. This is likely a Vue internals bug. ' +
        'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core'
};
function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    }
    catch (err) {
        handleError(err, instance, type);
    }
    return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(res)) {
            res.catch(err => {
                handleError(err, instance, type);
            });
        }
        return res;
    }
    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
}
function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    if (instance) {
        let cur = instance.parent;
        // the exposed instance is the render proxy to keep it consistent with 2.x
        const exposedInstance = instance.proxy;
        // in production the hook receives only the error code
        const errorInfo = ( true) ? ErrorTypeStrings[type] : 0;
        while (cur) {
            const errorCapturedHooks = cur.ec;
            if (errorCapturedHooks) {
                for (let i = 0; i < errorCapturedHooks.length; i++) {
                    if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                        return;
                    }
                }
            }
            cur = cur.parent;
        }
        // app-level handling
        const appErrorHandler = instance.appContext.config.errorHandler;
        if (appErrorHandler) {
            callWithErrorHandling(appErrorHandler, null, 10 /* ErrorCodes.APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
            return;
        }
    }
    logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
    if ((true)) {
        const info = ErrorTypeStrings[type];
        if (contextVNode) {
            pushWarningContext(contextVNode);
        }
        warn(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
        if (contextVNode) {
            popWarningContext();
        }
        // crash in dev by default so it's more noticeable
        if (throwInDev) {
            throw err;
        }
        else {
            console.error(err);
        }
    }
    else {}
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /*#__PURE__*/ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
// #2768
// Use binary-search to find a suitable position in the queue,
// so that the queue maintains the increasing order of job's id,
// which can prevent the job from being skipped and also can avoid repeated patching.
function findInsertionIndex(id) {
    // the start index should be `flushIndex + 1`
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
        const middle = (start + end) >>> 1;
        const middleJobId = getId(queue[middle]);
        middleJobId < id ? (start = middle + 1) : (end = middle);
    }
    return start;
}
function queueJob(job) {
    // the dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if (!queue.length ||
        !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
        if (job.id == null) {
            queue.push(job);
        }
        else {
            queue.splice(findInsertionIndex(job.id), 0, job);
        }
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function invalidateJob(job) {
    const i = queue.indexOf(job);
    if (i > flushIndex) {
        queue.splice(i, 1);
    }
}
function queuePostFlushCb(cb) {
    if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(cb)) {
        if (!activePostFlushCbs ||
            !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) {
            pendingPostFlushCbs.push(cb);
        }
    }
    else {
        // if cb is an array, it is a component lifecycle hook which can only be
        // triggered by a job, which is already deduped in the main queue, so
        // we can skip duplicate check here to improve perf
        pendingPostFlushCbs.push(...cb);
    }
    queueFlush();
}
function flushPreFlushCbs(seen, 
// if currently flushing, skip the current job itself
i = isFlushing ? flushIndex + 1 : 0) {
    if ((true)) {
        seen = seen || new Map();
    }
    for (; i < queue.length; i++) {
        const cb = queue[i];
        if (cb && cb.pre) {
            if (( true) && checkRecursiveUpdates(seen, cb)) {
                continue;
            }
            queue.splice(i, 1);
            i--;
            cb();
        }
    }
}
function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
        const deduped = [...new Set(pendingPostFlushCbs)];
        pendingPostFlushCbs.length = 0;
        // #1947 already has active queue, nested flushPostFlushCbs call
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        if ((true)) {
            seen = seen || new Map();
        }
        activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            if (( true) &&
                checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
                continue;
            }
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
    const diff = getId(a) - getId(b);
    if (diff === 0) {
        if (a.pre && !b.pre)
            return -1;
        if (b.pre && !a.pre)
            return 1;
    }
    return diff;
};
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    if ((true)) {
        seen = seen || new Map();
    }
    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child so its render effect will have smaller
    //    priority number)
    // 2. If a component is unmounted during a parent component's update,
    //    its update can be skipped.
    queue.sort(comparator);
    // conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = ( true)
        ? (job) => checkRecursiveUpdates(seen, job)
        : 0;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job && job.active !== false) {
                if (( true) && check(job)) {
                    continue;
                }
                // console.log(`running:`, job.id)
                callWithErrorHandling(job, null, 14 /* ErrorCodes.SCHEDULER */);
            }
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs(seen);
        isFlushing = false;
        currentFlushPromise = null;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length || pendingPostFlushCbs.length) {
            flushJobs(seen);
        }
    }
}
function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
        seen.set(fn, 1);
    }
    else {
        const count = seen.get(fn);
        if (count > RECURSION_LIMIT) {
            const instance = fn.ownerInstance;
            const componentName = instance && getComponentName(instance.type);
            warn(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. ` +
                `This means you have a reactive effect that is mutating its own ` +
                `dependencies and thus recursively triggering itself. Possible sources ` +
                `include component template, render function, updated hook or ` +
                `watcher source function.`);
            return true;
        }
        else {
            seen.set(fn, count + 1);
        }
    }
}

/* eslint-disable no-restricted-globals */
let isHmrUpdating = false;
const hmrDirtyComponents = new Set();
// Expose the HMR runtime on the global object
// This makes it entirely tree-shakable without polluting the exports and makes
// it easier to be used in toolings like vue-loader
// Note: for a component to be eligible for HMR it also needs the __hmrId option
// to be set so that its instances can be registered / removed.
if ((true)) {
    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)().__VUE_HMR_RUNTIME__ = {
        createRecord: tryWrap(createRecord),
        rerender: tryWrap(rerender),
        reload: tryWrap(reload)
    };
}
const map = new Map();
function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
        createRecord(id, instance.type);
        record = map.get(id);
    }
    record.instances.add(instance);
}
function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
    if (map.has(id)) {
        return false;
    }
    map.set(id, {
        initialDef: normalizeClassComponent(initialDef),
        instances: new Set()
    });
    return true;
}
function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) {
        return;
    }
    // update initial record (for not-yet-rendered component)
    record.initialDef.render = newRender;
    [...record.instances].forEach(instance => {
        if (newRender) {
            instance.render = newRender;
            normalizeClassComponent(instance.type).render = newRender;
        }
        instance.renderCache = [];
        // this flag forces child components with slot content to update
        isHmrUpdating = true;
        instance.update();
        isHmrUpdating = false;
    });
}
function reload(id, newComp) {
    const record = map.get(id);
    if (!record)
        return;
    newComp = normalizeClassComponent(newComp);
    // update initial def (for not-yet-rendered components)
    updateComponentDef(record.initialDef, newComp);
    // create a snapshot which avoids the set being mutated during updates
    const instances = [...record.instances];
    for (const instance of instances) {
        const oldComp = normalizeClassComponent(instance.type);
        if (!hmrDirtyComponents.has(oldComp)) {
            // 1. Update existing comp definition to match new one
            if (oldComp !== record.initialDef) {
                updateComponentDef(oldComp, newComp);
            }
            // 2. mark definition dirty. This forces the renderer to replace the
            // component on patch.
            hmrDirtyComponents.add(oldComp);
        }
        // 3. invalidate options resolution cache
        instance.appContext.optionsCache.delete(instance.type);
        // 4. actually update
        if (instance.ceReload) {
            // custom element
            hmrDirtyComponents.add(oldComp);
            instance.ceReload(newComp.styles);
            hmrDirtyComponents.delete(oldComp);
        }
        else if (instance.parent) {
            // 4. Force the parent instance to re-render. This will cause all updated
            // components to be unmounted and re-mounted. Queue the update so that we
            // don't end up forcing the same parent to re-render multiple times.
            queueJob(instance.parent.update);
        }
        else if (instance.appContext.reload) {
            // root instance mounted via createApp() has a reload method
            instance.appContext.reload();
        }
        else if (typeof window !== 'undefined') {
            // root instance inside tree created via raw render(). Force reload.
            window.location.reload();
        }
        else {
            console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
        }
    }
    // 5. make sure to cleanup dirty hmr components after update
    queuePostFlushCb(() => {
        for (const instance of instances) {
            hmrDirtyComponents.delete(normalizeClassComponent(instance.type));
        }
    });
}
function updateComponentDef(oldComp, newComp) {
    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(oldComp, newComp);
    for (const key in oldComp) {
        if (key !== '__file' && !(key in newComp)) {
            delete oldComp[key];
        }
    }
}
function tryWrap(fn) {
    return (id, arg) => {
        try {
            return fn(id, arg);
        }
        catch (e) {
            console.error(e);
            console.warn(`[HMR] Something went wrong during Vue component hot-reload. ` +
                `Full reload required.`);
        }
    };
}

let devtools;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
    if (devtools) {
        devtools.emit(event, ...args);
    }
    else if (!devtoolsNotInstalled) {
        buffer.push({ event, args });
    }
}
function setDevtoolsHook(hook, target) {
    var _a, _b;
    devtools = hook;
    if (devtools) {
        devtools.enabled = true;
        buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
        buffer = [];
    }
    else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== 'undefined' &&
        // some envs mock window but not fully
        window.HTMLElement &&
        // also exclude jsdom
        !((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.includes('jsdom'))) {
        const replay = (target.__VUE_DEVTOOLS_HOOK_REPLAY__ =
            target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []);
        replay.push((newHook) => {
            setDevtoolsHook(newHook, target);
        });
        // clear buffer after 3s - the user probably doesn't have devtools installed
        // at all, and keeping the buffer will cause memory leaks (#4738)
        setTimeout(() => {
            if (!devtools) {
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
                devtoolsNotInstalled = true;
                buffer = [];
            }
        }, 3000);
    }
    else {
        // non-browser env, assume not installed
        devtoolsNotInstalled = true;
        buffer = [];
    }
}
function devtoolsInitApp(app, version) {
    emit$1("app:init" /* DevtoolsHooks.APP_INIT */, app, version, {
        Fragment,
        Text,
        Comment,
        Static
    });
}
function devtoolsUnmountApp(app) {
    emit$1("app:unmount" /* DevtoolsHooks.APP_UNMOUNT */, app);
}
const devtoolsComponentAdded = /*#__PURE__*/ createDevtoolsComponentHook("component:added" /* DevtoolsHooks.COMPONENT_ADDED */);
const devtoolsComponentUpdated = 
/*#__PURE__*/ createDevtoolsComponentHook("component:updated" /* DevtoolsHooks.COMPONENT_UPDATED */);
const _devtoolsComponentRemoved = /*#__PURE__*/ createDevtoolsComponentHook("component:removed" /* DevtoolsHooks.COMPONENT_REMOVED */);
const devtoolsComponentRemoved = (component) => {
    if (devtools &&
        typeof devtools.cleanupBuffer === 'function' &&
        // remove the component if it wasn't buffered
        !devtools.cleanupBuffer(component)) {
        _devtoolsComponentRemoved(component);
    }
};
function createDevtoolsComponentHook(hook) {
    return (component) => {
        emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : undefined, component);
    };
}
const devtoolsPerfStart = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:start" /* DevtoolsHooks.PERFORMANCE_START */);
const devtoolsPerfEnd = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:end" /* DevtoolsHooks.PERFORMANCE_END */);
function createDevtoolsPerformanceHook(hook) {
    return (component, type, time) => {
        emit$1(hook, component.appContext.app, component.uid, component, type, time);
    };
}
function devtoolsComponentEmit(component, event, params) {
    emit$1("component:emit" /* DevtoolsHooks.COMPONENT_EMIT */, component.appContext.app, component, event, params);
}

function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted)
        return;
    const props = instance.vnode.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    if ((true)) {
        const { emitsOptions, propsOptions: [propsOptions] } = instance;
        if (emitsOptions) {
            if (!(event in emitsOptions) &&
                !(false )) {
                if (!propsOptions || !((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(event) in propsOptions)) {
                    warn(`Component emitted event "${event}" but it is neither declared in ` +
                        `the emits option nor as an "${(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(event)}" prop.`);
                }
            }
            else {
                const validator = emitsOptions[event];
                if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(validator)) {
                    const isValid = validator(...rawArgs);
                    if (!isValid) {
                        warn(`Invalid event arguments: event validation failed for event "${event}".`);
                    }
                }
            }
        }
    }
    let args = rawArgs;
    const isModelListener = event.startsWith('update:');
    // for v-model update:xxx events, apply modifiers on args
    const modelArg = isModelListener && event.slice(7);
    if (modelArg && modelArg in props) {
        const modifiersKey = `${modelArg === 'modelValue' ? 'model' : modelArg}Modifiers`;
        const { number, trim } = props[modifiersKey] || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        if (trim) {
            args = rawArgs.map(a => ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(a) ? a.trim() : a));
        }
        if (number) {
            args = rawArgs.map(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseToNumber);
        }
    }
    if (true) {
        devtoolsComponentEmit(instance, event, args);
    }
    if ((true)) {
        const lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && props[(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(lowerCaseEvent)]) {
            warn(`Event "${lowerCaseEvent}" is emitted in component ` +
                `${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". ` +
                `Note that HTML attributes are case-insensitive and you cannot use ` +
                `v-on to listen to camelCase events when using in-DOM templates. ` +
                `You should probably use "${(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event)}" instead of "${event}".`);
        }
    }
    let handlerName;
    let handler = props[(handlerName = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(event))] ||
        // also try camelCase event handler (#2249)
        props[(handlerName = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(event)))];
    // for v-model update:xxx events, also trigger kebab-case equivalent
    // for props passed via kebab-case
    if (!handler && isModelListener) {
        handler = props[(handlerName = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event)))];
    }
    if (handler) {
        callWithAsyncErrorHandling(handler, instance, 6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */, args);
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
        if (!instance.emitted) {
            instance.emitted = {};
        }
        else if (instance.emitted[handlerName]) {
            return;
        }
        instance.emitted[handlerName] = true;
        callWithAsyncErrorHandling(onceHandler, instance, 6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */, args);
    }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== undefined) {
        return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    // apply mixin/extends props
    let hasExtends = false;
    if ( true && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comp)) {
        const extendEmits = (raw) => {
            const normalizedFromExtend = normalizeEmitsOptions(raw, appContext, true);
            if (normalizedFromExtend) {
                hasExtends = true;
                (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, normalizedFromExtend);
            }
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendEmits);
        }
        if (comp.extends) {
            extendEmits(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendEmits);
        }
    }
    if (!raw && !hasExtends) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) {
            cache.set(comp, null);
        }
        return null;
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) {
        raw.forEach(key => (normalized[key] = null));
    }
    else {
        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, raw);
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) {
        cache.set(comp, normalized);
    }
    return normalized;
}
// Check if an incoming prop key is a declared emit event listener.
// e.g. With `emits: { click: null }`, props named `onClick` and `onclick` are
// both considered matched listeners.
function isEmitListener(options, key) {
    if (!options || !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
        return false;
    }
    key = key.slice(2).replace(/Once$/, '');
    return ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, key[0].toLowerCase() + key.slice(1)) ||
        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key)) ||
        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, key));
}

/**
 * mark the current rendering instance for asset resolution (e.g.
 * resolveComponent, resolveDirective) during render
 */
let currentRenderingInstance = null;
let currentScopeId = null;
/**
 * Note: rendering calls maybe nested. The function returns the parent rendering
 * instance if present, which should be restored after the render is done:
 *
 * ```js
 * const prev = setCurrentRenderingInstance(i)
 * // ...render
 * setCurrentRenderingInstance(prev)
 * ```
 */
function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = (instance && instance.type.__scopeId) || null;
    return prev;
}
/**
 * Set scope id when creating hoisted vnodes.
 * @private compiler helper
 */
function pushScopeId(id) {
    currentScopeId = id;
}
/**
 * Technically we no longer need this after 3.0.8 but we need to keep the same
 * API for backwards compat w/ code generated by compilers.
 * @private
 */
function popScopeId() {
    currentScopeId = null;
}
/**
 * Only for backwards compat
 * @private
 */
const withScopeId = (_id) => withCtx;
/**
 * Wrap a slot function to memoize current rendering instance
 * @private compiler helper
 */
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot // false only
) {
    if (!ctx)
        return fn;
    // already normalized
    if (fn._n) {
        return fn;
    }
    const renderFnWithContext = (...args) => {
        // If a user calls a compiled slot inside a template expression (#1745), it
        // can mess up block tracking, so by default we disable block tracking and
        // force bail out when invoking a compiled slot (indicated by the ._d flag).
        // This isn't necessary if rendering a compiled `<slot>`, so we flip the
        // ._d flag off when invoking the wrapped fn inside `renderSlot`.
        if (renderFnWithContext._d) {
            setBlockTracking(-1);
        }
        const prevInstance = setCurrentRenderingInstance(ctx);
        let res;
        try {
            res = fn(...args);
        }
        finally {
            setCurrentRenderingInstance(prevInstance);
            if (renderFnWithContext._d) {
                setBlockTracking(1);
            }
        }
        if (true) {
            devtoolsComponentUpdated(ctx);
        }
        return res;
    };
    // mark normalized to avoid duplicated wrapping
    renderFnWithContext._n = true;
    // mark this as compiled by default
    // this is used in vnode.ts -> normalizeChildren() to set the slot
    // rendering flag.
    renderFnWithContext._c = true;
    // disable block tracking by default
    renderFnWithContext._d = true;
    return renderFnWithContext;
}

/**
 * dev only flag to track whether $attrs was used during render.
 * If $attrs was used during render then the warning for failed attrs
 * fallthrough can be suppressed.
 */
let accessedAttrs = false;
function markAttrsAccessed() {
    accessedAttrs = true;
}
function renderComponentRoot(instance) {
    const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
    let result;
    let fallthroughAttrs;
    const prev = setCurrentRenderingInstance(instance);
    if ((true)) {
        accessedAttrs = false;
    }
    try {
        if (vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
            // withProxy is a proxy with a different `has` trap only for
            // runtime-compiled render functions using `with` block.
            const proxyToUse = withProxy || proxy;
            result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
            fallthroughAttrs = attrs;
        }
        else {
            // functional
            const render = Component;
            // in dev, mark attrs accessed if optional props (attrs === props)
            if (( true) && attrs === props) {
                markAttrsAccessed();
            }
            result = normalizeVNode(render.length > 1
                ? render(props, ( true)
                    ? {
                        get attrs() {
                            markAttrsAccessed();
                            return attrs;
                        },
                        slots,
                        emit
                    }
                    : 0)
                : render(props, null /* we know it doesn't need it */));
            fallthroughAttrs = Component.props
                ? attrs
                : getFunctionalFallthrough(attrs);
        }
    }
    catch (err) {
        blockStack.length = 0;
        handleError(err, instance, 1 /* ErrorCodes.RENDER_FUNCTION */);
        result = createVNode(Comment);
    }
    // attr merging
    // in dev mode, comments are preserved, and it's possible for a template
    // to have comments along side the root element which makes it a fragment
    let root = result;
    let setRoot = undefined;
    if (( true) &&
        result.patchFlag > 0 &&
        result.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */) {
        [root, setRoot] = getChildRoot(result);
    }
    if (fallthroughAttrs && inheritAttrs !== false) {
        const keys = Object.keys(fallthroughAttrs);
        const { shapeFlag } = root;
        if (keys.length) {
            if (shapeFlag & (1 /* ShapeFlags.ELEMENT */ | 6 /* ShapeFlags.COMPONENT */)) {
                if (propsOptions && keys.some(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)) {
                    // If a v-model listener (onUpdate:xxx) has a corresponding declared
                    // prop, it indicates this component expects to handle v-model and
                    // it should not fallthrough.
                    // related: #1543, #1643, #1989
                    fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
                }
                root = cloneVNode(root, fallthroughAttrs);
            }
            else if (( true) && !accessedAttrs && root.type !== Comment) {
                const allAttrs = Object.keys(attrs);
                const eventAttrs = [];
                const extraAttrs = [];
                for (let i = 0, l = allAttrs.length; i < l; i++) {
                    const key = allAttrs[i];
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
                        // ignore v-model handlers when they fail to fallthrough
                        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)(key)) {
                            // remove `on`, lowercase first letter to reflect event casing
                            // accurately
                            eventAttrs.push(key[2].toLowerCase() + key.slice(3));
                        }
                    }
                    else {
                        extraAttrs.push(key);
                    }
                }
                if (extraAttrs.length) {
                    warn(`Extraneous non-props attributes (` +
                        `${extraAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes.`);
                }
                if (eventAttrs.length) {
                    warn(`Extraneous non-emits event listeners (` +
                        `${eventAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes. ` +
                        `If the listener is intended to be a component custom event listener only, ` +
                        `declare it using the "emits" option.`);
                }
            }
        }
    }
    // inherit directives
    if (vnode.dirs) {
        if (( true) && !isElementRoot(root)) {
            warn(`Runtime directive used on component with non-element root node. ` +
                `The directives will not function as intended.`);
        }
        // clone before mutating since the root may be a hoisted vnode
        root = cloneVNode(root);
        root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    // inherit transition data
    if (vnode.transition) {
        if (( true) && !isElementRoot(root)) {
            warn(`Component inside <Transition> renders non-element root node ` +
                `that cannot be animated.`);
        }
        root.transition = vnode.transition;
    }
    if (( true) && setRoot) {
        setRoot(root);
    }
    else {
        result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
}
/**
 * dev only
 * In dev mode, template root level comments are rendered, which turns the
 * template into a fragment root, but we need to locate the single element
 * root for attrs and scope id processing.
 */
const getChildRoot = (vnode) => {
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren);
    if (!childRoot) {
        return [vnode, undefined];
    }
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot) => {
        rawChildren[index] = updatedRoot;
        if (dynamicChildren) {
            if (dynamicIndex > -1) {
                dynamicChildren[dynamicIndex] = updatedRoot;
            }
            else if (updatedRoot.patchFlag > 0) {
                vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
            }
        }
    };
    return [normalizeVNode(childRoot), setRoot];
};
function filterSingleRoot(children) {
    let singleRoot;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isVNode(child)) {
            // ignore user comment
            if (child.type !== Comment || child.children === 'v-if') {
                if (singleRoot) {
                    // has more than 1 non-comment child, return now
                    return;
                }
                else {
                    singleRoot = child;
                }
            }
        }
        else {
            return;
        }
    }
    return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
        if (key === 'class' || key === 'style' || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
            (res || (res = {}))[key] = attrs[key];
        }
    }
    return res;
};
const filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)(key) || !(key.slice(9) in props)) {
            res[key] = attrs[key];
        }
    }
    return res;
};
const isElementRoot = (vnode) => {
    return (vnode.shapeFlag & (6 /* ShapeFlags.COMPONENT */ | 1 /* ShapeFlags.ELEMENT */) ||
        vnode.type === Comment // potential v-if branch switch
    );
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    // Parent component's render function was hot-updated. Since this may have
    // caused the child component's slots content to have changed, we need to
    // force the child to update as well.
    if (( true) && (prevChildren || nextChildren) && isHmrUpdating) {
        return true;
    }
    // force child update for runtime directive or transition on component vnode.
    if (nextVNode.dirs || nextVNode.transition) {
        return true;
    }
    if (optimized && patchFlag >= 0) {
        if (patchFlag & 1024 /* PatchFlags.DYNAMIC_SLOTS */) {
            // slot content that references values that might have changed,
            // e.g. in a v-for
            return true;
        }
        if (patchFlag & 16 /* PatchFlags.FULL_PROPS */) {
            if (!prevProps) {
                return !!nextProps;
            }
            // presence of this flag indicates props are always non-null
            return hasPropsChanged(prevProps, nextProps, emits);
        }
        else if (patchFlag & 8 /* PatchFlags.PROPS */) {
            const dynamicProps = nextVNode.dynamicProps;
            for (let i = 0; i < dynamicProps.length; i++) {
                const key = dynamicProps[i];
                if (nextProps[key] !== prevProps[key] &&
                    !isEmitListener(emits, key)) {
                    return true;
                }
            }
        }
    }
    else {
        // this path is only taken by manually written render functions
        // so presence of any children leads to a forced update
        if (prevChildren || nextChildren) {
            if (!nextChildren || !nextChildren.$stable) {
                return true;
            }
        }
        if (prevProps === nextProps) {
            return false;
        }
        if (!prevProps) {
            return !!nextProps;
        }
        if (!nextProps) {
            return true;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        if (nextProps[key] !== prevProps[key] &&
            !isEmitListener(emitsOptions, key)) {
            return true;
        }
    }
    return false;
}
function updateHOCHostEl({ vnode, parent }, el // HostNode
) {
    while (parent && parent.subTree === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
    }
}

const isSuspense = (type) => type.__isSuspense;
// Suspense exposes a component-like API, and is treated like a component
// in the compiler, but internally it's a special built-in type that hooks
// directly into the renderer.
const SuspenseImpl = {
    name: 'Suspense',
    // In order to make Suspense tree-shakable, we need to avoid importing it
    // directly in the renderer. The renderer checks for the __isSuspense flag
    // on a vnode's type and calls the `process` method, passing in renderer
    // internals.
    __isSuspense: true,
    process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, 
    // platform-specific impl passed from renderer
    rendererInternals) {
        if (n1 == null) {
            mountSuspense(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals);
        }
        else {
            patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, rendererInternals);
        }
    },
    hydrate: hydrateSuspense,
    create: createSuspenseBoundary,
    normalize: normalizeSuspenseChildren
};
// Force-casted public typing for h and TSX props inference
const Suspense = (SuspenseImpl
    );
function triggerEvent(vnode, name) {
    const eventListener = vnode.props && vnode.props[name];
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(eventListener)) {
        eventListener();
    }
}
function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals) {
    const { p: patch, o: { createElement } } = rendererInternals;
    const hiddenContainer = createElement('div');
    const suspense = (vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals));
    // start mounting the content subtree in an off-dom container
    patch(null, (suspense.pendingBranch = vnode.ssContent), hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds);
    // now check if we have encountered any async deps
    if (suspense.deps > 0) {
        // has async
        // invoke @fallback event
        triggerEvent(vnode, 'onPending');
        triggerEvent(vnode, 'onFallback');
        // mount the fallback tree
        patch(null, vnode.ssFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
        isSVG, slotScopeIds);
        setActiveBranch(suspense, vnode.ssFallback);
    }
    else {
        // Suspense has no async deps. Just resolve.
        suspense.resolve();
    }
}
function patchSuspense(n1, n2, container, anchor, parentComponent, isSVG, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
    const suspense = (n2.suspense = n1.suspense);
    suspense.vnode = n2;
    n2.el = n1.el;
    const newBranch = n2.ssContent;
    const newFallback = n2.ssFallback;
    const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
    if (pendingBranch) {
        suspense.pendingBranch = newBranch;
        if (isSameVNodeType(newBranch, pendingBranch)) {
            // same root type but content may have changed.
            patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
            if (suspense.deps <= 0) {
                suspense.resolve();
            }
            else if (isInFallback) {
                patch(activeBranch, newFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
                isSVG, slotScopeIds, optimized);
                setActiveBranch(suspense, newFallback);
            }
        }
        else {
            // toggled before pending tree is resolved
            suspense.pendingId++;
            if (isHydrating) {
                // if toggled before hydration is finished, the current DOM tree is
                // no longer valid. set it as the active branch so it will be unmounted
                // when resolved
                suspense.isHydrating = false;
                suspense.activeBranch = pendingBranch;
            }
            else {
                unmount(pendingBranch, parentComponent, suspense);
            }
            // increment pending ID. this is used to invalidate async callbacks
            // reset suspense state
            suspense.deps = 0;
            // discard effects from pending branch
            suspense.effects.length = 0;
            // discard previous container
            suspense.hiddenContainer = createElement('div');
            if (isInFallback) {
                // already in fallback state
                patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
                if (suspense.deps <= 0) {
                    suspense.resolve();
                }
                else {
                    patch(activeBranch, newFallback, container, anchor, parentComponent, null, // fallback tree will not have suspense context
                    isSVG, slotScopeIds, optimized);
                    setActiveBranch(suspense, newFallback);
                }
            }
            else if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
                // toggled "back" to current active branch
                patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
                // force resolve
                suspense.resolve(true);
            }
            else {
                // switched to a 3rd branch
                patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
                if (suspense.deps <= 0) {
                    suspense.resolve();
                }
            }
        }
    }
    else {
        if (activeBranch && isSameVNodeType(newBranch, activeBranch)) {
            // root did not change, just normal patch
            patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, isSVG, slotScopeIds, optimized);
            setActiveBranch(suspense, newBranch);
        }
        else {
            // root node toggled
            // invoke @pending event
            triggerEvent(n2, 'onPending');
            // mount pending branch in off-dom container
            suspense.pendingBranch = newBranch;
            suspense.pendingId++;
            patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, isSVG, slotScopeIds, optimized);
            if (suspense.deps <= 0) {
                // incoming branch has no async deps, resolve now.
                suspense.resolve();
            }
            else {
                const { timeout, pendingId } = suspense;
                if (timeout > 0) {
                    setTimeout(() => {
                        if (suspense.pendingId === pendingId) {
                            suspense.fallback(newFallback);
                        }
                    }, timeout);
                }
                else if (timeout === 0) {
                    suspense.fallback(newFallback);
                }
            }
        }
    }
}
let hasWarned = false;
function createSuspenseBoundary(vnode, parent, parentComponent, container, hiddenContainer, anchor, isSVG, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
    /* istanbul ignore if */
    if ( true && !hasWarned) {
        hasWarned = true;
        // @ts-ignore `console.info` cannot be null error
        console[console.info ? 'info' : 'log'](`<Suspense> is an experimental feature and its API will likely change.`);
    }
    const { p: patch, m: move, um: unmount, n: next, o: { parentNode, remove } } = rendererInternals;
    const timeout = vnode.props ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toNumber)(vnode.props.timeout) : undefined;
    if ((true)) {
        assertNumber(timeout, `Suspense timeout`);
    }
    const suspense = {
        vnode,
        parent,
        parentComponent,
        isSVG,
        container,
        hiddenContainer,
        anchor,
        deps: 0,
        pendingId: 0,
        timeout: typeof timeout === 'number' ? timeout : -1,
        activeBranch: null,
        pendingBranch: null,
        isInFallback: true,
        isHydrating,
        isUnmounted: false,
        effects: [],
        resolve(resume = false) {
            if ((true)) {
                if (!resume && !suspense.pendingBranch) {
                    throw new Error(`suspense.resolve() is called without a pending branch.`);
                }
                if (suspense.isUnmounted) {
                    throw new Error(`suspense.resolve() is called on an already unmounted suspense boundary.`);
                }
            }
            const { vnode, activeBranch, pendingBranch, pendingId, effects, parentComponent, container } = suspense;
            if (suspense.isHydrating) {
                suspense.isHydrating = false;
            }
            else if (!resume) {
                const delayEnter = activeBranch &&
                    pendingBranch.transition &&
                    pendingBranch.transition.mode === 'out-in';
                if (delayEnter) {
                    activeBranch.transition.afterLeave = () => {
                        if (pendingId === suspense.pendingId) {
                            move(pendingBranch, container, anchor, 0 /* MoveType.ENTER */);
                        }
                    };
                }
                // this is initial anchor on mount
                let { anchor } = suspense;
                // unmount current active tree
                if (activeBranch) {
                    // if the fallback tree was mounted, it may have been moved
                    // as part of a parent suspense. get the latest anchor for insertion
                    anchor = next(activeBranch);
                    unmount(activeBranch, parentComponent, suspense, true);
                }
                if (!delayEnter) {
                    // move content from off-dom container to actual container
                    move(pendingBranch, container, anchor, 0 /* MoveType.ENTER */);
                }
            }
            setActiveBranch(suspense, pendingBranch);
            suspense.pendingBranch = null;
            suspense.isInFallback = false;
            // flush buffered effects
            // check if there is a pending parent suspense
            let parent = suspense.parent;
            let hasUnresolvedAncestor = false;
            while (parent) {
                if (parent.pendingBranch) {
                    // found a pending parent suspense, merge buffered post jobs
                    // into that parent
                    parent.effects.push(...effects);
                    hasUnresolvedAncestor = true;
                    break;
                }
                parent = parent.parent;
            }
            // no pending parent suspense, flush all jobs
            if (!hasUnresolvedAncestor) {
                queuePostFlushCb(effects);
            }
            suspense.effects = [];
            // invoke @resolve event
            triggerEvent(vnode, 'onResolve');
        },
        fallback(fallbackVNode) {
            if (!suspense.pendingBranch) {
                return;
            }
            const { vnode, activeBranch, parentComponent, container, isSVG } = suspense;
            // invoke @fallback event
            triggerEvent(vnode, 'onFallback');
            const anchor = next(activeBranch);
            const mountFallback = () => {
                if (!suspense.isInFallback) {
                    return;
                }
                // mount the fallback tree
                patch(null, fallbackVNode, container, anchor, parentComponent, null, // fallback tree will not have suspense context
                isSVG, slotScopeIds, optimized);
                setActiveBranch(suspense, fallbackVNode);
            };
            const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === 'out-in';
            if (delayEnter) {
                activeBranch.transition.afterLeave = mountFallback;
            }
            suspense.isInFallback = true;
            // unmount current active branch
            unmount(activeBranch, parentComponent, null, // no suspense so unmount hooks fire now
            true // shouldRemove
            );
            if (!delayEnter) {
                mountFallback();
            }
        },
        move(container, anchor, type) {
            suspense.activeBranch &&
                move(suspense.activeBranch, container, anchor, type);
            suspense.container = container;
        },
        next() {
            return suspense.activeBranch && next(suspense.activeBranch);
        },
        registerDep(instance, setupRenderEffect) {
            const isInPendingSuspense = !!suspense.pendingBranch;
            if (isInPendingSuspense) {
                suspense.deps++;
            }
            const hydratedEl = instance.vnode.el;
            instance
                .asyncDep.catch(err => {
                handleError(err, instance, 0 /* ErrorCodes.SETUP_FUNCTION */);
            })
                .then(asyncSetupResult => {
                // retry when the setup() promise resolves.
                // component may have been unmounted before resolve.
                if (instance.isUnmounted ||
                    suspense.isUnmounted ||
                    suspense.pendingId !== instance.suspenseId) {
                    return;
                }
                // retry from this component
                instance.asyncResolved = true;
                const { vnode } = instance;
                if ((true)) {
                    pushWarningContext(vnode);
                }
                handleSetupResult(instance, asyncSetupResult, false);
                if (hydratedEl) {
                    // vnode may have been replaced if an update happened before the
                    // async dep is resolved.
                    vnode.el = hydratedEl;
                }
                const placeholder = !hydratedEl && instance.subTree.el;
                setupRenderEffect(instance, vnode, 
                // component may have been moved before resolve.
                // if this is not a hydration, instance.subTree will be the comment
                // placeholder.
                parentNode(hydratedEl || instance.subTree.el), 
                // anchor will not be used if this is hydration, so only need to
                // consider the comment placeholder case.
                hydratedEl ? null : next(instance.subTree), suspense, isSVG, optimized);
                if (placeholder) {
                    remove(placeholder);
                }
                updateHOCHostEl(instance, vnode.el);
                if ((true)) {
                    popWarningContext();
                }
                // only decrease deps count if suspense is not already resolved
                if (isInPendingSuspense && --suspense.deps === 0) {
                    suspense.resolve();
                }
            });
        },
        unmount(parentSuspense, doRemove) {
            suspense.isUnmounted = true;
            if (suspense.activeBranch) {
                unmount(suspense.activeBranch, parentComponent, parentSuspense, doRemove);
            }
            if (suspense.pendingBranch) {
                unmount(suspense.pendingBranch, parentComponent, parentSuspense, doRemove);
            }
        }
    };
    return suspense;
}
function hydrateSuspense(node, vnode, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, rendererInternals, hydrateNode) {
    /* eslint-disable no-restricted-globals */
    const suspense = (vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, node.parentNode, document.createElement('div'), null, isSVG, slotScopeIds, optimized, rendererInternals, true /* hydrating */));
    // there are two possible scenarios for server-rendered suspense:
    // - success: ssr content should be fully resolved
    // - failure: ssr content should be the fallback branch.
    // however, on the client we don't really know if it has failed or not
    // attempt to hydrate the DOM assuming it has succeeded, but we still
    // need to construct a suspense boundary first
    const result = hydrateNode(node, (suspense.pendingBranch = vnode.ssContent), parentComponent, suspense, slotScopeIds, optimized);
    if (suspense.deps === 0) {
        suspense.resolve();
    }
    return result;
    /* eslint-enable no-restricted-globals */
}
function normalizeSuspenseChildren(vnode) {
    const { shapeFlag, children } = vnode;
    const isSlotChildren = shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */;
    vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
    vnode.ssFallback = isSlotChildren
        ? normalizeSuspenseSlot(children.fallback)
        : createVNode(Comment);
}
function normalizeSuspenseSlot(s) {
    let block;
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(s)) {
        const trackBlock = isBlockTreeEnabled && s._c;
        if (trackBlock) {
            // disableTracking: false
            // allow block tracking for compiled slots
            // (see ./componentRenderContext.ts)
            s._d = false;
            openBlock();
        }
        s = s();
        if (trackBlock) {
            s._d = true;
            block = currentBlock;
            closeBlock();
        }
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(s)) {
        const singleChild = filterSingleRoot(s);
        if (( true) && !singleChild) {
            warn(`<Suspense> slots expect a single root node.`);
        }
        s = singleChild;
    }
    s = normalizeVNode(s);
    if (block && !s.dynamicChildren) {
        s.dynamicChildren = block.filter(c => c !== s);
    }
    return s;
}
function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(fn)) {
            suspense.effects.push(...fn);
        }
        else {
            suspense.effects.push(fn);
        }
    }
    else {
        queuePostFlushCb(fn);
    }
}
function setActiveBranch(suspense, branch) {
    suspense.activeBranch = branch;
    const { vnode, parentComponent } = suspense;
    const el = (vnode.el = branch.el);
    // in case suspense is the root node of a component,
    // recursively update the HOC el
    if (parentComponent && parentComponent.subTree === vnode) {
        parentComponent.vnode.el = el;
        updateHOCHostEl(parentComponent, el);
    }
}

function provide(key, value) {
    if (!currentInstance) {
        if ((true)) {
            warn(`provide() can only be used inside setup().`);
        }
    }
    else {
        let provides = currentInstance.provides;
        // by default an instance inherits its parent's provides object
        // but when it needs to provide values of its own, it creates its
        // own provides object using parent provides object as prototype.
        // this way in `inject` we can simply look up injections from direct
        // parent and let the prototype chain do the work.
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // TS doesn't allow symbol as index type
        provides[key] = value;
    }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
    // fallback to `currentRenderingInstance` so that this can be called in
    // a functional component
    const instance = currentInstance || currentRenderingInstance;
    if (instance) {
        // #2400
        // to support `app.use` plugins,
        // fallback to appContext's `provides` if the instance is at root
        const provides = instance.parent == null
            ? instance.vnode.appContext && instance.vnode.appContext.provides
            : instance.parent.provides;
        if (provides && key in provides) {
            // TS doesn't allow symbol as index type
            return provides[key];
        }
        else if (arguments.length > 1) {
            return treatDefaultAsFactory && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(defaultValue)
                ? defaultValue.call(instance.proxy)
                : defaultValue;
        }
        else if ((true)) {
            warn(`injection "${String(key)}" not found.`);
        }
    }
    else if ((true)) {
        warn(`inject() can only be used inside setup() or functional components.`);
    }
}

// Simple effect.
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
}
function watchPostEffect(effect, options) {
    return doWatch(effect, null, ( true) ? Object.assign(Object.assign({}, options), { flush: 'post' }) : 0);
}
function watchSyncEffect(effect, options) {
    return doWatch(effect, null, ( true) ? Object.assign(Object.assign({}, options), { flush: 'sync' }) : 0);
}
// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
// implementation
function watch(source, cb, options) {
    if (( true) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(cb)) {
        warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` +
            `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
            `supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
    if (( true) && !cb) {
        if (immediate !== undefined) {
            warn(`watch() "immediate" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (deep !== undefined) {
            warn(`watch() "deep" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
    }
    const warnInvalidSource = (s) => {
        warn(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, ` +
            `a reactive object, or an array of these types.`);
    };
    const instance = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope)() === (currentInstance === null || currentInstance === void 0 ? void 0 : currentInstance.scope) ? currentInstance : null;
    // const instance = currentInstance
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(source)) {
        getter = () => source.value;
        forceTrigger = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isShallow)(source);
    }
    else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(source)) {
        getter = () => source;
        deep = true;
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(source)) {
        isMultiSource = true;
        forceTrigger = source.some(s => (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(s) || (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isShallow)(s));
        getter = () => source.map(s => {
            if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(s)) {
                return s.value;
            }
            else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(s)) {
                return traverse(s);
            }
            else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(s)) {
                return callWithErrorHandling(s, instance, 2 /* ErrorCodes.WATCH_GETTER */);
            }
            else {
                ( true) && warnInvalidSource(s);
            }
        });
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(source)) {
        if (cb) {
            // getter with cb
            getter = () => callWithErrorHandling(source, instance, 2 /* ErrorCodes.WATCH_GETTER */);
        }
        else {
            // no cb -> simple effect
            getter = () => {
                if (instance && instance.isUnmounted) {
                    return;
                }
                if (cleanup) {
                    cleanup();
                }
                return callWithAsyncErrorHandling(source, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [onCleanup]);
            };
        }
    }
    else {
        getter = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        ( true) && warnInvalidSource(source);
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn) => {
        cleanup = effect.onStop = () => {
            callWithErrorHandling(fn, instance, 4 /* ErrorCodes.WATCH_CLEANUP */);
        };
    };
    // in SSR there is no need to setup an actual effect, and it should be noop
    // unless it's eager or sync flush
    let ssrCleanup;
    if (isInSSRComponentSetup) {
        // we will also not call the invalidate callback (+ runner is not set up)
        onCleanup = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        if (!cb) {
            getter();
        }
        else if (immediate) {
            callWithAsyncErrorHandling(cb, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [
                getter(),
                isMultiSource ? [] : undefined,
                onCleanup
            ]);
        }
        if (flush === 'sync') {
            const ctx = useSSRContext();
            ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
        }
        else {
            return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
        }
    }
    let oldValue = isMultiSource
        ? new Array(source.length).fill(INITIAL_WATCHER_VALUE)
        : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active) {
            return;
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run();
            if (deep ||
                forceTrigger ||
                (isMultiSource
                    ? newValue.some((v, i) => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(v, oldValue[i]))
                    : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(newValue, oldValue)) ||
                (false  )) {
                // cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE
                        ? undefined
                        : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
                            ? []
                            : oldValue,
                    onCleanup
                ]);
                oldValue = newValue;
            }
        }
        else {
            // watchEffect
            effect.run();
        }
    };
    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    job.allowRecurse = !!cb;
    let scheduler;
    if (flush === 'sync') {
        scheduler = job; // the scheduler function gets called directly
    }
    else if (flush === 'post') {
        scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
    }
    else {
        // default: 'pre'
        job.pre = true;
        if (instance)
            job.id = instance.uid;
        scheduler = () => queueJob(job);
    }
    const effect = new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect(getter, scheduler);
    if ((true)) {
        effect.onTrack = onTrack;
        effect.onTrigger = onTrigger;
    }
    // initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = effect.run();
        }
    }
    else if (flush === 'post') {
        queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
    }
    else {
        effect.run();
    }
    const unwatch = () => {
        effect.stop();
        if (instance && instance.scope) {
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(instance.scope.effects, effect);
        }
    };
    if (ssrCleanup)
        ssrCleanup.push(unwatch);
    return unwatch;
}
// this.$watch
function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(source)
        ? source.includes('.')
            ? createPathGetter(publicThis, source)
            : () => publicThis[source]
        : source.bind(publicThis, publicThis);
    let cb;
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) {
        cb = value;
    }
    else {
        cb = value.handler;
        options = value;
    }
    const cur = currentInstance;
    setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    if (cur) {
        setCurrentInstance(cur);
    }
    else {
        unsetCurrentInstance();
    }
    return res;
}
function createPathGetter(ctx, path) {
    const segments = path.split('.');
    return () => {
        let cur = ctx;
        for (let i = 0; i < segments.length && cur; i++) {
            cur = cur[segments[i]];
        }
        return cur;
    };
}
function traverse(value, seen) {
    if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(value) || value["__v_skip" /* ReactiveFlags.SKIP */]) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(value)) {
        traverse(value.value, seen);
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isMap)(value)) {
        value.forEach((v) => {
            traverse(v, seen);
        });
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPlainObject)(value)) {
        for (const key in value) {
            traverse(value[key], seen);
        }
    }
    return value;
}

function useTransitionState() {
    const state = {
        isMounted: false,
        isLeaving: false,
        isUnmounting: false,
        leavingVNodes: new Map()
    };
    onMounted(() => {
        state.isMounted = true;
    });
    onBeforeUnmount(() => {
        state.isUnmounting = true;
    });
    return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionImpl = {
    name: `BaseTransition`,
    props: {
        mode: String,
        appear: Boolean,
        persisted: Boolean,
        // enter
        onBeforeEnter: TransitionHookValidator,
        onEnter: TransitionHookValidator,
        onAfterEnter: TransitionHookValidator,
        onEnterCancelled: TransitionHookValidator,
        // leave
        onBeforeLeave: TransitionHookValidator,
        onLeave: TransitionHookValidator,
        onAfterLeave: TransitionHookValidator,
        onLeaveCancelled: TransitionHookValidator,
        // appear
        onBeforeAppear: TransitionHookValidator,
        onAppear: TransitionHookValidator,
        onAfterAppear: TransitionHookValidator,
        onAppearCancelled: TransitionHookValidator
    },
    setup(props, { slots }) {
        const instance = getCurrentInstance();
        const state = useTransitionState();
        let prevTransitionKey;
        return () => {
            const children = slots.default && getTransitionRawChildren(slots.default(), true);
            if (!children || !children.length) {
                return;
            }
            let child = children[0];
            if (children.length > 1) {
                let hasFound = false;
                // locate first non-comment child
                for (const c of children) {
                    if (c.type !== Comment) {
                        if (( true) && hasFound) {
                            // warn more than one non-comment child
                            warn('<transition> can only be used on a single element or component. ' +
                                'Use <transition-group> for lists.');
                            break;
                        }
                        child = c;
                        hasFound = true;
                        if (false)
                            {}
                    }
                }
            }
            // there's no need to track reactivity for these props so use the raw
            // props for a bit better perf
            const rawProps = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
            const { mode } = rawProps;
            // check mode
            if (( true) &&
                mode &&
                mode !== 'in-out' &&
                mode !== 'out-in' &&
                mode !== 'default') {
                warn(`invalid <transition> mode: ${mode}`);
            }
            if (state.isLeaving) {
                return emptyPlaceholder(child);
            }
            // in the case of <transition><keep-alive/></transition>, we need to
            // compare the type of the kept-alive children.
            const innerChild = getKeepAliveChild(child);
            if (!innerChild) {
                return emptyPlaceholder(child);
            }
            const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
            setTransitionHooks(innerChild, enterHooks);
            const oldChild = instance.subTree;
            const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
            let transitionKeyChanged = false;
            const { getTransitionKey } = innerChild.type;
            if (getTransitionKey) {
                const key = getTransitionKey();
                if (prevTransitionKey === undefined) {
                    prevTransitionKey = key;
                }
                else if (key !== prevTransitionKey) {
                    prevTransitionKey = key;
                    transitionKeyChanged = true;
                }
            }
            // handle mode
            if (oldInnerChild &&
                oldInnerChild.type !== Comment &&
                (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
                const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
                // update old tree's hooks in case of dynamic transition
                setTransitionHooks(oldInnerChild, leavingHooks);
                // switching between different views
                if (mode === 'out-in') {
                    state.isLeaving = true;
                    // return placeholder node and queue update when leave finishes
                    leavingHooks.afterLeave = () => {
                        state.isLeaving = false;
                        // #6835
                        // it also needs to be updated when active is undefined
                        if (instance.update.active !== false) {
                            instance.update();
                        }
                    };
                    return emptyPlaceholder(child);
                }
                else if (mode === 'in-out' && innerChild.type !== Comment) {
                    leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
                        const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
                        leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
                        // early removal callback
                        el._leaveCb = () => {
                            earlyRemove();
                            el._leaveCb = undefined;
                            delete enterHooks.delayedLeave;
                        };
                        enterHooks.delayedLeave = delayedLeave;
                    };
                }
            }
            return child;
        };
    }
};
// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
    const { leavingVNodes } = state;
    let leavingVNodesCache = leavingVNodes.get(vnode.type);
    if (!leavingVNodesCache) {
        leavingVNodesCache = Object.create(null);
        leavingVNodes.set(vnode.type, leavingVNodesCache);
    }
    return leavingVNodesCache;
}
// The transition hooks are attached to the vnode as vnode.transition
// and will be called at appropriate timing in the renderer.
function resolveTransitionHooks(vnode, props, state, instance) {
    const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
    const key = String(vnode.key);
    const leavingVNodesCache = getLeavingNodesForType(state, vnode);
    const callHook = (hook, args) => {
        hook &&
            callWithAsyncErrorHandling(hook, instance, 9 /* ErrorCodes.TRANSITION_HOOK */, args);
    };
    const callAsyncHook = (hook, args) => {
        const done = args[1];
        callHook(hook, args);
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)) {
            if (hook.every(hook => hook.length <= 1))
                done();
        }
        else if (hook.length <= 1) {
            done();
        }
    };
    const hooks = {
        mode,
        persisted,
        beforeEnter(el) {
            let hook = onBeforeEnter;
            if (!state.isMounted) {
                if (appear) {
                    hook = onBeforeAppear || onBeforeEnter;
                }
                else {
                    return;
                }
            }
            // for same element (v-show)
            if (el._leaveCb) {
                el._leaveCb(true /* cancelled */);
            }
            // for toggled element with same key (v-if)
            const leavingVNode = leavingVNodesCache[key];
            if (leavingVNode &&
                isSameVNodeType(vnode, leavingVNode) &&
                leavingVNode.el._leaveCb) {
                // force early removal (not cancelled)
                leavingVNode.el._leaveCb();
            }
            callHook(hook, [el]);
        },
        enter(el) {
            let hook = onEnter;
            let afterHook = onAfterEnter;
            let cancelHook = onEnterCancelled;
            if (!state.isMounted) {
                if (appear) {
                    hook = onAppear || onEnter;
                    afterHook = onAfterAppear || onAfterEnter;
                    cancelHook = onAppearCancelled || onEnterCancelled;
                }
                else {
                    return;
                }
            }
            let called = false;
            const done = (el._enterCb = (cancelled) => {
                if (called)
                    return;
                called = true;
                if (cancelled) {
                    callHook(cancelHook, [el]);
                }
                else {
                    callHook(afterHook, [el]);
                }
                if (hooks.delayedLeave) {
                    hooks.delayedLeave();
                }
                el._enterCb = undefined;
            });
            if (hook) {
                callAsyncHook(hook, [el, done]);
            }
            else {
                done();
            }
        },
        leave(el, remove) {
            const key = String(vnode.key);
            if (el._enterCb) {
                el._enterCb(true /* cancelled */);
            }
            if (state.isUnmounting) {
                return remove();
            }
            callHook(onBeforeLeave, [el]);
            let called = false;
            const done = (el._leaveCb = (cancelled) => {
                if (called)
                    return;
                called = true;
                remove();
                if (cancelled) {
                    callHook(onLeaveCancelled, [el]);
                }
                else {
                    callHook(onAfterLeave, [el]);
                }
                el._leaveCb = undefined;
                if (leavingVNodesCache[key] === vnode) {
                    delete leavingVNodesCache[key];
                }
            });
            leavingVNodesCache[key] = vnode;
            if (onLeave) {
                callAsyncHook(onLeave, [el, done]);
            }
            else {
                done();
            }
        },
        clone(vnode) {
            return resolveTransitionHooks(vnode, props, state, instance);
        }
    };
    return hooks;
}
// the placeholder really only handles one special case: KeepAlive
// in the case of a KeepAlive in a leave phase we need to return a KeepAlive
// placeholder with empty content to avoid the KeepAlive instance from being
// unmounted.
function emptyPlaceholder(vnode) {
    if (isKeepAlive(vnode)) {
        vnode = cloneVNode(vnode);
        vnode.children = null;
        return vnode;
    }
}
function getKeepAliveChild(vnode) {
    return isKeepAlive(vnode)
        ? vnode.children
            ? vnode.children[0]
            : undefined
        : vnode;
}
function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 /* ShapeFlags.COMPONENT */ && vnode.component) {
        setTransitionHooks(vnode.component.subTree, hooks);
    }
    else if (vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
        vnode.ssContent.transition = hooks.clone(vnode.ssContent);
        vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    }
    else {
        vnode.transition = hooks;
    }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
    let ret = [];
    let keyedFragmentCount = 0;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        // #5360 inherit parent key in case of <template v-for>
        const key = parentKey == null
            ? child.key
            : String(parentKey) + String(child.key != null ? child.key : i);
        // handle fragment children case, e.g. v-for
        if (child.type === Fragment) {
            if (child.patchFlag & 128 /* PatchFlags.KEYED_FRAGMENT */)
                keyedFragmentCount++;
            ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
        }
        // comment placeholders should be skipped, e.g. v-if
        else if (keepComment || child.type !== Comment) {
            ret.push(key != null ? cloneVNode(child, { key }) : child);
        }
    }
    // #1126 if a transition children list contains multiple sub fragments, these
    // fragments will be merged into a flat children array. Since each v-for
    // fragment may contain different static bindings inside, we need to de-op
    // these children to force full diffs to ensure correct behavior.
    if (keyedFragmentCount > 1) {
        for (let i = 0; i < ret.length; i++) {
            ret[i].patchFlag = -2 /* PatchFlags.BAIL */;
        }
    }
    return ret;
}

// implementation, close to no-op
function defineComponent(options) {
    return (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(options) ? { setup: options, name: options.name } : options;
}

const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
function defineAsyncComponent(source) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(source)) {
        source = { loader: source };
    }
    const { loader, loadingComponent, errorComponent, delay = 200, timeout, // undefined = never times out
    suspensible = true, onError: userOnError } = source;
    let pendingRequest = null;
    let resolvedComp;
    let retries = 0;
    const retry = () => {
        retries++;
        pendingRequest = null;
        return load();
    };
    const load = () => {
        let thisRequest;
        return (pendingRequest ||
            (thisRequest = pendingRequest =
                loader()
                    .catch(err => {
                    err = err instanceof Error ? err : new Error(String(err));
                    if (userOnError) {
                        return new Promise((resolve, reject) => {
                            const userRetry = () => resolve(retry());
                            const userFail = () => reject(err);
                            userOnError(err, userRetry, userFail, retries + 1);
                        });
                    }
                    else {
                        throw err;
                    }
                })
                    .then((comp) => {
                    if (thisRequest !== pendingRequest && pendingRequest) {
                        return pendingRequest;
                    }
                    if (( true) && !comp) {
                        warn(`Async component loader resolved to undefined. ` +
                            `If you are using retry(), make sure to return its return value.`);
                    }
                    // interop module default
                    if (comp &&
                        (comp.__esModule || comp[Symbol.toStringTag] === 'Module')) {
                        comp = comp.default;
                    }
                    if (( true) && comp && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comp)) {
                        throw new Error(`Invalid async component load result: ${comp}`);
                    }
                    resolvedComp = comp;
                    return comp;
                })));
    };
    return defineComponent({
        name: 'AsyncComponentWrapper',
        __asyncLoader: load,
        get __asyncResolved() {
            return resolvedComp;
        },
        setup() {
            const instance = currentInstance;
            // already resolved
            if (resolvedComp) {
                return () => createInnerComp(resolvedComp, instance);
            }
            const onError = (err) => {
                pendingRequest = null;
                handleError(err, instance, 13 /* ErrorCodes.ASYNC_COMPONENT_LOADER */, !errorComponent /* do not throw in dev if user provided error component */);
            };
            // suspense-controlled or SSR.
            if ((suspensible && instance.suspense) ||
                (isInSSRComponentSetup)) {
                return load()
                    .then(comp => {
                    return () => createInnerComp(comp, instance);
                })
                    .catch(err => {
                    onError(err);
                    return () => errorComponent
                        ? createVNode(errorComponent, {
                            error: err
                        })
                        : null;
                });
            }
            const loaded = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)(false);
            const error = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)();
            const delayed = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ref)(!!delay);
            if (delay) {
                setTimeout(() => {
                    delayed.value = false;
                }, delay);
            }
            if (timeout != null) {
                setTimeout(() => {
                    if (!loaded.value && !error.value) {
                        const err = new Error(`Async component timed out after ${timeout}ms.`);
                        onError(err);
                        error.value = err;
                    }
                }, timeout);
            }
            load()
                .then(() => {
                loaded.value = true;
                if (instance.parent && isKeepAlive(instance.parent.vnode)) {
                    // parent is keep-alive, force update so the loaded component's
                    // name is taken into account
                    queueJob(instance.parent.update);
                }
            })
                .catch(err => {
                onError(err);
                error.value = err;
            });
            return () => {
                if (loaded.value && resolvedComp) {
                    return createInnerComp(resolvedComp, instance);
                }
                else if (error.value && errorComponent) {
                    return createVNode(errorComponent, {
                        error: error.value
                    });
                }
                else if (loadingComponent && !delayed.value) {
                    return createVNode(loadingComponent);
                }
            };
        }
    });
}
function createInnerComp(comp, parent) {
    const { ref, props, children, ce } = parent.vnode;
    const vnode = createVNode(comp, props, children);
    // ensure inner component inherits the async wrapper's ref owner
    vnode.ref = ref;
    // pass the custom element callback on to the inner comp
    // and remove it from the async wrapper
    vnode.ce = ce;
    delete parent.vnode.ce;
    return vnode;
}

const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
const KeepAliveImpl = {
    name: `KeepAlive`,
    // Marker for special handling inside the renderer. We are not using a ===
    // check directly on KeepAlive in the renderer, because importing it directly
    // would prevent it from being tree-shaken.
    __isKeepAlive: true,
    props: {
        include: [String, RegExp, Array],
        exclude: [String, RegExp, Array],
        max: [String, Number]
    },
    setup(props, { slots }) {
        const instance = getCurrentInstance();
        // KeepAlive communicates with the instantiated renderer via the
        // ctx where the renderer passes in its internals,
        // and the KeepAlive instance exposes activate/deactivate implementations.
        // The whole point of this is to avoid importing KeepAlive directly in the
        // renderer to facilitate tree-shaking.
        const sharedContext = instance.ctx;
        // if the internal renderer is not registered, it indicates that this is server-side rendering,
        // for KeepAlive, we just need to render its children
        if (!sharedContext.renderer) {
            return () => {
                const children = slots.default && slots.default();
                return children && children.length === 1 ? children[0] : children;
            };
        }
        const cache = new Map();
        const keys = new Set();
        let current = null;
        if (true) {
            instance.__v_cache = cache;
        }
        const parentSuspense = instance.suspense;
        const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
        const storageContainer = createElement('div');
        sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
            const instance = vnode.component;
            move(vnode, container, anchor, 0 /* MoveType.ENTER */, parentSuspense);
            // in case props have changed
            patch(instance.vnode, vnode, container, anchor, instance, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
            queuePostRenderEffect(() => {
                instance.isDeactivated = false;
                if (instance.a) {
                    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance.a);
                }
                const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
                if (vnodeHook) {
                    invokeVNodeHook(vnodeHook, instance.parent, vnode);
                }
            }, parentSuspense);
            if (true) {
                // Update components tree
                devtoolsComponentAdded(instance);
            }
        };
        sharedContext.deactivate = (vnode) => {
            const instance = vnode.component;
            move(vnode, storageContainer, null, 1 /* MoveType.LEAVE */, parentSuspense);
            queuePostRenderEffect(() => {
                if (instance.da) {
                    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance.da);
                }
                const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
                if (vnodeHook) {
                    invokeVNodeHook(vnodeHook, instance.parent, vnode);
                }
                instance.isDeactivated = true;
            }, parentSuspense);
            if (true) {
                // Update components tree
                devtoolsComponentAdded(instance);
            }
        };
        function unmount(vnode) {
            // reset the shapeFlag so it can be properly unmounted
            resetShapeFlag(vnode);
            _unmount(vnode, instance, parentSuspense, true);
        }
        function pruneCache(filter) {
            cache.forEach((vnode, key) => {
                const name = getComponentName(vnode.type);
                if (name && (!filter || !filter(name))) {
                    pruneCacheEntry(key);
                }
            });
        }
        function pruneCacheEntry(key) {
            const cached = cache.get(key);
            if (!current || !isSameVNodeType(cached, current)) {
                unmount(cached);
            }
            else if (current) {
                // current active instance should no longer be kept-alive.
                // we can't unmount it now but it might be later, so reset its flag now.
                resetShapeFlag(current);
            }
            cache.delete(key);
            keys.delete(key);
        }
        // prune cache on include/exclude prop change
        watch(() => [props.include, props.exclude], ([include, exclude]) => {
            include && pruneCache(name => matches(include, name));
            exclude && pruneCache(name => !matches(exclude, name));
        }, 
        // prune post-render after `current` has been updated
        { flush: 'post', deep: true });
        // cache sub tree after render
        let pendingCacheKey = null;
        const cacheSubtree = () => {
            // fix #1621, the pendingCacheKey could be 0
            if (pendingCacheKey != null) {
                cache.set(pendingCacheKey, getInnerChild(instance.subTree));
            }
        };
        onMounted(cacheSubtree);
        onUpdated(cacheSubtree);
        onBeforeUnmount(() => {
            cache.forEach(cached => {
                const { subTree, suspense } = instance;
                const vnode = getInnerChild(subTree);
                if (cached.type === vnode.type && cached.key === vnode.key) {
                    // current instance will be unmounted as part of keep-alive's unmount
                    resetShapeFlag(vnode);
                    // but invoke its deactivated hook here
                    const da = vnode.component.da;
                    da && queuePostRenderEffect(da, suspense);
                    return;
                }
                unmount(cached);
            });
        });
        return () => {
            pendingCacheKey = null;
            if (!slots.default) {
                return null;
            }
            const children = slots.default();
            const rawVNode = children[0];
            if (children.length > 1) {
                if ((true)) {
                    warn(`KeepAlive should contain exactly one component child.`);
                }
                current = null;
                return children;
            }
            else if (!isVNode(rawVNode) ||
                (!(rawVNode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) &&
                    !(rawVNode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */))) {
                current = null;
                return rawVNode;
            }
            let vnode = getInnerChild(rawVNode);
            const comp = vnode.type;
            // for async components, name check should be based in its loaded
            // inner component if available
            const name = getComponentName(isAsyncWrapper(vnode)
                ? vnode.type.__asyncResolved || {}
                : comp);
            const { include, exclude, max } = props;
            if ((include && (!name || !matches(include, name))) ||
                (exclude && name && matches(exclude, name))) {
                current = vnode;
                return rawVNode;
            }
            const key = vnode.key == null ? comp : vnode.key;
            const cachedVNode = cache.get(key);
            // clone vnode if it's reused because we are going to mutate it
            if (vnode.el) {
                vnode = cloneVNode(vnode);
                if (rawVNode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                    rawVNode.ssContent = vnode;
                }
            }
            // #1513 it's possible for the returned vnode to be cloned due to attr
            // fallthrough or scopeId, so the vnode here may not be the final vnode
            // that is mounted. Instead of caching it directly, we store the pending
            // key and cache `instance.subTree` (the normalized vnode) in
            // beforeMount/beforeUpdate hooks.
            pendingCacheKey = key;
            if (cachedVNode) {
                // copy over mounted state
                vnode.el = cachedVNode.el;
                vnode.component = cachedVNode.component;
                if (vnode.transition) {
                    // recursively update transition hooks on subTree
                    setTransitionHooks(vnode, vnode.transition);
                }
                // avoid vnode being mounted as fresh
                vnode.shapeFlag |= 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */;
                // make this key the freshest
                keys.delete(key);
                keys.add(key);
            }
            else {
                keys.add(key);
                // prune oldest entry
                if (max && keys.size > parseInt(max, 10)) {
                    pruneCacheEntry(keys.values().next().value);
                }
            }
            // avoid vnode being unmounted
            vnode.shapeFlag |= 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */;
            current = vnode;
            return isSuspense(rawVNode.type) ? rawVNode : vnode;
        };
    }
};
// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
const KeepAlive = KeepAliveImpl;
function matches(pattern, name) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(pattern)) {
        return pattern.some((p) => matches(p, name));
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(pattern)) {
        return pattern.split(',').includes(name);
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isRegExp)(pattern)) {
        return pattern.test(name);
    }
    /* istanbul ignore next */
    return false;
}
function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a" /* LifecycleHooks.ACTIVATED */, target);
}
function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da" /* LifecycleHooks.DEACTIVATED */, target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
    // cache the deactivate branch check wrapper for injected hooks so the same
    // hook can be properly deduped by the scheduler. "__wdc" stands for "with
    // deactivation check".
    const wrappedHook = hook.__wdc ||
        (hook.__wdc = () => {
            // only fire the hook if the target instance is NOT in a deactivated branch.
            let current = target;
            while (current) {
                if (current.isDeactivated) {
                    return;
                }
                current = current.parent;
            }
            return hook();
        });
    injectHook(type, wrappedHook, target);
    // In addition to registering it on the target instance, we walk up the parent
    // chain and register it on all ancestor instances that are keep-alive roots.
    // This avoids the need to walk the entire component tree when invoking these
    // hooks, and more importantly, avoids the need to track child components in
    // arrays.
    if (target) {
        let current = target.parent;
        while (current && current.parent) {
            if (isKeepAlive(current.parent.vnode)) {
                injectToKeepAliveRoot(wrappedHook, type, target, current);
            }
            current = current.parent;
        }
    }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    // injectHook wraps the original for error handling, so make sure to remove
    // the wrapped version.
    const injected = injectHook(type, hook, keepAliveRoot, true /* prepend */);
    onUnmounted(() => {
        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(keepAliveRoot[type], injected);
    }, target);
}
function resetShapeFlag(vnode) {
    // bitwise operations to remove keep alive flags
    vnode.shapeFlag &= ~256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */;
    vnode.shapeFlag &= ~512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */;
}
function getInnerChild(vnode) {
    return vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */ ? vnode.ssContent : vnode;
}

function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
        const hooks = target[type] || (target[type] = []);
        // cache the error handling wrapper for injected hooks so the same hook
        // can be properly deduped by the scheduler. "__weh" stands for "with error
        // handling".
        const wrappedHook = hook.__weh ||
            (hook.__weh = (...args) => {
                if (target.isUnmounted) {
                    return;
                }
                // disable tracking inside all lifecycle hooks
                // since they can potentially be called inside effects.
                (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
                // Set currentInstance during hook invocation.
                // This assumes the hook does not synchronously trigger other hooks, which
                // can only be false when the user does something really funky.
                setCurrentInstance(target);
                const res = callWithAsyncErrorHandling(hook, target, type, args);
                unsetCurrentInstance();
                (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
                return res;
            });
        if (prepend) {
            hooks.unshift(wrappedHook);
        }
        else {
            hooks.push(wrappedHook);
        }
        return wrappedHook;
    }
    else if ((true)) {
        const apiName = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(ErrorTypeStrings[type].replace(/ hook$/, ''));
        warn(`${apiName} is called when there is no active component instance to be ` +
            `associated with. ` +
            `Lifecycle injection APIs can only be used during execution of setup().` +
            (` If you are using async setup(), make sure to register lifecycle ` +
                    `hooks before the first await statement.`
                ));
    }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => 
// post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
(!isInSSRComponentSetup || lifecycle === "sp" /* LifecycleHooks.SERVER_PREFETCH */) &&
    injectHook(lifecycle, (...args) => hook(...args), target);
const onBeforeMount = createHook("bm" /* LifecycleHooks.BEFORE_MOUNT */);
const onMounted = createHook("m" /* LifecycleHooks.MOUNTED */);
const onBeforeUpdate = createHook("bu" /* LifecycleHooks.BEFORE_UPDATE */);
const onUpdated = createHook("u" /* LifecycleHooks.UPDATED */);
const onBeforeUnmount = createHook("bum" /* LifecycleHooks.BEFORE_UNMOUNT */);
const onUnmounted = createHook("um" /* LifecycleHooks.UNMOUNTED */);
const onServerPrefetch = createHook("sp" /* LifecycleHooks.SERVER_PREFETCH */);
const onRenderTriggered = createHook("rtg" /* LifecycleHooks.RENDER_TRIGGERED */);
const onRenderTracked = createHook("rtc" /* LifecycleHooks.RENDER_TRACKED */);
function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec" /* LifecycleHooks.ERROR_CAPTURED */, hook, target);
}

/**
Runtime helper for applying directives to a vnode. Example usage:

const comp = resolveComponent('comp')
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h(comp), [
  [foo, this.x],
  [bar, this.y]
])
*/
function validateDirectiveName(name) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isBuiltInDirective)(name)) {
        warn('Do not use built-in directive ids as custom directive id: ' + name);
    }
}
/**
 * Adds directives to a VNode.
 */
function withDirectives(vnode, directives) {
    const internalInstance = currentRenderingInstance;
    if (internalInstance === null) {
        ( true) && warn(`withDirectives can only be used inside render functions.`);
        return vnode;
    }
    const instance = getExposeProxy(internalInstance) ||
        internalInstance.proxy;
    const bindings = vnode.dirs || (vnode.dirs = []);
    for (let i = 0; i < directives.length; i++) {
        let [dir, value, arg, modifiers = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ] = directives[i];
        if (dir) {
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(dir)) {
                dir = {
                    mounted: dir,
                    updated: dir
                };
            }
            if (dir.deep) {
                traverse(value);
            }
            bindings.push({
                dir,
                instance,
                value,
                oldValue: void 0,
                arg,
                modifiers
            });
        }
    }
    return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        if (oldBindings) {
            binding.oldValue = oldBindings[i].value;
        }
        let hook = binding.dir[name];
        if (hook) {
            // disable tracking inside all lifecycle hooks
            // since they can potentially be called inside effects.
            (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
            callWithAsyncErrorHandling(hook, instance, 8 /* ErrorCodes.DIRECTIVE_HOOK */, [
                vnode.el,
                binding,
                vnode,
                prevVNode
            ]);
            (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
        }
    }
}

const COMPONENTS = 'components';
const DIRECTIVES = 'directives';
/**
 * @private
 */
function resolveComponent(name, maybeSelfReference) {
    return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = Symbol();
/**
 * @private
 */
function resolveDynamicComponent(component) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(component)) {
        return resolveAsset(COMPONENTS, component, false) || component;
    }
    else {
        // invalid types will fallthrough to createVNode and raise warning
        return (component || NULL_DYNAMIC_COMPONENT);
    }
}
/**
 * @private
 */
function resolveDirective(name) {
    return resolveAsset(DIRECTIVES, name);
}
// implementation
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
    const instance = currentRenderingInstance || currentInstance;
    if (instance) {
        const Component = instance.type;
        // explicit self name has highest priority
        if (type === COMPONENTS) {
            const selfName = getComponentName(Component, false /* do not include inferred name to avoid breaking existing code */);
            if (selfName &&
                (selfName === name ||
                    selfName === (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name) ||
                    selfName === (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name)))) {
                return Component;
            }
        }
        const res = 
        // local registration
        // check instance[type] first which is resolved for options API
        resolve(instance[type] || Component[type], name) ||
            // global registration
            resolve(instance.appContext[type], name);
        if (!res && maybeSelfReference) {
            // fallback to implicit self-reference
            return Component;
        }
        if (( true) && warnMissing && !res) {
            const extra = type === COMPONENTS
                ? `\nIf this is a native custom element, make sure to exclude it from ` +
                    `component resolution via compilerOptions.isCustomElement.`
                : ``;
            warn(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
        }
        return res;
    }
    else if ((true)) {
        warn(`resolve${(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)(type.slice(0, -1))} ` +
            `can only be used in render() or setup().`);
    }
}
function resolve(registry, name) {
    return (registry &&
        (registry[name] ||
            registry[(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name)] ||
            registry[(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(name))]));
}

/**
 * Actual implementation
 */
function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = (cache && cache[index]);
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(source) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(source)) {
        ret = new Array(source.length);
        for (let i = 0, l = source.length; i < l; i++) {
            ret[i] = renderItem(source[i], i, undefined, cached && cached[i]);
        }
    }
    else if (typeof source === 'number') {
        if (( true) && !Number.isInteger(source)) {
            warn(`The v-for range expect an integer value but got ${source}.`);
        }
        ret = new Array(source);
        for (let i = 0; i < source; i++) {
            ret[i] = renderItem(i + 1, i, undefined, cached && cached[i]);
        }
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(source)) {
        if (source[Symbol.iterator]) {
            ret = Array.from(source, (item, i) => renderItem(item, i, undefined, cached && cached[i]));
        }
        else {
            const keys = Object.keys(source);
            ret = new Array(keys.length);
            for (let i = 0, l = keys.length; i < l; i++) {
                const key = keys[i];
                ret[i] = renderItem(source[key], key, i, cached && cached[i]);
            }
        }
    }
    else {
        ret = [];
    }
    if (cache) {
        cache[index] = ret;
    }
    return ret;
}

/**
 * Compiler runtime helper for creating dynamic slots object
 * @private
 */
function createSlots(slots, dynamicSlots) {
    for (let i = 0; i < dynamicSlots.length; i++) {
        const slot = dynamicSlots[i];
        // array of dynamic slot generated by <template v-for="..." #[...]>
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(slot)) {
            for (let j = 0; j < slot.length; j++) {
                slots[slot[j].name] = slot[j].fn;
            }
        }
        else if (slot) {
            // conditional single slot generated by <template v-if="..." #foo>
            slots[slot.name] = slot.key
                ? (...args) => {
                    const res = slot.fn(...args);
                    // attach branch key so each conditional branch is considered a
                    // different fragment
                    if (res)
                        res.key = slot.key;
                    return res;
                }
                : slot.fn;
        }
    }
    return slots;
}

/**
 * Compiler runtime helper for rendering `<slot/>`
 * @private
 */
function renderSlot(slots, name, props = {}, 
// this is not a user-facing function, so the fallback is always generated by
// the compiler and guaranteed to be a function returning an array
fallback, noSlotted) {
    if (currentRenderingInstance.isCE ||
        (currentRenderingInstance.parent &&
            isAsyncWrapper(currentRenderingInstance.parent) &&
            currentRenderingInstance.parent.isCE)) {
        if (name !== 'default')
            props.name = name;
        return createVNode('slot', props, fallback && fallback());
    }
    let slot = slots[name];
    if (( true) && slot && slot.length > 1) {
        warn(`SSR-optimized slot function detected in a non-SSR-optimized render ` +
            `function. You need to mark this component with $dynamic-slots in the ` +
            `parent template.`);
        slot = () => [];
    }
    // a compiled slot disables block tracking by default to avoid manual
    // invocation interfering with template-based block tracking, but in
    // `renderSlot` we can be sure that it's template-based so we can force
    // enable it.
    if (slot && slot._c) {
        slot._d = false;
    }
    openBlock();
    const validSlotContent = slot && ensureValidVNode(slot(props));
    const rendered = createBlock(Fragment, {
        key: props.key ||
            // slot content array of a dynamic conditional slot may have a branch
            // key attached in the `createSlots` helper, respect that
            (validSlotContent && validSlotContent.key) ||
            `_${name}`
    }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 /* SlotFlags.STABLE */
        ? 64 /* PatchFlags.STABLE_FRAGMENT */
        : -2 /* PatchFlags.BAIL */);
    if (!noSlotted && rendered.scopeId) {
        rendered.slotScopeIds = [rendered.scopeId + '-s'];
    }
    if (slot && slot._c) {
        slot._d = true;
    }
    return rendered;
}
function ensureValidVNode(vnodes) {
    return vnodes.some(child => {
        if (!isVNode(child))
            return true;
        if (child.type === Comment)
            return false;
        if (child.type === Fragment &&
            !ensureValidVNode(child.children))
            return false;
        return true;
    })
        ? vnodes
        : null;
}

/**
 * For prefixing keys in v-on="obj" with "on"
 * @private
 */
function toHandlers(obj, preserveCaseIfNecessary) {
    const ret = {};
    if (( true) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(obj)) {
        warn(`v-on with no argument expects an object value.`);
        return ret;
    }
    for (const key in obj) {
        ret[preserveCaseIfNecessary && /[A-Z]/.test(key)
            ? `on:${key}`
            : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toHandlerKey)(key)] = obj[key];
    }
    return ret;
}

/**
 * #2437 In Vue 3, functional components do not have a public instance proxy but
 * they exist in the internal parent chain. For code that relies on traversing
 * public $parent chains, skip functional ones and go to the parent instead.
 */
const getPublicInstance = (i) => {
    if (!i)
        return null;
    if (isStatefulComponent(i))
        return getExposeProxy(i) || i.proxy;
    return getPublicInstance(i.parent);
};
const publicPropertiesMap = 
// Move PURE marker to new line to workaround compiler discarding it
// due to type annotation
/*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(Object.create(null), {
    $: i => i,
    $el: i => i.vnode.el,
    $data: i => i.data,
    $props: i => (( true) ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(i.props) : 0),
    $attrs: i => (( true) ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(i.attrs) : 0),
    $slots: i => (( true) ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(i.slots) : 0),
    $refs: i => (( true) ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(i.refs) : 0),
    $parent: i => getPublicInstance(i.parent),
    $root: i => getPublicInstance(i.root),
    $emit: i => i.emit,
    $options: i => ( true ? resolveMergedOptions(i) : 0),
    $forceUpdate: i => i.f || (i.f = () => queueJob(i.update)),
    $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: i => ( true ? instanceWatch.bind(i) : 0)
});
const isReservedPrefix = (key) => key === '_' || key === '$';
const hasSetupBinding = (state, key) => state !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && !state.__isScriptSetup && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(state, key);
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
        // for internal formatters to know that this is a Vue instance
        if (( true) && key === '__isVue') {
            return true;
        }
        // data / props / ctx
        // This getter gets called for every property access on the render context
        // during render and is a major hotspot. The most expensive part of this
        // is the multiple hasOwn() calls. It's much faster to do a simple property
        // access on a plain object, so we use an accessCache object (with null
        // prototype) to memoize what access type a key corresponds to.
        let normalizedProps;
        if (key[0] !== '$') {
            const n = accessCache[key];
            if (n !== undefined) {
                switch (n) {
                    case 1 /* AccessTypes.SETUP */:
                        return setupState[key];
                    case 2 /* AccessTypes.DATA */:
                        return data[key];
                    case 4 /* AccessTypes.CONTEXT */:
                        return ctx[key];
                    case 3 /* AccessTypes.PROPS */:
                        return props[key];
                    // default: just fallthrough
                }
            }
            else if (hasSetupBinding(setupState, key)) {
                accessCache[key] = 1 /* AccessTypes.SETUP */;
                return setupState[key];
            }
            else if (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) {
                accessCache[key] = 2 /* AccessTypes.DATA */;
                return data[key];
            }
            else if (
            // only cache other properties when instance has declared (thus stable)
            // props
            (normalizedProps = instance.propsOptions[0]) &&
                (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(normalizedProps, key)) {
                accessCache[key] = 3 /* AccessTypes.PROPS */;
                return props[key];
            }
            else if (ctx !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key)) {
                accessCache[key] = 4 /* AccessTypes.CONTEXT */;
                return ctx[key];
            }
            else if ( false || shouldCacheAccess) {
                accessCache[key] = 0 /* AccessTypes.OTHER */;
            }
        }
        const publicGetter = publicPropertiesMap[key];
        let cssModule, globalProperties;
        // public $xxx properties
        if (publicGetter) {
            if (key === '$attrs') {
                (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.track)(instance, "get" /* TrackOpTypes.GET */, key);
                ( true) && markAttrsAccessed();
            }
            return publicGetter(instance);
        }
        else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) &&
            (cssModule = cssModule[key])) {
            return cssModule;
        }
        else if (ctx !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key)) {
            // user may set custom properties to `this` that start with `$`
            accessCache[key] = 4 /* AccessTypes.CONTEXT */;
            return ctx[key];
        }
        else if (
        // global properties
        ((globalProperties = appContext.config.globalProperties),
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(globalProperties, key))) {
            {
                return globalProperties[key];
            }
        }
        else if (( true) &&
            currentRenderingInstance &&
            (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(key) ||
                // #1091 avoid internal isRef/isVNode checks on component instance leading
                // to infinite warning loop
                key.indexOf('__v') !== 0)) {
            if (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && isReservedPrefix(key[0]) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) {
                warn(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved ` +
                    `character ("$" or "_") and is not proxied on the render context.`);
            }
            else if (instance === currentRenderingInstance) {
                warn(`Property ${JSON.stringify(key)} was accessed during render ` +
                    `but is not defined on instance.`);
            }
        }
    },
    set({ _: instance }, key, value) {
        const { data, setupState, ctx } = instance;
        if (hasSetupBinding(setupState, key)) {
            setupState[key] = value;
            return true;
        }
        else if (( true) &&
            setupState.__isScriptSetup &&
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, key)) {
            warn(`Cannot mutate <script setup> binding "${key}" from Options API.`);
            return false;
        }
        else if (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) {
            data[key] = value;
            return true;
        }
        else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(instance.props, key)) {
            ( true) && warn(`Attempting to mutate prop "${key}". Props are readonly.`);
            return false;
        }
        if (key[0] === '$' && key.slice(1) in instance) {
            ( true) &&
                warn(`Attempting to mutate public property "${key}". ` +
                    `Properties starting with $ are reserved and readonly.`);
            return false;
        }
        else {
            if (( true) && key in instance.appContext.config.globalProperties) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    value
                });
            }
            else {
                ctx[key] = value;
            }
        }
        return true;
    },
    has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
        let normalizedProps;
        return (!!accessCache[key] ||
            (data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(data, key)) ||
            hasSetupBinding(setupState, key) ||
            ((normalizedProps = propsOptions[0]) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(normalizedProps, key)) ||
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(ctx, key) ||
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(publicPropertiesMap, key) ||
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(appContext.config.globalProperties, key));
    },
    defineProperty(target, key, descriptor) {
        if (descriptor.get != null) {
            // invalidate key cache of a getter based property #5417
            target._.accessCache[key] = 0;
        }
        else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(descriptor, 'value')) {
            this.set(target, key, descriptor.value, null);
        }
        return Reflect.defineProperty(target, key, descriptor);
    }
};
if (true) {
    PublicInstanceProxyHandlers.ownKeys = (target) => {
        warn(`Avoid app logic that relies on enumerating keys on a component instance. ` +
            `The keys will be empty in production mode to avoid performance overhead.`);
        return Reflect.ownKeys(target);
    };
}
const RuntimeCompiledPublicInstanceProxyHandlers = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, PublicInstanceProxyHandlers, {
    get(target, key) {
        // fast path for unscopables when using `with` block
        if (key === Symbol.unscopables) {
            return;
        }
        return PublicInstanceProxyHandlers.get(target, key, target);
    },
    has(_, key) {
        const has = key[0] !== '_' && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isGloballyWhitelisted)(key);
        if (( true) && !has && PublicInstanceProxyHandlers.has(_, key)) {
            warn(`Property ${JSON.stringify(key)} should not start with _ which is a reserved prefix for Vue internals.`);
        }
        return has;
    }
});
// dev only
// In dev mode, the proxy target exposes the same properties as seen on `this`
// for easier console inspection. In prod mode it will be an empty object so
// these properties definitions can be skipped.
function createDevRenderContext(instance) {
    const target = {};
    // expose internal instance for proxy handlers
    Object.defineProperty(target, `_`, {
        configurable: true,
        enumerable: false,
        get: () => instance
    });
    // expose public properties
    Object.keys(publicPropertiesMap).forEach(key => {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            get: () => publicPropertiesMap[key](instance),
            // intercepted by the proxy so no need for implementation,
            // but needed to prevent set errors
            set: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP
        });
    });
    return target;
}
// dev only
function exposePropsOnRenderContext(instance) {
    const { ctx, propsOptions: [propsOptions] } = instance;
    if (propsOptions) {
        Object.keys(propsOptions).forEach(key => {
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => instance.props[key],
                set: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP
            });
        });
    }
}
// dev only
function exposeSetupStateOnRenderContext(instance) {
    const { ctx, setupState } = instance;
    Object.keys((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(setupState)).forEach(key => {
        if (!setupState.__isScriptSetup) {
            if (isReservedPrefix(key[0])) {
                warn(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" ` +
                    `which are reserved prefixes for Vue internals.`);
                return;
            }
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => setupState[key],
                set: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP
            });
        }
    });
}

function createDuplicateChecker() {
    const cache = Object.create(null);
    return (type, key) => {
        if (cache[key]) {
            warn(`${type} property "${key}" is already defined in ${cache[key]}.`);
        }
        else {
            cache[key] = type;
        }
    };
}
let shouldCacheAccess = true;
function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    // do not cache property access on public proxy during state initialization
    shouldCacheAccess = false;
    // call beforeCreate first before accessing other options since
    // the hook may mutate resolved options (#2791)
    if (options.beforeCreate) {
        callHook(options.beforeCreate, instance, "bc" /* LifecycleHooks.BEFORE_CREATE */);
    }
    const { 
    // state
    data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, 
    // lifecycle
    created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, 
    // public API
    expose, inheritAttrs, 
    // assets
    components, directives, filters } = options;
    const checkDuplicateProperties = ( true) ? createDuplicateChecker() : 0;
    if ((true)) {
        const [propsOptions] = instance.propsOptions;
        if (propsOptions) {
            for (const key in propsOptions) {
                checkDuplicateProperties("Props" /* OptionTypes.PROPS */, key);
            }
        }
    }
    // options initialization order (to be consistent with Vue 2):
    // - props (already done outside of this function)
    // - inject
    // - methods
    // - data (deferred since it relies on `this` access)
    // - computed
    // - watch (deferred since it relies on `this` access)
    if (injectOptions) {
        resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
    }
    if (methods) {
        for (const key in methods) {
            const methodHandler = methods[key];
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(methodHandler)) {
                // In dev mode, we use the `createRenderContext` function to define
                // methods to the proxy target, and those are read-only but
                // reconfigurable, so it needs to be redefined here
                if ((true)) {
                    Object.defineProperty(ctx, key, {
                        value: methodHandler.bind(publicThis),
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
                }
                else {}
                if ((true)) {
                    checkDuplicateProperties("Methods" /* OptionTypes.METHODS */, key);
                }
            }
            else if ((true)) {
                warn(`Method "${key}" has type "${typeof methodHandler}" in the component definition. ` +
                    `Did you reference the function correctly?`);
            }
        }
    }
    if (dataOptions) {
        if (( true) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(dataOptions)) {
            warn(`The data option must be a function. ` +
                `Plain object usage is no longer supported.`);
        }
        const data = dataOptions.call(publicThis, publicThis);
        if (( true) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(data)) {
            warn(`data() returned a Promise - note data() cannot be async; If you ` +
                `intend to perform data fetching before component renders, use ` +
                `async setup() + <Suspense>.`);
        }
        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(data)) {
            ( true) && warn(`data() should return an object.`);
        }
        else {
            instance.data = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.reactive)(data);
            if ((true)) {
                for (const key in data) {
                    checkDuplicateProperties("Data" /* OptionTypes.DATA */, key);
                    // expose data on ctx during dev
                    if (!isReservedPrefix(key[0])) {
                        Object.defineProperty(ctx, key, {
                            configurable: true,
                            enumerable: true,
                            get: () => data[key],
                            set: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP
                        });
                    }
                }
            }
        }
    }
    // state initialization complete at this point - start caching access
    shouldCacheAccess = true;
    if (computedOptions) {
        for (const key in computedOptions) {
            const opt = computedOptions[key];
            const get = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt)
                ? opt.bind(publicThis, publicThis)
                : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt.get)
                    ? opt.get.bind(publicThis, publicThis)
                    : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP;
            if (( true) && get === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP) {
                warn(`Computed property "${key}" has no getter.`);
            }
            const set = !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt.set)
                ? opt.set.bind(publicThis)
                : ( true)
                    ? () => {
                        warn(`Write operation failed: computed property "${key}" is readonly.`);
                    }
                    : 0;
            const c = computed({
                get,
                set
            });
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => c.value,
                set: v => (c.value = v)
            });
            if ((true)) {
                checkDuplicateProperties("Computed" /* OptionTypes.COMPUTED */, key);
            }
        }
    }
    if (watchOptions) {
        for (const key in watchOptions) {
            createWatcher(watchOptions[key], ctx, publicThis, key);
        }
    }
    if (provideOptions) {
        const provides = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(provideOptions)
            ? provideOptions.call(publicThis)
            : provideOptions;
        Reflect.ownKeys(provides).forEach(key => {
            provide(key, provides[key]);
        });
    }
    if (created) {
        callHook(created, instance, "c" /* LifecycleHooks.CREATED */);
    }
    function registerLifecycleHook(register, hook) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)) {
            hook.forEach(_hook => register(_hook.bind(publicThis)));
        }
        else if (hook) {
            register(hook.bind(publicThis));
        }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(expose)) {
        if (expose.length) {
            const exposed = instance.exposed || (instance.exposed = {});
            expose.forEach(key => {
                Object.defineProperty(exposed, key, {
                    get: () => publicThis[key],
                    set: val => (publicThis[key] = val)
                });
            });
        }
        else if (!instance.exposed) {
            instance.exposed = {};
        }
    }
    // options that are handled when creating the instance but also need to be
    // applied from mixins
    if (render && instance.render === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP) {
        instance.render = render;
    }
    if (inheritAttrs != null) {
        instance.inheritAttrs = inheritAttrs;
    }
    // asset options.
    if (components)
        instance.components = components;
    if (directives)
        instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP, unwrapRef = false) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(injectOptions)) {
        injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
        const opt = injectOptions[key];
        let injected;
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(opt)) {
            if ('default' in opt) {
                injected = inject(opt.from || key, opt.default, true /* treat default function as factory */);
            }
            else {
                injected = inject(opt.from || key);
            }
        }
        else {
            injected = inject(opt);
        }
        if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(injected)) {
            // TODO remove the check in 3.3
            if (unwrapRef) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    get: () => injected.value,
                    set: v => (injected.value = v)
                });
            }
            else {
                if ((true)) {
                    warn(`injected property "${key}" is a ref and will be auto-unwrapped ` +
                        `and no longer needs \`.value\` in the next minor release. ` +
                        `To opt-in to the new behavior now, ` +
                        `set \`app.config.unwrapInjectedRef = true\` (this config is ` +
                        `temporary and will not be needed in the future.)`);
                }
                ctx[key] = injected;
            }
        }
        else {
            ctx[key] = injected;
        }
        if ((true)) {
            checkDuplicateProperties("Inject" /* OptionTypes.INJECT */, key);
        }
    }
}
function callHook(hook, instance, type) {
    callWithAsyncErrorHandling((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)
        ? hook.map(h => h.bind(instance.proxy))
        : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
    const getter = key.includes('.')
        ? createPathGetter(publicThis, key)
        : () => publicThis[key];
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(raw)) {
        const handler = ctx[raw];
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(handler)) {
            watch(getter, handler);
        }
        else if ((true)) {
            warn(`Invalid watch handler specified by key "${raw}"`, handler);
        }
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(raw)) {
        watch(getter, raw.bind(publicThis));
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(raw)) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) {
            raw.forEach(r => createWatcher(r, ctx, publicThis, key));
        }
        else {
            const handler = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(raw.handler)
                ? raw.handler.bind(publicThis)
                : ctx[raw.handler];
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(handler)) {
                watch(getter, handler, raw);
            }
            else if ((true)) {
                warn(`Invalid watch handler specified by key "${raw.handler}"`, handler);
            }
        }
    }
    else if ((true)) {
        warn(`Invalid watch option: "${key}"`, raw);
    }
}
/**
 * Resolve merged options and cache it on the component.
 * This is done only once per-component since the merging does not involve
 * instances.
 */
function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
        resolved = cached;
    }
    else if (!globalMixins.length && !mixins && !extendsOptions) {
        {
            resolved = base;
        }
    }
    else {
        resolved = {};
        if (globalMixins.length) {
            globalMixins.forEach(m => mergeOptions(resolved, m, optionMergeStrategies, true));
        }
        mergeOptions(resolved, base, optionMergeStrategies);
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(base)) {
        cache.set(base, resolved);
    }
    return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
        mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
        mixins.forEach((m) => mergeOptions(to, m, strats, true));
    }
    for (const key in from) {
        if (asMixin && key === 'expose') {
            ( true) &&
                warn(`"expose" option is ignored when declared in mixins or extends. ` +
                    `It should only be declared in the base component itself.`);
        }
        else {
            const strat = internalOptionMergeStrats[key] || (strats && strats[key]);
            to[key] = strat ? strat(to[key], from[key]) : from[key];
        }
    }
    return to;
}
const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeObjectOptions,
    emits: mergeObjectOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
};
function mergeDataFn(to, from) {
    if (!from) {
        return to;
    }
    if (!to) {
        return from;
    }
    return function mergedDataFn() {
        return ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend))((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(to) ? to.call(this, this) : to, (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(from) ? from.call(this, this) : from);
    };
}
function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) {
        const res = {};
        for (let i = 0; i < raw.length; i++) {
            res[raw[i]] = raw[i];
        }
        return res;
    }
    return raw;
}
function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
    return to ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
    if (!to)
        return from;
    if (!from)
        return to;
    const merged = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(Object.create(null), to);
    for (const key in from) {
        merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
}

function initProps(instance, rawProps, isStateful, // result of bitwise flag comparison
isSSR = false) {
    const props = {};
    const attrs = {};
    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(attrs, InternalObjectKey, 1);
    instance.propsDefaults = Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    // ensure all declared prop keys are present
    for (const key in instance.propsOptions[0]) {
        if (!(key in props)) {
            props[key] = undefined;
        }
    }
    // validation
    if ((true)) {
        validateProps(rawProps || {}, props, instance);
    }
    if (isStateful) {
        // stateful
        instance.props = isSSR ? props : (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReactive)(props);
    }
    else {
        if (!instance.type.props) {
            // functional w/ optional props, props === attrs
            instance.props = attrs;
        }
        else {
            // functional w/ declared props
            instance.props = props;
        }
    }
    instance.attrs = attrs;
}
function isInHmrContext(instance) {
    while (instance) {
        if (instance.type.__hmrId)
            return true;
        instance = instance.parent;
    }
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const { props, attrs, vnode: { patchFlag } } = instance;
    const rawCurrentProps = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(( true) && isInHmrContext(instance)) &&
        (optimized || patchFlag > 0) &&
        !(patchFlag & 16 /* PatchFlags.FULL_PROPS */)) {
        if (patchFlag & 8 /* PatchFlags.PROPS */) {
            // Compiler-generated props & no keys change, just set the updated
            // the props.
            const propsToUpdate = instance.vnode.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
                let key = propsToUpdate[i];
                // skip if the prop key is a declared emit event listener
                if (isEmitListener(instance.emitsOptions, key)) {
                    continue;
                }
                // PROPS flag guarantees rawProps to be non-null
                const value = rawProps[key];
                if (options) {
                    // attr / props separation was done on init and will be consistent
                    // in this code path, so just check if attrs have it.
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(attrs, key)) {
                        if (value !== attrs[key]) {
                            attrs[key] = value;
                            hasAttrsChanged = true;
                        }
                    }
                    else {
                        const camelizedKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key);
                        props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false /* isAbsent */);
                    }
                }
                else {
                    if (value !== attrs[key]) {
                        attrs[key] = value;
                        hasAttrsChanged = true;
                    }
                }
            }
        }
    }
    else {
        // full props update.
        if (setFullProps(instance, rawProps, props, attrs)) {
            hasAttrsChanged = true;
        }
        // in case of dynamic props, check if we need to delete keys from
        // the props object
        let kebabKey;
        for (const key in rawCurrentProps) {
            if (!rawProps ||
                // for camelCase
                (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, key) &&
                    // it's possible the original props was passed in as kebab-case
                    // and converted to camelCase (#955)
                    ((kebabKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key)) === key || !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, kebabKey)))) {
                if (options) {
                    if (rawPrevProps &&
                        // for camelCase
                        (rawPrevProps[key] !== undefined ||
                            // for kebab-case
                            rawPrevProps[kebabKey] !== undefined)) {
                        props[key] = resolvePropValue(options, rawCurrentProps, key, undefined, instance, true /* isAbsent */);
                    }
                }
                else {
                    delete props[key];
                }
            }
        }
        // in the case of functional component w/o props declaration, props and
        // attrs point to the same object so it should already have been updated.
        if (attrs !== rawCurrentProps) {
            for (const key in attrs) {
                if (!rawProps ||
                    (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, key) &&
                        (!false ))) {
                    delete attrs[key];
                    hasAttrsChanged = true;
                }
            }
        }
    }
    // trigger updates for $attrs in case it's used in component slots
    if (hasAttrsChanged) {
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.trigger)(instance, "set" /* TriggerOpTypes.SET */, '$attrs');
    }
    if ((true)) {
        validateProps(rawProps || {}, props, instance);
    }
}
function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
        for (let key in rawProps) {
            // key, ref are reserved and never passed down
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key)) {
                continue;
            }
            const value = rawProps[key];
            // prop option names are camelized during normalization, so to support
            // kebab -> camel conversion here we need to camelize the key.
            let camelKey;
            if (options && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(options, (camelKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key)))) {
                if (!needCastKeys || !needCastKeys.includes(camelKey)) {
                    props[camelKey] = value;
                }
                else {
                    (rawCastValues || (rawCastValues = {}))[camelKey] = value;
                }
            }
            else if (!isEmitListener(instance.emitsOptions, key)) {
                if (!(key in attrs) || value !== attrs[key]) {
                    attrs[key] = value;
                    hasAttrsChanged = true;
                }
            }
        }
    }
    if (needCastKeys) {
        const rawCurrentProps = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
        const castValues = rawCastValues || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        for (let i = 0; i < needCastKeys.length; i++) {
            const key = needCastKeys[i];
            props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(castValues, key));
        }
    }
    return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
        const hasDefault = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(opt, 'default');
        // default values
        if (hasDefault && value === undefined) {
            const defaultValue = opt.default;
            if (opt.type !== Function && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(defaultValue)) {
                const { propsDefaults } = instance;
                if (key in propsDefaults) {
                    value = propsDefaults[key];
                }
                else {
                    setCurrentInstance(instance);
                    value = propsDefaults[key] = defaultValue.call(null, props);
                    unsetCurrentInstance();
                }
            }
            else {
                value = defaultValue;
            }
        }
        // boolean casting
        if (opt[0 /* BooleanFlags.shouldCast */]) {
            if (isAbsent && !hasDefault) {
                value = false;
            }
            else if (opt[1 /* BooleanFlags.shouldCastTrue */] &&
                (value === '' || value === (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key))) {
                value = true;
            }
        }
    }
    return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
        return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    // apply mixin/extends props
    let hasExtends = false;
    if ( true && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(comp)) {
        const extendProps = (raw) => {
            hasExtends = true;
            const [props, keys] = normalizePropsOptions(raw, appContext, true);
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(normalized, props);
            if (keys)
                needCastKeys.push(...keys);
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendProps);
        }
        if (comp.extends) {
            extendProps(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendProps);
        }
    }
    if (!raw && !hasExtends) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) {
            cache.set(comp, _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR);
        }
        return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)) {
        for (let i = 0; i < raw.length; i++) {
            if (( true) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(raw[i])) {
                warn(`props must be strings when using array syntax.`, raw[i]);
            }
            const normalizedKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(raw[i]);
            if (validatePropName(normalizedKey)) {
                normalized[normalizedKey] = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
            }
        }
    }
    else if (raw) {
        if (( true) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(raw)) {
            warn(`invalid props options`, raw);
        }
        for (const key in raw) {
            const normalizedKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key);
            if (validatePropName(normalizedKey)) {
                const opt = raw[key];
                const prop = (normalized[normalizedKey] =
                    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opt) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt) ? { type: opt } : Object.assign({}, opt));
                if (prop) {
                    const booleanIndex = getTypeIndex(Boolean, prop.type);
                    const stringIndex = getTypeIndex(String, prop.type);
                    prop[0 /* BooleanFlags.shouldCast */] = booleanIndex > -1;
                    prop[1 /* BooleanFlags.shouldCastTrue */] =
                        stringIndex < 0 || booleanIndex < stringIndex;
                    // if the prop needs boolean casting or default value
                    if (booleanIndex > -1 || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(prop, 'default')) {
                        needCastKeys.push(normalizedKey);
                    }
                }
            }
        }
    }
    const res = [normalized, needCastKeys];
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(comp)) {
        cache.set(comp, res);
    }
    return res;
}
function validatePropName(key) {
    if (key[0] !== '$') {
        return true;
    }
    else if ((true)) {
        warn(`Invalid prop name: "${key}" is a reserved property.`);
    }
    return false;
}
// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
    const match = ctor && ctor.toString().match(/^\s*(function|class) (\w+)/);
    return match ? match[2] : ctor === null ? 'null' : '';
}
function isSameType(a, b) {
    return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(expectedTypes)) {
        return expectedTypes.findIndex(t => isSameType(t, type));
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(expectedTypes)) {
        return isSameType(expectedTypes, type) ? 0 : -1;
    }
    return -1;
}
/**
 * dev only
 */
function validateProps(rawProps, props, instance) {
    const resolvedValues = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(props);
    const options = instance.propsOptions[0];
    for (const key in options) {
        let opt = options[key];
        if (opt == null)
            continue;
        validateProp(key, resolvedValues[key], opt, !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, key) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(rawProps, (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key)));
    }
}
/**
 * dev only
 */
function validateProp(name, value, prop, isAbsent) {
    const { type, required, validator } = prop;
    // required!
    if (required && isAbsent) {
        warn('Missing required prop: "' + name + '"');
        return;
    }
    // missing but optional
    if (value == null && !prop.required) {
        return;
    }
    // type check
    if (type != null && type !== true) {
        let isValid = false;
        const types = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(type) ? type : [type];
        const expectedTypes = [];
        // value is valid as long as one of the specified types match
        for (let i = 0; i < types.length && !isValid; i++) {
            const { valid, expectedType } = assertType(value, types[i]);
            expectedTypes.push(expectedType || '');
            isValid = valid;
        }
        if (!isValid) {
            warn(getInvalidTypeMessage(name, value, expectedTypes));
            return;
        }
    }
    // custom validator
    if (validator && !validator(value)) {
        warn('Invalid prop: custom validator check failed for prop "' + name + '".');
    }
}
const isSimpleType = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.makeMap)('String,Number,Boolean,Function,Symbol,BigInt');
/**
 * dev only
 */
function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (isSimpleType(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();
        // for primitive wrapper objects
        if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    }
    else if (expectedType === 'Object') {
        valid = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(value);
    }
    else if (expectedType === 'Array') {
        valid = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value);
    }
    else if (expectedType === 'null') {
        valid = value === null;
    }
    else {
        valid = value instanceof type;
    }
    return {
        valid,
        expectedType
    };
}
/**
 * dev only
 */
function getInvalidTypeMessage(name, value, expectedTypes) {
    let message = `Invalid prop: type check failed for prop "${name}".` +
        ` Expected ${expectedTypes.map(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize).join(' | ')}`;
    const expectedType = expectedTypes[0];
    const receivedType = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toRawType)(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    // check if we need to specify expected value
    if (expectedTypes.length === 1 &&
        isExplicable(expectedType) &&
        !isBoolean(expectedType, receivedType)) {
        message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
        message += `with value ${receivedValue}.`;
    }
    return message;
}
/**
 * dev only
 */
function styleValue(value, type) {
    if (type === 'String') {
        return `"${value}"`;
    }
    else if (type === 'Number') {
        return `${Number(value)}`;
    }
    else {
        return `${value}`;
    }
}
/**
 * dev only
 */
function isExplicable(type) {
    const explicitTypes = ['string', 'number', 'boolean'];
    return explicitTypes.some(elem => type.toLowerCase() === elem);
}
/**
 * dev only
 */
function isBoolean(...args) {
    return args.some(elem => elem.toLowerCase() === 'boolean');
}

const isInternalKey = (key) => key[0] === '_' || key === '$stable';
const normalizeSlotValue = (value) => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)
    ? value.map(normalizeVNode)
    : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
    if (rawSlot._n) {
        // already normalized - #5353
        return rawSlot;
    }
    const normalized = withCtx((...args) => {
        if (( true) && currentInstance) {
            warn(`Slot "${key}" invoked outside of the render function: ` +
                `this will not track dependencies used in the slot. ` +
                `Invoke the slot function inside the render function instead.`);
        }
        return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx = rawSlots._ctx;
    for (const key in rawSlots) {
        if (isInternalKey(key))
            continue;
        const value = rawSlots[key];
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) {
            slots[key] = normalizeSlot(key, value, ctx);
        }
        else if (value != null) {
            if (true) {
                warn(`Non-function value encountered for slot "${key}". ` +
                    `Prefer function slots for better performance.`);
            }
            const normalized = normalizeSlotValue(value);
            slots[key] = () => normalized;
        }
    }
};
const normalizeVNodeSlots = (instance, children) => {
    if (( true) &&
        !isKeepAlive(instance.vnode) &&
        !(false )) {
        warn(`Non-function value encountered for default slot. ` +
            `Prefer function slots for better performance.`);
    }
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
    if (instance.vnode.shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // users can get the shallow readonly version of the slots object through `this.$slots`,
            // we should avoid the proxy object polluting the slots of the internal instance
            instance.slots = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(children);
            // make compiler marker non-enumerable
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(children, '_', type);
        }
        else {
            normalizeObjectSlots(children, (instance.slots = {}));
        }
    }
    else {
        instance.slots = {};
        if (children) {
            normalizeVNodeSlots(instance, children);
        }
    }
    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.def)(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
    if (vnode.shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // compiled slots.
            if (( true) && isHmrUpdating) {
                // Parent was HMR updated so slot content may have changed.
                // force update slots and mark instance for hmr as well
                (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(slots, children);
            }
            else if (optimized && type === 1 /* SlotFlags.STABLE */) {
                // compiled AND stable.
                // no need to update, and skip stale slots removal.
                needDeletionCheck = false;
            }
            else {
                // compiled but dynamic (v-if/v-for on slots) - update slots, but skip
                // normalization.
                (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(slots, children);
                // #2893
                // when rendering the optimized slots by manually written render function,
                // we need to delete the `slots._` flag if necessary to make subsequent updates reliable,
                // i.e. let the `renderSlot` create the bailed Fragment
                if (!optimized && type === 1 /* SlotFlags.STABLE */) {
                    delete slots._;
                }
            }
        }
        else {
            needDeletionCheck = !children.$stable;
            normalizeObjectSlots(children, slots);
        }
        deletionComparisonTarget = children;
    }
    else if (children) {
        // non slot object children (direct value) passed to a component
        normalizeVNodeSlots(instance, children);
        deletionComparisonTarget = { default: 1 };
    }
    // delete stale slots
    if (needDeletionCheck) {
        for (const key in slots) {
            if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
                delete slots[key];
            }
        }
    }
};

function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: undefined,
            warnHandler: undefined,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap()
    };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(rootComponent)) {
            rootComponent = Object.assign({}, rootComponent);
        }
        if (rootProps != null && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(rootProps)) {
            ( true) && warn(`root props passed to app.mount() must be an object.`);
            rootProps = null;
        }
        const context = createAppContext();
        const installedPlugins = new Set();
        let isMounted = false;
        const app = (context.app = {
            _uid: uid$1++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            _instance: null,
            version,
            get config() {
                return context.config;
            },
            set config(v) {
                if ((true)) {
                    warn(`app.config cannot be replaced. Modify individual options instead.`);
                }
            },
            use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                    ( true) && warn(`Plugin has already been applied to target app.`);
                }
                else if (plugin && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                }
                else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                else if ((true)) {
                    warn(`A plugin must either be a function or an object with an "install" ` +
                        `function.`);
                }
                return app;
            },
            mixin(mixin) {
                if (true) {
                    if (!context.mixins.includes(mixin)) {
                        context.mixins.push(mixin);
                    }
                    else if ((true)) {
                        warn('Mixin has already been applied to target app' +
                            (mixin.name ? `: ${mixin.name}` : ''));
                    }
                }
                else {}
                return app;
            },
            component(name, component) {
                if ((true)) {
                    validateComponentName(name, context.config);
                }
                if (!component) {
                    return context.components[name];
                }
                if (( true) && context.components[name]) {
                    warn(`Component "${name}" has already been registered in target app.`);
                }
                context.components[name] = component;
                return app;
            },
            directive(name, directive) {
                if ((true)) {
                    validateDirectiveName(name);
                }
                if (!directive) {
                    return context.directives[name];
                }
                if (( true) && context.directives[name]) {
                    warn(`Directive "${name}" has already been registered in target app.`);
                }
                context.directives[name] = directive;
                return app;
            },
            mount(rootContainer, isHydrate, isSVG) {
                if (!isMounted) {
                    // #5571
                    if (( true) && rootContainer.__vue_app__) {
                        warn(`There is already an app instance mounted on the host container.\n` +
                            ` If you want to mount another app on the same host container,` +
                            ` you need to unmount the previous app by calling \`app.unmount()\` first.`);
                    }
                    const vnode = createVNode(rootComponent, rootProps);
                    // store app context on the root VNode.
                    // this will be set on the root instance on initial mount.
                    vnode.appContext = context;
                    // HMR root reload
                    if ((true)) {
                        context.reload = () => {
                            render(cloneVNode(vnode), rootContainer, isSVG);
                        };
                    }
                    if (isHydrate && hydrate) {
                        hydrate(vnode, rootContainer);
                    }
                    else {
                        render(vnode, rootContainer, isSVG);
                    }
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    if (true) {
                        app._instance = vnode.component;
                        devtoolsInitApp(app, version);
                    }
                    return getExposeProxy(vnode.component) || vnode.component.proxy;
                }
                else if ((true)) {
                    warn(`App has already been mounted.\n` +
                        `If you want to remount the same app, move your app creation logic ` +
                        `into a factory function and create fresh app instances for each ` +
                        `mount - e.g. \`const createMyApp = () => createApp(App)\``);
                }
            },
            unmount() {
                if (isMounted) {
                    render(null, app._container);
                    if (true) {
                        app._instance = null;
                        devtoolsUnmountApp(app);
                    }
                    delete app._container.__vue_app__;
                }
                else if ((true)) {
                    warn(`Cannot unmount an app that is not mounted.`);
                }
            },
            provide(key, value) {
                if (( true) && key in context.provides) {
                    warn(`App already provides property with key "${String(key)}". ` +
                        `It will be overwritten with the new value.`);
                }
                context.provides[key] = value;
                return app;
            }
        });
        return app;
    };
}

/**
 * Function for handling a template ref
 */
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(rawRef)) {
        rawRef.forEach((r, i) => setRef(r, oldRawRef && ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
        return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
        // when mounting async components, nothing needs to be done,
        // because the template ref is forwarded to inner component
        return;
    }
    const refValue = vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */
        ? getExposeProxy(vnode.component) || vnode.component.proxy
        : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref } = rawRef;
    if (( true) && !owner) {
        warn(`Missing ref owner context. ref cannot be used on hoisted vnodes. ` +
            `A vnode with ref must be created inside the render function.`);
        return;
    }
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ ? (owner.refs = {}) : owner.refs;
    const setupState = owner.setupState;
    // dynamic ref changed. unset old ref
    if (oldRef != null && oldRef !== ref) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(oldRef)) {
            refs[oldRef] = null;
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, oldRef)) {
                setupState[oldRef] = null;
            }
        }
        else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(oldRef)) {
            oldRef.value = null;
        }
    }
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(ref)) {
        callWithErrorHandling(ref, owner, 12 /* ErrorCodes.FUNCTION_REF */, [value, refs]);
    }
    else {
        const _isString = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(ref);
        const _isRef = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(ref);
        if (_isString || _isRef) {
            const doSet = () => {
                if (rawRef.f) {
                    const existing = _isString
                        ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref)
                            ? setupState[ref]
                            : refs[ref]
                        : ref.value;
                    if (isUnmount) {
                        (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.remove)(existing, refValue);
                    }
                    else {
                        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing)) {
                            if (_isString) {
                                refs[ref] = [refValue];
                                if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref)) {
                                    setupState[ref] = refs[ref];
                                }
                            }
                            else {
                                ref.value = [refValue];
                                if (rawRef.k)
                                    refs[rawRef.k] = ref.value;
                            }
                        }
                        else if (!existing.includes(refValue)) {
                            existing.push(refValue);
                        }
                    }
                }
                else if (_isString) {
                    refs[ref] = value;
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasOwn)(setupState, ref)) {
                        setupState[ref] = value;
                    }
                }
                else if (_isRef) {
                    ref.value = value;
                    if (rawRef.k)
                        refs[rawRef.k] = value;
                }
                else if ((true)) {
                    warn('Invalid template ref type:', ref, `(${typeof ref})`);
                }
            };
            if (value) {
                doSet.id = -1;
                queuePostRenderEffect(doSet, parentSuspense);
            }
            else {
                doSet();
            }
        }
        else if ((true)) {
            warn('Invalid template ref type:', ref, `(${typeof ref})`);
        }
    }
}

let hasMismatch = false;
const isSVGContainer = (container) => /svg/.test(container.namespaceURI) && container.tagName !== 'foreignObject';
const isComment = (node) => node.nodeType === 8 /* DOMNodeTypes.COMMENT */;
// Note: hydration is DOM-specific
// But we have to place it in core due to tight coupling with core - splitting
// it out creates a ton of unnecessary complexity.
// Hydration also depends on some renderer internal logic which needs to be
// passed in via arguments.
function createHydrationFunctions(rendererInternals) {
    const { mt: mountComponent, p: patch, o: { patchProp, createText, nextSibling, parentNode, remove, insert, createComment } } = rendererInternals;
    const hydrate = (vnode, container) => {
        if (!container.hasChildNodes()) {
            ( true) &&
                warn(`Attempting to hydrate existing markup but container is empty. ` +
                    `Performing full mount instead.`);
            patch(null, vnode, container);
            flushPostFlushCbs();
            container._vnode = vnode;
            return;
        }
        hasMismatch = false;
        hydrateNode(container.firstChild, vnode, null, null, null);
        flushPostFlushCbs();
        container._vnode = vnode;
        if (hasMismatch && !false) {
            // this error should show up in production
            console.error(`Hydration completed but contains mismatches.`);
        }
    };
    const hydrateNode = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false) => {
        const isFragmentStart = isComment(node) && node.data === '[';
        const onMismatch = () => handleMismatch(node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragmentStart);
        const { type, ref, shapeFlag, patchFlag } = vnode;
        let domType = node.nodeType;
        vnode.el = node;
        if (patchFlag === -2 /* PatchFlags.BAIL */) {
            optimized = false;
            vnode.dynamicChildren = null;
        }
        let nextNode = null;
        switch (type) {
            case Text:
                if (domType !== 3 /* DOMNodeTypes.TEXT */) {
                    // #5728 empty text node inside a slot can cause hydration failure
                    // because the server rendered HTML won't contain a text node
                    if (vnode.children === '') {
                        insert((vnode.el = createText('')), parentNode(node), node);
                        nextNode = node;
                    }
                    else {
                        nextNode = onMismatch();
                    }
                }
                else {
                    if (node.data !== vnode.children) {
                        hasMismatch = true;
                        ( true) &&
                            warn(`Hydration text mismatch:` +
                                `\n- Client: ${JSON.stringify(node.data)}` +
                                `\n- Server: ${JSON.stringify(vnode.children)}`);
                        node.data = vnode.children;
                    }
                    nextNode = nextSibling(node);
                }
                break;
            case Comment:
                if (domType !== 8 /* DOMNodeTypes.COMMENT */ || isFragmentStart) {
                    nextNode = onMismatch();
                }
                else {
                    nextNode = nextSibling(node);
                }
                break;
            case Static:
                if (isFragmentStart) {
                    // entire template is static but SSRed as a fragment
                    node = nextSibling(node);
                    domType = node.nodeType;
                }
                if (domType === 1 /* DOMNodeTypes.ELEMENT */ || domType === 3 /* DOMNodeTypes.TEXT */) {
                    // determine anchor, adopt content
                    nextNode = node;
                    // if the static vnode has its content stripped during build,
                    // adopt it from the server-rendered HTML.
                    const needToAdoptContent = !vnode.children.length;
                    for (let i = 0; i < vnode.staticCount; i++) {
                        if (needToAdoptContent)
                            vnode.children +=
                                nextNode.nodeType === 1 /* DOMNodeTypes.ELEMENT */
                                    ? nextNode.outerHTML
                                    : nextNode.data;
                        if (i === vnode.staticCount - 1) {
                            vnode.anchor = nextNode;
                        }
                        nextNode = nextSibling(nextNode);
                    }
                    return isFragmentStart ? nextSibling(nextNode) : nextNode;
                }
                else {
                    onMismatch();
                }
                break;
            case Fragment:
                if (!isFragmentStart) {
                    nextNode = onMismatch();
                }
                else {
                    nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
                }
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    if (domType !== 1 /* DOMNodeTypes.ELEMENT */ ||
                        vnode.type.toLowerCase() !==
                            node.tagName.toLowerCase()) {
                        nextNode = onMismatch();
                    }
                    else {
                        nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
                    }
                }
                else if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                    // when setting up the render effect, if the initial vnode already
                    // has .el set, the component will perform hydration instead of mount
                    // on its sub-tree.
                    vnode.slotScopeIds = slotScopeIds;
                    const container = parentNode(node);
                    mountComponent(vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), optimized);
                    // component may be async, so in the case of fragments we cannot rely
                    // on component's rendered output to determine the end of the fragment
                    // instead, we do a lookahead to find the end anchor node.
                    nextNode = isFragmentStart
                        ? locateClosingAsyncAnchor(node)
                        : nextSibling(node);
                    // #4293 teleport as component root
                    if (nextNode &&
                        isComment(nextNode) &&
                        nextNode.data === 'teleport end') {
                        nextNode = nextSibling(nextNode);
                    }
                    // #3787
                    // if component is async, it may get moved / unmounted before its
                    // inner component is loaded, so we need to give it a placeholder
                    // vnode that matches its adopted DOM.
                    if (isAsyncWrapper(vnode)) {
                        let subTree;
                        if (isFragmentStart) {
                            subTree = createVNode(Fragment);
                            subTree.anchor = nextNode
                                ? nextNode.previousSibling
                                : container.lastChild;
                        }
                        else {
                            subTree =
                                node.nodeType === 3 ? createTextVNode('') : createVNode('div');
                        }
                        subTree.el = node;
                        vnode.component.subTree = subTree;
                    }
                }
                else if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
                    if (domType !== 8 /* DOMNodeTypes.COMMENT */) {
                        nextNode = onMismatch();
                    }
                    else {
                        nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, rendererInternals, hydrateChildren);
                    }
                }
                else if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                    nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, isSVGContainer(parentNode(node)), slotScopeIds, optimized, rendererInternals, hydrateNode);
                }
                else if ((true)) {
                    warn('Invalid HostVNode type:', type, `(${typeof type})`);
                }
        }
        if (ref != null) {
            setRef(ref, null, parentSuspense, vnode);
        }
        return nextNode;
    };
    const hydrateElement = (el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
        optimized = optimized || !!vnode.dynamicChildren;
        const { type, props, patchFlag, shapeFlag, dirs } = vnode;
        // #4006 for form elements with non-string v-model value bindings
        // e.g. <option :value="obj">, <input type="checkbox" :true-value="1">
        const forcePatchValue = (type === 'input' && dirs) || type === 'option';
        // skip props & children if this is hoisted static nodes
        // #5405 in dev, always hydrate children for HMR
        if (true /* PatchFlags.HOISTED */) {
            if (dirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'created');
            }
            // props
            if (props) {
                if (forcePatchValue ||
                    !optimized ||
                    patchFlag & (16 /* PatchFlags.FULL_PROPS */ | 32 /* PatchFlags.HYDRATE_EVENTS */)) {
                    for (const key in props) {
                        if ((forcePatchValue && key.endsWith('value')) ||
                            ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key))) {
                            patchProp(el, key, null, props[key], false, undefined, parentComponent);
                        }
                    }
                }
                else if (props.onClick) {
                    // Fast path for click listeners (which is most often) to avoid
                    // iterating through props.
                    patchProp(el, 'onClick', null, props.onClick, false, undefined, parentComponent);
                }
            }
            // vnode / directive hooks
            let vnodeHooks;
            if ((vnodeHooks = props && props.onVnodeBeforeMount)) {
                invokeVNodeHook(vnodeHooks, parentComponent, vnode);
            }
            if (dirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount');
            }
            if ((vnodeHooks = props && props.onVnodeMounted) || dirs) {
                queueEffectWithSuspense(() => {
                    vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
                    dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted');
                }, parentSuspense);
            }
            // children
            if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */ &&
                // skip if element has innerHTML / textContent
                !(props && (props.innerHTML || props.textContent))) {
                let next = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense, slotScopeIds, optimized);
                let hasWarned = false;
                while (next) {
                    hasMismatch = true;
                    if (( true) && !hasWarned) {
                        warn(`Hydration children mismatch in <${vnode.type}>: ` +
                            `server rendered element contains more child nodes than client vdom.`);
                        hasWarned = true;
                    }
                    // The SSRed DOM contains more nodes than it should. Remove them.
                    const cur = next;
                    next = next.nextSibling;
                    remove(cur);
                }
            }
            else if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                if (el.textContent !== vnode.children) {
                    hasMismatch = true;
                    ( true) &&
                        warn(`Hydration text content mismatch in <${vnode.type}>:\n` +
                            `- Client: ${el.textContent}\n` +
                            `- Server: ${vnode.children}`);
                    el.textContent = vnode.children;
                }
            }
        }
        return el.nextSibling;
    };
    const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized) => {
        optimized = optimized || !!parentVNode.dynamicChildren;
        const children = parentVNode.children;
        const l = children.length;
        let hasWarned = false;
        for (let i = 0; i < l; i++) {
            const vnode = optimized
                ? children[i]
                : (children[i] = normalizeVNode(children[i]));
            if (node) {
                node = hydrateNode(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
            }
            else if (vnode.type === Text && !vnode.children) {
                continue;
            }
            else {
                hasMismatch = true;
                if (( true) && !hasWarned) {
                    warn(`Hydration children mismatch in <${container.tagName.toLowerCase()}>: ` +
                        `server rendered element contains fewer child nodes than client vdom.`);
                    hasWarned = true;
                }
                // the SSRed DOM didn't contain enough nodes. Mount the missing ones.
                patch(null, vnode, container, null, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
            }
        }
        return node;
    };
    const hydrateFragment = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
        const { slotScopeIds: fragmentSlotScopeIds } = vnode;
        if (fragmentSlotScopeIds) {
            slotScopeIds = slotScopeIds
                ? slotScopeIds.concat(fragmentSlotScopeIds)
                : fragmentSlotScopeIds;
        }
        const container = parentNode(node);
        const next = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense, slotScopeIds, optimized);
        if (next && isComment(next) && next.data === ']') {
            return nextSibling((vnode.anchor = next));
        }
        else {
            // fragment didn't hydrate successfully, since we didn't get a end anchor
            // back. This should have led to node/children mismatch warnings.
            hasMismatch = true;
            // since the anchor is missing, we need to create one and insert it
            insert((vnode.anchor = createComment(`]`)), container, next);
            return next;
        }
    };
    const handleMismatch = (node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment) => {
        hasMismatch = true;
        ( true) &&
            warn(`Hydration node mismatch:\n- Client vnode:`, vnode.type, `\n- Server rendered DOM:`, node, node.nodeType === 3 /* DOMNodeTypes.TEXT */
                ? `(text)`
                : isComment(node) && node.data === '['
                    ? `(start of fragment)`
                    : ``);
        vnode.el = null;
        if (isFragment) {
            // remove excessive fragment nodes
            const end = locateClosingAsyncAnchor(node);
            while (true) {
                const next = nextSibling(node);
                if (next && next !== end) {
                    remove(next);
                }
                else {
                    break;
                }
            }
        }
        const next = nextSibling(node);
        const container = parentNode(node);
        remove(node);
        patch(null, vnode, container, next, parentComponent, parentSuspense, isSVGContainer(container), slotScopeIds);
        return next;
    };
    const locateClosingAsyncAnchor = (node) => {
        let match = 0;
        while (node) {
            node = nextSibling(node);
            if (node && isComment(node)) {
                if (node.data === '[')
                    match++;
                if (node.data === ']') {
                    if (match === 0) {
                        return nextSibling(node);
                    }
                    else {
                        match--;
                    }
                }
            }
        }
        return node;
    };
    return [hydrate, hydrateNode];
}

/* eslint-disable no-restricted-globals */
let supported;
let perf;
function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        perf.mark(`vue-${type}-${instance.uid}`);
    }
    if (true) {
        devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        const startTag = `vue-${type}-${instance.uid}`;
        const endTag = startTag + `:end`;
        perf.mark(endTag);
        perf.measure(`<${formatComponentName(instance, instance.type)}> ${type}`, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
    }
    if (true) {
        devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function isSupported() {
    if (supported !== undefined) {
        return supported;
    }
    if (typeof window !== 'undefined' && window.performance) {
        supported = true;
        perf = window.performance;
    }
    else {
        supported = false;
    }
    return supported;
}

/**
 * This is only called in esm-bundler builds.
 * It is called when a renderer is created, in `baseCreateRenderer` so that
 * importing runtime-core is side-effects free.
 *
 * istanbul-ignore-next
 */
function initFeatureFlags() {
    const needWarn = [];
    if (false) {}
    if (false) {}
    if (( true) && needWarn.length) {
        const multi = needWarn.length > 1;
        console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(', ')} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, ` +
            `which expects these compile-time feature flags to be globally injected ` +
            `via the bundler config in order to get better tree-shaking in the ` +
            `production bundle.\n\n` +
            `For more details, see https://link.vuejs.org/feature-flags.`);
    }
}

const queuePostRenderEffect = queueEffectWithSuspense
    ;
/**
 * The createRenderer function accepts two generic arguments:
 * HostNode and HostElement, corresponding to Node and Element types in the
 * host environment. For example, for runtime-dom, HostNode would be the DOM
 * `Node` interface and HostElement would be the DOM `Element` interface.
 *
 * Custom renderers can pass in the platform specific types like this:
 *
 * ``` js
 * const { render, createApp } = createRenderer<Node, Element>({
 *   patchProp,
 *   ...nodeOps
 * })
 * ```
 */
function createRenderer(options) {
    return baseCreateRenderer(options);
}
// Separate API for creating hydration-enabled renderer.
// Hydration logic is only used when calling this function, making it
// tree-shakable.
function createHydrationRenderer(options) {
    return baseCreateRenderer(options, createHydrationFunctions);
}
// implementation
function baseCreateRenderer(options, createHydrationFns) {
    // compile-time feature flags check
    {
        initFeatureFlags();
    }
    const target = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.getGlobalThis)();
    target.__VUE__ = true;
    if (true) {
        setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    }
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP, insertStaticContent: hostInsertStaticContent } = options;
    // Note: functions inside this closure should use `const xxx = () => {}`
    // style in order to prevent being inlined by minifiers.
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = ( true) && isHmrUpdating ? false : !!n2.dynamicChildren) => {
        if (n1 === n2) {
            return;
        }
        // patching & not same type, unmount old tree
        if (n1 && !isSameVNodeType(n1, n2)) {
            anchor = getNextHostNode(n1);
            unmount(n1, parentComponent, parentSuspense, true);
            n1 = null;
        }
        if (n2.patchFlag === -2 /* PatchFlags.BAIL */) {
            optimized = false;
            n2.dynamicChildren = null;
        }
        const { type, ref, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Comment:
                processCommentNode(n1, n2, container, anchor);
                break;
            case Static:
                if (n1 == null) {
                    mountStaticNode(n2, container, anchor, isSVG);
                }
                else if ((true)) {
                    patchStaticNode(n1, n2, container, isSVG);
                }
                break;
            case Fragment:
                processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                    processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else if ((true)) {
                    warn('Invalid VNode type:', type, `(${typeof type})`);
                }
        }
        // set ref
        if (ref != null && parentComponent) {
            setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
        }
    };
    const processText = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
        }
        else {
            const el = (n2.el = n1.el);
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children);
            }
        }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateComment(n2.children || '')), container, anchor);
        }
        else {
            // there's no support for dynamic comments
            n2.el = n1.el;
        }
    };
    const mountStaticNode = (n2, container, anchor, isSVG) => {
        [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
    };
    /**
     * Dev / HMR only
     */
    const patchStaticNode = (n1, n2, container, isSVG) => {
        // static nodes are only patched during dev for HMR
        if (n2.children !== n1.children) {
            const anchor = hostNextSibling(n1.anchor);
            // remove existing
            removeStaticNode(n1);
            [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG);
        }
        else {
            n2.el = n1.el;
            n2.anchor = n1.anchor;
        }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostInsert(el, container, nextSibling);
            el = next;
        }
        hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostRemove(el);
            el = next;
        }
        hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        isSVG = isSVG || n2.type === 'svg';
        if (n1 == null) {
            mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let el;
        let vnodeHook;
        const { type, props, shapeFlag, transition, dirs } = vnode;
        el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
        // mount children first, since some props may rely on child content
        // being already rendered, e.g. `<select value>`
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            hostSetElementText(el, vnode.children);
        }
        else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', slotScopeIds, optimized);
        }
        if (dirs) {
            invokeDirectiveHook(vnode, null, parentComponent, 'created');
        }
        // scopeId
        setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
        // props
        if (props) {
            for (const key in props) {
                if (key !== 'value' && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key)) {
                    hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                }
            }
            /**
             * Special case for setting value on DOM elements:
             * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
             * - it needs to be forced (#1471)
             * #2353 proposes adding another renderer option to configure this, but
             * the properties affects are so finite it is worth special casing it
             * here to reduce the complexity. (Special casing it also should not
             * affect non-DOM renderers)
             */
            if ('value' in props) {
                hostPatchProp(el, 'value', null, props.value);
            }
            if ((vnodeHook = props.onVnodeBeforeMount)) {
                invokeVNodeHook(vnodeHook, parentComponent, vnode);
            }
        }
        if (true) {
            Object.defineProperty(el, '__vnode', {
                value: vnode,
                enumerable: false
            });
            Object.defineProperty(el, '__vueParentComponent', {
                value: parentComponent,
                enumerable: false
            });
        }
        if (dirs) {
            invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount');
        }
        // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
        // #1689 For inside suspense + suspense resolved case, just call it
        const needCallTransitionHooks = (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
            transition &&
            !transition.persisted;
        if (needCallTransitionHooks) {
            transition.beforeEnter(el);
        }
        hostInsert(el, container, anchor);
        if ((vnodeHook = props && props.onVnodeMounted) ||
            needCallTransitionHooks ||
            dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                needCallTransitionHooks && transition.enter(el);
                dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted');
            }, parentSuspense);
        }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
        if (scopeId) {
            hostSetScopeId(el, scopeId);
        }
        if (slotScopeIds) {
            for (let i = 0; i < slotScopeIds.length; i++) {
                hostSetScopeId(el, slotScopeIds[i]);
            }
        }
        if (parentComponent) {
            let subTree = parentComponent.subTree;
            if (( true) &&
                subTree.patchFlag > 0 &&
                subTree.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */) {
                subTree =
                    filterSingleRoot(subTree.children) || subTree;
            }
            if (vnode === subTree) {
                const parentVNode = parentComponent.vnode;
                setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
            }
        }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
        for (let i = start; i < children.length; i++) {
            const child = (children[i] = optimized
                ? cloneIfMounted(children[i])
                : normalizeVNode(children[i]));
            patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const el = (n2.el = n1.el);
        let { patchFlag, dynamicChildren, dirs } = n2;
        // #1426 take the old vnode's patch flag into account since user may clone a
        // compiler-generated vnode, which de-opts to FULL_PROPS
        patchFlag |= n1.patchFlag & 16 /* PatchFlags.FULL_PROPS */;
        const oldProps = n1.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        const newProps = n2.props || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        let vnodeHook;
        // disable recurse in beforeUpdate hooks
        parentComponent && toggleRecurse(parentComponent, false);
        if ((vnodeHook = newProps.onVnodeBeforeUpdate)) {
            invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        }
        if (dirs) {
            invokeDirectiveHook(n2, n1, parentComponent, 'beforeUpdate');
        }
        parentComponent && toggleRecurse(parentComponent, true);
        if (( true) && isHmrUpdating) {
            // HMR updated, force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
        if (dynamicChildren) {
            patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
            if (( true) && parentComponent && parentComponent.type.__hmrId) {
                traverseStaticChildren(n1, n2);
            }
        }
        else if (!optimized) {
            // full diff
            patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
        }
        if (patchFlag > 0) {
            // the presence of a patchFlag means this element's render code was
            // generated by the compiler and can take the fast path.
            // in this path old node and new node are guaranteed to have the same shape
            // (i.e. at the exact same position in the source template)
            if (patchFlag & 16 /* PatchFlags.FULL_PROPS */) {
                // element props contain dynamic keys, full diff needed
                patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
            }
            else {
                // class
                // this flag is matched when the element has dynamic class bindings.
                if (patchFlag & 2 /* PatchFlags.CLASS */) {
                    if (oldProps.class !== newProps.class) {
                        hostPatchProp(el, 'class', null, newProps.class, isSVG);
                    }
                }
                // style
                // this flag is matched when the element has dynamic style bindings
                if (patchFlag & 4 /* PatchFlags.STYLE */) {
                    hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
                }
                // props
                // This flag is matched when the element has dynamic prop/attr bindings
                // other than class and style. The keys of dynamic prop/attrs are saved for
                // faster iteration.
                // Note dynamic keys like :[foo]="bar" will cause this optimization to
                // bail out and go through a full diff because we need to unset the old key
                if (patchFlag & 8 /* PatchFlags.PROPS */) {
                    // if the flag is present then dynamicProps must be non-null
                    const propsToUpdate = n2.dynamicProps;
                    for (let i = 0; i < propsToUpdate.length; i++) {
                        const key = propsToUpdate[i];
                        const prev = oldProps[key];
                        const next = newProps[key];
                        // #1471 force patch value
                        if (next !== prev || key === 'value') {
                            hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                }
            }
            // text
            // This flag is matched when the element has only dynamic text children.
            if (patchFlag & 1 /* PatchFlags.TEXT */) {
                if (n1.children !== n2.children) {
                    hostSetElementText(el, n2.children);
                }
            }
        }
        else if (!optimized && dynamicChildren == null) {
            // unoptimized, full diff
            patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
        }
        if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
                dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated');
            }, parentSuspense);
        }
    };
    // The fast path for blocks.
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
        for (let i = 0; i < newChildren.length; i++) {
            const oldVNode = oldChildren[i];
            const newVNode = newChildren[i];
            // Determine the container (parent element) for the patch.
            const container = 
            // oldVNode may be an errored async setup() component inside Suspense
            // which will not have a mounted element
            oldVNode.el &&
                // - In the case of a Fragment, we need to provide the actual parent
                // of the Fragment itself so it can move its children.
                (oldVNode.type === Fragment ||
                    // - In the case of different nodes, there is going to be a replacement
                    // which also requires the correct parent container
                    !isSameVNodeType(oldVNode, newVNode) ||
                    // - In the case of a component, it could contain anything.
                    oldVNode.shapeFlag & (6 /* ShapeFlags.COMPONENT */ | 64 /* ShapeFlags.TELEPORT */))
                ? hostParentNode(oldVNode.el)
                : // In other cases, the parent container is not actually used so we
                    // just pass the block element here to avoid a DOM parentNode call.
                    fallbackContainer;
            patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
        }
    };
    const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
        if (oldProps !== newProps) {
            if (oldProps !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key) && !(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
            }
            for (const key in newProps) {
                // empty string is not valid prop
                if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isReservedProp)(key))
                    continue;
                const next = newProps[key];
                const prev = oldProps[key];
                // defer patching value
                if (next !== prev && key !== 'value') {
                    hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                }
            }
            if ('value' in newProps) {
                hostPatchProp(el, 'value', oldProps.value, newProps.value);
            }
        }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''));
        const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''));
        let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
        if (( true) &&
            // #5523 dev root fragment may inherit directives
            (isHmrUpdating || patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */)) {
            // HMR updated / Dev root fragment (w/ comments), force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        // check if this is a slot fragment with :slotted scope ids
        if (fragmentSlotScopeIds) {
            slotScopeIds = slotScopeIds
                ? slotScopeIds.concat(fragmentSlotScopeIds)
                : fragmentSlotScopeIds;
        }
        if (n1 == null) {
            hostInsert(fragmentStartAnchor, container, anchor);
            hostInsert(fragmentEndAnchor, container, anchor);
            // a fragment can only have array children
            // since they are either generated by the compiler, or implicitly created
            // from arrays.
            mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            if (patchFlag > 0 &&
                patchFlag & 64 /* PatchFlags.STABLE_FRAGMENT */ &&
                dynamicChildren &&
                // #2715 the previous fragment could've been a BAILed one as a result
                // of renderSlot() with no valid children
                n1.dynamicChildren) {
                // a stable fragment (template root or <template v-for>) doesn't need to
                // patch children order, but it may contain dynamicChildren.
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
                if (( true) && parentComponent && parentComponent.type.__hmrId) {
                    traverseStaticChildren(n1, n2);
                }
                else if (
                // #2080 if the stable fragment has a key, it's a <template v-for> that may
                //  get moved around. Make sure all root level vnodes inherit el.
                // #2134 or if it's a component root, it may also get moved around
                // as the component is being moved.
                n2.key != null ||
                    (parentComponent && n2 === parentComponent.subTree)) {
                    traverseStaticChildren(n1, n2, true /* shallow */);
                }
            }
            else {
                // keyed / unkeyed, or manual fragments.
                // for keyed & unkeyed, since they are compiler generated from v-for,
                // each child is guaranteed to be a block so the fragment will never
                // have dynamicChildren.
                patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
        }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        n2.slotScopeIds = slotScopeIds;
        if (n1 == null) {
            if (n2.shapeFlag & 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */) {
                parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
            }
            else {
                mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
        }
        else {
            updateComponent(n1, n2, optimized);
        }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense));
        if (( true) && instance.type.__hmrId) {
            registerHMR(instance);
        }
        if ((true)) {
            pushWarningContext(initialVNode);
            startMeasure(instance, `mount`);
        }
        // inject renderer internals for keepAlive
        if (isKeepAlive(initialVNode)) {
            instance.ctx.renderer = internals;
        }
        // resolve props and slots for setup context
        {
            if ((true)) {
                startMeasure(instance, `init`);
            }
            setupComponent(instance);
            if ((true)) {
                endMeasure(instance, `init`);
            }
        }
        // setup() is async. This component relies on async logic to be resolved
        // before proceeding
        if (instance.asyncDep) {
            parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
            // Give it a placeholder if this is not hydration
            // TODO handle self-defined fallback
            if (!initialVNode.el) {
                const placeholder = (instance.subTree = createVNode(Comment));
                processCommentNode(null, placeholder, container, anchor);
            }
            return;
        }
        setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
        if ((true)) {
            popWarningContext();
            endMeasure(instance, `mount`);
        }
    };
    const updateComponent = (n1, n2, optimized) => {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2, optimized)) {
            if (instance.asyncDep &&
                !instance.asyncResolved) {
                // async & still pending - just update props and slots
                // since the component's reactive effect for render isn't set-up yet
                if ((true)) {
                    pushWarningContext(n2);
                }
                updateComponentPreRender(instance, n2, optimized);
                if ((true)) {
                    popWarningContext();
                }
                return;
            }
            else {
                // normal update
                instance.next = n2;
                // in case the child component is also queued, remove it to avoid
                // double updating the same child component in the same flush.
                invalidateJob(instance.update);
                // instance.update is the reactive effect.
                instance.update();
            }
        }
        else {
            // no update needed. just copy over properties
            n2.el = n1.el;
            instance.vnode = n2;
        }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                let vnodeHook;
                const { el, props } = initialVNode;
                const { bm, m, parent } = instance;
                const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
                toggleRecurse(instance, false);
                // beforeMount hook
                if (bm) {
                    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bm);
                }
                // onVnodeBeforeMount
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeBeforeMount)) {
                    invokeVNodeHook(vnodeHook, parent, initialVNode);
                }
                toggleRecurse(instance, true);
                if (el && hydrateNode) {
                    // vnode has adopted host node - perform hydration instead of mount.
                    const hydrateSubTree = () => {
                        if ((true)) {
                            startMeasure(instance, `render`);
                        }
                        instance.subTree = renderComponentRoot(instance);
                        if ((true)) {
                            endMeasure(instance, `render`);
                        }
                        if ((true)) {
                            startMeasure(instance, `hydrate`);
                        }
                        hydrateNode(el, instance.subTree, instance, parentSuspense, null);
                        if ((true)) {
                            endMeasure(instance, `hydrate`);
                        }
                    };
                    if (isAsyncWrapperVNode) {
                        initialVNode.type.__asyncLoader().then(
                        // note: we are moving the render call into an async callback,
                        // which means it won't track dependencies - but it's ok because
                        // a server-rendered async wrapper is already in resolved state
                        // and it will never need to change.
                        () => !instance.isUnmounted && hydrateSubTree());
                    }
                    else {
                        hydrateSubTree();
                    }
                }
                else {
                    if ((true)) {
                        startMeasure(instance, `render`);
                    }
                    const subTree = (instance.subTree = renderComponentRoot(instance));
                    if ((true)) {
                        endMeasure(instance, `render`);
                    }
                    if ((true)) {
                        startMeasure(instance, `patch`);
                    }
                    patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
                    if ((true)) {
                        endMeasure(instance, `patch`);
                    }
                    initialVNode.el = subTree.el;
                }
                // mounted hook
                if (m) {
                    queuePostRenderEffect(m, parentSuspense);
                }
                // onVnodeMounted
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeMounted)) {
                    const scopedInitialVNode = initialVNode;
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
                }
                // activated hook for keep-alive roots.
                // #1742 activated hook must be accessed after first render
                // since the hook may be injected by a child keep-alive
                if (initialVNode.shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */ ||
                    (parent &&
                        isAsyncWrapper(parent.vnode) &&
                        parent.vnode.shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */)) {
                    instance.a && queuePostRenderEffect(instance.a, parentSuspense);
                }
                instance.isMounted = true;
                if (true) {
                    devtoolsComponentAdded(instance);
                }
                // #2458: deference mount-only object parameters to prevent memleaks
                initialVNode = container = anchor = null;
            }
            else {
                // updateComponent
                // This is triggered by mutation of component's own state (next: null)
                // OR parent calling processComponent (next: VNode)
                let { next, bu, u, parent, vnode } = instance;
                let originNext = next;
                let vnodeHook;
                if ((true)) {
                    pushWarningContext(next || instance.vnode);
                }
                // Disallow component effect recursion during pre-lifecycle hooks.
                toggleRecurse(instance, false);
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next, optimized);
                }
                else {
                    next = vnode;
                }
                // beforeUpdate hook
                if (bu) {
                    (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bu);
                }
                // onVnodeBeforeUpdate
                if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
                    invokeVNodeHook(vnodeHook, parent, next, vnode);
                }
                toggleRecurse(instance, true);
                // render
                if ((true)) {
                    startMeasure(instance, `render`);
                }
                const nextTree = renderComponentRoot(instance);
                if ((true)) {
                    endMeasure(instance, `render`);
                }
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                if ((true)) {
                    startMeasure(instance, `patch`);
                }
                patch(prevTree, nextTree, 
                // parent may have changed if it's in a teleport
                hostParentNode(prevTree.el), 
                // anchor may have changed if it's in a fragment
                getNextHostNode(prevTree), instance, parentSuspense, isSVG);
                if ((true)) {
                    endMeasure(instance, `patch`);
                }
                next.el = nextTree.el;
                if (originNext === null) {
                    // self-triggered update. In case of HOC, update parent component
                    // vnode el. HOC is indicated by parent instance's subTree pointing
                    // to child component's vnode
                    updateHOCHostEl(instance, nextTree.el);
                }
                // updated hook
                if (u) {
                    queuePostRenderEffect(u, parentSuspense);
                }
                // onVnodeUpdated
                if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
                }
                if (true) {
                    devtoolsComponentUpdated(instance);
                }
                if ((true)) {
                    popWarningContext();
                }
            }
        };
        // create reactive effect for rendering
        const effect = (instance.effect = new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect(componentUpdateFn, () => queueJob(update), instance.scope // track it in component's effect scope
        ));
        const update = (instance.update = () => effect.run());
        update.id = instance.uid;
        // allowRecurse
        // #1801, #2043 component render effects should allow recursive updates
        toggleRecurse(instance, true);
        if ((true)) {
            effect.onTrack = instance.rtc
                ? e => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance.rtc, e)
                : void 0;
            effect.onTrigger = instance.rtg
                ? e => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(instance.rtg, e)
                : void 0;
            update.ownerInstance = instance;
        }
        update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
        nextVNode.component = instance;
        const prevProps = instance.vnode.props;
        instance.vnode = nextVNode;
        instance.next = null;
        updateProps(instance, nextVNode.props, prevProps, optimized);
        updateSlots(instance, nextVNode.children, optimized);
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        // props update may have triggered pre-flush watchers.
        // flush them before the render update.
        flushPreFlushCbs();
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
        const c1 = n1 && n1.children;
        const prevShapeFlag = n1 ? n1.shapeFlag : 0;
        const c2 = n2.children;
        const { patchFlag, shapeFlag } = n2;
        // fast path
        if (patchFlag > 0) {
            if (patchFlag & 128 /* PatchFlags.KEYED_FRAGMENT */) {
                // this could be either fully-keyed or mixed (some keyed some not)
                // presence of patchFlag means children are guaranteed to be arrays
                patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
            else if (patchFlag & 256 /* PatchFlags.UNKEYED_FRAGMENT */) {
                // unkeyed
                patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
        }
        // children has 3 possibilities: text, array or no children.
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            // text children fast path
            if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                unmountChildren(c1, parentComponent, parentSuspense);
            }
            if (c2 !== c1) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                // prev children was array
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    // two arrays, cannot assume anything, do full diff
                    patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else {
                    // no new children, just unmount old
                    unmountChildren(c1, parentComponent, parentSuspense, true);
                }
            }
            else {
                // prev children was text OR null
                // new children is array OR null
                if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                    hostSetElementText(container, '');
                }
                // mount new if array
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
            }
        }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        c1 = c1 || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
        c2 = c2 || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
        const oldLength = c1.length;
        const newLength = c2.length;
        const commonLength = Math.min(oldLength, newLength);
        let i;
        for (i = 0; i < commonLength; i++) {
            const nextChild = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        if (oldLength > newLength) {
            // remove old
            unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
        }
        else {
            // mount new
            mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
        }
    };
    // can be all-keyed or mixed
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1; // prev ending index
        let e2 = l2 - 1; // next ending index
        // 1. sync from start
        // (a b) c
        // (a b) d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            i++;
        }
        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = (c2[e2] = optimized
                ? cloneIfMounted(c2[e2])
                : normalizeVNode(c2[e2]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. common sequence + mount
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    i++;
                }
            }
        }
        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // a (b c)
        // (b c)
        // i = 0, e1 = 0, e2 = -1
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i], parentComponent, parentSuspense, true);
                i++;
            }
        }
        // 5. unknown sequence
        // [i ... e1 + 1]: a b [c d e] f g
        // [i ... e2 + 1]: a b [e d c h] f g
        // i = 2, e1 = 4, e2 = 5
        else {
            const s1 = i; // prev starting index
            const s2 = i; // next starting index
            // 5.1 build key:index map for newChildren
            const keyToNewIndexMap = new Map();
            for (i = s2; i <= e2; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (nextChild.key != null) {
                    if (( true) && keyToNewIndexMap.has(nextChild.key)) {
                        warn(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
                    }
                    keyToNewIndexMap.set(nextChild.key, i);
                }
            }
            // 5.2 loop through old children left to be patched and try to patch
            // matching nodes & remove nodes that are no longer present
            let j;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            // used to track whether any node has moved
            let maxNewIndexSoFar = 0;
            // works as Map<newIndex, oldIndex>
            // Note that oldIndex is offset by +1
            // and oldIndex = 0 is a special value indicating the new node has
            // no corresponding old node.
            // used for determining longest stable subsequence
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    // all new children have been patched so this can only be a removal
                    unmount(prevChild, parentComponent, parentSuspense, true);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // key-less node, try to locate a key-less node of the same type
                    for (j = s2; j <= e2; j++) {
                        if (newIndexToOldIndexMap[j - s2] === 0 &&
                            isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    unmount(prevChild, parentComponent, parentSuspense, true);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    patched++;
                }
            }
            // 5.3 move and mount
            // generate longest stable subsequence only when nodes have moved
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR;
            j = increasingNewIndexSequence.length - 1;
            // looping backwards so that we can use last patched node as anchor
            for (i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) {
                    // mount new
                    patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (moved) {
                    // move if:
                    // There is no stable subsequence (e.g. a reverse)
                    // OR current node is not among the stable sequence
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        move(nextChild, container, anchor, 2 /* MoveType.REORDER */);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
        const { el, type, transition, children, shapeFlag } = vnode;
        if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            move(vnode.component.subTree, container, anchor, moveType);
            return;
        }
        if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            vnode.suspense.move(container, anchor, moveType);
            return;
        }
        if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
            type.move(vnode, container, anchor, internals);
            return;
        }
        if (type === Fragment) {
            hostInsert(el, container, anchor);
            for (let i = 0; i < children.length; i++) {
                move(children[i], container, anchor, moveType);
            }
            hostInsert(vnode.anchor, container, anchor);
            return;
        }
        if (type === Static) {
            moveStaticNode(vnode, container, anchor);
            return;
        }
        // single nodes
        const needTransition = moveType !== 2 /* MoveType.REORDER */ &&
            shapeFlag & 1 /* ShapeFlags.ELEMENT */ &&
            transition;
        if (needTransition) {
            if (moveType === 0 /* MoveType.ENTER */) {
                transition.beforeEnter(el);
                hostInsert(el, container, anchor);
                queuePostRenderEffect(() => transition.enter(el), parentSuspense);
            }
            else {
                const { leave, delayLeave, afterLeave } = transition;
                const remove = () => hostInsert(el, container, anchor);
                const performLeave = () => {
                    leave(el, () => {
                        remove();
                        afterLeave && afterLeave();
                    });
                };
                if (delayLeave) {
                    delayLeave(el, remove, performLeave);
                }
                else {
                    performLeave();
                }
            }
        }
        else {
            hostInsert(el, container, anchor);
        }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
        const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
        // unset ref
        if (ref != null) {
            setRef(ref, null, parentSuspense, vnode, true);
        }
        if (shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */) {
            parentComponent.ctx.deactivate(vnode);
            return;
        }
        const shouldInvokeDirs = shapeFlag & 1 /* ShapeFlags.ELEMENT */ && dirs;
        const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
        let vnodeHook;
        if (shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeBeforeUnmount)) {
            invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
        if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            unmountComponent(vnode.component, parentSuspense, doRemove);
        }
        else {
            if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                vnode.suspense.unmount(parentSuspense, doRemove);
                return;
            }
            if (shouldInvokeDirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'beforeUnmount');
            }
            if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
                vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
            }
            else if (dynamicChildren &&
                // #1153: fast path should not be taken for non-stable (v-for) fragments
                (type !== Fragment ||
                    (patchFlag > 0 && patchFlag & 64 /* PatchFlags.STABLE_FRAGMENT */))) {
                // fast path for block nodes: only need to unmount dynamic children.
                unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
            }
            else if ((type === Fragment &&
                patchFlag &
                    (128 /* PatchFlags.KEYED_FRAGMENT */ | 256 /* PatchFlags.UNKEYED_FRAGMENT */)) ||
                (!optimized && shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */)) {
                unmountChildren(children, parentComponent, parentSuspense);
            }
            if (doRemove) {
                remove(vnode);
            }
        }
        if ((shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeUnmounted)) ||
            shouldInvokeDirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                shouldInvokeDirs &&
                    invokeDirectiveHook(vnode, null, parentComponent, 'unmounted');
            }, parentSuspense);
        }
    };
    const remove = vnode => {
        const { type, el, anchor, transition } = vnode;
        if (type === Fragment) {
            if (( true) &&
                vnode.patchFlag > 0 &&
                vnode.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */ &&
                transition &&
                !transition.persisted) {
                vnode.children.forEach(child => {
                    if (child.type === Comment) {
                        hostRemove(child.el);
                    }
                    else {
                        remove(child);
                    }
                });
            }
            else {
                removeFragment(el, anchor);
            }
            return;
        }
        if (type === Static) {
            removeStaticNode(vnode);
            return;
        }
        const performRemove = () => {
            hostRemove(el);
            if (transition && !transition.persisted && transition.afterLeave) {
                transition.afterLeave();
            }
        };
        if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */ &&
            transition &&
            !transition.persisted) {
            const { leave, delayLeave } = transition;
            const performLeave = () => leave(el, performRemove);
            if (delayLeave) {
                delayLeave(vnode.el, performRemove, performLeave);
            }
            else {
                performLeave();
            }
        }
        else {
            performRemove();
        }
    };
    const removeFragment = (cur, end) => {
        // For fragments, directly remove all contained DOM nodes.
        // (fragment child nodes cannot have transition)
        let next;
        while (cur !== end) {
            next = hostNextSibling(cur);
            hostRemove(cur);
            cur = next;
        }
        hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
        if (( true) && instance.type.__hmrId) {
            unregisterHMR(instance);
        }
        const { bum, scope, update, subTree, um } = instance;
        // beforeUnmount hook
        if (bum) {
            (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(bum);
        }
        // stop effects in component scope
        scope.stop();
        // update may be null if a component is unmounted before its async
        // setup has resolved.
        if (update) {
            // so that scheduler will no longer invoke it
            update.active = false;
            unmount(subTree, instance, parentSuspense, doRemove);
        }
        // unmounted hook
        if (um) {
            queuePostRenderEffect(um, parentSuspense);
        }
        queuePostRenderEffect(() => {
            instance.isUnmounted = true;
        }, parentSuspense);
        // A component with async dep inside a pending suspense is unmounted before
        // its async dep resolves. This should remove the dep from the suspense, and
        // cause the suspense to resolve immediately if that was the last dep.
        if (parentSuspense &&
            parentSuspense.pendingBranch &&
            !parentSuspense.isUnmounted &&
            instance.asyncDep &&
            !instance.asyncResolved &&
            instance.suspenseId === parentSuspense.pendingId) {
            parentSuspense.deps--;
            if (parentSuspense.deps === 0) {
                parentSuspense.resolve();
            }
        }
        if (true) {
            devtoolsComponentRemoved(instance);
        }
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
        for (let i = start; i < children.length; i++) {
            unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
        }
    };
    const getNextHostNode = vnode => {
        if (vnode.shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            return getNextHostNode(vnode.component.subTree);
        }
        if (vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            return vnode.suspense.next();
        }
        return hostNextSibling((vnode.anchor || vnode.el));
    };
    const render = (vnode, container, isSVG) => {
        if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode, null, null, true);
            }
        }
        else {
            patch(container._vnode || null, vnode, container, null, null, null, isSVG);
        }
        flushPreFlushCbs();
        flushPostFlushCbs();
        container._vnode = vnode;
    };
    const internals = {
        p: patch,
        um: unmount,
        m: move,
        r: remove,
        mt: mountComponent,
        mc: mountChildren,
        pc: patchChildren,
        pbc: patchBlockChildren,
        n: getNextHostNode,
        o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
        [hydrate, hydrateNode] = createHydrationFns(internals);
    }
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    };
}
function toggleRecurse({ effect, update }, allowed) {
    effect.allowRecurse = update.allowRecurse = allowed;
}
/**
 * #1156
 * When a component is HMR-enabled, we need to make sure that all static nodes
 * inside a block also inherit the DOM element from the previous tree so that
 * HMR updates (which are full updates) can retrieve the element for patching.
 *
 * #2080
 * Inside keyed `template` fragment static children, if a fragment is moved,
 * the children will always be moved. Therefore, in order to ensure correct move
 * position, el should be inherited from previous nodes.
 */
function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ch1) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ch2)) {
        for (let i = 0; i < ch1.length; i++) {
            // this is only called in the optimized path so array children are
            // guaranteed to be vnodes
            const c1 = ch1[i];
            let c2 = ch2[i];
            if (c2.shapeFlag & 1 /* ShapeFlags.ELEMENT */ && !c2.dynamicChildren) {
                if (c2.patchFlag <= 0 || c2.patchFlag === 32 /* PatchFlags.HYDRATE_EVENTS */) {
                    c2 = ch2[i] = cloneIfMounted(ch2[i]);
                    c2.el = c1.el;
                }
                if (!shallow)
                    traverseStaticChildren(c1, c2);
            }
            // #6852 also inherit for text nodes
            if (c2.type === Text) {
                c2.el = c1.el;
            }
            // also inherit for comment nodes, but not placeholders (e.g. v-if which
            // would have received .el during block patch)
            if (( true) && c2.type === Comment && !c2.el) {
                c2.el = c1.el;
            }
        }
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === '');
const isTargetSVG = (target) => typeof SVGElement !== 'undefined' && target instanceof SVGElement;
const resolveTarget = (props, select) => {
    const targetSelector = props && props.to;
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(targetSelector)) {
        if (!select) {
            ( true) &&
                warn(`Current renderer does not support string target for Teleports. ` +
                    `(missing querySelector renderer option)`);
            return null;
        }
        else {
            const target = select(targetSelector);
            if (!target) {
                ( true) &&
                    warn(`Failed to locate Teleport target with selector "${targetSelector}". ` +
                        `Note the target element must exist before the component is mounted - ` +
                        `i.e. the target cannot be rendered by the component itself, and ` +
                        `ideally should be outside of the entire Vue component tree.`);
            }
            return target;
        }
    }
    else {
        if (( true) && !targetSelector && !isTeleportDisabled(props)) {
            warn(`Invalid Teleport target: ${targetSelector}`);
        }
        return targetSelector;
    }
};
const TeleportImpl = {
    __isTeleport: true,
    process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals) {
        const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
        const disabled = isTeleportDisabled(n2.props);
        let { shapeFlag, children, dynamicChildren } = n2;
        // #3302
        // HMR updated, force full diff
        if (( true) && isHmrUpdating) {
            optimized = false;
            dynamicChildren = null;
        }
        if (n1 == null) {
            // insert anchors in the main view
            const placeholder = (n2.el = ( true)
                ? createComment('teleport start')
                : 0);
            const mainAnchor = (n2.anchor = ( true)
                ? createComment('teleport end')
                : 0);
            insert(placeholder, container, anchor);
            insert(mainAnchor, container, anchor);
            const target = (n2.target = resolveTarget(n2.props, querySelector));
            const targetAnchor = (n2.targetAnchor = createText(''));
            if (target) {
                insert(targetAnchor, target);
                // #2652 we could be teleporting from a non-SVG tree into an SVG tree
                isSVG = isSVG || isTargetSVG(target);
            }
            else if (( true) && !disabled) {
                warn('Invalid Teleport target on mount:', target, `(${typeof target})`);
            }
            const mount = (container, anchor) => {
                // Teleport *always* has Array children. This is enforced in both the
                // compiler and vnode children normalization.
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    mountChildren(children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
            };
            if (disabled) {
                mount(container, mainAnchor);
            }
            else if (target) {
                mount(target, targetAnchor);
            }
        }
        else {
            // update content
            n2.el = n1.el;
            const mainAnchor = (n2.anchor = n1.anchor);
            const target = (n2.target = n1.target);
            const targetAnchor = (n2.targetAnchor = n1.targetAnchor);
            const wasDisabled = isTeleportDisabled(n1.props);
            const currentContainer = wasDisabled ? container : target;
            const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
            isSVG = isSVG || isTargetSVG(target);
            if (dynamicChildren) {
                // fast path when the teleport happens to be a block root
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG, slotScopeIds);
                // even in block tree mode we need to make sure all root-level nodes
                // in the teleport inherit previous DOM references so that they can
                // be moved in future patches.
                traverseStaticChildren(n1, n2, true);
            }
            else if (!optimized) {
                patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, false);
            }
            if (disabled) {
                if (!wasDisabled) {
                    // enabled -> disabled
                    // move into main container
                    moveTeleport(n2, container, mainAnchor, internals, 1 /* TeleportMoveTypes.TOGGLE */);
                }
            }
            else {
                // target changed
                if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
                    const nextTarget = (n2.target = resolveTarget(n2.props, querySelector));
                    if (nextTarget) {
                        moveTeleport(n2, nextTarget, null, internals, 0 /* TeleportMoveTypes.TARGET_CHANGE */);
                    }
                    else if ((true)) {
                        warn('Invalid Teleport target on update:', target, `(${typeof target})`);
                    }
                }
                else if (wasDisabled) {
                    // disabled -> enabled
                    // move into teleport target
                    moveTeleport(n2, target, targetAnchor, internals, 1 /* TeleportMoveTypes.TOGGLE */);
                }
            }
        }
        updateCssVars(n2);
    },
    remove(vnode, parentComponent, parentSuspense, optimized, { um: unmount, o: { remove: hostRemove } }, doRemove) {
        const { shapeFlag, children, anchor, targetAnchor, target, props } = vnode;
        if (target) {
            hostRemove(targetAnchor);
        }
        // an unmounted teleport should always remove its children if not disabled
        if (doRemove || !isTeleportDisabled(props)) {
            hostRemove(anchor);
            if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    unmount(child, parentComponent, parentSuspense, true, !!child.dynamicChildren);
                }
            }
        }
    },
    move: moveTeleport,
    hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2 /* TeleportMoveTypes.REORDER */) {
    // move target anchor if this is a target change.
    if (moveType === 0 /* TeleportMoveTypes.TARGET_CHANGE */) {
        insert(vnode.targetAnchor, container, parentAnchor);
    }
    const { el, anchor, shapeFlag, children, props } = vnode;
    const isReorder = moveType === 2 /* TeleportMoveTypes.REORDER */;
    // move main view anchor if this is a re-order.
    if (isReorder) {
        insert(el, container, parentAnchor);
    }
    // if this is a re-order and teleport is enabled (content is in target)
    // do not move children. So the opposite is: only move children if this
    // is not a reorder, or the teleport is disabled
    if (!isReorder || isTeleportDisabled(props)) {
        // Teleport has either Array children or no children.
        if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            for (let i = 0; i < children.length; i++) {
                move(children[i], container, parentAnchor, 2 /* MoveType.REORDER */);
            }
        }
    }
    // move main view anchor if this is a re-order.
    if (isReorder) {
        insert(anchor, container, parentAnchor);
    }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector } }, hydrateChildren) {
    const target = (vnode.target = resolveTarget(vnode.props, querySelector));
    if (target) {
        // if multiple teleports rendered to the same target element, we need to
        // pick up from where the last teleport finished instead of the first node
        const targetNode = target._lpa || target.firstChild;
        if (vnode.shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            if (isTeleportDisabled(vnode.props)) {
                vnode.anchor = hydrateChildren(nextSibling(node), vnode, parentNode(node), parentComponent, parentSuspense, slotScopeIds, optimized);
                vnode.targetAnchor = targetNode;
            }
            else {
                vnode.anchor = nextSibling(node);
                // lookahead until we find the target anchor
                // we cannot rely on return value of hydrateChildren() because there
                // could be nested teleports
                let targetAnchor = targetNode;
                while (targetAnchor) {
                    targetAnchor = nextSibling(targetAnchor);
                    if (targetAnchor &&
                        targetAnchor.nodeType === 8 &&
                        targetAnchor.data === 'teleport anchor') {
                        vnode.targetAnchor = targetAnchor;
                        target._lpa =
                            vnode.targetAnchor && nextSibling(vnode.targetAnchor);
                        break;
                    }
                }
                hydrateChildren(targetNode, vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
            }
        }
        updateCssVars(vnode);
    }
    return vnode.anchor && nextSibling(vnode.anchor);
}
// Force-casted public typing for h and TSX props inference
const Teleport = TeleportImpl;
function updateCssVars(vnode) {
    // presence of .ut method indicates owner component uses css vars.
    // code path here can assume browser environment.
    const ctx = vnode.ctx;
    if (ctx && ctx.ut) {
        let node = vnode.children[0].el;
        while (node !== vnode.targetAnchor) {
            if (node.nodeType === 1)
                node.setAttribute('data-v-owner', ctx.uid);
            node = node.nextSibling;
        }
        ctx.ut();
    }
}

const Fragment = Symbol(( true) ? 'Fragment' : 0);
const Text = Symbol(( true) ? 'Text' : 0);
const Comment = Symbol(( true) ? 'Comment' : 0);
const Static = Symbol(( true) ? 'Static' : 0);
// Since v-if and v-for are the two possible ways node structure can dynamically
// change, once we consider v-if branches and each v-for fragment a block, we
// can divide a template into nested blocks, and within each block the node
// structure would be stable. This allows us to skip most children diffing
// and only worry about the dynamic nodes (indicated by patch flags).
const blockStack = [];
let currentBlock = null;
/**
 * Open a block.
 * This must be called before `createBlock`. It cannot be part of `createBlock`
 * because the children of the block are evaluated before `createBlock` itself
 * is called. The generated code typically looks like this:
 *
 * ```js
 * function render() {
 *   return (openBlock(),createBlock('div', null, [...]))
 * }
 * ```
 * disableTracking is true when creating a v-for fragment block, since a v-for
 * fragment always diffs its children.
 *
 * @private
 */
function openBlock(disableTracking = false) {
    blockStack.push((currentBlock = disableTracking ? null : []));
}
function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
}
// Whether we should be tracking dynamic child nodes inside a block.
// Only tracks when this value is > 0
// We are not using a simple boolean because this value may need to be
// incremented/decremented by nested usage of v-once (see below)
let isBlockTreeEnabled = 1;
/**
 * Block tracking sometimes needs to be disabled, for example during the
 * creation of a tree that needs to be cached by v-once. The compiler generates
 * code like this:
 *
 * ``` js
 * _cache[1] || (
 *   setBlockTracking(-1),
 *   _cache[1] = createVNode(...),
 *   setBlockTracking(1),
 *   _cache[1]
 * )
 * ```
 *
 * @private
 */
function setBlockTracking(value) {
    isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
    // save current block children on the block vnode
    vnode.dynamicChildren =
        isBlockTreeEnabled > 0 ? currentBlock || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_ARR : null;
    // close block
    closeBlock();
    // a block is always going to be patched, so track it as a child of its
    // parent block
    if (isBlockTreeEnabled > 0 && currentBlock) {
        currentBlock.push(vnode);
    }
    return vnode;
}
/**
 * @private
 */
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true /* isBlock */));
}
/**
 * Create a block root vnode. Takes the same exact arguments as `createVNode`.
 * A block root keeps track of dynamic nodes within the block in the
 * `dynamicChildren` array.
 *
 * @private
 */
function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true /* isBlock: prevent a block from tracking itself */));
}
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
    if (( true) &&
        n2.shapeFlag & 6 /* ShapeFlags.COMPONENT */ &&
        hmrDirtyComponents.has(n2.type)) {
        // #7042, ensure the vnode being unmounted during HMR
        // bitwise operations to remove keep alive flags
        n1.shapeFlag &= ~256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */;
        n2.shapeFlag &= ~512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */;
        // HMR only: if the component has been hot-updated, force a reload.
        return false;
    }
    return n1.type === n2.type && n1.key === n2.key;
}
let vnodeArgsTransformer;
/**
 * Internal API for registering an arguments transform for createVNode
 * used for creating stubs in the test-utils
 * It is *internal* but needs to be exposed for test-utils to pick up proper
 * typings
 */
function transformVNodeArgs(transformer) {
    vnodeArgsTransformer = transformer;
}
const createVNodeWithArgsTransform = (...args) => {
    return _createVNode(...(vnodeArgsTransformer
        ? vnodeArgsTransformer(args, currentRenderingInstance)
        : args));
};
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref, ref_key, ref_for }) => {
    return (ref != null
        ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(ref) || (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(ref) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(ref)
            ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
            : ref
        : null);
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1 /* ShapeFlags.ELEMENT */, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
        __v_isVNode: true,
        __v_skip: true,
        type,
        props,
        key: props && normalizeKey(props),
        ref: props && normalizeRef(props),
        scopeId: currentScopeId,
        slotScopeIds: null,
        children,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag,
        patchFlag,
        dynamicProps,
        dynamicChildren: null,
        appContext: null,
        ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
        normalizeChildren(vnode, children);
        // normalize suspense children
        if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            type.normalize(vnode);
        }
    }
    else if (children) {
        // compiled element vnode - if children is passed, only possible types are
        // string or Array.
        vnode.shapeFlag |= (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(children)
            ? 8 /* ShapeFlags.TEXT_CHILDREN */
            : 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // validate key
    if (( true) && vnode.key !== vnode.key) {
        warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    // track vnode for block tree
    if (isBlockTreeEnabled > 0 &&
        // avoid a block node from tracking itself
        !isBlockNode &&
        // has current parent block
        currentBlock &&
        // presence of a patch flag indicates this node needs patching on updates.
        // component nodes also should always be patched, because even if the
        // component doesn't need to update, it needs to persist the instance on to
        // the next vnode so that it can be properly unmounted later.
        (vnode.patchFlag > 0 || shapeFlag & 6 /* ShapeFlags.COMPONENT */) &&
        // the EVENTS flag is only for hydration and if it is the only flag, the
        // vnode should not be considered dynamic due to handler caching.
        vnode.patchFlag !== 32 /* PatchFlags.HYDRATE_EVENTS */) {
        currentBlock.push(vnode);
    }
    return vnode;
}
const createVNode = (( true) ? createVNodeWithArgsTransform : 0);
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        if (( true) && !type) {
            warn(`Invalid vnode type when creating vnode: ${type}.`);
        }
        type = Comment;
    }
    if (isVNode(type)) {
        // createVNode receiving an existing vnode. This happens in cases like
        // <component :is="vnode"/>
        // #2078 make sure to merge refs during the clone instead of overwriting it
        const cloned = cloneVNode(type, props, true /* mergeRef: true */);
        if (children) {
            normalizeChildren(cloned, children);
        }
        if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
            if (cloned.shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                currentBlock[currentBlock.indexOf(type)] = cloned;
            }
            else {
                currentBlock.push(cloned);
            }
        }
        cloned.patchFlag |= -2 /* PatchFlags.BAIL */;
        return cloned;
    }
    // class component normalization.
    if (isClassComponent(type)) {
        type = type.__vccOpts;
    }
    // class & style normalization.
    if (props) {
        // for reactive or proxy objects, we need to clone it to enable mutation.
        props = guardReactiveProps(props);
        let { class: klass, style } = props;
        if (klass && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(klass)) {
            props.class = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeClass)(klass);
        }
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(style)) {
            // reactive state objects need to be cloned since they are likely to be
            // mutated
            if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy)(style) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(style)) {
                style = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, style);
            }
            props.style = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeStyle)(style);
        }
    }
    // encode the vnode type information into a bitmap
    const shapeFlag = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(type)
        ? 1 /* ShapeFlags.ELEMENT */
        : isSuspense(type)
            ? 128 /* ShapeFlags.SUSPENSE */
            : isTeleport(type)
                ? 64 /* ShapeFlags.TELEPORT */
                : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(type)
                    ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                    : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(type)
                        ? 2 /* ShapeFlags.FUNCTIONAL_COMPONENT */
                        : 0;
    if (( true) && shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */ && (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy)(type)) {
        type = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(type);
        warn(`Vue received a Component which was made a reactive object. This can ` +
            `lead to unnecessary performance overhead, and should be avoided by ` +
            `marking the component with \`markRaw\` or using \`shallowRef\` ` +
            `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
    }
    return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
    if (!props)
        return null;
    return (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isProxy)(props) || InternalObjectKey in props
        ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, props)
        : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
    // This is intentionally NOT using spread or extend to avoid the runtime
    // key enumeration cost.
    const { props, ref, patchFlag, children } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
        __v_isVNode: true,
        __v_skip: true,
        type: vnode.type,
        props: mergedProps,
        key: mergedProps && normalizeKey(mergedProps),
        ref: extraProps && extraProps.ref
            ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                // if the vnode itself already has a ref, cloneVNode will need to merge
                // the refs so the single vnode can be set on multiple refs
                mergeRef && ref
                    ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(ref)
                        ? ref.concat(normalizeRef(extraProps))
                        : [ref, normalizeRef(extraProps)]
                    : normalizeRef(extraProps)
            : ref,
        scopeId: vnode.scopeId,
        slotScopeIds: vnode.slotScopeIds,
        children: ( true) && patchFlag === -1 /* PatchFlags.HOISTED */ && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(children)
            ? children.map(deepCloneVNode)
            : children,
        target: vnode.target,
        targetAnchor: vnode.targetAnchor,
        staticCount: vnode.staticCount,
        shapeFlag: vnode.shapeFlag,
        // if the vnode is cloned with extra props, we can no longer assume its
        // existing patch flag to be reliable and need to add the FULL_PROPS flag.
        // note: preserve flag for fragments since they use the flag for children
        // fast paths only.
        patchFlag: extraProps && vnode.type !== Fragment
            ? patchFlag === -1 // hoisted node
                ? 16 /* PatchFlags.FULL_PROPS */
                : patchFlag | 16 /* PatchFlags.FULL_PROPS */
            : patchFlag,
        dynamicProps: vnode.dynamicProps,
        dynamicChildren: vnode.dynamicChildren,
        appContext: vnode.appContext,
        dirs: vnode.dirs,
        transition: vnode.transition,
        // These should technically only be non-null on mounted VNodes. However,
        // they *should* be copied for kept-alive vnodes. So we just always copy
        // them since them being non-null during a mount doesn't affect the logic as
        // they will simply be overwritten.
        component: vnode.component,
        suspense: vnode.suspense,
        ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
        ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
        el: vnode.el,
        anchor: vnode.anchor,
        ctx: vnode.ctx,
        ce: vnode.ce
    };
    return cloned;
}
/**
 * Dev only, for HMR of hoisted vnodes reused in v-for
 * https://github.com/vitejs/vite/issues/2022
 */
function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(vnode.children)) {
        cloned.children = vnode.children.map(deepCloneVNode);
    }
    return cloned;
}
/**
 * @private
 */
function createTextVNode(text = ' ', flag = 0) {
    return createVNode(Text, null, text, flag);
}
/**
 * @private
 */
function createStaticVNode(content, numberOfNodes) {
    // A static vnode can contain multiple stringified elements, and the number
    // of elements is necessary for hydration.
    const vnode = createVNode(Static, null, content);
    vnode.staticCount = numberOfNodes;
    return vnode;
}
/**
 * @private
 */
function createCommentVNode(text = '', 
// when used as the v-else branch, the comment node must be created as a
// block to ensure correct updates.
asBlock = false) {
    return asBlock
        ? (openBlock(), createBlock(Comment, null, text))
        : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
    if (child == null || typeof child === 'boolean') {
        // empty placeholder
        return createVNode(Comment);
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(child)) {
        // fragment
        return createVNode(Fragment, null, 
        // #3666, avoid reference pollution when reusing vnode
        child.slice());
    }
    else if (typeof child === 'object') {
        // already vnode, this should be the most common since compiled templates
        // always produce all-vnode children arrays
        return cloneIfMounted(child);
    }
    else {
        // strings and numbers
        return createVNode(Text, null, String(child));
    }
}
// optimized normalization for template-compiled render fns
function cloneIfMounted(child) {
    return (child.el === null && child.patchFlag !== -1 /* PatchFlags.HOISTED */) ||
        child.memo
        ? child
        : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
        children = null;
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(children)) {
        type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    else if (typeof children === 'object') {
        if (shapeFlag & (1 /* ShapeFlags.ELEMENT */ | 64 /* ShapeFlags.TELEPORT */)) {
            // Normalize slot to plain children for plain element and Teleport
            const slot = children.default;
            if (slot) {
                // _c marker is added by withCtx() indicating this is a compiled slot
                slot._c && (slot._d = false);
                normalizeChildren(vnode, slot());
                slot._c && (slot._d = true);
            }
            return;
        }
        else {
            type = 32 /* ShapeFlags.SLOTS_CHILDREN */;
            const slotFlag = children._;
            if (!slotFlag && !(InternalObjectKey in children)) {
                children._ctx = currentRenderingInstance;
            }
            else if (slotFlag === 3 /* SlotFlags.FORWARDED */ && currentRenderingInstance) {
                // a child component receives forwarded slots from the parent.
                // its slot type is determined by its parent's slot type.
                if (currentRenderingInstance.slots._ === 1 /* SlotFlags.STABLE */) {
                    children._ = 1 /* SlotFlags.STABLE */;
                }
                else {
                    children._ = 2 /* SlotFlags.DYNAMIC */;
                    vnode.patchFlag |= 1024 /* PatchFlags.DYNAMIC_SLOTS */;
                }
            }
        }
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(children)) {
        children = { default: children, _ctx: currentRenderingInstance };
        type = 32 /* ShapeFlags.SLOTS_CHILDREN */;
    }
    else {
        children = String(children);
        // force teleport children to array so it can be moved around
        if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
            children = [createTextVNode(children)];
        }
        else {
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
}
function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
        const toMerge = args[i];
        for (const key in toMerge) {
            if (key === 'class') {
                if (ret.class !== toMerge.class) {
                    ret.class = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeClass)([ret.class, toMerge.class]);
                }
            }
            else if (key === 'style') {
                ret.style = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.normalizeStyle)([ret.style, toMerge.style]);
            }
            else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
                const existing = ret[key];
                const incoming = toMerge[key];
                if (incoming &&
                    existing !== incoming &&
                    !((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(existing) && existing.includes(incoming))) {
                    ret[key] = existing
                        ? [].concat(existing, incoming)
                        : incoming;
                }
            }
            else if (key !== '') {
                ret[key] = toMerge[key];
            }
        }
    }
    return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7 /* ErrorCodes.VNODE_HOOK */, [
        vnode,
        prevVNode
    ]);
}

const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    // inherit parent app context - or - if root, adopt from root vnode
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        uid: uid++,
        vnode,
        type,
        parent,
        appContext,
        root: null,
        next: null,
        subTree: null,
        effect: null,
        update: null,
        scope: new _vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.EffectScope(true /* detached */),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: parent ? parent.provides : Object.create(appContext.provides),
        accessCache: null,
        renderCache: [],
        // local resolved assets
        components: null,
        directives: null,
        // resolved props and emits options
        propsOptions: normalizePropsOptions(type, appContext),
        emitsOptions: normalizeEmitsOptions(type, appContext),
        // emit
        emit: null,
        emitted: null,
        // props default value
        propsDefaults: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        // inheritAttrs
        inheritAttrs: type.inheritAttrs,
        // state
        ctx: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        data: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        props: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        attrs: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        slots: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        refs: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        setupState: _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ,
        setupContext: null,
        // suspense related
        suspense,
        suspenseId: suspense ? suspense.pendingId : 0,
        asyncDep: null,
        asyncResolved: false,
        // lifecycle hooks
        // not using enums here because it results in computed properties
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    if ((true)) {
        instance.ctx = createDevRenderContext(instance);
    }
    else {}
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    // apply custom element special handling
    if (vnode.ce) {
        vnode.ce(instance);
    }
    return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
    currentInstance = instance;
    instance.scope.on();
};
const unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    currentInstance = null;
};
const isBuiltInTag = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.makeMap)('slot,component');
function validateComponentName(name, config) {
    const appIsNativeTag = config.isNativeTag || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NO;
    if (isBuiltInTag(name) || appIsNativeTag(name)) {
        warn('Do not use built-in or reserved HTML elements as component id: ' + name);
    }
}
function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
    isInSSRComponentSetup = isSSR;
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children);
    const setupResult = isStateful
        ? setupStatefulComponent(instance, isSSR)
        : undefined;
    isInSSRComponentSetup = false;
    return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
    var _a;
    const Component = instance.type;
    if ((true)) {
        if (Component.name) {
            validateComponentName(Component.name, instance.appContext.config);
        }
        if (Component.components) {
            const names = Object.keys(Component.components);
            for (let i = 0; i < names.length; i++) {
                validateComponentName(names[i], instance.appContext.config);
            }
        }
        if (Component.directives) {
            const names = Object.keys(Component.directives);
            for (let i = 0; i < names.length; i++) {
                validateDirectiveName(names[i]);
            }
        }
        if (Component.compilerOptions && isRuntimeOnly()) {
            warn(`"compilerOptions" is only supported when using a build of Vue that ` +
                `includes the runtime compiler. Since you are using a runtime-only ` +
                `build, the options should be passed via your build tool config instead.`);
        }
    }
    // 0. create render proxy property access cache
    instance.accessCache = Object.create(null);
    // 1. create public instance / render proxy
    // also mark it raw so it's never observed
    instance.proxy = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.markRaw)(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
    if ((true)) {
        exposePropsOnRenderContext(instance);
    }
    // 2. call setup()
    const { setup } = Component;
    if (setup) {
        const setupContext = (instance.setupContext =
            setup.length > 1 ? createSetupContext(instance) : null);
        setCurrentInstance(instance);
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        const setupResult = callWithErrorHandling(setup, instance, 0 /* ErrorCodes.SETUP_FUNCTION */, [( true) ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(instance.props) : 0, setupContext]);
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
        unsetCurrentInstance();
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(setupResult)) {
            setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
            if (isSSR) {
                // return the promise so server-renderer can wait on it
                return setupResult
                    .then((resolvedResult) => {
                    handleSetupResult(instance, resolvedResult, isSSR);
                })
                    .catch(e => {
                    handleError(e, instance, 0 /* ErrorCodes.SETUP_FUNCTION */);
                });
            }
            else {
                // async setup returned Promise.
                // bail here and wait for re-entry.
                instance.asyncDep = setupResult;
                if (( true) && !instance.suspense) {
                    const name = (_a = Component.name) !== null && _a !== void 0 ? _a : 'Anonymous';
                    warn(`Component <${name}>: setup function returned a promise, but no ` +
                        `<Suspense> boundary was found in the parent component tree. ` +
                        `A component with async setup() must be nested in a <Suspense> ` +
                        `in order to be rendered.`);
                }
            }
        }
        else {
            handleSetupResult(instance, setupResult, isSSR);
        }
    }
    else {
        finishComponentSetup(instance, isSSR);
    }
}
function handleSetupResult(instance, setupResult, isSSR) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(setupResult)) {
        // setup returned an inline render function
        if (instance.type.__ssrInlineRender) {
            // when the function's name is `ssrRender` (compiled by SFC inline mode),
            // set it as ssrRender instead.
            instance.ssrRender = setupResult;
        }
        else {
            instance.render = setupResult;
        }
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(setupResult)) {
        if (( true) && isVNode(setupResult)) {
            warn(`setup() should not return VNodes directly - ` +
                `return a render function instead.`);
        }
        // setup returned bindings.
        // assuming a render function compiled from template is present.
        if (true) {
            instance.devtoolsRawSetupState = setupResult;
        }
        instance.setupState = (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.proxyRefs)(setupResult);
        if ((true)) {
            exposeSetupStateOnRenderContext(instance);
        }
    }
    else if (( true) && setupResult !== undefined) {
        warn(`setup() should return an object. Received: ${setupResult === null ? 'null' : typeof setupResult}`);
    }
    finishComponentSetup(instance, isSSR);
}
let compile;
let installWithProxy;
/**
 * For runtime-dom to register the compiler.
 * Note the exported method uses any to avoid d.ts relying on the compiler types.
 */
function registerRuntimeCompiler(_compile) {
    compile = _compile;
    installWithProxy = i => {
        if (i.render._rc) {
            i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
        }
    };
}
// dev only
const isRuntimeOnly = () => !compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    // template / render function normalization
    // could be already set when returned from setup()
    if (!instance.render) {
        // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
        // is done by server-renderer
        if (!isSSR && compile && !Component.render) {
            const template = Component.template ||
                resolveMergedOptions(instance).template;
            if (template) {
                if ((true)) {
                    startMeasure(instance, `compile`);
                }
                const { isCustomElement, compilerOptions } = instance.appContext.config;
                const { delimiters, compilerOptions: componentCompilerOptions } = Component;
                const finalCompilerOptions = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({
                    isCustomElement,
                    delimiters
                }, compilerOptions), componentCompilerOptions);
                Component.render = compile(template, finalCompilerOptions);
                if ((true)) {
                    endMeasure(instance, `compile`);
                }
            }
        }
        instance.render = (Component.render || _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP);
        // for runtime-compiled render functions using `with` blocks, the render
        // proxy used needs a different `has` handler which is more performant and
        // also only allows a whitelist of globals to fallthrough.
        if (installWithProxy) {
            installWithProxy(instance);
        }
    }
    // support for 2.x options
    if (true) {
        setCurrentInstance(instance);
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.pauseTracking)();
        applyOptions(instance);
        (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.resetTracking)();
        unsetCurrentInstance();
    }
    // warn missing template/render
    // the runtime compilation of template in SSR is done by server-render
    if (( true) && !Component.render && instance.render === _vue_shared__WEBPACK_IMPORTED_MODULE_1__.NOOP && !isSSR) {
        /* istanbul ignore if */
        if (!compile && Component.template) {
            warn(`Component provided template option but ` +
                `runtime compilation is not supported in this build of Vue.` +
                (` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
                    ) /* should not happen */);
        }
        else {
            warn(`Component is missing template or render function.`);
        }
    }
}
function createAttrsProxy(instance) {
    return new Proxy(instance.attrs, ( true)
        ? {
            get(target, key) {
                markAttrsAccessed();
                (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.track)(instance, "get" /* TrackOpTypes.GET */, '$attrs');
                return target[key];
            },
            set() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            },
            deleteProperty() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            }
        }
        : 0);
}
function createSetupContext(instance) {
    const expose = exposed => {
        if ((true)) {
            if (instance.exposed) {
                warn(`expose() should be called only once per setup().`);
            }
            if (exposed != null) {
                let exposedType = typeof exposed;
                if (exposedType === 'object') {
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(exposed)) {
                        exposedType = 'array';
                    }
                    else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(exposed)) {
                        exposedType = 'ref';
                    }
                }
                if (exposedType !== 'object') {
                    warn(`expose() should be passed a plain object, received ${exposedType}.`);
                }
            }
        }
        instance.exposed = exposed || {};
    };
    let attrs;
    if ((true)) {
        // We use getters in dev in case libs like test-utils overwrite instance
        // properties (overwrites should not be done in prod)
        return Object.freeze({
            get attrs() {
                return attrs || (attrs = createAttrsProxy(instance));
            },
            get slots() {
                return (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly)(instance.slots);
            },
            get emit() {
                return (event, ...args) => instance.emit(event, ...args);
            },
            expose
        });
    }
    else {}
}
function getExposeProxy(instance) {
    if (instance.exposed) {
        return (instance.exposeProxy ||
            (instance.exposeProxy = new Proxy((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.proxyRefs)((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.markRaw)(instance.exposed)), {
                get(target, key) {
                    if (key in target) {
                        return target[key];
                    }
                    else if (key in publicPropertiesMap) {
                        return publicPropertiesMap[key](instance);
                    }
                },
                has(target, key) {
                    return key in target || key in publicPropertiesMap;
                }
            })));
    }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');
function getComponentName(Component, includeInferred = true) {
    return (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(Component)
        ? Component.displayName || Component.name
        : Component.name || (includeInferred && Component.__name);
}
/* istanbul ignore next */
function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
        const match = Component.__file.match(/([^/\\]+)\.\w+$/);
        if (match) {
            name = match[1];
        }
    }
    if (!name && instance && instance.parent) {
        // try to infer the name based on reverse resolution
        const inferFromRegistry = (registry) => {
            for (const key in registry) {
                if (registry[key] === Component) {
                    return key;
                }
            }
        };
        name =
            inferFromRegistry(instance.components ||
                instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
    return (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value) && '__vccOpts' in value;
}

const computed = ((getterOrOptions, debugOptions) => {
    // @ts-ignore
    return (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.computed)(getterOrOptions, debugOptions, isInSSRComponentSetup);
});

// dev only
const warnRuntimeUsage = (method) => warn(`${method}() is a compiler-hint helper that is only usable inside ` +
    `<script setup> of a single file component. Its arguments should be ` +
    `compiled away and passing it at runtime has no effect.`);
// implementation
function defineProps() {
    if ((true)) {
        warnRuntimeUsage(`defineProps`);
    }
    return null;
}
// implementation
function defineEmits() {
    if ((true)) {
        warnRuntimeUsage(`defineEmits`);
    }
    return null;
}
/**
 * Vue `<script setup>` compiler macro for declaring a component's exposed
 * instance properties when it is accessed by a parent component via template
 * refs.
 *
 * `<script setup>` components are closed by default - i.e. variables inside
 * the `<script setup>` scope is not exposed to parent unless explicitly exposed
 * via `defineExpose`.
 *
 * This is only usable inside `<script setup>`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
function defineExpose(exposed) {
    if ((true)) {
        warnRuntimeUsage(`defineExpose`);
    }
}
/**
 * Vue `<script setup>` compiler macro for providing props default values when
 * using type-based `defineProps` declaration.
 *
 * Example usage:
 * ```ts
 * withDefaults(defineProps<{
 *   size?: number
 *   labels?: string[]
 * }>(), {
 *   size: 3,
 *   labels: () => ['default label']
 * })
 * ```
 *
 * This is only usable inside `<script setup>`, is compiled away in the output
 * and should **not** be actually called at runtime.
 */
function withDefaults(props, defaults) {
    if ((true)) {
        warnRuntimeUsage(`withDefaults`);
    }
    return null;
}
function useSlots() {
    return getContext().slots;
}
function useAttrs() {
    return getContext().attrs;
}
function getContext() {
    const i = getCurrentInstance();
    if (( true) && !i) {
        warn(`useContext() called without active instance.`);
    }
    return i.setupContext || (i.setupContext = createSetupContext(i));
}
/**
 * Runtime helper for merging default declarations. Imported by compiled code
 * only.
 * @internal
 */
function mergeDefaults(raw, defaults) {
    const props = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(raw)
        ? raw.reduce((normalized, p) => ((normalized[p] = {}), normalized), {})
        : raw;
    for (const key in defaults) {
        const opt = props[key];
        if (opt) {
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opt) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(opt)) {
                props[key] = { type: opt, default: defaults[key] };
            }
            else {
                opt.default = defaults[key];
            }
        }
        else if (opt === null) {
            props[key] = { default: defaults[key] };
        }
        else if ((true)) {
            warn(`props default key "${key}" has no corresponding declaration.`);
        }
    }
    return props;
}
/**
 * Used to create a proxy for the rest element when destructuring props with
 * defineProps().
 * @internal
 */
function createPropsRestProxy(props, excludedKeys) {
    const ret = {};
    for (const key in props) {
        if (!excludedKeys.includes(key)) {
            Object.defineProperty(ret, key, {
                enumerable: true,
                get: () => props[key]
            });
        }
    }
    return ret;
}
/**
 * `<script setup>` helper for persisting the current instance context over
 * async/await flows.
 *
 * `@vue/compiler-sfc` converts the following:
 *
 * ```ts
 * const x = await foo()
 * ```
 *
 * into:
 *
 * ```ts
 * let __temp, __restore
 * const x = (([__temp, __restore] = withAsyncContext(() => foo())),__temp=await __temp,__restore(),__temp)
 * ```
 * @internal
 */
function withAsyncContext(getAwaitable) {
    const ctx = getCurrentInstance();
    if (( true) && !ctx) {
        warn(`withAsyncContext called without active current instance. ` +
            `This is likely a bug.`);
    }
    let awaitable = getAwaitable();
    unsetCurrentInstance();
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isPromise)(awaitable)) {
        awaitable = awaitable.catch(e => {
            setCurrentInstance(ctx);
            throw e;
        });
    }
    return [awaitable, () => setCurrentInstance(ctx)];
}

// Actual implementation
function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(propsOrChildren) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(propsOrChildren)) {
            // single vnode without props
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]);
            }
            // props without children
            return createVNode(type, propsOrChildren);
        }
        else {
            // omit props
            return createVNode(type, null, propsOrChildren);
        }
    }
    else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
}

const ssrContextKey = Symbol(( true) ? `ssrContext` : 0);
const useSSRContext = () => {
    {
        const ctx = inject(ssrContextKey);
        if (!ctx) {
            ( true) &&
                warn(`Server rendering context not provided. Make sure to only call ` +
                    `useSSRContext() conditionally in the server build.`);
        }
        return ctx;
    }
};

function isShallow(value) {
    return !!(value && value["__v_isShallow" /* ReactiveFlags.IS_SHALLOW */]);
}

function initCustomFormatter() {
    /* eslint-disable no-restricted-globals */
    if ( false || typeof window === 'undefined') {
        return;
    }
    const vueStyle = { style: 'color:#3ba776' };
    const numberStyle = { style: 'color:#0b1bc9' };
    const stringStyle = { style: 'color:#b62e24' };
    const keywordStyle = { style: 'color:#9d288c' };
    // custom formatter for Chrome
    // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html
    const formatter = {
        header(obj) {
            // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
            if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(obj)) {
                return null;
            }
            if (obj.__isVue) {
                return ['div', vueStyle, `VueInstance`];
            }
            else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isRef)(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, genRefFlag(obj)],
                    '<',
                    formatValue(obj.value),
                    `>`
                ];
            }
            else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReactive)(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReactive' : 'Reactive'],
                    '<',
                    formatValue(obj),
                    `>${(0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReadonly)(obj) ? ` (readonly)` : ``}`
                ];
            }
            else if ((0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.isReadonly)(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReadonly' : 'Readonly'],
                    '<',
                    formatValue(obj),
                    '>'
                ];
            }
            return null;
        },
        hasBody(obj) {
            return obj && obj.__isVue;
        },
        body(obj) {
            if (obj && obj.__isVue) {
                return [
                    'div',
                    {},
                    ...formatInstance(obj.$)
                ];
            }
        }
    };
    function formatInstance(instance) {
        const blocks = [];
        if (instance.type.props && instance.props) {
            blocks.push(createInstanceBlock('props', (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(instance.props)));
        }
        if (instance.setupState !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
            blocks.push(createInstanceBlock('setup', instance.setupState));
        }
        if (instance.data !== _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ) {
            blocks.push(createInstanceBlock('data', (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(instance.data)));
        }
        const computed = extractKeys(instance, 'computed');
        if (computed) {
            blocks.push(createInstanceBlock('computed', computed));
        }
        const injected = extractKeys(instance, 'inject');
        if (injected) {
            blocks.push(createInstanceBlock('injected', injected));
        }
        blocks.push([
            'div',
            {},
            [
                'span',
                {
                    style: keywordStyle.style + ';opacity:0.66'
                },
                '$ (internal): '
            ],
            ['object', { object: instance }]
        ]);
        return blocks;
    }
    function createInstanceBlock(type, target) {
        target = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, target);
        if (!Object.keys(target).length) {
            return ['span', {}];
        }
        return [
            'div',
            { style: 'line-height:1.25em;margin-bottom:0.6em' },
            [
                'div',
                {
                    style: 'color:#476582'
                },
                type
            ],
            [
                'div',
                {
                    style: 'padding-left:1.25em'
                },
                ...Object.keys(target).map(key => {
                    return [
                        'div',
                        {},
                        ['span', keywordStyle, key + ': '],
                        formatValue(target[key], false)
                    ];
                })
            ]
        ];
    }
    function formatValue(v, asRaw = true) {
        if (typeof v === 'number') {
            return ['span', numberStyle, v];
        }
        else if (typeof v === 'string') {
            return ['span', stringStyle, JSON.stringify(v)];
        }
        else if (typeof v === 'boolean') {
            return ['span', keywordStyle, v];
        }
        else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(v)) {
            return ['object', { object: asRaw ? (0,_vue_reactivity__WEBPACK_IMPORTED_MODULE_0__.toRaw)(v) : v }];
        }
        else {
            return ['span', stringStyle, String(v)];
        }
    }
    function extractKeys(instance, type) {
        const Comp = instance.type;
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(Comp)) {
            return;
        }
        const extracted = {};
        for (const key in instance.ctx) {
            if (isKeyOfType(Comp, key, type)) {
                extracted[key] = instance.ctx[key];
            }
        }
        return extracted;
    }
    function isKeyOfType(Comp, key, type) {
        const opts = Comp[type];
        if (((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(opts) && opts.includes(key)) ||
            ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(opts) && key in opts)) {
            return true;
        }
        if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
            return true;
        }
        if (Comp.mixins && Comp.mixins.some(m => isKeyOfType(m, key, type))) {
            return true;
        }
    }
    function genRefFlag(v) {
        if (isShallow(v)) {
            return `ShallowRef`;
        }
        if (v.effect) {
            return `ComputedRef`;
        }
        return `Ref`;
    }
    if (window.devtoolsFormatters) {
        window.devtoolsFormatters.push(formatter);
    }
    else {
        window.devtoolsFormatters = [formatter];
    }
}

function withMemo(memo, render, cache, index) {
    const cached = cache[index];
    if (cached && isMemoSame(cached, memo)) {
        return cached;
    }
    const ret = render();
    // shallow clone
    ret.memo = memo.slice();
    return (cache[index] = ret);
}
function isMemoSame(cached, memo) {
    const prev = cached.memo;
    if (prev.length != memo.length) {
        return false;
    }
    for (let i = 0; i < prev.length; i++) {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hasChanged)(prev[i], memo[i])) {
            return false;
        }
    }
    // make sure to let parent block track it when returning cached
    if (isBlockTreeEnabled > 0 && currentBlock) {
        currentBlock.push(cached);
    }
    return true;
}

// Core API ------------------------------------------------------------------
const version = "3.2.47";
const _ssrUtils = {
    createComponentInstance,
    setupComponent,
    renderComponentRoot,
    setCurrentRenderingInstance,
    isVNode,
    normalizeVNode
};
/**
 * SSR utils for \@vue/server-renderer. Only exposed in ssr-possible builds.
 * @internal
 */
const ssrUtils = (_ssrUtils );
/**
 * @internal only exposed in compat builds
 */
const resolveFilter = null;
/**
 * @internal only exposed in compat builds.
 */
const compatUtils = (null);




/***/ }),

/***/ "./node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseTransition": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.BaseTransition),
/* harmony export */   "Comment": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Comment),
/* harmony export */   "EffectScope": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.EffectScope),
/* harmony export */   "Fragment": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Fragment),
/* harmony export */   "KeepAlive": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.KeepAlive),
/* harmony export */   "ReactiveEffect": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect),
/* harmony export */   "Static": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Static),
/* harmony export */   "Suspense": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Suspense),
/* harmony export */   "Teleport": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Teleport),
/* harmony export */   "Text": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Text),
/* harmony export */   "Transition": () => (/* binding */ Transition),
/* harmony export */   "TransitionGroup": () => (/* binding */ TransitionGroup),
/* harmony export */   "VueElement": () => (/* binding */ VueElement),
/* harmony export */   "assertNumber": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assertNumber),
/* harmony export */   "callWithAsyncErrorHandling": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.callWithAsyncErrorHandling),
/* harmony export */   "callWithErrorHandling": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.callWithErrorHandling),
/* harmony export */   "camelize": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.camelize),
/* harmony export */   "capitalize": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.capitalize),
/* harmony export */   "cloneVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.cloneVNode),
/* harmony export */   "compatUtils": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.compatUtils),
/* harmony export */   "computed": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.computed),
/* harmony export */   "createApp": () => (/* binding */ createApp),
/* harmony export */   "createBlock": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createBlock),
/* harmony export */   "createCommentVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode),
/* harmony export */   "createElementBlock": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createElementBlock),
/* harmony export */   "createElementVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createElementVNode),
/* harmony export */   "createHydrationRenderer": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createHydrationRenderer),
/* harmony export */   "createPropsRestProxy": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createPropsRestProxy),
/* harmony export */   "createRenderer": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createRenderer),
/* harmony export */   "createSSRApp": () => (/* binding */ createSSRApp),
/* harmony export */   "createSlots": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createSlots),
/* harmony export */   "createStaticVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createStaticVNode),
/* harmony export */   "createTextVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createTextVNode),
/* harmony export */   "createVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createVNode),
/* harmony export */   "customRef": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.customRef),
/* harmony export */   "defineAsyncComponent": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineAsyncComponent),
/* harmony export */   "defineComponent": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineComponent),
/* harmony export */   "defineCustomElement": () => (/* binding */ defineCustomElement),
/* harmony export */   "defineEmits": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineEmits),
/* harmony export */   "defineExpose": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineExpose),
/* harmony export */   "defineProps": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineProps),
/* harmony export */   "defineSSRCustomElement": () => (/* binding */ defineSSRCustomElement),
/* harmony export */   "devtools": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.devtools),
/* harmony export */   "effect": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.effect),
/* harmony export */   "effectScope": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.effectScope),
/* harmony export */   "getCurrentInstance": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance),
/* harmony export */   "getCurrentScope": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope),
/* harmony export */   "getTransitionRawChildren": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getTransitionRawChildren),
/* harmony export */   "guardReactiveProps": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.guardReactiveProps),
/* harmony export */   "h": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.h),
/* harmony export */   "handleError": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.handleError),
/* harmony export */   "hydrate": () => (/* binding */ hydrate),
/* harmony export */   "initCustomFormatter": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.initCustomFormatter),
/* harmony export */   "initDirectivesForSSR": () => (/* binding */ initDirectivesForSSR),
/* harmony export */   "inject": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.inject),
/* harmony export */   "isMemoSame": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isMemoSame),
/* harmony export */   "isProxy": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isProxy),
/* harmony export */   "isReactive": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isReactive),
/* harmony export */   "isReadonly": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isReadonly),
/* harmony export */   "isRef": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isRef),
/* harmony export */   "isRuntimeOnly": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isRuntimeOnly),
/* harmony export */   "isShallow": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isShallow),
/* harmony export */   "isVNode": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isVNode),
/* harmony export */   "markRaw": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.markRaw),
/* harmony export */   "mergeDefaults": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.mergeDefaults),
/* harmony export */   "mergeProps": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.mergeProps),
/* harmony export */   "nextTick": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.nextTick),
/* harmony export */   "normalizeClass": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.normalizeClass),
/* harmony export */   "normalizeProps": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.normalizeProps),
/* harmony export */   "normalizeStyle": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.normalizeStyle),
/* harmony export */   "onActivated": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onActivated),
/* harmony export */   "onBeforeMount": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onBeforeMount),
/* harmony export */   "onBeforeUnmount": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onBeforeUnmount),
/* harmony export */   "onBeforeUpdate": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onBeforeUpdate),
/* harmony export */   "onDeactivated": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onDeactivated),
/* harmony export */   "onErrorCaptured": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onErrorCaptured),
/* harmony export */   "onMounted": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onMounted),
/* harmony export */   "onRenderTracked": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onRenderTracked),
/* harmony export */   "onRenderTriggered": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onRenderTriggered),
/* harmony export */   "onScopeDispose": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onScopeDispose),
/* harmony export */   "onServerPrefetch": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onServerPrefetch),
/* harmony export */   "onUnmounted": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onUnmounted),
/* harmony export */   "onUpdated": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onUpdated),
/* harmony export */   "openBlock": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.openBlock),
/* harmony export */   "popScopeId": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.popScopeId),
/* harmony export */   "provide": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.provide),
/* harmony export */   "proxyRefs": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.proxyRefs),
/* harmony export */   "pushScopeId": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.pushScopeId),
/* harmony export */   "queuePostFlushCb": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.queuePostFlushCb),
/* harmony export */   "reactive": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.reactive),
/* harmony export */   "readonly": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.readonly),
/* harmony export */   "ref": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ref),
/* harmony export */   "registerRuntimeCompiler": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.registerRuntimeCompiler),
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "renderList": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.renderList),
/* harmony export */   "renderSlot": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.renderSlot),
/* harmony export */   "resolveComponent": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveComponent),
/* harmony export */   "resolveDirective": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveDirective),
/* harmony export */   "resolveDynamicComponent": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveDynamicComponent),
/* harmony export */   "resolveFilter": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveFilter),
/* harmony export */   "resolveTransitionHooks": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveTransitionHooks),
/* harmony export */   "setBlockTracking": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setBlockTracking),
/* harmony export */   "setDevtoolsHook": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setDevtoolsHook),
/* harmony export */   "setTransitionHooks": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setTransitionHooks),
/* harmony export */   "shallowReactive": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.shallowReactive),
/* harmony export */   "shallowReadonly": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly),
/* harmony export */   "shallowRef": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.shallowRef),
/* harmony export */   "ssrContextKey": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ssrContextKey),
/* harmony export */   "ssrUtils": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.ssrUtils),
/* harmony export */   "stop": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.stop),
/* harmony export */   "toDisplayString": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toDisplayString),
/* harmony export */   "toHandlerKey": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toHandlerKey),
/* harmony export */   "toHandlers": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toHandlers),
/* harmony export */   "toRaw": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toRaw),
/* harmony export */   "toRef": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toRef),
/* harmony export */   "toRefs": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.toRefs),
/* harmony export */   "transformVNodeArgs": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.transformVNodeArgs),
/* harmony export */   "triggerRef": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.triggerRef),
/* harmony export */   "unref": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.unref),
/* harmony export */   "useAttrs": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.useAttrs),
/* harmony export */   "useCssModule": () => (/* binding */ useCssModule),
/* harmony export */   "useCssVars": () => (/* binding */ useCssVars),
/* harmony export */   "useSSRContext": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.useSSRContext),
/* harmony export */   "useSlots": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.useSlots),
/* harmony export */   "useTransitionState": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.useTransitionState),
/* harmony export */   "vModelCheckbox": () => (/* binding */ vModelCheckbox),
/* harmony export */   "vModelDynamic": () => (/* binding */ vModelDynamic),
/* harmony export */   "vModelRadio": () => (/* binding */ vModelRadio),
/* harmony export */   "vModelSelect": () => (/* binding */ vModelSelect),
/* harmony export */   "vModelText": () => (/* binding */ vModelText),
/* harmony export */   "vShow": () => (/* binding */ vShow),
/* harmony export */   "version": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.version),
/* harmony export */   "warn": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn),
/* harmony export */   "watch": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.watch),
/* harmony export */   "watchEffect": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.watchEffect),
/* harmony export */   "watchPostEffect": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.watchPostEffect),
/* harmony export */   "watchSyncEffect": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.watchSyncEffect),
/* harmony export */   "withAsyncContext": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withAsyncContext),
/* harmony export */   "withCtx": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withCtx),
/* harmony export */   "withDefaults": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withDefaults),
/* harmony export */   "withDirectives": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withDirectives),
/* harmony export */   "withKeys": () => (/* binding */ withKeys),
/* harmony export */   "withMemo": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withMemo),
/* harmony export */   "withModifiers": () => (/* binding */ withModifiers),
/* harmony export */   "withScopeId": () => (/* reexport safe */ _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.withScopeId)
/* harmony export */ });
/* harmony import */ var _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/runtime-core */ "./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */ var _vue_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @vue/shared */ "./node_modules/@vue/shared/dist/shared.esm-bundler.js");
/* harmony import */ var _vue_runtime_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @vue/runtime-core */ "./node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js");




const svgNS = 'http://www.w3.org/2000/svg';
const doc = (typeof document !== 'undefined' ? document : null);
const templateContainer = doc && /*#__PURE__*/ doc.createElement('template');
const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: child => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: (tag, isSVG, is, props) => {
        const el = isSVG
            ? doc.createElementNS(svgNS, tag)
            : doc.createElement(tag, is ? { is } : undefined);
        if (tag === 'select' && props && props.multiple != null) {
            el.setAttribute('multiple', props.multiple);
        }
        return el;
    },
    createText: text => doc.createTextNode(text),
    createComment: text => doc.createComment(text),
    setText: (node, text) => {
        node.nodeValue = text;
    },
    setElementText: (el, text) => {
        el.textContent = text;
    },
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => doc.querySelector(selector),
    setScopeId(el, id) {
        el.setAttribute(id, '');
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(content, parent, anchor, isSVG, start, end) {
        // <parent> before | first ... last | anchor </parent>
        const before = anchor ? anchor.previousSibling : parent.lastChild;
        // #5308 can only take cached path if:
        // - has a single root node
        // - nextSibling info is still available
        if (start && (start === end || start.nextSibling)) {
            // cached
            while (true) {
                parent.insertBefore(start.cloneNode(true), anchor);
                if (start === end || !(start = start.nextSibling))
                    break;
            }
        }
        else {
            // fresh insert
            templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
            const template = templateContainer.content;
            if (isSVG) {
                // remove outer svg wrapper
                const wrapper = template.firstChild;
                while (wrapper.firstChild) {
                    template.appendChild(wrapper.firstChild);
                }
                template.removeChild(wrapper);
            }
            parent.insertBefore(template, anchor);
        }
        return [
            // first
            before ? before.nextSibling : parent.firstChild,
            // last
            anchor ? anchor.previousSibling : parent.lastChild
        ];
    }
};

// compiler should normalize class + :class bindings on the same element
// into a single binding ['staticClass', dynamic]
function patchClass(el, value, isSVG) {
    // directly setting className should be faster than setAttribute in theory
    // if this is an element during a transition, take the temporary transition
    // classes into account.
    const transitionClasses = el._vtc;
    if (transitionClasses) {
        value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(' ');
    }
    if (value == null) {
        el.removeAttribute('class');
    }
    else if (isSVG) {
        el.setAttribute('class', value);
    }
    else {
        el.className = value;
    }
}

function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(next);
    if (next && !isCssString) {
        if (prev && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(prev)) {
            for (const key in prev) {
                if (next[key] == null) {
                    setStyle(style, key, '');
                }
            }
        }
        for (const key in next) {
            setStyle(style, key, next[key]);
        }
    }
    else {
        const currentDisplay = style.display;
        if (isCssString) {
            if (prev !== next) {
                style.cssText = next;
            }
        }
        else if (prev) {
            el.removeAttribute('style');
        }
        // indicates that the `display` of the element is controlled by `v-show`,
        // so we always keep the current `display` value regardless of the `style`
        // value, thus handing over control to `v-show`.
        if ('_vod' in el) {
            style.display = currentDisplay;
        }
    }
}
const semicolonRE = /[^\\];\s*$/;
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(val)) {
        val.forEach(v => setStyle(style, name, v));
    }
    else {
        if (val == null)
            val = '';
        if ((true)) {
            if (semicolonRE.test(val)) {
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Unexpected semicolon at the end of '${name}' style value: '${val}'`);
            }
        }
        if (name.startsWith('--')) {
            // custom property definition
            style.setProperty(name, val);
        }
        else {
            const prefixed = autoPrefix(style, name);
            if (importantRE.test(val)) {
                // !important
                style.setProperty((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(prefixed), val.replace(importantRE, ''), 'important');
            }
            else {
                style[prefixed] = val;
            }
        }
    }
}
const prefixes = ['Webkit', 'Moz', 'ms'];
const prefixCache = {};
function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
        return cached;
    }
    let name = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(rawName);
    if (name !== 'filter' && name in style) {
        return (prefixCache[rawName] = name);
    }
    name = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.capitalize)(name);
    for (let i = 0; i < prefixes.length; i++) {
        const prefixed = prefixes[i] + name;
        if (prefixed in style) {
            return (prefixCache[rawName] = prefixed);
        }
    }
    return rawName;
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
function patchAttr(el, key, value, isSVG, instance) {
    if (isSVG && key.startsWith('xlink:')) {
        if (value == null) {
            el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
        }
        else {
            el.setAttributeNS(xlinkNS, key, value);
        }
    }
    else {
        // note we are only checking boolean attributes that don't have a
        // corresponding dom prop of the same name here.
        const isBoolean = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSpecialBooleanAttr)(key);
        if (value == null || (isBoolean && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.includeBooleanAttr)(value))) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, isBoolean ? '' : value);
        }
    }
}

// __UNSAFE__
// functions. The user is responsible for using them with only trusted content.
function patchDOMProp(el, key, value, 
// the following args are passed only due to potential innerHTML/textContent
// overriding existing VNodes, in which case the old tree must be properly
// unmounted.
prevChildren, parentComponent, parentSuspense, unmountChildren) {
    if (key === 'innerHTML' || key === 'textContent') {
        if (prevChildren) {
            unmountChildren(prevChildren, parentComponent, parentSuspense);
        }
        el[key] = value == null ? '' : value;
        return;
    }
    if (key === 'value' &&
        el.tagName !== 'PROGRESS' &&
        // custom elements may use _value internally
        !el.tagName.includes('-')) {
        // store value as _value as well since
        // non-string values will be stringified.
        el._value = value;
        const newValue = value == null ? '' : value;
        if (el.value !== newValue ||
            // #4956: always set for OPTION elements because its value falls back to
            // textContent if no value attribute is present. And setting .value for
            // OPTION has no side effect
            el.tagName === 'OPTION') {
            el.value = newValue;
        }
        if (value == null) {
            el.removeAttribute(key);
        }
        return;
    }
    let needRemove = false;
    if (value === '' || value == null) {
        const type = typeof el[key];
        if (type === 'boolean') {
            // e.g. <select multiple> compiles to { multiple: '' }
            value = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.includeBooleanAttr)(value);
        }
        else if (value == null && type === 'string') {
            // e.g. <div :id="null">
            value = '';
            needRemove = true;
        }
        else if (type === 'number') {
            // e.g. <img :width="null">
            value = 0;
            needRemove = true;
        }
    }
    // some properties perform value validation and throw,
    // some properties has getter, no setter, will error in 'use strict'
    // eg. <select :type="null"></select> <select :willValidate="null"></select>
    try {
        el[key] = value;
    }
    catch (e) {
        // do not warn if value is auto-coerced from nullish values
        if (( true) && !needRemove) {
            (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: ` +
                `value ${value} is invalid.`, e);
        }
    }
    needRemove && el.removeAttribute(key);
}

function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    // vei = vue event invokers
    const invokers = el._vei || (el._vei = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
        // patch
        existingInvoker.value = nextValue;
    }
    else {
        const [name, options] = parseName(rawName);
        if (nextValue) {
            // add
            const invoker = (invokers[rawName] = createInvoker(nextValue, instance));
            addEventListener(el, name, invoker, options);
        }
        else if (existingInvoker) {
            // remove
            removeEventListener(el, name, existingInvoker, options);
            invokers[rawName] = undefined;
        }
    }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
        options = {};
        let m;
        while ((m = name.match(optionsModifierRE))) {
            name = name.slice(0, name.length - m[0].length);
            options[m[0].toLowerCase()] = true;
        }
    }
    const event = name[2] === ':' ? name.slice(3) : (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(name.slice(2));
    return [event, options];
}
// To avoid the overhead of repeatedly calling Date.now(), we cache
// and use the same timestamp for all event listeners attached in the same tick.
let cachedNow = 0;
const p = /*#__PURE__*/ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => (cachedNow = 0)), (cachedNow = Date.now()));
function createInvoker(initialValue, instance) {
    const invoker = (e) => {
        // async edge case vuejs/vue#6566
        // inner click event triggers patch, event handler
        // attached to outer element during patch, and triggered again. This
        // happens because browsers fire microtask ticks between event propagation.
        // this no longer happens for templates in Vue 3, but could still be
        // theoretically possible for hand-written render functions.
        // the solution: we save the timestamp when a handler is attached,
        // and also attach the timestamp to any event that was handled by vue
        // for the first time (to avoid inconsistent event timestamp implementations
        // or events fired from iframes, e.g. #2513)
        // The handler would only fire if the event passed to it was fired
        // AFTER it was attached.
        if (!e._vts) {
            e._vts = Date.now();
        }
        else if (e._vts <= invoker.attached) {
            return;
        }
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.callWithAsyncErrorHandling)(patchStopImmediatePropagation(e, invoker.value), instance, 5 /* ErrorCodes.NATIVE_EVENT_HANDLER */, [e]);
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
}
function patchStopImmediatePropagation(e, value) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) {
        const originalStop = e.stopImmediatePropagation;
        e.stopImmediatePropagation = () => {
            originalStop.call(e);
            e._stopped = true;
        };
        return value.map(fn => (e) => !e._stopped && fn && fn(e));
    }
    else {
        return value;
    }
}

const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
    if (key === 'class') {
        patchClass(el, nextValue, isSVG);
    }
    else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isOn)(key)) {
        // ignore v-model listeners
        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isModelListener)(key)) {
            patchEvent(el, key, prevValue, nextValue, parentComponent);
        }
    }
    else if (key[0] === '.'
        ? ((key = key.slice(1)), true)
        : key[0] === '^'
            ? ((key = key.slice(1)), false)
            : shouldSetAsProp(el, key, nextValue, isSVG)) {
        patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
    }
    else {
        // special case for <input v-model type="checkbox"> with
        // :true-value & :false-value
        // store value as dom properties since non-string values will be
        // stringified.
        if (key === 'true-value') {
            el._trueValue = nextValue;
        }
        else if (key === 'false-value') {
            el._falseValue = nextValue;
        }
        patchAttr(el, key, nextValue, isSVG);
    }
};
function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
        // most keys must be set as attribute on svg elements to work
        // ...except innerHTML & textContent
        if (key === 'innerHTML' || key === 'textContent') {
            return true;
        }
        // or native onclick with function values
        if (key in el && nativeOnRE.test(key) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value)) {
            return true;
        }
        return false;
    }
    // these are enumerated attrs, however their corresponding DOM properties
    // are actually booleans - this leads to setting it with a string "false"
    // value leading it to be coerced to `true`, so we need to always treat
    // them as attributes.
    // Note that `contentEditable` doesn't have this problem: its DOM
    // property is also enumerated string values.
    if (key === 'spellcheck' || key === 'draggable' || key === 'translate') {
        return false;
    }
    // #1787, #2840 form property on form elements is readonly and must be set as
    // attribute.
    if (key === 'form') {
        return false;
    }
    // #1526 <input list> must be set as attribute
    if (key === 'list' && el.tagName === 'INPUT') {
        return false;
    }
    // #2766 <textarea type> must be set as attribute
    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false;
    }
    // native onclick with string value, must be set as attribute
    if (nativeOnRE.test(key) && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(value)) {
        return false;
    }
    return key in el;
}

function defineCustomElement(options, hydrate) {
    const Comp = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.defineComponent)(options);
    class VueCustomElement extends VueElement {
        constructor(initialProps) {
            super(Comp, initialProps, hydrate);
        }
    }
    VueCustomElement.def = Comp;
    return VueCustomElement;
}
const defineSSRCustomElement = ((options) => {
    // @ts-ignore
    return defineCustomElement(options, hydrate);
});
const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {
});
class VueElement extends BaseClass {
    constructor(_def, _props = {}, hydrate) {
        super();
        this._def = _def;
        this._props = _props;
        /**
         * @internal
         */
        this._instance = null;
        this._connected = false;
        this._resolved = false;
        this._numberProps = null;
        if (this.shadowRoot && hydrate) {
            hydrate(this._createVNode(), this.shadowRoot);
        }
        else {
            if (( true) && this.shadowRoot) {
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Custom element has pre-rendered declarative shadow root but is not ` +
                    `defined as hydratable. Use \`defineSSRCustomElement\`.`);
            }
            this.attachShadow({ mode: 'open' });
            if (!this._def.__asyncLoader) {
                // for sync component defs we can immediately resolve props
                this._resolveProps(this._def);
            }
        }
    }
    connectedCallback() {
        this._connected = true;
        if (!this._instance) {
            if (this._resolved) {
                this._update();
            }
            else {
                this._resolveDef();
            }
        }
    }
    disconnectedCallback() {
        this._connected = false;
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.nextTick)(() => {
            if (!this._connected) {
                render(null, this.shadowRoot);
                this._instance = null;
            }
        });
    }
    /**
     * resolve inner component definition (handle possible async component)
     */
    _resolveDef() {
        this._resolved = true;
        // set initial attrs
        for (let i = 0; i < this.attributes.length; i++) {
            this._setAttr(this.attributes[i].name);
        }
        // watch future attr changes
        new MutationObserver(mutations => {
            for (const m of mutations) {
                this._setAttr(m.attributeName);
            }
        }).observe(this, { attributes: true });
        const resolve = (def, isAsync = false) => {
            const { props, styles } = def;
            // cast Number-type props set before resolve
            let numberProps;
            if (props && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(props)) {
                for (const key in props) {
                    const opt = props[key];
                    if (opt === Number || (opt && opt.type === Number)) {
                        if (key in this._props) {
                            this._props[key] = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toNumber)(this._props[key]);
                        }
                        (numberProps || (numberProps = Object.create(null)))[(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key)] = true;
                    }
                }
            }
            this._numberProps = numberProps;
            if (isAsync) {
                // defining getter/setters on prototype
                // for sync defs, this already happened in the constructor
                this._resolveProps(def);
            }
            // apply CSS
            this._applyStyles(styles);
            // initial render
            this._update();
        };
        const asyncDef = this._def.__asyncLoader;
        if (asyncDef) {
            asyncDef().then(def => resolve(def, true));
        }
        else {
            resolve(this._def);
        }
    }
    _resolveProps(def) {
        const { props } = def;
        const declaredPropKeys = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(props) ? props : Object.keys(props || {});
        // check if there are props set pre-upgrade or connect
        for (const key of Object.keys(this)) {
            if (key[0] !== '_' && declaredPropKeys.includes(key)) {
                this._setProp(key, this[key], true, false);
            }
        }
        // defining getter/setters on prototype
        for (const key of declaredPropKeys.map(_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)) {
            Object.defineProperty(this, key, {
                get() {
                    return this._getProp(key);
                },
                set(val) {
                    this._setProp(key, val);
                }
            });
        }
    }
    _setAttr(key) {
        let value = this.getAttribute(key);
        const camelKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.camelize)(key);
        if (this._numberProps && this._numberProps[camelKey]) {
            value = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toNumber)(value);
        }
        this._setProp(camelKey, value, false);
    }
    /**
     * @internal
     */
    _getProp(key) {
        return this._props[key];
    }
    /**
     * @internal
     */
    _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
        if (val !== this._props[key]) {
            this._props[key] = val;
            if (shouldUpdate && this._instance) {
                this._update();
            }
            // reflect
            if (shouldReflect) {
                if (val === true) {
                    this.setAttribute((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key), '');
                }
                else if (typeof val === 'string' || typeof val === 'number') {
                    this.setAttribute((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key), val + '');
                }
                else if (!val) {
                    this.removeAttribute((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(key));
                }
            }
        }
    }
    _update() {
        render(this._createVNode(), this.shadowRoot);
    }
    _createVNode() {
        const vnode = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createVNode)(this._def, (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, this._props));
        if (!this._instance) {
            vnode.ce = instance => {
                this._instance = instance;
                instance.isCE = true;
                // HMR
                if ((true)) {
                    instance.ceReload = newStyles => {
                        // always reset styles
                        if (this._styles) {
                            this._styles.forEach(s => this.shadowRoot.removeChild(s));
                            this._styles.length = 0;
                        }
                        this._applyStyles(newStyles);
                        this._instance = null;
                        this._update();
                    };
                }
                const dispatch = (event, args) => {
                    this.dispatchEvent(new CustomEvent(event, {
                        detail: args
                    }));
                };
                // intercept emit
                instance.emit = (event, ...args) => {
                    // dispatch both the raw and hyphenated versions of an event
                    // to match Vue behavior
                    dispatch(event, args);
                    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event) !== event) {
                        dispatch((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event), args);
                    }
                };
                // locate nearest Vue custom element parent for provide/inject
                let parent = this;
                while ((parent =
                    parent && (parent.parentNode || parent.host))) {
                    if (parent instanceof VueElement) {
                        instance.parent = parent._instance;
                        instance.provides = parent._instance.provides;
                        break;
                    }
                }
            };
        }
        return vnode;
    }
    _applyStyles(styles) {
        if (styles) {
            styles.forEach(css => {
                const s = document.createElement('style');
                s.textContent = css;
                this.shadowRoot.appendChild(s);
                // record for HMR
                if ((true)) {
                    (this._styles || (this._styles = [])).push(s);
                }
            });
        }
    }
}

function useCssModule(name = '$style') {
    /* istanbul ignore else */
    {
        const instance = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)();
        if (!instance) {
            ( true) && (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`useCssModule must be called inside setup()`);
            return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        }
        const modules = instance.type.__cssModules;
        if (!modules) {
            ( true) && (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Current instance does not have CSS modules injected.`);
            return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        }
        const mod = modules[name];
        if (!mod) {
            ( true) &&
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Current instance does not have CSS module named "${name}".`);
            return _vue_shared__WEBPACK_IMPORTED_MODULE_1__.EMPTY_OBJ;
        }
        return mod;
    }
}

/**
 * Runtime helper for SFC's CSS variable injection feature.
 * @private
 */
function useCssVars(getter) {
    const instance = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)();
    /* istanbul ignore next */
    if (!instance) {
        ( true) &&
            (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`useCssVars is called without current active component instance.`);
        return;
    }
    const updateTeleports = (instance.ut = (vars = getter(instance.proxy)) => {
        Array.from(document.querySelectorAll(`[data-v-owner="${instance.uid}"]`)).forEach(node => setVarsOnNode(node, vars));
    });
    const setVars = () => {
        const vars = getter(instance.proxy);
        setVarsOnVNode(instance.subTree, vars);
        updateTeleports(vars);
    };
    (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.watchPostEffect)(setVars);
    (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
        const ob = new MutationObserver(setVars);
        ob.observe(instance.subTree.el.parentNode, { childList: true });
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onUnmounted)(() => ob.disconnect());
    });
}
function setVarsOnVNode(vnode, vars) {
    if (vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
        const suspense = vnode.suspense;
        vnode = suspense.activeBranch;
        if (suspense.pendingBranch && !suspense.isHydrating) {
            suspense.effects.push(() => {
                setVarsOnVNode(suspense.activeBranch, vars);
            });
        }
    }
    // drill down HOCs until it's a non-component vnode
    while (vnode.component) {
        vnode = vnode.component.subTree;
    }
    if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */ && vnode.el) {
        setVarsOnNode(vnode.el, vars);
    }
    else if (vnode.type === _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Fragment) {
        vnode.children.forEach(c => setVarsOnVNode(c, vars));
    }
    else if (vnode.type === _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Static) {
        let { el, anchor } = vnode;
        while (el) {
            setVarsOnNode(el, vars);
            if (el === anchor)
                break;
            el = el.nextSibling;
        }
    }
}
function setVarsOnNode(el, vars) {
    if (el.nodeType === 1) {
        const style = el.style;
        for (const key in vars) {
            style.setProperty(`--${key}`, vars[key]);
        }
    }
}

const TRANSITION = 'transition';
const ANIMATION = 'animation';
// DOM Transition is a higher-order-component based on the platform-agnostic
// base Transition component, with DOM-specific logic.
const Transition = (props, { slots }) => (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.h)(_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.BaseTransition, resolveTransitionProps(props), slots);
Transition.displayName = 'Transition';
const DOMTransitionPropsValidators = {
    name: String,
    type: String,
    css: {
        type: Boolean,
        default: true
    },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String
};
const TransitionPropsValidators = (Transition.props =
    /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.BaseTransition.props, DOMTransitionPropsValidators));
/**
 * #3227 Incoming hooks may be merged into arrays when wrapping Transition
 * with custom HOCs.
 */
const callHook = (hook, args = []) => {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)) {
        hook.forEach(h => h(...args));
    }
    else if (hook) {
        hook(...args);
    }
};
/**
 * Check if a hook expects a callback (2nd arg), which means the user
 * intends to explicitly control the end of the transition.
 */
const hasExplicitCallback = (hook) => {
    return hook
        ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(hook)
            ? hook.some(h => h.length > 1)
            : hook.length > 1
        : false;
};
function resolveTransitionProps(rawProps) {
    const baseProps = {};
    for (const key in rawProps) {
        if (!(key in DOMTransitionPropsValidators)) {
            baseProps[key] = rawProps[key];
        }
    }
    if (rawProps.css === false) {
        return baseProps;
    }
    const { name = 'v', type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
    const durations = normalizeDuration(duration);
    const enterDuration = durations && durations[0];
    const leaveDuration = durations && durations[1];
    const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
    const finishEnter = (el, isAppear, done) => {
        removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
        removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
        done && done();
    };
    const finishLeave = (el, done) => {
        el._isLeaving = false;
        removeTransitionClass(el, leaveFromClass);
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
        done && done();
    };
    const makeEnterHook = (isAppear) => {
        return (el, done) => {
            const hook = isAppear ? onAppear : onEnter;
            const resolve = () => finishEnter(el, isAppear, done);
            callHook(hook, [el, resolve]);
            nextFrame(() => {
                removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
                addTransitionClass(el, isAppear ? appearToClass : enterToClass);
                if (!hasExplicitCallback(hook)) {
                    whenTransitionEnds(el, type, enterDuration, resolve);
                }
            });
        };
    };
    return (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)(baseProps, {
        onBeforeEnter(el) {
            callHook(onBeforeEnter, [el]);
            addTransitionClass(el, enterFromClass);
            addTransitionClass(el, enterActiveClass);
        },
        onBeforeAppear(el) {
            callHook(onBeforeAppear, [el]);
            addTransitionClass(el, appearFromClass);
            addTransitionClass(el, appearActiveClass);
        },
        onEnter: makeEnterHook(false),
        onAppear: makeEnterHook(true),
        onLeave(el, done) {
            el._isLeaving = true;
            const resolve = () => finishLeave(el, done);
            addTransitionClass(el, leaveFromClass);
            // force reflow so *-leave-from classes immediately take effect (#2593)
            forceReflow();
            addTransitionClass(el, leaveActiveClass);
            nextFrame(() => {
                if (!el._isLeaving) {
                    // cancelled
                    return;
                }
                removeTransitionClass(el, leaveFromClass);
                addTransitionClass(el, leaveToClass);
                if (!hasExplicitCallback(onLeave)) {
                    whenTransitionEnds(el, type, leaveDuration, resolve);
                }
            });
            callHook(onLeave, [el, resolve]);
        },
        onEnterCancelled(el) {
            finishEnter(el, false);
            callHook(onEnterCancelled, [el]);
        },
        onAppearCancelled(el) {
            finishEnter(el, true);
            callHook(onAppearCancelled, [el]);
        },
        onLeaveCancelled(el) {
            finishLeave(el);
            callHook(onLeaveCancelled, [el]);
        }
    });
}
function normalizeDuration(duration) {
    if (duration == null) {
        return null;
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isObject)(duration)) {
        return [NumberOf(duration.enter), NumberOf(duration.leave)];
    }
    else {
        const n = NumberOf(duration);
        return [n, n];
    }
}
function NumberOf(val) {
    const res = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.toNumber)(val);
    if ((true)) {
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.assertNumber)(res, '<transition> explicit duration');
    }
    return res;
}
function addTransitionClass(el, cls) {
    cls.split(/\s+/).forEach(c => c && el.classList.add(c));
    (el._vtc ||
        (el._vtc = new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
    cls.split(/\s+/).forEach(c => c && el.classList.remove(c));
    const { _vtc } = el;
    if (_vtc) {
        _vtc.delete(cls);
        if (!_vtc.size) {
            el._vtc = undefined;
        }
    }
}
function nextFrame(cb) {
    requestAnimationFrame(() => {
        requestAnimationFrame(cb);
    });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
    const id = (el._endId = ++endId);
    const resolveIfNotStale = () => {
        if (id === el._endId) {
            resolve();
        }
    };
    if (explicitTimeout) {
        return setTimeout(resolveIfNotStale, explicitTimeout);
    }
    const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
    if (!type) {
        return resolve();
    }
    const endEvent = type + 'end';
    let ended = 0;
    const end = () => {
        el.removeEventListener(endEvent, onEnd);
        resolveIfNotStale();
    };
    const onEnd = (e) => {
        if (e.target === el && ++ended >= propCount) {
            end();
        }
    };
    setTimeout(() => {
        if (ended < propCount) {
            end();
        }
    }, timeout + 1);
    el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
    const styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    const getStyleProperties = (key) => (styles[key] || '').split(', ');
    const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
    const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
    const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
    const animationTimeout = getTimeout(animationDelays, animationDurations);
    let type = null;
    let timeout = 0;
    let propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
        if (transitionTimeout > 0) {
            type = TRANSITION;
            timeout = transitionTimeout;
            propCount = transitionDurations.length;
        }
    }
    else if (expectedType === ANIMATION) {
        if (animationTimeout > 0) {
            type = ANIMATION;
            timeout = animationTimeout;
            propCount = animationDurations.length;
        }
    }
    else {
        timeout = Math.max(transitionTimeout, animationTimeout);
        type =
            timeout > 0
                ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                : null;
        propCount = type
            ? type === TRANSITION
                ? transitionDurations.length
                : animationDurations.length
            : 0;
    }
    const hasTransform = type === TRANSITION &&
        /\b(transform|all)(,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
    return {
        type,
        timeout,
        propCount,
        hasTransform
    };
}
function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
        delays = delays.concat(delays);
    }
    return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
// Old versions of Chromium (below 61.0.3163.100) formats floating pointer
// numbers in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down
// (i.e. acting as a floor function) causing unexpected behaviors
function toMs(s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}
// synchronously force layout to put elements into a certain state
function forceReflow() {
    return document.body.offsetHeight;
}

const positionMap = new WeakMap();
const newPositionMap = new WeakMap();
const TransitionGroupImpl = {
    name: 'TransitionGroup',
    props: /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({}, TransitionPropsValidators, {
        tag: String,
        moveClass: String
    }),
    setup(props, { slots }) {
        const instance = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance)();
        const state = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.useTransitionState)();
        let prevChildren;
        let children;
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.onUpdated)(() => {
            // children is guaranteed to exist after initial render
            if (!prevChildren.length) {
                return;
            }
            const moveClass = props.moveClass || `${props.name || 'v'}-move`;
            if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
                return;
            }
            // we divide the work into three loops to avoid mixing DOM reads and writes
            // in each iteration - which helps prevent layout thrashing.
            prevChildren.forEach(callPendingCbs);
            prevChildren.forEach(recordPosition);
            const movedChildren = prevChildren.filter(applyTranslation);
            // force reflow to put everything in position
            forceReflow();
            movedChildren.forEach(c => {
                const el = c.el;
                const style = el.style;
                addTransitionClass(el, moveClass);
                style.transform = style.webkitTransform = style.transitionDuration = '';
                const cb = (el._moveCb = (e) => {
                    if (e && e.target !== el) {
                        return;
                    }
                    if (!e || /transform$/.test(e.propertyName)) {
                        el.removeEventListener('transitionend', cb);
                        el._moveCb = null;
                        removeTransitionClass(el, moveClass);
                    }
                });
                el.addEventListener('transitionend', cb);
            });
        });
        return () => {
            const rawProps = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_2__.toRaw)(props);
            const cssTransitionProps = resolveTransitionProps(rawProps);
            let tag = rawProps.tag || _vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.Fragment;
            prevChildren = children;
            children = slots.default ? (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.getTransitionRawChildren)(slots.default()) : [];
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.key != null) {
                    (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setTransitionHooks)(child, (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveTransitionHooks)(child, cssTransitionProps, state, instance));
                }
                else if ((true)) {
                    (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`<TransitionGroup> children must be keyed.`);
                }
            }
            if (prevChildren) {
                for (let i = 0; i < prevChildren.length; i++) {
                    const child = prevChildren[i];
                    (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.setTransitionHooks)(child, (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.resolveTransitionHooks)(child, cssTransitionProps, state, instance));
                    positionMap.set(child, child.el.getBoundingClientRect());
                }
            }
            return (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createVNode)(tag, null, children);
        };
    }
};
/**
 * TransitionGroup does not support "mode" so we need to remove it from the
 * props declarations, but direct delete operation is considered a side effect
 * and will make the entire transition feature non-tree-shakeable, so we do it
 * in a function and mark the function's invocation as pure.
 */
const removeMode = (props) => delete props.mode;
/*#__PURE__*/ removeMode(TransitionGroupImpl.props);
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c) {
    const el = c.el;
    if (el._moveCb) {
        el._moveCb();
    }
    if (el._enterCb) {
        el._enterCb();
    }
}
function recordPosition(c) {
    newPositionMap.set(c, c.el.getBoundingClientRect());
}
function applyTranslation(c) {
    const oldPos = positionMap.get(c);
    const newPos = newPositionMap.get(c);
    const dx = oldPos.left - newPos.left;
    const dy = oldPos.top - newPos.top;
    if (dx || dy) {
        const s = c.el.style;
        s.transform = s.webkitTransform = `translate(${dx}px,${dy}px)`;
        s.transitionDuration = '0s';
        return c;
    }
}
function hasCSSTransform(el, root, moveClass) {
    // Detect whether an element with the move class applied has
    // CSS transitions. Since the element may be inside an entering
    // transition at this very moment, we make a clone of it and remove
    // all other transition classes applied to ensure only the move class
    // is applied.
    const clone = el.cloneNode();
    if (el._vtc) {
        el._vtc.forEach(cls => {
            cls.split(/\s+/).forEach(c => c && clone.classList.remove(c));
        });
    }
    moveClass.split(/\s+/).forEach(c => c && clone.classList.add(c));
    clone.style.display = 'none';
    const container = (root.nodeType === 1 ? root : root.parentNode);
    container.appendChild(clone);
    const { hasTransform } = getTransitionInfo(clone);
    container.removeChild(clone);
    return hasTransform;
}

const getModelAssigner = (vnode) => {
    const fn = vnode.props['onUpdate:modelValue'] ||
        (false );
    return (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(fn) ? value => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.invokeArrayFns)(fn, value) : fn;
};
function onCompositionStart(e) {
    e.target.composing = true;
}
function onCompositionEnd(e) {
    const target = e.target;
    if (target.composing) {
        target.composing = false;
        target.dispatchEvent(new Event('input'));
    }
}
// We are exporting the v-model runtime directly as vnode hooks so that it can
// be tree-shaken in case v-model is never used.
const vModelText = {
    created(el, { modifiers: { lazy, trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode);
        const castToNumber = number || (vnode.props && vnode.props.type === 'number');
        addEventListener(el, lazy ? 'change' : 'input', e => {
            if (e.target.composing)
                return;
            let domValue = el.value;
            if (trim) {
                domValue = domValue.trim();
            }
            if (castToNumber) {
                domValue = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseToNumber)(domValue);
            }
            el._assign(domValue);
        });
        if (trim) {
            addEventListener(el, 'change', () => {
                el.value = el.value.trim();
            });
        }
        if (!lazy) {
            addEventListener(el, 'compositionstart', onCompositionStart);
            addEventListener(el, 'compositionend', onCompositionEnd);
            // Safari < 10.2 & UIWebView doesn't fire compositionend when
            // switching focus before confirming composition choice
            // this also fixes the issue where some browsers e.g. iOS Chrome
            // fires "change" instead of "input" on autocomplete.
            addEventListener(el, 'change', onCompositionEnd);
        }
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
        el.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode);
        // avoid clearing unresolved text. #2302
        if (el.composing)
            return;
        if (document.activeElement === el && el.type !== 'range') {
            if (lazy) {
                return;
            }
            if (trim && el.value.trim() === value) {
                return;
            }
            if ((number || el.type === 'number') &&
                (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseToNumber)(el.value) === value) {
                return;
            }
        }
        const newValue = value == null ? '' : value;
        if (el.value !== newValue) {
            el.value = newValue;
        }
    }
};
const vModelCheckbox = {
    // #4096 array checkboxes need to be deep traversed
    deep: true,
    created(el, _, vnode) {
        el._assign = getModelAssigner(vnode);
        addEventListener(el, 'change', () => {
            const modelValue = el._modelValue;
            const elementValue = getValue(el);
            const checked = el.checked;
            const assign = el._assign;
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(modelValue)) {
                const index = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseIndexOf)(modelValue, elementValue);
                const found = index !== -1;
                if (checked && !found) {
                    assign(modelValue.concat(elementValue));
                }
                else if (!checked && found) {
                    const filtered = [...modelValue];
                    filtered.splice(index, 1);
                    assign(filtered);
                }
            }
            else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(modelValue)) {
                const cloned = new Set(modelValue);
                if (checked) {
                    cloned.add(elementValue);
                }
                else {
                    cloned.delete(elementValue);
                }
                assign(cloned);
            }
            else {
                assign(getCheckboxValue(el, checked));
            }
        });
    },
    // set initial checked on mount to wait for true-value/false-value
    mounted: setChecked,
    beforeUpdate(el, binding, vnode) {
        el._assign = getModelAssigner(vnode);
        setChecked(el, binding, vnode);
    }
};
function setChecked(el, { value, oldValue }, vnode) {
    el._modelValue = value;
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) {
        el.checked = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseIndexOf)(value, vnode.props.value) > -1;
    }
    else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value)) {
        el.checked = value.has(vnode.props.value);
    }
    else if (value !== oldValue) {
        el.checked = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseEqual)(value, getCheckboxValue(el, true));
    }
}
const vModelRadio = {
    created(el, { value }, vnode) {
        el.checked = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseEqual)(value, vnode.props.value);
        el._assign = getModelAssigner(vnode);
        addEventListener(el, 'change', () => {
            el._assign(getValue(el));
        });
    },
    beforeUpdate(el, { value, oldValue }, vnode) {
        el._assign = getModelAssigner(vnode);
        if (value !== oldValue) {
            el.checked = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseEqual)(value, vnode.props.value);
        }
    }
};
const vModelSelect = {
    // <select multiple> value need to be deep traversed
    deep: true,
    created(el, { value, modifiers: { number } }, vnode) {
        const isSetModel = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value);
        addEventListener(el, 'change', () => {
            const selectedVal = Array.prototype.filter
                .call(el.options, (o) => o.selected)
                .map((o) => number ? (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseToNumber)(getValue(o)) : getValue(o));
            el._assign(el.multiple
                ? isSetModel
                    ? new Set(selectedVal)
                    : selectedVal
                : selectedVal[0]);
        });
        el._assign = getModelAssigner(vnode);
    },
    // set value in mounted & updated because <select> relies on its children
    // <option>s.
    mounted(el, { value }) {
        setSelected(el, value);
    },
    beforeUpdate(el, _binding, vnode) {
        el._assign = getModelAssigner(vnode);
    },
    updated(el, { value }) {
        setSelected(el, value);
    }
};
function setSelected(el, value) {
    const isMultiple = el.multiple;
    if (isMultiple && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value) && !(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value)) {
        ( true) &&
            (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`<select multiple v-model> expects an Array or Set value for its binding, ` +
                `but got ${Object.prototype.toString.call(value).slice(8, -1)}.`);
        return;
    }
    for (let i = 0, l = el.options.length; i < l; i++) {
        const option = el.options[i];
        const optionValue = getValue(option);
        if (isMultiple) {
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) {
                option.selected = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseIndexOf)(value, optionValue) > -1;
            }
            else {
                option.selected = value.has(optionValue);
            }
        }
        else {
            if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseEqual)(getValue(option), value)) {
                if (el.selectedIndex !== i)
                    el.selectedIndex = i;
                return;
            }
        }
    }
    if (!isMultiple && el.selectedIndex !== -1) {
        el.selectedIndex = -1;
    }
}
// retrieve raw value set via :value bindings
function getValue(el) {
    return '_value' in el ? el._value : el.value;
}
// retrieve raw value for true-value and false-value set via :true-value or :false-value bindings
function getCheckboxValue(el, checked) {
    const key = checked ? '_trueValue' : '_falseValue';
    return key in el ? el[key] : checked;
}
const vModelDynamic = {
    created(el, binding, vnode) {
        callModelHook(el, binding, vnode, null, 'created');
    },
    mounted(el, binding, vnode) {
        callModelHook(el, binding, vnode, null, 'mounted');
    },
    beforeUpdate(el, binding, vnode, prevVNode) {
        callModelHook(el, binding, vnode, prevVNode, 'beforeUpdate');
    },
    updated(el, binding, vnode, prevVNode) {
        callModelHook(el, binding, vnode, prevVNode, 'updated');
    }
};
function resolveDynamicModel(tagName, type) {
    switch (tagName) {
        case 'SELECT':
            return vModelSelect;
        case 'TEXTAREA':
            return vModelText;
        default:
            switch (type) {
                case 'checkbox':
                    return vModelCheckbox;
                case 'radio':
                    return vModelRadio;
                default:
                    return vModelText;
            }
    }
}
function callModelHook(el, binding, vnode, prevVNode, hook) {
    const modelToUse = resolveDynamicModel(el.tagName, vnode.props && vnode.props.type);
    const fn = modelToUse[hook];
    fn && fn(el, binding, vnode, prevVNode);
}
// SSR vnode transforms, only used when user includes client-oriented render
// function in SSR
function initVModelForSSR() {
    vModelText.getSSRProps = ({ value }) => ({ value });
    vModelRadio.getSSRProps = ({ value }, vnode) => {
        if (vnode.props && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseEqual)(vnode.props.value, value)) {
            return { checked: true };
        }
    };
    vModelCheckbox.getSSRProps = ({ value }, vnode) => {
        if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isArray)(value)) {
            if (vnode.props && (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.looseIndexOf)(value, vnode.props.value) > -1) {
                return { checked: true };
            }
        }
        else if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSet)(value)) {
            if (vnode.props && value.has(vnode.props.value)) {
                return { checked: true };
            }
        }
        else if (value) {
            return { checked: true };
        }
    };
    vModelDynamic.getSSRProps = (binding, vnode) => {
        if (typeof vnode.type !== 'string') {
            return;
        }
        const modelToUse = resolveDynamicModel(
        // resolveDynamicModel expects an uppercase tag name, but vnode.type is lowercase
        vnode.type.toUpperCase(), vnode.props && vnode.props.type);
        if (modelToUse.getSSRProps) {
            return modelToUse.getSSRProps(binding, vnode);
        }
    };
}

const systemModifiers = ['ctrl', 'shift', 'alt', 'meta'];
const modifierGuards = {
    stop: e => e.stopPropagation(),
    prevent: e => e.preventDefault(),
    self: e => e.target !== e.currentTarget,
    ctrl: e => !e.ctrlKey,
    shift: e => !e.shiftKey,
    alt: e => !e.altKey,
    meta: e => !e.metaKey,
    left: e => 'button' in e && e.button !== 0,
    middle: e => 'button' in e && e.button !== 1,
    right: e => 'button' in e && e.button !== 2,
    exact: (e, modifiers) => systemModifiers.some(m => e[`${m}Key`] && !modifiers.includes(m))
};
/**
 * @private
 */
const withModifiers = (fn, modifiers) => {
    return (event, ...args) => {
        for (let i = 0; i < modifiers.length; i++) {
            const guard = modifierGuards[modifiers[i]];
            if (guard && guard(event, modifiers))
                return;
        }
        return fn(event, ...args);
    };
};
// Kept for 2.x compat.
// Note: IE11 compat for `spacebar` and `del` is removed for now.
const keyNames = {
    esc: 'escape',
    space: ' ',
    up: 'arrow-up',
    left: 'arrow-left',
    right: 'arrow-right',
    down: 'arrow-down',
    delete: 'backspace'
};
/**
 * @private
 */
const withKeys = (fn, modifiers) => {
    return (event) => {
        if (!('key' in event)) {
            return;
        }
        const eventKey = (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.hyphenate)(event.key);
        if (modifiers.some(k => k === eventKey || keyNames[k] === eventKey)) {
            return fn(event);
        }
    };
};

const vShow = {
    beforeMount(el, { value }, { transition }) {
        el._vod = el.style.display === 'none' ? '' : el.style.display;
        if (transition && value) {
            transition.beforeEnter(el);
        }
        else {
            setDisplay(el, value);
        }
    },
    mounted(el, { value }, { transition }) {
        if (transition && value) {
            transition.enter(el);
        }
    },
    updated(el, { value, oldValue }, { transition }) {
        if (!value === !oldValue)
            return;
        if (transition) {
            if (value) {
                transition.beforeEnter(el);
                setDisplay(el, true);
                transition.enter(el);
            }
            else {
                transition.leave(el, () => {
                    setDisplay(el, false);
                });
            }
        }
        else {
            setDisplay(el, value);
        }
    },
    beforeUnmount(el, { value }) {
        setDisplay(el, value);
    }
};
function setDisplay(el, value) {
    el.style.display = value ? el._vod : 'none';
}
// SSR vnode transforms, only used when user includes client-oriented render
// function in SSR
function initVShowForSSR() {
    vShow.getSSRProps = ({ value }) => {
        if (!value) {
            return { style: { display: 'none' } };
        }
    };
}

const rendererOptions = /*#__PURE__*/ (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.extend)({ patchProp }, nodeOps);
// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer;
let enabledHydration = false;
function ensureRenderer() {
    return (renderer ||
        (renderer = (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createRenderer)(rendererOptions)));
}
function ensureHydrationRenderer() {
    renderer = enabledHydration
        ? renderer
        : (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.createHydrationRenderer)(rendererOptions);
    enabledHydration = true;
    return renderer;
}
// use explicit type casts here to avoid import() calls in rolled-up d.ts
const render = ((...args) => {
    ensureRenderer().render(...args);
});
const hydrate = ((...args) => {
    ensureHydrationRenderer().hydrate(...args);
});
const createApp = ((...args) => {
    const app = ensureRenderer().createApp(...args);
    if ((true)) {
        injectNativeTagCheck(app);
        injectCompilerOptionsCheck(app);
    }
    const { mount } = app;
    app.mount = (containerOrSelector) => {
        const container = normalizeContainer(containerOrSelector);
        if (!container)
            return;
        const component = app._component;
        if (!(0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isFunction)(component) && !component.render && !component.template) {
            // __UNSAFE__
            // Reason: potential execution of JS expressions in in-DOM template.
            // The user must make sure the in-DOM template is trusted. If it's
            // rendered by the server, the template should not contain any user data.
            component.template = container.innerHTML;
        }
        // clear content before mounting
        container.innerHTML = '';
        const proxy = mount(container, false, container instanceof SVGElement);
        if (container instanceof Element) {
            container.removeAttribute('v-cloak');
            container.setAttribute('data-v-app', '');
        }
        return proxy;
    };
    return app;
});
const createSSRApp = ((...args) => {
    const app = ensureHydrationRenderer().createApp(...args);
    if ((true)) {
        injectNativeTagCheck(app);
        injectCompilerOptionsCheck(app);
    }
    const { mount } = app;
    app.mount = (containerOrSelector) => {
        const container = normalizeContainer(containerOrSelector);
        if (container) {
            return mount(container, true, container instanceof SVGElement);
        }
    };
    return app;
});
function injectNativeTagCheck(app) {
    // Inject `isNativeTag`
    // this is used for component name validation (dev only)
    Object.defineProperty(app.config, 'isNativeTag', {
        value: (tag) => (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isHTMLTag)(tag) || (0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isSVGTag)(tag),
        writable: false
    });
}
// dev only
function injectCompilerOptionsCheck(app) {
    if ((0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.isRuntimeOnly)()) {
        const isCustomElement = app.config.isCustomElement;
        Object.defineProperty(app.config, 'isCustomElement', {
            get() {
                return isCustomElement;
            },
            set() {
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`The \`isCustomElement\` config option is deprecated. Use ` +
                    `\`compilerOptions.isCustomElement\` instead.`);
            }
        });
        const compilerOptions = app.config.compilerOptions;
        const msg = `The \`compilerOptions\` config option is only respected when using ` +
            `a build of Vue.js that includes the runtime compiler (aka "full build"). ` +
            `Since you are using the runtime-only build, \`compilerOptions\` ` +
            `must be passed to \`@vue/compiler-dom\` in the build setup instead.\n` +
            `- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.\n` +
            `- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n` +
            `- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-dom`;
        Object.defineProperty(app.config, 'compilerOptions', {
            get() {
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(msg);
                return compilerOptions;
            },
            set() {
                (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(msg);
            }
        });
    }
}
function normalizeContainer(container) {
    if ((0,_vue_shared__WEBPACK_IMPORTED_MODULE_1__.isString)(container)) {
        const res = document.querySelector(container);
        if (( true) && !res) {
            (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`Failed to mount app: mount target selector "${container}" returned null.`);
        }
        return res;
    }
    if (( true) &&
        window.ShadowRoot &&
        container instanceof window.ShadowRoot &&
        container.mode === 'closed') {
        (0,_vue_runtime_core__WEBPACK_IMPORTED_MODULE_0__.warn)(`mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`);
    }
    return container;
}
let ssrDirectiveInitialized = false;
/**
 * @internal
 */
const initDirectivesForSSR = () => {
        if (!ssrDirectiveInitialized) {
            ssrDirectiveInitialized = true;
            initVModelForSSR();
            initVShowForSSR();
        }
    }
    ;




/***/ }),

/***/ "./node_modules/@vue/shared/dist/shared.esm-bundler.js":
/*!*************************************************************!*\
  !*** ./node_modules/@vue/shared/dist/shared.esm-bundler.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EMPTY_ARR": () => (/* binding */ EMPTY_ARR),
/* harmony export */   "EMPTY_OBJ": () => (/* binding */ EMPTY_OBJ),
/* harmony export */   "NO": () => (/* binding */ NO),
/* harmony export */   "NOOP": () => (/* binding */ NOOP),
/* harmony export */   "PatchFlagNames": () => (/* binding */ PatchFlagNames),
/* harmony export */   "camelize": () => (/* binding */ camelize),
/* harmony export */   "capitalize": () => (/* binding */ capitalize),
/* harmony export */   "def": () => (/* binding */ def),
/* harmony export */   "escapeHtml": () => (/* binding */ escapeHtml),
/* harmony export */   "escapeHtmlComment": () => (/* binding */ escapeHtmlComment),
/* harmony export */   "extend": () => (/* binding */ extend),
/* harmony export */   "genPropsAccessExp": () => (/* binding */ genPropsAccessExp),
/* harmony export */   "generateCodeFrame": () => (/* binding */ generateCodeFrame),
/* harmony export */   "getGlobalThis": () => (/* binding */ getGlobalThis),
/* harmony export */   "hasChanged": () => (/* binding */ hasChanged),
/* harmony export */   "hasOwn": () => (/* binding */ hasOwn),
/* harmony export */   "hyphenate": () => (/* binding */ hyphenate),
/* harmony export */   "includeBooleanAttr": () => (/* binding */ includeBooleanAttr),
/* harmony export */   "invokeArrayFns": () => (/* binding */ invokeArrayFns),
/* harmony export */   "isArray": () => (/* binding */ isArray),
/* harmony export */   "isBooleanAttr": () => (/* binding */ isBooleanAttr),
/* harmony export */   "isBuiltInDirective": () => (/* binding */ isBuiltInDirective),
/* harmony export */   "isDate": () => (/* binding */ isDate),
/* harmony export */   "isFunction": () => (/* binding */ isFunction),
/* harmony export */   "isGloballyWhitelisted": () => (/* binding */ isGloballyWhitelisted),
/* harmony export */   "isHTMLTag": () => (/* binding */ isHTMLTag),
/* harmony export */   "isIntegerKey": () => (/* binding */ isIntegerKey),
/* harmony export */   "isKnownHtmlAttr": () => (/* binding */ isKnownHtmlAttr),
/* harmony export */   "isKnownSvgAttr": () => (/* binding */ isKnownSvgAttr),
/* harmony export */   "isMap": () => (/* binding */ isMap),
/* harmony export */   "isModelListener": () => (/* binding */ isModelListener),
/* harmony export */   "isObject": () => (/* binding */ isObject),
/* harmony export */   "isOn": () => (/* binding */ isOn),
/* harmony export */   "isPlainObject": () => (/* binding */ isPlainObject),
/* harmony export */   "isPromise": () => (/* binding */ isPromise),
/* harmony export */   "isRegExp": () => (/* binding */ isRegExp),
/* harmony export */   "isReservedProp": () => (/* binding */ isReservedProp),
/* harmony export */   "isSSRSafeAttrName": () => (/* binding */ isSSRSafeAttrName),
/* harmony export */   "isSVGTag": () => (/* binding */ isSVGTag),
/* harmony export */   "isSet": () => (/* binding */ isSet),
/* harmony export */   "isSpecialBooleanAttr": () => (/* binding */ isSpecialBooleanAttr),
/* harmony export */   "isString": () => (/* binding */ isString),
/* harmony export */   "isSymbol": () => (/* binding */ isSymbol),
/* harmony export */   "isVoidTag": () => (/* binding */ isVoidTag),
/* harmony export */   "looseEqual": () => (/* binding */ looseEqual),
/* harmony export */   "looseIndexOf": () => (/* binding */ looseIndexOf),
/* harmony export */   "looseToNumber": () => (/* binding */ looseToNumber),
/* harmony export */   "makeMap": () => (/* binding */ makeMap),
/* harmony export */   "normalizeClass": () => (/* binding */ normalizeClass),
/* harmony export */   "normalizeProps": () => (/* binding */ normalizeProps),
/* harmony export */   "normalizeStyle": () => (/* binding */ normalizeStyle),
/* harmony export */   "objectToString": () => (/* binding */ objectToString),
/* harmony export */   "parseStringStyle": () => (/* binding */ parseStringStyle),
/* harmony export */   "propsToAttrMap": () => (/* binding */ propsToAttrMap),
/* harmony export */   "remove": () => (/* binding */ remove),
/* harmony export */   "slotFlagsText": () => (/* binding */ slotFlagsText),
/* harmony export */   "stringifyStyle": () => (/* binding */ stringifyStyle),
/* harmony export */   "toDisplayString": () => (/* binding */ toDisplayString),
/* harmony export */   "toHandlerKey": () => (/* binding */ toHandlerKey),
/* harmony export */   "toNumber": () => (/* binding */ toNumber),
/* harmony export */   "toRawType": () => (/* binding */ toRawType),
/* harmony export */   "toTypeString": () => (/* binding */ toTypeString)
/* harmony export */ });
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}

/**
 * dev only flag -> name mapping
 */
const PatchFlagNames = {
    [1 /* PatchFlags.TEXT */]: `TEXT`,
    [2 /* PatchFlags.CLASS */]: `CLASS`,
    [4 /* PatchFlags.STYLE */]: `STYLE`,
    [8 /* PatchFlags.PROPS */]: `PROPS`,
    [16 /* PatchFlags.FULL_PROPS */]: `FULL_PROPS`,
    [32 /* PatchFlags.HYDRATE_EVENTS */]: `HYDRATE_EVENTS`,
    [64 /* PatchFlags.STABLE_FRAGMENT */]: `STABLE_FRAGMENT`,
    [128 /* PatchFlags.KEYED_FRAGMENT */]: `KEYED_FRAGMENT`,
    [256 /* PatchFlags.UNKEYED_FRAGMENT */]: `UNKEYED_FRAGMENT`,
    [512 /* PatchFlags.NEED_PATCH */]: `NEED_PATCH`,
    [1024 /* PatchFlags.DYNAMIC_SLOTS */]: `DYNAMIC_SLOTS`,
    [2048 /* PatchFlags.DEV_ROOT_FRAGMENT */]: `DEV_ROOT_FRAGMENT`,
    [-1 /* PatchFlags.HOISTED */]: `HOISTED`,
    [-2 /* PatchFlags.BAIL */]: `BAIL`
};

/**
 * Dev only
 */
const slotFlagsText = {
    [1 /* SlotFlags.STABLE */]: 'STABLE',
    [2 /* SlotFlags.DYNAMIC */]: 'DYNAMIC',
    [3 /* SlotFlags.FORWARDED */]: 'FORWARDED'
};

const GLOBALS_WHITE_LISTED = 'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
    'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
    'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt';
const isGloballyWhitelisted = /*#__PURE__*/ makeMap(GLOBALS_WHITE_LISTED);

const range = 2;
function generateCodeFrame(source, start = 0, end = source.length) {
    // Split the content into individual lines but capture the newline sequence
    // that separated each line. This is important because the actual sequence is
    // needed to properly take into account the full line length for offset
    // comparison
    let lines = source.split(/(\r?\n)/);
    // Separate the lines and newline sequences into separate arrays for easier referencing
    const newlineSequences = lines.filter((_, idx) => idx % 2 === 1);
    lines = lines.filter((_, idx) => idx % 2 === 0);
    let count = 0;
    const res = [];
    for (let i = 0; i < lines.length; i++) {
        count +=
            lines[i].length +
                ((newlineSequences[i] && newlineSequences[i].length) || 0);
        if (count >= start) {
            for (let j = i - range; j <= i + range || end > count; j++) {
                if (j < 0 || j >= lines.length)
                    continue;
                const line = j + 1;
                res.push(`${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
                const lineLength = lines[j].length;
                const newLineSeqLength = (newlineSequences[j] && newlineSequences[j].length) || 0;
                if (j === i) {
                    // push underline
                    const pad = start - (count - (lineLength + newLineSeqLength));
                    const length = Math.max(1, end > count ? lineLength - pad : end - start);
                    res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length));
                }
                else if (j > i) {
                    if (end > count) {
                        const length = Math.max(Math.min(end - count, lineLength), 1);
                        res.push(`   |  ` + '^'.repeat(length));
                    }
                    count += lineLength + newLineSeqLength;
                }
            }
            break;
        }
    }
    return res.join('\n');
}

function normalizeStyle(value) {
    if (isArray(value)) {
        const res = {};
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const normalized = isString(item)
                ? parseStringStyle(item)
                : normalizeStyle(item);
            if (normalized) {
                for (const key in normalized) {
                    res[key] = normalized[key];
                }
            }
        }
        return res;
    }
    else if (isString(value)) {
        return value;
    }
    else if (isObject(value)) {
        return value;
    }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*.*?\*\//gs;
function parseStringStyle(cssText) {
    const ret = {};
    cssText
        .replace(styleCommentRE, '')
        .split(listDelimiterRE)
        .forEach(item => {
        if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
        }
    });
    return ret;
}
function stringifyStyle(styles) {
    let ret = '';
    if (!styles || isString(styles)) {
        return ret;
    }
    for (const key in styles) {
        const value = styles[key];
        const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
        if (isString(value) || typeof value === 'number') {
            // only render valid values
            ret += `${normalizedKey}:${value};`;
        }
    }
    return ret;
}
function normalizeClass(value) {
    let res = '';
    if (isString(value)) {
        res = value;
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i]);
            if (normalized) {
                res += normalized + ' ';
            }
        }
    }
    else if (isObject(value)) {
        for (const name in value) {
            if (value[name]) {
                res += name + ' ';
            }
        }
    }
    return res.trim();
}
function normalizeProps(props) {
    if (!props)
        return null;
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
        props.class = normalizeClass(klass);
    }
    if (style) {
        props.style = normalizeStyle(style);
    }
    return props;
}

// These tag configs are shared between compiler-dom and runtime-dom, so they
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const HTML_TAGS = 'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
    'header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,' +
    'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
    'data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,' +
    'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
    'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
    'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
    'option,output,progress,select,textarea,details,dialog,menu,' +
    'summary,template,blockquote,iframe,tfoot';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const SVG_TAGS = 'svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,' +
    'defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,' +
    'feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,' +
    'feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,' +
    'feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,' +
    'fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,' +
    'foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,' +
    'mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,' +
    'polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,' +
    'text,textPath,title,tspan,unknown,use,view';
const VOID_TAGS = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr';
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind `(process.env.NODE_ENV !== 'production')` flag.
 */
const isHTMLTag = /*#__PURE__*/ makeMap(HTML_TAGS);
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind `(process.env.NODE_ENV !== 'production')` flag.
 */
const isSVGTag = /*#__PURE__*/ makeMap(SVG_TAGS);
/**
 * Compiler only.
 * Do NOT use in runtime code paths unless behind `(process.env.NODE_ENV !== 'production')` flag.
 */
const isVoidTag = /*#__PURE__*/ makeMap(VOID_TAGS);

/**
 * On the client we only need to offer special cases for boolean attributes that
 * have different names from their corresponding dom properties:
 * - itemscope -> N/A
 * - allowfullscreen -> allowFullscreen
 * - formnovalidate -> formNoValidate
 * - ismap -> isMap
 * - nomodule -> noModule
 * - novalidate -> noValidate
 * - readonly -> readOnly
 */
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /*#__PURE__*/ makeMap(specialBooleanAttrs);
/**
 * The full list is needed during SSR to produce the correct initial markup.
 */
const isBooleanAttr = /*#__PURE__*/ makeMap(specialBooleanAttrs +
    `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,` +
    `loop,open,required,reversed,scoped,seamless,` +
    `checked,muted,multiple,selected`);
/**
 * Boolean attributes should be included if the value is truthy or ''.
 * e.g. `<select multiple>` compiles to `{ multiple: '' }`
 */
function includeBooleanAttr(value) {
    return !!value || value === '';
}
const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
const attrValidationCache = {};
function isSSRSafeAttrName(name) {
    if (attrValidationCache.hasOwnProperty(name)) {
        return attrValidationCache[name];
    }
    const isUnsafe = unsafeAttrCharRE.test(name);
    if (isUnsafe) {
        console.error(`unsafe attribute name: ${name}`);
    }
    return (attrValidationCache[name] = !isUnsafe);
}
const propsToAttrMap = {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv'
};
/**
 * Known attributes, this is used for stringification of runtime static nodes
 * so that we don't stringify bindings that cannot be set from HTML.
 * Don't also forget to allow `data-*` and `aria-*`!
 * Generated from https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
 */
const isKnownHtmlAttr = /*#__PURE__*/ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,` +
    `autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,` +
    `border,buffered,capture,challenge,charset,checked,cite,class,code,` +
    `codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,` +
    `coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,` +
    `disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,` +
    `formaction,formenctype,formmethod,formnovalidate,formtarget,headers,` +
    `height,hidden,high,href,hreflang,http-equiv,icon,id,importance,integrity,` +
    `ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,` +
    `manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,` +
    `open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,` +
    `referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,` +
    `selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,` +
    `start,step,style,summary,tabindex,target,title,translate,type,usemap,` +
    `value,width,wrap`);
/**
 * Generated from https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
 */
const isKnownSvgAttr = /*#__PURE__*/ makeMap(`xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,` +
    `arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,` +
    `baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,` +
    `clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,` +
    `color-interpolation-filters,color-profile,color-rendering,` +
    `contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,` +
    `descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,` +
    `dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,` +
    `fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,` +
    `font-family,font-size,font-size-adjust,font-stretch,font-style,` +
    `font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,` +
    `glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,` +
    `gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,` +
    `horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,` +
    `k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,` +
    `lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,` +
    `marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,` +
    `mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,` +
    `name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,` +
    `overflow,overline-position,overline-thickness,panose-1,paint-order,path,` +
    `pathLength,patternContentUnits,patternTransform,patternUnits,ping,` +
    `pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,` +
    `preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,` +
    `rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,` +
    `restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,` +
    `specularConstant,specularExponent,speed,spreadMethod,startOffset,` +
    `stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,` +
    `strikethrough-position,strikethrough-thickness,string,stroke,` +
    `stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,` +
    `stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,` +
    `systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,` +
    `text-decoration,text-rendering,textLength,to,transform,transform-origin,` +
    `type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,` +
    `unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,` +
    `v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,` +
    `vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,` +
    `writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,` +
    `xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,` +
    `xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`);

const escapeRE = /["'&<>]/;
function escapeHtml(string) {
    const str = '' + string;
    const match = escapeRE.exec(str);
    if (!match) {
        return str;
    }
    let html = '';
    let escaped;
    let index;
    let lastIndex = 0;
    for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
            case 34: // "
                escaped = '&quot;';
                break;
            case 38: // &
                escaped = '&amp;';
                break;
            case 39: // '
                escaped = '&#39;';
                break;
            case 60: // <
                escaped = '&lt;';
                break;
            case 62: // >
                escaped = '&gt;';
                break;
            default:
                continue;
        }
        if (lastIndex !== index) {
            html += str.slice(lastIndex, index);
        }
        lastIndex = index + 1;
        html += escaped;
    }
    return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
// https://www.w3.org/TR/html52/syntax.html#comments
const commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
    return src.replace(commentStripRE, '');
}

function looseCompareArrays(a, b) {
    if (a.length !== b.length)
        return false;
    let equal = true;
    for (let i = 0; equal && i < a.length; i++) {
        equal = looseEqual(a[i], b[i]);
    }
    return equal;
}
function looseEqual(a, b) {
    if (a === b)
        return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) {
        return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }
    aValidType = isSymbol(a);
    bValidType = isSymbol(b);
    if (aValidType || bValidType) {
        return a === b;
    }
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) {
        return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    }
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
        /* istanbul ignore if: this if will probably never be called */
        if (!aValidType || !bValidType) {
            return false;
        }
        const aKeysCount = Object.keys(a).length;
        const bKeysCount = Object.keys(b).length;
        if (aKeysCount !== bKeysCount) {
            return false;
        }
        for (const key in a) {
            const aHasKey = a.hasOwnProperty(key);
            const bHasKey = b.hasOwnProperty(key);
            if ((aHasKey && !bHasKey) ||
                (!aHasKey && bHasKey) ||
                !looseEqual(a[key], b[key])) {
                return false;
            }
        }
    }
    return String(a) === String(b);
}
function looseIndexOf(arr, val) {
    return arr.findIndex(item => looseEqual(item, val));
}

/**
 * For converting {{ interpolation }} values to displayed strings.
 * @private
 */
const toDisplayString = (val) => {
    return isString(val)
        ? val
        : val == null
            ? ''
            : isArray(val) ||
                (isObject(val) &&
                    (val.toString === objectToString || !isFunction(val.toString)))
                ? JSON.stringify(val, replacer, 2)
                : String(val);
};
const replacer = (_key, val) => {
    // can't use isRef here since @vue/shared has no deps
    if (val && val.__v_isRef) {
        return replacer(_key, val.value);
    }
    else if (isMap(val)) {
        return {
            [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val]) => {
                entries[`${key} =>`] = val;
                return entries;
            }, {})
        };
    }
    else if (isSet(val)) {
        return {
            [`Set(${val.size})`]: [...val.values()]
        };
    }
    else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
        return String(val);
    }
    return val;
};

const EMPTY_OBJ = ( true)
    ? Object.freeze({})
    : 0;
const EMPTY_ARR = ( true) ? Object.freeze([]) : 0;
const NOOP = () => { };
/**
 * Always return false.
 */
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith('onUpdate:');
const extend = Object.assign;
const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
        arr.splice(i, 1);
    }
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === '[object Map]';
const isSet = (val) => toTypeString(val) === '[object Set]';
const isDate = (val) => toTypeString(val) === '[object Date]';
const isRegExp = (val) => toTypeString(val) === '[object RegExp]';
const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';
const isObject = (val) => val !== null && typeof val === 'object';
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === '[object Object]';
const isIntegerKey = (key) => isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
const isReservedProp = /*#__PURE__*/ makeMap(
// the leading comma is intentional so empty string "" is also included
',key,ref,ref_for,ref_key,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted');
const isBuiltInDirective = /*#__PURE__*/ makeMap('bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo');
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
/**
 * @private
 */
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
/**
 * @private
 */
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](arg);
    }
};
const def = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};
/**
 * "123-foo" will be parsed to 123
 * This is used for the .number modifier in v-model
 */
const looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
/**
 * Only conerces number-like strings
 * "123-foo" will be returned as-is
 */
const toNumber = (val) => {
    const n = isString(val) ? Number(val) : NaN;
    return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
    return (_globalThis ||
        (_globalThis =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof __webpack_require__.g !== 'undefined'
                            ? __webpack_require__.g
                            : {}));
};
const identRE = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
function genPropsAccessExp(name) {
    return identRE.test(name)
        ? `__props.${name}`
        : `__props[${JSON.stringify(name)}]`;
}




/***/ }),

/***/ "./node_modules/async-tick/src/index.js":
/*!**********************************************!*\
  !*** ./node_modules/async-tick/src/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "debounce": () => (/* binding */ debounce),
/* harmony export */   "microtask": () => (/* binding */ microtask),
/* harmony export */   "throttle": () => (/* binding */ throttle)
/* harmony export */ });
/* harmony import */ var _microtask_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./microtask.js */ "./node_modules/async-tick/src/microtask.js");



const debounce = function(callback, delay = 100) {
    let timeout;
    const handler = function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback.apply(this, arguments);
        }, delay);
    };
    handler.cancel = () => {
        clearTimeout(timeout);
    };
    return handler;
};


const throttle = function(callback, delay = 100) {
    let last = 0;
    let timeout;
    const handler = function() {
        const now = Date.now();
        if (now > last + delay) {
            clearTimeout(timeout);
            last = now;
            callback.apply(this, arguments);
            return;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            last = now;
            callback.apply(this, arguments);
        }, delay);

    };
    handler.cancel = () => {
        clearTimeout(timeout);
        last = 0;
    };
    return handler;
};


const microtask = function(callback) {
    const mt = new _microtask_js__WEBPACK_IMPORTED_MODULE_0__["default"]();
    const handler = function() {
        mt.start(() => {
            callback.apply(this, arguments);
        });
    };
    handler.cancel = () => {
        mt.cancel();
    };
    return handler;
};


/***/ }),

/***/ "./node_modules/async-tick/src/microtask.js":
/*!**************************************************!*\
  !*** ./node_modules/async-tick/src/microtask.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Microtask)
/* harmony export */ });

class Microtask {

    start(callback) {
        this.callback = callback;
        if (this.started) {
            return;
        }
        this.started = true;
        this.create();
    }

    create() {
        if (typeof window.queueMicrotask === 'function') {
            window.queueMicrotask(() => {
                this.execute();
            });
            return;
        }

        if (typeof Promise === 'function') {
            Promise.resolve().then(() => {
                this.execute();
            });
            return;
        }

        throw new Error('Current browser does NOT support queueMicrotask or Promise');
    }

    execute() {
        if (!this.started) {
            return;
        }
        this.started = false;
        const callback = this.callback;
        // must be removed first
        this.callback = null;
        // then execute
        // because it could start another callback in executing, do not remove next callback
        if (typeof callback === 'function') {
            callback.call(this);
        }
    }

    cancel() {
        this.started = false;
        this.callback = null;
    }
}


/***/ }),

/***/ "./node_modules/lz-utils/dist/inflate.js":
/*!***********************************************!*\
  !*** ./node_modules/lz-utils/dist/inflate.js ***!
  \***********************************************/
/***/ ((module) => {

var o=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var a=o((u,s)=>{s.exports={data:`(()=>{var x=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports);var S=x((V,R)=>{var _=0,p=-3;function b(){this.table=new Uint16Array(16),this.trans=new Uint16Array(288)}function N(e,n){this.source=e,this.sourceIndex=0,this.tag=0,this.bitcount=0,this.dest=n,this.destLen=0,this.ltree=new b,this.dtree=new b}var y=new b,k=new b,w=new Uint8Array(30),h=new Uint16Array(30),L=new Uint8Array(30),T=new Uint16Array(30),O=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),A=new b,c=new Uint8Array(288+32);function D(e,n,r,a){var t,i;for(t=0;t<r;++t)e[t]=0;for(t=0;t<30-r;++t)e[t+r]=t/r|0;for(i=a,t=0;t<30;++t)n[t]=i,i+=1<<e[t]}function z(e,n){var r;for(r=0;r<7;++r)e.table[r]=0;for(e.table[7]=24,e.table[8]=152,e.table[9]=112,r=0;r<24;++r)e.trans[r]=256+r;for(r=0;r<144;++r)e.trans[24+r]=r;for(r=0;r<8;++r)e.trans[24+144+r]=280+r;for(r=0;r<112;++r)e.trans[24+144+8+r]=144+r;for(r=0;r<5;++r)n.table[r]=0;for(n.table[5]=32,r=0;r<32;++r)n.trans[r]=r}var I=new Uint16Array(16);function l(e,n,r,a){var t,i;for(t=0;t<16;++t)e.table[t]=0;for(t=0;t<a;++t)e.table[n[r+t]]++;for(e.table[0]=0,i=0,t=0;t<16;++t)I[t]=i,i+=e.table[t];for(t=0;t<a;++t)n[r+t]&&(e.trans[I[n[r+t]]++]=t)}function B(e){e.bitcount--||(e.tag=e.source[e.sourceIndex++],e.bitcount=7);var n=e.tag&1;return e.tag>>>=1,n}function u(e,n,r){if(!n)return r;for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;var a=e.tag&65535>>>16-n;return e.tag>>>=n,e.bitcount-=n,a+r}function v(e,n){for(;e.bitcount<24;)e.tag|=e.source[e.sourceIndex++]<<e.bitcount,e.bitcount+=8;var r=0,a=0,t=0,i=e.tag;do a=2*a+(i&1),i>>>=1,++t,r+=n.table[t],a-=n.table[t];while(a>=0);return e.tag=i,e.bitcount-=t,n.trans[r+a]}function C(e,n,r){var a,t,i,o,s,f;for(a=u(e,5,257),t=u(e,5,1),i=u(e,4,4),o=0;o<19;++o)c[o]=0;for(o=0;o<i;++o){var F=u(e,3,0);c[O[o]]=F}for(l(A,c,0,19),s=0;s<a+t;){var g=v(e,A);switch(g){case 16:var M=c[s-1];for(f=u(e,2,3);f;--f)c[s++]=M;break;case 17:for(f=u(e,3,3);f;--f)c[s++]=0;break;case 18:for(f=u(e,7,11);f;--f)c[s++]=0;break;default:c[s++]=g;break}}l(n,c,0,a),l(r,c,a,t)}function U(e,n,r){for(;;){var a=v(e,n);if(a===256)return _;if(a<256)e.dest[e.destLen++]=a;else{var t,i,o,s;for(a-=257,t=u(e,w[a],h[a]),i=v(e,r),o=e.destLen-u(e,L[i],T[i]),s=o;s<o+t;++s)e.dest[e.destLen++]=e.dest[s]}}}function K(e){for(var n,r,a;e.bitcount>8;)e.sourceIndex--,e.bitcount-=8;if(n=e.source[e.sourceIndex+1],n=256*n+e.source[e.sourceIndex],r=e.source[e.sourceIndex+3],r=256*r+e.source[e.sourceIndex+2],n!==(~r&65535))return p;for(e.sourceIndex+=4,a=n;a;--a)e.dest[e.destLen++]=e.source[e.sourceIndex++];return e.bitcount=0,_}function j(e,n){var r=new N(e,n),a,t,i;do{switch(a=B(r),t=u(r,2,0),t){case 0:i=K(r);break;case 1:i=U(r,y,k);break;case 2:C(r,r.ltree,r.dtree),i=U(r,r.ltree,r.dtree);break;default:i=p}if(i!==_)throw new Error("Data error")}while(!a);return r.destLen<r.dest.length?typeof r.dest.slice=="function"?r.dest.slice(0,r.destLen):r.dest.subarray(0,r.destLen):r.dest}z(y,k);D(w,h,4,3);D(L,T,2,1);w[28]=0;h[28]=258;R.exports=j});var E=x((W,q)=>{var G=S(),H=e=>Uint8Array.from(atob(e),n=>n.charCodeAt(0)),J=e=>new TextDecoder().decode(e);q.exports=function(e){if(e){let[n,r]=e.split(".");if(n&&r){let a=H(n),t=new Uint8Array(parseInt(r));return G(a,t),J(t)}}}});var P=E();onmessage=function(e){postMessage(P(e.data))};postMessage("workerReady");})();
`}});var i=a();module.exports=n=>new Promise(e=>{let r=new Worker(URL.createObjectURL(new Blob([i.data],{type:"application/javascript"})));r.onmessage=t=>{if(t.data==="workerReady"){r.postMessage(n);return}e(t.data),r.terminate()},r.onerror=t=>{e({error:t}),r.terminate()}});


/***/ }),

/***/ "./node_modules/turbogrid/dist/turbogrid.js":
/*!**************************************************!*\
  !*** ./node_modules/turbogrid/dist/turbogrid.js ***!
  \**************************************************/
/***/ ((module) => {

!function(t,e){ true?module.exports=e():0}(self,(()=>(()=>{var t={386:(t,e,i)=>{var o=i(550),n=i(45)(o);n.push([t.id,'.tg-turbogrid{position:relative;z-index:0;width:100%;height:100%;margin:0;padding:0;box-sizing:border-box;font-size:14px;font-family:arial,sans-serif;outline:0;cursor:default;overflow:hidden}.tg-turbogrid *,.tg-turbogrid *::before,.tg-turbogrid *::after{box-sizing:border-box}.tg-text-unselectable.tg-turbogrid{user-select:none}.tg-turbogrid svg{display:block;pointer-events:none}.tg-turbogrid .tg-symbols{font-family:webdings,sans-serif}.tg-turbogrid .tg-nowrap{white-space:nowrap}.tg-turbogrid .tg-align-left{text-align:left}.tg-turbogrid .tg-align-center{text-align:center}.tg-turbogrid .tg-align-right{text-align:right}@keyframes tg-fade-in{from{opacity:0}to{opacity:1}}@keyframes tg-fade-out{from{opacity:1}to{opacity:0}}.tg-turbogrid .tg-fade-in{animation-name:tg-fade-in;animation-duration:.2s;animation-fill-mode:both}.tg-turbogrid .tg-fade-in .tg-scrollbar-track{display:none}.tg-turbogrid .tg-fade-out{animation-name:tg-fade-out;animation-duration:.2s;animation-fill-mode:both}.tg-turbogrid .tg-fade-out .tg-scrollbar-track{display:none}@keyframes tg-loading-animation{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.tg-turbogrid .tg-loading{position:absolute;top:50%;left:50%;z-index:100;display:none;transform:translate(-50%, -50%);pointer-events:none}.tg-turbogrid .tg-loading-default{width:35px;height:35px;color:#0077cf;animation:1s tg-loading-animation linear infinite}.tg-turbogrid .tg-loading-fast{animation:.382s tg-loading-animation linear infinite}.tg-turbogrid .tg-checkbox{width:100%;height:100%;cursor:pointer;overflow:hidden}.tg-turbogrid .tg-checkbox:hover .tg-checkbox-item{fill:#005ba1}.tg-turbogrid .tg-checkbox.tg-select-icon-all{height:18px}.tg-turbogrid .tg-checkbox .tg-icon-checkbox{position:absolute;top:50%;left:50%;display:block;width:16px;height:16px;transform:translate(-50%, -50%)}.tg-turbogrid .tg-checkbox .tg-checkbox-item{display:none;fill:gray}.tg-turbogrid .tg-checkbox .tg-checkbox-none{display:block}.tg-turbogrid .tg-checkbox.tg-selected .tg-checkbox-selected{display:block;fill:#0077cf}.tg-turbogrid .tg-checkbox.tg-mixed .tg-checkbox-mixed{display:block;fill:#0077cf}.tg-turbogrid .tg-radio{cursor:pointer;overflow:hidden}.tg-turbogrid .tg-radio:hover .tg-icon-radio::before{border-color:#005ba1}.tg-turbogrid .tg-radio .tg-icon-radio{position:absolute;top:50%;left:50%;width:16px;height:16px;transform:translate(-50%, -50%)}.tg-turbogrid .tg-radio .tg-icon-radio::before{position:absolute;top:50%;left:50%;content:"";display:block;width:16px;height:16px;border:thin solid gray;border-radius:50%;background:#fff;transform:translate(-50%, -50%)}.tg-turbogrid .tg-radio .tg-icon-radio::after{position:absolute;top:50%;left:50%;content:"";display:none;width:10px;height:10px;border-radius:50%;background:#0077cf;transform:translate(-50%, -50%)}.tg-turbogrid .tg-radio.tg-selected .tg-icon-radio::after{display:block;border-color:#0077cf}.tg-turbogrid .tg-scrollbar{position:absolute;z-index:100;overflow:hidden;user-select:none}.tg-turbogrid .tg-scrollbar-v{top:0;right:0}.tg-turbogrid .tg-scrollbar-h{left:0;bottom:0}.tg-turbogrid .tg-scrollbar-track{position:relative;width:100%;height:100%;background:#f9f9f9;overflow:hidden;user-select:none}.tg-turbogrid .tg-scrollbar-thumb{position:absolute;top:0;left:0;border-radius:1px;background:#999;overflow:hidden;user-select:none}.tg-turbogrid .tg-scrollbar-thumb:hover{background:#888}.tg-turbogrid .tg-scrollbar-thumb-hold{background:#666}.tg-turbogrid .tg-scrollbar-thumb-hold:hover{background:#666}.tg-turbogrid .tg-scrollbar-round .tg-scrollbar-track{border-radius:10px}.tg-turbogrid .tg-scrollbar-round .tg-scrollbar-thumb{border-radius:10px}.tg-turbogrid .tg-scroll-pane{position:relative;margin:0;padding:0;border:none;outline:none;overflow:hidden}.tg-turbogrid .tg-scroll-view{position:relative;width:100%;height:100%;margin:0;padding:0;border:none;overflow:hidden}.tg-turbogrid .tg-scroll-body{position:absolute}.tg-turbogrid .tg-header{position:relative;width:10000px;border-left:0;overflow:hidden}.tg-turbogrid .tg-header-table{position:relative;color:#5e5e5e;font-weight:bold;font-size:14px;line-height:16px;border-bottom:thin solid #e5e5e5;overflow:hidden}.tg-turbogrid .tg-header-item{position:absolute;bottom:0}.tg-turbogrid .tg-header-group-item{overflow:hidden}.tg-turbogrid .tg-header-group-item::after{position:absolute;left:5px;bottom:0;content:"";display:block;width:calc(100% - 10px);height:1px;border-bottom:thin solid #ccc}.tg-turbogrid .tg-column-header{position:absolute;bottom:0;overflow:hidden}.tg-turbogrid .tg-column-header .tg-column-name{padding:10px 5px;text-overflow:ellipsis;overflow:hidden}.tg-turbogrid .tg-column-header .tg-column-name.tg-header-group-name{margin:0 5px;padding:5px 0}.tg-turbogrid .tg-column-resizing{position:absolute;top:0;right:-5px;z-index:100;width:10px;height:100%;background:#ccc;cursor:ew-resize;opacity:0}.tg-turbogrid .tg-column-sortable .tg-column-name{cursor:pointer}.tg-turbogrid .tg-column-sortable .tg-sort-indicator{cursor:pointer}.tg-turbogrid .tg-column-sorted{color:#000}.tg-turbogrid .tg-header-sort-h .tg-column-name{padding:12px 5px 15px}.tg-turbogrid .tg-header-sort-h .tg-column-sort{width:100%;height:15px;margin-top:-15px;padding:0 5px;overflow:hidden}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator{position:relative;display:none;width:100%;height:100%}.tg-turbogrid .tg-header-sort-h .tg-column-sorted .tg-column-sort .tg-sort-indicator{display:block}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator-line{position:absolute;top:1px;width:100%;height:0;border-top:thin solid #1e1e1e;overflow:hidden}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator-icon{position:absolute;top:5px;left:0;right:inherit}.tg-turbogrid .tg-header-sort-h .tg-align-right .tg-sort-indicator-icon{left:inherit;right:0}.tg-turbogrid .tg-header-sort-h .tg-align-center .tg-sort-indicator-icon{left:50%;transform:translateX(-50%)}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator-icon .tg-icon-sort-h{display:block;width:19px;height:6px}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator-icon .tg-icon-item{display:none;fill:#1e1e1e}.tg-turbogrid .tg-header-sort-h .tg-sort-indicator-icon .tg-icon-item-light{fill:#ababab}.tg-turbogrid .tg-column-sort-v{display:flex;flex-direction:row;align-items:center}.tg-turbogrid .tg-column-sort-v .tg-column-name{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.tg-turbogrid .tg-column-sort-v.tg-align-right{justify-content:right}.tg-turbogrid .tg-column-sort-v .tg-sort-indicator{position:relative;width:16px;height:16px}.tg-turbogrid .tg-column-sort-v .tg-sort-indicator-icon{position:absolute}.tg-turbogrid .tg-column-sort-v .tg-sort-indicator-icon .tg-icon-sort-v{display:block;width:10px;height:16px}.tg-turbogrid .tg-column-sort-v .tg-sort-indicator-icon .tg-icon-item{fill:#ababab}.tg-turbogrid .tg-column-sort-v .tg-sort-indicator-icon .tg-icon-item-light{fill:#ababab}.tg-turbogrid .tg-column-sort-v.tg-column-sorted .tg-sort-indicator-icon .tg-icon-item{fill:#1e1e1e}.tg-turbogrid .tg-column-sort-v.tg-column-sorted .tg-sort-indicator-icon .tg-icon-item-light{fill:#ababab}.tg-turbogrid .tg-sort-desc .tg-sort-indicator .tg-sort-indicator-icon .tg-desc{display:block}.tg-turbogrid .tg-sort-desc .tg-sort-indicator .tg-sort-indicator-icon .tg-asc{display:none}.tg-turbogrid .tg-sort-asc .tg-sort-indicator .tg-sort-indicator-icon .tg-desc{display:none}.tg-turbogrid .tg-sort-asc .tg-sort-indicator .tg-sort-indicator-icon .tg-asc{display:block}.tg-turbogrid .tg-column-line{position:absolute;top:0;left:0;z-index:100;display:none;height:100%;pointer-events:none}.tg-turbogrid .tg-column-line-item{position:absolute;top:0;bottom:0;display:block;width:0;height:100%;border-left:thin solid #ccc}.tg-turbogrid .tg-column-line-item.tg-active{border-left:thin solid #0077cf}.tg-turbogrid .tg-column-dragging{cursor:ew-resize}.tg-turbogrid .tg-column-dragging *{cursor:ew-resize}.tg-turbogrid .tg-column-dragging .tg-column-resizing{display:none}.tg-turbogrid .tg-tree{position:relative;display:flex;flex-direction:row;justify-items:left;align-items:center;width:100%;height:100%;overflow:hidden}.tg-turbogrid .tg-tree-icon{position:relative;width:15px;height:100%;min-height:9px;text-align:left;cursor:pointer;overflow:hidden}.tg-turbogrid .tg-tree-icon .tg-icon-tree{position:absolute;top:50%;left:0;display:block;width:9px;height:9px;transform:translate(0, -50%);overflow:hidden}.tg-turbogrid .tg-tree-icon .tg-tree-item{display:none}.tg-turbogrid .tg-tree-icon-collapsed .tg-tree-collapsed{display:block}.tg-turbogrid .tg-tree-icon-empty .tg-tree-collapsed{opacity:.5}.tg-turbogrid .tg-tree-icon-expanded .tg-tree-expanded{display:block}.tg-turbogrid .tg-tree-name{flex:1;text-overflow:ellipsis;overflow:hidden}.tg-turbogrid .tg-tree-header .tg-tree .tg-tree-icon{display:none}.tg-turbogrid .tg-tree-icon-all{position:relative;height:17px}.tg-turbogrid .tg-tree-header-indent .tg-tree{padding-left:5px}.tg-turbogrid .tg-tree-header-indent .tg-tree .tg-tree-icon{display:block}.tg-turbogrid .tg-tree-header-indent.tg-column-sort-h .tg-column-sort{width:calc(100% - 20px);margin-left:20px}.tg-turbogrid .tg-pane{position:absolute;width:100%;outline:0;overflow:hidden}.tg-turbogrid .tg-header-frame{position:relative;display:block;outline:0;overflow:hidden}.tg-turbogrid .tg-header-frame .tg-pane{height:100%}.tg-turbogrid .tg-body-frame{position:relative;width:100%;outline:0}.tg-turbogrid .tg-body-message{position:absolute;display:none;width:100%;height:100%;padding:10px;overflow:hidden}.tg-turbogrid .tg-body-message img,.tg-turbogrid .tg-body-message div{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)}.tg-turbogrid .tg-body{position:absolute;outline:0}.tg-turbogrid .tg-cell-hover-icon{display:none}.tg-touch-device.tg-turbogrid .tg-cell-hover-icon{display:inherit}.tg-turbogrid .tg-cell-row-number{font-weight:normal}.tg-turbogrid .tg-cell-row-drag .tg-row-drag-icon{position:absolute;top:50%;left:50%;width:24px;height:24px;cursor:move;opacity:.8;transform:translate(-50%, -50%)}.tg-turbogrid .tg-cell-row-drag .tg-row-drag-icon:hover{opacity:1}.tg-turbogrid .tg-cell{position:absolute;z-index:1;height:100%;margin:0;padding:0 5px;color:#1e1e1e;white-space:nowrap;text-overflow:ellipsis;vertical-align:middle;overflow:hidden}.tg-turbogrid .tg-cell:focus{outline:none}.tg-turbogrid .tg-cell.tg-flashing{border:1px solid red !important}.tg-turbogrid .tg-cell.tg-selected{background-color:beige}.tg-turbogrid .tg-cell.tg-multiline{padding:3px 5px;line-height:1.15;white-space:normal}.tg-turbogrid .tg-cell.tg-align-left.tg-cell-negative{padding-left:1px}.tg-turbogrid .tg-cell.tg-align-right.tg-cell-negative{padding-right:1px}.tg-turbogrid .tg-row{position:absolute;width:100%;border:0;border-bottom:thin solid #e5e5e5}.tg-turbogrid .tg-row.tg-group-line{border-bottom:thin solid #999}.tg-turbogrid .tg-row.tg-none-line{border-bottom:none}.tg-turbogrid .tg-row.tg-top-line{border-top:thin solid #e5e5e5}.tg-turbogrid .tg-row.tg-group{font-weight:bold;overflow:hidden}.tg-turbogrid .tg-row.tg-group .tg-cell.tg-align-left.tg-cell-negative{padding-left:0}.tg-turbogrid .tg-row.tg-group .tg-cell.tg-align-right.tg-cell-negative{padding-right:0}.tg-turbogrid .tg-row.tg-hover .tg-cell .tg-cell-hover-icon{display:inherit}.tg-turbogrid .tg-row.tg-dragging{opacity:.3}.tg-turbogrid .tg-row.tg-clone{z-index:1000;border:1px dashed #ccc;border-right:none;border-left:none;background:#fff;cursor:move;opacity:.5}.tg-turbogrid .tg-row.tg-clone *{cursor:move}.tg-turbogrid .tg-row-placeholder{position:absolute;z-index:9999;width:100%;border-top:2px solid #00a8e1;pointer-events:none}.tg-turbogrid .tg-row::before,.tg-turbogrid .tg-row::after{position:absolute;top:0;left:0;content:"";z-index:100;display:none;width:100%;height:100%;pointer-events:none}.tg-turbogrid .tg-hover.tg-row::before{display:block;background:rgba(0,0,0,.08)}.tg-turbogrid .tg-selected.tg-row::after{display:block;background:rgba(0,0,0,.13)}.tg-lightblue .tg-header-item{border-top:thin solid #e8eaf0;border-right:thin solid #e8eaf0}.tg-lightblue .tg-column-name{padding:5px;color:#304265}.tg-lightblue .tg-header-group-item::after{display:none}.tg-lightblue .tg-checkbox .tg-icon-item{fill:#d4d7e0}.tg-lightblue .tg-checkbox:hover .tg-icon-item{fill:#107fff}.tg-lightblue .tg-checkbox.tg-selected .tg-select-checkbox{fill:#107fff}.tg-lightblue .tg-checkbox.tg-mixed .tg-select-mixed{fill:#107fff}.tg-lightblue .tg-cell{color:#304265;border-right:thin solid #e8eaf0}.tg-lightblue .tg-cell.tg-multiline{padding:0}.tg-lightblue .tg-row{border-bottom:thin solid #e8eaf0}.tg-lightblue .tg-row.tg-group-line{border-bottom:thin solid #c9ccd8}.tg-lightblue .tg-row.tg-selected{background:rgba(58,116,213,.05)}.tg-lightblue .tg-row.tg-hover{background:rgba(58,116,213,.05)}.tg-lightblue .tg-row.tg-even{background:#fbfcfe}.tg-lightblue .tg-row.tg-odd{background:#fff}.tg-lightblue .tg-hover.tg-row::before{background:rgba(58,116,213,.05)}.tg-lightblue .tg-selected.tg-row::after{background:rgba(58,116,213,.1)}.tg-lightblue .tg-header-frame{border-bottom:thin solid #e8eaf0}.tg-lightblue .tg-row-not-found .tg-frozen-line-v{border-right:none}.tg-lightblue .tg-scrollbar-track{background:#fff}.tg-lightblue .tg-scrollbar-thumb{background:rgba(48,66,101,.35)}.tg-lightblue .tg-scrollbar-thumb:hover{background-color:#a8a8a8}.tg-lightblue .tg-scrollbar-thumb:active{background-color:#787878}.tg-dark{background:#1e1e1e}.tg-dark .tg-checkbox .tg-icon-item{fill:#ababab}.tg-dark .tg-header-table{color:#ccc;border-bottom:thin solid #333}.tg-dark .tg-header-group-item::after{border-bottom:1px solid #999}.tg-dark .tg-column-sorted{color:#fff}.tg-dark .tg-column-sorted .tg-tree-icon-all .tg-icon-item{fill:#fff}.tg-dark .tg-header-sort-h .tg-sort-indicator-line{border-top:thin solid #eee}.tg-dark .tg-header-sort-h .tg-sort-indicator-icon .tg-icon-item{fill:#eee}.tg-dark .tg-header-sort-h .tg-sort-indicator-icon .tg-icon-item-light{fill:#666}.tg-dark .tg-column-sort-v .tg-sort-indicator-icon .tg-icon-item{fill:#666}.tg-dark .tg-column-sort-v .tg-sort-indicator-icon .tg-icon-item-light{fill:#666}.tg-dark .tg-column-sort-v.tg-column-sorted .tg-sort-indicator-icon .tg-icon-item{fill:#fff}.tg-dark .tg-column-sort-v.tg-column-sorted .tg-sort-indicator-icon .tg-icon-item-light{fill:#666}.tg-dark .tg-tree-icon .tg-icon-item{fill:#fff}.tg-dark .tg-tree-icon-all .tg-icon-item{fill:#999}.tg-dark .tg-header-item .tg-tree-icon .tg-icon-item{fill:#999}.tg-dark .tg-header-item .tg-column-sorted .tg-tree-icon .tg-icon-item{fill:#fff}.tg-dark .tg-row{border-bottom:thin solid #333}.tg-dark .tg-row.tg-group-line{border-bottom:thin solid #666}.tg-dark .tg-row.tg-clone{border:1px dashed #1e1e1e;opacity:.1}.tg-dark .tg-cell{color:#eee}.tg-dark .tg-body-message{color:#eee}.tg-dark .tg-hover.tg-row::before{background:rgba(255,255,255,.1)}.tg-dark .tg-selected.tg-row::after{background:rgba(255,255,255,.2)}.tg-dark .tg-scrollbar-track{background:#333}.tg-dark .tg-scrollbar-thumb{background:#bbb}.tg-dark .tg-scrollbar-thumb:hover{background:#ddd}.tg-dark .tg-scrollbar-thumb-hold{background:#eee}.tg-dark .tg-scrollbar-thumb-hold:hover{background:#eee}.tg-pointer-events-none{pointer-events:none}',""]),t.exports=n},45:t=>{"use strict";t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var i="",o=void 0!==e[5];return e[4]&&(i+="@supports (".concat(e[4],") {")),e[2]&&(i+="@media ".concat(e[2]," {")),o&&(i+="@layer".concat(e[5].length>0?" ".concat(e[5]):""," {")),i+=t(e),o&&(i+="}"),e[2]&&(i+="}"),e[4]&&(i+="}"),i})).join("")},e.i=function(t,i,o,n,s){"string"==typeof t&&(t=[[null,t,void 0]]);var r={};if(o)for(var l=0;l<this.length;l++){var h=this[l][0];null!=h&&(r[h]=!0)}for(var a=0;a<t.length;a++){var c=[].concat(t[a]);o&&r[c[0]]||(void 0!==s&&(void 0===c[5]||(c[1]="@layer".concat(c[5].length>0?" ".concat(c[5]):""," {").concat(c[1],"}")),c[5]=s),i&&(c[2]?(c[1]="@media ".concat(c[2]," {").concat(c[1],"}"),c[2]=i):c[2]=i),n&&(c[4]?(c[1]="@supports (".concat(c[4],") {").concat(c[1],"}"),c[4]=n):c[4]="".concat(n)),e.push(c))}},e}},550:t=>{"use strict";t.exports=function(t){return t[1]}}},e={};function i(o){var n=e[o];if(void 0!==n)return n.exports;var s=e[o]={id:o,exports:{}};return t[o](s,s.exports,i),s.exports}i.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return i.d(e,{a:e}),e},i.d=(t,e)=>{for(var o in e)i.o(e,o)&&!i.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var o={};return(()=>{"use strict";i.r(o),i.d(o,{$:()=>v,CONST:()=>e,EventBase:()=>O,Grid:()=>ee,Icon:()=>Z,Motion:()=>G,ScrollPane:()=>At,TIMESTAMP:()=>oe,Util:()=>u,VERSION:()=>ie,default:()=>ne});const t="turbogrid",e={ID:t,NS:`tg-${t}`,VERSION:"3.0.7",TIMESTAMP:"2023-03-21T15:20:57.659Z",UP:"up",DOWN:"down",LEFT:"left",RIGHT:"right",TREE_INDENT:15},n=function(t){if(!t||"object"!=typeof t)return!1;const e=Object.prototype.toString.call(t);return!!["[object Object]","[object Array]"].includes(e)&&(!t.constructor||!![Object,Array].includes(t.constructor))},s=function(t,e){let i;return t.forEach((t=>{n(t)&&(i||(i=t instanceof Array?[]:{}),t instanceof Array?function(t,e,i){const o=e.length;for(let s=0;s<o;s++){const o=e[s];i&&n(o)?t[s]=r(t[s],o):t[s]=o}t instanceof Array&&(t.length=o)}(i,t,e):function(t,e,i){Object.keys(e).forEach((function(o){const s=e[o];i&&n(s)&&Object.prototype.hasOwnProperty.call(t,o)?t[o]=r(t[o],s):t[o]=s}))}(i,t,e))})),i||{}},r=function(){const t=Array.from(arguments),e=t.length;if(!e)return{};let i=!0;return!1===t[e-1]&&(i=!1),s(t,i)},l=r;class h{start(t){this.callback=t,this.started||(this.started=!0,this.create())}create(){if("function"!=typeof window.queueMicrotask){if("function"!=typeof Promise)throw new Error("Current browser does NOT support queueMicrotask or Promise");Promise.resolve().then((()=>{this.execute()}))}else window.queueMicrotask((()=>{this.execute()}))}execute(){if(!this.started)return;this.started=!1;const t=this.callback;this.callback=null,"function"==typeof t&&t.call(this)}cancel(){this.started=!1,this.callback=null}}const a=new WeakMap,c={isObject:n,merge:l,hasOwn:function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},uid:function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:8;const e="0123456789abcdefghijklmnopqrstuvwxyz",i=e.length;let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";for(;t--;)o+=e[Math.random()*i|0];return o},isNum:function(t){if("number"!=typeof t||isNaN(t))return!1;return(e=t)!==Number.MAX_VALUE&&e!==Number.MIN_VALUE&&e!==Number.NEGATIVE_INFINITY&&e!==Number.POSITIVE_INFINITY;var e},toNum:function(t,e){return"number"!=typeof t&&(t=parseFloat(t)),isNaN(t)&&(t=0),e&&!Number.isInteger(t)&&(t=Math.round(t)),t},convertNum:function(t){if("string"==typeof t){if(/^[-+]?\d+(\.\d+)?$/gi.test(t))return parseFloat(t)}return t},clamp:function(t,e,i){return Math.max(Math.min(t,i),e)},per:function(t){return t=c.toNum(t),t=c.clamp(t,0,1)},replace:function(t,e){return t=`${t}`,e?t=t.replace(/\{([^}]+)\}/g,(function(t,i){return c.hasOwn(e,i)?e[i]:t})):t},isArray:function(t){return!!(t&&t instanceof Array)},toList:function(t){return t instanceof Array?t:void 0===t?[]:"string"==typeof t?[t]:t&&c.hasOwn(t,"length")?Array.from(t):[t]},isList:function(t){return!!(c.isArray(t)&&t.length>0)},inList:function(t,e){if(!c.isList(e))return!1;for(let i=0,o=e.length;i<o;i++)if(e[i]===t)return!0;return!1},isDate:function(t){return!!(t&&t instanceof Date)&&!isNaN(t.getTime())},isPromise:function(t){return Boolean(t)&&("object"==typeof t||"function"==typeof t)&&"function"==typeof t.then},getValue:function(t,e,i){if(!e)return i;let o=t;const n=e.split("."),s=n.pop();for(;o&&n.length;){o=o[n.shift()]}if(o&&c.hasOwn(o,s)){const t=o[s];if(void 0!==t)return t}return i},forEachTree:function(t,e){const i=(t,o)=>{if(!c.isList(t))return;let n=0;const s=t.length;for(;n<s;){const s=t[n];if(!1===e(s,n,o))return!1;if(!1===i(s.subs,s))return!1;n++}};i(t)},removePreProps:function(t,e){t&&e&&Object.keys(t).filter((t=>t.startsWith(e))).forEach((e=>{t[e]=null}))},hasShiftKey:function(t){let e=!1;return t&&(e=t.shiftKey),e},isTouchDevice:function(){return"ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0},contains:function(t,e){if(!t||!e)return!1;if(t===e)return!0;if("function"==typeof t.contains)return t.contains(e);let i=e.parentNode;for(;i;){if(i===t)return!0;i=i.parentNode}return!1},isNarrowCharacter:function(t){const e=t.codePointAt(0);return e>=32&&e<=126||162===e||163===e||165===e||166===e||172===e||175===e||8361===e||e>=10214&&e<=10221||10629===e||10630===e||e>=65377&&e<=65470||e>=65474&&e<=65479||e>=65482&&e<=65487||e>=65490&&e<=65495||e>=65498&&e<=65500||e>=65512&&e<=65518},getCharLen:function(t){let e=0;if(!t)return e;for(const i of String(t))e+=c.isNarrowCharacter(i)?1:2;return e},pascalToKebabCase:function(t){return`${t}`.trim().replace(/([a-z])([A-Z])/g,"$1-$2").replace(/\W/g,(t=>/[À-ž]/.test(t)?t:"-")).replace(/^-+|-+$/g,"").replace(/-{2,}/g,"-").toLowerCase()},classMap:function(t){if("string"==typeof t)return t.trim();if(Array.isArray(t)){let e=t.filter((t=>t));return e=e.map((t=>t&&"object"==typeof t?c.classMap(t):String(t).trim())),e=e.filter((t=>t)),e=Array.from(new Set(e)),e.join(" ")}if(t&&"object"==typeof t){const e=[];return Object.keys(t).forEach((i=>{t[i]&&e.push(i)})),e.join(" ")}return""},styleMap:function(t){if("string"==typeof t)return t.trim();if(Array.isArray(t)){let e=t.filter((t=>t));return e=e.map((t=>{const e=String(t).trim();return e?-1===e.indexOf(":")?"":e.endsWith(";")?e:`${e};`:""})),e=e.filter((t=>t)),e=Array.from(new Set(e)),e.join(" ")}if(t&&"object"==typeof t){const e=[];return Object.keys(t).forEach((i=>{const o=t[i];if(o||0===o){const t=String(o).trim();t&&e.push(`${c.pascalToKebabCase(i)}: ${t};`)}})),e.join(" ")}return""},getInstance:function(t){if(t){const e=document.getElementById(t);if(e)return a.get(e)}},setInstance:function(t,e){t&&a.set(t,e)},bindEvents:function(t,e){t&&(c.unbindEvents(t),Object.keys(t).forEach((i=>{const o=t[i];o.target=o.target||e,o.target.addEventListener(i,o.handler,o.options)})))},unbindEvents:function(t){t&&Object.keys(t).forEach((e=>{const i=t[e];i.target&&i.target.removeEventListener(e,i.handler,i.options)}))},preventDefault:function(t){t&&"function"==typeof t.preventDefault&&t.cancelable&&t.preventDefault()},debounce:function(t){let e,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:100;const o=function(){clearTimeout(e),e=setTimeout((()=>{t.apply(this,arguments)}),i)};return o.cancel=()=>{clearTimeout(e)},o},throttle:function(t){let e,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:100,o=0;const n=function(){const n=Date.now();if(n>o+i)return clearTimeout(e),o=n,void t.apply(this,arguments);clearTimeout(e),e=setTimeout((()=>{o=n,t.apply(this,arguments)}),i)};return n.cancel=()=>{clearTimeout(e),o=0},n},microtask:function(t){const e=new h,i=function(){e.start((()=>{t.apply(this,arguments)}))};return i.cancel=()=>{e.cancel()},i},cancelAsync:function(t){t&&(Object.keys(t).filter((e=>e.startsWith("async")&&"function"==typeof t[e])).forEach((e=>{const i=t[e];"function"==typeof i.cancel&&(i.cancel(),t[e]=null)})),Object.keys(t).filter((t=>t.startsWith("timeout"))).forEach((e=>{clearTimeout(t[e])})))}},u=c,d={animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},g=function(t){return null!==t&&1===t.nodeType},f=function(t){return t.replace(/-([a-z])/g,(function(t,e){return e.toUpperCase()}))},p=function(t){let e=t.ownerDocument.defaultView;return e&&e.opener||(e=window),e.getComputedStyle(t)},m={},b=function(t,e){return null!=(i=t)&&i===i.window?t[`inner${e}`]:(function(t){return null!==t&&9===t.nodeType}(t)&&(t=t.body),t[`client${e}`]);var i},w=function(t){return this.list=[],t?this.create(t):this};function v(t){return new w(t)}w.prototype={constructor:w,Query:"Query",list:[],create:function(t){return t instanceof w?t:"string"==typeof t?this.createFromString(t):((t.nodeType||t===window)&&(this.list=[t]),this)},createFromString:function(t){if("<"===(t=t.trim())[0]&&">"===t[t.length-1]&&t.length>=3)this.parseHTML(t);else{const e=document.querySelectorAll(t);for(let t=0,i=e.length;t<i;t++)this.list[t]=e[t]}return this},parseHTML:function(t){const e=document.createElement("div");e.innerHTML=t;let i=e.firstChild;for(;i;)g(i)&&this.list.push(i),i=i.nextSibling;return this},get:function(t){return this.list[t]},each:function(t){if("function"!=typeof t)return this;const e=this.list;for(let i=0,o=e.length;i<o;i++){const o=e[i];if(!1===t.call(this,o,i))break}return this},add:function(t){if(!t)return this;const e=this.list;return t instanceof w?(t.each((function(t){e.push(t)})),this):(t.nodeType&&e.push(t),this)},empty:function(){return this.each((function(t){t.innerHTML=""})),this},remove:function(){return this.each((function(t,e){t&&t.parentNode&&t.parentNode.removeChild(t)})),this.list=[],this},find:function(t){const e=new w;return t&&"string"==typeof t?(this.each((function(i){if(i&&i.querySelectorAll){const o=i.querySelectorAll(t);for(let t=0,i=o.length;t<i;t++)e.add(o[t])}})),e):e},prepend:function(t){if(!t)return this;const e=new w(t);return this.each((function(t){e.each((function(e){t.insertBefore(e,t.firstChild)}))})),this},append:function(t){if(!t)return this;const e=new w(t);return this.each((function(t){e.each((function(e){t.appendChild(e)}))})),this},appendTo:function(t){if(!t)return this;const e=new w(t);return this.each((function(t){e.append(t)})),this},html:function(t){if(0===arguments.length){const t=this.get(0);return t?t.innerHTML:""}return this.each((function(e){e.innerHTML=t})),this},width:function(t){if(0===arguments.length){const t=this.get(0);return t?b(t,"Width"):0}return this.css("width",t),this},height:function(t){if(0===arguments.length){const t=this.get(0);return t?b(t,"Height"):0}return this.css("height",t),this},css:function(t,e){if(!t)return this;if(1===arguments.length){if("object"!=typeof t){const e=this.get(0);if(e){return p(e)[f(t)]}return}Object.keys(t).forEach((e=>{this.css(e,t[e])}))}return this.each((function(i){let o=e;"number"!=typeof o||d[t]||(o+="px"),i.style[t]=o})),this},attr:function(t,e){if(!t)return this;if(1===arguments.length){if("object"==typeof t)return Object.keys(t).forEach((e=>{this.attr(e,t[e])})),this;const e=this.get(0);return e?e.getAttribute(t):void 0}return this.each((function(i){i.setAttribute(t,e)})),this},removeAttr:function(t){return t?(this.each((function(e){e.hasAttribute(t)&&e.removeAttribute(t)})),this):this},removeClass:function(t){if(!arguments.length)return this.each((function(t){t.className=""})),this;if(!t||"string"!=typeof t)return this;const e=t.split(" ");return this.each((function(t){e.forEach((function(e){e&&t.classList.remove(e)}))})),this},addClass:function(t){if(!t||"string"!=typeof t)return this;const e=t.split(" ");return this.each((function(t){e.forEach((function(e){e&&t.classList.add(e)}))})),this},hasClass:function(t){if(!t||"string"!=typeof t)return!1;let e=!1;return this.each((function(i){if(i.classList.contains(t))return e=!0,!1})),e},show:function(){return this.each((function(t){if(!g(t))return;const e=function(t){if(!m[t]){const e=document.createElement(t);document.body.appendChild(e);const i=p(e).display;e.parentNode.removeChild(e),m[t]=i}return m[t]}(t.nodeName);t.style.display=e})),this},hide:function(){return this.each((function(t){if(!g(t))return;"none"!==t.style.display&&(t.style.display="none")})),this},click:function(){const t=this.get(0);return t&&"function"==typeof t.click&&t.click(),this},offset:function(){const t={left:0,top:0},e=this.get(0);if(e){const i=e.getBoundingClientRect();t.left=i.left+window.scrollX,t.top=i.top+window.scrollY}return t},clone:function(){const t=new w;return this.each((function(e){if(e&&e.cloneNode){const i=e.cloneNode(!0);t.add(i)}})),t},children:function(){const t=new w;return this.each((function(e){let i=e.firstChild;for(;i;)t.add(i),i=i.nextSibling})),t},parent:function(){const t=this.get(0);return t?new w(t.parentNode):new w},is:function(t){if(!t)return!1;const e=t.split(",");let i=!0;return this.each((function(t){if(!t.nodeName)return i=!1,!1;const o=t.nodeName.toLowerCase();return u.inList(o,e)?void 0:(i=!1,!1)})),i}},Object.defineProperty(w.prototype,"length",{get:function(){return this.list.length}});const y={createCache:function(){this.headerCache=new Map,this.bodyCache=new Map,this.dataCache=new WeakMap},setHeaderCache:function(t,e){this.headerCache.set(t,e)},getHeaderCache:function(t){return this.headerCache.get(t)},clearHeaderCache:function(){this.headerCache.clear()},setRowCache:function(t,e){this.bodyCache.set(t,{rowNodes:e,cellNodes:new Map})},getRowCache:function(t){return this.bodyCache.get(t)},deleteRowCache:function(t){const e=this.getRowNodesByIndex(t);e&&e.each((t=>{this.removeNode(t)})),this.bodyCache.delete(t)},deleteCellCache:function(t,e){t&&(this.removeNode(t.get(e)),t.delete(e))},getRowNodesByIndex:function(t){const e=this.getRowCache(t);if(e)return e.rowNodes},getCellNodeByIndex:function(t,e){const i=this.getRowCache(t);if(i)return i.cellNodes.get(e)},forEachBodyCache:function(t){this.bodyCache.forEach(((e,i)=>{t.call(this,i,e.rowNodes,e.cellNodes)}))},updateRowCacheTopOffset:function(){const t=this.frozenInfo.row;this.forEachBodyCache(((e,i,o)=>{if(!(e<=t)&&i){const t=this.getViewRowItem(e),o=this.getViewRowTop(t);i.css("top",o)}}))},setNodeDataCache:function(t,e){if(t)return this.dataCache.set(t,e)},getNodeDataCache:function(t){if(t)return this.dataCache.get(t)},removeCache:function(){this.headerCache=null,this.bodyCache=null,this.dataCache=null}},H=["onUpdated","onFirstUpdated","onHeaderUpdated","onSort","onColumnAdded","onColumnRemoved","onColumnWidthChanged","onRowAdded","onRowRemoved","onRowExpanded","onRowCollapsed","onRowSubsRequest","onRowDragged","onRowDropped","onRowMoved","onRowMouseEnter","onRowMouseLeave","onSelectChanged","onCellUpdated","onCellMouseEnter","onCellMouseLeave","onClick","onDblClick","onContextMenu","onMouseOver","onMouseOut","onScroll","onScrollStateChanged","onMouseWheel","onResize","onLayout","onKeyDown","onDestroy"],C={};H.forEach((t=>{C[t]=t}));const S=C,R={renderCells:function(t,e){t.forEach((t=>{this.drawRowCells(t,e)}))},getCellValue:function(t,e){return t[e.id]},renderCell:function(t,e,i){const o=this.getCellValue(t,e);let n=o;this.nullFormatter&&(n=this.nullFormatter.call(this,n,t,e,i));const s=t.tg_formatter||e.tg_formatter;"function"==typeof s&&(n=s.call(this,n,t,e,i)),this.renderNodeContent(i,n),this.trigger(S.onCellUpdated,{value:o,rowItem:t,columnItem:e,node:i})},getPreRenderColumnList:function(t,e){const i=[];if(!e.length)return i;for(let o=0,n=e.length;o<n;o++){const n=e[o];this.getCellNodeByIndex(t,n)||i.push(n)}return i},drawRowCells:function(t,e){const i=this.getPreRenderColumnList(t,e);i.length&&i.forEach((e=>{this.createCellNode(t,e)}))},getCellClass:function(t,e){const i=e.tg_view_index,o=["tg-cell"];return o.push(`tg-c-${i}`),e.align&&o.push(`tg-align-${e.align}`),0===e.tg_list_index&&o.push("tg-list-first"),e.tg_list_last&&o.push("tg-list-last"),o.push(u.classMap(e.classMap)),o.push(u.classMap(t[`${e.id}ClassMap`])),u.classMap(o)},createCellNode:function(t,e){const i=this.getRowCache(t);if(!i)return;const o=this.getViewRowItem(t),n=this.getViewColumnItem(e);if(!o||!n)return;const s=document.createElement("div");s.setAttribute("column",e);const r=this.getCellClass(o,n);s.className=r;const l=u.styleMap(n.styleMap)+u.styleMap(o[`${n.id}StyleMap`]);l&&(s.style.cssText=l);const h=i.rowNodes,a=n.tg_frozen,c=this.getCellRowNode(h,a);this.appendNode(c,s),this.renderCell(o,n,s),i.cellNodes.set(e,s),this.setNodeDataCache(s,{row:t,rowItem:o,rowNode:c,column:e,columnItem:n,cellNode:s})},getCellRowNode:function(t,e){const i=t.get(0);if(this.frozenInfo.columns){const o=t.get(1);return this.frozenInfo.right?e?o:i:e?i:o}return i}},T={addColumn:function(t,e,i){let o=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];const n=this.getToBeAddedItemList(t);if(!n.length)return!1;let s;if(null!=e&&(s=this.getColumnItem(e),!s))return!1;const r=this.getToBeAddedParentSubs(s,this.columns),l=[this.getToBeAddedPositionIndex(i,r),0].concat(n);r.splice.apply(r,l),this.onNextUpdated((function(){this.trigger(S.onColumnAdded,n)}));const h={type:"columns"};return o&&(h.scrollColumn=n[n.length-1]),this.render(h),!0},deleteColumn:function(t){const e=this.toColumnItemList(t,(t=>!t.private));return!!e.length&&(this.removeColumnsHandler(e),this.onNextUpdated((function(){this.trigger(S.onColumnRemoved,e)})),this.render("columns"),!0)},removeColumnsHandler:function(t){const e=[].concat(t);e.sort((function(t,e){return e.tg_index-t.tg_index})),e.forEach((t=>{let e;if(t===this.sortColumn&&this.removeSortColumn(),t.tg_parent)e=t.tg_parent.subs,e.splice(t.tg_sub_index,1);else{e=this.columns;const i=e.findIndex((e=>e===t));-1!==i&&e.splice(i,1)}!e.length&&t.tg_parent&&(t.tg_parent.subs=null)}))}},L={setColumnWidth:function(t,e){return this.updateColumnWidth(t,e)?(this.resize(),this):this},updateColumnWidth:function(t,e){const i=this.getColumnItem(t);return!!i&&(!!u.isNum(e)&&(e=Math.round(e),e=Math.max(0,e),i.tg_width!==e&&(i.width=e,i.minWidth=Math.min(i.minWidth,e),i.maxWidth=Math.max(i.maxWidth,e),this.updateViewColumnWidth(i),!0)))},showColumn:function(t){return this.updateColumnsInvisible(this.toColumnItemList(t),!1)},hideColumn:function(t){return this.updateColumnsInvisible(this.toColumnItemList(t),!0)},updateColumnsInvisible:function(t,e){if(!t.length)return!1;const i=[];return t.forEach((t=>{t.invisible!==e&&(t.invisible=e,t.tg_invisible=e,i.push(t))})),!!i.length&&(this.render("columns"),!0)}},I={showColumnLine:function(t){t&&(this.$columnLineContainer.show(),this.renderColumnLine(t))},hideColumnLine:function(){this.previousColumnLineActive||this.$columnLineContainer.hide()},setColumnLineActive:function(t){t!==this.previousColumnLineActive&&(this.previousColumnLineActive=t,t?this.$columnLineItem.addClass("tg-active"):this.$columnLineItem.removeClass("tg-active"))},getColumnLineLeft:function(t){let e=t.tg_left;return t.tg_frozen||(e-=this.scrollLeft),this.frozenInfo.right&&(t.tg_frozen?e=t.tg_left+this.paneWidthL:e-=this.columnsWidthR),e},renderColumnLine:function(t){const e=this.getHeaderItemNode(t).offsetTop,i=t.tg_width,o=this.getColumnLineLeft(t);this.$columnLineItemL.css({top:e,left:o}),this.$columnLineItemR.css({top:e,left:o+i-1}),this.frozenInfo.right||(this.frozenInfo.columns&&!t.tg_frozen&&o<this.paneWidthL?this.$columnLineItemL.hide():this.$columnLineItemL.show())},columnWidthDragStartHandler:function(t,e){const i=e.columnItem;this.$headerFrame.addClass("tg-column-dragging"),this.setColumnLineActive(!0);const o=this.getColumnHeaderNode(i);e.tg_width=o.clientWidth},columnWidthDragMoveHandler:function(t,e){const i=e.columnItem;let o=e.tg_width+e.offsetX;o=u.clamp(o,i.minWidth,i.maxWidth),i.tg_width!==o&&(i.width=o,this.updateViewColumnWidth(i),this.renderColumnLine(i))},columnWidthDragEndHandler:function(t,e){e.changed&&(this.$headerFrame.removeClass("tg-column-dragging"),this.setColumnLineActive(!1),"tg-column-resizing"!==t.target.className&&this.hideColumnLine(),this.onNextUpdated((()=>{this.renderColumnLine(e.columnItem)})),this.resize())},columnWidthTouchStartHandler:function(t,e){u.preventDefault(e.e);const i=e.columnItem;this.showColumnLine(i),this.setColumnLineActive(!0),e.index=i.tg_index;const o=this.getColumnHeaderNode(i);e.width=o.clientWidth},columnWidthTouchMoveHandler:function(t,e){u.preventDefault(e.e);const i=e.columnItem;let o=e.width+e.offsetX;o=u.clamp(o,i.minWidth,i.maxWidth),i.tg_width!==o&&(i.width=o,this.updateViewColumnWidth(i),this.renderColumnLine(i))},columnWidthTouchEndHandler:function(t,e){u.preventDefault(e.e),this.setColumnLineActive(!1),this.hideColumnLine(),this.resize()}},E={getColumnItem:function(t){return u.isNum(t)?(t<0&&(t=this.columnsInfo.length+t),this.columnsInfo.indexCache[t]):t?u.isNum(t.tg_index)?t:this.getColumnItemById(t.id||t):void 0},getColumnItemById:function(t){return this.getColumnItemBy("id",t)},getColumnItemBy:function(t,e){if(void 0!==e)return this.columnsInfo.indexCache.find((i=>i[t]===e))},getColumnsLength:function(t){return t?this.columnsInfo.length:this.viewColumns.length},getViewColumnItem:function(t){return this.viewAllColumns[t]},isColumnSortable:function(t){return!!t&&(!t.tg_group&&(!(!t.name||!t.id)&&this.isSortable(t)))},isColumnResizable:function(t){return!!t&&(!t.tg_group&&(!u.hasOwn(t,"resizable")||Boolean(t.resizable)))},updateViewColumnWidth:function(t){return t.tg_width=t.width,this.updateColumnHeaderSize(t),this.updateTotalColumnsWidth(),this.updateHeaderLayerHeight(),this.cssRulesInvalid=!0,this.resizeBodyHandler(),this.trigger(S.onColumnWidthChanged,t),!0},updateTotalColumnsWidth:function(){this.blankColumn.tg_width=0;const t=this.viewColumns;let e=0,i=0;const o=this.frozenInfo.columns,n=t.length;let s=0;for(let r=0;r<n;r++){const n=t[r];n.tg_left=s;const l=n.tg_width;l>0&&(s+=l,o&&r>=o?i+=l:e+=l)}if(this.frozenInfo.right){const t=e;e=i,i=t}this.columnsWidthL=e,this.columnsWidthR=i,this.columnsWidth=e+i},updateColumnHeaderSize:function(t){this.updateColumnHeaderWidth(t),this.updateColumnHeaderHeight(t,!0),this.updateColumnGroupWidth(t)},updateColumnHeaderWidth:function(t){const e=this.getColumnHeaderNode(t);if(!e)return;const i=t.tg_width;this.isInvisible(t)||i<=0?e.style.display="none":(e.style.display="",e.style.width=`${i}px`)},updateColumnHeaderHeight:function(t,e){if(t.tg_height=0,t.tg_width<=0)return;if(this.isInvisible(t))return;e&&(t.tg_element_height=0);const i=t.tg_element_height;if(i)return void(t.tg_height=i);const o=this.getColumnHeaderHeight(t);t.tg_height=o,t.tg_element_height=o},getColumnHeaderHeight:function(t){const e=this.getColumnHeaderNode(t);return e?e.clientHeight:0},updateColumnGroupWidth:function(t){const e=t.tg_parent;if(!e)return;const i=this.getColumnGroupWidth(e);e.tg_width!==i&&(e.tg_width=i,this.updateColumnHeaderSize(e))},getColumnGroupWidth:function(t){if(this.isInvisible(t))return 0;let e=0;return t.subs&&t.subs.forEach((t=>{this.isInvisible(t)||u.isNum(t.tg_width)&&(e+=t.tg_width)})),e}},x={initTreeInfo:function(t,e){const i=[];let o=!1,n=0,s=0;const r=function(t,r,l){(t=>{t.invisible?t.tg_invisible=!0:t.tg_invisible&&(t.tg_invisible=!1)})(t),((t,i)=>{if(e>=0&&!t.tg_invisible)return t.tg_frozen=!0,void(e-=1);t.tg_frozen&&(t.tg_frozen=!1)})(t),(t=>{if(u.hasOwn(t,"subs")){if(Array.isArray(t.subs))return o=!0,t.tg_group=!0,void(t.tg_subs_length=t.subs.length);t.subs=null}t.tg_group&&(t.tg_group=!1)})(t),((t,e)=>{t.tg_parent=e;let i=0;e&&(i=e.tg_level+1,i>n&&(n=i)),t.tg_level=i})(t,l),t.tg_index=s,t.tg_sub_index=r,i.push(t),s+=1},l=function(t,e){let i=0;const o=t.length;for(;i<o;){let o=t[i];o&&"object"==typeof o||(o={},t[i]=o),r(o,i,e),o.subs&&l(o.subs,o),i++}};return l(t),{indexCache:i,isTree:o,maxLevel:n,length:s}},initViewList:function(t,e){let i=0;const o=t.length;let n;for(;i<o;)n=t[i],n.tg_view_index=i,e.call(this,n,i),i++;return n&&(n.tg_view_last=!0),this},forEachRow:function(t){return u.forEachTree(this.rows,t),this},forEachColumn:function(t){return u.forEachTree(this.columns,t),this},forEachSelectableRow:function(t){return this.forEachRow(((e,i,o)=>{if(!this.isInvisible(e))return this.isRowSelectable(e)?t(e,i,o):void 0})),this},toRowItemList:function(t,e){let i=u.toList(t).map((t=>this.getRowItem(t))).filter((t=>t));return"function"==typeof e&&(i=i.filter(e)),i},toColumnItemList:function(t,e){let i=u.toList(t).map((t=>this.getColumnItem(t))).filter((t=>t));return"function"==typeof e&&(i=i.filter(e)),i},isRowLeaf:function(t){return!!t&&("blank"!==t.formatter&&(!t.tg_frozen&&!t.tg_group))},isRowSelectable:function(t){return!!t&&(u.hasOwn(t,"selectable")?Boolean(t.selectable):this.isRowLeaf(t))},isEmptyGroup:function(t){return!(!t||!t.tg_group||0!==t.tg_subs_length)},isInvisible:function(t){return!!t&&(!(!t.tg_filtered&&!t.tg_invisible)||!!this.isInvisible(t.tg_parent))},isSortable:function(t){return!!t&&(!u.hasOwn(t,"sortable")||Boolean(t.sortable))},isCollapsedChanged:function(t,e){return Boolean(t.collapsed)!==e},isSelectedChanged:function(t,e){return Boolean(t.selected)!==e}},P={updateCssRules:function(){this.cssRulesInvalid&&(this.cssRulesInvalid=!1,this.initCssRules(),this.updateColumnsCssRules(),this.updateHeadersCssRules(),this.updateStyleElement())},initCssRules:function(){this.cssList={},this.cssDisplayCache={};const t=this.getRowHeight(),e=this.createCssRule(".tg-row");e.height=`${t}px`,e["line-height"]=`${t}px`},resetCssDisplay:function(t){if(this.cssDisplayCache){t=t||"";for(const e in this.cssDisplayCache)if(u.hasOwn(this.cssDisplayCache,e)){this.cssDisplayCache[e].style.display=t}}},updateColumnsCssRules:function(){const t=this.viewColumns,e=this.frozenInfo.column,i={};let o=0;for(let n=0,s=t.length;n<s;n++){const s=t[n],r=this.getColumnCssWidth(s);this.updateCssRuleItem(s.tg_view_index,o,r),this.updateParentCssRules(s,o,i),n===e?o=0:o+=r}},updateParentCssRules:function(t,e,i){const o=t.tg_parent;if(!o)return;const n=o.tg_view_index;i[n]||(this.updateCssRuleItem(n,e,o.tg_width),i[n]=o,this.updateParentCssRules(o,e,i))},updateHeadersCssRules:function(){let t=0;const e=this.columnsInfo.maxLevel;for(let i=e;i>=0;i--){const e=this.headerLayerHeight[i],o=this.createCssRule(`.tg-h-${i}`);o.bottom=`${t}px`,o.height=`${e}px`,t+=e}this.getLayerCombinations(e).forEach((t=>{const e=this.createCssRule(`.tg-h-${t}`);let i=0;t.split("").forEach((t=>{i+=this.headerLayerHeight[t]||0})),e.height=`${i}px`}))},getLayerCombinations:function(t){let e="";for(;t>=0;)e+=t,t--;if(e.length<2)return[];const i=[],o=function(t,e){const n=t.length;let s=e+2;for(;s<=n;){const o=t.substring(e,s);i.push(o),s++}e<n-2&&o(t,e+1)};return o(e,0),i},updateCssRuleItem:function(t,e,i){const o=this.createCssRule(`.tg-c-${t}`);o.left=`${e}px`,o.width=`${i}px`,o.display=0===i?"none":""},createCssRule:function(t){const i=`.${e.NS}.${this.id} `+t,o={};return this.cssList[i]=o,o},getColumnCssWidth:function(t){let e=t.tg_width;return(this.isInvisible(t)||e<=0)&&(e=0),e},updateStyleElement:function(){this.styleElement||this.createStyleElement(),this.checkNewCssName()&&this.initStyleElement();const t=this.getStyleSheetCssRules();if(t)for(let e=0,i=t.length;e<i;e++)this.updateRuleProperties(t[e])},createStyleElement:function(){const t=this.shadowRoot||document.head;this.styleElement=document.createElement("style"),this.styleElement.setAttribute("context",this.id),t.appendChild(this.styleElement)},checkNewCssName:function(){if(!this.previousCssList)return!0;for(const t in this.cssList)if(u.hasOwn(this.cssList,t)&&!this.previousCssList[t])return!0;return!1},initStyleElement:function(){const t=[];Object.keys(this.cssList).forEach((function(e){t.push(`${e}{}`)}));const e=t.join("\n");this.styleElement.innerHTML=e,this.previousCssList=this.cssList},getStyleSheetCssRules:function(){const t=this.styleElement.sheet;if(t)return t.cssRules},updateRuleProperties:function(t){const e=`${t.selectorText}`,i=this.cssList[e];if(i)for(const o in i)if(u.hasOwn(i,o)){const n=i[o];t.style[o]=n,"display"===o&&"none"===n&&(this.cssDisplayCache[e]=t)}},removeCssRules:function(){this.previousCssList=null,this.cssList=null,this.cssDisplayCache=null,this.styleElement&&(this.removeNode(this.styleElement),this.styleElement=null)}},z={reset:function(){return this.firstUpdated=!1,this.headerCreated=!1,u.cancelAsync(this),u.removePreProps(this,"previous"),this.removeSortColumn(),this.columns=null,this.columnsInfo=null,this.viewColumns=null,this.viewAllColumns=null,this.viewGroupColumns=null,this.rows=null,this.rowsInfo=null,this.viewRows=null,this.headerRowItem=null,this.protectedItem=null,this.selectColumn=null,this.rowDragColumn=null,this.rowNumberColumn=null,this.blankColumn=null,this.sortColumn=null,this.nullFormatter=null,this.frozenRowsHeight=0,this.totalRowsHeight=0,this.scrollRowsHeight=0,this.bodyWidthL=0,this.bodyWidthR=0,this.bodyHeightT=0,this.bodyHeightB=0,this.paneWidthL=0,this.paneWidthR=0,this.paneHeightT=0,this.paneHeightB=0,this.scrollLeft=0,this.scrollTop=0,this.scrollTopOffset=0,this},destroy:function(){this.destroyed||(this.destroyed=!0,this.trigger(S.onDestroy),this.reset(),this.unbindWindowResize(),this.unbindContainerResize(),this.unbindEvents(),this.unbind(),this.delEventListeners(),this.removeCssRules(),this.removeScrollPane(),this.container=null,this.$container&&(this.$container.remove(),this.$container=null),this.holder=null,this.$holder&&(this.$holder.empty(),this.$holder=null),this.removeCache(),u.removePreProps(this,"$"),this.options=null,this.formatters=null,this.data=null)}},M=function(t){Object.assign(this,t),this.timeStamp=(new Date).getTime()};M.prototype={constructor:M,cancelable:!0,defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=!0},isPropagationStopped:!1,stopPropagation:function(){this.isPropagationStopped=!0},isImmediatePropagationStopped:!1,stopImmediatePropagation:function(){this.isImmediatePropagationStopped=!0,this.stopPropagation()}};const _=M,N={getEventItem:function(t,e,i,o){if(!(e=String(e)))return;o=o||{};const n=e.split(".");return{type:n.shift(),target:t,context:e,namespace:n.join("."),handler:i,once:o.once}},getEventListByString:function(t,e,i,o){const n=[];return e.split(" ").forEach((function(e){const s=N.getEventItem(t,e,i,o);s&&n.push(s)})),n},getEventListByObject:function(t,e,i){const o=[];return Object.keys(e).forEach((function(n){const s=N.getEventItem(t,n,e[n],i);s&&o.push(s)})),o},getEventList:function(t,e,i,o){return e?"string"==typeof e?N.getEventListByString(t,e,i,o):"object"==typeof e?N.getEventListByObject(t,e,i):[]:[]},addEvent:function(t,e,i){if(t.events.length>=i){let t="Possible Event memory leak detected. ";return t+=`More than ${i} (max limit) listeners added. `,t+="Use setMaxListeners(n) to increase limit.",void console.warn(t,e)}t.events.push(e)},addEvents:function(t,e,i){e.forEach((function(e){const o=e.type;t[o]||(t[o]={events:[]});if("function"!=typeof e.handler)return;const n=t[o];N.addEvent(n,e,i)}))},removeEventByNamespace:function(t,e){Object.keys(t).forEach((function(i){const o=t[i],n=[];o.events.forEach((function(t){t&&t.namespace!==e&&n.push(t)})),o.events=n}))},removeEventByHandler:function(t,e,i){const o=t[e];if(!o)return;const n=[];o.events.forEach((function(t){t&&t.handler!==i&&n.push(t)})),o.events=n},removeEventByType:function(t,e){const i=t[e];i&&(i.events=[])},removeEvent:function(t,e){const i=e.type,o=e.namespace;if(!i&&o)return void N.removeEventByNamespace(t,o);const n=e.handler;"function"!=typeof n?N.removeEventByType(t,i):N.removeEventByHandler(t,i,n)},removeEvents:function(t,e){e.forEach((function(e){N.removeEvent(t,e)}))},removeAllEvents:function(t){Object.keys(t).forEach((function(e){N.removeEventByType(t,e)}))},sendEventList:function(t,e,i,o){const n=e.events;for(let e=0;e<n.length;e++){const s=n[e];if(!s.onceCalled&&(s.once&&(s.onceCalled=!0),i.namespace=s.namespace,s.handler.call(t,i,o),i.isPropagationStopped))break}e.events=n.filter((t=>!t.onceCalled))},sendEvent:function(t,e,i,o){const n=e[i];if(!n)return;const s=new _({type:i,target:t,currentTarget:t,data:o});N.sendEventList(t,n,s,o)}},k=N;function V(t,e,i){return(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class O{constructor(){V(this,"maxListeners",10)}setMaxListeners(t){this.maxListeners=Number(t)||10}getMaxListeners(){return this.maxListeners}getEventListeners(){return this.eventListeners||(this.eventListeners={}),this.eventListeners}delEventListeners(){this.eventListeners=null}bind(t,e,i){const o=k.getEventList(this,t,e,i);if(!o.length)return this;const n=this.getEventListeners();return k.addEvents(n,o,this.maxListeners),this}once(t,e){return this.bind(t,e,{once:!0})}unbind(t,e,i){const o=this.getEventListeners();if(!arguments.length)return k.removeAllEvents(o),this;const n=k.getEventList(this,t,e,i);return n.length?(k.removeEvents(o,n),this):this}trigger(t,e){const i=this.getEventListeners();return k.sendEvent(this,i,t,e),this}}const $={DRAG_START:"drag_start",DRAG_MOVE:"drag_move",DRAG_END:"drag_end"};class B extends O{generateOptions(t){return u.merge({type:"mouse",startX:0,startY:0,previousX:0,previousY:0,currentX:0,currentY:0,moveX:0,moveY:0,offsetX:0,offsetY:0,changed:!1},t)}start(t,e){t&&(this.unbindEvents(),this.bindEvents(),this.options=this.generateOptions(e),this.startHandler(t))}bindEvents(){this.windowEvents={mousemove:{handler:t=>{this.iframeHandler(t),this.mouseMoveHandler(t)},options:!0},mouseup:{handler:t=>{this.mouseUpHandler(t)},options:{once:!0}}},u.bindEvents(this.windowEvents,window)}unbindEvents(){u.unbindEvents(this.windowEvents),this.windowEvents=null,this.previousIframe&&(this.previousIframe.classList.remove("tg-pointer-events-none"),this.previousIframe=null)}iframeHandler(t){const e=t.target;"IFRAME"===e.nodeName&&e!==this.previousIframe&&(this.previousIframe&&this.previousIframe.classList.remove("tg-pointer-events-none"),e.classList.add("tg-pointer-events-none"),this.previousIframe=e)}startHandler(t){const e=this.options;e.e=t,e.startX=t.pageX,e.startY=t.pageY,e.currentX=e.startX,e.currentY=e.startY,this.hasMoved=!1}mouseMoveHandler(t){u.preventDefault(t);const e=this.options;e.e=t,e.previousX=e.currentX,e.previousY=e.currentY,e.currentX=t.pageX,e.currentY=t.pageY,e.moveX=e.currentX-e.previousX,e.moveY=e.currentY-e.previousY,e.offsetX=e.currentX-e.startX,e.offsetY=e.currentY-e.startY,e.changed=!(0===e.offsetX&&0===e.offsetY),this.hasMoved?this.trigger($.DRAG_MOVE,e):(this.hasMoved=!0,this.trigger($.DRAG_START,e))}mouseUpHandler(t){this.unbindEvents();const e=this.options;this.hasMoved&&(e.e=t,u.preventDefault(t),this.trigger($.DRAG_END,e))}destroy(){this.unbindEvents(),this.unbind()}}var D,W,A;D=B,A=$,(W=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(W="EVENT"))in D?Object.defineProperty(D,W,{value:A,enumerable:!0,configurable:!0,writable:!0}):D[W]=A;const F={Linear:{None:function(t){return t}}},j={MOTION_START:"motion_start",MOTION_MOVE:"motion_move",MOTION_END:"motion_end",MOTION_STOP:"motion_stop"};class G extends O{constructor(t){super(),this.constructorOptions=t,this.stopped=!0}generateOptions(t){return u.merge({easing:null,duration:100,from:0,till:1,data:0},this.constructorOptions,t)}stop(){return this.stopped||(this.stopped=!0,this.cancelAnimationFrame(),this.trigger(j.MOTION_STOP,this.data)),this}start(t){return this.stop(),this.stopped=!1,this.options=this.generateOptions(t),this.initCalculation(),this.data=this.calculateHandler(0),this.trigger(j.MOTION_START,this.data),this.stopped||(this.time=Date.now(),this.requestAnimationFrame(this.moveHandler)),this}requestAnimationFrame(t){this.requestId=window.requestAnimationFrame((()=>{t.apply(this)}))}cancelAnimationFrame(){window.cancelAnimationFrame(this.requestId)}getEasing(t){return"function"!=typeof t&&(t=u.getValue(F,t,F.Linear.None)),t}moveHandler(){const t=Date.now()-this.time,e=this.duration;if(t<e){const i=t/e;return this.data=this.calculateHandler(i),this.trigger(j.MOTION_MOVE,this.data),void this.requestAnimationFrame(this.moveHandler)}this.cancelAnimationFrame(),this.data=this.calculateHandler(1),this.trigger(j.MOTION_MOVE,this.data),this.trigger(j.MOTION_END,this.data)}initCalculation(){const t=this.options;this.duration=u.toNum(t.duration,!0)||100,this.easing=this.getEasing(t.easing),this.calculateKeys=null;const e=t.from,i=t.till;u.isNum(e)&&u.isNum(i)?this.calculateType=this.calculateNumber:this.calculateType=e&&"object"==typeof e&&i&&"object"==typeof i?this.calculateObject:this.calculateNone}calculateHandler(t){const e=this.easing(t),i=this.options;return this.calculateType(e,i.from,i.till)}calculateObject(t,e,i){const o={};return this.calculateKeys?(this.calculateKeys.forEach((n=>{o[n]=this.calculateNumber(t,e[n],i[n])})),o):(this.calculateKeys=[],Object.keys(e).forEach((n=>{const s=e[n],r=i[n];u.isNum(s)&&u.isNum(r)&&(o[n]=this.calculateNumber(t,s,r),this.calculateKeys.push(n))})),o)}calculateNumber(t,e,i){return(i-e)*t+e}calculateNone(t,e,i){return e}destroy(){this.stop(),this.unbind()}}!function(t,e,i){(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i}(G,"EVENT",j);const U={TOUCH_START:"touch_start",TOUCH_MOVE:"touch_move",TOUCH_END:"touch_end",TOUCH_INERTIA:"touch_inertia"};class X extends O{generateOptions(t){return u.merge({type:"touch",startX:0,startY:0,previousX:0,previousY:0,currentX:0,currentY:0,moveX:0,moveY:0,offsetX:0,offsetY:0,changed:!1,touchLength:0,direction:"",inertia:!1,inertiaTime:200},t)}start(t,e){t&&(this.unbindEvents(),this.bindEvents(),this.options=this.generateOptions(e),this.startHandler(t))}bindEvents(){this.touchEvents={touchmove:{handler:t=>{this.touchMoveHandler(t)},options:{passive:!1}},touchend:{handler:t=>{this.touchEndHandler(t)},options:{passive:!1,once:!0}},touchcancel:{handler:t=>{this.touchCancelHandler(t)},options:{passive:!1,once:!0}}},u.bindEvents(this.touchEvents,document.body)}unbindEvents(){this.motionStop(),u.unbindEvents(this.touchEvents),this.touchEvents=null}startHandler(t){this.trackingPoints=[];const e=t.touches,i=e[0];if(!i)return;const o=this.options;o.e=t,o.startX=i.clientX,o.startY=i.clientY,o.currentX=o.startX,o.currentY=o.startY,o.touchLength=e.length,this.addTrackingPoint(o),this.trigger(U.TOUCH_START,o)}touchMoveHandler(t){const e=t.touches,i=e[0];if(!i)return;const o=this.options;o.e=t,o.previousX=o.currentX,o.previousY=o.currentY,o.currentX=i.clientX,o.currentY=i.clientY,o.moveX=o.currentX-o.previousX,o.moveY=o.currentY-o.previousY,o.offsetX=o.currentX-o.startX,o.offsetY=o.currentY-o.startY,o.changed=!(0===o.offsetX&&0===o.offsetY),o.touchLength=e.length,o.direction=this.getDirection(o),this.addTrackingPoint(o),this.trigger(U.TOUCH_MOVE,o)}touchEndHandler(t){this.unbindEvents();const e=this.options;e.e=t,this.trigger(U.TOUCH_END,e);const i=t.changedTouches[0];if(!i)return;const o=t.touches;e.touchLength=o.length,e.touchLength>0||(e.currentX=i.clientX,e.currentY=i.clientY,this.addTrackingPoint(e),this.motionStart())}touchCancelHandler(t){this.unbindEvents(),this.trigger(U.TOUCH_END,this.options)}getMotionInfo(){const t=this.trackingPoints;if(t.length<2)return;if(this.filterTrackingPoints(t),t.length<2)return;const e=t[0],i=t[t.length-1],o=i.t-e.t;if(o<=0)return;let n=i.x-e.x,s=i.y-e.y;const r=Math.abs(n),l=Math.abs(s);r>l?s=0:n=0;return{offsetDistance:Math.max(r,l),offsetTime:o,offsetX:n,offsetY:s}}motionStart(){const t=this.options;if(!t.inertia)return;const e=this.getMotionInfo();if(!e)return;const i=500*e.offsetDistance/50,o=u.clamp(i,20,2e3),n={x:20*(e.offsetX/e.offsetTime),y:20*(e.offsetY/e.offsetTime)};this.motion=new G,this.motion.bind(G.EVENT.MOTION_MOVE,((e,i)=>{t.touchInertiaX=i.x,t.touchInertiaY=i.y,this.trigger(U.TOUCH_INERTIA,t)})),this.motion.start({duration:o,from:n,till:{x:0,y:0}})}motionStop(){this.motion&&(this.motion.destroy(),this.motion=null)}getDirection(t){const i=t.offsetX,o=t.offsetY,n=Math.abs(i),s=Math.abs(o),r=Math.min(n,s),l=Math.max(n,s);if(r/l>(l<5?.5:l<10?.4:l<20?.3:.2))return"";if(n<s){if(o>0)return e.UP;if(o<0)return e.DOWN}if(n>s){if(i>0)return e.LEFT;if(i<0)return e.RIGHT}}filterTrackingPoints(t){t.reverse();const e=t.length,i=Date.now(),o=this.options.inertiaTime;for(let n=0;n<e;n++)if(i-t[n].t>o){t.length=n;break}t.reverse()}addTrackingPoint(t){if(!t.inertia)return;const e=t.currentX,i=t.currentY,o=Date.now(),n=this.trackingPoints;n.push({x:e,y:i,t:o}),n.length>100&&this.filterTrackingPoints(n)}destroy(){this.unbindEvents(),this.unbind()}}!function(t,e,i){(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i}(X,"EVENT",U);const Y={getAllEvents:function(){return[].concat(H)},bindEvents:function(){this.unbindEvents(),this.containerEvents={mousedown:{handler:t=>{this.containerMouseDownHandler(t)},options:!0},mousemove:{handler:t=>{this.containerMouseMoveHandler(t)},options:!0},mouseover:{handler:t=>{this.containerMouseOverOutHandler(t,!0)},options:!0},mouseout:{handler:t=>{this.containerMouseOverOutHandler(t,!1)},options:!0},mouseenter:{handler:t=>{this.containerMouseEnterLeaveHandler(t,!0)},options:!0},mouseleave:{handler:t=>{this.containerMouseEnterLeaveHandler(t,!1)},options:!0},touchstart:{handler:t=>{this.containerTouchStartHandler(t)},options:{passive:!1}},wheel:{handler:t=>{this.containerWheelHandler(t)},options:{passive:!1}},click:{handler:t=>{this.containerClickHandler(t)},options:!0},dblclick:{handler:t=>{this.containerDblClickHandler(t)},options:!0},contextmenu:{handler:t=>{this.containerContextMenuHandler(t)},options:!0},selectstart:{handler:t=>{this.containerSelectStartHandler(t)},options:!0},keydown:{handler:t=>{this.containerKeyDownHandler(t)},options:!0}},u.bindEvents(this.containerEvents,this.container),this.columnWidthDrag=new B,this.columnWidthDrag.bind(B.EVENT.DRAG_START,((t,e)=>{this.columnWidthDragStartHandler(t,e)})).bind(B.EVENT.DRAG_MOVE,((t,e)=>{this.columnWidthDragMoveHandler(t,e)})).bind(B.EVENT.DRAG_END,((t,e)=>{this.columnWidthDragEndHandler(t,e)})),this.columnWidthTouch=new X,this.columnWidthTouch.bind(X.EVENT.TOUCH_START,((t,e)=>{this.columnWidthTouchStartHandler(t,e)})).bind(X.EVENT.TOUCH_MOVE,((t,e)=>{this.columnWidthTouchMoveHandler(t,e)})).bind(X.EVENT.TOUCH_END,((t,e)=>{this.columnWidthTouchEndHandler(t,e)})),this.rowDrag=new B,this.rowDrag.bind(B.EVENT.DRAG_START,((t,e)=>{this.rowDragStartHandler(t,e)})).bind(B.EVENT.DRAG_MOVE,((t,e)=>{this.rowDragMoveHandler(t,e)})).bind(B.EVENT.DRAG_END,((t,e)=>{this.rowDragEndHandler(t,e)})),this.rowTouch=new X,this.rowTouch.bind(X.EVENT.TOUCH_START,((t,e)=>{this.rowDragStartHandler(t,e)})).bind(X.EVENT.TOUCH_MOVE,((t,e)=>{this.rowDragMoveHandler(t,e)})).bind(X.EVENT.TOUCH_END,((t,e)=>{this.rowDragEndHandler(t,e)})),this.scrollTouch=new X,this.scrollTouch.bind(X.EVENT.TOUCH_START,((t,e)=>{this.scrollTouchStartHandler(t,e)})).bind(X.EVENT.TOUCH_MOVE,((t,e)=>{this.scrollTouchMoveHandler(t,e)})).bind(X.EVENT.TOUCH_END,((t,e)=>{this.scrollTouchEndHandler(t,e)})).bind(X.EVENT.TOUCH_INERTIA,((t,e)=>{this.scrollTouchInertiaHandler(t,e)}))},isDefaultPrevented:function(t){return!!t&&t.defaultPrevented},getEventClosestNode:function(t,e){if(t&&t!==this.container)return t.classList.contains(e)?t:this.getEventClosestNode(t.parentNode,e)},getEventClosestData:function(t){if(!t||t===this.container)return;const e=this.getNodeDataCache(t);return e||this.getEventClosestData(t.parentNode)},getEventData:function(t){const e=this.getEventClosestData(t.target);if(e)return e.e=t,e},getWheelDelta:function(t,e,i){let o=t.deltaX,n=t.deltaY;return u.isNum(o)||(o=u.toNum(t.wheelDeltaX)),u.isNum(n)||(n=u.toNum(t.wheelDeltaY||t.wheelDelta)),1===t.deltaMode?(n*=e,o*=e):2===t.deltaMode&&(n*=i,o*=i),{deltaX:o,deltaY:n}},stabilizeTouchX:function(t){const i=t.direction;return!(this.hasVScroll||!this.hasHScroll||![e.UP,e.DOWN].includes(i))||(0===this.scrollTouchTop&&i===e.UP||(this.scrollTouchTop===this.scrollMaxTouchTop&&i===e.DOWN||void 0))},stabilizeTouchY:function(t){const i=t.direction;return!(!this.hasVScroll||this.hasHScroll||![e.LEFT,e.RIGHT].includes(i))||(0===this.scrollTouchLeft&&i===e.LEFT||(this.scrollTouchLeft===this.scrollMaxTouchLeft&&i===e.RIGHT||void 0))},columnResizingMouseDownHandler:function(t){const e=this.getEventData(t);e&&this.columnWidthDrag.start(t,{columnItem:e.columnItem})},columnResizingTouchStartHandler:function(t){const e=this.getEventData(t);e&&this.columnWidthTouch.start(t,{columnItem:e.columnItem})},columnResizingMouseEnterLeaveHandler:function(t,e){const i=this.getEventData(t);i&&(e?this.showColumnLine(i.columnItem):this.hideColumnLine())},rowDragMouseDownHandler:function(t){const e=this.getEventData(t);e&&this.rowDrag.start(t,{rowItem:e.rowItem})},rowDragTouchStartHandler:function(t){const e=this.getEventData(t);e&&(this.protectedItem=e,this.rowTouch.start(t,{rowItem:e.rowItem}))},scrollPaneTouchStartHandler:function(t){if(!this.hasHScroll&&!this.hasVScroll)return;const e=this.getEventData(t);this.protectedItem=e,this.scrollTouch.start(t,{inertia:!0})},sortHandler:function(t,e){const i=e.columnItem;if(!this.isColumnSortable(i))return;const o=this.getEventClosestNode(t.target,"tg-column-name"),n=this.getEventClosestNode(t.target,"tg-column-sort");(o||n)&&(this.trigger(S.onSort,e),this.isDefaultPrevented(t)||this.setSortColumn(i))},selectIconAllClickHandler:function(t){const e=v(t);let i=!1;(e.hasClass("tg-selected")||e.hasClass("tg-mixed"))&&(i=!0),i=!i,this.selectAll(i)},cellEnterLeaveHandler:function(t,e){const i=this.getEventData(t);i&&(e?this.trigger(S.onCellMouseEnter,i):this.trigger(S.onCellMouseLeave,i))},rowEnterLeaveHandler:function(t,e){const i=this.getEventData(t);if(i&&(e?this.trigger(S.onRowMouseEnter,i):this.trigger(S.onRowMouseLeave,i),!this.isDefaultPrevented(t)))return this.renderRowHover(i.rowItem,e),this},containerMouseDownHandler:function(t){if(this.getEventClosestNode(t.target,"tg-column-resizing"))this.columnResizingMouseDownHandler(t);else if(this.options.rowDragVisible){this.getEventClosestNode(t.target,"tg-row-drag-icon")&&this.rowDragMouseDownHandler(t)}},containerMouseMoveHandler:function(t){this.scrollbarFadeInOutHandler(t,!0)},containerMouseOverOutHandler:function(t,e){const i=this.getEventClosestNode(t.target,"tg-cell"),o=this.getEventClosestNode(t.target,"tg-header-item");if(i||o){const i=this.getEventData(t);if(!i)return;e?this.trigger(S.onMouseOver,i):this.trigger(S.onMouseOut,i)}},containerMouseEnterLeaveHandler:function(t,e){this.scrollbarFadeInOutHandler(t,e);if(v(t.target).hasClass("tg-column-resizing"))return void this.columnResizingMouseEnterLeaveHandler(t,e);if(v(t.target).hasClass("tg-cell"))return void this.cellEnterLeaveHandler(t,e);v(t.target).hasClass("tg-row")&&this.rowEnterLeaveHandler(t,e)},containerTouchStartHandler:function(t){this.scrollTouch.motionStop();if(this.getEventClosestNode(t.target,"tg-column-resizing"))this.columnResizingTouchStartHandler(t);else{if(this.options.rowDragVisible){if(this.getEventClosestNode(t.target,"tg-row-drag-icon"))return void this.rowDragTouchStartHandler(t)}this.scrollPaneTouchStartHandler(t)}},containerWheelHandler:function(t){const e=this.getRowHeight(),i=this.bodyHeight,o=this.getWheelDelta(t,e,i);if(this.trigger(S.onMouseWheel,{e:t,deltaX:o.deltaX,deltaY:o.deltaY,delta:o}),this.isDefaultPrevented(t))return;let n=!1;this.scrollPaneHidden&&(n=this.scrollPaneFrozen.setOffsetH(o.deltaX),o.deltaX=0);(this.scrollPane.mouseWheelHandler(o)||n)&&u.preventDefault(t)},containerClickHandler:function(t){if(this.getEventClosestNode(t.target,"tg-tree-icon-all"))return void this.toggleAllRows();const e=this.getEventClosestNode(t.target,"tg-select-icon-all");if(e)return void this.selectIconAllClickHandler(e);const i=this.getEventData(t);if(!i)return;if(this.getEventClosestNode(t.target,"tg-header-item")){if(this.trigger(S.onClick,i),this.isDefaultPrevented(t))return;return void this.sortHandler(t,i)}if(this.getEventClosestNode(t.target,"tg-tree-icon"))return void this.toggleRow(i.rowItem);this.getEventClosestNode(t.target,"tg-select-icon")?this.setRowSelected(i.rowItem,t):this.trigger(S.onClick,i)},containerDblClickHandler:function(t){const e=this.getEventData(t)||{e:t};this.trigger(S.onDblClick,e)},containerContextMenuHandler:function(t){const e=this.getEventData(t)||{e:t};this.trigger(S.onContextMenu,e)},containerSelectStartHandler:function(t){if(this.options.textSelectable)return;v(t.target).is("input,textarea,code")||u.preventDefault(t)},containerKeyDownHandler:function(t){if(this.trigger(S.onKeyDown,{e:t}),this.isDefaultPrevented(t))return;const e=t.keyCode,i={9:this.keyTabHandler,13:this.keyEnterHandler,27:this.keyEscHandler,33:this.keyPageUpHandler,34:this.keyPageDownHandler,35:this.keyEndHandler,36:this.keyHomeHandler,37:this.keyLeftHandler,38:this.keyUpHandler,39:this.keyRightHandler,40:this.keyDownHandler}[e];if(!i)return;i.call(this,t)&&u.preventDefault(t)},unbindEvents:function(){u.unbindEvents(this.containerEvents),this.containerEvents=null,this.columnWidthDrag&&(this.columnWidthDrag.destroy(),this.columnWidthDrag=null),this.columnWidthTouch&&(this.columnWidthTouch.destroy(),this.columnWidthTouch=null),this.rowDrag&&(this.rowDrag.destroy(),this.rowDrag=null),this.rowTouch&&(this.rowTouch.destroy(),this.rowTouch=null),this.scrollTouch&&(this.scrollTouch.destroy(),this.scrollTouch=null),this.protectedItem=null}},q={exportData:function(t){const e=this.getData();return{columns:this.getTreeSnapshot(e.columns,t),rows:this.getTreeSnapshot(e.rows,t)}},isItemExportable:function(t){return!!t&&(!u.hasOwn(t,"exportable")||Boolean(t.exportable))},getTreeSnapshot:function(t,e){const i=(t,o)=>{u.isList(o)&&o.forEach((o=>{if(!this.isItemExportable(o))return;const n=this.getItemSnapshot(o,e),s=o.subs;Array.isArray(s)&&(n.subs=[],i(n.subs,s)),t.push(n)}))},o=[];return i(o,t),o},getItemSnapshot:function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const i={};return Object.keys(t).forEach((o=>{!0!==e[o]?!1!==e[o]&&"subs"!==o&&0!==o.indexOf("tg_")&&(i[o]=t[o]):i[o]=t[o]})),i}},K={flushRow:function(t){u.toList(t).forEach((t=>{this.deleteRowCache(t)}))},flushRowFrom:function(t){u.isNum(t)&&(0!==t?this.forEachBodyCache(((e,i,o)=>{e>=t&&this.deleteRowCache(e)})):this.flushBody())},flushBody:function(){this.forEachBodyCache(((t,e,i)=>{this.deleteRowCache(t)}))},flushSort:function(){this.frozenInfo.rows?this.flushRowFrom(this.frozenInfo.rows):this.flushBody()},flushColumn:function(t){const e=u.toList(t);this.forEachBodyCache(((t,i,o)=>{e.forEach((t=>{this.deleteCellCache(o,t)}))}))},flushColumnFrom:function(t){u.isNum(t)&&this.forEachBodyCache(((e,i,o)=>{o.forEach(((e,i)=>{i>=t&&this.deleteCellCache(o,i)}))}))},flushCell:function(t,e){const i=u.toList(t),o=u.toList(e);i.forEach((t=>{const e=this.getRowCache(t);if(!e)return;const i=e.cellNodes;o.forEach((t=>{this.deleteCellCache(i,t)}))}))},flushWithViewport:function(){const{rows:t,columns:e}=this.viewport;this.forEachBodyCache(((i,o,n)=>{t.includes(i)?n.forEach(((t,i)=>{e.includes(i)||this.deleteCellCache(n,i)})):this.deleteRowCache(i)}))}},Q={"sort-h":'\n<svg class="tg-icon-sort-h" pointer-events="none" viewBox="0 0 19 6">\n    <path class="tg-icon-item tg-icon-item-light tg-asc" fill="currentColor" d="M0 0h10l-5 6z" />\n    <path class="tg-icon-item tg-asc" fill="currentColor" d="M9 6h10l-5 -6z" />\n    <path class="tg-icon-item tg-desc" fill="currentColor" d="M0 0h10l-5 6z" />\n    <path class="tg-icon-item tg-icon-item-light tg-desc" fill="currentColor" d="M9 6h10l-5 -6z" />\n</svg>\n',"sort-v":'\n<svg class="tg-icon-sort-v" pointer-events="none" viewBox="0 0 10 16">\n    <path class="tg-icon-item tg-icon-item-light tg-asc" fill="currentColor" d="M0 9h10l-5 6z" />\n    <path class="tg-icon-item tg-asc" fill="currentColor" d="M0 7h10l-5 -6z" />\n    <path class="tg-icon-item tg-desc" fill="currentColor" d="M0 9h10l-5 6z" />\n    <path class="tg-icon-item tg-icon-item-light tg-desc" fill="currentColor" d="M0 7h10l-5 -6z" />\n</svg>\n',checkbox:'\n<svg class="tg-icon-checkbox" pointer-events="none" viewBox="0 0 16 16">\n    <path class="tg-checkbox-item tg-checkbox-none" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM1,3,v9,q0,2 2,2,h9,q2,0 2,-2,v-9,q0,-2 -2,-2,h-9,q-2,0 -2,2,z" />\n    <path class="tg-checkbox-item tg-checkbox-selected" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM12,2.5 l-6,8 l-3,-3 l-1,1 l4,4 l7,-9 z" />\n    <path class="tg-checkbox-item tg-checkbox-mixed" fill="currentColor" d="M0,3 q0,-3 3,-3 h9 q3,0 3,3 v9 q0,3 -3,3 h-9 q-3,0 -3,-3 v-9 zM2.5,7 v1 h10 v-1 h-10 z" />\n</svg>\n',radio:'<div class="tg-icon-radio"><div>',drag:'\n<svg class="tg-icon-row-drag" pointer-events="none" viewBox="0 0 32 32">\n    <path fill="currentColor" d="M10 6h4v4h-4zm8 0h4v4h-4zm-8 8h4v4h-4zm8 0h4v4h-4zm-8 8h4v4h-4zm8 0h4v4h-4z"/>\n</svg>\n',tree:'\n<svg class="tg-icon-tree" pointer-events="none" viewBox="0 0 20 20">\n    <path class="tg-tree-item tg-tree-collapsed" fill="currentColor" d="M0,0 l20,10 l-20,10 z" />\n    <path class="tg-tree-item tg-tree-expanded" fill="currentColor" d="M0,0 l10,20 l10,-20 z" />\n</svg>\n'},Z={icons:Q,getIcon:function(t){let e=Q[t];return e=String(e).trim(),e}},J={header:function(t,e,i,o){return t},null:function(t,e,i,o){return e&&e.tg_group?t:null==t?"—":t},blank:function(t,e,i,o){return""},string:function(t,e,i,o){return t},number:function(t,e,i,o){return t},icon:function(t,e,i,o){return`<span class="tg-symbols">${t}</span>`},select:function(t,e,i,o){return this.isRowSelectable(e)?this.getSelectFormatterContent(e):""},rowDrag:function(t,e,i,o){return this.getRowDragFormatterContent(e)},rowNumber:function(t,e,i,o){return e.tg_row_number||""},tree:function(t,e,i,o){return this.getTreeFormatterContent(t,e)}},tt={setFormatter:function(t,e){this.renderType="all";let i=t;if("string"==typeof t){if(this.formatters)return this.formatters[t]=e,this;i={},i[t]=e}return this.customFormatters=i,this},getFormatter:function(t){if(!t)return;const e=this.formatters[t];return"function"==typeof e?e.bind(this):void 0},getDefaultFormatter:function(t){return(J[t]||J.string).bind(this)},getSelectFormatterContent:function(t){let e="radio";this.options.selectMultiple&&(e="checkbox");const i=Z.getIcon(e);return`<div class="${u.classMap(["tg-select-icon",`tg-${e}`,{"tg-selected":t.selected}])}">${i}</div>`},getRowDragFormatterContent:function(t){if(t.tg_frozen)return"";return`<div class="tg-row-drag-icon">${Z.getIcon("drag")}</div>`},getTreeIndentWidth:function(t,i,o){if(!t)return 0;let n=5;return i||(n+=e.TREE_INDENT),n+=o*e.TREE_INDENT,n},getTreeFormatterContent:function(t,e){const i=this.rowsInfo.isTree,o=e.tg_group,n=this.isEmptyGroup(e);n&&(e.collapsed=!0);const s=e.collapsed,r=u.toNum(e.tg_level),l=this.getTreeIndentWidth(i,o,r),h=[];if(h.push(`<div class="tg-tree" style="padding-left:${l}px;">`),o){const t={"tg-tree-icon":!0,"tg-tree-icon-collapsed":s,"tg-tree-icon-expanded":!s,"tg-tree-icon-empty":n},e=Z.getIcon("tree"),i=`<div class="${u.classMap(t)}">${e}</div>`;h.push(i)}return h.push(`<div class="tg-tree-name">${t}</div>`),h.push("</div>"),h.join("")}},et={renderHeaderTables:function(){this.clearHeaderCache();const t=this.viewColumns,e=this.frozenInfo.columns;this.hasTreeColumn=!1,this.hasSortColumn=!1;let i=[],o=[];for(let n=0,s=t.length;n<s;n++){const s=t[n];this.isColumnSortable(s)&&(this.hasSortColumn=!0),e&&n>=e?o.push(s):i.push(s)}if(this.frozenInfo.right){const t=i;i=o,o=t}this.renderHeaderTable(i,this.$headerL),this.renderHeaderTable(o,this.$headerR)},renderHeaderTable:function(t,e){const i=document.createElement("div"),o=["tg-header-table"];this.hasSortColumn&&(o.push("tg-header-sortable"),o.push(`tg-header-sort-${this.options.sortIndicator}`)),i.className=u.classMap(o),t.forEach((t=>{this.renderHeaderItem(t,i)})),e.append(i)},renderHeaderItem:function(t,e){const i=t.tg_view_index;if(this.getHeaderCache(i))return;const o=this.getHeaderItemClass(t),n=u.styleMap(t.headerStyleMap),s={column:i,class:o,data:t.id};n&&(s.style=n);const r=[this.createColumnHeader(t)];if(this.isColumnResizable(t)){const e=this.createColumnResizing(t);r.push(e)}const l=this.createElement("div",s,r);e.appendChild(l),this.setHeaderCache(i,l),this.setNodeDataCache(l,{rowItem:this.headerRowItem,column:i,columnItem:t,headerNode:l}),t.tg_parent&&this.renderHeaderItem(t.tg_parent,e)},createColumnHeader:function(t){const e={class:this.getHeaderClass(t),style:this.getHeaderStyle(t)},i=[this.createColumnName(t)];if(this.hasSortColumn&&!t.tg_group){const e=this.createColumnSort(t);i.push(e)}return this.createElement("div",e,i)},createColumnName:function(t){const e=["tg-column-name"];t.tg_group&&e.push("tg-header-group-name");const i={class:e.join(" ")};let o=t.name;const n=t.tg_headerFormatter;return"function"==typeof n&&(o=n.call(this,o,this.headerRowItem,t)),"tree"===t.formatter?o=this.createHeaderTreeName(o):t===this.selectColumn&&this.isSelectAllVisible()&&(o=this.createHeaderSelectName()),this.createElement("div",i,o)},createHeaderTreeName:function(t){this.hasTreeColumn=!0;const e=[];if(this.options.collapseAllVisible){const t=Z.getIcon("tree"),i=this.createElement("div",{class:"tg-tree-icon tg-tree-icon-all"},t);e.push(i)}else{const t=this.createElement("div",{class:"tg-tree-icon"});e.push(t)}const i=this.createElement("div",{class:"tg-tree-name"},t);e.push(i);return this.createElement("div",{class:"tg-tree"},e)},createHeaderSelectName:function(){const t=Z.getIcon("checkbox");return this.createElement("div",{class:"tg-select-icon-all tg-checkbox"},t)},createColumnSort:function(t){let e;return this.isColumnSortable(t)&&(e="h"===this.options.sortIndicator?this.createSortIndicatorH(t):this.createSortIndicatorV(t)),this.createElement("div",{class:"tg-column-sort"},e)},createSortIndicatorH:function(t){const e=Z.getIcon("sort-h"),i=[this.createElement("div",{class:"tg-sort-indicator-line"}),this.createElement("div",{class:"tg-sort-indicator-icon"},e)];return this.createElement("div",{class:"tg-sort-indicator"},i)},createSortIndicatorV:function(t){const e=Z.getIcon("sort-v"),i=[this.createElement("div",{class:"tg-sort-indicator-icon"},e)];return this.createElement("div",{class:"tg-sort-indicator"},i)},createColumnResizing:function(){return this.createElement("div",{class:"tg-column-resizing"})},getHeaderItemClass:function(t){const e=["tg-header-item"];return t.tg_group&&e.push("tg-header-group-item"),e.push(`tg-c-${t.tg_view_index}`),e.push(`tg-h-${t.tg_layer}`),t.tg_combination&&e.push(`tg-h-${t.tg_combination}`),e.push(u.classMap(t.headerClassMap)),u.classMap(e)},getHeaderClass:function(t){const e=["tg-column-header"];return"tree"===t.formatter&&(e.push("tg-tree-header"),this.rowsInfo.isTree&&e.push("tg-tree-header-indent")),this.isColumnSortable(t)&&e.push(`tg-column-sortable tg-column-sort-${this.options.sortIndicator}`),t.align&&e.push(`tg-align-${t.align}`),e.join(" ")},getHeaderStyle:function(t){const e=[u.styleMap(t.headerStyleMap)],i=t.tg_width;return this.isInvisible(t)||i<=0?e.push("display:none;"):e.push(`width:${i}px;`),e.join("")}},it={renderHeader:function(){this.cssRulesInvalid=!0,this.$headerL.empty(),this.$headerR.empty(),this.resetCssDisplay(),this.renderHeaderTables(),this.renderHeaderSort(),this.headerCreated=!0,this.trigger(S.onHeaderUpdated,{node:this.$headerFrame.get(0)})},initHeaderLayerHeight:function(){this.updateScrollPaneHiddenState(),this.resetCssDisplay(),this.viewAllColumns.forEach((t=>{this.updateColumnHeaderHeight(t)})),this.resetCssDisplay("none"),this.updateHeaderLayerHeight()},updateHeaderLayerHeight:function(){const t={},e=this.columnsInfo.maxLevel;for(let i=0;i<=e;i++)t[i]=0;const i=[];this.viewAllColumns.forEach((function(e){if(e.tg_combination)i.push(e);else{const i=e.tg_height,o=e.tg_layer;t[o]=Math.max(t[o],i)}})),i.forEach((function(e){let i=e.tg_height;const o=e.tg_combination.split(""),n=o.pop();o.forEach((function(e){i-=t[e]||0})),t[n]=Math.max(t[n],i)}));const o=JSON.stringify(t);this.previousHeaderLayerHeight!==o&&(this.previousHeaderLayerHeight=o,this.headerLayerHeight=t,this.cssRulesInvalid=!0)}};var ot=i(386),nt=i.n(ot);const st={create:function(t){this.id=u.uid(4,"tg-"),u.isObject(t)||(t={container:t}),this.constructorOptions=t,this.createCache(),this.createView(t.container)},createView:function(t){this.createHolder(t),this.$holder?(this.createGlobalStyle(),this.createContainer()):console.error("Grid requires a container")},createHolder:function(t){const e=v(t);if(!e.length)return;this.$holder=e,this.$holder.empty(),this.holder=this.$holder.get(0);const i=this.holder.getRootNode();this.shadowRoot=null,i&&i.host&&(this.shadowRoot=i)},createGlobalStyle:function(){const t=this.shadowRoot||document.head;if(t.querySelector(`style[context="${e.ID}"]`))return;const i=document.createElement("style");i.setAttribute("context",e.ID),i.innerHTML=nt().toString(),t.appendChild(i)},createContainer:function(){return this.$container=v('<div tabindex="0">\r\n\r\n    <div class="tg-header-frame">\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-header tg-pane-left tg-pane-header-left">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-header tg-header-left"></div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-header tg-pane-right tg-pane-header-right">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-header tg-header-right"></div>\r\n            </div>\r\n        </div>\r\n\r\n    </div>\r\n\r\n    <div class="tg-body-frame">\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-top tg-pane-left tg-pane-top-left">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-body tg-body-top tg-body-left tg-body-top-left"></div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-top tg-pane-right tg-pane-top-right">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-body tg-body-top tg-body-right tg-body-top-right"></div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-bottom tg-pane-left tg-pane-bottom-left">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-body tg-body-bottom tg-body-left tg-body-bottom-left"></div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class="tg-scroll-pane tg-pane tg-pane-bottom tg-pane-right tg-pane-bottom-right">\r\n            <div class="tg-scroll-view">\r\n                <div class="tg-scroll-body tg-body tg-body-bottom tg-body-right tg-body-bottom-right"></div>\r\n            </div>\r\n        </div>\r\n\r\n        <div class="tg-body-message"></div>\r\n\r\n    </div>\r\n\r\n    <div class="tg-column-line">\r\n        <div class="tg-column-line-item tg-column-line-l"></div>\r\n        <div class="tg-column-line-item tg-column-line-r"></div>\r\n    </div>\r\n\r\n    <div class="tg-loading">\r\n        <div class="tg-loading-default">\r\n            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" pointer-events="none" width="100%" height="100%">\r\n                <path\r\n                    d="M1,8 A7 7 0 1 1 8 15"\r\n                    stroke="currentColor"\r\n                    stroke-width="2"\r\n                    stroke-linecap="round"\r\n                    fill="none"\r\n                />\r\n            </svg>\r\n        </div>\r\n    </div>\r\n\r\n</div>\r\n').appendTo(this.$holder),this.$container.attr("id",this.id),this.$container.addClass(`${e.NS} ${this.id}`),this.container=this.$container.get(0),u.setInstance(this.container,this),this.$headerFrame=this.$container.find(".tg-header-frame"),this.$paneHL=this.$headerFrame.find(".tg-pane-header-left"),this.$paneHR=this.$headerFrame.find(".tg-pane-header-right"),this.$headerL=this.$paneHL.find(".tg-header-left"),this.$headerR=this.$paneHR.find(".tg-header-right"),this.$header=v().add(this.$headerL).add(this.$headerR),this.$bodyFrame=this.$container.find(".tg-body-frame"),this.$paneTL=this.$bodyFrame.find(".tg-pane-top-left"),this.$paneTR=this.$bodyFrame.find(".tg-pane-top-right"),this.$paneBL=this.$bodyFrame.find(".tg-pane-bottom-left"),this.$paneBR=this.$bodyFrame.find(".tg-pane-bottom-right"),this.$bodyTL=this.$paneTL.find(".tg-body-top-left"),this.$bodyTR=this.$paneTR.find(".tg-body-top-right"),this.$bodyBL=this.$paneBL.find(".tg-body-bottom-left"),this.$bodyBR=this.$paneBR.find(".tg-body-bottom-right"),this.$body=v().add(this.$bodyTL).add(this.$bodyTR).add(this.$bodyBL).add(this.$bodyBR),this.$columnLineContainer=this.$container.find(".tg-column-line"),this.$columnLineItem=this.$columnLineContainer.find(".tg-column-line-item"),this.$columnLineItemL=this.$columnLineContainer.find(".tg-column-line-l"),this.$columnLineItemR=this.$columnLineContainer.find(".tg-column-line-r"),this}},rt={initColumnsHandler:function(){this.columns=this.data.columns,this.columns.forEach(((t,e)=>{t&&"object"==typeof t||(this.columns[e]={})}));const t=this.getPrivateColumns();this.columnsInfo=this.initTreeInfo(t,this.frozenInfo.column);const e=[],i=[],o=(t,n)=>{if(!u.isList(t))return;let s,r=0;t.forEach((t=>{if(!this.isInvisible(t))if(t.tg_group){if(this.isEmptyGroup(t))return;i.push(t),o(t.subs,t)}else t.tg_list_index=r,r+=1,t.tg_list_last=!1,s=t,e.push(t)})),s&&(s.tg_list_last=!0)};o(t),e.forEach((t=>{this.initColumnItemHandler(t)}));const n=[].concat(e).concat(i);this.initViewList(n,((t,e)=>{})),this.viewColumns=e,this.viewGroupColumns=i,this.viewAllColumns=n,this.initHeaderHandler(t),this.initSortColumn()},getPrivateColumns:function(){const t=this.options;this.selectColumn=t.selectColumn,this.rowDragColumn=t.rowDragColumn,this.rowNumberColumn=t.rowNumberColumn,this.blankColumn=t.blankColumn;let e=[];const i=()=>{t.selectVisible&&e.push(this.selectColumn),t.rowDragVisible&&e.push(this.rowDragColumn),t.rowNumberVisible&&(this.rowNumberColumn.width=t.rowNumberWidth,e.push(this.rowNumberColumn))};if(this.frozenInfo.right){const t=this.frozenInfo.column;this.columns.forEach(((o,n)=>{e.push(o),n===t&&i()}))}else i(),e=e.concat(this.columns);return e.push(this.blankColumn),e},setColumns:function(t){this.data.columns=u.toList(t),this.rerender()},getColumns:function(){return this.columns},getViewColumns:function(t){return t?this.viewAllColumns:this.viewColumns},initColumnItemHandler:function(t){this.initColumnProps(t),this.initColumnFormatter(t),this.initColumnWidth(t)},initColumnProps:function(t){const e=this.options.columnTypes;if(!u.hasOwn(t,"type")){const i=e[t.id];"string"==typeof i&&(t.type=i)}let i=this.options.columnProps;const o=e[t.type];o&&"object"==typeof o&&(i=u.merge(i,o));for(const e in i)u.hasOwn(t,e)||(t[e]=i[e])},initColumnFormatter:function(t){this.initColumnFormatterByName(t,"headerFormatter","header");let e=t.type;const i=t.formatter;"string"==typeof i&&(e=i),this.initColumnFormatterByName(t,"formatter",e)},initColumnFormatterByName:function(t,e,i){let o=t[e];"function"!=typeof o?(o=this.getFormatter(i),t[`tg_${e}`]=o||this.getFormatter("string")):t[`tg_${e}`]=o.bind(this)},initColumnWidth:function(t){if(t!==this.blankColumn)return u.isNum(t.width)&&t.width>=0?(t.tg_width=t.width,t.minWidth=Math.min(t.minWidth,t.tg_width),void(t.maxWidth=Math.max(t.maxWidth,t.tg_width))):void this.initColumnWidthByName(t);t.tg_width=0},initColumnWidthByName:function(t){const e=this.getComputedColumnWidth(t);u.isNum(e)&&(t.tg_width=e)},getComputedColumnWidth:function(t){const e=t.name||"",i=u.getCharLen(e);let o=Math.round(10*i);return o>103&&(o=Math.max(103,Math.round(10*i/2)),o>133&&(o=Math.max(133,Math.round(10*i/3)),o>163&&(o=Math.max(163,Math.round(10*i/4))))),u.clamp(o,t.minWidth,t.maxWidth)},initSortColumn:function(){this.sortColumn=null;const t=this.options,e=t.sortField;if(!e)return;const i=this.getColumnItemById(e);return i&&this.isColumnSortable(i)?(u.hasOwn(i,"sortAsc")||(i.sortAsc=t.sortAsc),this.sortColumn=i,this):void 0}},lt={initHeaderHandler:function(t){this.initHeaderRowItem(),this.viewGroupColumns.reverse(),this.initGroupColumnsWidth(),this.initGroupColumnsLayer(t)},initHeaderRowItem:function(){this.headerRowItem={tg_index:-1,tg_view_index:-1},this.viewAllColumns.forEach((t=>{u.hasOwn(t,"id")&&(this.headerRowItem[t.id]=t.name)}))},initGroupColumnsWidth:function(){this.viewGroupColumns.forEach((t=>{let e=0;t.subs.forEach((t=>{this.isInvisible(t)||(e+=t.tg_width)})),t.tg_width=e}))},initGroupColumnsLayer:function(t){const e=this.columnsInfo.maxLevel;this.viewColumns.forEach((function(t){t.tg_layer=e,t.tg_parent&&(t.tg_parent.tg_layer=e-1)})),this.viewGroupColumns.forEach((function(t){const e=t.tg_layer,i=t.tg_parent;if(i){let t=e-1;u.isNum(i.tg_layer)&&(t=Math.min(t,i.tg_layer)),i.tg_layer=t}})),this.initColumnRowspanHandler(t,0)},initColumnRowspanHandler:function(t,e){t.forEach((t=>{const i=this.initColumnCombinationHandler(t,e);t.tg_group&&this.initColumnRowspanHandler(t.subs,e+i)}))},initColumnCombinationHandler:function(t,e){const i=[],o=t.tg_layer;for(;e<=o;)i.push(e),e+=1;i.reverse();const n=i.length;let s="";return n>1&&(s=i.join("")),t.tg_combination=s,n}},ht={},at={name:"",minWidth:81,maxWidth:300},ct=function(t){return null==t},ut=function(t,e){const i=ct(t),o=ct(e);return i&&o?0:i?1:o?-1:void 0},dt=function(t,e){return t.tg_index>e.tg_index?1:-1},gt=function(t,e){return dt(t,e)},ft=function(t,e){if("string"==typeof t&&"string"==typeof e){const i=t.toUpperCase(),o=e.toUpperCase();if(i!==o)return i>o?-1:1}return t>e?-1:1},pt=function(t,e,i,o){return t?-1:e?1:ft(i,o)},mt=function(t,e){const i="number"==typeof t,o="number"==typeof e;return i&&o?t>e?-1:1:pt(i,o,t,e)},bt=function(t,e){const i=new Date(t),o=new Date(e),n=u.isDate(i),s=u.isDate(o);if(n&&s){const t=i.getTime(),e=o.getTime();if(t===e)return;return t>e?-1:1}return pt(n,s,t,e)},wt=function(t,e){const i="boolean"==typeof t,o="boolean"==typeof e;return i&&o?t>e?-1:1:pt(i,o,t,e)},vt=function(t,e,i,o){const n=t[i.sortField],s=e[i.sortField],r=ut(n,s);if("number"==typeof r)return 0===r?gt(t,e):i.sortBlankFactor*r;if(n!==s&&"function"==typeof o){const t=o(n,s);if(u.isNum(t))return i.sortFactor*t}return gt(t,e)},yt={blankValue:ut,equal:gt,index:dt,value:vt,diffType:pt,string:function(t,e,i){return vt(t,e,i,ft)},stringValue:ft,number:function(t,e,i){return vt(t,e,i,mt)},numberValue:mt,date:function(t,e,i){return vt(t,e,i,bt)},dateValue:bt,boolean:function(t,e,i){return vt(t,e,i,wt)},booleanValue:wt};const Ht={initOptionsHandler:function(){return this.options=this.generateOptions(),this.initOptionsFormatters(),this.initOptionsSort(),this.initOptionsFrozen(),this.initOptionsScrollbar(),this.initOptionsContainer(),this.initBindWindowResize(),this.initBindContainerResize(),this},generateOptions(){const t={className:e.NS,theme:e.ID,headerVisible:!0,rowHeight:32,rowFilter:null,rowFilteredSort:null,rowNotFound:"",rowMoveCrossLevel:!0,rowCacheLength:0,rowProps:ht,columnTypes:{tree:{type:"tree",formatter:"tree",width:230,minWidth:120,maxWidth:810},number:{type:"number",align:"right"},date:{type:"date",align:"right"},name:"tree"},columnCacheLength:0,columnProps:at,collapseAllOnInit:null,collapseAllVisible:!0,selectAllOnInit:null,selectVisible:!1,selectAllVisible:!0,selectMultiple:!0,selectColumn:{private:!0,id:"tg-column-select",name:"",formatter:"select",headerClassMap:"tg-header-select",classMap:"tg-cell-select",width:36,align:"center",resizable:!1,sortable:!1,exportable:!1},rowDragCrossLevel:!0,rowDragVisible:!1,rowDragColumn:{private:!0,id:"tg-column-row-drag",name:"",formatter:"rowDrag",headerClassMap:"tg-header-row-drag",classMap:"tg-cell-row-drag",align:"center",width:36,resizable:!1,sortable:!1,exportable:!1},rowNumberWidth:36,rowNumberFilter:null,rowNumberVisible:!1,rowNumberColumn:{private:!0,id:"tg-column-row-number",name:"",formatter:"rowNumber",headerClassMap:"tg-header-row-number",classMap:"tg-cell-row-number",align:"center",maxWidth:100,sortable:!1,exportable:!1},blankColumn:{private:!0,id:"tg-column-blank",name:"",formatter:"blank",headerClassMap:"tg-header-blank",classMap:"tg-cell-blank",width:0,minWidth:0,maxWidth:4096,resizable:!1,sortable:!1,exportable:!1},sortField:"",sortAsc:!0,sortBlankValueBottom:!0,sortComparers:yt,sortOnInit:!1,sortIndicator:"h",frozenRow:-1,frozenRowMax:10,frozenRowHoverable:!1,frozenBottom:!1,frozenColumn:-1,frozenColumnMax:10,frozenRight:!1,scrollbarSize:12,scrollbarSizeH:null,scrollbarSizeV:null,scrollbarRound:!1,scrollbarFade:!1,scrollbarFadeTimeout:1e3,scrollbarType:"auto",scrollPaneMinWidth:30,scrollPaneGradient:30,autoHeight:!1,textSelectable:!1,bindWindowResize:!1,bindContainerResize:!1},i=this.generateThemeOptions();return u.merge(t,i,this.constructorOptions,this.customOptions,this.dataOptions)},generateThemeOptions(){const t=this.pickOptions("theme").pop();if(t)return this.getThemeOptions(t)},pickOptions(t){return[this.constructorOptions,this.customOptions,this.dataOptions].map((e=>e&&e[t])).filter((t=>t))},initOptionsFormatters(){let t;const e=this.pickOptions("formatters");e.length&&(t=u.merge.apply(null,e)),this.formatters=u.merge(J,t,this.customFormatters),this.nullFormatter=this.getFormatter("null")},initOptionsSort(){"v"!==this.options.sortIndicator&&(this.options.sortIndicator="h")},initOptionsFrozen:function(){const t=this.options;this.frozenInfo={column:-1,row:-1,columns:0,rows:0,bottom:Boolean(t.frozenBottom),right:Boolean(t.frozenRight)};let e=u.toNum(t.frozenColumn,!0);e=u.clamp(e,-1,t.frozenColumnMax),e>-1&&!this.frozenInfo.right&&(t.selectVisible&&(e+=1),t.rowDragVisible&&(e+=1),t.rowNumberVisible&&(e+=1)),this.frozenInfo.column=e,e>-1?this.frozenInfo.columns=e+1:(this.frozenInfo.columns=0,this.frozenInfo.right=!1);let i=u.toNum(t.frozenRow,!0);i=u.clamp(i,-1,t.frozenRowMax),this.frozenInfo.row=i,i>-1?this.frozenInfo.rows=i+1:(this.frozenInfo.rows=0,this.frozenInfo.bottom=!1)},initOptionsScrollbar:function(){const t=this.options;("auto"===t.scrollbarType&&u.isTouchDevice()||["touch","mobile"].includes(t.scrollbarType))&&(t.scrollbarFade=!0,t.scrollbarSize=6,t.scrollbarRound=!0);const e=u.toNum(t.scrollbarSize);this.scrollbarSizeH=e,u.isNum(t.scrollbarSizeH)&&(this.scrollbarSizeH=t.scrollbarSizeH),this.scrollbarSizeV=e,u.isNum(t.scrollbarSizeV)&&(this.scrollbarSizeV=t.scrollbarSizeV)},initOptionsContainer:function(){this.$container.attr("id",this.id);const t=this.options;this.$container.removeClass();const i=[e.NS,this.id,`tg-${t.theme}`,t.className];t.textSelectable||i.push("tg-text-unselectable"),u.isTouchDevice()&&i.push("tg-touch-device"),this.$container.addClass(u.classMap(i))}},Ct={initBindWindowResize:function(){this.unbindWindowResize(),this.options.bindWindowResize&&(this.windowResizeEvents={resize:{handler:t=>{this.resize()}}},u.bindEvents(this.windowResizeEvents,window))},unbindWindowResize:function(){u.unbindEvents(this.windowResizeEvents)},initBindContainerResize:function(){if(this.unbindContainerResize(),!this.options.bindContainerResize||!this.holder)return;if("undefined"==typeof ResizeObserver)return;this.resizeObserver=new ResizeObserver((t=>{var e;(e=this.holder,Boolean(e.offsetWidth||e.offsetHeight||e.getClientRects().length))&&this.resize()})),this.resizeObserver.observe(this.holder)},unbindContainerResize:function(){this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null)}},St={initRowsHandler:function(){this.rows=this.data.rows,this.rowsInfo=this.initTreeInfo(this.rows,this.frozenInfo.row)},getRows:function(){return this.rows},getViewRows:function(){return this.viewRows},createViewRows:function(){this.initRowFilterHandler();const t=[],e=this.getRowNumberFilter();let i=1;const o=(t,o)=>{if(e.call(this,t,o))return t.tg_row_number=i,void(i+=1);t.tg_row_number=""},n=(e,i,s)=>{if(!u.isList(e))return;let r,l=0;e.forEach((e=>{if(this.isInvisible(e))return;e.tg_list_index=l,l+=1,e.tg_list_last=!1,r=e,this.gridRowItemHandler(e),o(e,l),s||t.push(e);const i=s||e.tg_group&&e.collapsed;n(e.subs,e,i)})),r&&(r.tg_list_last=!0)};n(this.rows);let s,r=0;return this.initViewList(t,((t,e)=>{t.tg_top=r,this.initRowHeight(t),r+=this.getRowHeight(t),t.tg_group_line=!1,t.collapsed&&(t.tg_group_line=!0),s&&(t.tg_group||t.tg_level<s.tg_level)&&(s.tg_group_line=!0),s=t})),this.viewRows=t,this},getRowNumberFilter:function(){const t=this.options.rowNumberFilter;return"function"==typeof t?t:function(t,e){return!t.tg_group&&!t.tg_frozen}},gridRowItemHandler:function(t){let e=t.formatter;e&&("function"!=typeof e?(e=this.getFormatter(e),e&&(t.tg_formatter=e)):t.tg_formatter=e.bind(this))},initRowHeight:function(t){if(!u.hasOwn(t,"height"))return;if(u.isNum(t.height))return void(t.tg_height=Math.round(t.height));const e=this.getColumnItem(t.height);if(e){const i=this.getComputedRowHeight(t,e);u.isNum(i)&&(t.tg_height=i)}},getComputedRowHeight:function(t,e){const i=this.options.rowHeight,o=5*`${t[e.id]||""}`.length;return o<=e.tg_width?i:16*Math.ceil(o/e.tg_width)+6},setRowHeight:function(t,e){const i=u.toList(t);if(!i.length)return this;const o=u.toList(e);o.length=i.length;const n=this.options.rowHeight;return i.forEach(((t,e)=>{const i=this.getRowItem(t);if(!i)return;const s=o[e]||n;i.height=s,delete i.tg_height,this.initRowHeight(i),this.flushRowFrom(i.tg_view_index)})),this.render("rows"),this},initRowFilterHandler:function(){const t=this.options.rowFilter;if("function"!=typeof t)return;if(this.forEachRow(((e,i,o)=>{if(e.tg_invisible)return;const n=!t.call(this,e,i,o);if(e.tg_filtered=n,!n){let t=e;for(;t.tg_parent;)t.tg_parent.tg_filtered=!1,t=t.tg_parent}})),this.sortColumn)return;let e=this.options.rowFilteredSort;if("function"==typeof e&&(e=e.call(this)),!e)return;"string"==typeof e&&(e={sortField:e,sortAsc:this.options.sortAsc});const i=e.sortField||e.id;i&&this.sortRows(i,e)},setRowSubs:function(t,e){const i=this.getRowItem(t);return i?(u.isList(e)&&(i.collapsed=!1),i.subs=e,this.initRowsHandler(),this.flushRowFrom(i.tg_view_index),this.render("rows"),this):this},setRows:function(t){this.data.rows=u.toList(t),this.initRowsHandler(),this.flushBody(),this.render("rows")},getRowParentSubs:function(t){return t.tg_parent?t.tg_parent.subs:this.rows}},Rt={initHandler:function(){this.reset(),this.initOptionsHandler(),this.initColumnsHandler(),this.initRowsHandler(),this.initSortOnInitHandler(),this.initSelectAllOnInitHandler(),this.initCollapseAllOnInitHandler(),this.initScrollPane(),this.bindEvents()},updateViewRowsAndSize:function(){return this.createViewRows(),this.renderCollapseAllState(),this.renderSelectAllState(),this.resizeHandler(),this},initSortOnInitHandler:function(){this.options.sortOnInit&&this.updateRowsSort()},initSelectAllOnInitHandler:function(){if(this.globalSelectedIndex=0,!this.options.selectMultiple){let t;return void this.forEachSelectableRow((e=>{if(e.selected){if(t)return void(e.selected=!1);t=e}}))}const t=this.options.selectAllOnInit;!0!==t?!1===t&&this.updateAllRowsSelected(!1):this.updateAllRowsSelected(!0)},updateAllRowsSelected:function(t){this.forEachSelectableRow((e=>{e.selected=t}))},initCollapseAllOnInitHandler:function(){const t=this.options.collapseAllOnInit;!0!==t?!1===t&&this.updateAllRowsCollapsed(!1):this.updateAllRowsCollapsed(!0)},getToBeAddedItemList:function(t){const e=[];return u.toList(t).forEach((t=>{t&&"object"==typeof t?e.push(t):void 0!==t&&e.push({name:t})})),e},getToBeAddedParentSubs:function(t,e){return t?(t.subs||(t.subs=[]),t.subs):e},getToBeAddedPositionIndex:function(t,e){const i=e.length;return u.isNum(t)&&t>=0&&t<=i?Math.round(t):i},generateDataSnapshot:function(t){if(!t||"object"!=typeof t)return t;const e=this.cleanTreeList(t.rows),i=this.cleanTreeList(t.columns);return this.convertNumberType(e,i),t.rows=e,t.columns=i,t},cleanTreeList:function(t){if(!u.isList(t))return[];const e=(t,i)=>{i.forEach((i=>{if(!i||"object"!=typeof i)return void t.push({});const o=this.getItemSnapshot(i),n=i.subs;Array.isArray(n)&&(o.subs=[],e(o.subs,n)),t.push(o)}))},i=[];return e(i,t),i},convertNumberType:function(t,e){const i=[];u.forEachTree(e,(function(t){"number"===t.type&&t.id&&i.push(t.id)})),i.length&&u.forEachTree(t,(function(t){i.forEach((function(e){t[e]=u.convertNum(t[e])}))}))}},Tt={setDefaultLoading:function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!t)return;const i=t.style;e.size&&(i.width=e.size,i.height=e.size),e.color&&(i.color=e.color),e.size||e.color||t.removeAttribute("style"),e.fast?t.classList.add("tg-loading-fast"):t.classList.remove("tg-loading-fast")},getDefaultLoading:function(t){return this.setDefaultLoading(this.$defaultLoading,t),this.$defaultLoading},getLoadingHolder:function(){return this.$container?this.$container.find(".tg-loading"):v()},setLoading:function(t){if(!this.$container)return this;this.$defaultLoading||(this.$defaultLoading=this.$container.find(".tg-loading-default").get(0));const e=this.getLoadingHolder().get(0);return"function"==typeof t&&(t=t.call(this,e)),u.isObject(t)&&(t=this.getDefaultLoading(t)),t||(t=this.getDefaultLoading()),this.renderNodeContent(e,t),this},showLoading:function(){return this.getLoadingHolder().show(),this},hideLoading:function(){return this.getLoadingHolder().hide(),this}},Lt={renderNodeContent:function(t,e){if(t){if(e&&e.nodeType)return this.emptyNode(t),void t.appendChild(e);if(Array.isArray(e))return this.emptyNode(t),void e.forEach((e=>{e&&e.nodeType&&t.appendChild(e)}));void 0===e&&(e=""),t.innerHTML=e}},emptyNode:function(t){if(t)for(;t.firstChild;)t.removeChild(t.firstChild)},removeNode:function(t){t&&t.parentNode&&t.parentNode.removeChild(t)},appendNode:function(t,e){t&&e&&t.appendChild(e)},createElement:function(t,e,i){const o=document.createElement(t);e&&Object.keys(e).forEach((function(t){const i=e[t];void 0!==i&&o.setAttribute(t,i)})),u.isArray(i)||(i=[i]);let n="";return i.forEach((function(t){t&&t.nodeType?o.appendChild(t):void 0!==t&&(n+=t)})),n&&(o.innerHTML=n),o},find:function(t,e){return v(e||this.$container).find(t)},getRowNodes:function(t){const e=this.getRowItem(t);if(e)return this.getRowNodesByIndex(e.tg_view_index)},getCellNode:function(t,e){const i=this.getRowItem(t);if(!i)return;const o=this.getColumnItem(e);return o?this.getCellNodeByIndex(i.tg_view_index,o.tg_view_index):void 0},getHeaderItemNode:function(t){const e=this.getColumnItem(t);if(e)return this.getHeaderCache(e.tg_view_index)},getColumnHeaderNode:function(t){const e=this.getHeaderItemNode(t);if(e)return e.querySelector(".tg-column-header")}},It={render:function(){this.asyncRender||(this.asyncRender=u.microtask(this.renderSync)),this.asyncRender.apply(this,arguments)},renderSync:function(){this.renderStartedTimestamp=Date.now();const t=this.generateRenderSettings.apply(this,arguments);return"all"===t.type?(this.flushBody(),this.initHandler(),this.renderHeader(),this.updateViewRowsAndSize(),this.renderBody(t),this):"columns"===t.type?(this.flushBody(),this.initColumnsHandler(),this.renderHeader(),this.updateViewRowsAndSize(),this.renderBody(t),this):"rows"===t.type?(this.updateViewRowsAndSize(),this.renderBody(t),this):"resize"===t.type?(this.resizeHandler(),this.renderBody(t),this):(this.renderBody(t),this)},generateRenderSettings:function(t){const e={type:this.renderType,scrollLeft:null,scrollTop:null,scrollColumn:null,scrollRow:null};return"string"==typeof t?e.type=t:t&&Object.assign(e,t),this.headerCreated||(e.type="all"),e},renderBody:function(t){this.renderSettings=t,this.scrollOnInit(t),this.scrollTopOffset=this.scrollPane.getScrollTopOffset();const e=this.getViewport();return this.viewport=e,this.flushWithViewport(),this.previousScrollTopOffset!==this.scrollTopOffset&&(this.previousScrollTopOffset=this.scrollTopOffset,this.updateRowCacheTopOffset()),this.renderRows(e.rows),this.renderCells(e.rows,e.columns),this.renderUpdatedTimestamp=Date.now(),this.renderDuration=this.renderUpdatedTimestamp-this.renderStartedTimestamp,this.trigger(S.onUpdated,e),this.firstUpdated||(this.firstUpdated=!0,this.trigger(S.onFirstUpdated,e)),this.layoutEventHandler(),this.resizeEventHandler(),this.renderSettings=null,this.renderType=null,this},rerender:function(){return this.render("all"),this}},Et={resize:function(){return this.asyncResize||(this.asyncResize=u.throttle(this.resizeSync,100)),this.asyncResize.apply(this,arguments),this},resizeSync:function(){return this.headerCreated?(this.resizeHolderHandler.apply(this,arguments),this.firstUpdated&&this.isHolderInvisible()||this.render("resize"),this):this},resizeHolderHandler(t,e){if(0!==arguments.length)return 1===arguments.length?t&&"object"==typeof t?void this.$holder.css(t):void this.$holder.css({width:t}):void this.$holder.css({width:t,height:e})},isHolderInvisible(){const t=this.$holder.width(),e=this.$holder.height();return!t||!e},resizeHandler:function(){this.containerWidth=this.$container.width(),this.containerHeight=this.$container.height(),this.headerWidth=this.containerWidth,this.bodyWidth=this.containerWidth,this.updateTotalColumnsWidth(),this.resizeHeaderHandler(),this.resizeBodyHandler()},layoutEventHandler:function(){const t=this.previousLayout||{},e={headerWidth:this.headerWidth,headerHeight:this.headerHeight,bodyWidth:this.bodyWidth,bodyHeight:this.bodyHeight};Object.values(e).join("")!==Object.values(t).join("")&&(this.previousLayout=e,this.trigger(S.onLayout,u.merge({previous:t},e)))},resizeEventHandler:function(){const t=this.previousSize||{},e={width:this.containerWidth,height:this.containerHeight};Object.values(e).join("")!==Object.values(t).join("")&&(this.previousSize=e,this.trigger(S.onResize,u.merge({previous:t},e)))},resizeHeaderHandler:function(){this.initHeaderLayerHeight();const t=this.options;t.autoHeight&&this.viewRows.length>5e3&&(t.autoHeight=!1),this.headerHeight=0,t.headerVisible&&(this.containerHeight>0||t.autoHeight)&&this.updateHeaderTableHeight(),this.$headerFrame.css({width:this.headerWidth,height:this.headerHeight})},updateHeaderTableHeight:function(){let t=0;Object.keys(this.headerLayerHeight).forEach((e=>{t+=this.headerLayerHeight[e]}));const e=this.$headerL.find(".tg-header-table"),i=this.$headerR.find(".tg-header-table");e.css({height:t}),i.css({height:t}),this.headerHeight=t},resizeBodyHandler:function(){this.updateScrollState(),this.bodyHeight=this.containerHeight-this.headerHeight,this.$bodyFrame.css({width:this.bodyWidth,height:this.bodyHeight}),this.updatePaneWidth(),this.updatePaneHeight(),this.updateCanvasWidth(),this.updateCanvasHeight(),this.updateScrollPane(),this.updateCssRules()},updatePaneWidth:function(){let t=this.bodyWidth,e=0;if(this.frozenInfo.columns){const i=this.getScrollbarWidth();this.frozenInfo.right?(e=this.columnsWidthR+i,t=this.bodyWidth-e):(t=this.columnsWidthL,e=this.bodyWidth-t),this.scrollPaneHidden&&(this.frozenInfo.right?(t<=0&&(t=0),e=Math.max(0,this.bodyWidth-t)):(e<i&&(e=i),t=Math.max(0,this.bodyWidth-e)))}this.paneWidthL=t,this.paneWidthR=e,this.$paneHL.css({left:0,width:this.paneWidthL}),this.$paneHR.css({left:this.paneWidthL,width:this.paneWidthR}),this.$paneTL.css({left:0,width:this.paneWidthL}),this.$paneTR.css({left:this.paneWidthL,width:this.paneWidthR}),this.$paneBL.css({left:0,width:this.paneWidthL}),this.$paneBR.css({left:this.paneWidthL,width:this.paneWidthR})},updatePaneHeight:function(){let t=this.bodyHeight,e=0;if(this.frozenInfo.rows)if(this.frozenInfo.bottom){const i=this.getScrollbarHeight();t=this.bodyHeight-this.frozenRowsHeight-i,e=this.frozenRowsHeight+i}else t=this.frozenRowsHeight,e=this.bodyHeight-this.frozenRowsHeight;this.paneHeightT=t,this.paneHeightB=e,this.$paneTL.css({top:0,height:this.paneHeightT}),this.$paneTR.css({top:0,height:this.paneHeightT}),this.$paneBL.css({top:this.paneHeightT,height:this.paneHeightB}),this.$paneBR.css({top:this.paneHeightT,height:this.paneHeightB})},updateCanvasWidth:function(){const t=this.columnsWidthL,e=this.columnsWidthR;this.bodyWidthChanged=!1,t===this.bodyWidthL&&e===this.bodyWidthR||(this.bodyWidthL=t,this.bodyWidthR=e,this.bodyWidthChanged=!0,this.cssRulesInvalid=!0),(this.bodyWidthChanged||this.scrollStateChanged)&&(this.updateHeaderCanvasWidth(),this.updateBodyCanvasWidth())},updateCanvasHeight:function(){let t,e;this.frozenInfo.rows?this.frozenInfo.bottom?(t=this.scrollRowsHeight,e=this.frozenRowsHeight):(t=this.frozenRowsHeight,e=this.scrollRowsHeight):(t=this.totalRowsHeight,e=0),this.bodyHeightT=t,this.bodyHeightB=e,this.updateBodyCanvasHeight()},updateHeaderCanvasWidth:function(){const t=this.maxLimitSize(this.bodyWidthL),e=this.maxLimitSize(this.bodyWidthR);this.$headerL.width(t),this.$headerR.width(e)},updateBodyCanvasWidth:function(){const t=this.maxLimitSize(this.bodyWidthL),e=this.maxLimitSize(this.bodyWidthR);this.$bodyTL.width(t),this.$bodyBL.width(t),this.$bodyTR.width(e),this.$bodyBR.width(e)},updateBodyCanvasHeight:function(){const t=this.maxLimitSize(this.bodyHeightT),e=this.maxLimitSize(this.bodyHeightB);this.$bodyTL.height(t),this.$bodyTR.height(t),this.$bodyBL.height(e),this.$bodyBR.height(e)},maxLimitSize:function(t){return t=Math.min(t,1533e3)}},xt={addRow:function(t,e,i){let o=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];const n=this.getToBeAddedItemList(t);if(!n.length)return!1;let s;if(null!=e&&(s=this.getRowItem(e),!s))return!1;const r=this.getToBeAddedParentSubs(s,this.rows),l=this.getToBeAddedPositionIndex(i,r),h=[l,0].concat(n);r.splice.apply(r,h),this.initRowsHandler(),s?(s.collapsed=!1,this.flushRowFrom(s.tg_view_index+l)):this.flushRowFrom(l),this.onNextUpdated((function(){this.trigger(S.onRowAdded,n)}));const a={type:"rows"};return o&&(a.scrollRow=n[n.length-1]),this.render(a),!0},deleteRow:function(t){const e=u.toList(t),i=[];if(e.forEach((t=>{const e=this.getRowItem(t);e&&i.push(e)})),!i.length)return!1;const o=this.removeRowsHandler(i);this.initRowsHandler();const n=this.getRemovedMinIndex(o);return this.flushRowFrom(n),this.onNextUpdated((function(){this.trigger(S.onRowRemoved,i)})),this.render("rows"),!0},getRemovedMinIndex:function(t){let e=0;const i=t[t.length-1];if(this.isInvisible(i))return e;e=i.tg_view_index,e>0&&(e-=1);let o=i.tg_parent;for(;o;)o.collapsed&&(e=o.tg_view_index),o=o.tg_parent;return e},removeRowsHandler:function(t){const e=[].concat(t);e.sort((function(t,e){return e.tg_index-t.tg_index}));const i=[];return e.forEach((t=>{this.getRowParentSubs(t).splice(t.tg_sub_index,1),i.push(t)})),i}},Pt={renderCollapseAllState:function(){this.hasTreeColumn&&(this.asyncRenderCollapseAllState||(this.asyncRenderCollapseAllState=u.microtask(this.renderCollapseAllStateSync)),this.asyncRenderCollapseAllState.apply(this,arguments))},renderCollapseAllStateSync:function(){const t=this.$header.find(".tg-tree-header");this.rowsInfo.isTree?t.addClass("tg-tree-header-indent"):t.removeClass("tg-tree-header-indent"),this.renderCollapseAllIcon()},checkCollapseAllState:function(t){if(t!==this.allRowsCollapsed){if(t){let t=0;const e=this.rows.length;for(;t<e;){const e=this.rows[t];if(e.tg_group&&!e.collapsed)return;t++}}else{let t=!1;if(this.forEachRow((e=>{if(e.tg_group&&e.tg_subs_length&&e.collapsed)return t=!0,!1})),t)return}this.allRowsCollapsed=t,this.renderCollapseAllIcon()}},expandAllRows:function(){return this.renderAllRowsCollapsed(!1)},collapseAllRows:function(){return this.renderAllRowsCollapsed(!0)},toggleAllRows:function(){return this.allRowsCollapsed?this.expandAllRows():this.collapseAllRows()},renderAllRowsCollapsed:function(t){const e=this.updateAllRowsCollapsed(t);return e.length?(this.flushBody(),this.onNextUpdated((()=>{this.renderCollapseAllIcon(),t?this.trigger(S.onRowCollapsed,e):this.trigger(S.onRowExpanded,e)})),this.render("rows"),this):this},updateAllRowsCollapsed:function(t){this.allRowsCollapsed=t;const e=[];return this.forEachRow((i=>{i.subs&&i.tg_subs_length&&this.isCollapsedChanged(i,t)&&(i.collapsed=t,e.push(i))})),e},expandRow:function(t){const e=this.getRowItem(t);return e?this.isEmptyGroup(e)?(this.trigger(S.onRowSubsRequest,e),this):this.isCollapsedChanged(e,!1)?(e.collapsed=!1,this.flushRowFrom(e.tg_view_index),this.renderCollapseIcon(e),this.onNextUpdated((()=>{this.checkCollapseAllState(!1),this.trigger(S.onRowExpanded,e)})),this.render("rows"),this):this:this},collapseRow:function(t){const e=this.getRowItem(t);return e&&e.subs&&e.tg_subs_length&&this.isCollapsedChanged(e,!0)?(e.collapsed=!0,this.flushRowFrom(e.tg_view_index),this.renderCollapseIcon(e),this.onNextUpdated((()=>{this.checkCollapseAllState(!0),this.trigger(S.onRowCollapsed,e)})),this.render("rows"),this):this},toggleRow:function(t){const e=this.getRowItem(t);return e?(e.collapsed?this.expandRow(e):this.collapseRow(e),this):this},expandRowLevel:function(t){t=u.toNum(t,!0);const e=[],i=[];return this.forEachRow((o=>{o.subs&&o.tg_subs_length&&(o.tg_level<=t?this.isCollapsedChanged(o,!1)&&(o.collapsed=!1,i.push(o)):this.isCollapsedChanged(o,!0)&&(o.collapsed=!0,e.push(o)))})),e.length||i.length?(this.flushBody(),this.onNextUpdated((()=>{e.length&&this.trigger(S.onRowCollapsed,e),i.length&&this.trigger(S.onRowExpanded,i)})),this.render("rows"),this):this},renderCollapseAllIcon:function(){if(!this.options.collapseAllVisible||!this.hasTreeColumn)return;const t=this.$header.find(".tg-tree-icon-all");this.renderTreeIcon(t,this.allRowsCollapsed)},renderCollapseIcon:function(t){if(!this.headerCreated)return;const e=this.getRowNodesByIndex(t.tg_view_index);if(!e)return;const i=e.find(".tg-tree-icon");this.renderTreeIcon(i,t.collapsed)},renderTreeIcon:function(t,e){t&&(e?t.removeClass("tg-tree-icon-expanded").addClass("tg-tree-icon-collapsed"):t.removeClass("tg-tree-icon-collapsed").addClass("tg-tree-icon-expanded"))}},zt={rowDragStartHandler:function(t,e){const i=e.rowItem;if(!i)return;const o=this.getRowNodesByIndex(i.tg_view_index);o&&(e.dragCloneNodes=this.getRowDragCloneNodes(o),e.dropPlaceholder=this.getRowDropPlaceholder(o),e.dragStartTop=this.getRowTop(i),e.dragRowHeight=this.getRowHeight(i),e.dragStartScrollTop=this.scrollTop,e.dragMaxScrollTop=this.scrollPane.getMaxScrollTop(),this.trigger(S.onRowDragged,{e:t,rowItem:i}),this.isDefaultPrevented(t)||("touch"===e.type&&u.preventDefault(e.e),this.setRowState(i,"dragging"),this.rowDropListHandler(e),this.updateDragCloneRowPosition(e)))},rowDragMoveHandler:function(t,e){"touch"===e.type&&u.preventDefault(e.e),this.updateDragCloneRowPosition(e),this.updateDragPlaceholderPosition(e),this.rowDragAutoScrollHandler(e)},rowDragEndHandler:function(t,e){"touch"===e.type&&(this.protectedItem=null,u.preventDefault(e.e)),this.autoScrollStop(),this.setRowState(e.rowItem,"dragging",!1),e.dragCloneNodes&&(e.dragCloneNodes.remove(),e.dragCloneNodes=null),e.dropPlaceholder&&(e.dropPlaceholder.remove(),e.dropPlaceholder=null),e.changed&&this.rowDropHandler(e)},updateDragCloneRowPosition:function(t){const e=this.scrollTop-t.dragStartScrollTop,i=t.dragStartTop+t.offsetY+e,o=i-this.scrollTopOffset;t.dragCloneNodes&&t.dragCloneNodes.css("top",o).show(),t.dragCurrentPosition=i+.5*t.dragRowHeight},getRowDragCloneNodes:function(t){const e=v();return t.each((function(t){const i=v(t),o=i.clone();o.appendTo(i.parent()),e.add(o)})),e.addClass("tg-clone").hide(),e},getRowDropPlaceholder:function(t){const e=v();return t.each((function(t){const i=v(t),o=v("<div/>").addClass("tg-row-placeholder").hide(),n=i.parent();n.find(".tg-row-placeholder").remove(),o.appendTo(n),e.add(o)})),e},updateDragPlaceholderPosition:function(t){this.rowDropItemHandler(t);const e=t.dropItem;if(!e)return;let i=t.dropPosition-1;t.dropBottom?e.tg_view_last&&(i=t.dropPosition-2):e.tg_view_index-this.frozenInfo.rows==0&&(i=t.dropPosition);const o=i-this.scrollTopOffset;t.dropPlaceholder&&t.dropPlaceholder.css("top",o).show()},rowDragAutoScrollHandler:function(t){const e=t.dragCurrentPosition,i=this.scrollTop,o=this.bodyHeight-this.frozenRowsHeight,n=i+o,s=this.options.rowHeight,r=Math.min(3*s,.5*o);if(!(r<s))if(t.offsetY<0){if(e<i+r){const o=e-(i+r),n=this.getAutoScrollOffset(o,r);return void this.autoScrollStart(n,t)}this.autoScrollStop()}else if(e>n-r){const i=e-(n-r),o=this.getAutoScrollOffset(i,r);this.autoScrollStart(o,t)}else this.autoScrollStop()},getAutoScrollOffset:function(t,e){return Math.floor(t/e*20)},autoScrollStop:function(){this.autoScrollMotion&&(this.autoScrollMotion.destroy(),this.autoScrollMotion=null)},autoScrollStart:function(t,e){this.autoScrollStop();const i=e.dragMaxScrollTop;this.autoScrollMotion=new G,this.autoScrollMotion.bind(G.EVENT.MOTION_MOVE,(()=>{const o=u.clamp(this.scrollTop+t,0,i);o!==this.scrollTop?(this.setScrollTop(o),this.updateDragCloneRowPosition(e),this.updateDragPlaceholderPosition(e)):this.autoScrollStop()})),this.autoScrollMotion.once(G.EVENT.MOTION_END,(()=>{this.autoScrollStart(t,e)})),this.autoScrollMotion.start({duration:200})},rowDropListHandler:function(t){const e=this.getRowDropList(t);if(!u.isList(e))return;const i=t.rowItem,o=e.filter((t=>{if(t===i)return!1;if(t.tg_frozen)return!1;let e=t.tg_parent;for(;e;){if(e===i)return!1;e=e.tg_parent}return!0}));if(!u.isList(o))return;const n=[];o.forEach((t=>{const e=this.getRowTop(t),i=this.getRowHeight(t);n.push({rowItem:t,position:e}),n.push({rowItem:t,position:e+i-1,dropBottom:!0})})),t.dropList=n},getRowDropList:function(t){const e=this.options.rowDragCrossLevel;return e?"function"==typeof e?e.call(this,t):this.viewRows:this.getRowParentSubs(t.rowItem)},rowDropItemHandler:function(t){const e=t.dropList;if(!e)return;const i=t.dragCurrentPosition;let o=Number.MAX_VALUE;for(let n=0,s=e.length;n<s;n++){const s=e[n],r=Math.abs(i-s.position);if(r>o)break;o=r,t.dropItem=s.rowItem,t.dropBottom=s.dropBottom,t.dropPosition=s.position}},rowDragDropPositionHandler:function(t,e,i){const o=this.getRowParentSubs(t),n=t.tg_sub_index;let s,r;return this.isDropIntoGroupFirstChild(e,i)?(s=e.subs,r=0):(s=this.getRowParentSubs(e),r=e.tg_sub_index,o===s&&n<r&&(r-=1),i&&(r+=1)),this.updateDragDropPosition(o,s,n,r,t)},isDropIntoGroupFirstChild:function(t,e){return!!e&&(!!t.tg_group&&(this.isEmptyGroup(t)?(t.collapsed=!1,!0):!t.collapsed))},updateDragDropPosition:function(t,e,i,o,n){if(t!==e||i!==o)return t.splice(i,1),e.splice(o,0,n),{rowItem:n,dragFrom:t,dragIndex:i,dropInto:e,dropIndex:o}},rowDropHandler:function(t){const e=t.dropItem;if(!e)return;const i=t.rowItem,o=t.dropBottom,n=this.rowDragDropPositionHandler(i,e,o);if(!n)return;this.initRowsHandler();let s=Math.min(i.tg_view_index,e.tg_view_index);s&&(s-=1),this.flushRowFrom(s),this.removeSortColumn(),this.onNextUpdated((()=>{this.trigger(S.onRowDropped,n)})),this.render({type:"rows",scrollRow:i})}},Mt={getMoveFocusRow:function(t,e){let i=t[0];return e>0&&(i=t[t.length-1]),i},getMoveLengthInList:function(t,e){let i=0;return t.forEach((t=>{this.getRowParentSubs(t)===e&&(i+=1)})),i},getMoveInfo:function(t,e,i){const o=this.getRowParentSubs(i);let n=i.tg_sub_index+e;const s=i.tg_parent;if(s&&this.options.rowMoveCrossLevel){const e=0,i=s.tg_subs_length-1;if(n<e){const e=n+1;return this.getMoveInfo(t,e,s)}if(n>i){const e=n-i;return this.getMoveInfo(t,e,s)}}if(e>0){n-=this.getMoveLengthInList(t,o)-1}return n=u.clamp(n,0,o.length),{list:o,index:n}},moveRowsHandler:function(t,e){(t=this.removeRowsHandler(t)).reverse();const i=this.getMoveFocusRow(t,e),o=this.getMoveInfo(t,e,i),n=[o.index,0].concat(t);return o.list.splice.apply(o.list,n),this.initRowsHandler(),this.onNextUpdated((function(){this.scrollRowIntoView(i),this.trigger(S.onRowMoved,t)})),this.removeSortColumn(),this.update(),!0},moveRows:function(t,e){t=u.toList(t);const i=[];return t.forEach((t=>{const e=this.getRowItem(t);e&&i.push(e)})),!!i.length&&(!(i.length>=this.getRowsLength())&&(0!==(e=u.toNum(e,!0))&&this.moveRowsHandler(i,e)))},moveRowsUp:function(t){return this.moveRows(t,-1)},moveRowsDown:function(t){return this.moveRows(t,1)},moveRowsToTop:function(t){return this.moveRows(t,-this.getRowsLength(!0))},moveRowsToBottom:function(t){return this.moveRows(t,this.getRowsLength(!0))},moveSelectedRowsUp:function(){return this.moveRows(this.getSelectedRows(),-1)},moveSelectedRowsDown:function(){return this.moveRows(this.getSelectedRows(),1)},moveSelectedRowsToTop:function(){return this.moveRows(this.getSelectedRows(),-this.getRowsLength(!0))},moveSelectedRowsToBottom:function(){return this.moveRows(this.getSelectedRows(),this.getRowsLength(!0))}},_t={getSelectedRow:function(){let t=null;return this.forEachSelectableRow((function(e){if(e.selected)return t=e,!1})),t},getSelectedRows:function(){const t=[];return this.forEachSelectableRow((function(e){e.selected&&t.push(e)})),t.length>1&&t.sort((function(t,e){const i=t.tg_selected_index,o=e.tg_selected_index;return i>o?1:i<o?-1:0})),t},selectAll:function(){let t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];if(t=Boolean(t),this.globalSelectedIndex=0,t&&!this.options.selectMultiple)return this;const e=this.getAllSelectedChangedList(t);return e.length?(this.updateRowsSelectedState(e),this):this},setRowSelected:function(){return(this.options.selectMultiple?this.setRowMultipleSelected:this.setRowSingleSelected).apply(this,arguments)},setRowSingleSelected:function(t){const e=this.getRowItem(t);if(!e)return this;if(!this.isRowSelectable(e))return this;if(e.selected)return this;const i=[],o=this.getSelectedRow();return o&&o.selected&&i.push(o),e.selected||i.push(e),i.length?(this.updateRowsSelectedState(i),this):this},setRowMultipleSelected:function(t,e){if(0===arguments.length)return this;if(1===arguments.length&&!1===arguments[0])return this.selectAll(!1);const i=this.toRowItemList(t,(t=>this.isRowSelectable(t)));return i.length?!1===e?(this.setRowListUnselected(i),this):u.hasShiftKey(e)&&1===i.length?(this.setRowBetweenListSelected(i[0]),this):(this.updateRowsSelectedState(i),this):this},setRowListUnselected:function(t){const e=this.getSelectedChangedList(t,!1);e.length&&this.updateRowsSelectedState(e)},setRowBetweenListSelected:function(t){const e=this.previousSelectedRow;if(e&&e!==t){const i=this.getBetweenSelectedChangedList(e,t);if(!i.length)return;this.updateRowsSelectedState(i,!0)}else this.updateRowsSelectedState([t])},getAllSelectedChangedList:function(t){const e=[];return this.forEachSelectableRow((i=>{this.isSelectedChanged(i,t)&&e.push(i)})),e},getSelectedChangedList:function(t,e){const i=[];return t.forEach((t=>{this.isSelectedChanged(t,e)&&i.push(t)})),i},getBetweenSelectedChangedList:function(t,e){const i=t.tg_index,o=e.tg_index,n=[];if(i<o){let t=i+1;for(;t<=o;)n.push(t),t++}else{let t=i-1;for(;t>=o;)n.push(t),t--}return this.toRowItemList(n,(t=>this.isRowSelectable(t)&&!t.selected))},updateRowsSelectedState:function(t,e){let i;t.forEach((t=>{const e=!t.selected;t.selected=e,e&&(t.tg_selected_index=this.globalSelectedIndex++,i=t),this.renderRowSelectedState(t)})),e||(this.previousSelectedRow=i),this.renderSelectAllState(),this.onNextUpdated((()=>{this.trigger(S.onSelectChanged,t)})),this.render()},renderRowSelectedState:function(t){const e=t.tg_view_index;this.viewport.rows.includes(e)&&(this.renderRowState(t,"selected"),this.flushCell(e,this.selectColumn.tg_view_index))},renderSelectAllState:function(){this.isSelectAllVisible()&&(this.asyncRenderSelectAllState||(this.asyncRenderSelectAllState=u.microtask(this.renderSelectAllStateSync)),this.asyncRenderSelectAllState.apply(this,arguments))},renderSelectAllStateSync:function(){const t=this.getSelectAllState();if(t===this.previousSelectAllState)return;this.previousSelectAllState=t;const e=this.selectColumn,i=v(this.getColumnHeaderNode(e)).find(".tg-select-icon-all");i.length&&(i.removeClass("tg-selected tg-mixed"),t&&i.addClass(`tg-${t}`))},getSelectAllState:function(){let t=0;this.forEachSelectableRow((e=>{t+=1}));const e=this.getSelectedRows().length;let i="mixed";return 0===e?(i="",this.previousSelectedRow=null):e===t&&(i="selected"),i},isSelectAllVisible:function(){const t=this.options;return!!(t.selectVisible&&t.selectAllVisible&&t.selectMultiple)}},Nt={setRowHover:function(t,e){const i=this.getRowItem(t);return i?(this.renderRowHover(i,e),this):this},renderRowHover:function(t,e){if(this.previousHover&&(this.previousHover.removeClass("tg-hover"),this.previousHover=null),!e)return this;if(t.tg_frozen&&!this.options.frozenRowHoverable)return this;const i=t.tg_view_index;return this.previousHover=this.$body.find(`.tg-row[row='${i}']`).addClass("tg-hover"),this},setRowState:function(t,e){let i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];const o=this.getRowItem(t);return o?(o.tg_state_names||(o.tg_state_names=new Set),o.tg_state_names.add(e),o[e]=i,this.renderRowState(o,e),this):this},renderRowState:function(t,e){const i=this.getRowNodesByIndex(t.tg_view_index);if(i){const o=`tg-${e}`;t[e]?i.addClass(o):i.removeClass(o)}}},kt={getRowItem:function(t){return u.isNum(t)?(t<0&&(t=this.rowsInfo.length+t),this.rowsInfo.indexCache[t]):t?u.isNum(t.tg_index)?t:this.getRowItemById(t.id||t):void 0},getRowItemById:function(t){return this.getRowItemBy("id",t)},getRowItemBy:function(t,e){if(void 0!==e)return this.rowsInfo.indexCache.find((i=>i[t]===e))},getRowsLength:function(t){return t?this.rowsInfo.length:this.viewRows.length},getViewRowItem:function(t){return this.viewRows[t]},getPreRenderRowInfo:function(t){const e={rows:[],rowNotFound:!1,benchmark:0};if(!t.length)return 0===this.getRowsLength()&&(e.rowNotFound=!0),e;const i=[],o=this.frozenInfo.row;return t.forEach((t=>{this.getRowCache(t)?t>o&&i.push(t):e.rows.push(t)})),i.length&&(e.benchmark=Math.min.apply(Math,i)),e.rows.sort((function(t,i){return t<e.benchmark&&i<e.benchmark?i-t:t-i})),e},rowNotFoundHandler:function(t){let e=this.options.rowNotFound;e?("function"==typeof e&&(e=e.call(this,t)),t.rowNotFound?this.showPaneMessage(e):this.hidePaneMessage()):this.hidePaneMessage()},showPaneMessage:function(t){this.$bodyFrame.addClass("tg-row-not-found");const e=this.$bodyFrame.find(".tg-body-message").show();this.renderNodeContent(e.get(0),t),this.paneMessageVisible=!0},hidePaneMessage:function(){this.paneMessageVisible&&(this.$bodyFrame.removeClass("tg-row-not-found"),this.$bodyFrame.find(".tg-body-message").hide(),this.paneMessageVisible=!1)},renderRows:function(t){const e=this.getPreRenderRowInfo(t);this.rowNotFoundHandler(e),!e.rowNotFound&&e.rows.length&&e.rows.forEach((t=>{this.renderRowNodes(t,e.benchmark)}))},createRowNode:function(t,e,i,o,n,s){const r=document.createElement("div");return r.setAttribute("row",t),r.className=i,o&&(r.style.cssText=o),r.style.top=`${n}px`,s!==this.options.rowHeight&&(r.style.height=`${s}px`,r.style.lineHeight=`${s}px`),this.setNodeDataCache(r,{row:t,rowItem:e,rowNode:r}),r},appendRowNode:function(t,e,i,o){i<o?t.prepend(e):t.append(e)},renderRowNodes:function(t,e){const i=this.getViewRowItem(t);if(!i)return;let o=v();const n=this.getRowVPos(t),s=this.getRowClass(i),r=u.styleMap(i.styleMap),l=this.getViewRowTop(i),h=this.getRowHeight(i),a=this.createRowNode(t,i,s,r,l,h),c=this.getRowCanvas(n,"left");if(this.appendRowNode(c,a,t,e),o=o.add(a),this.frozenInfo.columns){const a=this.createRowNode(t,i,s,r,l,h),c=this.getRowCanvas(n,"right");this.appendRowNode(c,a,t,e),o=o.add(a)}this.setRowCache(t,o)},isGroupLine:function(t){return t&&t.tg_group_line&&t.tg_view_index!==this.frozenInfo.row},isNoneLine:function(t){const e=this.frozenInfo.bottom;return!(t!==this.viewRows.length-1||!this.hasVScroll||!e&&this.hasHScroll)||!(t!==this.frozenInfo.row||!e||this.hasHScroll)},isTopLine:function(t){return!(0!==t||!this.frozenInfo.bottom)},getRowClass:function(t){const e=t.tg_view_index,i=["tg-row"],o=e%2==1;i.push({"tg-odd":o,"tg-even":!o,"tg-list-first":0===t.tg_list_index,"tg-list-last":t.tg_list_last,"tg-group-line":this.isGroupLine(t),"tg-none-line":this.isNoneLine(e),"tg-top-line":this.isTopLine(e),"tg-group":t.tg_group,"tg-selected":t.selected}),t.type&&i.push(`tg-${t.type}`);const n=t.tg_state_names;return n&&n.forEach((function(e){t[e]&&i.push(`tg-${e}`)})),i.push(u.classMap(t.classMap)),u.classMap(i)},getRowHeight:function(t){return t&&u.isNum(t.tg_height)?t.tg_height:this.options.rowHeight},getRowsHeight:function(){let t=0;const e=this.getRowsLength();for(let i=0;i<e;i++)t+=this.getRowHeight(this.viewRows[i]);return t},getFrozenRowsHeight:function(){let t=0;const e=this.frozenInfo.rows;for(let i=0;i<e;i++)t+=this.getRowHeight(this.viewRows[i]);return t},getViewRowTop:function(t){let e=t.tg_top;const i=t.tg_view_index;if(this.frozenInfo.rows){if(!(i>this.frozenInfo.row))return e;e-=this.frozenRowsHeight}return e-=this.scrollTopOffset,e},getRowTop:function(t){let e=t.tg_top;return t.tg_frozen||(e-=this.frozenRowsHeight),e},getRowVPos:function(t){const e=this.frozenInfo.bottom,i=this.frozenInfo.row;let o="top";return this.frozenInfo.rows&&(t<=i?e&&(o="bottom"):e||(o="bottom")),o},getRowCanvas:function(t,e){return"top"===t?"left"===e?this.$bodyTL:this.$bodyTR:"left"===e?this.$bodyBL:this.$bodyBR}};function Vt(t,e,i){return(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const Ot={CHANGE:"change"},$t={h:{type:"h",className:"tg-scrollbar-h",offset:"left",size:"width",page:"pageX",axis:"x",offsetName:"offsetX"},v:{type:"v",className:"tg-scrollbar-v",offset:"top",size:"height",page:"pageY",axis:"y",offsetName:"offsetY"}};class Bt extends O{constructor(t,e){super(),Vt(this,"type","h"),Vt(this,"settings",{}),Vt(this,"size",0),Vt(this,"viewSize",0),Vt(this,"bodySize",0),Vt(this,"trackSize",0),Vt(this,"position",0),Vt(this,"scale",0),Vt(this,"thumbPosition",0),Vt(this,"thumbScale",0),this.settings=$t[t]||$t.h,this.type=this.settings.type,this.id=u.uid(4,`tg-scrollbar-${this.type}-`),this.$holder=v(e),this.$holder.find(`.${this.settings.className}`).remove(),this.options=this.generateOptions()}generateOptions(t){return u.merge({size:15,round:!1,blank:!1,motionDuration:200},t)}updateOptions(t){this.options=this.generateOptions(t);let e=this.options.size;u.isNum(e)||(e=u.toNum(e)),e=Math.round(e),e=Math.max(e,0),e=Math.min(e,30),this.size=e}create(){this.$container=v('<div><div class="tg-scrollbar-track"></div><div class="tg-scrollbar-thumb"></div></div>').appendTo(this.$holder),this.$container.attr("id",this.id),this.$container.addClass(u.classMap(["tg-scrollbar",this.settings.className,{"tg-scrollbar-round":this.options.round}])),this.$track=this.$container.find(".tg-scrollbar-track"),this.$thumb=this.$container.find(".tg-scrollbar-thumb"),this.thumbDrag=new B,this.thumbDrag.bind(B.EVENT.DRAG_START,((t,e)=>{this.thumbDragStart(e)})).bind(B.EVENT.DRAG_MOVE,((t,e)=>{this.thumbDragMove(e)})).bind(B.EVENT.DRAG_END,((t,e)=>{this.thumbDragEnd(e)}));const t=this.$container.get(0);return this.scrollEvents={mousedown:{handler:e=>{e.target.classList.contains("tg-scrollbar-thumb")?this.thumbMouseDownHandler(e):(this.trackEvents={mouseup:{handler:t=>{this.trackMouseupHandler(t)},options:{once:!0}}},u.bindEvents(this.trackEvents,t),this.trackMousedownHandler(e))},options:!0},selectstart:{handler:t=>{u.preventDefault(t)},options:!0}},u.bindEvents(this.scrollEvents,t),this}getBlank(){return this.options.blank}getSize(){return this.size}getViewSize(){return this.viewSize}getBodySize(){return this.bodySize}getTrackMouseDirection(){let t=1;return this.trackMousePosition<this.thumbPosition&&(t=-1),t}getTrackMousePos(t){const e=this.$track.offset();return t[this.settings.page]-e[this.settings.offset]}getMaxThumbPosition(){return this.trackSize-this.thumbSize}setThumbPosition(t){return t===this.thumbPosition||(this.thumbPosition=t,this.$thumb&&this.$thumb.css(this.settings.offset,t)),this}updateThumbPosition(){let t=0;const e=this.getMaxPosition();if(e>0){const i=this.getMaxThumbPosition();t=Math.round(i*this.position/e),t=u.clamp(t,0,i)}return this.setThumbPosition(t),this}trackMousedownHandler(t){return this.motionStop(),this.trackMousePosition=this.getTrackMousePos(t),this.motionStart(),this}trackMouseupHandler(t){return u.unbindEvents(this.trackEvents),this.motionStop(),this.motionStarted||(this.trackMousePosition=this.getTrackMousePos(t),this.trackScrollHandler(),this.triggerEvent()),this}trackScrollHandler(){const t=Math.max(0,this.viewSize-20)*this.getTrackMouseDirection();return this.setOffset(t),this}motionStop(){return this.motion&&(this.motion.destroy(),this.motion=null),this}motionStart(){const t=this.position,e=Math.round(this.trackMousePosition/this.viewSize*this.getMaxPosition());return this.motionStarted=!1,this.motion=new G,this.motion.bind(G.EVENT.MOTION_START,((t,e)=>{this.motionStarted=!0})),this.motion.bind(G.EVENT.MOTION_MOVE,((t,e)=>{this.motionUpdateHandler(t,e)})),this.motion.start({duration:this.options.motionDuration,from:t,till:e}),this}motionUpdateHandler(t,e){e!==this.position&&(this.setPosition(e),this.triggerEvent())}thumbMouseDownHandler(t){this.$thumb.addClass("tg-scrollbar-thumb-hold"),this.thumbDrag.start(t,{target:this.$thumb})}thumbDragStart(t){this.motionStop(),t.thumbPositionStart=this.thumbPosition}thumbDragMove(t){let e=t.thumbPositionStart+t[this.settings.offsetName];const i=this.getMaxThumbPosition();e=u.clamp(e,0,i),this.setThumbPosition(e);let o=0;i>0&&(o=u.per(e/i)*this.getMaxPosition(),o=Math.round(o)),this.position=o,this.triggerEvent()}thumbDragEnd(t){this.$thumb&&this.$thumb.removeClass("tg-scrollbar-thumb-hold")}triggerEvent(){this.trigger(Ot.CHANGE,this.position)}getPosition(){return this.position}setPosition(t){t=u.toNum(t,!0);const e=this.getMaxPosition();t=u.clamp(t,0,e),this.position=t,this.updateThumbPosition()}getMaxPosition(){return this.bodySize-this.viewSize}updatePosition(){const t=this.getMaxPosition(),e=u.clamp(this.position,0,t);this.position=e}setOffset(t){t=u.toNum(t);const e=this.position+t;return this.setPosition(e),this}getScale(){return this.scale}setScale(t){return t=u.per(t),this.scale=t,this.scaleChangeHandler(),this}scaleChangeHandler(){let t=Math.round(this.viewSize*this.scale);if(t=Math.max(t,this.options.size),t=Math.min(t,this.viewSize),this.thumbSize=t,this.$thumb){const t={};"h"===this.type?(t.height=this.size,t.width=this.thumbSize):(t.width=this.size,t.height=this.thumbSize),this.$thumb.css(t)}}updateTrackSize(){const t={};return"h"===this.type?(t.width=this.trackSize,t.height=this.size):(t.height=this.trackSize,t.width=this.size),this.$container.css(t),this}updateThumbSize(){let t=0;return this.bodySize&&(t=this.trackSize/this.bodySize),this.setScale(t),this}parseSize(t){return t=u.toNum(t),t=Math.round(t),t=Math.max(t,0)}updateSize(t,e,i){t=this.parseSize(t),this.viewSize=t,e=this.parseSize(e),this.bodySize=e,i=u.isNum(i)?this.parseSize(i):t,this.trackSize=i,this.previousFadeIn=null}fade(t){return!(!this.$container||!this.size)&&(this.previousFadeIn!==t&&(this.previousFadeIn=t,t?this.$container.hasClass("tg-fade-out")&&this.$container.removeClass("tg-fade-out").addClass("tg-fade-in"):this.$container.removeClass("tg-fade-in").addClass("tg-fade-out"),!0))}show(){if(this.updatePosition(),!this.getBlank())return!this.$container&&this.size>0&&this.create(),this.$container?(this.updateTrackSize(),this.updateThumbSize(),this):this;this.remove()}hide(){return this.updatePosition(),this.remove(),this}remove(){if(this.motionStop(),u.unbindEvents(this.scrollEvents),u.unbindEvents(this.trackEvents),this.thumbDrag&&(this.thumbDrag.destroy(),this.thumbDrag=null),!this.$container)return this;this.$thumb=null,this.$track=null,this.$container.remove(),this.$container=null}destroy(){return this.remove(),this}}function Dt(t,e,i){return(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}Vt(Bt,"EVENT",Ot),Vt(Bt,"H","h"),Vt(Bt,"V","v");const Wt={CHANGE:"change"};class At extends O{constructor(t,e){super(),Dt(this,"visible",!0),this.id=u.uid(4,`tg-scroll-pane-${e}-`),this.gradientInfo=[],this.$container=v(t).attr("id",this.id),this.$container.addClass("tg-scroll-pane"),this.$scrollView=this.$container.find(".tg-scroll-view"),this.$scrollBody=this.$scrollView.find(".tg-scroll-body"),this.scrollbarH=new Bt(Bt.H,this.$container),this.scrollbarH.bind(Bt.EVENT.CHANGE,((t,e)=>{this.scrollHChangeHandler()})),this.scrollbarV=new Bt(Bt.V,this.$container),this.scrollbarV.bind(Bt.EVENT.CHANGE,((t,e)=>{this.scrollVChangeHandler()})),this.options=this.generateOptions()}generateOptions(t){return u.merge({scrollbarH:{},scrollbarV:{},scrollbarFade:!1,scrollSizeOnKeyPress:20,gradient:30},t)}show(){return this.$container.show(),this.visible=!0,this}hide(){return this.$container.hide(),this.visible=!1,this}width(){return this.scrollPaneW}height(){return this.scrollPaneH}render(t){return this.visible?(this.options=this.generateOptions(t),this.update(),this):this}update(){this.scrollPaneW=this.options.scrollPaneW,this.scrollPaneH=this.options.scrollPaneH,this.scrollBodyW=this.options.scrollBodyW,this.scrollBodyH=this.options.scrollBodyH,this.updateScrollbar()}setGroupH(t){this.groupH=u.toList(t)}setGroupV(t){this.groupV=u.toList(t)}updateGroupH(){if(!u.isList(this.groupH))return this;const t=this.scrollbarH.getPosition();return this.groupH.forEach((function(e){e&&e.updateScrollHFromGroup(t)})),this}updateGroupV(){if(!u.isList(this.groupV))return this;const t=this.scrollbarV.getPosition();return this.groupV.forEach((function(e){e&&e.updateScrollVFromGroup(t)})),this}updateGroupList(){this.updateGroupH(),this.updateGroupV()}updateScrollHFromGroup(t){this.scrollbarH.getPosition()!==t&&(this.scrollbarH.setPosition(t),this.updateScrollLeft(),this.triggerEvent())}updateScrollVFromGroup(t){this.scrollbarV.getPosition()!==t&&(this.scrollbarV.setPosition(t),this.updateScrollTop(),this.triggerEvent())}setPosition(t,e){return this.scrollbarH.setPosition(t),this.scrollbarV.setPosition(e),this.updateScrollLeft(),this.updateScrollTop(),this.updateGroupList(),this}updateScrollbar(){this.scrollbarH.updateOptions(this.options.scrollbarH),this.scrollbarV.updateOptions(this.options.scrollbarV),this.updateScrollState(),this.updateScrollView(),this.updateScrollTrack(),this.scrollbarH.updateSize(this.scrollViewW,this.scrollBodyW,this.scrollTrackW),this.scrollbarV.updateSize(this.scrollViewH,this.scrollBodyH,this.scrollTrackH),this.hasScrollH?(this.scrollbarH.show(),this.scrollbarH.setPosition(this.scrollbarH.getPosition())):this.scrollbarH.hide(),this.hasScrollV?(this.scrollbarV.show(),this.scrollbarV.setPosition(this.scrollbarV.getPosition())):this.scrollbarV.hide(),this.updateScrollLeft(),this.updateScrollTop(),this.updateGroupList()}updateScrollState(){const t=this.scrollbarH.getSize(),e=this.scrollbarV.getSize(),i=this.scrollbarH.getBlank(),o=this.scrollbarV.getBlank(),n=this.options.scrollbarFade;let s=!1,r=0;(function(){(this.scrollPaneW<this.scrollBodyW||i)&&(s=!0,r=t,n&&(r=0))}).call(this);let l=!1,h=0;(function(){(this.scrollPaneH<this.scrollBodyH+r||o)&&(l=!0,h=e,n&&(h=0),!s&&this.scrollPaneW<this.scrollBodyW+h&&(s=!0,r=t,n&&(r=0)))}).call(this),this.hasScrollH=s,this.hasScrollV=l,this.scrollSizeH=r,this.scrollSizeV=h}updateScrollView(){this.scrollViewW=this.scrollPaneW,this.hasScrollV&&(this.scrollViewW=this.scrollPaneW-this.scrollSizeV),this.scrollViewH=this.scrollPaneH,this.hasScrollH&&(this.scrollViewH=this.scrollPaneH-this.scrollSizeH);const t=this.scrollbarH.getBlank(),e=this.scrollbarV.getBlank();let i=this.scrollViewW;e&&!0!==e&&(i=this.scrollPaneW);let o=this.scrollViewH;return t&&!0!==t&&(o=this.scrollPaneH),this.$scrollView.css({width:`${i}px`,height:`${o}px`}),this}updateScrollTrack(){this.scrollTrackW=this.scrollViewW,this.scrollTrackH=this.scrollViewH,this.options.scrollbarFade&&this.hasScrollH&&this.hasScrollV&&(this.scrollTrackW-=this.scrollbarV.getSize(),this.scrollTrackH-=this.scrollbarH.getSize())}fade(t){const e=this.scrollbarH.fade(t),i=this.scrollbarV.fade(t);return e||i}hasScrollbar(){return!!this.visible&&(!(!this.hasScrollH&&!this.hasScrollV)&&!(!this.scrollbarV.getSize()&&!this.scrollbarH.getSize()))}updateScrollLeft(){const t=this.getScrollLeft();return this.$scrollBody.css("left",-t+"px"),this.updateGradient(),this}updateScrollTop(){const t=this.getScrollTop()-this.getScrollTopOffset();return this.$scrollBody.css("top",-t+"px"),this.updateGradient(),this}updateGradient(){const t=this.options;if(!t.scrollbarFade)return;t.gradient&&(this.asyncUpdateGradient||(this.asyncUpdateGradient=u.microtask(this.updateGradientSync)),this.asyncUpdateGradient.apply(this,arguments))}updateGradientSync(){const t=[],e=this.options.gradient,i=this.getScrollLeft(),o=this.getScrollTop(),n=this.getMaxScrollLeft(),s=this.getMaxScrollTop();this.hasScrollH&&(i>e&&t.push("left"),i<n-e&&t.push("right")),this.hasScrollV&&(o>e&&t.push("top"),o<s-e&&t.push("bottom")),t.join("")!==this.gradientInfo.join("")&&(this.gradientInfo=t,["left","right","top","bottom"].forEach((e=>{const i=`tg-gradient-${e}`;t.includes(e)?this.$container.addClass(i):this.$container.removeClass(i)})))}getScrollLeft(){return this.scrollbarH.getPosition()}getScrollTop(){return this.scrollbarV.getPosition()}getMaxScrollLeft(){return this.scrollbarH.getMaxPosition()}getMaxScrollTop(){return this.scrollbarV.getMaxPosition()}getScrollTopOffset(){const t=this.getScrollTop();return t-t%1e4}triggerEvent(){this.trigger(Wt.CHANGE,{scrollLeft:this.getScrollLeft(),scrollTop:this.getScrollTop()})}scrollHChangeHandler(){this.updateScrollLeft(),this.updateGroupList(),this.triggerEvent()}scrollVChangeHandler(){this.updateScrollTop(),this.updateGroupList(),this.triggerEvent()}setOffsetH(t){const e=this.getScrollLeft();this.scrollbarH.setOffset(t);return this.getScrollLeft()!==e&&(this.updateScrollLeft(),this.updateGroupList(),this.triggerEvent(),!0)}setOffsetV(t){const e=this.getScrollTop();this.scrollbarV.setOffset(t);return this.getScrollTop()!==e&&(this.updateScrollTop(),this.updateGroupList(),this.triggerEvent(),!0)}mouseWheelHandler(t){const e=t.deltaX,i=t.deltaY,o=Math.abs(e);if(o>Math.abs(i)){if(this.hasScrollH)return this.setOffsetH(e)}else{if(this.hasScrollV)return this.setOffsetV(i);if(this.hasScrollH&&!o)return this.setOffsetH(i)}return!1}keyPageUpHandler(t){return this.setOffsetV(-this.scrollViewH)}keyPageDownHandler(t){return this.setOffsetV(this.scrollViewH)}keyEndHandler(t){return this.setOffsetV(this.scrollBodyH)}keyHomeHandler(t){return this.setOffsetV(-this.scrollBodyH)}keyLeftHandler(t){return this.setOffsetH(-this.options.scrollSizeOnKeyPress)}keyUpHandler(t){return this.setOffsetV(-this.options.scrollSizeOnKeyPress)}keyRightHandler(t){return this.setOffsetH(this.options.scrollSizeOnKeyPress)}keyDownHandler(t){return this.setOffsetV(this.options.scrollSizeOnKeyPress)}destroy(){return this.visible=!1,this.groupH=null,this.groupV=null,this.scrollbarV&&(this.scrollbarV.destroy(),this.scrollbarV=null),this.scrollbarH&&(this.scrollbarH.destroy(),this.scrollbarH=null),this.$container=null,this.$scrollView=null,this.$scrollBody=null,this}}Dt(At,"EVENT",Wt);const Ft={initScrollPane:function(){this.initFrozenStyle(),this.createScrollPane()},initFrozenStyle:function(){const t={HL:{container:this.$paneHL,cls:[]},HR:{container:this.$paneHR,cls:[]},TL:{container:this.$paneTL,cls:[]},TR:{container:this.$paneTR,cls:[]},BL:{container:this.$paneBL,cls:[]},BR:{container:this.$paneBR,cls:[]}},e="tg-frozen-h";this.frozenInfo.rows&&(this.frozenInfo.bottom?(t.BL.cls.push(e),t.BR.cls.push(e)):(t.TL.cls.push(e),t.TR.cls.push(e)));const i="tg-frozen-v",o="tg-frozen-line-v";this.frozenInfo.columns&&(this.frozenInfo.right?(t.HR.cls.push(i),t.TR.cls.push(i),t.BR.cls.push(i)):(t.HL.cls.push(i),t.TL.cls.push(i),t.BL.cls.push(i)),t.HL.cls.push(o),t.TL.cls.push(o),t.BL.cls.push(o));const n="tg-frozen",s=[n,e,i,o].join(" ");Object.keys(t).forEach((function(e){const i=t[e],o=i.container;o.removeClass(s);const r=i.cls;if(!r.length)return;const l=[n].concat(r).join(" ");o.addClass(l)}))},createScrollPane:function(){this.removeScrollPane(),this.scrollPaneMap={HL:new At(this.$paneHL,"header-left"),HR:new At(this.$paneHR,"header-right"),TL:new At(this.$paneTL,"top-left"),TR:new At(this.$paneTR,"top-right"),BL:new At(this.$paneBL,"bottom-left"),BR:new At(this.$paneBR,"bottom-right")},this.scrollPaneMap.BR.setGroupH([this.scrollPaneMap.HR,this.scrollPaneMap.TR]),this.scrollPaneMap.TR.setGroupH([this.scrollPaneMap.HR,this.scrollPaneMap.BR]),this.scrollPaneMap.BL.setGroupH([this.scrollPaneMap.HL,this.scrollPaneMap.TL]),this.scrollPaneMap.TL.setGroupH([this.scrollPaneMap.HL,this.scrollPaneMap.BL]),this.scrollPaneMap.BR.setGroupV(this.scrollPaneMap.BL),this.scrollPaneMap.BL.setGroupV(this.scrollPaneMap.BR),this.scrollPaneMap.TR.setGroupV(this.scrollPaneMap.TL),this.scrollPaneMap.TL.setGroupV(this.scrollPaneMap.TR),this.initActiveScrollPane(),this.initPaneVisibility()},initActiveScrollPane:function(){const t=this.getScrollPaneVP(),e=this.getScrollPaneHP(),i=`${t}${e}`;this.scrollPane=this.scrollPaneMap[i],this.scrollPane.bind(At.EVENT.CHANGE,((t,e)=>{this.scrollPaneChangeHandler(t,e)}));let o={L:"L",R:"L"};this.frozenInfo.columns&&this.frozenInfo.right&&(o={L:"R",R:"L"});const n=`${t}${o[e]}`;this.scrollPaneFrozen=this.scrollPaneMap[n]},getScrollPaneVP:function(){return this.frozenInfo.rows&&!this.frozenInfo.bottom?"B":"T"},getScrollPaneHP:function(){return this.frozenInfo.columns&&!this.frozenInfo.right?"R":"L"},initPaneVisibility:function(){this.scrollPaneMap.HL.show(),this.scrollPaneMap.TL.show(),this.frozenInfo.columns?(this.scrollPaneMap.HR.show(),this.scrollPaneMap.TR.show(),this.frozenInfo.rows?(this.scrollPaneMap.BL.show(),this.scrollPaneMap.BR.show()):(this.scrollPaneMap.BL.hide(),this.scrollPaneMap.BR.hide())):(this.scrollPaneMap.HR.hide(),this.scrollPaneMap.TR.hide(),this.scrollPaneMap.BR.hide(),this.frozenInfo.rows?this.scrollPaneMap.BL.show():this.scrollPaneMap.BL.hide())},scrollPaneChangeHandler:function(t,e){this.hideColumnLine(),this.scrollLeft=e.scrollLeft,this.scrollTop=e.scrollTop,this.scrollRenderHandler()},scrollbarFadeInOutHandler:function(t,e){this.options.scrollbarFade&&(e?this.updateScrollPaneFade(!0):this.options.scrollbarFadeTimeout||this.updateScrollPaneFade(!1))},updateScrollPaneFade:function(t){if(!this.options.scrollbarFade)return;this.updateScrollPaneFadeSync(t);const e=this.options.scrollbarFadeTimeout;e&&(clearTimeout(this.timeout_fade),this.timeout_fade=setTimeout((()=>{this.updateScrollPaneFadeSync(!1)}),e))},updateScrollPaneFadeSync:function(t){if(this.previousScrollbarFadeIn===t)return;this.previousScrollbarFadeIn=t;const e=[];Object.keys(this.scrollPaneMap).forEach((t=>{const i=this.scrollPaneMap[t];i.hasScrollbar()&&e.push(i)})),e.length&&e.forEach((function(e){e.fade(t)}))},updateScrollPane:function(){const t=this.getScrollbarOptions();this.scrollPaneMap.HL.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthL,scrollPaneH:this.headerHeight,scrollBodyW:this.bodyWidthL,scrollBodyH:this.headerHeight,scrollbarV:t.HLV,scrollbarH:t.HLH})),this.scrollPaneMap.HR.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthR,scrollPaneH:this.headerHeight,scrollBodyW:this.bodyWidthR,scrollBodyH:this.headerHeight,scrollbarV:t.HRV,scrollbarH:t.HRH})),this.scrollPaneMap.TL.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthL,scrollPaneH:this.paneHeightT,scrollBodyW:this.bodyWidthL,scrollBodyH:this.bodyHeightT,scrollbarV:t.TLV,scrollbarH:t.TLH})),this.scrollPaneMap.TR.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthR,scrollPaneH:this.paneHeightT,scrollBodyW:this.bodyWidthR,scrollBodyH:this.bodyHeightT,scrollbarV:t.TRV,scrollbarH:t.TRH})),this.scrollPaneMap.BL.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthL,scrollPaneH:this.paneHeightB,scrollBodyW:this.bodyWidthL,scrollBodyH:this.bodyHeightB,scrollbarV:t.BLV,scrollbarH:t.BLH})),this.scrollPaneMap.BR.render(this.getScrollPaneOptions({scrollPaneW:this.paneWidthR,scrollPaneH:this.paneHeightB,scrollBodyW:this.bodyWidthR,scrollBodyH:this.bodyHeightB,scrollbarV:t.BRV,scrollbarH:t.BRH})),this.scrollLeft=this.getScrollLeft(),this.scrollTop=this.getScrollTop(),this.updateScrollPaneFade(Boolean(this.options.scrollbarFadeTimeout))},getScrollPaneOptions:function(t){const e=this.options;return t.scrollbarFade=e.scrollbarFade,t.gradient=u.clamp(u.toNum(e.scrollPaneGradient,!0),0,100),t},getScrollbarOptions:function(){const t=this.options.scrollbarRound,e={};return["HLH","HLV","HRH","HRV","TLH","TLV","TRH","TRV","BLH","BLV","BRH","BRV"].forEach((function(i){e[i]={size:0,round:t,blank:!1}})),this.scrollbarOptionsHandler(e),this.scrollbarFadeHandler(e),e},scrollbarOptionsHandler:function(t){const e=this.scrollbarSizeH,i=this.scrollbarSizeV;this.scrollbarHeaderHandler(t,e,i),this.frozenInfo.columns?this.frozenInfo.rows?this.scrollbarC1R1Handler(t,e,i):this.scrollbarC1R0Handler(t,e,i):this.frozenInfo.rows?this.scrollbarC0R1Handler(t,e,i):this.scrollbarC0R0Handler(t,e,i)},scrollbarFadeHandler:function(t){if(this.options.scrollbarFade)for(const e in t)if(u.hasOwn(t,e)){const i=t[e];i.size>0&&i.blank&&(i.blank=!1,i.size=0)}},scrollbarHeaderHandler:function(t,e,i){this.hasVScroll&&(this.frozenInfo.columns?(t.HRV.size=i,t.HRV.blank=1):(t.HLV.size=i,t.HLV.blank=1))},scrollbarC0R0Handler:function(t,e,i){t.TLH.size=e,t.TLV.size=i},scrollbarC0R1Handler:function(t,e,i){this.frozenInfo.bottom?this.scrollbarC0R1B1Handler(t,e,i):this.scrollbarC0R1B0Handler(t,e,i)},scrollbarC0R1B1Handler:function(t,e,i){t.BLH.size=e,t.TLV.size=i,this.hasVScroll&&(t.BLV.size=i,t.BLV.blank=1)},scrollbarC0R1B0Handler:function(t,e,i){t.BLH.size=e,t.BLV.size=i,this.hasVScroll&&(t.TLV.size=i,t.TLV.blank=1)},scrollbarC1R0Handler:function(t,e,i){this.frozenInfo.right?this.scrollbarC1R0R1Handler(t,e,i):this.scrollbarC1R0R0Handler(t,e,i)},scrollbarC1R0R1Handler:function(t,e,i){this.hasHScroll&&(t.TLH.size=e,this.scrollPaneHidden?(t.TRH.size=e,t.TLH.blank=!0):(t.TRH.size=e,t.TRH.blank=!0)),t.TRV.size=i},scrollbarC1R0R0Handler:function(t,e,i){this.hasHScroll&&(t.TRH.size=e,this.scrollPaneHidden?(t.TLH.size=e,t.TRH.blank=!0):(t.TLH.size=e,t.TLH.blank=!0)),t.TRV.size=i},scrollbarC1R1Handler:function(t,e,i){this.frozenInfo.right?this.frozenInfo.bottom?this.scrollbarC1R1R1B1Handler(t,e,i):this.scrollbarC1R1R1B0Handler(t,e,i):this.frozenInfo.bottom?this.scrollbarC1R1R0B1Handler(t,e,i):this.scrollbarC1R1R0B0Handler(t,e,i)},scrollbarC1R1R1B1Handler:function(t,e,i){this.hasHScroll&&(t.BLH.size=e,this.scrollPaneHidden&&(t.BRH.size=e,t.BLH.blank=!0)),t.TRV.size=i,this.hasVScroll&&(t.BRV.size=i,t.BRV.blank=1)},scrollbarC1R1R1B0Handler:function(t,e,i){this.hasHScroll&&(t.BLH.size=e,this.scrollPaneHidden?(t.BRH.size=e,t.BLH.blank=!0):(t.BRH.size=e,t.BRH.blank=!0)),t.BRV.size=i,this.hasVScroll&&(t.TRV.size=i,t.TRV.blank=1)},scrollbarC1R1R0B1Handler:function(t,e,i){this.hasHScroll&&(t.BRH.size=e,this.scrollPaneHidden&&(t.BLH.size=e,t.BRH.blank=!0)),t.TRV.size=i,this.hasVScroll&&(t.BRV.size=i,t.BRV.blank=1)},scrollbarC1R1R0B0Handler:function(t,e,i){this.hasHScroll&&(t.BRH.size=e,this.scrollPaneHidden?(t.BLH.size=e,t.BRH.blank=!0):(t.BLH.size=e,t.BLH.blank=!0)),t.BRV.size=i,this.hasVScroll&&(t.TRV.size=i,t.TRV.blank=1)},removeScrollPane:function(){clearTimeout(this.timeout_fade),this.previousScrollbarFadeIn=null,this.scrollPaneMap&&(Object.keys(this.scrollPaneMap).forEach((t=>{const e=this.scrollPaneMap[t];e&&e.destroy()})),this.scrollPaneMap=null,this.scrollPane=null,this.scrollPaneFrozen=null)}},jt={updateScrollState:function(){this.updateGlobalScrollInfo(),this.updateHScrollState(),this.updateVScrollState(),this.updateBlankColumnWidth(),this.scrollStateChanged=!1,this.previousHasHScroll===this.hasHScroll&&this.previousHasVScroll===this.hasVScroll||(this.scrollStateChanged=!0,this.previousHasHScroll=this.hasHScroll,this.previousHasVScroll=this.hasVScroll,this.trigger(S.onScrollStateChanged,{hasHScroll:this.hasHScroll,hasVScroll:this.hasVScroll}))},updateGlobalScrollInfo:function(){this.totalRowsLength=this.getRowsLength(),this.totalRowsHeight=this.getRowsHeight(),this.frozenRowsHeight=this.getFrozenRowsHeight(),this.scrollRowsHeight=this.totalRowsHeight-this.frozenRowsHeight,this.totalRowsHeight=Math.max(this.totalRowsHeight,1),this.scrollRowsHeight=Math.max(this.scrollRowsHeight,1),this.flushRowFrom(this.totalRowsLength)},updateHScrollState:function(){if(this.hasHScroll=!0,this.updateScrollPaneHiddenState(),this.updateHScrollByScrollPaneHidden(),this.scrollPaneHidden)return;this.containerWidth-this.columnsWidth>=0&&(this.hasHScroll=!1)},getScrollPaneCurrentWidth:function(){return this.frozenInfo.right?this.bodyWidth-this.columnsWidthR:this.bodyWidth-this.columnsWidthL},updateHScrollByScrollPaneHidden:function(){if(this.scrollPaneHidden){this.hasHScroll=!1;this.getScrollPaneCurrentWidth()<this.getScrollbarWidth()&&(this.hasHScroll=!0)}},updateScrollPaneHiddenState:function(){if(this.scrollPaneHidden=!1,this.frozenInfo.columns){this.getScrollPaneCurrentWidth()<this.getScrollPaneMinWidth()&&(this.scrollPaneHidden=!0)}this.updateScrollHeaderVisibility()},updateScrollHeaderVisibility:function(){if(this.previousHasScrollHeader===this.scrollPaneHidden)return;this.previousHasScrollHeader=this.scrollPaneHidden;let t=this.$headerR.get(0);this.frozenInfo.right&&(t=this.$headerL.get(0)),this.scrollPaneHidden?t.style.visibility="hidden":t.style.visibility="",this.updateScrollPaneColumnsHidden(this.scrollPaneHidden),this.cssRulesInvalid=!0},updateScrollPaneColumnsHidden:function(t){const e=this.frozenInfo.columns,i=this.viewAllColumns;for(let o=e,n=i.length-1;o<n;o++){i[o].tg_filtered=t}},getScrollPaneMinWidth:function(){let t=this.options.scrollPaneMinWidth;return(!u.isNum(t)||t<0)&&(t=this.scrollbarSizeV),t},updateVScrollState:function(){this.hasVScroll=!0;const t=this.getScrollbarHeight();if(this.options.autoHeight)this.hasVScroll=!1,this.containerHeight=this.headerHeight+this.totalRowsHeight+t,this.$holder.height(this.containerHeight);else{this.containerHeight-this.headerHeight-t>=this.totalRowsHeight&&(this.hasVScroll=!1)}},updateBlankColumnWidth:function(){let t=this.containerWidth-this.columnsWidth;!this.hasVScroll||this.hasHScroll||this.options.scrollbarFade||(t-=this.scrollbarSizeV),this.scrollPaneHidden&&(t=0),this.hasHScroll||(t>=0?(this.frozenInfo.columns?this.columnsWidthR+=t:this.columnsWidthL+=t,this.blankColumn.tg_width=t):this.hasHScroll=!0)}},Gt={scrollToRow:function(t){const e=this.getRowItem(t);return this.scrollToItem(e,null),this},scrollToColumn:function(t){const e=this.getColumnItem(t);return this.scrollToItem(null,e),this},scrollToCell:function(t,e){const i=this.getRowItem(t),o=this.getColumnItem(e);return this.scrollToItem(i,o),this},scrollToFirstRow:function(){return this.setScrollTop(0),this},scrollToLastRow:function(){const t=this.getViewRows(),e=t[t.length-1],i=this.getScrollRowPosition(e);if(u.isNum(i))return this.setScrollTop(i),this},scrollToFirstColumn:function(){return this.setScrollLeft(0),this},scrollToLastColumn:function(t){const e=this.getViewColumns();let i=e[e.length-2];t&&(i=e[e.length-1]);const o=this.getScrollColumnPosition(i);if(u.isNum(o))return this.setScrollLeft(o),this},scrollRowIntoView:function(t){const e=this.getRowItem(t);return this.scrollItemIntoView(e,null),this},scrollColumnIntoView:function(t){const e=this.getColumnItem(t);return this.scrollItemIntoView(null,e),this},scrollCellIntoView:function(t,e){const i=this.getRowItem(t),o=this.getColumnItem(e);return this.scrollItemIntoView(i,o),this},setScroll:function(t,e){return t===this.scrollLeft&&e===this.scrollTop||(this.scrollLeft=t,this.scrollTop=e,this.scrollHandler()),this},setScrollLeft:function(t){return t===this.scrollLeft||(this.scrollLeft=t,this.scrollHandler()),this},setScrollTop:function(t){return t===this.scrollTop||(this.scrollTop=t,this.scrollHandler()),this},getScrollRowPosition:function(t){if(!t)return;let e=t.tg_view_index;return e-=this.frozenInfo.rows,e>=0?this.getRowTop(t):void 0},getScrollColumnPosition:function(t){if(!t)return;let e=t.tg_left;return this.frozenInfo.columns&&(e-=this.bodyWidthL),e>=0?e:void 0},scrollToItem:function(t,e){return this.scrollToChanged=!1,this.scrollToRowHandler(t),this.scrollToColumnHandler(e),this.scrollToChanged?(this.scrollHandler(),this):this},scrollToRowHandler:function(t){if(!t)return;const e=this.getScrollRowPosition(t);u.isNum(e)&&e!==this.scrollTop&&(this.scrollTop=e,this.scrollToChanged=!0)},scrollToColumnHandler:function(t){if(!t)return;const e=this.getScrollColumnPosition(t);u.isNum(e)&&e!==this.scrollLeft&&(this.scrollLeft=e,this.scrollToChanged=!0)},scrollItemIntoView:function(t,e){return this.scrollIntoViewChanged=!1,this.scrollRowIntoViewHandler(t),this.scrollColumnIntoViewHandler(e),this.scrollIntoViewChanged?(this.scrollHandler(),this):this},scrollRowIntoViewHandler:function(t){if(!t)return;const e=this.getScrollRowPosition(t);if(!u.isNum(e))return;if(e<this.scrollTop)return this.scrollTop=e,void(this.scrollIntoViewChanged=!0);const i=this.getRowHeight(t),o=this.getScrollViewHeight();if(e+i>this.scrollTop+o){const t=e-(o-i);this.scrollTop=t,this.scrollIntoViewChanged=!0}},scrollColumnIntoViewHandler:function(t){if(!t)return;const e=this.getScrollColumnPosition(t);if(!u.isNum(e))return;if(e<this.scrollLeft)return this.scrollLeft=e,void(this.scrollIntoViewChanged=!0);const i=t.tg_width,o=this.getScrollViewWidth();if(e+i>this.scrollLeft+o){const t=e-(o-i);this.scrollLeft=t,this.scrollIntoViewChanged=!0}},scrollOnInit:function(t){const{scrollLeft:e,scrollTop:i,scrollColumn:o,scrollRow:n}=t;this.scrollIntoViewChanged=!1,Number.isInteger(e)&&e!==this.scrollLeft&&(this.scrollLeft=e,this.scrollIntoViewChanged=!0),Number.isInteger(i)&&i!==this.scrollTop&&(this.scrollTop=i,this.scrollIntoViewChanged=!0),o&&this.scrollColumnIntoViewHandler(o),n&&this.scrollRowIntoViewHandler(n),this.scrollIntoViewChanged&&this.scrollPane.setPosition(this.scrollLeft,this.scrollTop)},scrollHandler:function(){this.scrollPane.setPosition(this.scrollLeft,this.scrollTop),this.scrollRenderHandler()},scrollRenderHandler:function(){this.previousScrollLeft===this.scrollLeft&&this.previousScrollTop===this.scrollTop||(this.previousScrollLeft=this.scrollLeft,this.previousScrollTop=this.scrollTop,this.onNextUpdated((()=>{this.updateScrollPaneFade(!0),this.trigger(S.onScroll,{scrollLeft:this.scrollLeft,scrollTop:this.scrollTop})})),this.render())},scrollTouchStartHandler:function(t,e){this.hideColumnLine(),this.scrollTouchLeft=this.getScrollLeft(),this.scrollTouchTop=this.getScrollTop(),this.scrollMaxTouchLeft=this.getMaxScrollLeft(),this.scrollMaxTouchTop=this.getMaxScrollTop()},scrollTouchMoveHandler:function(t,e){if(e.touchLength>1)return;let i=e.offsetX,o=e.offsetY;this.stabilizeTouchX(e)&&(i=0),this.stabilizeTouchY(e)&&(o=0);let n=this.scrollTouchLeft-i,s=this.scrollTouchTop-o;n=u.clamp(n,0,this.scrollMaxTouchLeft),s=u.clamp(s,0,this.scrollMaxTouchTop);let r=!1;this.scrollPaneHidden&&(r=this.scrollPaneFrozen.setOffsetH(-e.moveX),n=0);const l=this.getScrollLeft(),h=this.getScrollTop();(n!==l||s!==h||r)&&(u.preventDefault(e.e),this.setScroll(n,s))},scrollTouchEndHandler:function(){this.protectedItem=null},scrollTouchInertiaHandler:function(t,e){const i=this.getScrollLeft(),o=this.getScrollTop(),n=i-e.touchInertiaX,s=o-e.touchInertiaY;this.setScroll(n,s)},getScrollViewWidth:function(){let t=this.getScrollPaneWidth();return this.frozenInfo.right||(t-=this.getScrollbarWidth()),t},getScrollViewHeight:function(){let t=this.getScrollPaneHeight();return this.frozenInfo.bottom||(t-=this.getScrollbarHeight()),t},getScrollPaneWidth:function(){return this.scrollPane.width()},getScrollPaneHeight:function(){return this.scrollPane.height()},getScrollbarWidth:function(){return this.hasVScroll&&!this.options.scrollbarFade?this.scrollbarSizeV:0},getScrollbarHeight:function(){return this.hasHScroll&&!this.options.scrollbarFade?this.scrollbarSizeH:0},getScrollLeft:function(){return this.scrollPane.getScrollLeft()},getScrollTop:function(){return this.scrollPane.getScrollTop()},getMaxScrollLeft:function(){return this.scrollPane.getMaxScrollLeft()},getMaxScrollTop:function(){return this.scrollPane.getMaxScrollTop()}};class Ut{constructor(t){this.options=this.generateOptions(t)}generateOptions(t){return u.merge({ignore:null,sortField:"",sortFactor:1,sortBlankFactor:1,sortComparer:null},t)}sortList(t){if(!u.isList(t)||1===t.length)return!1;this.ignoreExcludeHandler(t);const e=this.comparerHandler(t);return this.ignoreIncludeHandler(t),e}getDefaultComparer(t){return(yt[t]||yt.string).bind(this)}comparerHandler(t){const e=this.options,i=e.sortField,o=e.sortFactor,n=e.sortBlankFactor,s=e.sortComparer;return"function"==typeof s&&(t.sort(((t,e)=>s.call(this,t,e,{sortField:i,sortFactor:o,sortBlankFactor:n}))),!0)}ignoreExcludeHandler(t){const e=this.options.ignore;this.ignoreListTop=[],this.ignoreListBottom=[];const i=[];for(let o=0,n=t.length;o<n;o++){const n=e(t[o]);n&&(n.top?this.ignoreListTop.unshift(n):this.ignoreListBottom.push(n),i.push(o))}i.reverse(),i.forEach((function(e){t.splice(e,1)}))}ignoreIncludeHandler(t){this.ignoreListTop.forEach((e=>{t.unshift(e.item)})),this.ignoreListBottom.forEach((e=>{t.push(e.item)}))}}const Xt={removeSortColumn:function(){return this.sortColumn=null,this.$header&&this.$header.find(".tg-column-sorted").removeClass("tg-column-sorted"),this},setSortColumn:function(t){if(!(t=this.getColumnItem(t)))return;if(!this.isColumnSortable(t))return;t===this.sortColumn?t.sortAsc=!t.sortAsc:u.hasOwn(t,"sortAsc")||(t.sortAsc=this.options.sortAsc),this.sortColumn=t;if(this.getRowsLength()-this.frozenInfo.rows<2)return;if(!this.headerCreated)return;this.updateRowsSort()&&(this.renderHeaderSort(),this.flushSort(),this.render("rows"))},renderHeaderSort:function(){const t=this.sortColumn;if(!t)return this;if(!this.isColumnSortable(t))return this;this.$header.find(".tg-column-sorted").removeClass("tg-column-sorted");const e=t.tg_view_index,i=this.$header.find(`.tg-header-item[column='${e}']`).find(".tg-column-header").addClass("tg-column-sorted");return t.sortAsc?i.removeClass("tg-sort-desc").addClass("tg-sort-asc"):i.removeClass("tg-sort-asc").addClass("tg-sort-desc"),this},getSortComparer:function(t){const e=t.comparer;if("function"==typeof e)return e;const i=this.options.sortComparers,o=i[e||t.type];return"function"==typeof o?o:i.string},updateRowsSort:function(){const t=this.sortColumn;if(!t)return!1;const e=t.id;return!!e&&this.sortRows(e,t)},sortRows:function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const i=e.sortAsc?-1:1,o=this.options.sortBlankValueBottom?1:i,n=this.getSortComparer(e);let s=!1;const r=new Ut({ignore:function(t){return t.tg_frozen?{item:t,top:!0}:t.sortFixed?{item:t,top:"top"===t.sortFixed}:void 0},sortField:t,sortFactor:i,sortBlankFactor:o,sortComparer:n}),l=function(t){r.sortList(t)&&(s=!0),t.forEach((function(t,e){t.subs&&l(t.subs)}))};return l(this.rows),s}},Yt={default:{},lightblue:{rowHeight:35,scrollbarSize:10,scrollbarRound:!0},dark:{}},qt={getAllThemes:function(){return Object.keys(Yt)},getThemeOptions:function(t){return Yt[t]}},Kt={update:function(){return this.flushBody(),this.render("rows"),this},updateRow:function(t,e){const i=this.getRowItem(t);if(!i)return this;if(e&&"object"==typeof e){const t=this.getItemSnapshot(e);Object.keys(t).forEach((function(e){i[e]=t[e]}))}return this.flushRow(i.tg_view_index),this.render("rows"),this},updateCell:function(t,e,i){const o=this.getRowItem(t);if(!o)return this;const n=this.getColumnItem(e);return n?(arguments.length>2&&(o[n.id]=i),this.flushCell(o.tg_view_index,n.tg_view_index),this.render("rows"),this):this},onNextUpdated:function(t){return"function"!=typeof t||this.once(S.onUpdated,t),this}},Qt={getViewport:function(){this.scrollLeft=this.getScrollLeft(),this.scrollTop=this.getScrollTop();return{rows:this.getViewportRows(),columns:this.getViewportColumns()}},getViewportRows:function(){const t=[],e=this.viewRows,i=e.length;if(!i)return t;let o=this.options.rowCacheLength;o=u.clamp(u.toNum(o,!0),0,i);const n=this.frozenInfo.rows;if(n){let e=0;for(;e<n;)t.push(e),e+=1}const s=i-1,r=this.scrollTop;let l=this.getRowByPosition(e,n,s,r);l-=o,l=Math.max(l,n);const h=this.scrollTop+(this.bodyHeight-this.frozenRowsHeight);let a=this.getRowByPosition(e,n,s,h);for(a+=o,a=Math.min(a,s);l<=a;)t.push(l),l+=1;return this.protectedItemHandler(t,"row"),t},getRowByPosition:function(t,e,i,o){for(;i-e>1;){const n=Math.floor(.5*(e+i)),s=t[n],r=this.getRowTop(s),l=this.getRowHeight(s);if(o<r)i=n;else{if(!(o>r+l))return n;e=n}}const n=t[i];return o<this.getRowTop(n)?e:i},getViewportColumns:function(){const t=this.getColumnListFromFrozen();let e=this.scrollLeft;e=Math.max(e,0),this.frozenInfo.columns&&(this.frozenInfo.right?e+=this.columnsWidthR:e+=this.columnsWidthL);let i=this.scrollLeft+this.bodyWidth;i=Math.min(i,this.columnsWidth);const o=this.getColumnListFromRange(e,i),n=[].concat(t).concat(o);return this.protectedItemHandler(n,"column"),n},getColumnListFromFrozen:function(){const t=this.frozenInfo.columns;if(!t)return[];const e=[];let i=0;for(;i<t;)e.push(i),i++;return e},getColumnListFromRange:function(t,e){if(t>=e)return[];const i=[],o=this.frozenInfo.columns,n=this.viewColumns;for(let s=o,r=n.length;s<r;s++){const o=n[s];this.isColumnInRange(o,t,e)&&i.push(s)}return this.updateColumnListFromCache(i),i},updateColumnListFromCache:function(t){if(!t.length)return;const e=this.viewColumns.length;let i=this.options.columnCacheLength;i=u.clamp(u.toNum(i,!0),0,e);const o=this.frozenInfo.column;for(;i>0;){const n=t[0]-1;n>o&&t.unshift(n);const s=t[t.length-1]+1;s<e&&t.push(s),i-=1}},isColumnInRange:function(t,e,i){if(this.isInvisible(t))return!1;const o=t.tg_left,n=o+t.tg_width;return!(o>i)&&!(n<e)},protectedItemHandler:function(t,e){if(!this.protectedItem)return;const i=this.protectedItem[e];u.isNum(i)&&(t.includes(i)||(t.push(i),t.sort((function(t,e){return t-e}))))}};function Zt(t,e,i){return(e=function(t){var e=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,e||"default");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===e?String:Number)(t)}(t,"string");return"symbol"==typeof e?e:String(e)}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class Jt extends O{constructor(t){super(),Zt(this,"$",v),Zt(this,"VERSION",e.VERSION),Zt(this,"TIMESTAMP",e.TIMESTAMP),this.create(t)}setOption(t,e){this.renderType="all";let i=t;if("string"==typeof t){if(this.options)return this.options[t]=e,this;i={},i[t]=e}return this.customOptions=i,this}getOption(t){const e=this.options;return arguments.length?e?e[t]:void 0:e}setData(t){this.renderType="all";const e={columns:[],rows:[]};let i;if(t&&"object"==typeof t){Array.isArray(t.columns)&&(e.columns=t.columns),Array.isArray(t.rows)&&(e.rows=t.rows);const o=t.rowsLength;Number.isInteger(o)&&o>0&&(e.rows.length=o),i=t.options}return this.data=e,this.dataOptions=i,this}setDataSnapshot(t){return this.setData(this.generateDataSnapshot(t)),this}getData(){return this.data}toString(){return"[object Grid]"}}var te;Zt(Jt,"$",v),Zt(Jt,"getInstance",u.getInstance),Zt(Jt,"getAllThemes",qt.getAllThemes),Zt(Jt,"getAllEvents",Y.getAllEvents),Zt(Jt,"VERSION",e.VERSION),Zt(Jt,"TIMESTAMP",e.TIMESTAMP),te=Jt.prototype,[y,R,T,L,I,E,x,P,z,Y,q,K,tt,et,it,st,rt,lt,Ht,Ct,St,Rt,Tt,{keyTabHandler:function(t){},keyEnterHandler:function(t){},keyEscHandler:function(t){},keyPageUpHandler:function(t){return this.scrollPane.keyPageUpHandler(t)},keyPageDownHandler:function(t){return this.scrollPane.keyPageDownHandler(t)},keyEndHandler:function(t){return this.scrollPane.keyEndHandler(t)},keyHomeHandler:function(t){return this.scrollPane.keyHomeHandler(t)},keyLeftHandler:function(t){return this.scrollPaneHidden?this.scrollPaneFrozen.keyLeftHandler(t):this.scrollPane.keyLeftHandler(t)},keyUpHandler:function(t){return this.scrollPane.keyUpHandler(t)},keyRightHandler:function(t){return this.scrollPaneHidden?this.scrollPaneFrozen.keyRightHandler(t):this.scrollPane.keyRightHandler(t)},keyDownHandler:function(t){return this.scrollPane.keyDownHandler(t)}},Lt,It,Et,xt,Pt,{showRow:function(t){return this.updateRowsInvisible(this.toRowItemList(t),!1)},hideRow:function(t){return this.updateRowsInvisible(this.toRowItemList(t),!0)},updateRowsInvisible:function(t,e){if(!t.length)return!1;const i=[];return t.forEach((t=>{t.invisible!==e&&(t.invisible=e,t.tg_invisible=e,i.push(t))})),!!i.length&&(this.update(),!0)}},zt,Mt,_t,Nt,kt,Ft,jt,Gt,Xt,qt,Kt,Qt].forEach((t=>{for(const e in t){if(u.hasOwn(te,e))throw new Error(`ERROR: extends with an existing key: "${e}"`);te[e]=t[e]}}));const ee=Jt,ie=e.VERSION,oe=e.TIMESTAMP,ne={VERSION:ie,TIMESTAMP:oe,Grid:ee,$:v,CONST:e,EventBase:O,Icon:Z,Motion:G,ScrollPane:At,Util:u}})(),o})()));
//# sourceMappingURL=turbogrid.js.map

/***/ }),

/***/ "./node_modules/vine-ui/dist/vine-ui.esm.js":
/*!**************************************************!*\
  !*** ./node_modules/vine-ui/dist/vine-ui.esm.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "components": () => (/* binding */ l),
/* harmony export */   "default": () => (/* binding */ r),
/* harmony export */   "generateTooltips": () => (/* binding */ a)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
var t={963:(e,t,o)=>{o.d(t,{Ye:()=>x,z9:()=>w,ZA:()=>g,gx:()=>y});var i=o(6609),n=o(5504),l=o(4924),r=o.n(l),a=o(3668),s=o.n(a),u=o(153),d=o.n(u),c=o(8708),p=o.n(c),v=o(8130),f=o.n(v),h=o(2137),b={attributes:{context:"vine-ui"}};b.setAttributes=p(),b.insert=d().bind(null,"head"),b.domAPI=s(),b.insertStyleElement=f();r()(h.Z,b);h.Z&&h.Z.locals&&h.Z.locals;let m=1;const g=e=>{const t=""+m++;return{uid:t,cid:`${(0,n.v6)(e)}-${t}`}},x=function(e){const t=(0,i.useAttrs)();if((0,n.nq)(e)){const o={};return Object.keys(t).filter((t=>!e.includes(t))).forEach((e=>{o[e]=t[e]})),o}return t},w=function(e){const t=(0,i.useSlots)()[e||"default"];if("function"==typeof t)return t()},y=function(e){e.addEventListener("focus",(t=>{null===e.getAttribute("readonly")&&e.value&&e.select()}))}},5504:(e,t,o)=>{o.d(t,{IA:()=>s,PF:()=>c,RI:()=>a,le:()=>i,nq:()=>r,oX:()=>l,r:()=>u,sQ:()=>d,uZ:()=>n,v6:()=>p});const i=function(e,t){return"number"!=typeof e&&(e=parseFloat(e)),isNaN(e)&&(e=0),t&&(e=Math.round(e)),e},n=function(e,t,o){return Math.max(t,Math.min(o,e))},l=function(e){return`${e}`},r=function(e){return!!(e&&e instanceof Array&&e.length>0)},a=function(e,t){return!!e&&Object.prototype.hasOwnProperty.call(e,t)},s=function(e){if("string"==typeof e||"number"==typeof e){const t=`${e}`.trim();if(parseInt(t).toString()===t&&"0"!==t)return`${t}px`}return e},u=function(e){e&&Object.keys(e).forEach((t=>{const o=e[t];o.currentTarget&&(o.currentTarget.removeEventListener(t,o.handler,o.options),o.currentTarget=null)}))},d=function(e,t){e&&(u(e),Object.keys(e).forEach((o=>{const i=e[o],n=i.target||t;n.addEventListener(o,i.handler,i.options),i.currentTarget=n})))},c=function(e){e&&"function"==typeof e.preventDefault&&e.cancelable&&e.preventDefault()},p=function(e){return`${e}`.trim().replace(/([a-z])([A-Z])/g,"$1-$2").replace(/\W/g,(e=>/[À-ž]/.test(e)?e:"-")).replace(/^-+|-+$/g,"").replace(/-{2,}/g,"-").toLowerCase()}},2137:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui,.vui ::before,.vui ::after,.vui *,.vui *::before,.vui *::after{box-sizing:border-box}.vui{font-size:14px;font-family:Helvetica,Arial,sans-serif}.vui button,.vui input,.vui optgroup,.vui select,.vui textarea{font-family:inherit}.vui button,.vui select{text-transform:none}.vui-pointer-events-none{pointer-events:none}",""]);const a=r},9529:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-button{display:inline-block;min-width:50px;max-width:200px;padding:5px 8px;color:#6c757d;font-weight:400;white-space:nowrap;text-align:center;text-overflow:ellipsis;vertical-align:middle;border:1px solid rgba(0,0,0,0);border-color:#6c757d;border-radius:5px;background-color:#f5f5f5;overflow:hidden;user-select:none;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out}.vui-button:focus{outline:0;box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.vui-button:disabled{opacity:.65}.vui-button:not(:disabled){cursor:pointer}.vui-button:not(:disabled):hover{color:#fff;border-color:#6c757d;background-color:#6c757d}.vui-button.vui-button-primary{color:#fff;border-color:#007bff;background-color:#007bff}.vui-button.vui-button-primary:hover{color:#fff;border-color:#0062cc;background-color:#0069d9}.vui-button.vui-button-primary:focus{box-shadow:0 0 0 .2rem rgba(38,143,255,.5)}.vui-button.vui-button-primary:disabled{color:#fff;border-color:#6c757d;background-color:#6c757d;opacity:.65}",""]);const a=r},3992:(e,t,o)=>{o.d(t,{Z:()=>p});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l),a=o(8669),s=o.n(a),u=new URL(o(197),o.b),d=r()(n()),c=s()(u);d.push([e.id,'.vui-checkbox{position:relative;display:flex;flex-direction:row;align-items:center;height:30px;line-height:30px}.vui-checkbox label{position:relative;display:block;min-width:22px;max-width:500px;min-height:30px;margin-left:-22px;padding-left:25px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.vui-checkbox label::before{position:absolute;top:50%;left:0;content:"";display:block;width:16px;height:16px;border:#adb5bd solid 1px;border-radius:3px;background-color:#fff;transform:translate(3px, -50%)}.vui-checkbox label::after{position:absolute;top:50%;left:0;content:"";display:block;width:16px;height:16px;background-repeat:no-repeat;background-position:center center;background-size:10px 10px;background-clip:border-box;transform:translate(3px, -50%)}.vui-checkbox input{display:block;width:22px;height:22px;margin:0;padding:0;opacity:0}.vui-checkbox input:focus~label::before{box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.vui-checkbox input:disabled~label{color:#6c757d}.vui-checkbox input:disabled~label::before{background-color:#e9ecef}.vui-checkbox input:checked~label::before{color:#fff;border-color:#0077cf;background-color:#0077cf}.vui-checkbox input:checked~label::after{background-image:url('+c+")}.vui-checkbox input:checked:disabled~label::before{border-color:#80bdff;background-color:rgba(0,123,255,.5)}.vui-checkbox input:not(:checked):focus~label::before{border-color:#80bdff}.vui-checkbox input:not(:disabled,:checked,:focus)~label:hover::before{border-color:#888}",""]);const p=d},4593:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-dialog{position:fixed;top:0;left:0;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,.2)}.vui-dialog-window{position:absolute;top:50%;left:50%;min-width:240px;max-width:80%;max-height:80%;padding:20px;box-sizing:border-box;border-radius:10px;background:#fff;transform:translate(-50%, -50%);overflow:auto}",""]);const a=r},5739:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,'.vui-flex{--vui-flex-gap: 0;--vui-flex-margin: 0;--vui-flex-padding: 0;--vui-flex-align: "";gap:var(--vui-flex-gap);justify-content:var(--vui-flex-align);margin:var(--vui-flex-margin);padding:var(--vui-flex-padding);text-overflow:ellipsis;overflow:hidden}.vui-flex>*{flex-shrink:0}.vui-flex-row{--vui-flex-align-items: center;position:relative;display:flex;flex-direction:row;align-items:var(--vui-flex-align-items)}.vui-flex-column{--vui-flex-align-items: normal;position:relative;display:flex;flex-direction:column;align-items:var(--vui-flex-align-items)}.vui-flex-wrap{flex-wrap:wrap}.vui-flex-shrink>*{flex-shrink:1}.vui-flex-auto{flex:1 1 0%;overflow:hidden}.vui-flex-empty{flex:1 1 0%;margin:0;padding:0;overflow:hidden}',""]);const a=r},14:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,'.vui-flyover{position:fixed;top:0;z-index:1000;display:none;width:0;height:100%;background-color:#fff;animation-duration:.2s;animation-fill-mode:both}.vui-flyover-resizer{position:absolute;top:0;z-index:1;width:6px;height:100%;cursor:ew-resize}.vui-flyover-right{right:0}.vui-flyover-right .vui-flyover-resizer{left:-3px}.vui-flyover-left{left:0}.vui-flyover-left .vui-flyover-resizer{right:-3px}.vui-flyover-show{display:block}.vui-flyover-show::before{position:absolute;top:0;content:"";z-index:10;display:block;width:10px;height:100%;pointer-events:none}.vui-flyover-right.vui-flyover-show::before{left:-10px;background-image:linear-gradient(to left, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0))}.vui-flyover-left.vui-flyover-show::before{left:100%;background-image:linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0))}@keyframes vui-slide-in-right{from{visibility:visible;transform:translate3d(100%, 0, 0)}to{transform:translate3d(0, 0, 0)}}.vui-slide-in-right{animation-name:vui-slide-in-right}@keyframes vui-slide-out-right{from{transform:translate3d(0, 0, 0)}to{visibility:hidden;transform:translate3d(100%, 0, 0)}}.vui-slide-out-right{animation-name:vui-slide-out-right}@keyframes vui-slide-in-left{from{visibility:visible;transform:translate3d(-100%, 0, 0)}to{transform:translate3d(0, 0, 0)}}.vui-slide-in-left{animation-name:vui-slide-in-left}@keyframes vui-slide-out-left{from{transform:translate3d(0, 0, 0)}to{visibility:hidden;transform:translate3d(-100%, 0, 0)}}.vui-slide-out-left{animation-name:vui-slide-out-left}',""]);const a=r},997:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-input{display:flex;flex-direction:row;align-items:center}.vui-input label{display:inline-block;max-width:200px;padding-right:5px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.vui-input input{display:inline-block;padding:5px;color:#495057;font-weight:400;border:1px solid #aaa;border-radius:5px;background-color:#fff;background-clip:padding-box;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}.vui-input input:disabled{color:gray;border:1px solid #ccc}.vui-input input:not(:disabled):hover{border:1px solid #888}.vui-input input:not(:disabled):focus{border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}",""]);const a=r},4841:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,'.vui-layout{--vui-gutter-hover-size: 2px;--vui-gutter-size: 4px;position:relative;display:flex;align-items:stretch;overflow:hidden}.vui-layout-row{flex-direction:row}.vui-layout-column{flex-direction:column}.vui-layout-item{position:relative;flex-grow:0;flex-shrink:0;margin:0;padding:0;box-sizing:border-box;overflow:hidden}.vui-layout-auto{flex:1 1 auto}.vui-layout-gutter{position:relative;z-index:100;flex:none}.vui-layout-gutter::before{position:absolute;content:"";display:none;width:100%;height:100%;background-color:#0077cf}.vui-layout-gutter::after{position:absolute;content:"";z-index:2;display:block;width:100%;height:100%;background-color:#000;opacity:0}.vui-layout-row>.vui-layout-gutter{width:var(--vui-gutter-size);cursor:ew-resize}.vui-layout-row>.vui-layout-gutter::before{left:50%;width:var(--vui-gutter-hover-size);transform:translateX(-50%)}.vui-layout-row>.vui-layout-gutter::after{width:calc(100% + 6px);transform:translateX(-3px)}.vui-layout-column>.vui-layout-gutter{height:var(--vui-gutter-size);cursor:ns-resize}.vui-layout-column>.vui-layout-gutter::before{top:50%;height:var(--vui-gutter-hover-size);transform:translateY(-50%)}.vui-layout-column>.vui-layout-gutter::after{height:calc(100% + 8px);transform:translateY(-4px)}.vui-layout-moving .vui-layout-item,.vui-layout-moving .vui-layout-gutter{pointer-events:none}.vui-layout-moving .vui-layout-active{pointer-events:auto}.vui-layout-moving.vui-layout-row{cursor:ew-resize}.vui-layout-moving.vui-layout-column{cursor:ns-resize}.vui-layout-gutter:hover::before,.vui-layout-active::before{display:block}',""]);const a=r},9788:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-loading{position:relative;z-index:1000;display:none;overflow:hidden;pointer-events:none}.vui-loading-show{display:inline-block}@keyframes vui-loading-icon-animation{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.vui-loading-icon{display:block;animation:1s vui-loading-icon-animation linear infinite}.vui-loading-fast .vui-loading-icon{animation:.382s vui-loading-icon-animation linear infinite}.vui-loading-s .vui-loading-icon{width:16px;height:16px}.vui-loading-m .vui-loading-icon{width:30px;height:30px}.vui-loading-l .vui-loading-icon{width:50px;height:50px}.vui-loading-center{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)}.vui-loading-center.vui-loading-show{display:block}",""]);const a=r},8985:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-modal{position:fixed;top:0;left:0;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,.2)}.vui-modal-close{position:absolute;top:0;right:0;z-index:10;width:40px;height:40px;margin-top:-15px;margin-right:-15px;font-size:20px;line-height:40px;text-align:center;border-radius:20px;background:#fff;cursor:pointer}.vui-modal-close svg{display:block;width:24px;height:24px;margin:8px 0 0 8px;opacity:.6;pointer-events:none}.vui-modal-close:hover svg{opacity:1}.vui-modal-window{position:absolute;min-width:300px;max-width:1920px;min-height:200px;max-height:1080px;box-sizing:border-box;border-radius:10px;background:#fff}.vui-modal-main{position:relative;width:100%;height:100%;padding:20px;overflow:hidden}.vui-modal-header{margin-bottom:10px;padding-bottom:10px;font-weight:bold;font-size:18px;border-bottom:2px solid #333}.vui-modal-content{position:relative;width:100%;overflow:auto}",""]);const a=r},9641:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-popover{--vui-popover-color: inherit;--vui-popover-width: 200px;--vui-popover-min-height: 20px;--vui-popover-max-height: 800px;position:fixed;z-index:1000;margin:0;padding:20px;box-sizing:border-box;color:var(--vui-popover-color);border:none;filter:drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2))}.vui-popover.vui-popover-nonreactive{pointer-events:none}.vui-popover .vui-popover-body{position:relative;width:var(--vui-popover-width);min-height:var(--vui-popover-min-height);max-height:var(--vui-popover-max-height);padding:5px;overflow:hidden}.vui-popover .vui-popover-header{margin-bottom:5px;padding-bottom:5px;border-bottom:1px solid #333}.vui-popover .vui-popover-header .vui-popover-title{font-weight:bold;font-size:16px}.vui-popover .vui-popover-content{position:relative;margin:0;padding:0}",""]);const a=r},224:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-progress{position:relative;box-sizing:border-box;border-style:solid;border-width:thin}",""]);const a=r},6269:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,'.vui-radio{position:relative;display:flex;flex-direction:row;align-items:center;height:30px;line-height:30px}.vui-radio label{position:relative;display:block;min-width:22px;max-width:500px;min-height:30px;margin-left:-22px;padding-left:25px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.vui-radio label::before{position:absolute;top:50%;left:0;content:"";display:block;width:16px;height:16px;box-sizing:border-box;border:#adb5bd solid 1px;border-radius:50%;background:#fff;transform:translate(3px, -50%)}.vui-radio label::after{position:absolute;top:50%;left:0;content:"";display:none;width:10px;height:10px;box-sizing:border-box;border-radius:50%;background:#0077cf;transform:translate(6px, -50%)}.vui-radio input{display:block;width:22px;height:22px;margin:0;padding:0;opacity:0}.vui-radio input:focus~label::before{box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.vui-radio input:disabled~label{color:#6c757d}.vui-radio input:disabled~label::before{background-color:#e9ecef}.vui-radio input:checked~label::before{border-color:#0077cf}.vui-radio input:checked~label::after{display:block}.vui-radio input:checked:disabled~label::before{border-color:#80bdff}.vui-radio input:checked:disabled~label::after{background-color:rgba(0,123,255,.5)}.vui-radio input:not(:checked):focus~label::before{border-color:#80bdff}.vui-radio input:not(:disabled,:checked,:focus)~label:hover::before{border-color:#888}',""]);const a=r},3228:(e,t,o)=>{o.d(t,{Z:()=>f});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l),a=o(8669),s=o.n(a),u=new URL(o(8332),o.b),d=new URL(o(7640),o.b),c=r()(n()),p=s()(u),v=s()(d);c.push([e.id,".vui-select{position:relative;display:flex;flex-direction:row;gap:5px;align-items:center}.vui-select label{position:relative;display:inline-block;white-space:nowrap;text-overflow:ellipsis}.vui-select-view{position:relative;min-width:50px;padding:5px 20px 5px 5px;border:1px solid #aaa;border-radius:5px;background-image:url("+p+");background-repeat:no-repeat;background-position:right 7px center;background-size:8px 10px;cursor:default;user-select:none;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}.vui-select-view:disabled{color:gray;border:1px solid #ccc;background-image:url("+v+")}.vui-select-view:not(:disabled):hover{border:1px solid #888}.vui-select-view:not(:disabled):focus{border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgba(0,123,255,.25)}.vui-select-search{cursor:text}.vui-select-hide{position:absolute;width:500px;visibility:hidden}.vui-select-list{position:absolute;top:-500px;left:-500px;z-index:10000;max-width:350px;max-height:300px;border:1px solid #aaa;border-radius:5px;background-color:#fff;box-shadow:0 2px 3px 0 rgba(0,0,0,.2);overflow-x:hidden;overflow-y:auto}.vui-select-item-label{flex:1 1 0%;min-height:1rem;overflow:hidden}.vui-select-item-remove{position:relative;width:25px;height:20px;color:#000;visibility:hidden;cursor:pointer;opacity:.6}.vui-select-item-remove:hover{opacity:1}.vui-select-item{position:relative;display:flex;flex-direction:row;align-items:center;padding:6px 5px;color:#555;border-bottom:1px solid #eee;cursor:pointer}.vui-select-item:hover{background:#e8e8e8}.vui-select-item:hover .vui-select-item-remove{visibility:visible}.vui-select-item:nth-last-child(1){border-bottom:none}.vui-select-item.selected{color:#fff;background:#666}.vui-select-item.selected .vui-select-item-remove{color:#fff}.vui-select-item.selected:hover{background:#555}",""]);const f=c},6727:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-switch{display:flex;gap:5px;align-items:center}.vui-switch-label{cursor:default}.vui-switch-button{position:relative;cursor:pointer;user-select:none;transition:background-color .1s}.vui-switch-icon{position:absolute;top:2px;height:calc(100% - 4px);border-radius:50%;background-color:#fff;user-select:none;pointer-events:none;transition:right .1s ease-in-out}.vui-switch-label-clickable{cursor:pointer}.vui-switch-label-clickable .vui-switch-label{cursor:pointer;user-select:none}.vui-switch-checked .vui-switch-icon{right:2px}.vui-switch-disabled{cursor:default}.vui-switch-disabled .vui-switch-label{cursor:default}.vui-switch-disabled .vui-switch-button{cursor:default;opacity:.6}",""]);const a=r},6270:(e,t,o)=>{o.d(t,{Z:()=>g});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l),a=o(8669),s=o.n(a),u=new URL(o(1135),o.b),d=new URL(o(8540),o.b),c=new URL(o(5032),o.b),p=new URL(o(8026),o.b),v=r()(n()),f=s()(u),h=s()(d),b=s()(c),m=s()(p);v.push([e.id,'.vui-tab{position:relative;display:flex;flex-direction:column;width:100%;height:100%}.vui-tab-header{position:relative;z-index:10;flex-shrink:0;width:100%;white-space:nowrap;overflow:visible}.vui-tab-header-left,.vui-tab-header-right{text-overflow:ellipsis;overflow:hidden}.vui-tab-header-left>*,.vui-tab-header-right>*{text-overflow:ellipsis;overflow:hidden}.vui-tab-panes{position:relative;flex:auto;overflow:hidden}.vui-tab-panes>*{display:none}.vui-tab-panes .vui-tab-pane{position:relative;display:none;width:100%;height:100%;overflow:hidden}.vui-tab-panes .vui-tab-selected{display:block}.vui-tab-tabs{position:relative;align-items:flex-end;align-self:flex-end;margin:0 10px;overflow:visible}.vui-tab-item{position:relative;padding:0 15px;color:#002b36;cursor:pointer;user-select:none}.vui-tab-item:not(:first-child)::before{position:absolute;left:0;bottom:8px;content:"";z-index:0;display:block;width:1px;height:20px;background-color:#a4a7ab}.vui-tab-item:hover+.vui-tab-item::before,.vui-tab-item.vui-tab-selected+.vui-tab-item::before{display:none}.vui-tab-item:hover{z-index:2}.vui-tab-item.vui-tab-selected{position:relative;z-index:3;background-color:#fff}.vui-tab-item>*{text-overflow:ellipsis;overflow:hidden}.vui-tab-chrome .vui-tab-item{height:36px;line-height:36px;border-top-left-radius:10px;border-top-right-radius:10px}.vui-tab-simple .vui-tab-item{height:36px;line-height:36px;border:1px solid rgba(0,0,0,0);border-bottom:none;border-top-left-radius:5px;border-top-right-radius:5px}.vui-tab-chrome .vui-tab-header{background:#dee1e6}.vui-tab-chrome .vui-tab-tabs{padding-top:8px}.vui-tab-chrome .vui-tab-item:not(.vui-tab-selected):hover{background-color:#ebecef}.vui-tab-chrome .vui-tab-item:hover::before,.vui-tab-chrome .vui-tab-item:hover::after{position:absolute;left:-10px;bottom:0;content:"";display:block;width:10px;height:10px;background-color:rgba(0,0,0,0);background-repeat:no-repeat;pointer-events:none}.vui-tab-chrome .vui-tab-item:hover::before{background-image:url('+f+")}.vui-tab-chrome .vui-tab-item:hover::after{left:100%;background-image:url("+h+')}.vui-tab-chrome .vui-tab-item.vui-tab-selected::before,.vui-tab-chrome .vui-tab-item.vui-tab-selected::after{position:absolute;left:-10px;bottom:0;content:"";display:block;width:10px;height:10px;background-color:rgba(0,0,0,0);background-repeat:no-repeat;pointer-events:none}.vui-tab-chrome .vui-tab-item.vui-tab-selected::before{background-image:url('+b+")}.vui-tab-chrome .vui-tab-item.vui-tab-selected::after{left:100%;background-image:url("+m+")}.vui-tab-simple .vui-tab-header{border-bottom:1px solid #ccc}.vui-tab-simple .vui-tab-tabs{margin-bottom:-1px}.vui-tab-simple .vui-tab-item.vui-tab-selected{border-color:#ccc}.vui-tab-simple .vui-tab-item:not(.vui-tab-selected):hover{border-color:#ccc}.vui-tab-simple .vui-tab-item:hover::before,.vui-tab-simple .vui-tab-item.vui-tab-selected::before{display:none}",""]);const g=v},9545:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(5550),n=o.n(i),l=o(5045),r=o.n(l)()(n());r.push([e.id,".vui-tooltip{--vui-tooltip-color: inherit;--vui-tooltip-max-width: 320px;position:fixed;z-index:1000;margin:0;padding:20px;box-sizing:border-box;color:var(--vui-popover-color);border:none;filter:drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2))}.vui-tooltip.vui-tooltip-nonreactive{pointer-events:none}.vui-tooltip .vui-tooltip-content{position:relative;max-width:var(--vui-tooltip-max-width);overflow:hidden}",""]);const a=r},5045:e=>{e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var o="",i=void 0!==t[5];return t[4]&&(o+="@supports (".concat(t[4],") {")),t[2]&&(o+="@media ".concat(t[2]," {")),i&&(o+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),o+=e(t),i&&(o+="}"),t[2]&&(o+="}"),t[4]&&(o+="}"),o})).join("")},t.i=function(e,o,i,n,l){"string"==typeof e&&(e=[[null,e,void 0]]);var r={};if(i)for(var a=0;a<this.length;a++){var s=this[a][0];null!=s&&(r[s]=!0)}for(var u=0;u<e.length;u++){var d=[].concat(e[u]);i&&r[d[0]]||(void 0!==l&&(void 0===d[5]||(d[1]="@layer".concat(d[5].length>0?" ".concat(d[5]):""," {").concat(d[1],"}")),d[5]=l),o&&(d[2]?(d[1]="@media ".concat(d[2]," {").concat(d[1],"}"),d[2]=o):d[2]=o),n&&(d[4]?(d[1]="@supports (".concat(d[4],") {").concat(d[1],"}"),d[4]=n):d[4]="".concat(n)),t.push(d))}},t}},8669:e=>{e.exports=function(e,t){return t||(t={}),e?(e=String(e.__esModule?e.default:e),/^['"].*['"]$/.test(e)&&(e=e.slice(1,-1)),t.hash&&(e+=t.hash),/["'() \t\n]|(%20)/.test(e)||t.needQuotes?'"'.concat(e.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):e):e}},5550:e=>{e.exports=function(e){return e[1]}},4924:e=>{var t=[];function o(e){for(var o=-1,i=0;i<t.length;i++)if(t[i].identifier===e){o=i;break}return o}function i(e,i){for(var l={},r=[],a=0;a<e.length;a++){var s=e[a],u=i.base?s[0]+i.base:s[0],d=l[u]||0,c="".concat(u," ").concat(d);l[u]=d+1;var p=o(c),v={css:s[1],media:s[2],sourceMap:s[3],supports:s[4],layer:s[5]};if(-1!==p)t[p].references++,t[p].updater(v);else{var f=n(v,i);i.byIndex=a,t.splice(a,0,{identifier:c,updater:f,references:1})}r.push(c)}return r}function n(e,t){var o=t.domAPI(t);o.update(e);return function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap&&t.supports===e.supports&&t.layer===e.layer)return;o.update(e=t)}else o.remove()}}e.exports=function(e,n){var l=i(e=e||[],n=n||{});return function(e){e=e||[];for(var r=0;r<l.length;r++){var a=o(l[r]);t[a].references--}for(var s=i(e,n),u=0;u<l.length;u++){var d=o(l[u]);0===t[d].references&&(t[d].updater(),t.splice(d,1))}l=s}}},153:e=>{var t={};e.exports=function(e,o){var i=function(e){if(void 0===t[e]){var o=document.querySelector(e);if(window.HTMLIFrameElement&&o instanceof window.HTMLIFrameElement)try{o=o.contentDocument.head}catch(e){o=null}t[e]=o}return t[e]}(e);if(!i)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");i.appendChild(o)}},8130:e=>{e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},8708:e=>{e.exports=function(e,t){Object.keys(t).forEach((function(o){e.setAttribute(o,t[o])}))}},3668:e=>{var t,o=(t=[],function(e,o){return t[e]=o,t.filter(Boolean).join("\n")});function i(e,t,i,n){var l;if(i)l="";else{l="",n.supports&&(l+="@supports (".concat(n.supports,") {")),n.media&&(l+="@media ".concat(n.media," {"));var r=void 0!==n.layer;r&&(l+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),l+=n.css,r&&(l+="}"),n.media&&(l+="}"),n.supports&&(l+="}")}if(e.styleSheet)e.styleSheet.cssText=o(t,l);else{var a=document.createTextNode(l),s=e.childNodes;s[t]&&e.removeChild(s[t]),s.length?e.insertBefore(a,s[t]):e.appendChild(a)}}var n={singleton:null,singletonCounter:0};e.exports=function(e){if("undefined"==typeof document)return{update:function(){},remove:function(){}};var t=n.singletonCounter++,o=n.singleton||(n.singleton=e.insertStyleElement(e));return{update:function(e){i(o,t,!1,e)},remove:function(e){i(o,t,!0,e)}}}},8586:(e,t)=>{t.Z=(e,t)=>{const o=e.__vccOpts||e;for(const[e,i]of t)o[e]=i;return o}},5528:(e,t,o)=>{o.r(t),o.d(t,{default:()=>w});var i=o(6609),n=o(963),l=o(5504);const r=["type","disabled"],a={__name:"button",props:{label:{type:String,default:""},primary:{type:Boolean,default:!1},type:{type:String,default:"button"},width:{type:[String,Number],default:""},disabled:{type:Boolean,default:!1}},setup(e){const t=e,{cid:o}=(0,n.ZA)("VuiButton"),a=(0,i.computed)((()=>{const e=["vui","vui-button"];return t.primary&&e.push("vui-button-primary"),e.push(o),e})),s=(0,i.computed)((()=>{const e={};return t.width&&(e.width=(0,l.IA)(t.width)),e}));return(e,o)=>((0,i.openBlock)(),(0,i.createElementBlock)("button",{type:t.type,class:(0,i.normalizeClass)((0,i.unref)(a)),style:(0,i.normalizeStyle)((0,i.unref)(s)),disabled:t.disabled},[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(t.label),1)]))],14,r))}};var s=o(4924),u=o.n(s),d=o(3668),c=o.n(d),p=o(153),v=o.n(p),f=o(8708),h=o.n(f),b=o(8130),m=o.n(b),g=o(9529),x={attributes:{context:"vine-ui"}};x.setAttributes=h(),x.insert=v().bind(null,"head"),x.domAPI=c(),x.insertStyleElement=m();u()(g.Z,x);g.Z&&g.Z.locals&&g.Z.locals;const w=a},3581:(e,t,o)=>{o.r(t),o.d(t,{default:()=>w});var i=o(6609),n=o(963);const l=["id","disabled"],r=["for"],a={__name:"checkbox",props:{label:{type:String,default:""},disabled:{type:Boolean,default:!1},checked:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue","change"],setup(e,t){let{emit:o}=t;const a=e,{cid:s}=(0,n.ZA)("VuiCheckbox"),u=["vui","vui-checkbox",s],d=(0,i.reactive)({checked:!1});return(0,i.watchEffect)((()=>{d.checked=null===a.modelValue?a.checked:a.modelValue})),(0,i.watch)((()=>d.checked),(e=>{o("update:modelValue",e),o("change",e)})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)(u)},[(0,i.withDirectives)((0,i.createElementVNode)("input",{id:(0,i.unref)(s),"onUpdate:modelValue":t[0]||(t[0]=e=>d.checked=e),disabled:a.disabled,type:"checkbox"},null,8,l),[[i.vModelCheckbox,d.checked]]),(0,i.createElementVNode)("label",{for:(0,i.unref)(s)},[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(a.label),1)]))],8,r)]))}};var s=o(4924),u=o.n(s),d=o(3668),c=o.n(d),p=o(153),v=o.n(p),f=o(8708),h=o.n(f),b=o(8130),m=o.n(b),g=o(3992),x={attributes:{context:"vine-ui"}};x.setAttributes=h(),x.insert=v().bind(null,"head"),x.domAPI=c(),x.insertStyleElement=m();u()(g.Z,x);g.Z&&g.Z.locals&&g.Z.locals;const w=a},874:(e,t,o)=>{o.r(t),o.d(t,{default:()=>w});var i=o(6609),n=o(963),l=o(5504);const r={key:0,class:"vui-dialog-message"},a={__name:"dialog",props:{message:{type:String,default:""},width:{type:String,default:""},height:{type:String,default:""},closeOnClickOut:{type:Boolean,default:!0},visible:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue"],setup(e,t){let{emit:o}=t;const a=e,{cid:s}=(0,n.ZA)("VuiDialog"),u=["vui","vui-dialog",s],d=(0,i.reactive)({visible:!1});(0,i.watchEffect)((()=>{d.visible=null===a.modelValue?a.visible:a.modelValue})),(0,i.watch)((()=>d.visible),(e=>{h(),o("update:modelValue",e)}));const c=(0,i.ref)(null);let p;const v=(0,i.computed)((()=>{const e={};return a.width&&(e.width=a.width),a.height&&(e.height=a.height),e})),f={click:{handler:e=>{const t=p.querySelector(".vui-dialog-window");t===e.target||t.contains(e.target)||((0,l.r)(f),d.visible&&(d.visible=!1))}}},h=()=>{d.visible?a.closeOnClickOut&&setTimeout((()=>{(0,l.sQ)(f,document)}),100):(0,l.r)(f)};return(0,i.onMounted)((()=>{p=c.value,h()})),(e,t)=>(0,i.withDirectives)(((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:c,class:(0,i.normalizeClass)(u)},[(0,i.createElementVNode)("div",{class:"vui-dialog-window",style:(0,i.normalizeStyle)((0,i.unref)(v))},[a.message?((0,i.openBlock)(),(0,i.createElementBlock)("div",r,(0,i.toDisplayString)(a.message),1)):(0,i.createCommentVNode)("v-if",!0),(0,i.renderSlot)(e.$slots,"default")],4)],512)),[[i.vShow,d.visible]])}};var s=o(4924),u=o.n(s),d=o(3668),c=o.n(d),p=o(153),v=o.n(p),f=o(8708),h=o.n(f),b=o(8130),m=o.n(b),g=o(4593),x={attributes:{context:"vine-ui"}};x.setAttributes=h(),x.insert=v().bind(null,"head"),x.domAPI=c(),x.insertStyleElement=m();u()(g.Z,x);g.Z&&g.Z.locals&&g.Z.locals;const w=a},9315:(e,t,o)=>{o.r(t),o.d(t,{default:()=>x});var i=o(6609),n=o(963),l=o(5504);const r={__name:"flex",props:{direction:{type:String,default:"row",validator:e=>["row","column"].includes(e)},gap:{type:[String,Number],default:""},wrap:{type:Boolean,default:!1},shrink:{type:Boolean,default:!1},align:{type:String,default:""},center:{type:Boolean,default:!1},alignItems:{type:String,default:""},width:{type:[String,Number],default:""},height:{type:[String,Number],default:""},margin:{type:[String,Number],default:""},padding:{type:[String,Number],default:""}},setup(e){const t=e,{cid:o}=(0,n.ZA)("VuiFlex"),r=(0,i.computed)((()=>{const e=["vui","vui-flex",`vui-flex-${t.direction}`];return t.wrap&&e.push("vui-flex-wrap"),t.shrink&&e.push("vui-flex-shrink"),e.push(o),e})),a=(e,t,o)=>{o&&(e[t]=(0,l.IA)(o))},s=(0,i.computed)((()=>{const e={};return a(e,"width",t.width),a(e,"height",t.height),a(e,"--vui-flex-gap",t.gap),a(e,"--vui-flex-margin",t.margin),a(e,"--vui-flex-padding",t.padding),t.align?e["--vui-flex-align"]=t.align:t.center&&(e["--vui-flex-align"]="center"),t.alignItems&&(e["--vui-flex-align-items"]=t.alignItems),e}));return(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)((0,i.unref)(r)),style:(0,i.normalizeStyle)((0,i.unref)(s))},[(0,i.renderSlot)(e.$slots,"default")],6))}};var a=o(4924),s=o.n(a),u=o(3668),d=o.n(u),c=o(153),p=o.n(c),v=o(8708),f=o.n(v),h=o(8130),b=o.n(h),m=o(5739),g={attributes:{context:"vine-ui"}};g.setAttributes=f(),g.insert=p().bind(null,"head"),g.domAPI=d(),g.insertStyleElement=b();s()(m.Z,g);m.Z&&m.Z.locals&&m.Z.locals;const x=r},404:(e,t,o)=>{o.r(t),o.d(t,{default:()=>y});var i=o(6609),n=o(9884),l=o(963),r=o(5504);const a={key:0,class:"vui-flyover-resizer"},s={__name:"flyover",props:{position:{type:String,default:"right",validator:e=>["right","left"].includes(e)},width:{type:[String,Number],default:"50%"},minWidth:{type:[String,Number],default:"10%"},maxWidth:{type:[String,Number],default:"100%"},resizable:{type:Boolean,default:!0},visible:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue","start","end","resize"],setup(e,t){let{emit:o}=t;const s=e,{cid:u}=(0,l.ZA)("VuiFlyover"),d=(0,i.reactive)({visible:s.visible,position:s.position,width:s.width,resizable:s.resizable,hasStarted:!1,resizeInfo:null});(0,i.watchEffect)((()=>{d.visible=null===s.modelValue?s.visible:s.modelValue})),(0,i.watch)((()=>d.visible),((e,t)=>{h(t,e),o("update:modelValue",e)})),(0,i.watchEffect)((()=>{d.position=s.position})),(0,i.watchEffect)((()=>{d.width=s.width})),(0,i.watchEffect)((()=>{d.resizable=s.resizable})),(0,i.watch)((()=>d.resizable),(()=>{C()}));const c=(0,i.ref)(null);let p;const v=(0,i.computed)((()=>{const e=["vui","vui-flyover",u,`vui-flyover-${s.position}`];return p&&p.classList.contains("vui-flyover-show")&&e.push("vui-flyover-show"),e})),f=(0,i.computed)((()=>({width:(0,r.IA)(d.width)}))),h=(e,t)=>{if(t===e)return;d.hasStarted&&b(e),x();const i=p.classList;t?(i.add(`vui-slide-in-${s.position}`,"vui-flyover-show"),d.width=s.width):i.add(`vui-slide-out-${s.position}`),d.hasStarted=!0,g(),o("start",t)},b=e=>{d.hasStarted=!1,x();const t=p.classList;e?t.remove(`vui-slide-in-${s.position}`):(t.remove(`vui-slide-out-${s.position}`,"vui-flyover-show"),d.width="0"),o("end",e)},m={animationend:{handler:e=>{b(d.visible)}}},g=()=>{(0,r.sQ)(m,p)},x=()=>{(0,r.r)(m)},w=(e,t,o)=>{let i=(0,r.IA)(e);"string"==typeof i&&i||(i=o);let n=parseFloat(i),l="px";return i.endsWith("%")&&(l="%",n=n/100*t),{width:n,unit:l}},y=e=>{const{startWidth:t,startMinWidth:i,startMaxWidth:n,startX:l}=d.resizeInfo,a="right"===d.position?-1:1,s=(e.pageX-l)*a,u=window.innerWidth,c=(0,r.uZ)(t.width+s,i.width,n.width);if("%"===t.unit){const e=(c/u*100).toFixed(2);d.width=`${e}%`}else d.width=`${Math.round(c)}px`;o("resize",d.width)},k=function(e){(0,r.PF)(e),(0,r.r)(S)},S={mousemove:{handler:e=>{var t;t=e,(0,r.PF)(t),t.buttons?y(t):k(t)},options:!0},mouseup:{handler:e=>{k(e)},options:{once:!0}}},z={mousedown:{handler:e=>{(e=>{(0,r.PF)(e);const t=window.innerWidth,o=w(d.width,t,"50%"),i=w(s.minWidth,t,"10%");i.width=(0,r.uZ)(i.width,0,o.width);const n=w(s.maxWidth,t,"100%");n.width=(0,r.uZ)(n.width,o.width,t),d.resizeInfo={maxWidth:t,startX:e.pageX,startWidth:o,startMinWidth:i,startMaxWidth:n},(0,r.sQ)(S,window)})(e)}}},C=()=>{(0,r.r)(z),d.resizable&&Z()},Z=(0,n.gJ)((()=>{const e=p.querySelector(".vui-flyover-resizer");(0,r.sQ)(z,e)}));return(0,i.onMounted)((()=>{p=c.value,d.visible&&h(!1,!0),C()})),(0,i.onUnmounted)((()=>{x(),(0,r.r)(z)})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:c,class:(0,i.normalizeClass)((0,i.unref)(v)),style:(0,i.normalizeStyle)((0,i.unref)(f))},[d.resizable?((0,i.openBlock)(),(0,i.createElementBlock)("div",a)):(0,i.createCommentVNode)("v-if",!0),(0,i.renderSlot)(e.$slots,"default")],6))}};var u=o(4924),d=o.n(u),c=o(3668),p=o.n(c),v=o(153),f=o.n(v),h=o(8708),b=o.n(h),m=o(8130),g=o.n(m),x=o(14),w={attributes:{context:"vine-ui"}};w.setAttributes=b(),w.insert=f().bind(null,"head"),w.domAPI=p(),w.insertStyleElement=g();d()(x.Z,w);x.Z&&x.Z.locals&&x.Z.locals;const y=s},445:(e,t,o)=>{o.r(t),o.d(t,{default:()=>y});var i=o(6609),n=o(963),l=o(5504);const r={key:0},a=["placeholder","disabled","type"],s={__name:"input",props:{label:{type:String,default:""},type:{type:String,default:"text"},width:{type:[String,Number],default:"80px"},placeholder:{type:String,default:""},disabled:{type:Boolean,default:!1},value:{type:[String,Number],default:""},modelValue:{type:[String,Number],default:null}},emits:["update:modelValue","change"],setup(e,t){let{emit:o}=t;const s=e,{cid:u}=(0,n.ZA)("VuiInput"),d=["vui","vui-input",u],c=(0,i.reactive)({value:""});(0,i.watchEffect)((()=>{c.value=null===s.modelValue?s.value:s.modelValue})),(0,i.watch)((()=>c.value),(e=>{o("update:modelValue",e),o("change",e)}));const p=(0,i.computed)((()=>({width:(0,l.IA)(s.width)}))),v=(0,i.computed)((()=>s.label||(0,n.z9)()));return(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)(d)},[(0,i.unref)(v)?((0,i.openBlock)(),(0,i.createElementBlock)("label",r,[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(s.label),1)]))])):(0,i.createCommentVNode)("v-if",!0),(0,i.withDirectives)((0,i.createElementVNode)("input",(0,i.mergeProps)({"onUpdate:modelValue":t[0]||(t[0]=e=>c.value=e),placeholder:s.placeholder,disabled:s.disabled,type:s.type,style:(0,i.unref)(p)},(0,i.unref)(n.Ye)(["class"])),null,16,a),[[i.vModelDynamic,c.value],[(0,i.unref)(n.gx)]])]))}};var u=o(4924),d=o.n(u),c=o(3668),p=o.n(c),v=o(153),f=o.n(v),h=o(8708),b=o.n(h),m=o(8130),g=o.n(m),x=o(997),w={attributes:{context:"vine-ui"}};w.setAttributes=b(),w.insert=f().bind(null,"head"),w.domAPI=p(),w.insertStyleElement=g();d()(x.Z,w);x.Z&&x.Z.locals&&x.Z.locals;const y=s},5392:(e,t,o)=>{o.r(t),o.d(t,{default:()=>x});var i=o(6609),n=o(963),l=o(5504);const r={__name:"layout",props:{width:{type:String,default:""},height:{type:String,default:""},direction:{type:String,default:"row",validator:e=>["row","column"].includes(e)},gutterHoverSize:{type:String,default:"2px"},gutterSize:{type:String,default:"4px"},layout:{type:String,default:""},modelValue:{type:String,default:""}},emits:["update:modelValue"],setup(e,t){let{emit:o}=t;const r=e,{cid:a}=(0,n.ZA)("VuiLayout"),s=(0,i.shallowReactive)({layout:"",layoutList:[],layoutReset:!1,children:null,indexMap:new WeakMap,autoNum:0,sizeKey:"row"===r.direction?"offsetWidth":"offsetHeight",clientKey:"row"===r.direction?"clientWidth":"clientHeight",offsetKey:"row"===r.direction?"offsetX":"offsetY",moveGutter:null,moveInfo:null,totalSize:0,prevInfo:null,nextInfo:null});(0,i.watchEffect)((()=>{s.layout=null===r.modelValue?r.layout:r.modelValue})),(0,i.watch)((()=>s.layout),(e=>{B(),o("update:modelValue",e)})),(0,i.watch)((()=>s.layoutList),(e=>{M()}));const u=(0,i.ref)(null);let d;const c=(0,i.computed)((()=>{const e=["vui","vui-layout",`vui-layout-${r.direction}`];return e.push(a),e})),p=(0,i.computed)((()=>{const e={};return r.width&&(e.width=r.width),r.height&&(e.height=r.height),r.gutterHoverSize&&(e["--vui-gutter-hover-size"]=r.gutterHoverSize),r.gutterSize&&(e["--vui-gutter-size"]=r.gutterSize),e})),v={mousedown:{handler:e=>{y(e)}}},f={mousemove:{handler:e=>{C(e)},options:!0},mouseup:{handler:e=>{V(e)},options:{once:!0}}},h=e=>!e||("auto"===e||"*"===e),b=function(){let e=0;return Array.from(arguments).forEach((t=>{t&&(e+=t[s.sizeKey])})),e},m=function(e){return b(e)-e[s.clientKey]},g=(e,t)=>{const o=e[t];if(!o)return 0;const i=o[t];if(!i)return 0;const n=s.indexMap.get(i),l=s.layoutList[n];return h(l)?b(i)-m(i)+g(i,t):0},x=e=>{if(!s.totalSize)return"0%";return`${(e/s.totalSize*100).toFixed(2)}%`},w=()=>{s.totalSize=b(d)},y=e=>{const t=e.target;if(!t.classList.contains("vui-layout-gutter"))return;e.stopImmediatePropagation(),s.moveGutter=null,s.prevInfo=null,s.nextInfo=null;const o=t,i=o.previousElementSibling,n=o.nextElementSibling;i&&n&&(s.moveGutter=o,o.classList.add("vui-layout-active"),d.classList.add("vui-layout-moving"),k(e,i,n))},k=(e,t,o)=>{s.moveInfo={startX:e.pageX,startY:e.pageY,offsetX:0,offsetY:0},(0,l.sQ)(f,window),w();const i={node:t},n={node:o};i.min=m(t),n.min=m(o);const r=b(t,o),a=g(o,"nextElementSibling"),u=g(t,"previousElementSibling");i.max=r+a-n.min,n.max=r+u-i.min,i.size=b(t),n.size=b(o),z(t,o,i,n)},S=(e,t)=>{if(s.autoNum<2)return;const o=(e=>{const t=b(e);return x(t)})(e);s.layoutList[t]=o,e.style.flexBasis=o,e.classList.remove("vui-layout-auto")},z=(e,t,o,i)=>{const n=s.indexMap.get(e),l=s.indexMap.get(t),r=s.layoutList[n],a=s.layoutList[l],u=h(r),d=h(a);u&&S(e,n),d&&S(t,l),(u||r.endsWith("%"))&&(o.percent=!0),(d||a.endsWith("%"))&&(i.percent=!0),s.prevInfo=o,s.nextInfo=i},C=function(e){(0,l.PF)(e);e.buttons?(s.moveInfo.offsetX=e.pageX-s.moveInfo.startX,s.moveInfo.offsetY=e.pageY-s.moveInfo.startY,Z(e)):V(e)},Z=e=>{const t=s.moveInfo[s.offsetKey];E(s.prevInfo,t),E(s.nextInfo,-t)},E=(e,t)=>{if(!e)return;const o=(0,l.uZ)(e.size+t,e.min,e.max);let i=`${o}px`;e.percent&&(i=x(o)),e.node.style.flexBasis=i},V=function(e){(0,l.PF)(e),(0,l.r)(f),s.moveGutter&&(s.moveGutter.classList.remove("vui-layout-active"),s.moveGutter=null),d.classList.remove("vui-layout-moving"),s.prevInfo=null,s.nextInfo=null,A()},A=()=>{const e=s.layoutList,t=[];s.children.forEach(((o,i)=>{const n=e[i];if(h(n))t.push("auto");else{const e=o.style.flexBasis;t.push(e||n)}})),s.layoutList=t},B=()=>{const e=(()=>{const e=[],t=s.children;return t?(t.forEach((t=>{const o=t.getAttribute("size");h(o)?e.push("auto"):e.push(o)})),e):e})();s.layout&&`${s.layout}`.split(",").forEach(((t,o)=>{t=`${t}`.trim(),h(t)&&(t="auto"),e[o]=t}));let t=0;e.forEach((e=>{h(e)&&(t+=1)})),s.autoNum=t,s.layoutList=e},M=()=>{s.layout=s.layoutList.join(","),w(),(()=>{const e=s.children;e&&(s.layoutReset?e.forEach(((e,t)=>{e.classList.remove("vui-layout-auto")})):s.layoutReset=!0,e.forEach(((e,t)=>{const o=s.layoutList[t];h(o)?(e.classList.add("vui-layout-auto"),e.style.removeProperty("flexBasis")):e.style.flexBasis=o})))})()};return(0,i.onMounted)((()=>{d=u.value,(()=>{const e=Array.from(d.children).filter((e=>!e.classList.contains("vui-layout-gutter")||(e.remove(),!1))),t=e.length;t<2||(s.children=e,e.forEach(((e,o)=>{if(e.classList.add("vui-layout-item"),s.indexMap.set(e,o),o<t-1){const t=document.createElement("div");t.className="vui-layout-gutter",e.insertAdjacentElement("afterend",t)}})),(0,l.sQ)(v,d))})(),B()})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:u,class:(0,i.normalizeClass)((0,i.unref)(c)),style:(0,i.normalizeStyle)((0,i.unref)(p))},[(0,i.renderSlot)(e.$slots,"default")],6))}};var a=o(4924),s=o.n(a),u=o(3668),d=o.n(u),c=o(153),p=o.n(c),v=o(8708),f=o.n(v),h=o(8130),b=o.n(h),m=o(4841),g={attributes:{context:"vine-ui"}};g.setAttributes=f(),g.insert=p().bind(null,"head"),g.domAPI=d(),g.insertStyleElement=b();s()(m.Z,g);m.Z&&m.Z.locals&&m.Z.locals;const x=r},6888:(e,t,o)=>{o.r(t),o.d(t,{default:()=>y});var i=o(6609),n=o(963);const l={class:"vui-loading-icon"},r={xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16"},a=["stroke"],s={__name:"loading",props:{center:{type:Boolean,default:!1},fast:{type:Boolean,default:!1},color:{type:String,default:"#999"},size:{type:String,default:"m",validator:e=>["","s","m","l"].includes(e)},theme:{type:String,default:""},visible:{type:Boolean,default:!0}},setup(e){const t=e,{cid:o}=(0,n.ZA)("VuiLoading"),s=(0,i.computed)((()=>{const e=["vui-loading"];return t.center&&e.push("vui-loading-center"),t.fast&&e.push("vui-loading-fast"),e.push(`vui-loading-${t.size||"m"}`),t.visible&&e.push("vui-loading-show"),e.push(o),e}));return(e,o)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)((0,i.unref)(s))},[(0,i.createElementVNode)("div",l,[((0,i.openBlock)(),(0,i.createElementBlock)("svg",r,[(0,i.createElementVNode)("path",{d:"M1,8 A7 7 0 1 1 8 15",stroke:t.color||"#999","stroke-width":"2","stroke-linecap":"round",fill:"none"},null,8,a)]))])],2))}};var u=o(4924),d=o.n(u),c=o(3668),p=o.n(c),v=o(153),f=o.n(v),h=o(8708),b=o.n(h),m=o(8130),g=o.n(m),x=o(9788),w={attributes:{context:"vine-ui"}};w.setAttributes=b(),w.insert=f().bind(null,"head"),w.domAPI=p(),w.insertStyleElement=g();d()(x.Z,w);x.Z&&x.Z.locals&&x.Z.locals;const y=s},1152:(e,t,o)=>{o.r(t),o.d(t,{default:()=>S});var i=o(6609),n=o(963),l=o(7051),r=o(5504);const a={class:"vui-modal-main vui-flex-column"},s={key:0,class:"vui-modal-header"},u={class:"vui-modal-content vui-flex-auto"},d={__name:"modal",props:{title:{type:String,default:""},inset:{type:String,default:"20%"},closeButton:{type:Boolean,default:!0},closeOnClickOut:{type:Boolean,default:!0},visible:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue","close"],setup(e,t){let{emit:o}=t;const d=e,{cid:c}=(0,n.ZA)("VuiModal"),p=["vui","vui-modal",c],v=(0,i.reactive)({visible:!1});(0,i.watchEffect)((()=>{v.visible=null===d.modelValue?d.visible:d.modelValue})),(0,i.watch)((()=>v.visible),(e=>{w(),o("update:modelValue",e)}));const f=(0,i.ref)(null);let h;const b=(0,i.computed)((()=>({inset:d.inset}))),m=()=>{v.visible&&(v.visible=!1)},g=()=>{m()},x={click:{handler:e=>{const t=h.querySelector(".vui-modal-main");t===e.target||t.contains(e.target)||((0,r.r)(x),m())}}},w=()=>{v.visible?d.closeOnClickOut&&setTimeout((()=>{(0,r.sQ)(x,document)}),100):(0,r.r)(x)};return(0,i.onMounted)((()=>{h=f.value,w()})),(e,t)=>(0,i.withDirectives)(((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:f,class:(0,i.normalizeClass)(p)},[(0,i.createElementVNode)("div",{class:"vui-modal-window",style:(0,i.normalizeStyle)((0,i.unref)(b))},[d.closeButton?((0,i.openBlock)(),(0,i.createElementBlock)("div",{key:0,class:"vui-modal-close",onClick:g},[(0,i.createVNode)(l.Z)])):(0,i.createCommentVNode)("v-if",!0),(0,i.createElementVNode)("div",a,[d.title?((0,i.openBlock)(),(0,i.createElementBlock)("div",s,(0,i.toDisplayString)(d.title),1)):(0,i.createCommentVNode)("v-if",!0),(0,i.createElementVNode)("div",u,[(0,i.renderSlot)(e.$slots,"default")])])],4)],512)),[[i.vShow,v.visible]])}};var c=o(4924),p=o.n(c),v=o(3668),f=o.n(v),h=o(153),b=o.n(h),m=o(8708),g=o.n(m),x=o(8130),w=o.n(x),y=o(8985),k={attributes:{context:"vine-ui"}};k.setAttributes=g(),k.insert=b().bind(null,"head"),k.domAPI=f(),k.insertStyleElement=w();p()(y.Z,k);y.Z&&y.Z.locals&&y.Z.locals;const S=d},6154:(e,t,o)=>{o.r(t),o.d(t,{default:()=>C});var i=o(6609),n=o(5047),l=o(9884),r=o(963),a=o(5504);const s={class:"vui-popover-body"},u={key:0,class:"vui-popover-header"},d=["textContent"],c={class:"vui-popover-content"},p={__name:"popover",props:{title:{type:String,default:""},target:{validator:e=>!0,default:""},autoClose:{type:Boolean,default:!0},bindResize:{type:[String,Boolean],default:"close"},bindScroll:{type:[String,Boolean],default:"close"},width:{type:[String,Number],default:200},minHeight:{type:[String,Number],default:20},maxHeight:{type:[String,Number],default:800},positions:{type:[String,Array],default:null},borderColor:{type:String,default:""},bgColor:{type:String,default:""},color:{type:String,default:""},container:{validator:e=>!0,default:""},nonreactive:{type:Boolean,default:!1},visible:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue","update","beforeClose","close"],setup(e,t){let{expose:o,emit:p}=t;const v=e,{cid:f}=(0,r.ZA)("VuiPopover"),h=(0,i.reactive)({visible:!1,left:0,top:0,background:""});(0,i.watchEffect)((()=>{h.visible=null===v.modelValue?v.visible:v.modelValue})),(0,i.watch)((()=>h.visible),(e=>{S(),p("update:modelValue",e)})),(0,i.watch)([()=>v.target,()=>v.bgColor,()=>v.borderColor],(()=>{k()}));const b=(0,i.ref)(null);let m;const g=(0,i.computed)((()=>{const e=["vui","vui-popover",f];return v.nonreactive&&e.push("vui-popover-nonreactive"),e})),x=(0,i.computed)((()=>{const e={top:`${h.top}px`,left:`${h.left}px`,background:h.background};return v.color&&(e["--vui-popover-color"]=v.color),v.width&&(e["--vui-popover-width"]=(0,a.IA)(v.width)),v.minHeight&&(e["--vui-popover-min-height"]=(0,a.IA)(v.minHeight)),v.maxHeight&&(e["--vui-popover-max-height"]=(0,a.IA)(v.maxHeight)),e})),w=()=>{p("beforeClose"),setTimeout((()=>{h.visible&&(h.visible=!1,p("close"))}))};let y;const k=(0,l.gJ)((()=>{if(!h.visible)return;const e=(0,n.Dz)(v.container||window),t=(0,n.Dz)(v.target),o=(0,n.Dz)(`.${f}`),i=v.positions;y=(0,n.We)(e,t,o,i,y),y.changed&&(h.left=y.left,h.top=y.top);const l=(0,n.CJ)(y,{bgColor:v.bgColor,borderColor:v.borderColor});l.changed&&(h.background=l.background),p("update")})),S=()=>{h.visible?m&&(z(),k()):C()},z=()=>{Z(),A(),I()},C=()=>{E(),B(),N()},Z=()=>{v.bindResize&&(E(),window.addEventListener("resize",V))},E=()=>{window.removeEventListener("resize",V)},V=()=>{"close"!==v.bindResize?k():w()},A=()=>{v.bindScroll&&(B(),window.addEventListener("scroll",M,!0))},B=()=>{window.removeEventListener("scroll",M,!0)},M=e=>{D(e.target)||P(e.target)&&("close"!==v.bindScroll?k():w())},I=()=>{N(),v.autoClose&&h.visible&&setTimeout((()=>{window.addEventListener("click",$,!0),window.addEventListener("keydown",L)}),10)},N=()=>{window.removeEventListener("click",$,!0),window.removeEventListener("keydown",L)},$=e=>{D(e.target)||w()},L=e=>{"Escape"===e.code&&w()},D=e=>!(m!==e&&!m.contains(e)),P=e=>{const t=(0,n.sb)(v.target)||m;if(!t)return!1;let o=t.parentNode;for(;o;){if(o===e)return!0;o=o.parentNode}return!1};let T;return(0,i.onMounted)((()=>{m=b.value,T=new ResizeObserver((e=>{k()})),T.observe(m),S()})),(0,i.onUnmounted)((()=>{T&&(T.disconnect(),T=null),C(),m=null,y=null})),o({update:k,cid:f}),(e,t)=>(0,i.withDirectives)(((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:b,class:(0,i.normalizeClass)((0,i.unref)(g)),style:(0,i.normalizeStyle)((0,i.unref)(x))},[(0,i.createElementVNode)("div",s,[v.title?((0,i.openBlock)(),(0,i.createElementBlock)("div",u,[(0,i.renderSlot)(e.$slots,"header",{},(()=>[(0,i.createElementVNode)("div",{class:"vui-popover-title",textContent:(0,i.toDisplayString)(v.title)},null,8,d)]))])):(0,i.createCommentVNode)("v-if",!0),(0,i.createElementVNode)("div",c,[(0,i.renderSlot)(e.$slots,"default")])])],6)),[[i.vShow,h.visible]])}};var v=o(4924),f=o.n(v),h=o(3668),b=o.n(h),m=o(153),g=o.n(m),x=o(8708),w=o.n(x),y=o(8130),k=o.n(y),S=o(9641),z={attributes:{context:"vine-ui"}};z.setAttributes=w(),z.insert=g().bind(null,"head"),z.domAPI=b(),z.insertStyleElement=k();f()(S.Z,z);S.Z&&S.Z.locals&&S.Z.locals;const C=p},9208:(e,t,o)=>{o.r(t),o.d(t,{default:()=>g});var i=o(6609),n=o(963);const l={__name:"progress",props:{percentage:{type:[Number,String],default:0},width:{type:String,default:"100px"},height:{type:String,default:"15px"},radius:{type:String,default:"3px"},color:{type:String,default:"#ccc"},borderColor:{type:String,default:"#aaa"}},setup(e){const t=e,{cid:o}=(0,n.ZA)("VuiProgress"),l=(0,i.computed)((()=>{const e=["vui","vui-progress"];return e.push(o),e})),r=(0,i.computed)((()=>{let e=t.percentage;"string"==typeof e&&(e=parseFloat(e));return{width:t.width,height:t.height,"border-radius":t.radius,"border-color":t.borderColor,background:`linear-gradient(${t.color} 0 0) 0/${e}% no-repeat`}}));return(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)((0,i.unref)(l)),style:(0,i.normalizeStyle)((0,i.unref)(r))},null,6))}};var r=o(4924),a=o.n(r),s=o(3668),u=o.n(s),d=o(153),c=o.n(d),p=o(8708),v=o.n(p),f=o(8130),h=o.n(f),b=o(224),m={attributes:{context:"vine-ui"}};m.setAttributes=v(),m.insert=c().bind(null,"head"),m.domAPI=u(),m.insertStyleElement=h();a()(b.Z,m);b.Z&&b.Z.locals&&b.Z.locals;const g=l},8947:(e,t,o)=>{o.r(t),o.d(t,{default:()=>w});var i=o(6609),n=o(963);const l=["id","disabled","name","value"],r=["for"],a={__name:"radio",props:{label:{type:String,default:""},name:{type:String,default:""},disabled:{type:Boolean,default:!1},checked:{type:Boolean,default:!1},value:{type:String,default:""},modelValue:{type:String,default:null}},emits:["update:modelValue","change"],setup(e,t){let{emit:o}=t;const a=e,{cid:s}=(0,n.ZA)("VuiRadio"),u=["vui","vui-radio",s],d=(0,i.reactive)({checked:!1});return(0,i.watchEffect)((()=>{d.checked=null===a.modelValue?a.checked:a.modelValue})),(0,i.watch)((()=>d.checked),(e=>{o("update:modelValue",e),o("change",e)})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)(u)},[(0,i.withDirectives)((0,i.createElementVNode)("input",{id:(0,i.unref)(s),"onUpdate:modelValue":t[0]||(t[0]=e=>d.checked=e),disabled:a.disabled,name:a.name,value:a.value,type:"radio"},null,8,l),[[i.vModelRadio,d.checked]]),(0,i.createElementVNode)("label",{for:(0,i.unref)(s)},[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(a.label),1)]))],8,r)]))}};var s=o(4924),u=o.n(s),d=o(3668),c=o.n(d),p=o(153),v=o.n(p),f=o(8708),h=o.n(f),b=o(8130),m=o.n(b),g=o(6269),x={attributes:{context:"vine-ui"}};x.setAttributes=h(),x.insert=v().bind(null,"head"),x.domAPI=c(),x.insertStyleElement=m();u()(g.Z,x);g.Z&&g.Z.locals&&g.Z.locals;const w=a},5751:(e,t,o)=>{o.r(t),o.d(t,{default:()=>V});var i=o(6609),n=o(9884),l=o(963),r=o(5504),a=o(7051);const s={key:0},u=["size","disabled","readonly","onClick","onInput"],d={class:"vui-select-hide"},c={class:"vui vui-select-list"},p=["onMousedown"],v={class:"vui-select-item-label"},f=["onMousedown"],h={__name:"select",props:{label:{type:String,default:""},disabled:{type:Boolean,default:!1},options:{type:Array,default:null},width:{type:String,default:""},searchable:{type:Boolean,default:!1},value:{type:[String,Number],default:""},modelValue:{type:[String,Number],default:null}},emits:["update:modelValue","change","search","remove"],setup(e,t){let{emit:o}=t;const h=e,{cid:b}=(0,l.ZA)("VuiSelect"),m=["vui","vui-select",b],g=(0,i.shallowReactive)({value:"",viewLabel:"",list:[],isOpen:!1,shouldOpen:!1,lastDirection:"down",width:h.width,selectedIndex:-1,selectedLabel:"",selectedValue:null,searchValue:null});(0,i.watchEffect)((()=>{g.value=(0,r.oX)(null===h.modelValue?h.value:h.modelValue)})),(0,i.watch)((()=>g.value),(e=>{G(),o("update:modelValue",e),o("change",e)})),(0,i.watchEffect)((()=>{g.viewLabel=h.searchable&&null!==g.searchValue?g.searchValue:g.selectedLabel})),(0,i.watch)((()=>h.options),(()=>{Y()}));const x=(0,i.ref)(null);let w,y,k,S;const z=(0,i.computed)((()=>{const e=["vui-select-view"];return h.searchable&&e.push("vui-select-search"),e})),C=(0,i.computed)((()=>{const e={};return g.width&&"auto"!==g.width&&(e.width=(0,r.IA)(g.width)),e})),Z=(0,i.computed)((()=>"auto"===g.width&&"string"==typeof g.viewLabel?g.viewLabel.length+1:"")),E={resize:{target:window,handler:e=>{P()}},scroll:{target:window,handler:e=>{(e=>{if(S===e)return!0;let t=!1;try{t=S.contains(e)}catch(e){}return t})(e.target)||(e=>{let t=y.parentNode;for(;t;){if(t===e)return!0;t=t.parentNode}return!1})(e.target)&&P()},options:!0}},V=()=>{(0,r.r)(E)},A=e=>{M(e,1)},B=e=>{M(e,-1)},M=(e,t)=>{if(!g.isOpen)return void _();const o=g.list.length,i=g.selectedIndex+t;if(i>=o||i<0)return;const n=g.list[i];g.selectedIndex=i,g.selectedValue=n.value,I(t)},I=(0,n.gJ)((e=>{const t=S.querySelector(".vui-select-item.selected");if(!t)return;const o=t.offsetTop,i=t.clientHeight,n=S.scrollTop,l=S.clientHeight;if(o<n||o+i>n+l){const o=e>0?"end":"start";t.scrollIntoView({block:o})}})),N=e=>{if(!g.isOpen)return void _();const t=g.list[g.selectedIndex];t&&(g.searchValue=null,g.selectedLabel=t.label,g.value=t.value),P()},$=e=>{P()},L={keydown:{handler:e=>{const t={ArrowDown:A,ArrowUp:B,Enter:N,Escape:$}[e.key];t&&(e.preventDefault(),t(e))}}},D=()=>{(0,r.r)(L)},P=()=>{g.shouldOpen=!1,g.isOpen&&(g.lastDirection="down",g.isOpen=!1,S.remove(),V())},T=(0,n.gJ)(P),H=e=>{const t=e.getBoundingClientRect();return{left:t.left+window.pageXOffset,top:t.top+window.pageYOffset,width:e.offsetWidth,height:e.offsetHeight}},R=()=>{const e=H(y),t=H(S),o=H(document.body),i=((e,t,o)=>{const i={down:e.top+e.height+2,up:e.top-t.height-2},n={down:i.down+t.height<=o.height,up:i.up>0};return n[g.lastDirection]?i[g.lastDirection]:n.down?(g.lastDirection="down",i.down):(g.lastDirection="up",i.up)})(e,t,o);let n=Math.max(e.left,0);n+t.width>o.width&&(n=o.width-t.width);const l=S.style;l.left=`${n}px`,l.top=`${i}px`,l.minWidth=`${e.width}px`;const r=S.querySelector(".vui-select-item.selected");r&&(r.parentNode.scrollTop=r.offsetTop)},_=()=>{h.disabled||(g.shouldOpen=!0,g.isOpen||(0,r.nq)(g.list)&&(document.body.appendChild(S),g.isOpen=!0,R(),V(),(0,r.sQ)(E,window)))},O=(0,n.gJ)(_),j=e=>{_()},W=e=>{g.searchValue=g.viewLabel,g.isOpen||_(),o("search",e)},U=e=>{O(),D(),(0,r.sQ)(L,w)},Q=e=>{g.searchValue=null,T(),D()},X=e=>{const t=["vui-select-item"];return e.value===g.selectedValue&&t.push("selected"),t},q=(0,n.gJ)((()=>{if(g.width)return;document.body.appendChild(k);const e=S.getBoundingClientRect();w.appendChild(k);const t=Math.ceil(e.width),o=(0,r.uZ)(t+15,50,350);g.width=`${o}px`})),F=(0,n.gJ)((()=>{h.disabled||w&&(!g.shouldOpen||g.isOpen?g.isOpen&&R():O())})),G=()=>{const e=g.list.find((e=>e.value===g.value));e?(g.selectedIndex=e.index,g.selectedLabel=e.label,g.selectedValue=e.value):(g.selectedIndex=-1,g.selectedLabel="",g.selectedValue=null)},Y=()=>{const e=h.options?h.options.map((e=>{if(e&&"object"==typeof e){const t={...e};return!(0,r.RI)(t,"value")&&(0,r.RI)(t,"label")&&(t.value=t.label),!(0,r.RI)(t,"label")&&(0,r.RI)(t,"value")&&(t.label=t.value),t}return{label:`${e}`,value:`${e}`}})):(e=>{if(!(0,r.nq)(e))return[];const t=e=>"string"==typeof e?e.trim():(0,r.nq)(e)?e.map((e=>t(e.children))).join(""):e||"";return e.map((e=>{const o=e.props||{};return(0,r.RI)(o,"label")||(o.label=t(e.children)),(0,r.RI)(o,"value")||(o.value=o.label),(0,r.RI)(o,"selected")&&(o.selected=!0),(0,r.RI)(o,"removable")&&(o.removable=!0),o}))})((0,l.z9)());e.forEach(((e,t)=>{e.index=t,e.value=(0,r.oX)(e.value)})),g.list=e,G(),q(),F()};return(0,i.onMounted)((()=>{w=x.value,y=w.querySelector(".vui-select-view"),k=w.querySelector(".vui-select-hide"),S=w.querySelector(".vui-select-list"),Y()})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:x,class:(0,i.normalizeClass)(m)},[h.label?((0,i.openBlock)(),(0,i.createElementBlock)("label",s,(0,i.toDisplayString)(h.label),1)):(0,i.createCommentVNode)("v-if",!0),(0,i.withDirectives)((0,i.createElementVNode)("input",{"onUpdate:modelValue":t[0]||(t[0]=e=>(0,i.unref)(g).viewLabel=e),type:"text",class:(0,i.normalizeClass)((0,i.unref)(z)),style:(0,i.normalizeStyle)((0,i.unref)(C)),size:(0,i.unref)(Z),disabled:h.disabled,readonly:!h.searchable,onClick:(0,i.withModifiers)(j,["stop"]),onInput:(0,i.withModifiers)(W,["stop"]),onFocus:U,onBlur:Q},null,46,u),[[i.vModelText,(0,i.unref)(g).viewLabel],[(0,i.unref)(l.gx)]]),(0,i.createElementVNode)("div",d,[(0,i.createElementVNode)("div",c,[((0,i.openBlock)(!0),(0,i.createElementBlock)(i.Fragment,null,(0,i.renderList)((0,i.unref)(g).list,(e=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{key:e.index,class:(0,i.normalizeClass)(X(e)),onMousedown:t=>(e=>{g.searchValue=null,g.selectedIndex=e.index,g.selectedLabel=e.label,g.selectedValue=e.value,g.value=e.value,P()})(e)},[(0,i.createElementVNode)("div",v,(0,i.toDisplayString)(e.label),1),e.removable?((0,i.openBlock)(),(0,i.createElementBlock)("div",{key:0,class:"vui-select-item-remove",onMousedown:(0,i.withModifiers)((t=>(e=>{o("remove",e)})(e)),["stop","prevent"])},[(0,i.createVNode)(a.Z)],40,f)):(0,i.createCommentVNode)("v-if",!0)],42,p)))),128))])])],512))}};var b=o(4924),m=o.n(b),g=o(3668),x=o.n(g),w=o(153),y=o.n(w),k=o(8708),S=o.n(k),z=o(8130),C=o.n(z),Z=o(3228),E={attributes:{context:"vine-ui"}};E.setAttributes=S(),E.insert=y().bind(null,"head"),E.domAPI=x(),E.insertStyleElement=C();m()(Z.Z,E);Z.Z&&Z.Z.locals&&Z.Z.locals;const V=h},1311:(e,t,o)=>{o.r(t),o.d(t,{default:()=>w});var i=o(6609),n=o(963);const l={key:0,class:"vui-switch-label"},r={key:1,class:"vui-switch-label"},a={__name:"switch",props:{label:{type:String,default:""},labelPosition:{type:String,default:"left",validator:e=>["left","right"].includes(e)},labelClickable:{type:Boolean,default:!1},colors:{type:String,default:"#aaaaaa,#1890ff"},width:{type:String,default:"35px"},height:{type:String,default:"20px"},disabled:{type:Boolean,default:!1},checked:{type:Boolean,default:!1},modelValue:{type:Boolean,default:null}},emits:["update:modelValue","change"],setup(e,t){let{emit:o}=t;const a=e,s=["#aaaaaa","#1890ff"],{cid:u}=(0,n.ZA)("VuiSwitch"),d=(0,i.reactive)({checked:!1});(0,i.watchEffect)((()=>{d.checked=null===a.modelValue?a.checked:a.modelValue})),(0,i.watch)((()=>d.checked),(e=>{o("update:modelValue",e),o("change",e)}));const c=(0,i.computed)((()=>{const e=["vui","vui-switch",u];return d.checked&&e.push("vui-switch-checked"),a.labelClickable&&e.push("vui-switch-label-clickable"),a.disabled&&e.push("vui-switch-disabled"),e})),p=(0,i.computed)((()=>{let e=d.checked?s[1]:s[0];if(a.colors){const t=`${a.colors}`.split(",").map((e=>e.trim()));d.checked&&t[1]?e=t[1]:t[0]&&(e=t[0])}return{width:a.width,height:a.height,"border-radius":a.height,"background-color":e}})),v=(0,i.computed)((()=>({width:`calc(${a.height} - 4px)`,right:d.checked?"2px":`calc(${a.width} - ${a.height} + 2px)`}))),f=(0,i.computed)((()=>a.label||(0,n.z9)())),h=e=>{a.disabled||(a.labelClickable||e.target.classList.contains("vui-switch-button"))&&(d.checked=!d.checked)};return(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{class:(0,i.normalizeClass)((0,i.unref)(c)),onClick:h},[(0,i.unref)(f)&&"left"===a.labelPosition?((0,i.openBlock)(),(0,i.createElementBlock)("div",l,[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(a.label),1)]))])):(0,i.createCommentVNode)("v-if",!0),(0,i.createElementVNode)("div",{class:"vui-switch-button",style:(0,i.normalizeStyle)((0,i.unref)(p))},[(0,i.createElementVNode)("div",{class:"vui-switch-icon",style:(0,i.normalizeStyle)((0,i.unref)(v))},null,4)],4),(0,i.unref)(f)&&"right"===a.labelPosition?((0,i.openBlock)(),(0,i.createElementBlock)("div",r,[(0,i.renderSlot)(e.$slots,"default",{},(()=>[(0,i.createTextVNode)((0,i.toDisplayString)(a.label),1)]))])):(0,i.createCommentVNode)("v-if",!0)],2))}};var s=o(4924),u=o.n(s),d=o(3668),c=o.n(d),p=o(153),v=o.n(p),f=o(8708),h=o.n(f),b=o(8130),m=o.n(b),g=o(6727),x={attributes:{context:"vine-ui"}};x.setAttributes=h(),x.insert=v().bind(null,"head"),x.domAPI=c(),x.insertStyleElement=m();u()(g.Z,x);g.Z&&g.Z.locals&&g.Z.locals;const w=a},7957:(e,t,o)=>{o.r(t),o.d(t,{default:()=>y});var i=o(6609),n=o(963),l=o(5504),r=o(9315);const a={class:"vui-tab-panes"},s={__name:"tab",props:{align:{type:String,default:"left",validator:e=>["left","center","right"].includes(e)},theme:{type:String,default:"chrome",validator:e=>["chrome","simple"].includes(e)},index:{type:[Number,String],default:0},modelValue:{type:[Number,String],default:null}},emits:["update:modelValue","change"],setup(e,t){let{emit:o}=t;const s=e,{cid:u}=(0,n.ZA)("VuiTab"),d=(0,i.reactive)({index:0});(0,i.watchEffect)((()=>{d.index=(0,l.le)(null===s.modelValue?s.index:s.modelValue)})),(0,i.watch)((()=>d.index),(e=>{o("update:modelValue",e),o("change",e)}));const c=(0,i.ref)(null);let p;const v=(0,i.computed)((()=>(0,n.z9)("left"))),f=(0,i.computed)((()=>(0,n.z9)("right"))),h=(0,i.computed)((()=>["vui","vui-tab",`vui-tab-${s.theme}`,u])),b=e=>{let t,o=e.target;for(;o;){if(o.classList&&o.classList.contains("vui-tab-item")){t=o;break}o=o.parentNode}if(!t)return;const i=(0,l.le)(t.getAttribute("index"));i!==d.index&&(d.index=i)};return(0,i.watch)((()=>d.index),(e=>{const t=p.querySelectorAll(".vui-tab-selected");Array.from(t).forEach((e=>{e.classList.remove("vui-tab-selected")})),[`.vui-tab-item[index="${e}"]`,`.vui-tab-pane[index="${e}"]`].forEach((e=>{const t=p.querySelector(e);t&&t.classList.add("vui-tab-selected")}))})),(0,i.onMounted)((()=>{p=c.value;const e=p.querySelectorAll(".vui-tab-panes > *");Array.from(e).forEach(((e,t)=>{e.setAttribute("index",t),e.classList.add("vui-tab-pane"),t===d.index&&e.classList.add("vui-tab-selected")}));const t=p.querySelectorAll(".vui-tab-tabs > *");Array.from(t).forEach(((e,t)=>{e.setAttribute("index",t),e.classList.add("vui-tab-item","vui-flex-row"),t===d.index&&e.classList.add("vui-tab-selected")}))})),(e,t)=>((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:c,class:(0,i.normalizeClass)((0,i.unref)(h))},[(0,i.createVNode)(r.default,{class:"vui-tab-header"},{default:(0,i.withCtx)((()=>[(0,i.unref)(v)?((0,i.openBlock)(),(0,i.createBlock)(r.default,{key:0,wrap:"",gap:"10px",class:"vui-tab-header-left"},{default:(0,i.withCtx)((()=>[(0,i.renderSlot)(e.$slots,"left")])),_:3})):(0,i.createCommentVNode)("v-if",!0),(0,i.createVNode)(r.default,{align:s.align,class:"vui-tab-tabs vui-flex-auto",onClick:b},{default:(0,i.withCtx)((()=>[(0,i.renderSlot)(e.$slots,"tabs")])),_:3},8,["align"]),(0,i.unref)(f)?((0,i.openBlock)(),(0,i.createBlock)(r.default,{key:1,wrap:"",gap:"10px",class:"vui-tab-header-right"},{default:(0,i.withCtx)((()=>[(0,i.renderSlot)(e.$slots,"right")])),_:3})):(0,i.createCommentVNode)("v-if",!0)])),_:3}),(0,i.createElementVNode)("div",a,[(0,i.renderSlot)(e.$slots,"panes")])],2))}};var u=o(4924),d=o.n(u),c=o(3668),p=o.n(c),v=o(153),f=o.n(v),h=o(8708),b=o.n(h),m=o(8130),g=o.n(m),x=o(6270),w={attributes:{context:"vine-ui"}};w.setAttributes=b(),w.insert=f().bind(null,"head"),w.domAPI=p(),w.insertStyleElement=g();d()(x.Z,w);x.Z&&x.Z.locals&&x.Z.locals;const y=s},9203:(e,t,o)=>{o.r(t),o.d(t,{default:()=>k});var i=o(6609),n=o(963),l=o(5047),r=o(9884),a=o(5504);const s={class:"vui-tooltip-content"},u={__name:"tooltip",props:{text:{type:String,default:""},html:{type:Boolean,default:!1},maxWidth:{type:[String,Number],default:320},target:{validator:e=>!0,default:""},positions:{type:[String,Array],default:()=>["top","bottom","right","center"]},borderColor:{type:String,default:""},bgColor:{type:String,default:""},color:{type:String,default:""},container:{validator:e=>!0,default:""},nonreactive:{type:Boolean,default:!0},visible:{type:Boolean,default:!0}},setup(e,t){let{expose:o}=t;const u=e,{cid:d}=(0,n.ZA)("VuiTooltip"),c=(0,i.ref)(null);let p;const v=(0,i.reactive)({visible:u.visible,top:0,left:0,background:""});(0,i.watchEffect)((()=>{v.visible=u.visible}));const f=(0,i.computed)((()=>{const e=["vui","vui-tooltip",d];return u.nonreactive&&e.push("vui-tooltip-nonreactive"),e})),h=(0,i.computed)((()=>{const e={top:`${v.top}px`,left:`${v.left}px`,background:v.background};return u.color&&(e["--vui-tooltip-color"]=u.color),u.maxWidth&&(e["--vui-tooltip-max-width"]=(0,a.IA)(u.maxWidth)),e})),b=(0,r.gJ)((()=>{if(!v.visible)return;const e=(0,l.Dz)(u.container||window),t=(0,l.Dz)(u.target),o=(0,l.Dz)(`.${d}`),i=u.positions,n=(0,l.We)(e,t,o,i);n.changed&&(v.top=n.top,v.left=n.left);const r=(0,l.CJ)(n,{bgColor:u.bgColor,borderColor:u.borderColor});r.changed&&(v.background=r.background)})),m=()=>{if(!v.visible)return;if(!p)return;const e=p.querySelector(".vui-tooltip-content");u.html?e.innerHTML=u.text:e.innerText=u.text,b()};let g;return(0,i.watch)((()=>v.visible),(e=>{m()})),(0,i.onMounted)((()=>{p=c.value,g=new ResizeObserver((e=>{b()})),g.observe(p),m()})),(0,i.onUnmounted)((()=>{g&&(g.disconnect(),g=null),p=null})),o({update:b,cid:d}),(e,t)=>(0,i.withDirectives)(((0,i.openBlock)(),(0,i.createElementBlock)("div",{ref_key:"el",ref:c,class:(0,i.normalizeClass)((0,i.unref)(f)),style:(0,i.normalizeStyle)((0,i.unref)(h))},[(0,i.createElementVNode)("div",s,[(0,i.renderSlot)(e.$slots,"default")])],6)),[[i.vShow,v.visible]])}};var d=o(4924),c=o.n(d),p=o(3668),v=o.n(p),f=o(153),h=o.n(f),b=o(8708),m=o.n(b),g=o(8130),x=o.n(g),w=o(9545),y={attributes:{context:"vine-ui"}};y.setAttributes=m(),y.insert=h().bind(null,"head"),y.domAPI=v(),y.insertStyleElement=x();c()(w.Z,y);w.Z&&w.Z.locals&&w.Z.locals;const k=u},7051:(e,t,o)=>{o.d(t,{Z:()=>a});var i=o(6609);const n={xmlns:"http://www.w3.org/2000/svg","pointer-events":"none",width:"100%",height:"100%",viewBox:"0 0 24 24"},l=[(0,i.createElementVNode)("g",{fill:"none","stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",stroke:"currentColor"},[(0,i.createElementVNode)("path",{d:"M0 0h24v24H0z",stroke:"none"}),(0,i.createElementVNode)("path",{d:"M18 6 6 18M6 6l12 12"})],-1)];const r={},a=(0,o(8586).Z)(r,[["render",function(e,t){return(0,i.openBlock)(),(0,i.createElementBlock)("svg",n,l)}]])},9884:(e,t,o)=>{o.d(t,{gJ:()=>n});class i{start(e){this.callback=e,this.started||(this.started=!0,this.create())}create(){if("function"!=typeof window.queueMicrotask){if("function"!=typeof Promise)throw new Error("Current browser does NOT support queueMicrotask or Promise");Promise.resolve().then((()=>{this.execute()}))}else window.queueMicrotask((()=>{this.execute()}))}execute(){if(!this.started)return;this.started=!1;const e=this.callback;this.callback=null,"function"==typeof e&&e.call(this)}cancel(){this.started=!1,this.callback=null}}const n=function(e){const t=new i,o=function(){t.start((()=>{e.apply(this,arguments)}))};return o.cancel=()=>{t.cancel()},o}},5047:(e,t,o)=>{o.d(t,{CJ:()=>f,Dz:()=>a,We:()=>c,sb:()=>r});const i=e=>("number"!=typeof e&&(e=parseFloat(e)),isNaN(e)&&(e=0),e=Math.round(e)),n=function(e,t,o){return Math.max(t,Math.min(o,e))},l=e=>e?{left:i(e.left||e.x),top:i(e.top||e.y),width:i(e.width),height:i(e.height)}:{left:0,top:0,width:0,height:0},r=e=>{return"string"==typeof e&&e?e.startsWith("#")?document.getElementById(e.slice(1)):document.querySelector(e):(t=e,Boolean(t&&9===t.nodeType)?e.body:(e=>Boolean(e&&1===e.nodeType))(e)?e:void 0);var t},a=e=>{if(!e)return l();if(t=e,Boolean(t&&t===t.window))return{left:0,top:0,width:window.innerWidth,height:window.innerHeight};var t;const o=r(e);if(!o)return l(e);const i=o.getBoundingClientRect(),n=l(i);return n.left+=window.pageXOffset,n.top+=window.pageYOffset,n.width=o.offsetWidth,n.height=o.offsetHeight,n},s={bottom:(e,t,o)=>{e.space=t.top+t.height-o.top-o.height-e.height,e.top=o.top+o.height,e.left=Math.round(o.left+.5*o.width-.5*e.width)},top:(e,t,o)=>{e.space=o.top-e.height-t.top,e.top=o.top-e.height,e.left=Math.round(o.left+.5*o.width-.5*e.width)},right:(e,t,o)=>{e.space=t.left+t.width-o.left-o.width-e.width,e.top=Math.round(o.top+.5*o.height-.5*e.height),e.left=o.left+o.width},left:(e,t,o)=>{e.space=o.left-e.width-t.left,e.top=Math.round(o.top+.5*o.height-.5*e.height),e.left=o.left-e.width}},u=(e,t,o)=>{const[i,l]=((e,t)=>["top","bottom"].includes(e.position)?(e.top=n(e.top,t.top,t.top+t.height-e.height),["left","width"]):(e.left=n(e.left,t.left,t.left+t.width-e.width),["top","height"]))(e,t);((e,t,o,i,n)=>{const l=e[i],r=e[n],a=t[i],s=t[n],u=o[i]+.5*o[n];if(r>s){const t=.5*(r-s);return e[i]=a-t,void(e.offset=u-a+t)}const d=l-a;if(d>=0&&a+s-(l+r)>=0)return e.passed&&(e.passed+=2),void(e.offset=.5*r);if(e.passed&&(e.passed+=1),d<0){const t=a;return e[i]=t,void(e.offset=u-t)}const c=a+s-r;e[i]=c,e.offset=u-c})(e,t,o,i,l),e.offset=n(e.offset,0,e[l])},d=(e,t,o,i)=>{((e,t,o)=>{(0,s[e.position])(e,t,o),e.space>=0&&(e.passed+=1)})(e,t,o),u(e,t,o),((e,t)=>{if(!t)return;if(e.position===t.position)return;const o=e.left+.5*e.width,i=e.top+.5*e.height,n=t.left+.5*t.width,l=t.top+.5*t.height,r=Math.abs(o-n),a=Math.abs(i-l);e.distance=Math.round(Math.sqrt(r*r+a*a))})(e,i)},c=(e,t,o,i,n)=>{const l=Object.keys(s);let r=!0,a=((e,t)=>{if(e&&(Array.isArray(e)&&(e=e.join(",")),(e=(e=String(e).split(",").map((e=>e.trim().toLowerCase())).filter((e=>e))).filter((e=>t.includes(e)))).length))return e})(i,l);a||(a=l,r=!1);const u={};a.forEach(((e,t)=>{u[e]={position:e,index:t,top:0,left:0,width:o.width,height:o.height,space:0,offset:0,passed:0,distance:0}}));const c=((e,t,o,i,n)=>{if(n){const i=o[n.position];if(i){if(d(i,e,t),i.passed>=3)return i;i.calculated=!0}}const l=[];return Object.values(o).forEach((o=>{o.calculated||d(o,e,t,n),l.push(o)})),l.sort(((e,t)=>e.passed!==t.passed?t.passed-e.passed:i&&e.passed>=3&&t.passed>=3?e.index-t.index:e.space!==t.space?t.space-e.space:e.index-t.index)),l[0]})(e,t,u,r,n);return c.changed=((e,t)=>!t||e.left!==t.left||e.top!==t.top)(c,n),c},p=(e,t,o,i,l)=>{const r=(e,t)=>[e,t].join(","),a=function(e,t){const o=Math.floor(e);let i=e<o+.5?o+.5:o+1.5;return t&&(i-=1),i},s=function(e){return a(e,!0)},u=[],d=a(i),c=s(e-i);o=n(o,d,c);const p=a(i),v=s(t-i),f=r(d,p+l),h=r(o,1),b=r(d,p),m=r(c,p),g=r(o-i,p),x=r(c-l,p);return u.push(`M${f}`),u.push("V"+(v-l)),u.push(`Q${r(d,v)} ${r(d+l,v)}`),u.push("H"+(c-l)),u.push(`Q${r(c,v)} ${r(c,v-l)}`),u.push(`V${p+l}`),o<d+i+l?(u.push(`Q${m} ${x}`),u.push(`H${o+i}`),u.push(`L${h}`),o<d+i?(u.push(`L${b}`),u.push(`L${f}`)):(u.push(`L${g}`),u.push(`Q${b} ${f}`))):o>c-i-l?(o>c-i?u.push(`L${m}`):u.push(`Q${m} ${r(o+i,p)}`),u.push(`L${h}`),u.push(`L${g}`),u.push(`H${d+l}`),u.push(`Q${b} ${f}`)):(u.push(`Q${m} ${x}`),u.push(`H${o+i}`),u.push(`L${h}`),u.push(`L${g}`),u.push(`H${d+l}`),u.push(`Q${b} ${f}`)),u.join("")},v={},f=(e,t={})=>{const o={bgColor:"#fff",borderColor:"#ccc",borderRadius:5,arrowSize:10};Object.keys(t).forEach((e=>{const i=t[e];i&&(o[e]=i)}));const i=[e.width,e.height,e.offset,o.arrowSize,o.borderRadius,o.bgColor,o.borderColor].join("-"),n=v[e.position];if(n&&i===n.key){const t=n.style;return t.changed=v.position!==e.position,v.position=e.position,t}const l=(r=e.position,a=e.width,s=e.height,u=e.offset,d=o.arrowSize,c=o.borderRadius,{bottom:()=>({d:p(a,s,u,d,c),transform:""}),top:()=>({d:p(a,s,a-u,d,c),transform:`rotate(180,${.5*a},${.5*s})`}),left:()=>({d:p(s,a,u,d,c),transform:`translate(${.5*(a-s)} ${.5*(s-a)}) rotate(90,${.5*s},${.5*a})`}),right:()=>({d:p(s,a,s-u,d,c),transform:`translate(${.5*(a-s)} ${.5*(s-a)}) rotate(-90,${.5*s},${.5*a})`})}[r]());var r,a,s,u,d,c;const f=[`<svg viewBox="${[0,0,e.width,e.height].join(" ")}" xmlns="http://www.w3.org/2000/svg">`,`<path d="${l.d}" fill="${o.bgColor}" stroke="${o.borderColor}" transform="${l.transform}" />`,"</svg>"].join(""),h={background:`${`url("data:image/svg+xml;charset=utf8,${encodeURIComponent(f)}")`} center no-repeat`,padding:`${o.arrowSize+o.borderRadius}px`,changed:!0};return v.position=e.position,v[e.position]={key:i,style:h},h}},4499:(e,t,o)=>{var i={"./button/button.vue":5528,"./checkbox/checkbox.vue":3581,"./dialog/dialog.vue":874,"./flex/flex.vue":9315,"./flyover/flyover.vue":404,"./input/input.vue":445,"./layout/layout.vue":5392,"./loading/loading.vue":6888,"./modal/modal.vue":1152,"./popover/popover.vue":6154,"./progress/progress.vue":9208,"./radio/radio.vue":8947,"./select/select.vue":5751,"./switch/switch.vue":1311,"./tab/tab.vue":7957,"./tooltip/tooltip.vue":9203};function n(e){var t=l(e);return o(t)}function l(e){if(!o.o(i,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return i[e]}n.keys=function(){return Object.keys(i)},n.resolve=l,e.exports=n,n.id=4499},197:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiPg0KICAgIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik02LjU2NC43NWwtMy41OSAzLjYxMi0xLjUzOC0xLjU1TDAgNC4yNiAyLjk3NCA3LjI1IDggMi4xOTN6IiAvPg0KPC9zdmc+"},8540:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMCAxMCc+DQogICAgPHBhdGggZmlsbD0nI2ViZWNlZicgZD0nTTAsMCBRMCwxMCAxMCwxMCBMMCwxMHonLz4NCjwvc3ZnPg=="},1135:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMCAxMCc+DQogICAgPHBhdGggZmlsbD0nI2ViZWNlZicgZD0nTTAsMTAgUTEwLDEwIDEwLDAgTDEwLDEweicvPg0KPC9zdmc+"},7640:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDUiPg0KICAgIDxwYXRoIGZpbGw9ImdyYXkiIGQ9Ik0yIDBMMCAyaDR6bTAgNUwwIDNoNHoiIC8+DQo8L3N2Zz4="},8332:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDUiPg0KICAgIDxwYXRoIGZpbGw9IiMzNDNhNDAiIGQ9Ik0yIDBMMCAyaDR6bTAgNUwwIDNoNHoiIC8+DQo8L3N2Zz4="},8026:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMCAxMCc+DQogICAgPHBhdGggZmlsbD0nI2ZmZicgZD0nTTAsMCBRMCwxMCAxMCwxMCBMMCwxMHonLz4NCjwvc3ZnPg=="},5032:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMCAxMCc+DQogICAgPHBhdGggZmlsbD0nI2ZmZicgZD0nTTAsMTAgUTEwLDEwIDEwLDAgTDEwLDEweicvPg0KPC9zdmc+DQoNCg=="},6609:(t,o,i)=>{t.exports=(e=>{var t={};return i.d(t,e),t})({Fragment:()=>vue__WEBPACK_IMPORTED_MODULE_0__.Fragment,computed:()=>vue__WEBPACK_IMPORTED_MODULE_0__.computed,createBlock:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createBlock,createCommentVNode:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode,createElementBlock:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock,createElementVNode:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode,createTextVNode:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode,createVNode:()=>vue__WEBPACK_IMPORTED_MODULE_0__.createVNode,mergeProps:()=>vue__WEBPACK_IMPORTED_MODULE_0__.mergeProps,normalizeClass:()=>vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass,normalizeStyle:()=>vue__WEBPACK_IMPORTED_MODULE_0__.normalizeStyle,onMounted:()=>vue__WEBPACK_IMPORTED_MODULE_0__.onMounted,onUnmounted:()=>vue__WEBPACK_IMPORTED_MODULE_0__.onUnmounted,openBlock:()=>vue__WEBPACK_IMPORTED_MODULE_0__.openBlock,reactive:()=>vue__WEBPACK_IMPORTED_MODULE_0__.reactive,ref:()=>vue__WEBPACK_IMPORTED_MODULE_0__.ref,renderList:()=>vue__WEBPACK_IMPORTED_MODULE_0__.renderList,renderSlot:()=>vue__WEBPACK_IMPORTED_MODULE_0__.renderSlot,shallowReactive:()=>vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive,toDisplayString:()=>vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString,unref:()=>vue__WEBPACK_IMPORTED_MODULE_0__.unref,useAttrs:()=>vue__WEBPACK_IMPORTED_MODULE_0__.useAttrs,useSlots:()=>vue__WEBPACK_IMPORTED_MODULE_0__.useSlots,vModelCheckbox:()=>vue__WEBPACK_IMPORTED_MODULE_0__.vModelCheckbox,vModelDynamic:()=>vue__WEBPACK_IMPORTED_MODULE_0__.vModelDynamic,vModelRadio:()=>vue__WEBPACK_IMPORTED_MODULE_0__.vModelRadio,vModelText:()=>vue__WEBPACK_IMPORTED_MODULE_0__.vModelText,vShow:()=>vue__WEBPACK_IMPORTED_MODULE_0__.vShow,watch:()=>vue__WEBPACK_IMPORTED_MODULE_0__.watch,watchEffect:()=>vue__WEBPACK_IMPORTED_MODULE_0__.watchEffect,withCtx:()=>vue__WEBPACK_IMPORTED_MODULE_0__.withCtx,withDirectives:()=>vue__WEBPACK_IMPORTED_MODULE_0__.withDirectives,withModifiers:()=>vue__WEBPACK_IMPORTED_MODULE_0__.withModifiers})}},o={};function i(e){var n=o[e];if(void 0!==n)return n.exports;var l=o[e]={id:e,exports:{}};return t[e](l,l.exports,i),l.exports}i.m=t,i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},i.d=(e,t)=>{for(var o in t)i.o(t,o)&&!i.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.b=document.baseURI||self.location.href;var n={};(()=>{i.d(n,{wx:()=>t,ZP:()=>l,qt:()=>o});const e=function(e){const t={};return e.keys().forEach((o=>{const i=o.toLowerCase().split("/"),n=i.pop(),l=i.pop();if(n!==`${l}.vue`)return;const r=`Vui${l.slice(0,1).toUpperCase()+l.slice(1).toLowerCase()}`,a=e(o).default;a.private||(t[r]=a)})),t}(i(4499)),t=e,o=(e,t)=>{"function"==typeof e&&"function"==typeof t&&(document.body.addEventListener("mouseenter",(t=>{const o=t.target,i=o.getAttribute("tooltip");i&&e(o,i)}),!0),document.body.addEventListener("mouseleave",(e=>{const o=e.target;o.getAttribute("tooltip")&&t(o)}),!0))},l=e})();var l=n.wx,r=n.ZP,a=n.qt;
//# sourceMappingURL=vine-ui.esm.js.map

/***/ }),

/***/ "./node_modules/vue/dist/vue.runtime.esm-bundler.js":
/*!**********************************************************!*\
  !*** ./node_modules/vue/dist/vue.runtime.esm-bundler.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BaseTransition": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.BaseTransition),
/* harmony export */   "Comment": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Comment),
/* harmony export */   "EffectScope": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.EffectScope),
/* harmony export */   "Fragment": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Fragment),
/* harmony export */   "KeepAlive": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.KeepAlive),
/* harmony export */   "ReactiveEffect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.ReactiveEffect),
/* harmony export */   "Static": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Static),
/* harmony export */   "Suspense": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Suspense),
/* harmony export */   "Teleport": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Teleport),
/* harmony export */   "Text": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Text),
/* harmony export */   "Transition": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.Transition),
/* harmony export */   "TransitionGroup": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.TransitionGroup),
/* harmony export */   "VueElement": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.VueElement),
/* harmony export */   "assertNumber": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.assertNumber),
/* harmony export */   "callWithAsyncErrorHandling": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.callWithAsyncErrorHandling),
/* harmony export */   "callWithErrorHandling": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.callWithErrorHandling),
/* harmony export */   "camelize": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.camelize),
/* harmony export */   "capitalize": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.capitalize),
/* harmony export */   "cloneVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.cloneVNode),
/* harmony export */   "compatUtils": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.compatUtils),
/* harmony export */   "compile": () => (/* binding */ compile),
/* harmony export */   "computed": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.computed),
/* harmony export */   "createApp": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createApp),
/* harmony export */   "createBlock": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createBlock),
/* harmony export */   "createCommentVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode),
/* harmony export */   "createElementBlock": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createElementBlock),
/* harmony export */   "createElementVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createElementVNode),
/* harmony export */   "createHydrationRenderer": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createHydrationRenderer),
/* harmony export */   "createPropsRestProxy": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createPropsRestProxy),
/* harmony export */   "createRenderer": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createRenderer),
/* harmony export */   "createSSRApp": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createSSRApp),
/* harmony export */   "createSlots": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createSlots),
/* harmony export */   "createStaticVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createStaticVNode),
/* harmony export */   "createTextVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createTextVNode),
/* harmony export */   "createVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.createVNode),
/* harmony export */   "customRef": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.customRef),
/* harmony export */   "defineAsyncComponent": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineAsyncComponent),
/* harmony export */   "defineComponent": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineComponent),
/* harmony export */   "defineCustomElement": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineCustomElement),
/* harmony export */   "defineEmits": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineEmits),
/* harmony export */   "defineExpose": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineExpose),
/* harmony export */   "defineProps": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineProps),
/* harmony export */   "defineSSRCustomElement": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.defineSSRCustomElement),
/* harmony export */   "devtools": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.devtools),
/* harmony export */   "effect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.effect),
/* harmony export */   "effectScope": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.effectScope),
/* harmony export */   "getCurrentInstance": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.getCurrentInstance),
/* harmony export */   "getCurrentScope": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.getCurrentScope),
/* harmony export */   "getTransitionRawChildren": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.getTransitionRawChildren),
/* harmony export */   "guardReactiveProps": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.guardReactiveProps),
/* harmony export */   "h": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.h),
/* harmony export */   "handleError": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.handleError),
/* harmony export */   "hydrate": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.hydrate),
/* harmony export */   "initCustomFormatter": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.initCustomFormatter),
/* harmony export */   "initDirectivesForSSR": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.initDirectivesForSSR),
/* harmony export */   "inject": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.inject),
/* harmony export */   "isMemoSame": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isMemoSame),
/* harmony export */   "isProxy": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isProxy),
/* harmony export */   "isReactive": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isReactive),
/* harmony export */   "isReadonly": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isReadonly),
/* harmony export */   "isRef": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isRef),
/* harmony export */   "isRuntimeOnly": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isRuntimeOnly),
/* harmony export */   "isShallow": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isShallow),
/* harmony export */   "isVNode": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.isVNode),
/* harmony export */   "markRaw": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.markRaw),
/* harmony export */   "mergeDefaults": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.mergeDefaults),
/* harmony export */   "mergeProps": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.mergeProps),
/* harmony export */   "nextTick": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.nextTick),
/* harmony export */   "normalizeClass": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.normalizeClass),
/* harmony export */   "normalizeProps": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.normalizeProps),
/* harmony export */   "normalizeStyle": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.normalizeStyle),
/* harmony export */   "onActivated": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onActivated),
/* harmony export */   "onBeforeMount": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onBeforeMount),
/* harmony export */   "onBeforeUnmount": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onBeforeUnmount),
/* harmony export */   "onBeforeUpdate": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onBeforeUpdate),
/* harmony export */   "onDeactivated": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onDeactivated),
/* harmony export */   "onErrorCaptured": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onErrorCaptured),
/* harmony export */   "onMounted": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onMounted),
/* harmony export */   "onRenderTracked": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onRenderTracked),
/* harmony export */   "onRenderTriggered": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onRenderTriggered),
/* harmony export */   "onScopeDispose": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onScopeDispose),
/* harmony export */   "onServerPrefetch": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onServerPrefetch),
/* harmony export */   "onUnmounted": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onUnmounted),
/* harmony export */   "onUpdated": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.onUpdated),
/* harmony export */   "openBlock": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.openBlock),
/* harmony export */   "popScopeId": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.popScopeId),
/* harmony export */   "provide": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.provide),
/* harmony export */   "proxyRefs": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.proxyRefs),
/* harmony export */   "pushScopeId": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.pushScopeId),
/* harmony export */   "queuePostFlushCb": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.queuePostFlushCb),
/* harmony export */   "reactive": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.reactive),
/* harmony export */   "readonly": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.readonly),
/* harmony export */   "ref": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.ref),
/* harmony export */   "registerRuntimeCompiler": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.registerRuntimeCompiler),
/* harmony export */   "render": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "renderList": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.renderList),
/* harmony export */   "renderSlot": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.renderSlot),
/* harmony export */   "resolveComponent": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.resolveComponent),
/* harmony export */   "resolveDirective": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.resolveDirective),
/* harmony export */   "resolveDynamicComponent": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.resolveDynamicComponent),
/* harmony export */   "resolveFilter": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.resolveFilter),
/* harmony export */   "resolveTransitionHooks": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.resolveTransitionHooks),
/* harmony export */   "setBlockTracking": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.setBlockTracking),
/* harmony export */   "setDevtoolsHook": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.setDevtoolsHook),
/* harmony export */   "setTransitionHooks": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.setTransitionHooks),
/* harmony export */   "shallowReactive": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.shallowReactive),
/* harmony export */   "shallowReadonly": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.shallowReadonly),
/* harmony export */   "shallowRef": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.shallowRef),
/* harmony export */   "ssrContextKey": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.ssrContextKey),
/* harmony export */   "ssrUtils": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.ssrUtils),
/* harmony export */   "stop": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.stop),
/* harmony export */   "toDisplayString": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toDisplayString),
/* harmony export */   "toHandlerKey": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toHandlerKey),
/* harmony export */   "toHandlers": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toHandlers),
/* harmony export */   "toRaw": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toRaw),
/* harmony export */   "toRef": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toRef),
/* harmony export */   "toRefs": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.toRefs),
/* harmony export */   "transformVNodeArgs": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.transformVNodeArgs),
/* harmony export */   "triggerRef": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.triggerRef),
/* harmony export */   "unref": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.unref),
/* harmony export */   "useAttrs": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useAttrs),
/* harmony export */   "useCssModule": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useCssModule),
/* harmony export */   "useCssVars": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useCssVars),
/* harmony export */   "useSSRContext": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useSSRContext),
/* harmony export */   "useSlots": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useSlots),
/* harmony export */   "useTransitionState": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.useTransitionState),
/* harmony export */   "vModelCheckbox": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vModelCheckbox),
/* harmony export */   "vModelDynamic": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vModelDynamic),
/* harmony export */   "vModelRadio": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vModelRadio),
/* harmony export */   "vModelSelect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vModelSelect),
/* harmony export */   "vModelText": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vModelText),
/* harmony export */   "vShow": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.vShow),
/* harmony export */   "version": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.version),
/* harmony export */   "warn": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.warn),
/* harmony export */   "watch": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.watch),
/* harmony export */   "watchEffect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.watchEffect),
/* harmony export */   "watchPostEffect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.watchPostEffect),
/* harmony export */   "watchSyncEffect": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.watchSyncEffect),
/* harmony export */   "withAsyncContext": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withAsyncContext),
/* harmony export */   "withCtx": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withCtx),
/* harmony export */   "withDefaults": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withDefaults),
/* harmony export */   "withDirectives": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withDirectives),
/* harmony export */   "withKeys": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withKeys),
/* harmony export */   "withMemo": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withMemo),
/* harmony export */   "withModifiers": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withModifiers),
/* harmony export */   "withScopeId": () => (/* reexport safe */ _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__.withScopeId)
/* harmony export */ });
/* harmony import */ var _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @vue/runtime-dom */ "./node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js");
/* harmony import */ var _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @vue/runtime-dom */ "./node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js");



function initDev() {
    {
        (0,_vue_runtime_dom__WEBPACK_IMPORTED_MODULE_1__.initCustomFormatter)();
    }
}

// This entry exports the runtime only, and is built as
if ((true)) {
    initDev();
}
const compile = () => {
    if ((true)) {
        (0,_vue_runtime_dom__WEBPACK_IMPORTED_MODULE_1__.warn)(`Runtime compilation is not supported in this build of Vue.` +
            (` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
                ) /* should not happen */);
    }
};




/***/ }),

/***/ "./packages/v8/src/images/icons sync recursive \\.svg$":
/*!***************************************************!*\
  !*** ./packages/v8/src/images/icons/ sync \.svg$ ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./arrow-right.svg": "./packages/v8/src/images/icons/arrow-right.svg",
	"./close.svg": "./packages/v8/src/images/icons/close.svg"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./packages/v8/src/images/icons sync recursive \\.svg$";

/***/ }),

/***/ "./lib/platform/share.js":
/*!*******************************!*\
  !*** ./lib/platform/share.js ***!
  \*******************************/
/***/ ((module) => {

const Util = {
  // definition
  tagPattern: /@([^@\s]+)/g,
  lineBreakPattern: /\r\n|[\r\n\u2028\u2029]/gu,
  attachments: {
    audit: {
      name: 'audit',
      contentType: 'text/html',
      reportFile: 'audit-report.json'
    },
    coverage: {
      name: 'coverage',
      contentType: 'text/html',
      reportFile: 'coverage-report.json'
    },
    network: {
      name: 'network',
      contentType: 'text/html',
      reportFile: 'network-report.json'
    },
    // artifact will be removed finally
    artifact: {
      name: 'artifact',
      contentType: 'application/json'
    }
  },
  pageTimings: [{
    key: 'onContentLoad',
    name: 'Content Loaded',
    color: '#1a1aa6'
  }, {
    key: 'onLoad',
    name: 'Page Loaded',
    color: '#c80000'
  }],
  timings: [{
    key: 'blocked',
    name: 'Blocking',
    color: '#858585'
  }, {
    key: 'dns',
    name: 'DNS Lookup',
    color: '#009688'
  }, {
    key: 'connect',
    name: 'Connecting',
    color: '#b52dcd'
  }, {
    key: 'send',
    name: 'Sending',
    color: '#74979a'
  }, {
    key: 'wait',
    name: 'Waiting',
    color: '#00a846'
  }, {
    key: 'receive',
    name: 'Receiving',
    color: '#0299de'
  }],
  hasOwn: function (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  },
  isNull: function (input) {
    if (input === null || typeof input === 'undefined') {
      return true;
    }
    return false;
  },
  uid: function () {
    let len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
    let prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    const dict = '0123456789abcdefghijklmnopqrstuvwxyz';
    const dictLen = dict.length;
    let str = prefix;
    while (len--) {
      str += dict[Math.random() * dictLen | 0];
    }
    return str;
  },
  zero: function (s) {
    let l = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    s = `${s}`;
    return s.padStart(l, '0');
  },
  toNum: function (num, toInt) {
    if (typeof num !== 'number') {
      num = parseFloat(num);
    }
    if (isNaN(num)) {
      num = 0;
    }
    if (toInt) {
      num = Math.round(num);
    }
    return num;
  },
  isList: function (data) {
    if (data && data instanceof Array && data.length > 0) {
      return true;
    }
    return false;
  },
  forEach: function (rootList, callback) {
    const isBreak = res => {
      return res === 'break' || res === false;
    };
    const forList = (list, parent) => {
      if (!Util.isList(list)) {
        return;
      }
      for (const item of list) {
        const result = callback(item, parent);
        if (isBreak(result)) {
          return result;
        }
        const subResult = forList(item.subs, item);
        if (isBreak(subResult)) {
          return subResult;
        }
      }
    };
    forList(rootList);
  },
  // \ to /
  formatPath: function (str) {
    if (str) {
      str = str.replace(/\\/g, '/');
    }
    return str;
  },
  getCurrentTrendInfo: data => {
    const {
      date,
      duration,
      summary
    } = data;
    const info = {
      date,
      duration
    };
    Object.keys(summary).forEach(k => {
      const item = summary[k];
      info[k] = item.value;
    });
    return info;
  },
  isTagItem: item => {
    if (item.type === 'case' || item.type === 'suite' && item.suiteType === 'describe') {
      return true;
    }
    return false;
  },
  delay: function (ms) {
    return new Promise(resolve => {
      if (ms) {
        setTimeout(resolve, ms);
      } else {
        setImmediate(resolve);
      }
    });
  },
  // =============================================================================

  generatePercentChart: function (percent) {
    return `<div style="--mcr-percent:${percent}%;" class="mcr-percent-chart"></div>`;
  },
  getStatus: (value, watermarks) => {
    if (!watermarks) {
      return 'unknown';
    }
    if (value < watermarks[0]) {
      return 'low';
    }
    if (value < watermarks[1]) {
      return 'medium';
    }
    return 'high';
  },
  // =============================================================================
  // svg

  dFixed: function (num) {
    let fixed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    if (Number.isInteger(num)) {
      return num;
    }
    return Util.toNum(Util.toNum(num).toFixed(fixed));
  },
  pxFixed: num => {
    const floor = Math.floor(num);
    if (num < floor + 0.5) {
      return floor + 0.5;
    }
    return floor + 1.5;
  },
  point: (px, py) => {
    return `${Util.dFixed(px)},${Util.dFixed(py)}`;
  },
  // =============================================================================
  // formatter

  // number
  NF: function (v) {
    if (typeof v === 'number' && v) {
      return v.toLocaleString();
    }
    return v;
  },
  // percent
  PF: function (v) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    let digits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    let unit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '%';
    let space = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
    v = Util.toNum(v);
    t = Util.toNum(t);
    let per = 0;
    if (t) {
      per = v / t;
    }
    const perStr = (per * 100).toFixed(digits);
    if (unit) {
      return perStr + space + unit;
    }
    return parseFloat(perStr);
  },
  PSF: function (v) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    let digits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    return Util.PF(v, t, digits, '%', ' ');
  },
  PNF: function (v) {
    let t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    let digits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    return Util.PF(v, t, digits, '');
  },
  // byte
  BF: function (v) {
    let places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    let space = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    v = Util.toNum(v, true);
    if (v === 0) {
      return `0${space}B`;
    }
    let prefix = '';
    if (v < 0) {
      v = Math.abs(v);
      prefix = '-';
    }
    const base = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    for (let i = 0, l = units.length; i < l; i++) {
      const min = Math.pow(base, i);
      const max = Math.pow(base, i + 1);
      if (v > min && v < max) {
        const unit = units[i];
        v = prefix + (v / min).toFixed(places) + space + unit;
        break;
      }
    }
    return v;
  },
  BSF: function (v) {
    let places = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return Util.BF(v, places, ' ');
  },
  // time
  TF: function (v) {
    let space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    const ms = Util.toNum(v, true);
    if (ms < 1000) {
      return `${ms}${space}ms`;
    }
    if (ms < 60 * 1000) {
      const ss = Math.floor(ms / 1000);
      const sms = Math.round((ms - ss * 1000) / 100);
      if (sms) {
        return `${ss}.${sms}${space}s`;
      }
      return `${ss}${space}s`;
    }
    const s = Math.round(ms / 1000);
    const m = 60;
    const h = m * 60;
    const d = h * 24;
    if (s < h) {
      const minutes = Math.floor(s / m);
      const seconds = s - minutes * m;
      return `${minutes}${space}m ${seconds}${space}s`;
    }
    if (s < d) {
      const hours = Math.floor(s / h);
      const minutes = Math.floor((s - hours * h) / m);
      const seconds = s - hours * h - minutes * m;
      return `${hours}${space}h ${minutes}${space}m ${seconds}${space}s`;
    }
    const days = Math.floor(s / d);
    const hours = Math.floor((s - days * d) / h);
    const minutes = Math.floor((s - days * d - hours * h) / m);
    const seconds = s - days * d - hours * h - minutes * m;
    return `${days}${space}d ${hours}${space}h ${minutes}${space}m ${seconds}${space}s`;
  },
  TSF: function (v) {
    return Util.TF(v, ' ');
  }
};
module.exports = Util;

/***/ }),

/***/ "./packages/app/src/common/hash.js":
/*!*****************************************!*\
  !*** ./packages/app/src/common/hash.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "delHash": () => (/* binding */ delHash),
/* harmony export */   "getHash": () => (/* binding */ getHash),
/* harmony export */   "setHash": () => (/* binding */ setHash)
/* harmony export */ });
const getHash = function (key) {
  let hash = {};
  const h = location.hash.slice(1);
  if (h) {
    const usp = new URLSearchParams(h);
    hash = Object.fromEntries(usp);
  }
  if (key) {
    return hash[key];
  }
  return hash;
};
const setHash = function (key, value) {
  if (!key) {
    return;
  }
  let obj = key;
  if (arguments.length === 2) {
    obj = {};
    obj[key] = value;
  }
  const hash = getHash();
  Object.keys(obj).forEach(k => {
    hash[k] = obj[k];
  });
  const usp = new URLSearchParams(hash);
  location.hash = usp.toString();
};
const delHash = function (key) {
  if (!key) {
    location.hash = '';
    return;
  }
  let list = key;
  if (!Array.isArray(key)) {
    list = [key];
  }
  const hash = getHash();
  list.forEach(k => {
    delete hash[k];
  });
  const usp = new URLSearchParams(hash);
  location.hash = usp.toString();
};

/***/ }),

/***/ "./packages/app/src/common/icons.js":
/*!******************************************!*\
  !*** ./packages/app/src/common/icons.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (context => {
  const paths = context.keys();
  const icons = {};
  paths.forEach(path => {
    const list = path.toLowerCase().split('/');
    const filename = list.pop();
    const iconName = filename.slice(0, -4);
    const dataUrl = context(path);
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const svg = atob(b64);
    icons[iconName] = svg;
  });
  // console.log(icons);
  return icons;
});

/***/ }),

/***/ "./packages/app/src/common/store.js":
/*!******************************************!*\
  !*** ./packages/app/src/common/store.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const namespace = 'mcr';
const key = k => {
  return `${namespace}-${k}`;
};
const store = {
  get(k) {
    let dv = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    const v = window.localStorage.getItem(key(k));
    if (v === null) {
      return dv;
    }
    return v;
  },
  set(k, v) {
    window.localStorage.setItem(key(k), v);
  },
  remove(k) {
    window.localStorage.removeItem(key(k));
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (store);

/***/ }),

/***/ "./packages/v8/src/utils/coverage.js":
/*!*******************************************!*\
  !*** ./packages/v8/src/utils/coverage.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getCoverage": () => (/* binding */ getCoverage)
/* harmony export */ });
/* harmony import */ var monocart_formatter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! monocart-formatter */ "monocart-formatter");
/* harmony import */ var monocart_formatter__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(monocart_formatter__WEBPACK_IMPORTED_MODULE_0__);

class CoverageParser {
  constructor(item, formattedContent, formattedMapping) {
    this.uncoveredLines = {};
    this.uncoveredPieces = {};
    this.executionCounts = {};

    // parse commented and blank lines, include vue html for now
    const parseLines = true;
    const mapping = new monocart_formatter__WEBPACK_IMPORTED_MODULE_0__.Mapping(formattedContent, formattedMapping, parseLines);
    this.mapping = mapping;
    const formattedLines = mapping.formattedLines;
    const commentedLines = mapping.commentedLines;
    const blankLines = mapping.blankLines;
    commentedLines.forEach(lineIndex => {
      this.uncoveredLines[lineIndex] = 'comment';
    });
    blankLines.forEach(lineIndex => {
      this.uncoveredLines[lineIndex] = 'blank';
    });
    if (item.type === 'css') {
      this.parseCss(item.ranges, item.source.length);
    } else {
      this.parseJs(item.ranges);
    }

    // remove all covered lines
    const uncoveredLines = {};
    Object.keys(this.uncoveredLines).forEach(line => {
      const v = this.uncoveredLines[line];
      if (v === 'covered') {
        return;
      }
      uncoveredLines[line] = v;
    });

    // console.log(uncoveredLines);

    this.uncoveredLines = uncoveredLines;
    this.coverage = {
      totalLines: formattedLines.length,
      commentedLines: commentedLines.length,
      blankLines: blankLines.length,
      codeLines: formattedLines.length - commentedLines.length - blankLines.length,
      uncoveredLines: this.uncoveredLines,
      uncoveredPieces: this.uncoveredPieces,
      executionCounts: this.executionCounts
    };
  }

  // ====================================================================================================

  getUncoveredFromCovered(ranges, contentLength) {
    const uncoveredRanges = [];
    if (!ranges.length) {
      // nothing covered
      uncoveredRanges.push({
        start: 0,
        end: contentLength
      });
      return uncoveredRanges;
    }
    ranges.sort((a, b) => a.start - b.start);
    let pos = 0;
    ranges.forEach(range => {
      if (range.start > pos) {
        uncoveredRanges.push({
          start: pos,
          end: range.start
        });
      }
      pos = range.end;
    });
    if (pos < contentLength) {
      uncoveredRanges.push({
        start: pos,
        end: contentLength
      });
    }
    return uncoveredRanges;
  }

  // css, ranges: [ {start, end} ]
  parseCss(ranges, contentLength) {
    const uncoveredRanges = this.getUncoveredFromCovered(ranges, contentLength);
    uncoveredRanges.forEach(range => {
      const {
        start,
        end
      } = range;
      this.setRangeLines(start, end);
    });
  }

  // js, source, ranges: [ {start, end, count} ]
  parseJs(ranges) {
    // no ranges mark all as covered
    if (!ranges.length) {
      return;
    }
    ranges.forEach(range => {
      const {
        start,
        end,
        count
      } = range;
      if (count > 0) {
        if (count > 1) {
          this.setExecutionCounts(start, end, count);
        }
      } else {
        // set uncovered first
        this.setRangeLines(start, end);
      }
    });
  }

  // ====================================================================================================

  setUncoveredLine(line, value) {
    const prev = this.uncoveredLines[line];
    if (prev) {
      return prev;
    }
    this.uncoveredLines[line] = value;
  }
  setUncoveredPieces(line, value) {
    const prevList = this.uncoveredPieces[line];
    if (prevList) {
      prevList.push(value);
      return;
    }
    this.uncoveredPieces[line] = [value];
  }
  setSingleLine(sLoc, eLoc) {
    // console.log(sLoc, eLoc);

    // nothing between
    if (sLoc.column >= eLoc.column) {
      return;
    }

    // console.log(sLoc, codeOffset, eLoc);

    if (sLoc.column === sLoc.indent && eLoc.column === eLoc.length) {
      // console.log('single', sLoc.line);
      this.setUncoveredLine(sLoc.line, 'uncovered');
      return;
    }

    // already uncovered/comment/blank, should not be partial
    const prev = this.setUncoveredLine(sLoc.line, 'partial');
    if (prev) {
      // console.log(sLoc.line, prev);
      return;
    }

    // set pieces for partial, only js
    this.setUncoveredPieces(sLoc.line, {
      start: sLoc.column,
      end: eLoc.column
    });
  }
  setMultipleLines(sLoc, eLoc) {
    const firstELoc = {
      ...sLoc,
      column: sLoc.length
    };
    this.setSingleLine(sLoc, firstELoc);
    for (let i = sLoc.line + 1; i < eLoc.line; i++) {
      this.setUncoveredLine(i, 'uncovered');
    }
    const lastSLoc = {
      ...eLoc,
      column: eLoc.indent
    };
    this.setSingleLine(lastSLoc, eLoc);
  }

  // ====================================================================================================

  setRangeLines(start, end) {
    const mapping = this.mapping;
    const skipIndent = true;
    const sLoc = mapping.getFormattedLocation(start, skipIndent);
    const eLoc = mapping.getFormattedLocation(end, skipIndent);
    if (eLoc.line === sLoc.line) {
      this.setSingleLine(sLoc, eLoc);
      return;
    }
    this.setMultipleLines(sLoc, eLoc);
  }

  // ====================================================================================================

  // only for js
  setExecutionCounts(start, end, count) {
    const mapping = this.mapping;
    const skipIndent = true;
    const sLoc = mapping.getFormattedLocation(start, skipIndent);
    const line = sLoc.line;
    let column = sLoc.column;

    // It should never be possible to start with }
    const pos = sLoc.start + column;
    const char = mapping.getFormattedSlice(pos, pos + 1);
    if (char === '}') {
      // console.log(line, char);
      column += 1;
    }
    const eLoc = mapping.getFormattedLocation(end);
    const endPos = eLoc.start + eLoc.column;

    // console.log(start, end, sLoc);

    const execution = {
      // for start position
      column,
      value: count,
      // for end position
      end: endPos
    };
    const prevList = this.executionCounts[line];
    if (prevList) {
      prevList.push(execution);
      return;
    }
    this.executionCounts[line] = [execution];
  }
}
const getCoverage = (item, formattedContent, formattedMapping) => {
  const parser = new CoverageParser(item, formattedContent, formattedMapping);
  return parser.coverage;
};

/***/ }),

/***/ "./packages/v8/src/utils/util.js":
/*!***************************************!*\
  !*** ./packages/v8/src/utils/util.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var turbogrid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! turbogrid */ "./node_modules/turbogrid/dist/turbogrid.js");
/* harmony import */ var turbogrid__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(turbogrid__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_platform_share_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../lib/platform/share.js */ "./lib/platform/share.js");
/* harmony import */ var _lib_platform_share_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lib_platform_share_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _app_src_common_hash_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../app/src/common/hash.js */ "./packages/app/src/common/hash.js");



const Util = {
  ...turbogrid__WEBPACK_IMPORTED_MODULE_0__.Util,
  ...(_lib_platform_share_js__WEBPACK_IMPORTED_MODULE_1___default()),
  ..._app_src_common_hash_js__WEBPACK_IMPORTED_MODULE_2__,
  isTouchDevice: function () {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Util);

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js":
/*!***********************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js ***!
  \***********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var turbogrid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! turbogrid */ "./node_modules/turbogrid/dist/turbogrid.js");
/* harmony import */ var turbogrid__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(turbogrid__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vine_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vine-ui */ "./node_modules/vine-ui/dist/vine-ui.esm.js");
/* harmony import */ var lz_utils_inflate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lz-utils/inflate */ "./node_modules/lz-utils/dist/inflate.js");
/* harmony import */ var lz_utils_inflate__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lz_utils_inflate__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var async_tick__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! async-tick */ "./node_modules/async-tick/src/index.js");
/* harmony import */ var _utils_util_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/util.js */ "./packages/v8/src/utils/util.js");
/* harmony import */ var _app_src_common_store_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../app/src/common/store.js */ "./packages/app/src/common/store.js");
/* harmony import */ var _components_flyover_vue__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/flyover.vue */ "./packages/v8/src/components/flyover.vue");
/* harmony import */ var _components_report_vue__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/report.vue */ "./packages/v8/src/components/report.vue");









/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __name: 'app',
  setup(__props, _ref) {
    let {
      expose: __expose
    } = _ref;
    __expose();
    const {
      VuiFlex,
      VuiInput,
      VuiSwitch,
      VuiTooltip,
      VuiLoading
    } = vine_ui__WEBPACK_IMPORTED_MODULE_2__.components;

    // =================================================================================
    // do not use reactive for grid data
    const state = (0,vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive)({
      title: 'Coverage Report',
      summary: {},
      group: true,
      topNumber: '3',
      keywords: '',
      watermarks: [50, 80],
      watermarkLow: true,
      watermarkMedium: true,
      watermarkHigh: true,
      windowWidth: window.innerWidth,
      // flyover detail
      flyoverVisible: false,
      flyoverWidth: '60%',
      flyoverTitle: '',
      flyoverComponent: '',
      flyoverData: null,
      grid: null,
      gridDataCache: {},
      loading: false,
      initializing: true
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.provide)('state', state);
    const tooltip = (0,vue__WEBPACK_IMPORTED_MODULE_0__.reactive)({
      visible: false,
      target: null,
      text: '',
      html: false
    });
    const searchClass = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      const ls = ['mcr-search'];
      if (state.keywords) {
        ls.push('mcr-search-keywords');
      }
      return ls;
    });

    // =================================================================================

    // let timeout_tooltip;
    const initTooltip = () => {
      (0,vine_ui__WEBPACK_IMPORTED_MODULE_2__.generateTooltips)((target, text) => {
        // clearTimeout(timeout_tooltip);

        if (_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].isTouchDevice()) {
          return;
        }
        tooltip.visible = true;
        tooltip.target = target;
        tooltip.text = text;

        // timeout_tooltip = setTimeout(() => {
        //     tooltip.visible = false;
        //     tooltip.text = '';
        // }, 2000);
      }, target => {
        //  clearTimeout(timeout_tooltip);
        tooltip.visible = false;
        tooltip.text = '';
      });
    };
    const hideTooltip = () => {
      if (_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].isTouchDevice()) {
        return;
      }
      if (state.tooltip) {
        state.tooltip.visible = false;
        state.tooltip.text = '';
        state.tooltip.html = false;
        state.tooltip.classMap = '';
      }
    };
    const showTooltip = (elem, text, html) => {
      if (_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].isTouchDevice()) {
        return;
      }
      hideTooltip();
      if (!text) {
        return;
      }
      if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = text;
        state.tooltip.html = html;
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;
      }
    };
    const isNodeTruncated = node => {
      if (!node) {
        return false;
      }
      node = node.querySelector('.tg-tree-name') || node;
      if (node.clientWidth < node.scrollWidth) {
        return true;
      }
      return false;
    };

    // =================================================================================

    const initFlyoverSize = () => {
      state.windowWidth = window.innerWidth;
      let flyoverWidth = '60%';
      if (state.windowWidth < 600) {
        flyoverWidth = '100%';
      } else if (state.windowWidth < 800) {
        flyoverWidth = '80%';
      }
      state.flyoverWidth = flyoverWidth;
    };
    const hideFlyover = () => {
      state.flyoverVisible = false;
      state.flyoverData = null;
    };
    const showFlyover = rowItem => {
      state.flyoverData = rowItem.id;
      state.flyoverTitle = rowItem.url;
      state.flyoverVisible = true;
      _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].setHash('page', rowItem.id);
    };
    const displayFlyoverWithHash = () => {
      const page = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].getHash('page');
      if (page) {
        const grid = state.grid;
        if (grid) {
          const rowItem = grid.getRowItemById(page);
          if (rowItem) {
            grid.scrollRowIntoView(rowItem);
            grid.setRowSelected(rowItem);
            showFlyover(rowItem);
            return;
          }
        }
      }
      hideFlyover();
    };

    // =================================================================================

    const bindGridEvents = grid => {
      grid.bind('onCellMouseEnter', (e, d) => {
        const cellNode = d.cellNode;
        if (isNodeTruncated(cellNode)) {
          const text = cellNode.innerText;
          showTooltip(cellNode, text);
        }
      }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
      });
      grid.bind('onClick', (e, d) => {
        const {
          cellNode,
          rowItem,
          columnItem
        } = d;
        if (!cellNode) {
          return;
        }
        if (rowItem.isSummary || rowItem.subs) {
          return;
        }
        grid.setRowSelected(rowItem);
        if (state.flyoverVisible) {
          showFlyover(rowItem);
          return;
        }
        if (columnItem.id === 'name') {
          showFlyover(rowItem);
        }
      });
      grid.bind('onFirstUpdated', e => {
        displayFlyoverWithHash();
      });
    };
    const mergeSingleSubGroups = item => {
      if (!item.subs) {
        return;
      }
      if (item.subs.length === 1) {
        const sub = item.subs[0];
        if (!sub.subs) {
          return;
        }
        item.name = [item.name, sub.name].filter(it => it).join('/');
        item.subs = sub.subs;
        mergeSingleSubGroups(item);
        return;
      }
      item.subs.forEach(sub => {
        mergeSingleSubGroups(sub);
      });
    };

    // calculate groups
    const calculateGroups = (list, parent) => {
      if (!list) {
        return;
      }
      if (typeof parent.total !== 'number') {
        parent.total = 0;
        parent.covered = 0;
        parent.uncovered = 0;
      }
      list.forEach(item => {
        if (typeof item.total !== 'number') {
          calculateGroups(item.subs, item);
        }
        parent.total += item.total;
        parent.covered += item.covered;
        parent.uncovered += item.uncovered;
      });
      parent.pct = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].PNF(parent.covered, parent.total, 2);
      parent.percentChart = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].generatePercentChart(parent.pct);
      parent.status = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].getStatus(parent.pct, state.watermarks);
      parent.pctClassMap = `mcr-${parent.status}`;
    };
    const getGroupRows = summaryRows => {
      let groups = [];
      summaryRows.forEach(summaryItem => {
        const sourcePath = summaryItem.sourcePath;
        const pathList = sourcePath.split('/');
        const lastName = pathList.pop();
        let subs = groups;
        pathList.forEach(key => {
          const item = subs.find(it => it.name === key && it.subs);
          if (item) {
            subs = item.subs;
            return;
          }
          const sub = {
            name: key,
            subs: []
          };
          subs.push(sub);
          subs = sub.subs;
        });
        subs.push({
          ...summaryItem,
          name: lastName
        });
      });
      const group = {
        subs: groups
      };
      mergeSingleSubGroups(group);
      if (group.name) {
        groups = [group];
      }
      const summary = {};
      calculateGroups(groups, summary);
      // console.log(summary);

      return groups;
    };
    const getGridRows = () => {
      const key = ['grid', state.group].join('-');
      // console.log(key);

      const cacheRows = state.gridDataCache[key];
      if (cacheRows) {
        return cacheRows;
      }
      const {
        summary,
        files
      } = state.reportData;
      const summaryRows = files.map(it => {
        return {
          id: it.id,
          sourcePath: it.sourcePath,
          pctClassMap: `mcr-${it.summary.status}`,
          ...it.summary
        };
      });

      // sort before summary
      summaryRows.sort((a, b) => {
        return b.uncovered - a.uncovered;
      });
      let rows = [{
        name: 'Summary',
        type: '',
        url: '',
        isSummary: true,
        classMap: 'mcr-row-summary',
        pctClassMap: `mcr-${summary.status}`,
        sortFixed: 'top',
        ...summary
      }];
      if (state.group) {
        rows = rows.concat(getGroupRows(summaryRows));
      } else {
        rows = rows.concat(summaryRows);
      }
      state.gridDataCache[key] = rows;
      return rows;
    };
    const getGridData = () => {
      const rows = getGridRows();
      const columns = [{
        id: 'name',
        name: 'File',
        classMap: 'mcr-column-name'
      }, {
        id: 'pct',
        name: 'Coverage',
        align: 'right',
        formatter: 'percent'
      }, {
        id: 'percentChart',
        name: '',
        width: 110
      }, {
        id: 'type',
        name: 'Type',
        align: 'center',
        width: 60
      }, {
        id: 'total',
        name: 'Total Bytes',
        align: 'right',
        width: 88,
        formatter: 'bytes'
      }, {
        id: 'covered',
        name: 'Covered',
        align: 'right',
        width: 88,
        formatter: 'bytes'
      }, {
        id: 'uncovered',
        name: 'Uncovered',
        align: 'right',
        width: 88,
        formatter: 'bytes'
      }, {
        id: 'url',
        name: 'URL',
        width: 350,
        maxWidth: 2000,
        formatter: 'url'
      }];
      return {
        columns,
        rows
      };
    };
    const watermarkFilter = status => {
      if (!status) {
        return true;
      }
      const map = {
        low: state.watermarkLow,
        medium: state.watermarkMedium,
        high: state.watermarkHigh
      };
      if (map[status]) {
        return true;
      }
      return false;
    };
    const searchHandler = rowItem => {
      const watermarkGate = watermarkFilter(rowItem.status);
      if (!watermarkGate) {
        return;
      }
      const keywords = state.keywords.trim().toLowerCase();
      if (!keywords) {
        return true;
      }
      const keywordList = keywords.split(/\s+/g);
      const value = rowItem.name;
      for (const item of keywordList) {
        if (value.indexOf(item) !== -1) {
          return true;
        }
        if (value.toLowerCase().indexOf(item.toLowerCase()) !== -1) {
          return true;
        }
      }
    };
    const initData = () => {
      const {
        summary,
        files
      } = state.reportData;
      const fileMap = {};
      files.forEach(item => {
        // init percentChart
        item.summary.percentChart = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].generatePercentChart(item.summary.pct);
        if (fileMap[item.id]) {
          console.error(`duplicate id: ${item.id} '${fileMap[item.id].url}' => '${item.url}'`);
        }
        fileMap[item.id] = item;
      });
      state.fileMap = fileMap;
      summary.percentChart = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].generatePercentChart(summary.pct);
    };
    const initGrid = () => {
      const grid = new turbogrid__WEBPACK_IMPORTED_MODULE_1__.Grid('.mcr-coverage-grid');
      state.grid = grid;
      bindGridEvents(grid);
      let rowNumber = 1;
      const options = {
        bindWindowResize: true,
        scrollbarRound: true,
        textSelectable: false,
        collapseAllVisible: true,
        rowHeight: 36,
        selectMultiple: false,
        // sortField: 'uncovered',
        // sortAsc: false,
        // sortOnInit: true,
        rowFilter: searchHandler,
        rowNumberVisible: true,
        rowNumberFilter: rowItem => {
          if (!rowItem.isSummary && !rowItem.subs) {
            return rowNumber++;
          }
        },
        rowNotFound: 'No Results'
      };
      grid.setFormatter({
        bytes: (v, rowItem, columnItem) => {
          if (typeof v === 'number') {
            const str = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].NF(v);
            const bytes = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].BSF(v);
            if (columnItem.id === 'total') {
              return `<span tooltip="Total ${bytes}">${str}</span>`;
            }
            if (columnItem.id === 'covered') {
              if (v > 0) {
                return `<span tooltip="Covered ${bytes}" class="mcr-covered">${str}</span>`;
              }
            }
            if (columnItem.id === 'uncovered') {
              if (v > 0) {
                return `<span tooltip="Uncovered ${bytes}" class="mcr-uncovered">${str}</span>`;
              }
            }
            return str;
          }
          return v;
        },
        percent: v => {
          if (typeof v === 'number') {
            return _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].PF(v, 100);
          }
          return v;
        },
        url: v => {
          if (v) {
            return `<a href="${v}" target="_blank">${v}</a>`;
          }
          return v;
        }
      });
      grid.setOption(options);
      grid.setData(getGridData());
      grid.render();
    };
    const renderGrid = () => {
      if (state.grid) {
        state.grid.setData(getGridData());
        state.grid.render();
      }
    };
    const updateGrid = () => {
      if (state.grid) {
        state.grid.update();
      }
    };

    // =================================================================================

    const initStore = () => {
      const mapping = {
        'true': true,
        'false': false
      };
      ['group', 'topNumber'].forEach(item => {
        // default empty string
        const v = _app_src_common_store_js__WEBPACK_IMPORTED_MODULE_6__["default"].get(item);
        if (!v) {
          return;
        }
        if (_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].hasOwn(mapping, v)) {
          state[item] = mapping[v];
          return;
        }
        state[item] = v;
      });
    };
    const init = async () => {
      initStore();
      const reportStr = await lz_utils_inflate__WEBPACK_IMPORTED_MODULE_3___default()(window.reportData);
      const reportData = JSON.parse(reportStr);
      console.log(reportData);

      // for export all data JSON able
      state.reportData = reportData;
      state.title = reportData.title;
      state.watermarks = reportData.watermarks;
      initTooltip();
      initFlyoverSize();
      initData();
      initGrid();
      state.initializing = false;
    };
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
      init();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => state.group, v => {
      _app_src_common_store_js__WEBPACK_IMPORTED_MODULE_6__["default"].set('group', v);
      renderGrid();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => state.topNumber, v => {
      _app_src_common_store_js__WEBPACK_IMPORTED_MODULE_6__["default"].set('topNumber', v);
    });
    const updateGridAsync = (0,async_tick__WEBPACK_IMPORTED_MODULE_4__.debounce)(updateGrid, 200);
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)([() => state.keywords, () => state.watermarkLow, () => state.watermarkMedium, () => state.watermarkHigh], () => {
      updateGridAsync();
    });
    window.addEventListener('popstate', (0,async_tick__WEBPACK_IMPORTED_MODULE_4__.microtask)(() => {
      displayFlyoverWithHash();
    }));
    window.addEventListener('resize', () => {
      state.windowWidth = window.innerWidth;
      if (state.windowWidth < 600) {
        state.flyoverWidth = '100%';
      }
    });
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape') {
        state.flyoverVisible = false;
      }
    });
    window.addEventListener('message', e => {
      const data = e.data;
      if (data && typeof data === 'object') {
        Object.assign(state, data);
      }
    });
    const __returned__ = {
      VuiFlex,
      VuiInput,
      VuiSwitch,
      VuiTooltip,
      VuiLoading,
      state,
      tooltip,
      searchClass,
      initTooltip,
      hideTooltip,
      showTooltip,
      isNodeTruncated,
      initFlyoverSize,
      hideFlyover,
      showFlyover,
      displayFlyoverWithHash,
      bindGridEvents,
      mergeSingleSubGroups,
      calculateGroups,
      getGroupRows,
      getGridRows,
      getGridData,
      watermarkFilter,
      searchHandler,
      initData,
      initGrid,
      renderGrid,
      updateGrid,
      initStore,
      init,
      updateGridAsync,
      shallowReactive: vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive,
      onMounted: vue__WEBPACK_IMPORTED_MODULE_0__.onMounted,
      reactive: vue__WEBPACK_IMPORTED_MODULE_0__.reactive,
      provide: vue__WEBPACK_IMPORTED_MODULE_0__.provide,
      watch: vue__WEBPACK_IMPORTED_MODULE_0__.watch,
      computed: vue__WEBPACK_IMPORTED_MODULE_0__.computed,
      get Grid() {
        return turbogrid__WEBPACK_IMPORTED_MODULE_1__.Grid;
      },
      get components() {
        return vine_ui__WEBPACK_IMPORTED_MODULE_2__.components;
      },
      get generateTooltips() {
        return vine_ui__WEBPACK_IMPORTED_MODULE_2__.generateTooltips;
      },
      get inflate() {
        return (lz_utils_inflate__WEBPACK_IMPORTED_MODULE_3___default());
      },
      get microtask() {
        return async_tick__WEBPACK_IMPORTED_MODULE_4__.microtask;
      },
      get debounce() {
        return async_tick__WEBPACK_IMPORTED_MODULE_4__.debounce;
      },
      get Util() {
        return _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"];
      },
      get store() {
        return _app_src_common_store_js__WEBPACK_IMPORTED_MODULE_6__["default"];
      },
      Flyover: _components_flyover_vue__WEBPACK_IMPORTED_MODULE_7__["default"],
      Report: _components_report_vue__WEBPACK_IMPORTED_MODULE_8__["default"]
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js":
/*!**************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js ***!
  \**************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var vine_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vine-ui */ "./node_modules/vine-ui/dist/vine-ui.esm.js");
/* harmony import */ var _utils_util_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/util.js */ "./packages/v8/src/utils/util.js");
/* harmony import */ var _icon_label_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./icon-label.vue */ "./packages/v8/src/components/icon-label.vue");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __name: 'flyover',
  setup(__props, _ref) {
    let {
      expose: __expose
    } = _ref;
    __expose();
    const {
      VuiFlex,
      VuiFlyover
    } = vine_ui__WEBPACK_IMPORTED_MODULE_1__.components;
    const state = (0,vue__WEBPACK_IMPORTED_MODULE_0__.inject)('state');

    // remove tag till flyover animation end
    const onFlyoverEnd = () => {
      if (!state.flyoverVisible) {
        _utils_util_js__WEBPACK_IMPORTED_MODULE_2__["default"].delHash('page');
      }
    };
    const onFlyoverResize = width => {
      state.flyoverWidth = width;
    };
    const __returned__ = {
      VuiFlex,
      VuiFlyover,
      state,
      onFlyoverEnd,
      onFlyoverResize,
      inject: vue__WEBPACK_IMPORTED_MODULE_0__.inject,
      get components() {
        return vine_ui__WEBPACK_IMPORTED_MODULE_1__.components;
      },
      get Util() {
        return _utils_util_js__WEBPACK_IMPORTED_MODULE_2__["default"];
      },
      IconLabel: _icon_label_vue__WEBPACK_IMPORTED_MODULE_3__["default"]
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js":
/*!*****************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js ***!
  \*****************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _app_src_common_icons_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../app/src/common/icons.js */ "./packages/app/src/common/icons.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __name: 'icon-label',
  props: {
    icon: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    gap: {
      type: String,
      default: ''
    },
    button: {
      type: Boolean,
      default: true
    },
    primary: {
      type: Boolean,
      default: false
    }
  },
  setup(__props, _ref) {
    let {
      expose: __expose
    } = _ref;
    __expose();
    const props = __props;
    const context = __webpack_require__("./packages/v8/src/images/icons sync recursive \\.svg$");
    const icons = (0,_app_src_common_icons_js__WEBPACK_IMPORTED_MODULE_1__["default"])(context);
    const el = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(null);
    const classMap = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      const list = ['mcr-icon-label', 'vui-flex-row'];
      if (props.button) {
        list.push('mcr-icon-label-button');
        if (props.primary) {
          list.push('mcr-icon-label-primary');
        }
      }
      return list;
    });
    const styleMap = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      const st = {};
      if (props.size) {
        st['--mcr-icon-size'] = props.size;
      }
      if (props.gap) {
        st['--mcr-icon-gap'] = props.gap;
      }
      return st;
    });
    const getSlot = function () {
      const slots = (0,vue__WEBPACK_IMPORTED_MODULE_0__.useSlots)();
      const fun = slots.default;
      if (typeof fun === 'function') {
        return fun();
      }
    };
    const labelContent = (0,vue__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
      return props.label || getSlot();
    });
    const showIcon = () => {
      if (!props.icon) {
        return;
      }
      const svg = icons[props.icon];
      if (!svg) {
        return;
      }
      const $el = el.value;
      $el.innerHTML = svg;
    };
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
      showIcon();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => props.icon, () => {
      showIcon();
    });
    const __returned__ = {
      context,
      icons,
      props,
      el,
      classMap,
      styleMap,
      getSlot,
      labelContent,
      showIcon,
      computed: vue__WEBPACK_IMPORTED_MODULE_0__.computed,
      onMounted: vue__WEBPACK_IMPORTED_MODULE_0__.onMounted,
      ref: vue__WEBPACK_IMPORTED_MODULE_0__.ref,
      useSlots: vue__WEBPACK_IMPORTED_MODULE_0__.useSlots,
      watch: vue__WEBPACK_IMPORTED_MODULE_0__.watch,
      get decodeIcons() {
        return _app_src_common_icons_js__WEBPACK_IMPORTED_MODULE_1__["default"];
      }
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js":
/*!*************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js ***!
  \*************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var vine_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vine-ui */ "./node_modules/vine-ui/dist/vine-ui.esm.js");
/* harmony import */ var async_tick__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! async-tick */ "./node_modules/async-tick/src/index.js");
/* harmony import */ var monocart_code_viewer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! monocart-code-viewer */ "monocart-code-viewer");
/* harmony import */ var monocart_code_viewer__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(monocart_code_viewer__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var monocart_formatter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! monocart-formatter */ "monocart-formatter");
/* harmony import */ var monocart_formatter__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(monocart_formatter__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _utils_util_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/util.js */ "./packages/v8/src/utils/util.js");
/* harmony import */ var _utils_coverage_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/coverage.js */ "./packages/v8/src/utils/coverage.js");







/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  __name: 'report',
  setup(__props, _ref) {
    let {
      expose: __expose
    } = _ref;
    __expose();
    const {
      VuiFlex,
      VuiSelect,
      VuiSwitch,
      VuiLoading
    } = vine_ui__WEBPACK_IMPORTED_MODULE_1__.components;
    const state = (0,vue__WEBPACK_IMPORTED_MODULE_0__.inject)('state');
    const data = (0,vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive)({});
    const el = (0,vue__WEBPACK_IMPORTED_MODULE_0__.ref)(null);
    let $el;
    let codeViewer;
    const scrollToLine = line => {
      if (codeViewer) {
        const viewer = codeViewer.viewer;
        const top = (line - 1) * viewer.defaultLineHeight;
        if (top >= 0) {
          viewer.scrollDOM.scrollTo({
            top,
            behavior: 'auto'
          });
        }
      }
    };
    const updateTopExecutions = () => {
      const executionCounts = data.executionCounts;
      if (!executionCounts) {
        data.topExecutions = null;
        return;
      }
      const list = [];
      Object.keys(executionCounts).forEach(line => {
        const arr = executionCounts[line];
        arr.forEach(item => {
          list.push({
            // line index to line number
            line: parseInt(line) + 1,
            count: item.value
          });
        });
      });
      if (!list.length) {
        data.topExecutions = null;
        return;
      }
      list.sort((a, b) => {
        return b.count - a.count;
      });
      const maxNumber = parseInt(state.topNumber) || 3;
      if (list.length > maxNumber) {
        list.length = maxNumber;
      }
      data.topExecutions = list;
    };
    const autoDetectType = item => {
      const {
        type,
        source
      } = item;
      const src = source.trim();
      if (src.startsWith('<') && src.endsWith('>')) {
        item.originalType = 'html';
        return 'html';
      }

      // const lastDot = item.sourcePath.lastIndexOf('.');
      // if (lastDot !== -1) {
      //     const ext = item.sourcePath.slice(lastDot);
      //     if (ext === '.vue') {
      //         return 'html';
      //     }
      // }

      return type;
    };
    const formatSource = item => {
      const source = item.source;

      // console.log('formatSource', data.formatted);

      // no format for distFile item, may vue format or others
      if (!data.formatted) {
        // codemirror will replace all \r\n to \n, so end position will be mismatched
        // just replace all \r\n with \n
        const formattedContent = source.replace(_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].lineBreakPattern, '\n');
        const mapping = monocart_formatter__WEBPACK_IMPORTED_MODULE_4__.Mapping.generate(source, formattedContent);
        // console.log(mapping);
        return {
          content: formattedContent,
          mapping
        };
      }
      let type = item.type;
      if (item.distFile && type === 'js') {
        type = autoDetectType(item);
      }
      return (0,monocart_formatter__WEBPACK_IMPORTED_MODULE_4__.format)(source, type);
    };
    const getReport = async item => {
      const cacheKey = ['report', 'formatted', data.formatted].join('_');
      if (item[cacheKey]) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(item[cacheKey]);
          });
        });
      }
      const res = await formatSource(item);
      if (res.error) {
        console.log(res.error.message);
        return;
      }
      const {
        content,
        mapping
      } = res;
      const coverage = (0,_utils_coverage_js__WEBPACK_IMPORTED_MODULE_6__.getCoverage)(item, content, mapping);

      // console.log(cacheKey, coverage);
      // console.log([item.source]);
      // console.log([content]);

      const report = {
        formatted: data.formatted,
        coverage,
        content
      };
      item[cacheKey] = report;
      return report;
    };
    const renderReport = async () => {
      state.loading = true;
      const item = data.item;
      const summary = item.summary;
      const report = await getReport(item);
      if (!report) {
        console.log(`failed to format source: ${item.filename}`);
        data.list = [summary];
        return;
      }
      const {
        uncoveredLines,
        executionCounts,
        totalLines,
        commentedLines,
        blankLines,
        codeLines
      } = report.coverage;
      let uncovered = 0;
      Object.values(uncoveredLines).forEach(v => {
        if (v === 'uncovered') {
          uncovered += 1;
          return;
        }
        if (v === 'partial') {
          uncovered += 0.5;
        }
      });
      uncovered = Math.floor(uncovered);
      const covered = codeLines - uncovered;
      const pct = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].PF(codeLines - uncovered, codeLines, 1, '');
      const percentChart = _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].generatePercentChart(pct);
      const list = [];
      if (commentedLines) {
        list.push({
          name: 'Comments',
          value: commentedLines,
          tooltip: _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].PSF(commentedLines, totalLines)
        });
      }
      if (blankLines) {
        list.push({
          name: 'Blanks',
          value: blankLines,
          tooltip: _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].PSF(blankLines, totalLines)
        });
      }
      const lineInfo = {
        indicator: 'line',
        indicatorName: 'Lines',
        total: codeLines,
        totalTooltip: '',
        covered,
        coveredTooltip: '',
        coveredClass: covered > 0 ? 'mcr-covered' : '',
        uncovered,
        uncoveredTooltip: '',
        uncoveredClass: uncovered > 0 ? 'mcr-uncovered' : '',
        pct,
        status: _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].getStatus(pct, state.watermarks),
        percentChart,
        list
      };
      data.list = [summary, lineInfo];

      // console.log('showReport executionCounts', executionCounts);

      data.executionCounts = executionCounts;
      updateTopExecutions();

      // for code viewer debug
      // console.log(report);

      if (codeViewer) {
        codeViewer.update(report);
      } else {
        codeViewer = (0,monocart_code_viewer__WEBPACK_IMPORTED_MODULE_3__.createCodeViewer)($el, report);
      }
      state.loading = false;
    };
    const renderReportAsync = (0,async_tick__WEBPACK_IMPORTED_MODULE_2__.microtask)(renderReport);
    const showReport = () => {
      const id = state.flyoverData;
      if (!id) {
        return;
      }
      const item = state.fileMap[id];
      data.item = item;
      data.url = item.url;
      data.sourcePath = item.sourcePath;
      data.distFile = item.distFile;
      const summary = item.summary;
      summary.indicatorName = 'Bytes';
      summary.totalTooltip = `Total ${_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].BSF(summary.total)}`;
      summary.coveredTooltip = `Covered ${_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].BSF(summary.covered)}`;
      summary.coveredClass = summary.covered > 0 ? 'mcr-covered' : '';
      summary.uncoveredTooltip = `Uncovered ${_utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"].BSF(summary.uncovered)}`;
      summary.uncoveredClass = summary.uncovered > 0 ? 'mcr-uncovered' : '';
      data.formatted = !item.distFile;
      renderReportAsync();
    };
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => state.flyoverData, v => {
      showReport();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => data.formatted, v => {
      renderReportAsync();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.watch)(() => state.topNumber, v => {
      updateTopExecutions();
    });
    (0,vue__WEBPACK_IMPORTED_MODULE_0__.onMounted)(() => {
      $el = el.value;
    });
    const __returned__ = {
      VuiFlex,
      VuiSelect,
      VuiSwitch,
      VuiLoading,
      state,
      data,
      el,
      get $el() {
        return $el;
      },
      set $el(v) {
        $el = v;
      },
      get codeViewer() {
        return codeViewer;
      },
      set codeViewer(v) {
        codeViewer = v;
      },
      scrollToLine,
      updateTopExecutions,
      autoDetectType,
      formatSource,
      getReport,
      renderReport,
      renderReportAsync,
      showReport,
      ref: vue__WEBPACK_IMPORTED_MODULE_0__.ref,
      watch: vue__WEBPACK_IMPORTED_MODULE_0__.watch,
      inject: vue__WEBPACK_IMPORTED_MODULE_0__.inject,
      onMounted: vue__WEBPACK_IMPORTED_MODULE_0__.onMounted,
      shallowReactive: vue__WEBPACK_IMPORTED_MODULE_0__.shallowReactive,
      get components() {
        return vine_ui__WEBPACK_IMPORTED_MODULE_1__.components;
      },
      get microtask() {
        return async_tick__WEBPACK_IMPORTED_MODULE_2__.microtask;
      },
      get createCodeViewer() {
        return monocart_code_viewer__WEBPACK_IMPORTED_MODULE_3__.createCodeViewer;
      },
      get format() {
        return monocart_formatter__WEBPACK_IMPORTED_MODULE_4__.format;
      },
      get Mapping() {
        return monocart_formatter__WEBPACK_IMPORTED_MODULE_4__.Mapping;
      },
      get Util() {
        return _utils_util_js__WEBPACK_IMPORTED_MODULE_5__["default"];
      },
      get getCoverage() {
        return _utils_coverage_js__WEBPACK_IMPORTED_MODULE_6__.getCoverage;
      }
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=template&id=276f90a6":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=template&id=276f90a6 ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");

const _hoisted_1 = {
  class: "mcr vui-flex-column"
};
const _hoisted_2 = {
  class: "mcr-title"
};
const _hoisted_3 = {
  href: "./"
};
const _hoisted_4 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", {
  class: "vui-flex-auto"
}, null, -1 /* HOISTED */);
const _hoisted_5 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", {
  class: "vui-flex-auto"
}, null, -1 /* HOISTED */);
const _hoisted_6 = {
  class: "mcr-watermarks-value"
};
const _hoisted_7 = {
  class: "mcr-watermarks-value"
};
const _hoisted_8 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", {
  class: "mcr-coverage-grid vui-flex-auto"
}, null, -1 /* HOISTED */);

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("div", _hoisted_1, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
    class: "mcr-header",
    padding: "10px",
    gap: "10px",
    shrink: ""
  }, {
    default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
      gap: "10px",
      wrap: ""
    }, {
      default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_2, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("a", _hoisted_3, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.state.title), 1 /* TEXT */)])]),

      _: 1 /* STABLE */
    }), _hoisted_4]),
    _: 1 /* STABLE */
  }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
    class: "mcr-filter",
    padding: "10px",
    gap: "10px",
    wrap: ""
  }, {
    default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiInput"], {
      modelValue: $setup.state.keywords,
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.state.keywords = $event),
      width: "100%",
      class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)($setup.searchClass),
      placeholder: "keywords"
    }, null, 8 /* PROPS */, ["modelValue", "class"]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSwitch"], {
      modelValue: $setup.state.group,
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.state.group = $event),
      "label-clickable": true,
      "label-position": "right"
    }, {
      default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" Group ")]),
      _: 1 /* STABLE */
    }, 8 /* PROPS */, ["modelValue"]), _hoisted_5, (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
      class: "mcr-watermarks"
    }, {
      default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
        class: "mcr-low",
        gap: "5px"
      }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSwitch"], {
          modelValue: $setup.state.watermarkLow,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => $setup.state.watermarkLow = $event),
          "label-clickable": true,
          width: "22px",
          height: "15px"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" low ")]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["modelValue"])]),
        _: 1 /* STABLE */
      }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
        class: "mcr-medium",
        gap: "5px"
      }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_6, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.state.watermarks[0]), 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSwitch"], {
          modelValue: $setup.state.watermarkMedium,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => $setup.state.watermarkMedium = $event),
          "label-clickable": true,
          width: "22px",
          height: "15px"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" medium ")]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["modelValue"])]),
        _: 1 /* STABLE */
      }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
        class: "mcr-high",
        gap: "5px"
      }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_7, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.state.watermarks[1]), 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSwitch"], {
          modelValue: $setup.state.watermarkHigh,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => $setup.state.watermarkHigh = $event),
          "label-clickable": true,
          width: "22px",
          height: "15px"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" high ")]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["modelValue"])]),
        _: 1 /* STABLE */
      })]),

      _: 1 /* STABLE */
    })]),

    _: 1 /* STABLE */
  }), _hoisted_8, (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["Flyover"], null, {
    default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["Report"])]),
    _: 1 /* STABLE */
  }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiTooltip"], {
    class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)($setup.tooltip.classMap),
    visible: $setup.tooltip.visible,
    target: $setup.tooltip.target,
    text: $setup.tooltip.text,
    html: $setup.tooltip.html
  }, null, 8 /* PROPS */, ["class", "visible", "target", "text", "html"]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiLoading"], {
    visible: $setup.state.initializing,
    size: "l",
    center: ""
  }, null, 8 /* PROPS */, ["visible"])]);
}

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");

const _hoisted_1 = {
  class: "mcr-flyover-main vui-flex-column"
};
const _hoisted_2 = {
  class: "mcr-flyover-title vui-flex-auto"
};
const _hoisted_3 = {
  class: "mcr-flyover-content vui-flex-auto"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)($setup["VuiFlyover"], {
    ref: "flyover",
    position: "right",
    visible: $setup.state.flyoverVisible,
    width: $setup.state.flyoverWidth,
    "min-width": "350",
    onEnd: $setup.onFlyoverEnd,
    onResize: $setup.onFlyoverResize
  }, {
    default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_1, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
      gap: "10px",
      padding: "10px",
      class: "mcr-flyover-header"
    }, {
      default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["IconLabel"], {
        icon: "arrow-right",
        size: "20px",
        onClick: _cache[0] || (_cache[0] = $event => $setup.state.flyoverVisible = false)
      }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_2, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.state.flyoverTitle), 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["IconLabel"], {
        icon: "close",
        size: "20px",
        onClick: _cache[1] || (_cache[1] = $event => $setup.state.flyoverVisible = false)
      })]),
      _: 1 /* STABLE */
    }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_3, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.renderSlot)(_ctx.$slots, "default")])])]),
    _: 3 /* FORWARDED */
  }, 8 /* PROPS */, ["visible", "width"]);
}

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5 ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");

const _hoisted_1 = {
  key: 0,
  ref: "el",
  class: "mcr-icon-label-icon"
};
const _hoisted_2 = {
  key: 1
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("div", {
    class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)($setup.classMap),
    style: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeStyle)($setup.styleMap)
  }, [$setup.props.icon ? ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("div", _hoisted_1, null, 512 /* NEED_PATCH */)) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode)("v-if", true), $setup.labelContent ? ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("label", _hoisted_2, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.renderSlot)(_ctx.$slots, "default", {}, () => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)((0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.props.label), 1 /* TEXT */)])])) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode)("v-if", true)], 6 /* CLASS, STYLE */);
}

/***/ }),

/***/ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9 ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");

const _hoisted_1 = ["tooltip"];
const _hoisted_2 = ["tooltip"];
const _hoisted_3 = ["tooltip"];
const _hoisted_4 = ["innerHTML"];
const _hoisted_5 = ["tooltip"];
const _hoisted_6 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("b", null, "Formatted", -1 /* HOISTED */);
const _hoisted_7 = {
  key: 0
};
const _hoisted_8 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("b", null, "Dist File", -1 /* HOISTED */);
const _hoisted_9 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", null, [/*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("b", null, "Top Executions")], -1 /* HOISTED */);
const _hoisted_10 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("option", null, "3", -1 /* HOISTED */);
const _hoisted_11 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("option", null, "5", -1 /* HOISTED */);
const _hoisted_12 = /*#__PURE__*/(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("option", null, "10", -1 /* HOISTED */);
const _hoisted_13 = {
  class: "mcr-top-line"
};
const _hoisted_14 = {
  class: "mcr-top-count"
};
const _hoisted_15 = {
  ref: "el",
  class: "mcr-report-code vui-flex-auto"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)($setup["VuiFlex"], {
    direction: "column",
    class: "mcr-report"
  }, {
    default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
      direction: "column",
      padding: "5px",
      class: "mcr-report-head"
    }, {
      default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(true), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)(vue__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,vue__WEBPACK_IMPORTED_MODULE_0__.renderList)($setup.data.list, (item, i) => {
        return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)($setup["VuiFlex"], {
          key: i,
          gap: "10px",
          padding: "5px",
          wrap: "",
          class: "mcr-report-item"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", null, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("b", null, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)(item.indicatorName), 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("span", {
            tooltip: item.totalTooltip
          }, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.NF(item.total)), 9 /* TEXT, PROPS */, _hoisted_1)]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", null, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" Covered: "), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("span", {
            tooltip: item.coveredTooltip,
            class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)(item.coveredClass)
          }, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.NF(item.covered)), 11 /* TEXT, CLASS, PROPS */, _hoisted_2)]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", null, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" Uncovered: "), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("span", {
            tooltip: item.uncoveredTooltip,
            class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)(item.uncoveredClass)
          }, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.NF(item.uncovered)), 11 /* TEXT, CLASS, PROPS */, _hoisted_3)]), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", {
            style: {
              "width": "100px"
            },
            innerHTML: item.percentChart
          }, null, 8 /* PROPS */, _hoisted_4), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", {
            style: {
              "padding": "0 5px"
            },
            class: (0,vue__WEBPACK_IMPORTED_MODULE_0__.normalizeClass)('mcr-' + item.status)
          }, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.PF(item.pct, 100)), 3 /* TEXT, CLASS */), ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(true), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)(vue__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,vue__WEBPACK_IMPORTED_MODULE_0__.renderList)(item.list, (it, j) => {
            return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("div", {
              key: j
            }, [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)((0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)(it.name) + ": ", 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("span", {
              tooltip: it.tooltip
            }, (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.NF(it.value)), 9 /* TEXT, PROPS */, _hoisted_5)]);
          }), 128 /* KEYED_FRAGMENT */))]),

          _: 2 /* DYNAMIC */
        }, 1024 /* DYNAMIC_SLOTS */);
      }), 128 /* KEYED_FRAGMENT */)), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
        gap: "10px",
        padding: "5px",
        wrap: "",
        class: "mcr-report-item"
      }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiFlex"], {
          gap: "5px"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [_hoisted_6, (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSwitch"], {
            modelValue: $setup.data.formatted,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => $setup.data.formatted = $event),
            tooltip: "Will automatically turn off formatting if the file was unpacked from a source map file"
          }, null, 8 /* PROPS */, ["modelValue"])]),
          _: 1 /* STABLE */
        }), $setup.data.distFile ? ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)("span", _hoisted_7, [_hoisted_8, (0,vue__WEBPACK_IMPORTED_MODULE_0__.createTextVNode)(" " + (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.data.distFile), 1 /* TEXT */)])) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode)("v-if", true)]),
        _: 1 /* STABLE */
      }), $setup.data.topExecutions ? ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)($setup["VuiFlex"], {
        key: 0,
        gap: "10px",
        padding: "5px",
        wrap: "",
        class: "mcr-report-item"
      }, {
        default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [_hoisted_9, (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiSelect"], {
          modelValue: $setup.state.topNumber,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => $setup.state.topNumber = $event),
          class: "mcr-top-number"
        }, {
          default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [_hoisted_10, _hoisted_11, _hoisted_12]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["modelValue"]), ((0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(true), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementBlock)(vue__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,vue__WEBPACK_IMPORTED_MODULE_0__.renderList)($setup.data.topExecutions, (item, i) => {
          return (0,vue__WEBPACK_IMPORTED_MODULE_0__.openBlock)(), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createBlock)($setup["VuiFlex"], {
            key: i,
            gap: "5px",
            class: "mcr-top-item",
            onClick: $event => $setup.scrollToLine(item.line)
          }, {
            default: (0,vue__WEBPACK_IMPORTED_MODULE_0__.withCtx)(() => [(0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_13, " L" + (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)($setup.Util.NF(item.line)), 1 /* TEXT */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_14, " x" + (0,vue__WEBPACK_IMPORTED_MODULE_0__.toDisplayString)(item.count), 1 /* TEXT */)]),

            _: 2 /* DYNAMIC */
          }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["onClick"]);
        }), 128 /* KEYED_FRAGMENT */))]),

        _: 1 /* STABLE */
      })) : (0,vue__WEBPACK_IMPORTED_MODULE_0__.createCommentVNode)("v-if", true)]),
      _: 1 /* STABLE */
    }), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createElementVNode)("div", _hoisted_15, null, 512 /* NEED_PATCH */), (0,vue__WEBPACK_IMPORTED_MODULE_0__.createVNode)($setup["VuiLoading"], {
      center: "",
      visible: $setup.state.loading
    }, null, 8 /* PROPS */, ["visible"])]),
    _: 1 /* STABLE */
  });
}

/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ = __webpack_require__(/*! ../../../../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js");
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../starfall-cli/node_modules/css-loader/dist/runtime/api.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/api.js");
var ___CSS_LOADER_GET_URL_IMPORT___ = __webpack_require__(/*! ../../../../starfall-cli/node_modules/css-loader/dist/runtime/getUrl.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/getUrl.js");
var ___CSS_LOADER_URL_IMPORT_0___ = __webpack_require__(/*! ../../app/src/images/search.svg */ "./packages/app/src/images/search.svg");
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = ___CSS_LOADER_GET_URL_IMPORT___(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "html {\n  height: 100%;\n}\nbody {\n  --font-monospace: sfmono-regular, menlo, monaco, consolas, \"Liberation Mono\", \"Courier New\", monospace;\n  --bg-failed: #fff0ef;\n  --bg-flaky: #fcf7de;\n  --color-passed: green;\n  --color-failed: #d00;\n  --color-flaky: orange;\n  --color-skipped: gray;\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  color: #333;\n  font-size: 14px;\n  font-family: arial, sans-serif;\n  overflow: hidden;\n}\nsvg {\n  display: block;\n}\na {\n  color: #0d6efd;\n  text-decoration: underline;\n}\na:hover {\n  color: #0a58ca;\n}\na:not([href], [class]),\na:not([href], [class]):hover {\n  color: inherit;\n  text-decoration: none;\n}\n.mcr {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.mcr .mcr-searchable b {\n  color: red;\n}\n\n/*\nicon\n*/\n.mcr-icon {\n  display: block;\n  width: 20px;\n  height: 20px;\n  background-repeat: no-repeat;\n  background-position: center center;\n  background-size: 20px 20px;\n  cursor: pointer;\n  opacity: 0.8;\n  overflow: hidden;\n}\n.mcr-icon:hover {\n  opacity: 1;\n}\n.mcr-header {\n  color: #fff;\n  background-color: #24292f;\n}\n.mcr-header .mcr-title {\n  font-size: 18px;\n  line-height: 22px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.mcr-header .mcr-title a {\n  color: #fff;\n  text-decoration: none;\n}\n.mcr-filter {\n  border-bottom: 1px solid #ddd;\n}\n.mcr-search input {\n  padding-right: 23px;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  background-repeat: no-repeat;\n  background-position: 97% center;\n  background-size: 16px;\n}\n.mcr-search-keywords input {\n  border-color: #80bdff;\n  outline: 0;\n  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);\n}\n.mcr-column-name {\n  text-decoration: underline;\n  cursor: pointer;\n}\n.tg-group .mcr-column-name {\n  text-decoration: none;\n  cursor: default;\n}\n.mcr-row-summary {\n  font-weight: bold;\n  background-color: #f5f5f5;\n}\n.mcr-row-summary .mcr-column-name {\n  text-decoration: none;\n  cursor: default;\n}\n.mcr-low {\n  background: #fce1e5;\n}\n.mcr-medium {\n  background: #fff4c2;\n}\n.mcr-high {\n  background: #e6f5d0;\n}\n.mcr-watermarks {\n  position: relative;\n  border: 1px solid #ccc;\n  border-radius: 10px;\n}\n.mcr-watermarks .mcr-low,\n.mcr-watermarks .mcr-medium,\n.mcr-watermarks .mcr-high {\n  padding: 5px 20px;\n  overflow: visible;\n}\n.mcr-watermarks .mcr-low {\n  padding-left: 10px;\n}\n.mcr-watermarks .mcr-high {\n  padding-right: 10px;\n}\n.mcr-watermarks .mcr-watermarks-value {\n  position: absolute;\n  left: 0;\n  z-index: 10;\n  padding: 2px 5px;\n  font-size: 11px;\n  font-family: Arial, sans-serif;\n  border-radius: 5px;\n  background-color: #fff;\n  transform: translateX(-50%);\n}\n.mcr-percent-chart {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  height: 10px;\n  box-sizing: border-box;\n  border-radius: 3px;\n  background-color: #ee442f;\n  overflow: hidden;\n}\n.mcr-percent-chart::after {\n  position: absolute;\n  top: 0;\n  left: 0;\n  content: \"\";\n  width: var(--mcr-percent);\n  height: 100%;\n  background-color: #4d9221;\n}", ""]);
// Exports
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js");
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/api.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/api.js");
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mcr-flyover-icon {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 20px;\n  height: 100%;\n}\n.mcr-flyover-main {\n  height: 100%;\n  overflow: hidden;\n}\n.mcr-flyover-header {\n  color: #fff;\n  background-color: #005ba4;\n}\n.mcr-flyover-title {\n  font-weight: bold;\n  font-size: 16px;\n  line-height: 22px;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.mcr-flyover-content {\n  overflow: auto;\n}", ""]);
// Exports
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js");
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/api.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/api.js");
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mcr-icon-label {\n  --mcr-icon-size: 16px;\n  --mcr-icon-gap: 3px;\n  position: relative;\n  gap: var(--mcr-icon-gap);\n}\n.mcr-icon-label-icon {\n  display: block;\n  width: var(--mcr-icon-size);\n  height: var(--mcr-icon-size);\n  background-repeat: no-repeat;\n  background-position: center center;\n  background-size: var(--mcr-icon-size) var(--mcr-icon-size);\n}\n.mcr-icon-label-button {\n  cursor: pointer;\n  opacity: 0.8;\n}\n.mcr-icon-label-button label {\n  white-space: nowrap;\n  cursor: pointer;\n}\n.mcr-icon-label-button:hover {\n  opacity: 1;\n}\n.mcr-icon-label-primary {\n  opacity: 1;\n}\n.mcr-icon-label-primary:hover {\n  color: #0a58ca;\n}", ""]);
// Exports
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js");
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(/*! ../../../../../starfall-cli/node_modules/css-loader/dist/runtime/api.js */ "../starfall-cli/node_modules/css-loader/dist/runtime/api.js");
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mcr-report {\n  position: relative;\n  height: 100%;\n}\n.mcr-report-head {\n  width: 100%;\n  border-bottom: 1px solid #dae9fa;\n  background-color: #eef6ff;\n}\n.mcr-report-head a {\n  word-break: break-all;\n}\n@media (hover: none) {\n.mcr-report-item {\n    flex-wrap: nowrap;\n    overflow-x: auto;\n}\n}\n.mcr-report-code {\n  position: relative;\n}\n.mcr-top-number {\n  width: 42px;\n}\n.mcr-top-number .vui-select-view {\n  min-width: 42px;\n  text-align: center;\n}\n.mcr-covered {\n  color: green;\n}\n.mcr-uncovered {\n  color: red;\n}\n.mcr-top-item {\n  cursor: pointer;\n}\n.mcr-top-item:hover .mcr-top-line {\n  text-decoration: underline;\n}\n.mcr-top-item .mcr-top-count {\n  padding: 0 3px;\n  font-size: 12px;\n  font-family: monospace;\n  border: 1px solid #4eb62f;\n  border-radius: 3px;\n  background-color: #e6f5d0;\n}", ""]);
// Exports
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/runtime/api.js":
/*!*******************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/runtime/api.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/runtime/getUrl.js":
/*!**********************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/runtime/getUrl.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!****************************************************************************!*\
  !*** ../starfall-cli/node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


      var API = __webpack_require__(/*! !../../../../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
      var domAPI = __webpack_require__(/*! !../../../../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js");
      var insertFn = __webpack_require__(/*! !../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js");
      var setAttributes = __webpack_require__(/*! !../../../../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js");
      var insertStyleElement = __webpack_require__(/*! !../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js");
      
      var content = __webpack_require__(/*! !!../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./app.vue?vue&type=style&index=0&id=276f90a6&lang=scss */ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss");
      
      content = content.__esModule ? content.default : content;

var options = {"attributes":{"context":"monocart-v8"}};

;
options.setAttributes = setAttributes;

      options.insert = insertFn.bind(null, "head");
    
options.domAPI = domAPI;
options.insertStyleElement = insertStyleElement;

var update = API(content, options);



module.exports = content && content.locals || {};


/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


      var API = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
      var domAPI = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js");
      var insertFn = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js");
      var setAttributes = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js");
      var insertStyleElement = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js");
      
      var content = __webpack_require__(/*! !!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss */ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss");
      
      content = content.__esModule ? content.default : content;

var options = {"attributes":{"context":"monocart-v8"}};

;
options.setAttributes = setAttributes;

      options.insert = insertFn.bind(null, "head");
    
options.domAPI = domAPI;
options.insertStyleElement = insertStyleElement;

var update = API(content, options);



module.exports = content && content.locals || {};


/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


      var API = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
      var domAPI = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js");
      var insertFn = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js");
      var setAttributes = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js");
      var insertStyleElement = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js");
      
      var content = __webpack_require__(/*! !!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss */ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss");
      
      content = content.__esModule ? content.default : content;

var options = {"attributes":{"context":"monocart-v8"}};

;
options.setAttributes = setAttributes;

      options.insert = insertFn.bind(null, "head");
    
options.domAPI = domAPI;
options.insertStyleElement = insertStyleElement;

var update = API(content, options);



module.exports = content && content.locals || {};


/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


      var API = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
      var domAPI = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js");
      var insertFn = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js");
      var setAttributes = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js");
      var insertStyleElement = __webpack_require__(/*! !../../../../../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js */ "../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js");
      
      var content = __webpack_require__(/*! !!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./report.vue?vue&type=style&index=0&id=2070dad9&lang=scss */ "../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss");
      
      content = content.__esModule ? content.default : content;

var options = {"attributes":{"context":"monocart-v8"}};

;
options.setAttributes = setAttributes;

      options.insert = insertFn.bind(null, "head");
    
options.domAPI = domAPI;
options.insertStyleElement = insertStyleElement;

var update = API(content, options);



module.exports = content && content.locals || {};


/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!******************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \******************************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!**********************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \************************************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js":
/*!*****************************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/runtime/setAttributesWithAttributesAndNonce.js ***!
  \*****************************************************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement, attributes) {
  Object.keys(attributes).forEach(function (key) {
    styleElement.setAttribute(key, attributes[key]);
  });
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js":
/*!**************************************************************************************!*\
  !*** ../starfall-cli/node_modules/style-loader/dist/runtime/singletonStyleDomAPI.js ***!
  \**************************************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join("\n");
  };
}();

/* istanbul ignore next  */
function apply(styleElement, index, remove, obj) {
  var css;
  if (remove) {
    css = "";
  } else {
    css = "";
    if (obj.supports) {
      css += "@supports (".concat(obj.supports, ") {");
    }
    if (obj.media) {
      css += "@media ".concat(obj.media, " {");
    }
    var needLayer = typeof obj.layer !== "undefined";
    if (needLayer) {
      css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
    }
    css += obj.css;
    if (needLayer) {
      css += "}";
    }
    if (obj.media) {
      css += "}";
    }
    if (obj.supports) {
      css += "}";
    }
  }

  // For old IE
  /* istanbul ignore if  */
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = styleElement.childNodes;
    if (childNodes[index]) {
      styleElement.removeChild(childNodes[index]);
    }
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index]);
    } else {
      styleElement.appendChild(cssNode);
    }
  }
}
var singletonData = {
  singleton: null,
  singletonCounter: 0
};

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") return {
    update: function update() {},
    remove: function remove() {}
  };

  // eslint-disable-next-line no-undef,no-use-before-define
  var styleIndex = singletonData.singletonCounter++;
  var styleElement =
  // eslint-disable-next-line no-undef,no-use-before-define
  singletonData.singleton || (
  // eslint-disable-next-line no-undef,no-use-before-define
  singletonData.singleton = options.insertStyleElement(options));
  return {
    update: function update(obj) {
      apply(styleElement, styleIndex, false, obj);
    },
    remove: function remove(obj) {
      apply(styleElement, styleIndex, true, obj);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "../starfall-cli/node_modules/vue-loader/dist/exportHelper.js":
/*!********************************************************************!*\
  !*** ../starfall-cli/node_modules/vue-loader/dist/exportHelper.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// runtime helper for setting properties on components
// in a tree-shakable way
exports["default"] = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
        target[key] = val;
    }
    return target;
};


/***/ }),

/***/ "./packages/v8/src/app.vue":
/*!*********************************!*\
  !*** ./packages/v8/src/app.vue ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _app_vue_vue_type_template_id_276f90a6__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app.vue?vue&type=template&id=276f90a6 */ "./packages/v8/src/app.vue?vue&type=template&id=276f90a6");
/* harmony import */ var _app_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.vue?vue&type=script&setup=true&lang=js */ "./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js");
/* harmony import */ var _app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.vue?vue&type=style&index=0&id=276f90a6&lang=scss */ "./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss");
/* harmony import */ var H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../starfall-cli/node_modules/vue-loader/dist/exportHelper.js */ "../starfall-cli/node_modules/vue-loader/dist/exportHelper.js");




;


const __exports__ = /*#__PURE__*/(0,H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_app_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_app_vue_vue_type_template_id_276f90a6__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"packages/v8/src/app.vue"]])

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ }),

/***/ "./packages/v8/src/components/flyover.vue":
/*!************************************************!*\
  !*** ./packages/v8/src/components/flyover.vue ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _flyover_vue_vue_type_template_id_d60c391c__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./flyover.vue?vue&type=template&id=d60c391c */ "./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c");
/* harmony import */ var _flyover_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./flyover.vue?vue&type=script&setup=true&lang=js */ "./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js");
/* harmony import */ var _flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss */ "./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss");
/* harmony import */ var H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../starfall-cli/node_modules/vue-loader/dist/exportHelper.js */ "../starfall-cli/node_modules/vue-loader/dist/exportHelper.js");




;


const __exports__ = /*#__PURE__*/(0,H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_flyover_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_flyover_vue_vue_type_template_id_d60c391c__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"packages/v8/src/components/flyover.vue"]])

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ }),

/***/ "./packages/v8/src/components/icon-label.vue":
/*!***************************************************!*\
  !*** ./packages/v8/src/components/icon-label.vue ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _icon_label_vue_vue_type_template_id_051971c5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./icon-label.vue?vue&type=template&id=051971c5 */ "./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5");
/* harmony import */ var _icon_label_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./icon-label.vue?vue&type=script&setup=true&lang=js */ "./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js");
/* harmony import */ var _icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss */ "./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss");
/* harmony import */ var H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../starfall-cli/node_modules/vue-loader/dist/exportHelper.js */ "../starfall-cli/node_modules/vue-loader/dist/exportHelper.js");




;


const __exports__ = /*#__PURE__*/(0,H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_icon_label_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_icon_label_vue_vue_type_template_id_051971c5__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"packages/v8/src/components/icon-label.vue"]])

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ }),

/***/ "./packages/v8/src/components/report.vue":
/*!***********************************************!*\
  !*** ./packages/v8/src/components/report.vue ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _report_vue_vue_type_template_id_2070dad9__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./report.vue?vue&type=template&id=2070dad9 */ "./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9");
/* harmony import */ var _report_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./report.vue?vue&type=script&setup=true&lang=js */ "./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js");
/* harmony import */ var _report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./report.vue?vue&type=style&index=0&id=2070dad9&lang=scss */ "./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss");
/* harmony import */ var H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../starfall-cli/node_modules/vue-loader/dist/exportHelper.js */ "../starfall-cli/node_modules/vue-loader/dist/exportHelper.js");




;


const __exports__ = /*#__PURE__*/(0,H_workspace_starfall_cli_node_modules_vue_loader_dist_exportHelper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(_report_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"], [['render',_report_vue_vue_type_template_id_2070dad9__WEBPACK_IMPORTED_MODULE_0__.render],['__file',"packages/v8/src/components/report.vue"]])

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__exports__);

/***/ }),

/***/ "./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js":
/*!********************************************************************!*\
  !*** ./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./app.vue?vue&type=script&setup=true&lang=js */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=script&setup=true&lang=js");
 

/***/ }),

/***/ "./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js":
/*!***********************************************************************************!*\
  !*** ./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./flyover.vue?vue&type=script&setup=true&lang=js */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=script&setup=true&lang=js");
 

/***/ }),

/***/ "./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js":
/*!**************************************************************************************!*\
  !*** ./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./icon-label.vue?vue&type=script&setup=true&lang=js */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=script&setup=true&lang=js");
 

/***/ }),

/***/ "./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js":
/*!**********************************************************************************!*\
  !*** ./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_script_setup_true_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./report.vue?vue&type=script&setup=true&lang=js */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=script&setup=true&lang=js");
 

/***/ }),

/***/ "./packages/v8/src/app.vue?vue&type=template&id=276f90a6":
/*!***************************************************************!*\
  !*** ./packages/v8/src/app.vue?vue&type=template&id=276f90a6 ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_template_id_276f90a6__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_template_id_276f90a6__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./app.vue?vue&type=template&id=276f90a6 */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=template&id=276f90a6");


/***/ }),

/***/ "./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c":
/*!******************************************************************************!*\
  !*** ./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_template_id_d60c391c__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_template_id_d60c391c__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./flyover.vue?vue&type=template&id=d60c391c */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=template&id=d60c391c");


/***/ }),

/***/ "./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5":
/*!*********************************************************************************!*\
  !*** ./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5 ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_template_id_051971c5__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_template_id_051971c5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./icon-label.vue?vue&type=template&id=051971c5 */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=template&id=051971c5");


/***/ }),

/***/ "./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9":
/*!*****************************************************************************!*\
  !*** ./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9 ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_template_id_2070dad9__WEBPACK_IMPORTED_MODULE_0__.render)
/* harmony export */ });
/* harmony import */ var _starfall_cli_node_modules_babel_loader_lib_index_js_clonedRuleSet_53_use_starfall_cli_node_modules_vue_loader_dist_templateLoader_js_ruleSet_1_rules_3_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_template_id_2070dad9__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../../../../../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./report.vue?vue&type=template&id=2070dad9 */ "../starfall-cli/node_modules/babel-loader/lib/index.js??clonedRuleSet-53.use!../starfall-cli/node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=template&id=2070dad9");


/***/ }),

/***/ "./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss":
/*!******************************************************************************!*\
  !*** ./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./app.vue?vue&type=style&index=0&id=276f90a6&lang=scss */ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/app.vue?vue&type=style&index=0&id=276f90a6&lang=scss");
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_app_vue_vue_type_style_index_0_id_276f90a6_lang_scss__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss":
/*!*********************************************************************************************!*\
  !*** ./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss */ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/flyover.vue?vue&type=style&index=0&id=d60c391c&lang=scss");
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_flyover_vue_vue_type_style_index_0_id_d60c391c_lang_scss__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss":
/*!************************************************************************************************!*\
  !*** ./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss */ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/icon-label.vue?vue&type=style&index=0&id=051971c5&lang=scss");
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_icon_label_vue_vue_type_style_index_0_id_051971c5_lang_scss__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss":
/*!********************************************************************************************!*\
  !*** ./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../../../../../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../../../../../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../../../../../starfall-cli/node_modules/sass-loader/dist/cjs.js!../../../../../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./report.vue?vue&type=style&index=0&id=2070dad9&lang=scss */ "../starfall-cli/node_modules/style-loader/dist/cjs.js??clonedRuleSet-56.use[0]!../starfall-cli/node_modules/css-loader/dist/cjs.js??clonedRuleSet-56.use[1]!../starfall-cli/node_modules/vue-loader/dist/stylePostLoader.js!../starfall-cli/node_modules/sass-loader/dist/cjs.js!../starfall-cli/node_modules/vue-loader/dist/index.js??ruleSet[0].use!./packages/v8/src/components/report.vue?vue&type=style&index=0&id=2070dad9&lang=scss");
/* harmony import */ var _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ var __WEBPACK_REEXPORT_OBJECT__ = {};
/* harmony reexport (unknown) */ for(const __WEBPACK_IMPORT_KEY__ in _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== "default") __WEBPACK_REEXPORT_OBJECT__[__WEBPACK_IMPORT_KEY__] = () => _starfall_cli_node_modules_style_loader_dist_cjs_js_clonedRuleSet_56_use_0_starfall_cli_node_modules_css_loader_dist_cjs_js_clonedRuleSet_56_use_1_starfall_cli_node_modules_vue_loader_dist_stylePostLoader_js_starfall_cli_node_modules_sass_loader_dist_cjs_js_starfall_cli_node_modules_vue_loader_dist_index_js_ruleSet_0_use_report_vue_vue_type_style_index_0_id_2070dad9_lang_scss__WEBPACK_IMPORTED_MODULE_0__[__WEBPACK_IMPORT_KEY__]
/* harmony reexport (unknown) */ __webpack_require__.d(__webpack_exports__, __WEBPACK_REEXPORT_OBJECT__);


/***/ }),

/***/ "./packages/app/src/images/search.svg":
/*!********************************************!*\
  !*** ./packages/app/src/images/search.svg ***!
  \********************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1Ni45NjYgNTYuOTY2Ij4NCgk8cGF0aCBmaWxsPSIjODg4ODg4IiBkPSJNNTUuMTQ2LDUxLjg4N0w0MS41ODgsMzcuNzg2YzMuNDg2LTQuMTQ0LDUuMzk2LTkuMzU4LDUuMzk2LTE0Ljc4NmMwLTEyLjY4Mi0xMC4zMTgtMjMtMjMtMjNzLTIzLDEwLjMxOC0yMywyMw0KCXMxMC4zMTgsMjMsMjMsMjNjNC43NjEsMCw5LjI5OC0xLjQzNiwxMy4xNzctNC4xNjJsMTMuNjYxLDE0LjIwOGMwLjU3MSwwLjU5MywxLjMzOSwwLjkyLDIuMTYyLDAuOTINCgljMC43NzksMCwxLjUxOC0wLjI5NywyLjA3OS0wLjgzN0M1Ni4yNTUsNTQuOTgyLDU2LjI5Myw1My4wOCw1NS4xNDYsNTEuODg3eiBNMjMuOTg0LDZjOS4zNzQsMCwxNyw3LjYyNiwxNywxN3MtNy42MjYsMTctMTcsMTcNCglzLTE3LTcuNjI2LTE3LTE3UzE0LjYxLDYsMjMuOTg0LDZ6Ii8+DQo8L3N2Zz4NCg==";

/***/ }),

/***/ "./packages/v8/src/images/icons/arrow-right.svg":
/*!******************************************************!*\
  !*** ./packages/v8/src/images/icons/arrow-right.svg ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHBvaW50ZXItZXZlbnRzPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMjAgMjAiPg0KICAgIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJtMi41NDIgMi4xNTQgNy4yNTQgNy4yNmMuMTM2LjE0LjIwNC4zMDIuMjA0LjQ4M2EuNzMuNzMgMCAwIDEtLjIwNC41bC03LjU3NSA3LjM5OGMtLjM4My4zMTctLjcyNC4zMTctMS4wMjIgMC0uMjk5LS4zMTctLjI5OS0uNjQzIDAtLjk4bDcuMDgtNi45MTgtNi43NTQtNi43NjNjLS4yMzctLjM0My0uMjE1LS42NTQuMDY2LS45MzUuMjgxLS4yOC41OTgtLjI5NS45NTEtLjA0NVptOSAwIDcuMjU0IDcuMjZjLjEzNi4xNC4yMDQuMzAyLjIwNC40ODNhLjczLjczIDAgMCAxLS4yMDQuNWwtNy41NzUgNy4zOThjLS4zODMuMzE3LS43MjQuMzE3LTEuMDIyIDAtLjI5OS0uMzE3LS4yOTktLjY0MyAwLS45OGw3LjA4LTYuOTE4LTYuNzU0LTYuNzYzYy0uMjM3LS4zNDMtLjIxNS0uNjU0LjA2Ni0uOTM1LjI4MS0uMjguNTk4LS4yOTUuOTUxLS4wNDVaIi8+DQo8L3N2Zz4=";

/***/ }),

/***/ "./packages/v8/src/images/icons/close.svg":
/*!************************************************!*\
  !*** ./packages/v8/src/images/icons/close.svg ***!
  \************************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHBvaW50ZXItZXZlbnRzPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTYgMTYiPg0KICAgIDxnIGZpbGw9ImN1cnJlbnRDb2xvciI+DQogICAgICAgIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJtNy4xMTYgOC00LjU1OCA0LjU1OC44ODQuODg0TDggOC44ODRsNC41NTggNC41NTguODg0LS44ODRMOC44ODQgOGw0LjU1OC00LjU1OC0uODg0LS44ODRMOCA3LjExNiAzLjQ0MiAyLjU1OGwtLjg4NC44ODRMNy4xMTYgOHoiLz4NCiAgICA8L2c+DQo8L3N2Zz4=";

/***/ }),

/***/ "monocart-code-viewer":
/*!***************************************!*\
  !*** external "monocart-code-viewer" ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_monocart_code_viewer__;

/***/ }),

/***/ "monocart-formatter":
/*!*************************************!*\
  !*** external "monocart-formatter" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_monocart_formatter__;

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
/******/ 			id: moduleId,
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************************!*\
  !*** ./packages/v8/src/index.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.runtime.esm-bundler.js");
/* harmony import */ var _app_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app.vue */ "./packages/v8/src/app.vue");


const app = (0,vue__WEBPACK_IMPORTED_MODULE_0__.createApp)(_app_vue__WEBPACK_IMPORTED_MODULE_1__["default"]);
app.mount('body');
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=monocart-v8.js.map