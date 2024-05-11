var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
/**
* @vue/shared v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function makeMap(str, expectsLowerCase) {
  const set2 = new Set(str.split(","));
  return expectsLowerCase ? (val) => set2.has(val.toLowerCase()) : (val) => set2.has(val);
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend$1 = Object.assign;
const remove$1 = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$q = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$q.call(val, key);
const isArray$1 = Array.isArray;
const isMap$2 = (val) => toTypeString(val) === "[object Map]";
const isSet$2 = (val) => toTypeString(val) === "[object Set]";
const isFunction$1 = (val) => typeof val === "function";
const isString$1 = (val) => typeof val === "string";
const isSymbol$1 = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject$1(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString$1 = Object.prototype.toString;
const toTypeString = (value) => objectToString$1.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString$1(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize$1 = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction((str) => {
  const s = str ? `on${capitalize$1(str)}` : ``;
  return s;
});
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
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString$1(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString$1(value) || isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString$1(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
/**
* @vue/reactivity v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeEffectScope;
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this.effects = [];
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
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
      } finally {
        activeEffectScope = currentEffectScope;
      }
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
      if (!this.detached && this.parent && !fromParent) {
        const last2 = this.parent.scopes.pop();
        if (last2 && last2 !== this) {
          this.parent.scopes[this.index] = last2;
          last2.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function recordEffectScope(effect2, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect2);
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeEffect;
class ReactiveEffect {
  constructor(fn, trigger2, scheduler, scope) {
    this.fn = fn;
    this.trigger = trigger2;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    this._dirtyLevel = 4;
    this._trackId = 0;
    this._runnings = 0;
    this._shouldSchedule = false;
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
      this._dirtyLevel = 1;
      pauseTracking();
      for (let i = 0; i < this._depsLength; i++) {
        const dep = this.deps[i];
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 4) {
            break;
          }
        }
      }
      if (this._dirtyLevel === 1) {
        this._dirtyLevel = 0;
      }
      resetTracking();
    }
    return this._dirtyLevel >= 4;
  }
  set dirty(v) {
    this._dirtyLevel = v ? 4 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    var _a;
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      (_a = this.onStop) == null ? void 0 : _a.call(this);
      this.active = false;
    }
  }
}
function triggerComputed(computed2) {
  return computed2.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanupDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
let shouldTrack = true;
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last2 = trackStack.pop();
  shouldTrack = last2 === void 0 ? true : last2;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    let tracking;
    if (effect2._dirtyLevel < dirtyLevel && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2._shouldSchedule || (effect2._shouldSchedule = effect2._dirtyLevel === 0);
      effect2._dirtyLevel = dirtyLevel;
    }
    if (effect2._shouldSchedule && (tracking != null ? tracking : tracking = dep.get(effect2) === effect2._trackId)) {
      effect2.trigger();
      if ((!effect2._runnings || effect2.allowRecurse) && effect2._dirtyLevel !== 2) {
        effect2._shouldSchedule = false;
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}
const createDep = (cleanup, computed2) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed2;
  return dep;
};
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("");
const MAP_KEY_ITERATE_KEY = Symbol("");
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol$1(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap$2(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap$2(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap$2(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        4
      );
    }
  }
  resetScheduling();
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol$1)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty$p(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty$p;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol$1(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result2 = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result2;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result2 = Reflect.deleteProperty(target, key);
    if (result2 && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result2;
  }
  has(target, key) {
    const result2 = Reflect.has(target, key);
    if (!isSymbol$1(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result2;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly2 = false, isShallow2 = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap2 = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap2(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap2(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has$1(key, isReadonly2 = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly2) {
    if (hasChanged(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size$1(target, isReadonly2 = false) {
  target = target["__v_raw"];
  !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add$2(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set$1(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged(value, oldValue)) {
    trigger(target, "set", key, value);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  }
  get2 ? get2.call(target, key) : void 0;
  const result2 = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0);
  }
  return result2;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const result2 = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0);
  }
  return result2;
}
function createForEach(isReadonly2, isShallow2) {
  return function forEach2(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap2 = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap2(value), wrap2(key), observed);
    });
  };
}
function createIterableMethod(method2, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap$2(rawTarget);
    const isPair = method2 === "entries" || method2 === Symbol.iterator && targetIsMap;
    const isKeyOnly = method2 === "keys" && targetIsMap;
    const innerIterator = target[method2](...args);
    const wrap2 = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap2(value[0]), wrap2(value[1])] : wrap2(value),
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
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size$1(this);
    },
    has: has$1,
    add: add$2,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size$1(this);
    },
    has: has$1,
    add: add$2,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size$1(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size$1(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method2) => {
    mutableInstrumentations2[method2] = createIterableMethod(
      method2,
      false,
      false
    );
    readonlyInstrumentations2[method2] = createIterableMethod(
      method2,
      true,
      false
    );
    shallowInstrumentations2[method2] = createIterableMethod(
      method2,
      false,
      true
    );
    shallowReadonlyInstrumentations2[method2] = createIterableMethod(
      method2,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  if (Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly2, isSSR) {
    this.getter = getter;
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => triggerRefValue(
        this,
        this.effect._dirtyLevel === 2 ? 2 : 3
      )
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly2;
  }
  get value() {
    const self2 = toRaw(this);
    if ((!self2._cacheable || self2.effect.dirty) && hasChanged(self2._value, self2._value = self2.effect.run())) {
      triggerRefValue(self2, 4);
    }
    trackRefValue(self2);
    if (self2.effect._dirtyLevel >= 2) {
      triggerRefValue(self2, 2);
    }
    return self2._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v) {
    this.effect.dirty = v;
  }
  // #endregion
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction$1(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  return cRef;
}
function trackRefValue(ref2) {
  var _a;
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
      activeEffect,
      (_a = ref2.dep) != null ? _a : ref2.dep = createDep(
        () => ref2.dep = void 0,
        ref2 instanceof ComputedRefImpl ? ref2 : void 0
      )
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 4, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel
    );
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  return createRef(value, false);
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
    this.dep = void 0;
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
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 4);
    }
  }
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
/**
* @vue/runtime-core v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
function warn$1(msg, ...args) {
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last2 = normalizedStack[0];
    if (last2 && last2.vnode === currentVNode) {
      last2.recurseCount++;
    } else {
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
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys2 = Object.keys(props);
  keys2.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys2.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString$1(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction$1(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$1(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  const values2 = [];
  for (let i = 0; i < fn.length; i++) {
    values2.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
  }
  return values2;
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
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
    const appErrorHandler = instance.appContext.config.errorHandler;
    if (appErrorHandler) {
      callWithErrorHandling(
        appErrorHandler,
        null,
        10,
        [err, exposedInstance, errorInfo]
      );
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
  {
    console.error(err);
  }
}
let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.pre) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!queue.length || !queue.includes(
    job,
    isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
  )) {
    if (job.id == null) {
      queue.push(job);
    } else {
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
  if (!isArray$1(cb)) {
    if (!activePostFlushCbs || !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
    )) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = isFlushing ? flushIndex + 1 : 0) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      if (instance && cb.id !== instance.uid) {
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
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
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
  queue.sort(comparator);
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && job.active !== false) {
        if (false)
          ;
        callWithErrorHandling(job, null, 14);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
    isFlushing = false;
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted)
    return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modelArg = isModelListener2 && event.slice(7);
  if (modelArg && modelArg in props) {
    const modifiersKey = `${modelArg === "modelValue" ? "model" : modelArg}Modifiers`;
    const { number: number2, trim: trim2 } = props[modifiersKey] || EMPTY_OBJ;
    if (trim2) {
      args = rawArgs.map((a) => isString$1(a) ? a.trim() : a);
    }
    if (number2) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend$1(normalized, normalizedFromExtend);
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
    if (isObject$1(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend$1(normalized, raw);
  }
  if (isObject$1(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function pushScopeId(id) {
  currentScopeId = id;
}
function popScopeId() {
  currentScopeId = null;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx)
    return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    props,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  let result2;
  let fallthroughAttrs;
  const prev = setCurrentRenderingInstance(instance);
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result2 = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false)
        ;
      result2 = normalizeVNode(
        render2.length > 1 ? render2(
          props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return attrs;
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          props,
          null
          /* we know it doesn't need it */
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result2 = createVNode(Comment);
  }
  let root2 = result2;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys2 = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root2;
    if (keys2.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys2.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root2 = cloneVNode(root2, fallthroughAttrs);
      }
    }
  }
  if (vnode.dirs) {
    root2 = cloneVNode(root2);
    root2.dirs = root2.dirs ? root2.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    root2.transition = vnode.transition;
  }
  {
    result2 = root2;
  }
  setCurrentRenderingInstance(prev);
  return result2;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (nextProps[key] !== prevProps[key] && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
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
    if (nextProps[key] !== prevProps[key] && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function updateHOCHostEl({ vnode, parent: parent2 }, el) {
  while (parent2) {
    const root2 = parent2.subTree;
    if (root2.suspense && root2.suspense.activeBranch === vnode) {
      root2.el = vnode.el;
    }
    if (root2 === vnode) {
      (vnode = parent2.vnode).el = el;
      parent2 = parent2.parent;
    } else {
      break;
    }
  }
}
const NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const ssrContextKey = Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
const INITIAL_WATCHER_VALUE = {};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, {
  immediate,
  deep,
  flush,
  once: once2,
  onTrack,
  onTrigger
} = EMPTY_OBJ) {
  if (cb && once2) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      unwatch();
    };
  }
  const instance = currentInstance;
  const reactiveGetter = (source2) => deep === true ? source2 : (
    // for deep: false, only traverse root-level properties
    traverse(source2, deep === false ? 1 : void 0)
  );
  let getter;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction$1(s)) {
        return callWithErrorHandling(s, instance, 2);
      } else
        ;
    });
  } else if (isFunction$1(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2);
    } else {
      getter = () => {
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(
          source,
          instance,
          3,
          [onCleanup]
        );
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }
  let cleanup;
  let onCleanup = (fn) => {
    cleanup = effect2.onStop = () => {
      callWithErrorHandling(fn, instance, 4);
      cleanup = effect2.onStop = void 0;
    };
  };
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    onCleanup = NOOP;
    if (!cb) {
      getter();
    } else if (immediate) {
      callWithAsyncErrorHandling(cb, instance, 3, [
        getter(),
        isMultiSource ? [] : void 0,
        onCleanup
      ]);
    }
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else {
      return NOOP;
    }
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!effect2.active || !effect2.dirty) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue)) || false) {
        if (cleanup) {
          cleanup();
        }
        callWithAsyncErrorHandling(cb, instance, 3, [
          newValue,
          // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
          onCleanup
        ]);
        oldValue = newValue;
      }
    } else {
      effect2.run();
    }
  };
  job.allowRecurse = !!cb;
  let scheduler;
  if (flush === "sync") {
    scheduler = job;
  } else if (flush === "post") {
    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
  } else {
    job.pre = true;
    if (instance)
      job.id = instance.uid;
    scheduler = () => queueJob(job);
  }
  const effect2 = new ReactiveEffect(getter, NOOP, scheduler);
  const scope = getCurrentScope();
  const unwatch = () => {
    effect2.stop();
    if (scope) {
      remove$1(scope.effects, effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect2.run();
    }
  } else if (flush === "post") {
    queuePostRenderEffect(
      effect2.run.bind(effect2),
      instance && instance.suspense
    );
  } else {
    effect2.run();
  }
  if (ssrCleanup)
    ssrCleanup.push(unwatch);
  return unwatch;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString$1(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$1(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
function traverse(value, depth, currentDepth = 0, seen) {
  if (!isObject$1(value) || value["__v_skip"]) {
    return value;
  }
  if (depth && depth > 0) {
    if (currentDepth >= depth) {
      return value;
    }
    currentDepth++;
  }
  seen = seen || /* @__PURE__ */ new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, depth, currentDepth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, currentDepth, seen);
    }
  } else if (isSet$2(value) || isMap$2(value)) {
    value.forEach((v) => {
      traverse(v, depth, currentDepth, seen);
    });
  } else if (isPlainObject$1(value)) {
    for (const key in value) {
      traverse(value[key], depth, currentDepth, seen);
    }
  }
  return value;
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
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction$1(options) ? (
    // #8326: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend$1({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
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
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove$1(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      if (target.isUnmounted) {
        return;
      }
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => (
  // post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
  (!isInSSRComponentSetup || lifecycle === "sp") && injectHook(lifecycle, (...args) => hook(...args), target)
);
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook("bu");
const onUpdated = createHook("u");
const onBeforeUnmount = createHook("bum");
const onUnmounted = createHook("um");
const onServerPrefetch = createHook("sp");
const onRenderTriggered = createHook(
  "rtg"
);
const onRenderTracked = createHook(
  "rtc"
);
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache && cache[index];
  if (isArray$1(source) || isString$1(source)) {
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(source[i], i, void 0, cached && cached[i]);
    }
  } else if (typeof source === "number") {
    ret = new Array(source);
    for (let i = 0; i < source; i++) {
      ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
    }
  } else if (isObject$1(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached && cached[i])
      );
    } else {
      const keys2 = Object.keys(source);
      ret = new Array(keys2.length);
      for (let i = 0, l = keys2.length; i < l; i++) {
        const key = keys2[i];
        ret[i] = renderItem(source[key], key, i, cached && cached[i]);
      }
    }
  } else {
    ret = [];
  }
  if (cache) {
    cache[index] = ret;
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i)
    return null;
  if (isStatefulComponent(i))
    return getExposeProxy(i) || i.proxy;
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend$1(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      i.effect.dirty = true;
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    let normalizedProps;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (
        // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)
      ) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance, "get", key);
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else
      ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, propsOptions }
  }, key) {
    let normalizedProps;
    return !!accessCache[key] || data !== EMPTY_OBJ && hasOwn(data, key) || hasSetupBinding(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$1(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$1(data))
      ;
    else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
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
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components)
    instance.components = components;
  if (directives)
    instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$1(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  const getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString$1(raw)) {
    const handler = ctx[raw];
    if (isFunction$1(handler)) {
      watch(getter, handler);
    }
  } else if (isFunction$1(raw)) {
    watch(getter, raw.bind(publicThis));
  } else if (isObject$1(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$1(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else
    ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$1(base)) {
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
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose")
      ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
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
    return extend$1(
      isFunction$1(to) ? to.call(this, this) : to,
      isFunction$1(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
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
  return to ? extend$1(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend$1(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to)
    return from;
  if (!from)
    return to;
  const merged = extend$1(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$1(rootComponent)) {
      rootComponent = extend$1({}, rootComponent);
    }
    if (rootProps != null && !isObject$1(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    let isMounted = false;
    const app = context.app = {
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
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin))
          ;
        else if (plugin && isFunction$1(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction$1(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else
          ;
        return app;
      },
      mixin(mixin2) {
        {
          if (!context.mixins.includes(mixin2)) {
            context.mixins.push(mixin2);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      },
      unmount() {
        if (isMounted) {
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
function provide(key, value) {
  if (!currentInstance)
    ;
  else {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;
  if (instance || currentApp) {
    const provides = instance ? instance.parent == null ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : currentApp._context.provides;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else
      ;
  }
}
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = {};
  def(attrs, InternalObjectKey, 1);
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance, "set", "$attrs");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction$1(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
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
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys2] = normalizePropsOptions(raw2, appContext, true);
      extend$1(normalized, props);
      if (keys2)
        needCastKeys.push(...keys2);
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
    if (isObject$1(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction$1(opt) ? { type: opt } : extend$1({}, opt);
        if (prop) {
          const booleanIndex = getTypeIndex(Boolean, prop.type);
          const stringIndex = getTypeIndex(String, prop.type);
          prop[
            0
            /* shouldCast */
          ] = booleanIndex > -1;
          prop[
            1
            /* shouldCastTrue */
          ] = stringIndex < 0 || booleanIndex < stringIndex;
          if (booleanIndex > -1 || hasOwn(prop, "default")) {
            needCastKeys.push(normalizedKey);
          }
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$1(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
function getType(ctor) {
  if (ctor === null) {
    return "null";
  }
  if (typeof ctor === "function") {
    return ctor.name || "";
  } else if (typeof ctor === "object") {
    const name = ctor.constructor && ctor.constructor.name;
    return name || "";
  }
  return "";
}
function isSameType(a, b) {
  return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
  if (isArray$1(expectedTypes)) {
    return expectedTypes.findIndex((t) => isSameType(t, type));
  } else if (isFunction$1(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }
  return -1;
}
const isInternalKey = (key) => key[0] === "_" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false)
      ;
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
    if (isFunction$1(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      instance.slots = toRaw(children);
      def(children, "_", type);
    } else {
      normalizeObjectSlots(
        children,
        instance.slots = {}
      );
    }
  } else {
    instance.slots = {};
    if (children) {
      normalizeVNodeSlots(instance, children);
    }
  }
  def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        extend$1(slots, children);
        if (!optimized && type === 1) {
          delete slots._;
        }
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getExposeProxy(vnode.component) || vnode.component.proxy : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  if (oldRef != null && oldRef !== ref3) {
    if (isString$1(oldRef)) {
      refs[oldRef] = null;
      if (hasOwn(setupState, oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      oldRef.value = null;
    }
  }
  if (isFunction$1(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString$1(ref3);
    const _isRef = isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? hasOwn(setupState, ref3) ? setupState[ref3] : refs[ref3] : ref3.value;
          if (isUnmount) {
            isArray$1(existing) && remove$1(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (hasOwn(setupState, ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                ref3.value = [refValue];
                if (rawRef.k)
                  refs[rawRef.k] = ref3.value;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (hasOwn(setupState, ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          ref3.value = value;
          if (rawRef.k)
            refs[rawRef.k] = value;
        } else
          ;
      };
      if (value) {
        doSet.id = -1;
        queuePostRenderEffect(doSet, parentSuspense);
      } else {
        doSet();
      }
    }
  }
}
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text$2:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else
          ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
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
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      patchElement(
        n1,
        n2,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(
            el,
            key,
            null,
            props[key],
            namespace,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        needCallTransitionHooks && transition.enter(el);
        dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
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
      if (vnode === subTree) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(
          el,
          n2,
          oldProps,
          newProps,
          parentComponent,
          parentSuspense,
          namespace
        );
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(
                el,
                key,
                prev,
                next,
                namespace,
                n1.children,
                parentComponent,
                parentSuspense,
                unmountChildren
              );
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(
        el,
        n2,
        oldProps,
        newProps,
        parentComponent,
        parentSuspense,
        namespace
      );
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              vnode.children,
              parentComponent,
              parentSuspense,
              unmountChildren
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key))
          continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(
            el,
            key,
            prev,
            next,
            namespace,
            vnode.children,
            parentComponent,
            parentSuspense,
            unmountChildren
          );
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        invalidateJob(instance.update);
        instance.effect.dirty = true;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent: parent2 } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent2, initialVNode);
        }
        toggleRecurse(instance, true);
        if (el && hydrateNode) {
          const hydrateSubTree = () => {
            instance.subTree = renderComponentRoot(instance);
            hydrateNode(
              el,
              instance.subTree,
              instance,
              parentSuspense,
              null
            );
          };
          if (isAsyncWrapperVNode) {
            initialVNode.type.__asyncLoader().then(
              // note: we are moving the render call into an async callback,
              // which means it won't track dependencies - but it's ok because
              // a server-rendered async wrapper is already in resolved state
              // and it will never need to change.
              () => !instance.isUnmounted && hydrateSubTree()
            );
          } else {
            hydrateSubTree();
          }
        } else {
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent2, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent2 && isAsyncWrapper(parent2.vnode) && parent2.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent: parent2, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              if (!instance.isUnmounted) {
                componentUpdateFn();
              }
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent2, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent2, next, vnode),
            parentSuspense
          );
        }
      }
    };
    const effect2 = instance.effect = new ReactiveEffect(
      componentUpdateFn,
      NOOP,
      () => queueJob(update2),
      instance.scope
      // track it in component's effect scope
    );
    const update2 = instance.update = () => {
      if (effect2.dirty) {
        effect2.run();
      }
    };
    update2.id = instance.uid;
    toggleRecurse(instance, true);
    update2();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++)
        newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
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
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => hostInsert(el, container, anchor);
        const performLeave = () => {
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs
    } = vnode;
    if (ref3 != null) {
      setRef(ref3, null, parentSuspense, vnode, true);
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          optimized,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
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
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, update: update2, subTree, um } = instance;
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (update2) {
      update2.active = false;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (parentSuspense && parentSuspense.pendingBranch && !parentSuspense.isUnmounted && instance.asyncDep && !instance.asyncResolved && instance.suspenseId === parentSuspense.pendingId) {
      parentSuspense.deps--;
      if (parentSuspense.deps === 0) {
        parentSuspense.resolve();
      }
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    return hostNextSibling(vnode.anchor || vnode.el);
  };
  let isFlushing2 = false;
  const render = (vnode, container, namespace) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    if (!isFlushing2) {
      isFlushing2 = true;
      flushPreFlushCbs();
      flushPostFlushCbs();
      isFlushing2 = false;
    }
    container._vnode = vnode;
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
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
    [hydrate, hydrateNode] = createHydrationFns(
      internals
    );
  }
  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, update: update2 }, allowed) {
  effect2.allowRecurse = update2.allowRecurse = allowed;
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text$2) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result2 = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result2[result2.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result2.push(i);
        continue;
      }
      u = 0;
      v = result2.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result2[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result2[u]]) {
        if (u > 0) {
          p2[i] = result2[u - 1];
        }
        result2[u] = i;
      }
    }
  }
  u = result2.length;
  v = result2[u - 1];
  while (u-- > 0) {
    result2[u] = v;
    v = p2[v];
  }
  return result2;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
const isTeleport = (type) => type.__isTeleport;
const Fragment = Symbol.for("v-fgt");
const Text$2 = Symbol.for("v-txt");
const Comment = Symbol.for("v-cmt");
const Static = Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value) {
  isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString$1(ref3) || isRef(ref3) || isFunction$1(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
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
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString$1(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag |= -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString$1(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$1(style)) {
      if (isProxy(style) && !isArray$1(style)) {
        style = extend$1({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString$1(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$1(type) ? 4 : isFunction$1(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props)
    return null;
  return isProxy(props) || InternalObjectKey in props ? extend$1({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
  const { props, ref: ref3, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray$1(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
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
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text$2, null, text, flag);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (typeof child === "object") {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text$2, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !(InternalObjectKey in children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction$1(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
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
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent2, suspense) {
  const type = vnode.type;
  const appContext = (parent2 ? parent2.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent: parent2,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent2 ? parent2.provides : Object.create(appContext.provides),
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
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    attrsProxy: null,
    slotsProxy: null,
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
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent2 ? parent2.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key]))
      setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1)
        setters.forEach((set2) => set2(v));
      else
        setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
  const { setup } = Component;
  if (setup) {
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    pauseTracking();
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    resetTracking();
    reset();
    if (isPromise(setupResult)) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, isSSR);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult, isSSR);
    }
  } else {
    finishComponentSetup(instance, isSSR);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$1(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$1(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else
    ;
  finishComponentSetup(instance, isSSR);
}
let compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    if (!isSSR && compile && !Component.render) {
      const template2 = Component.template || resolveMergedOptions(instance).template;
      if (template2) {
        const { isCustomElement, compilerOptions } = instance.appContext.config;
        const { delimiters, compilerOptions: componentCompilerOptions } = Component;
        const finalCompilerOptions = extend$1(
          extend$1(
            {
              isCustomElement,
              delimiters
            },
            compilerOptions
          ),
          componentCompilerOptions
        );
        Component.render = compile(template2, finalCompilerOptions);
      }
    }
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
function getAttrsProxy(instance) {
  return instance.attrsProxy || (instance.attrsProxy = new Proxy(
    instance.attrs,
    {
      get(target, key) {
        track(instance, "get", "$attrs");
        return target[key];
      }
    }
  ));
}
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      get attrs() {
        return getAttrsProxy(instance);
      },
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getExposeProxy(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction$1(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance && instance.parent) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(
      instance.components || instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction$1(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
const version = "3.4.21";
/**
* @vue/runtime-dom v3.4.21
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent2, anchor) => {
    parent2.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent2 = child.parentNode;
    if (parent2) {
      parent2.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : doc.createElement(tag, is ? { is } : void 0);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent2, anchor, namespace, start, end) {
    const before2 = anchor ? anchor.previousSibling : parent2.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent2.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling))
          break;
      }
    } else {
      templateContainer.innerHTML = namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content;
      const template2 = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template2.firstChild;
        while (wrapper.firstChild) {
          template2.appendChild(wrapper.firstChild);
        }
        template2.removeChild(wrapper);
      }
      parent2.insertBefore(template2, anchor);
    }
    return [
      // first
      before2 ? before2.nextSibling : parent2.firstChild,
      // last
      anchor ? anchor.previousSibling : parent2.lastChild
    ];
  }
};
const vtcKey = Symbol("_vtc");
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = Symbol("_vod");
const vShowHidden = Symbol("_vsh");
const CSS_VAR_TEXT = Symbol("");
const displayRE = /(^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString$1(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString$1(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      setStyle(style, key, next[key]);
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray$1(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null)
      val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize$1(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    const isBoolean2 = isSpecialBooleanAttr(key);
    if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, isBoolean2 ? "" : value);
    }
  }
}
function patchDOMProp(el, key, value, prevChildren, parentComponent, parentSuspense, unmountChildren) {
  if (key === "innerHTML" || key === "textContent") {
    if (prevChildren) {
      unmountChildren(prevChildren, parentComponent, parentSuspense);
    }
    el[key] = value == null ? "" : value;
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? "" : value;
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(nextValue, instance);
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      5,
      [e]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$1(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
  } else {
    return value;
  }
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(
      el,
      key,
      nextValue,
      prevChildren,
      parentComponent,
      parentSuspense,
      unmountChildren
    );
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction$1(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString$1(value)) {
    return false;
  }
  return key in el;
}
const rendererOptions = /* @__PURE__ */ extend$1({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container)
      return;
    const component = app._component;
    if (!isFunction$1(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    container.innerHTML = "";
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString$1(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
const _5 = "" + new URL("5-DlwisktN.gif", import.meta.url).href;
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _5
}, Symbol.toStringTag, { value: "Module" }));
const _6 = "" + new URL("6-B8l5Hj32.gif", import.meta.url).href;
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _6
}, Symbol.toStringTag, { value: "Module" }));
const _8 = "" + new URL("8-3BsQFGhw.gif", import.meta.url).href;
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _8
}, Symbol.toStringTag, { value: "Module" }));
const _1 = "" + new URL("1-Cl2u4Kdq.png", import.meta.url).href;
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _1
}, Symbol.toStringTag, { value: "Module" }));
const _2 = "" + new URL("2-CH0HW1_Y.png", import.meta.url).href;
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _2
}, Symbol.toStringTag, { value: "Module" }));
const _3 = "" + new URL("3-8GWLsonp.png", import.meta.url).href;
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _3
}, Symbol.toStringTag, { value: "Module" }));
const _7 = "" + new URL("7-BD3R5AH8.png", import.meta.url).href;
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _7
}, Symbol.toStringTag, { value: "Module" }));
const _9 = "" + new URL("9-B2-LQVrb.png", import.meta.url).href;
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _9
}, Symbol.toStringTag, { value: "Module" }));
const AC_2 = "" + new URL("AC_2-pK72UQE7.svg", import.meta.url).href;
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AC_2
}, Symbol.toStringTag, { value: "Module" }));
const AC_SOURCE = "" + new URL("AC_SOURCE-Y_5fzoab.svg", import.meta.url).href;
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AC_SOURCE
}, Symbol.toStringTag, { value: "Module" }));
const ARCSUPPCOIL = "" + new URL("ARCSUPPCOIL-Bfkdspfk.svg", import.meta.url).href;
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ARCSUPPCOIL
}, Symbol.toStringTag, { value: "Module" }));
const ARRESTER_1 = "" + new URL("ARRESTER_1-HzKhebYn.svg", import.meta.url).href;
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ARRESTER_1
}, Symbol.toStringTag, { value: "Module" }));
const ARRESTER_2 = "" + new URL("ARRESTER_2-C34IlwCz.svg", import.meta.url).href;
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ARRESTER_2
}, Symbol.toStringTag, { value: "Module" }));
const ARRESTER_2_1 = "" + new URL("ARRESTER_2_1-CidfLSWP.svg", import.meta.url).href;
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ARRESTER_2_1
}, Symbol.toStringTag, { value: "Module" }));
const BREAKER_CLOSE = "" + new URL("BREAKER_CLOSE-CJXrBfci.svg", import.meta.url).href;
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BREAKER_CLOSE
}, Symbol.toStringTag, { value: "Module" }));
const BREAKER_OPEN = "" + new URL("BREAKER_OPEN-ChVjQYeO.svg", import.meta.url).href;
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BREAKER_OPEN
}, Symbol.toStringTag, { value: "Module" }));
const CAPACITOR = "" + new URL("CAPACITOR-DTSA_a9P.svg", import.meta.url).href;
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CAPACITOR
}, Symbol.toStringTag, { value: "Module" }));
const CT = "" + new URL("CT-C0tfpd8C.svg", import.meta.url).href;
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CT
}, Symbol.toStringTag, { value: "Module" }));
const CT_1 = "" + new URL("CT_1-s3bOnmeN.svg", import.meta.url).href;
const __vite_glob_0_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CT_1
}, Symbol.toStringTag, { value: "Module" }));
const CT_2 = "" + new URL("CT_2-DhwgUGIn.svg", import.meta.url).href;
const __vite_glob_0_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CT_2
}, Symbol.toStringTag, { value: "Module" }));
const CT_3 = "" + new URL("CT_3-BVONgcKK.svg", import.meta.url).href;
const __vite_glob_0_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CT_3
}, Symbol.toStringTag, { value: "Module" }));
const DDCT = "" + new URL("DDCT-wazhVdcY.svg", import.meta.url).href;
const __vite_glob_0_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DDCT
}, Symbol.toStringTag, { value: "Module" }));
const DELTAWINDING = "" + new URL("DELTAWINDING-pZgHCeoN.svg", import.meta.url).href;
const __vite_glob_0_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DELTAWINDING
}, Symbol.toStringTag, { value: "Module" }));
const EQUIVALENTSOURCE = "" + new URL("EQUIVALENTSOURCE-DvbKd6sh.svg", import.meta.url).href;
const __vite_glob_0_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EQUIVALENTSOURCE
}, Symbol.toStringTag, { value: "Module" }));
const FLANGED_CONNECTION = "" + new URL("FLANGED_CONNECTION-Dg1X9PF_.svg", import.meta.url).href;
const __vite_glob_0_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: FLANGED_CONNECTION
}, Symbol.toStringTag, { value: "Module" }));
const GROUND = "" + new URL("GROUND-Bu2PMPkv.svg", import.meta.url).href;
const __vite_glob_0_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: GROUND
}, Symbol.toStringTag, { value: "Module" }));
const HL = "" + new URL("HL-zbpqwIp5.svg", import.meta.url).href;
const __vite_glob_0_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HL
}, Symbol.toStringTag, { value: "Module" }));
const INDUCTOR = "" + new URL("INDUCTOR-CxZ-rIrZ.svg", import.meta.url).href;
const __vite_glob_0_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: INDUCTOR
}, Symbol.toStringTag, { value: "Module" }));
const IRONCOREGAPINDUCTOR = "" + new URL("IRONCOREGAPINDUCTOR-ihAG4qof.svg", import.meta.url).href;
const __vite_glob_0_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IRONCOREGAPINDUCTOR
}, Symbol.toStringTag, { value: "Module" }));
const IRONCOREINDUCTOR = "" + new URL("IRONCOREINDUCTOR-B2KGzN2Z.svg", import.meta.url).href;
const __vite_glob_0_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IRONCOREINDUCTOR
}, Symbol.toStringTag, { value: "Module" }));
const IRONCOREVARINDUCTOR = "" + new URL("IRONCOREVARINDUCTOR-CUY7FzpP.svg", import.meta.url).href;
const __vite_glob_0_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IRONCOREVARINDUCTOR
}, Symbol.toStringTag, { value: "Module" }));
const LOAD = "" + new URL("LOAD-C3oHUIkd.svg", import.meta.url).href;
const __vite_glob_0_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LOAD
}, Symbol.toStringTag, { value: "Module" }));
const MEMRISTOR_1 = "" + new URL("MEMRISTOR_1-Bt5cHA8l.svg", import.meta.url).href;
const __vite_glob_0_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MEMRISTOR_1
}, Symbol.toStringTag, { value: "Module" }));
const MULTIPLIER = "" + new URL("MULTIPLIER-D7dau728.svg", import.meta.url).href;
const __vite_glob_0_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MULTIPLIER
}, Symbol.toStringTag, { value: "Module" }));
const POTENTIAL_TRANSFORMER_2 = "" + new URL("POTENTIAL_TRANSFORMER_2-BFxrHu6c.svg", import.meta.url).href;
const __vite_glob_0_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: POTENTIAL_TRANSFORMER_2
}, Symbol.toStringTag, { value: "Module" }));
const POT_TRANS_3_WINDINGS = "" + new URL("POT_TRANS_3_WINDINGS-02ZJjvrl.svg", import.meta.url).href;
const __vite_glob_0_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: POT_TRANS_3_WINDINGS
}, Symbol.toStringTag, { value: "Module" }));
const PROTECT_GROUND = "" + new URL("PROTECT_GROUND-BxdJCuMe.svg", import.meta.url).href;
const __vite_glob_0_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PROTECT_GROUND
}, Symbol.toStringTag, { value: "Module" }));
const PT = "" + new URL("PT-Dho8qUhc.svg", import.meta.url).href;
const __vite_glob_0_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PT
}, Symbol.toStringTag, { value: "Module" }));
const PT_1 = "" + new URL("PT_1-RBaRySGc.svg", import.meta.url).href;
const __vite_glob_0_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PT_1
}, Symbol.toStringTag, { value: "Module" }));
const REACTOR = "" + new URL("REACTOR-CpyFiKpE.svg", import.meta.url).href;
const __vite_glob_0_39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: REACTOR
}, Symbol.toStringTag, { value: "Module" }));
const REGUINDUCTOR = "" + new URL("REGUINDUCTOR-D0zycoy6.svg", import.meta.url).href;
const __vite_glob_0_40 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: REGUINDUCTOR
}, Symbol.toStringTag, { value: "Module" }));
const REGYCAPACITOR = "" + new URL("REGYCAPACITOR-8eNrGxjZ.svg", import.meta.url).href;
const __vite_glob_0_41 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: REGYCAPACITOR
}, Symbol.toStringTag, { value: "Module" }));
const SERIES_CAPACITOR = "" + new URL("SERIES_CAPACITOR-DugIkY4o.svg", import.meta.url).href;
const __vite_glob_0_42 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SERIES_CAPACITOR
}, Symbol.toStringTag, { value: "Module" }));
const SHUNT_REACTOR = "" + new URL("SHUNT_REACTOR-CHajtiqi.svg", import.meta.url).href;
const __vite_glob_0_43 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SHUNT_REACTOR
}, Symbol.toStringTag, { value: "Module" }));
const SHUNT_REACTOR_1 = "" + new URL("SHUNT_REACTOR_1-DVwJ6XW9.svg", import.meta.url).href;
const __vite_glob_0_44 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SHUNT_REACTOR_1
}, Symbol.toStringTag, { value: "Module" }));
const SIX_CIRCLE = "" + new URL("SIX_CIRCLE-BfQksstu.svg", import.meta.url).href;
const __vite_glob_0_45 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SIX_CIRCLE
}, Symbol.toStringTag, { value: "Module" }));
const ST = "" + new URL("ST-Cc6YEfm7.svg", import.meta.url).href;
const __vite_glob_0_46 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ST
}, Symbol.toStringTag, { value: "Module" }));
const THERR_CIRCLE = "" + new URL("THERR_CIRCLE-CjRKSBFL.svg", import.meta.url).href;
const __vite_glob_0_47 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: THERR_CIRCLE
}, Symbol.toStringTag, { value: "Module" }));
const WINDING = "" + new URL("WINDING-CcIOFpDI.svg", import.meta.url).href;
const __vite_glob_0_48 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: WINDING
}, Symbol.toStringTag, { value: "Module" }));
const WINDINGX = "" + new URL("WINDINGX-BQHlmC_G.svg", import.meta.url).href;
const __vite_glob_0_49 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: WINDINGX
}, Symbol.toStringTag, { value: "Module" }));
const YWINDING = "" + new URL("YWINDING-BaFwyJig.svg", import.meta.url).href;
const __vite_glob_0_50 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: YWINDING
}, Symbol.toStringTag, { value: "Module" }));
const aCT2xianghu = "" + new URL("a-CT2xianghu-Bnj9Zr-i.svg", import.meta.url).href;
const __vite_glob_0_51 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: aCT2xianghu
}, Symbol.toStringTag, { value: "Module" }));
const aCTsanxiang = "" + new URL("a-CTsanxiang-DElTl_05.svg", import.meta.url).href;
const __vite_glob_0_52 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: aCTsanxiang
}, Symbol.toStringTag, { value: "Module" }));
const combin = "" + new URL("combin-BOmuiMQU.svg", import.meta.url).href;
const __vite_glob_0_53 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: combin
}, Symbol.toStringTag, { value: "Module" }));
const combin2 = "" + new URL("combin2-C3U9kLgP.svg", import.meta.url).href;
const __vite_glob_0_54 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: combin2
}, Symbol.toStringTag, { value: "Module" }));
const combin3 = "" + new URL("combin3-xJ6nDRCP.svg", import.meta.url).href;
const __vite_glob_0_55 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: combin3
}, Symbol.toStringTag, { value: "Module" }));
const combin4 = "" + new URL("combin4-DGCJcrzH.svg", import.meta.url).href;
const __vite_glob_0_56 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: combin4
}, Symbol.toStringTag, { value: "Module" }));
const combin5 = "" + new URL("combin5-whXt350e.svg", import.meta.url).href;
const __vite_glob_0_57 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: combin5
}, Symbol.toStringTag, { value: "Module" }));
const guangfufadian = "" + new URL("guangfufadian-CPs9xbte.svg", import.meta.url).href;
const __vite_glob_0_58 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: guangfufadian
}, Symbol.toStringTag, { value: "Module" }));
const jiedidaozha = "" + new URL("jiedidaozha-Dnrte5gk.svg", import.meta.url).href;
const __vite_glob_0_59 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: jiedidaozha
}, Symbol.toStringTag, { value: "Module" }));
const sukeduanluqi = "" + new URL("sukeduanluqi-Ch7shVos.svg", import.meta.url).href;
const __vite_glob_0_60 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sukeduanluqi
}, Symbol.toStringTag, { value: "Module" }));
const xianshideng = "" + new URL("xianshideng-B-vJPfKd.svg", import.meta.url).href;
const __vite_glob_0_61 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: xianshideng
}, Symbol.toStringTag, { value: "Module" }));
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$s = Object.prototype;
var hasOwnProperty$o = objectProto$s.hasOwnProperty;
var nativeObjectToString$3 = objectProto$s.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$o.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result2 = nativeObjectToString$3.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result2;
}
var objectProto$r = Object.prototype;
var nativeObjectToString$2 = objectProto$r.toString;
function objectToString(value) {
  return nativeObjectToString$2.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag$3 = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$3;
}
var NAN$2 = 0 / 0;
function baseToNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN$2;
  }
  return +value;
}
function arrayMap(array2, iteratee2) {
  var index = -1, length = array2 == null ? 0 : array2.length, result2 = Array(length);
  while (++index < length) {
    result2[index] = iteratee2(array2[index], index, array2);
  }
  return result2;
}
var isArray = Array.isArray;
var INFINITY$5 = 1 / 0;
var symbolProto$2 = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto$2 ? symbolProto$2.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray(value)) {
    return arrayMap(value, baseToString) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result2 = value + "";
  return result2 == "0" && 1 / value == -INFINITY$5 ? "-0" : result2;
}
function createMathOperation(operator, defaultValue) {
  return function(value, other) {
    var result2;
    if (value === void 0 && other === void 0) {
      return defaultValue;
    }
    if (value !== void 0) {
      result2 = value;
    }
    if (other !== void 0) {
      if (result2 === void 0) {
        return other;
      }
      if (typeof value == "string" || typeof other == "string") {
        value = baseToString(value);
        other = baseToString(other);
      } else {
        value = baseToNumber(value);
        other = baseToNumber(other);
      }
      result2 = operator(value, other);
    }
    return result2;
  };
}
var add = createMathOperation(function(augend, addend) {
  return augend + addend;
}, 0);
const add$1 = add;
var reWhitespace = /\s/;
function trimmedEndIndex(string2) {
  var index = string2.length;
  while (index-- && reWhitespace.test(string2.charAt(index))) {
  }
  return index;
}
var reTrimStart$2 = /^\s+/;
function baseTrim(string2) {
  return string2 ? string2.slice(0, trimmedEndIndex(string2) + 1).replace(reTrimStart$2, "") : string2;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var NAN$1 = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN$1;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN$1 : +value;
}
var INFINITY$4 = 1 / 0, MAX_INTEGER = 17976931348623157e292;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY$4 || value === -INFINITY$4) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
function toInteger(value) {
  var result2 = toFinite(value), remainder = result2 % 1;
  return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
}
var FUNC_ERROR_TEXT$b = "Expected a function";
function after(n, func2) {
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$b);
  }
  n = toInteger(n);
  return function() {
    if (--n < 1) {
      return func2.apply(this, arguments);
    }
  };
}
function identity(value) {
  return value;
}
var asyncTag = "[object AsyncFunction]", funcTag$2 = "[object Function]", genTag$1 = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = function() {
  var uid2 = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid2 ? "Symbol(src)_1." + uid2 : "";
}();
function isMasked(func2) {
  return !!maskSrcKey && maskSrcKey in func2;
}
var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource(func2) {
  if (func2 != null) {
    try {
      return funcToString$2.call(func2);
    } catch (e) {
    }
    try {
      return func2 + "";
    } catch (e) {
    }
  }
  return "";
}
var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype, objectProto$q = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$n = objectProto$q.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString$1.call(hasOwnProperty$n).replace(reRegExpChar$1, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object2, key) {
  return object2 == null ? void 0 : object2[key];
}
function getNative(object2, key) {
  var value = getValue(object2, key);
  return baseIsNative(value) ? value : void 0;
}
var WeakMap$1 = getNative(root, "WeakMap");
var metaMap = WeakMap$1 && new WeakMap$1();
var baseSetData = !metaMap ? identity : function(func2, data) {
  metaMap.set(func2, data);
  return func2;
};
var objectCreate = Object.create;
var baseCreate = /* @__PURE__ */ function() {
  function object2() {
  }
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object2.prototype = proto;
    var result2 = new object2();
    object2.prototype = void 0;
    return result2;
  };
}();
function createCtor(Ctor) {
  return function() {
    var args = arguments;
    switch (args.length) {
      case 0:
        return new Ctor();
      case 1:
        return new Ctor(args[0]);
      case 2:
        return new Ctor(args[0], args[1]);
      case 3:
        return new Ctor(args[0], args[1], args[2]);
      case 4:
        return new Ctor(args[0], args[1], args[2], args[3]);
      case 5:
        return new Ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6:
        return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
      case 7:
        return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
    return isObject(result2) ? result2 : thisBinding;
  };
}
var WRAP_BIND_FLAG$8 = 1;
function createBind(func2, bitmask, thisArg) {
  var isBind = bitmask & WRAP_BIND_FLAG$8, Ctor = createCtor(func2);
  function wrapper() {
    var fn = this && this !== root && this instanceof wrapper ? Ctor : func2;
    return fn.apply(isBind ? thisArg : this, arguments);
  }
  return wrapper;
}
function apply(func2, thisArg, args) {
  switch (args.length) {
    case 0:
      return func2.call(thisArg);
    case 1:
      return func2.call(thisArg, args[0]);
    case 2:
      return func2.call(thisArg, args[0], args[1]);
    case 3:
      return func2.call(thisArg, args[0], args[1], args[2]);
  }
  return func2.apply(thisArg, args);
}
var nativeMax$g = Math.max;
function composeArgs(args, partials, holders, isCurried) {
  var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax$g(argsLength - holdersLength, 0), result2 = Array(leftLength + rangeLength), isUncurried = !isCurried;
  while (++leftIndex < leftLength) {
    result2[leftIndex] = partials[leftIndex];
  }
  while (++argsIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result2[holders[argsIndex]] = args[argsIndex];
    }
  }
  while (rangeLength--) {
    result2[leftIndex++] = args[argsIndex++];
  }
  return result2;
}
var nativeMax$f = Math.max;
function composeArgsRight(args, partials, holders, isCurried) {
  var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax$f(argsLength - holdersLength, 0), result2 = Array(rangeLength + rightLength), isUncurried = !isCurried;
  while (++argsIndex < rangeLength) {
    result2[argsIndex] = args[argsIndex];
  }
  var offset = argsIndex;
  while (++rightIndex < rightLength) {
    result2[offset + rightIndex] = partials[rightIndex];
  }
  while (++holdersIndex < holdersLength) {
    if (isUncurried || argsIndex < argsLength) {
      result2[offset + holders[holdersIndex]] = args[argsIndex++];
    }
  }
  return result2;
}
function countHolders(array2, placeholder) {
  var length = array2.length, result2 = 0;
  while (length--) {
    if (array2[length] === placeholder) {
      ++result2;
    }
  }
  return result2;
}
function baseLodash() {
}
var MAX_ARRAY_LENGTH$6 = 4294967295;
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH$6;
  this.__views__ = [];
}
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;
function noop() {
}
var getData = !metaMap ? noop : function(func2) {
  return metaMap.get(func2);
};
var realNames = {};
var objectProto$p = Object.prototype;
var hasOwnProperty$m = objectProto$p.hasOwnProperty;
function getFuncName(func2) {
  var result2 = func2.name + "", array2 = realNames[result2], length = hasOwnProperty$m.call(realNames, result2) ? array2.length : 0;
  while (length--) {
    var data = array2[length], otherFunc = data.func;
    if (otherFunc == null || otherFunc == func2) {
      return data.name;
    }
  }
  return result2;
}
function LodashWrapper(value, chainAll) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__chain__ = !!chainAll;
  this.__index__ = 0;
  this.__values__ = void 0;
}
LodashWrapper.prototype = baseCreate(baseLodash.prototype);
LodashWrapper.prototype.constructor = LodashWrapper;
function copyArray(source, array2) {
  var index = -1, length = source.length;
  array2 || (array2 = Array(length));
  while (++index < length) {
    array2[index] = source[index];
  }
  return array2;
}
function wrapperClone(wrapper) {
  if (wrapper instanceof LazyWrapper) {
    return wrapper.clone();
  }
  var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
  result2.__actions__ = copyArray(wrapper.__actions__);
  result2.__index__ = wrapper.__index__;
  result2.__values__ = wrapper.__values__;
  return result2;
}
var objectProto$o = Object.prototype;
var hasOwnProperty$l = objectProto$o.hasOwnProperty;
function lodash(value) {
  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
    if (value instanceof LodashWrapper) {
      return value;
    }
    if (hasOwnProperty$l.call(value, "__wrapped__")) {
      return wrapperClone(value);
    }
  }
  return new LodashWrapper(value);
}
lodash.prototype = baseLodash.prototype;
lodash.prototype.constructor = lodash;
function isLaziable(func2) {
  var funcName = getFuncName(func2), other = lodash[funcName];
  if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
    return false;
  }
  if (func2 === other) {
    return true;
  }
  var data = getData(other);
  return !!data && func2 === data[0];
}
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func2) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func2.apply(void 0, arguments);
  };
}
var setData = shortOut(baseSetData);
var reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
function getWrapDetails(source) {
  var match = source.match(reWrapDetails);
  return match ? match[1].split(reSplitDetails) : [];
}
var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;
function insertWrapDetails(source, details) {
  var length = details.length;
  if (!length) {
    return source;
  }
  var lastIndex = length - 1;
  details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
  details = details.join(length > 2 ? ", " : " ");
  return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
}
function constant(value) {
  return function() {
    return value;
  };
}
var defineProperty = function() {
  try {
    var func2 = getNative(Object, "defineProperty");
    func2({}, "", {});
    return func2;
  } catch (e) {
  }
}();
var baseSetToString = !defineProperty ? identity : function(func2, string2) {
  return defineProperty(func2, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string2),
    "writable": true
  });
};
const baseSetToString$1 = baseSetToString;
var setToString = shortOut(baseSetToString$1);
function arrayEach(array2, iteratee2) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (iteratee2(array2[index], index, array2) === false) {
      break;
    }
  }
  return array2;
}
function baseFindIndex(array2, predicate, fromIndex, fromRight) {
  var length = array2.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array2[index], index, array2)) {
      return index;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}
function strictIndexOf(array2, value, fromIndex) {
  var index = fromIndex - 1, length = array2.length;
  while (++index < length) {
    if (array2[index] === value) {
      return index;
    }
  }
  return -1;
}
function baseIndexOf(array2, value, fromIndex) {
  return value === value ? strictIndexOf(array2, value, fromIndex) : baseFindIndex(array2, baseIsNaN, fromIndex);
}
function arrayIncludes(array2, value) {
  var length = array2 == null ? 0 : array2.length;
  return !!length && baseIndexOf(array2, value, 0) > -1;
}
var WRAP_BIND_FLAG$7 = 1, WRAP_BIND_KEY_FLAG$6 = 2, WRAP_CURRY_FLAG$6 = 8, WRAP_CURRY_RIGHT_FLAG$3 = 16, WRAP_PARTIAL_FLAG$6 = 32, WRAP_PARTIAL_RIGHT_FLAG$3 = 64, WRAP_ARY_FLAG$4 = 128, WRAP_REARG_FLAG$3 = 256, WRAP_FLIP_FLAG$2 = 512;
var wrapFlags = [
  ["ary", WRAP_ARY_FLAG$4],
  ["bind", WRAP_BIND_FLAG$7],
  ["bindKey", WRAP_BIND_KEY_FLAG$6],
  ["curry", WRAP_CURRY_FLAG$6],
  ["curryRight", WRAP_CURRY_RIGHT_FLAG$3],
  ["flip", WRAP_FLIP_FLAG$2],
  ["partial", WRAP_PARTIAL_FLAG$6],
  ["partialRight", WRAP_PARTIAL_RIGHT_FLAG$3],
  ["rearg", WRAP_REARG_FLAG$3]
];
function updateWrapDetails(details, bitmask) {
  arrayEach(wrapFlags, function(pair) {
    var value = "_." + pair[0];
    if (bitmask & pair[1] && !arrayIncludes(details, value)) {
      details.push(value);
    }
  });
  return details.sort();
}
function setWrapToString(wrapper, reference, bitmask) {
  var source = reference + "";
  return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
}
var WRAP_BIND_FLAG$6 = 1, WRAP_BIND_KEY_FLAG$5 = 2, WRAP_CURRY_BOUND_FLAG$1 = 4, WRAP_CURRY_FLAG$5 = 8, WRAP_PARTIAL_FLAG$5 = 32, WRAP_PARTIAL_RIGHT_FLAG$2 = 64;
function createRecurry(func2, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
  var isCurry = bitmask & WRAP_CURRY_FLAG$5, newHolders = isCurry ? holders : void 0, newHoldersRight = isCurry ? void 0 : holders, newPartials = isCurry ? partials : void 0, newPartialsRight = isCurry ? void 0 : partials;
  bitmask |= isCurry ? WRAP_PARTIAL_FLAG$5 : WRAP_PARTIAL_RIGHT_FLAG$2;
  bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG$2 : WRAP_PARTIAL_FLAG$5);
  if (!(bitmask & WRAP_CURRY_BOUND_FLAG$1)) {
    bitmask &= ~(WRAP_BIND_FLAG$6 | WRAP_BIND_KEY_FLAG$5);
  }
  var newData = [
    func2,
    bitmask,
    thisArg,
    newPartials,
    newHolders,
    newPartialsRight,
    newHoldersRight,
    argPos,
    ary2,
    arity
  ];
  var result2 = wrapFunc.apply(void 0, newData);
  if (isLaziable(func2)) {
    setData(result2, newData);
  }
  result2.placeholder = placeholder;
  return setWrapToString(result2, func2, bitmask);
}
function getHolder(func2) {
  var object2 = func2;
  return object2.placeholder;
}
var MAX_SAFE_INTEGER$6 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$6 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var nativeMin$e = Math.min;
function reorder(array2, indexes) {
  var arrLength = array2.length, length = nativeMin$e(indexes.length, arrLength), oldArray = copyArray(array2);
  while (length--) {
    var index = indexes[length];
    array2[length] = isIndex(index, arrLength) ? oldArray[index] : void 0;
  }
  return array2;
}
var PLACEHOLDER$1 = "__lodash_placeholder__";
function replaceHolders(array2, placeholder) {
  var index = -1, length = array2.length, resIndex = 0, result2 = [];
  while (++index < length) {
    var value = array2[index];
    if (value === placeholder || value === PLACEHOLDER$1) {
      array2[index] = PLACEHOLDER$1;
      result2[resIndex++] = index;
    }
  }
  return result2;
}
var WRAP_BIND_FLAG$5 = 1, WRAP_BIND_KEY_FLAG$4 = 2, WRAP_CURRY_FLAG$4 = 8, WRAP_CURRY_RIGHT_FLAG$2 = 16, WRAP_ARY_FLAG$3 = 128, WRAP_FLIP_FLAG$1 = 512;
function createHybrid(func2, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
  var isAry = bitmask & WRAP_ARY_FLAG$3, isBind = bitmask & WRAP_BIND_FLAG$5, isBindKey = bitmask & WRAP_BIND_KEY_FLAG$4, isCurried = bitmask & (WRAP_CURRY_FLAG$4 | WRAP_CURRY_RIGHT_FLAG$2), isFlip = bitmask & WRAP_FLIP_FLAG$1, Ctor = isBindKey ? void 0 : createCtor(func2);
  function wrapper() {
    var length = arguments.length, args = Array(length), index = length;
    while (index--) {
      args[index] = arguments[index];
    }
    if (isCurried) {
      var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
    }
    if (partials) {
      args = composeArgs(args, partials, holders, isCurried);
    }
    if (partialsRight) {
      args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
    }
    length -= holdersCount;
    if (isCurried && length < arity) {
      var newHolders = replaceHolders(args, placeholder);
      return createRecurry(
        func2,
        bitmask,
        createHybrid,
        wrapper.placeholder,
        thisArg,
        args,
        newHolders,
        argPos,
        ary2,
        arity - length
      );
    }
    var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func2] : func2;
    length = args.length;
    if (argPos) {
      args = reorder(args, argPos);
    } else if (isFlip && length > 1) {
      args.reverse();
    }
    if (isAry && ary2 < length) {
      args.length = ary2;
    }
    if (this && this !== root && this instanceof wrapper) {
      fn = Ctor || createCtor(fn);
    }
    return fn.apply(thisBinding, args);
  }
  return wrapper;
}
function createCurry(func2, bitmask, arity) {
  var Ctor = createCtor(func2);
  function wrapper() {
    var length = arguments.length, args = Array(length), index = length, placeholder = getHolder(wrapper);
    while (index--) {
      args[index] = arguments[index];
    }
    var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
    length -= holders.length;
    if (length < arity) {
      return createRecurry(
        func2,
        bitmask,
        createHybrid,
        wrapper.placeholder,
        void 0,
        args,
        holders,
        void 0,
        void 0,
        arity - length
      );
    }
    var fn = this && this !== root && this instanceof wrapper ? Ctor : func2;
    return apply(fn, this, args);
  }
  return wrapper;
}
var WRAP_BIND_FLAG$4 = 1;
function createPartial(func2, bitmask, thisArg, partials) {
  var isBind = bitmask & WRAP_BIND_FLAG$4, Ctor = createCtor(func2);
  function wrapper() {
    var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func2;
    while (++leftIndex < leftLength) {
      args[leftIndex] = partials[leftIndex];
    }
    while (argsLength--) {
      args[leftIndex++] = arguments[++argsIndex];
    }
    return apply(fn, isBind ? thisArg : this, args);
  }
  return wrapper;
}
var PLACEHOLDER = "__lodash_placeholder__";
var WRAP_BIND_FLAG$3 = 1, WRAP_BIND_KEY_FLAG$3 = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG$3 = 8, WRAP_ARY_FLAG$2 = 128, WRAP_REARG_FLAG$2 = 256;
var nativeMin$d = Math.min;
function mergeData(data, source) {
  var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG$3 | WRAP_BIND_KEY_FLAG$3 | WRAP_ARY_FLAG$2);
  var isCombo = srcBitmask == WRAP_ARY_FLAG$2 && bitmask == WRAP_CURRY_FLAG$3 || srcBitmask == WRAP_ARY_FLAG$2 && bitmask == WRAP_REARG_FLAG$2 && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG$2 | WRAP_REARG_FLAG$2) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG$3;
  if (!(isCommon || isCombo)) {
    return data;
  }
  if (srcBitmask & WRAP_BIND_FLAG$3) {
    data[2] = source[2];
    newBitmask |= bitmask & WRAP_BIND_FLAG$3 ? 0 : WRAP_CURRY_BOUND_FLAG;
  }
  var value = source[3];
  if (value) {
    var partials = data[3];
    data[3] = partials ? composeArgs(partials, value, source[4]) : value;
    data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
  }
  value = source[5];
  if (value) {
    partials = data[5];
    data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
  }
  value = source[7];
  if (value) {
    data[7] = value;
  }
  if (srcBitmask & WRAP_ARY_FLAG$2) {
    data[8] = data[8] == null ? source[8] : nativeMin$d(data[8], source[8]);
  }
  if (data[9] == null) {
    data[9] = source[9];
  }
  data[0] = source[0];
  data[1] = newBitmask;
  return data;
}
var FUNC_ERROR_TEXT$a = "Expected a function";
var WRAP_BIND_FLAG$2 = 1, WRAP_BIND_KEY_FLAG$2 = 2, WRAP_CURRY_FLAG$2 = 8, WRAP_CURRY_RIGHT_FLAG$1 = 16, WRAP_PARTIAL_FLAG$4 = 32, WRAP_PARTIAL_RIGHT_FLAG$1 = 64;
var nativeMax$e = Math.max;
function createWrap(func2, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
  var isBindKey = bitmask & WRAP_BIND_KEY_FLAG$2;
  if (!isBindKey && typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$a);
  }
  var length = partials ? partials.length : 0;
  if (!length) {
    bitmask &= ~(WRAP_PARTIAL_FLAG$4 | WRAP_PARTIAL_RIGHT_FLAG$1);
    partials = holders = void 0;
  }
  ary2 = ary2 === void 0 ? ary2 : nativeMax$e(toInteger(ary2), 0);
  arity = arity === void 0 ? arity : toInteger(arity);
  length -= holders ? holders.length : 0;
  if (bitmask & WRAP_PARTIAL_RIGHT_FLAG$1) {
    var partialsRight = partials, holdersRight = holders;
    partials = holders = void 0;
  }
  var data = isBindKey ? void 0 : getData(func2);
  var newData = [
    func2,
    bitmask,
    thisArg,
    partials,
    holders,
    partialsRight,
    holdersRight,
    argPos,
    ary2,
    arity
  ];
  if (data) {
    mergeData(newData, data);
  }
  func2 = newData[0];
  bitmask = newData[1];
  thisArg = newData[2];
  partials = newData[3];
  holders = newData[4];
  arity = newData[9] = newData[9] === void 0 ? isBindKey ? 0 : func2.length : nativeMax$e(newData[9] - length, 0);
  if (!arity && bitmask & (WRAP_CURRY_FLAG$2 | WRAP_CURRY_RIGHT_FLAG$1)) {
    bitmask &= ~(WRAP_CURRY_FLAG$2 | WRAP_CURRY_RIGHT_FLAG$1);
  }
  if (!bitmask || bitmask == WRAP_BIND_FLAG$2) {
    var result2 = createBind(func2, bitmask, thisArg);
  } else if (bitmask == WRAP_CURRY_FLAG$2 || bitmask == WRAP_CURRY_RIGHT_FLAG$1) {
    result2 = createCurry(func2, bitmask, arity);
  } else if ((bitmask == WRAP_PARTIAL_FLAG$4 || bitmask == (WRAP_BIND_FLAG$2 | WRAP_PARTIAL_FLAG$4)) && !holders.length) {
    result2 = createPartial(func2, bitmask, thisArg, partials);
  } else {
    result2 = createHybrid.apply(void 0, newData);
  }
  var setter = data ? baseSetData : setData;
  return setWrapToString(setter(result2, newData), func2, bitmask);
}
var WRAP_ARY_FLAG$1 = 128;
function ary(func2, n, guard) {
  n = guard ? void 0 : n;
  n = func2 && n == null ? func2.length : n;
  return createWrap(func2, WRAP_ARY_FLAG$1, void 0, void 0, void 0, void 0, n);
}
function baseAssignValue(object2, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object2, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object2[key] = value;
  }
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var objectProto$n = Object.prototype;
var hasOwnProperty$k = objectProto$n.hasOwnProperty;
function assignValue(object2, key, value) {
  var objValue = object2[key];
  if (!(hasOwnProperty$k.call(object2, key) && eq(objValue, value)) || value === void 0 && !(key in object2)) {
    baseAssignValue(object2, key, value);
  }
}
function copyObject(source, props, object2, customizer) {
  var isNew = !object2;
  object2 || (object2 = {});
  var index = -1, length = props.length;
  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object2[key], source[key], key, object2, source) : void 0;
    if (newValue === void 0) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object2, key, newValue);
    } else {
      assignValue(object2, key, newValue);
    }
  }
  return object2;
}
var nativeMax$d = Math.max;
function overRest(func2, start, transform2) {
  start = nativeMax$d(start === void 0 ? func2.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax$d(args.length - start, 0), array2 = Array(length);
    while (++index < length) {
      array2[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform2(array2);
    return apply(func2, this, otherArgs);
  };
}
function baseRest(func2, start) {
  return setToString(overRest(func2, start, identity), func2 + "");
}
var MAX_SAFE_INTEGER$5 = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$5;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
function isIterateeCall(value, index, object2) {
  if (!isObject(object2)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike(object2) && isIndex(index, object2.length) : type == "string" && index in object2) {
    return eq(object2[index], value);
  }
  return false;
}
function createAssigner(assigner) {
  return baseRest(function(object2, sources) {
    var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
    customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? void 0 : customizer;
      length = 1;
    }
    object2 = Object(object2);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object2, source, index, customizer);
      }
    }
    return object2;
  });
}
var objectProto$m = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$m;
  return value === proto;
}
function baseTimes(n, iteratee2) {
  var index = -1, result2 = Array(n);
  while (++index < n) {
    result2[index] = iteratee2(index);
  }
  return result2;
}
var argsTag$3 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$3;
}
var objectProto$l = Object.prototype;
var hasOwnProperty$j = objectProto$l.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$l.propertyIsEnumerable;
var isArguments = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$j.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
const isArguments$1 = isArguments;
function stubFalse() {
  return false;
}
var freeExports$2 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$2 = freeExports$2 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;
var Buffer$1 = moduleExports$2 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
const isBuffer$1 = isBuffer;
var argsTag$2 = "[object Arguments]", arrayTag$2 = "[object Array]", boolTag$4 = "[object Boolean]", dateTag$4 = "[object Date]", errorTag$3 = "[object Error]", funcTag$1 = "[object Function]", mapTag$9 = "[object Map]", numberTag$4 = "[object Number]", objectTag$4 = "[object Object]", regexpTag$4 = "[object RegExp]", setTag$9 = "[object Set]", stringTag$4 = "[object String]", weakMapTag$3 = "[object WeakMap]";
var arrayBufferTag$4 = "[object ArrayBuffer]", dataViewTag$4 = "[object DataView]", float32Tag$2 = "[object Float32Array]", float64Tag$2 = "[object Float64Array]", int8Tag$2 = "[object Int8Array]", int16Tag$2 = "[object Int16Array]", int32Tag$2 = "[object Int32Array]", uint8Tag$2 = "[object Uint8Array]", uint8ClampedTag$2 = "[object Uint8ClampedArray]", uint16Tag$2 = "[object Uint16Array]", uint32Tag$2 = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] = typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] = typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] = typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] = typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$2] = typedArrayTags[arrayBufferTag$4] = typedArrayTags[boolTag$4] = typedArrayTags[dataViewTag$4] = typedArrayTags[dateTag$4] = typedArrayTags[errorTag$3] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$9] = typedArrayTags[numberTag$4] = typedArrayTags[objectTag$4] = typedArrayTags[regexpTag$4] = typedArrayTags[setTag$9] = typedArrayTags[stringTag$4] = typedArrayTags[weakMapTag$3] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseUnary(func2) {
  return function(value) {
    return func2(value);
  };
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var freeProcess = moduleExports$1 && freeGlobal.process;
var nodeUtil = function() {
  try {
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
const isTypedArray$1 = isTypedArray;
var objectProto$k = Object.prototype;
var hasOwnProperty$i = objectProto$k.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value), isArg = !isArr && isArguments$1(value), isBuff = !isArr && !isArg && isBuffer$1(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String) : [], length = result2.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$i.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex(key, length)))) {
      result2.push(key);
    }
  }
  return result2;
}
function overArg(func2, transform2) {
  return function(arg) {
    return func2(transform2(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$j = Object.prototype;
var hasOwnProperty$h = objectProto$j.hasOwnProperty;
function baseKeys(object2) {
  if (!isPrototype(object2)) {
    return nativeKeys(object2);
  }
  var result2 = [];
  for (var key in Object(object2)) {
    if (hasOwnProperty$h.call(object2, key) && key != "constructor") {
      result2.push(key);
    }
  }
  return result2;
}
function keys(object2) {
  return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
}
var objectProto$i = Object.prototype;
var hasOwnProperty$g = objectProto$i.hasOwnProperty;
var assign = createAssigner(function(object2, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object2);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty$g.call(source, key)) {
      assignValue(object2, key, source[key]);
    }
  }
});
const assign$1 = assign;
function nativeKeysIn(object2) {
  var result2 = [];
  if (object2 != null) {
    for (var key in Object(object2)) {
      result2.push(key);
    }
  }
  return result2;
}
var objectProto$h = Object.prototype;
var hasOwnProperty$f = objectProto$h.hasOwnProperty;
function baseKeysIn(object2) {
  if (!isObject(object2)) {
    return nativeKeysIn(object2);
  }
  var isProto = isPrototype(object2), result2 = [];
  for (var key in object2) {
    if (!(key == "constructor" && (isProto || !hasOwnProperty$f.call(object2, key)))) {
      result2.push(key);
    }
  }
  return result2;
}
function keysIn(object2) {
  return isArrayLike(object2) ? arrayLikeKeys(object2, true) : baseKeysIn(object2);
}
var assignIn = createAssigner(function(object2, source) {
  copyObject(source, keysIn(source), object2);
});
const extend = assignIn;
var assignInWith = createAssigner(function(object2, source, srcIndex, customizer) {
  copyObject(source, keysIn(source), object2, customizer);
});
const extendWith = assignInWith;
var assignWith = createAssigner(function(object2, source, srcIndex, customizer) {
  copyObject(source, keys(source), object2, customizer);
});
const assignWith$1 = assignWith;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey(value, object2) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object(object2);
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result2 = this.has(key) && delete this.__data__[key];
  this.size -= result2 ? 1 : 0;
  return result2;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$g = Object.prototype;
var hasOwnProperty$e = objectProto$g.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result2 = data[key];
    return result2 === HASH_UNDEFINED$2 ? void 0 : result2;
  }
  return hasOwnProperty$e.call(data, key) ? data[key] : void 0;
}
var objectProto$f = Object.prototype;
var hasOwnProperty$d = objectProto$f.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== void 0 : hasOwnProperty$d.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(array2, key) {
  var length = array2.length;
  while (length--) {
    if (eq(array2[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto$5 = Array.prototype;
var splice$2 = arrayProto$5.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$2.call(data, index, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  return index < 0 ? void 0 : data[index][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map$1 = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$1 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map2, key) {
  var data = map2.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result2 = getMapData(this, key)["delete"](key);
  this.size -= result2 ? 1 : 0;
  return result2;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size2 = data.size;
  data.set(key, value);
  this.size += data.size == size2 ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var FUNC_ERROR_TEXT$9 = "Expected a function";
function memoize(func2, resolver) {
  if (typeof func2 != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$9);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result2 = func2.apply(this, args);
    memoized.cache = cache.set(key, result2) || cache;
    return result2;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func2) {
  var result2 = memoize(func2, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result2.cache;
  return result2;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function(string2) {
  var result2 = [];
  if (string2.charCodeAt(0) === 46) {
    result2.push("");
  }
  string2.replace(rePropName, function(match, number2, quote, subString) {
    result2.push(quote ? subString.replace(reEscapeChar, "$1") : number2 || match);
  });
  return result2;
});
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function castPath(value, object2) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object2) ? [value] : stringToPath(toString(value));
}
var INFINITY$3 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result2 = value + "";
  return result2 == "0" && 1 / value == -INFINITY$3 ? "-0" : result2;
}
function baseGet(object2, path) {
  path = castPath(path, object2);
  var index = 0, length = path.length;
  while (object2 != null && index < length) {
    object2 = object2[toKey(path[index++])];
  }
  return index && index == length ? object2 : void 0;
}
function get(object2, path, defaultValue) {
  var result2 = object2 == null ? void 0 : baseGet(object2, path);
  return result2 === void 0 ? defaultValue : result2;
}
function baseAt(object2, paths) {
  var index = -1, length = paths.length, result2 = Array(length), skip = object2 == null;
  while (++index < length) {
    result2[index] = skip ? void 0 : get(object2, paths[index]);
  }
  return result2;
}
function arrayPush(array2, values2) {
  var index = -1, length = values2.length, offset = array2.length;
  while (++index < length) {
    array2[offset + index] = values2[index];
  }
  return array2;
}
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray(value) || isArguments$1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function baseFlatten(array2, depth, predicate, isStrict, result2) {
  var index = -1, length = array2.length;
  predicate || (predicate = isFlattenable);
  result2 || (result2 = []);
  while (++index < length) {
    var value = array2[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result2);
      } else {
        arrayPush(result2, value);
      }
    } else if (!isStrict) {
      result2[result2.length] = value;
    }
  }
  return result2;
}
function flatten(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? baseFlatten(array2, 1) : [];
}
function flatRest(func2) {
  return setToString(overRest(func2, void 0, flatten), func2 + "");
}
var at$1 = flatRest(baseAt);
const at$2 = at$1;
var getPrototype = overArg(Object.getPrototypeOf, Object);
var objectTag$3 = "[object Object]";
var funcProto = Function.prototype, objectProto$e = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$c = objectProto$e.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag$3) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$c.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var domExcTag = "[object DOMException]", errorTag$2 = "[object Error]";
function isError(value) {
  if (!isObjectLike(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == errorTag$2 || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject(value);
}
var attempt = baseRest(function(func2, args) {
  try {
    return apply(func2, void 0, args);
  } catch (e) {
    return isError(e) ? e : new Error(e);
  }
});
const attempt$1 = attempt;
var FUNC_ERROR_TEXT$8 = "Expected a function";
function before(n, func2) {
  var result2;
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$8);
  }
  n = toInteger(n);
  return function() {
    if (--n > 0) {
      result2 = func2.apply(this, arguments);
    }
    if (n <= 1) {
      func2 = void 0;
    }
    return result2;
  };
}
var WRAP_BIND_FLAG$1 = 1, WRAP_PARTIAL_FLAG$3 = 32;
var bind = baseRest(function(func2, thisArg, partials) {
  var bitmask = WRAP_BIND_FLAG$1;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bind));
    bitmask |= WRAP_PARTIAL_FLAG$3;
  }
  return createWrap(func2, bitmask, thisArg, partials, holders);
});
bind.placeholder = {};
const bind$1 = bind;
var bindAll = flatRest(function(object2, methodNames) {
  arrayEach(methodNames, function(key) {
    key = toKey(key);
    baseAssignValue(object2, key, bind$1(object2[key], object2));
  });
  return object2;
});
const bindAll$1 = bindAll;
var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG$1 = 2, WRAP_PARTIAL_FLAG$2 = 32;
var bindKey = baseRest(function(object2, key, partials) {
  var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG$1;
  if (partials.length) {
    var holders = replaceHolders(partials, getHolder(bindKey));
    bitmask |= WRAP_PARTIAL_FLAG$2;
  }
  return createWrap(key, bitmask, object2, partials, holders);
});
bindKey.placeholder = {};
const bindKey$1 = bindKey;
function baseSlice(array2, start, end) {
  var index = -1, length = array2.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result2 = Array(length);
  while (++index < length) {
    result2[index] = array2[index + start];
  }
  return result2;
}
function castSlice(array2, start, end) {
  var length = array2.length;
  end = end === void 0 ? length : end;
  return !start && end >= length ? array2 : baseSlice(array2, start, end);
}
var rsAstralRange$3 = "\\ud800-\\udfff", rsComboMarksRange$4 = "\\u0300-\\u036f", reComboHalfMarksRange$4 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$4 = "\\u20d0-\\u20ff", rsComboRange$4 = rsComboMarksRange$4 + reComboHalfMarksRange$4 + rsComboSymbolsRange$4, rsVarRange$3 = "\\ufe0e\\ufe0f";
var rsZWJ$3 = "\\u200d";
var reHasUnicode = RegExp("[" + rsZWJ$3 + rsAstralRange$3 + rsComboRange$4 + rsVarRange$3 + "]");
function hasUnicode(string2) {
  return reHasUnicode.test(string2);
}
function asciiToArray(string2) {
  return string2.split("");
}
var rsAstralRange$2 = "\\ud800-\\udfff", rsComboMarksRange$3 = "\\u0300-\\u036f", reComboHalfMarksRange$3 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$3 = "\\u20d0-\\u20ff", rsComboRange$3 = rsComboMarksRange$3 + reComboHalfMarksRange$3 + rsComboSymbolsRange$3, rsVarRange$2 = "\\ufe0e\\ufe0f";
var rsAstral$1 = "[" + rsAstralRange$2 + "]", rsCombo$3 = "[" + rsComboRange$3 + "]", rsFitz$2 = "\\ud83c[\\udffb-\\udfff]", rsModifier$2 = "(?:" + rsCombo$3 + "|" + rsFitz$2 + ")", rsNonAstral$2 = "[^" + rsAstralRange$2 + "]", rsRegional$2 = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair$2 = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ$2 = "\\u200d";
var reOptMod$2 = rsModifier$2 + "?", rsOptVar$2 = "[" + rsVarRange$2 + "]?", rsOptJoin$2 = "(?:" + rsZWJ$2 + "(?:" + [rsNonAstral$2, rsRegional$2, rsSurrPair$2].join("|") + ")" + rsOptVar$2 + reOptMod$2 + ")*", rsSeq$2 = rsOptVar$2 + reOptMod$2 + rsOptJoin$2, rsSymbol$1 = "(?:" + [rsNonAstral$2 + rsCombo$3 + "?", rsCombo$3, rsRegional$2, rsSurrPair$2, rsAstral$1].join("|") + ")";
var reUnicode$1 = RegExp(rsFitz$2 + "(?=" + rsFitz$2 + ")|" + rsSymbol$1 + rsSeq$2, "g");
function unicodeToArray(string2) {
  return string2.match(reUnicode$1) || [];
}
function stringToArray$1(string2) {
  return hasUnicode(string2) ? unicodeToArray(string2) : asciiToArray(string2);
}
function createCaseFirst(methodName) {
  return function(string2) {
    string2 = toString(string2);
    var strSymbols = hasUnicode(string2) ? stringToArray$1(string2) : void 0;
    var chr = strSymbols ? strSymbols[0] : string2.charAt(0);
    var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string2.slice(1);
    return chr[methodName]() + trailing;
  };
}
var upperFirst = createCaseFirst("toUpperCase");
const upperFirst$1 = upperFirst;
function capitalize(string2) {
  return upperFirst$1(toString(string2).toLowerCase());
}
function arrayReduce(array2, iteratee2, accumulator, initAccum) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  if (initAccum && length) {
    accumulator = array2[++index];
  }
  while (++index < length) {
    accumulator = iteratee2(accumulator, array2[index], index, array2);
  }
  return accumulator;
}
function basePropertyOf(object2) {
  return function(key) {
    return object2 == null ? void 0 : object2[key];
  };
}
var deburredLetters = {
  // Latin-1 Supplement block.
  "À": "A",
  "Á": "A",
  "Â": "A",
  "Ã": "A",
  "Ä": "A",
  "Å": "A",
  "à": "a",
  "á": "a",
  "â": "a",
  "ã": "a",
  "ä": "a",
  "å": "a",
  "Ç": "C",
  "ç": "c",
  "Ð": "D",
  "ð": "d",
  "È": "E",
  "É": "E",
  "Ê": "E",
  "Ë": "E",
  "è": "e",
  "é": "e",
  "ê": "e",
  "ë": "e",
  "Ì": "I",
  "Í": "I",
  "Î": "I",
  "Ï": "I",
  "ì": "i",
  "í": "i",
  "î": "i",
  "ï": "i",
  "Ñ": "N",
  "ñ": "n",
  "Ò": "O",
  "Ó": "O",
  "Ô": "O",
  "Õ": "O",
  "Ö": "O",
  "Ø": "O",
  "ò": "o",
  "ó": "o",
  "ô": "o",
  "õ": "o",
  "ö": "o",
  "ø": "o",
  "Ù": "U",
  "Ú": "U",
  "Û": "U",
  "Ü": "U",
  "ù": "u",
  "ú": "u",
  "û": "u",
  "ü": "u",
  "Ý": "Y",
  "ý": "y",
  "ÿ": "y",
  "Æ": "Ae",
  "æ": "ae",
  "Þ": "Th",
  "þ": "th",
  "ß": "ss",
  // Latin Extended-A block.
  "Ā": "A",
  "Ă": "A",
  "Ą": "A",
  "ā": "a",
  "ă": "a",
  "ą": "a",
  "Ć": "C",
  "Ĉ": "C",
  "Ċ": "C",
  "Č": "C",
  "ć": "c",
  "ĉ": "c",
  "ċ": "c",
  "č": "c",
  "Ď": "D",
  "Đ": "D",
  "ď": "d",
  "đ": "d",
  "Ē": "E",
  "Ĕ": "E",
  "Ė": "E",
  "Ę": "E",
  "Ě": "E",
  "ē": "e",
  "ĕ": "e",
  "ė": "e",
  "ę": "e",
  "ě": "e",
  "Ĝ": "G",
  "Ğ": "G",
  "Ġ": "G",
  "Ģ": "G",
  "ĝ": "g",
  "ğ": "g",
  "ġ": "g",
  "ģ": "g",
  "Ĥ": "H",
  "Ħ": "H",
  "ĥ": "h",
  "ħ": "h",
  "Ĩ": "I",
  "Ī": "I",
  "Ĭ": "I",
  "Į": "I",
  "İ": "I",
  "ĩ": "i",
  "ī": "i",
  "ĭ": "i",
  "į": "i",
  "ı": "i",
  "Ĵ": "J",
  "ĵ": "j",
  "Ķ": "K",
  "ķ": "k",
  "ĸ": "k",
  "Ĺ": "L",
  "Ļ": "L",
  "Ľ": "L",
  "Ŀ": "L",
  "Ł": "L",
  "ĺ": "l",
  "ļ": "l",
  "ľ": "l",
  "ŀ": "l",
  "ł": "l",
  "Ń": "N",
  "Ņ": "N",
  "Ň": "N",
  "Ŋ": "N",
  "ń": "n",
  "ņ": "n",
  "ň": "n",
  "ŋ": "n",
  "Ō": "O",
  "Ŏ": "O",
  "Ő": "O",
  "ō": "o",
  "ŏ": "o",
  "ő": "o",
  "Ŕ": "R",
  "Ŗ": "R",
  "Ř": "R",
  "ŕ": "r",
  "ŗ": "r",
  "ř": "r",
  "Ś": "S",
  "Ŝ": "S",
  "Ş": "S",
  "Š": "S",
  "ś": "s",
  "ŝ": "s",
  "ş": "s",
  "š": "s",
  "Ţ": "T",
  "Ť": "T",
  "Ŧ": "T",
  "ţ": "t",
  "ť": "t",
  "ŧ": "t",
  "Ũ": "U",
  "Ū": "U",
  "Ŭ": "U",
  "Ů": "U",
  "Ű": "U",
  "Ų": "U",
  "ũ": "u",
  "ū": "u",
  "ŭ": "u",
  "ů": "u",
  "ű": "u",
  "ų": "u",
  "Ŵ": "W",
  "ŵ": "w",
  "Ŷ": "Y",
  "ŷ": "y",
  "Ÿ": "Y",
  "Ź": "Z",
  "Ż": "Z",
  "Ž": "Z",
  "ź": "z",
  "ż": "z",
  "ž": "z",
  "Ĳ": "IJ",
  "ĳ": "ij",
  "Œ": "Oe",
  "œ": "oe",
  "ŉ": "'n",
  "ſ": "s"
};
var deburrLetter = basePropertyOf(deburredLetters);
const deburrLetter$1 = deburrLetter;
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
var rsComboMarksRange$2 = "\\u0300-\\u036f", reComboHalfMarksRange$2 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$2 = "\\u20d0-\\u20ff", rsComboRange$2 = rsComboMarksRange$2 + reComboHalfMarksRange$2 + rsComboSymbolsRange$2;
var rsCombo$2 = "[" + rsComboRange$2 + "]";
var reComboMark = RegExp(rsCombo$2, "g");
function deburr(string2) {
  string2 = toString(string2);
  return string2 && string2.replace(reLatin, deburrLetter$1).replace(reComboMark, "");
}
var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
function asciiWords(string2) {
  return string2.match(reAsciiWord) || [];
}
var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
function hasUnicodeWord(string2) {
  return reHasUnicodeWord.test(string2);
}
var rsAstralRange$1 = "\\ud800-\\udfff", rsComboMarksRange$1 = "\\u0300-\\u036f", reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$1 = "\\u20d0-\\u20ff", rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange$1 = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
var rsApos$1 = "['’]", rsBreak = "[" + rsBreakRange + "]", rsCombo$1 = "[" + rsComboRange$1 + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange$1 + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz$1 = "\\ud83c[\\udffb-\\udfff]", rsModifier$1 = "(?:" + rsCombo$1 + "|" + rsFitz$1 + ")", rsNonAstral$1 = "[^" + rsAstralRange$1 + "]", rsRegional$1 = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair$1 = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ$1 = "\\u200d";
var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos$1 + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos$1 + "(?:D|LL|M|RE|S|T|VE))?", reOptMod$1 = rsModifier$1 + "?", rsOptVar$1 = "[" + rsVarRange$1 + "]?", rsOptJoin$1 = "(?:" + rsZWJ$1 + "(?:" + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join("|") + ")" + rsOptVar$1 + reOptMod$1 + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1, rsEmoji = "(?:" + [rsDingbat, rsRegional$1, rsSurrPair$1].join("|") + ")" + rsSeq$1;
var reUnicodeWord = RegExp([
  rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
  rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
  rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
  rsUpper + "+" + rsOptContrUpper,
  rsOrdUpper,
  rsOrdLower,
  rsDigits,
  rsEmoji
].join("|"), "g");
function unicodeWords(string2) {
  return string2.match(reUnicodeWord) || [];
}
function words(string2, pattern, guard) {
  string2 = toString(string2);
  pattern = guard ? void 0 : pattern;
  if (pattern === void 0) {
    return hasUnicodeWord(string2) ? unicodeWords(string2) : asciiWords(string2);
  }
  return string2.match(pattern) || [];
}
var rsApos = "['’]";
var reApos = RegExp(rsApos, "g");
function createCompounder(callback) {
  return function(string2) {
    return arrayReduce(words(deburr(string2).replace(reApos, "")), callback, "");
  };
}
var camelCase = createCompounder(function(result2, word, index) {
  word = word.toLowerCase();
  return result2 + (index ? capitalize(word) : word);
});
const camelCase$1 = camelCase;
function castArray() {
  if (!arguments.length) {
    return [];
  }
  var value = arguments[0];
  return isArray(value) ? value : [value];
}
var nativeIsFinite$1 = root.isFinite, nativeMin$c = Math.min;
function createRound(methodName) {
  var func2 = Math[methodName];
  return function(number2, precision) {
    number2 = toNumber(number2);
    precision = precision == null ? 0 : nativeMin$c(toInteger(precision), 292);
    if (precision && nativeIsFinite$1(number2)) {
      var pair = (toString(number2) + "e").split("e"), value = func2(pair[0] + "e" + (+pair[1] + precision));
      pair = (toString(value) + "e").split("e");
      return +(pair[0] + "e" + (+pair[1] - precision));
    }
    return func2(number2);
  };
}
var ceil = createRound("ceil");
const ceil$1 = ceil;
function chain(value) {
  var result2 = lodash(value);
  result2.__chain__ = true;
  return result2;
}
var nativeCeil$3 = Math.ceil, nativeMax$c = Math.max;
function chunk(array2, size2, guard) {
  if (guard ? isIterateeCall(array2, size2, guard) : size2 === void 0) {
    size2 = 1;
  } else {
    size2 = nativeMax$c(toInteger(size2), 0);
  }
  var length = array2 == null ? 0 : array2.length;
  if (!length || size2 < 1) {
    return [];
  }
  var index = 0, resIndex = 0, result2 = Array(nativeCeil$3(length / size2));
  while (index < length) {
    result2[resIndex++] = baseSlice(array2, index, index += size2);
  }
  return result2;
}
function baseClamp(number2, lower, upper) {
  if (number2 === number2) {
    if (upper !== void 0) {
      number2 = number2 <= upper ? number2 : upper;
    }
    if (lower !== void 0) {
      number2 = number2 >= lower ? number2 : lower;
    }
  }
  return number2;
}
function clamp(number2, lower, upper) {
  if (upper === void 0) {
    upper = lower;
    lower = void 0;
  }
  if (upper !== void 0) {
    upper = toNumber(upper);
    upper = upper === upper ? upper : 0;
  }
  if (lower !== void 0) {
    lower = toNumber(lower);
    lower = lower === lower ? lower : 0;
  }
  return baseClamp(toNumber(number2), lower, upper);
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result2 = data["delete"](key);
  this.size = data.size;
  return result2;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE$2 = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE$2 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function baseAssign(object2, source) {
  return object2 && copyObject(source, keys(source), object2);
}
function baseAssignIn(object2, source) {
  return object2 && copyObject(source, keysIn(source), object2);
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var Buffer2 = moduleExports ? root.Buffer : void 0, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result2);
  return result2;
}
function arrayFilter(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result2 = [];
  while (++index < length) {
    var value = array2[index];
    if (predicate(value, index, array2)) {
      result2[resIndex++] = value;
    }
  }
  return result2;
}
function stubArray() {
  return [];
}
var objectProto$d = Object.prototype;
var propertyIsEnumerable = objectProto$d.propertyIsEnumerable;
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols$1 ? stubArray : function(object2) {
  if (object2 == null) {
    return [];
  }
  object2 = Object(object2);
  return arrayFilter(nativeGetSymbols$1(object2), function(symbol) {
    return propertyIsEnumerable.call(object2, symbol);
  });
};
function copySymbols(source, object2) {
  return copyObject(source, getSymbols(source), object2);
}
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object2) {
  var result2 = [];
  while (object2) {
    arrayPush(result2, getSymbols(object2));
    object2 = getPrototype(object2);
  }
  return result2;
};
function copySymbolsIn(source, object2) {
  return copyObject(source, getSymbolsIn(source), object2);
}
function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
  var result2 = keysFunc(object2);
  return isArray(object2) ? result2 : arrayPush(result2, symbolsFunc(object2));
}
function getAllKeys(object2) {
  return baseGetAllKeys(object2, keys, getSymbols);
}
function getAllKeysIn(object2) {
  return baseGetAllKeys(object2, keysIn, getSymbolsIn);
}
var DataView = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var Set$1 = getNative(root, "Set");
var mapTag$8 = "[object Map]", objectTag$2 = "[object Object]", promiseTag = "[object Promise]", setTag$8 = "[object Set]", weakMapTag$2 = "[object WeakMap]";
var dataViewTag$3 = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$1);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$3 || Map$1 && getTag(new Map$1()) != mapTag$8 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$8 || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag$2) {
  getTag = function(value) {
    var result2 = baseGetTag(value), Ctor = result2 == objectTag$2 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$3;
        case mapCtorString:
          return mapTag$8;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$8;
        case weakMapCtorString:
          return weakMapTag$2;
      }
    }
    return result2;
  };
}
const getTag$1 = getTag;
var objectProto$c = Object.prototype;
var hasOwnProperty$b = objectProto$c.hasOwnProperty;
function initCloneArray(array2) {
  var length = array2.length, result2 = new array2.constructor(length);
  if (length && typeof array2[0] == "string" && hasOwnProperty$b.call(array2, "index")) {
    result2.index = array2.index;
    result2.input = array2.input;
  }
  return result2;
}
var Uint8Array$1 = root.Uint8Array;
function cloneArrayBuffer(arrayBuffer) {
  var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$1(result2).set(new Uint8Array$1(arrayBuffer));
  return result2;
}
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
var reFlags$1 = /\w*$/;
function cloneRegExp(regexp) {
  var result2 = new regexp.constructor(regexp.source, reFlags$1.exec(regexp));
  result2.lastIndex = regexp.lastIndex;
  return result2;
}
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf$1 = symbolProto$1 ? symbolProto$1.valueOf : void 0;
function cloneSymbol(symbol) {
  return symbolValueOf$1 ? Object(symbolValueOf$1.call(symbol)) : {};
}
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
var boolTag$3 = "[object Boolean]", dateTag$3 = "[object Date]", mapTag$7 = "[object Map]", numberTag$3 = "[object Number]", regexpTag$3 = "[object RegExp]", setTag$7 = "[object Set]", stringTag$3 = "[object String]", symbolTag$2 = "[object Symbol]";
var arrayBufferTag$3 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag$1 = "[object Float32Array]", float64Tag$1 = "[object Float64Array]", int8Tag$1 = "[object Int8Array]", int16Tag$1 = "[object Int16Array]", int32Tag$1 = "[object Int32Array]", uint8Tag$1 = "[object Uint8Array]", uint8ClampedTag$1 = "[object Uint8ClampedArray]", uint16Tag$1 = "[object Uint16Array]", uint32Tag$1 = "[object Uint32Array]";
function initCloneByTag(object2, tag, isDeep) {
  var Ctor = object2.constructor;
  switch (tag) {
    case arrayBufferTag$3:
      return cloneArrayBuffer(object2);
    case boolTag$3:
    case dateTag$3:
      return new Ctor(+object2);
    case dataViewTag$2:
      return cloneDataView(object2, isDeep);
    case float32Tag$1:
    case float64Tag$1:
    case int8Tag$1:
    case int16Tag$1:
    case int32Tag$1:
    case uint8Tag$1:
    case uint8ClampedTag$1:
    case uint16Tag$1:
    case uint32Tag$1:
      return cloneTypedArray(object2, isDeep);
    case mapTag$7:
      return new Ctor();
    case numberTag$3:
    case stringTag$3:
      return new Ctor(object2);
    case regexpTag$3:
      return cloneRegExp(object2);
    case setTag$7:
      return new Ctor();
    case symbolTag$2:
      return cloneSymbol(object2);
  }
}
function initCloneObject(object2) {
  return typeof object2.constructor == "function" && !isPrototype(object2) ? baseCreate(getPrototype(object2)) : {};
}
var mapTag$6 = "[object Map]";
function baseIsMap(value) {
  return isObjectLike(value) && getTag$1(value) == mapTag$6;
}
var nodeIsMap = nodeUtil && nodeUtil.isMap;
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
const isMap$1 = isMap;
var setTag$6 = "[object Set]";
function baseIsSet(value) {
  return isObjectLike(value) && getTag$1(value) == setTag$6;
}
var nodeIsSet = nodeUtil && nodeUtil.isSet;
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
const isSet$1 = isSet;
var CLONE_DEEP_FLAG$7 = 1, CLONE_FLAT_FLAG$1 = 2, CLONE_SYMBOLS_FLAG$5 = 4;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$2 = "[object Boolean]", dateTag$2 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag$5 = "[object Map]", numberTag$2 = "[object Number]", objectTag$1 = "[object Object]", regexpTag$2 = "[object RegExp]", setTag$5 = "[object Set]", stringTag$2 = "[object String]", symbolTag$1 = "[object Symbol]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$2 = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var cloneableTags = {};
cloneableTags[argsTag$1] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$1] = cloneableTags[boolTag$2] = cloneableTags[dateTag$2] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag$5] = cloneableTags[numberTag$2] = cloneableTags[objectTag$1] = cloneableTags[regexpTag$2] = cloneableTags[setTag$5] = cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag] = cloneableTags[weakMapTag$1] = false;
function baseClone(value, bitmask, customizer, key, object2, stack2) {
  var result2, isDeep = bitmask & CLONE_DEEP_FLAG$7, isFlat = bitmask & CLONE_FLAT_FLAG$1, isFull = bitmask & CLONE_SYMBOLS_FLAG$5;
  if (customizer) {
    result2 = object2 ? customizer(value, key, object2, stack2) : customizer(value);
  }
  if (result2 !== void 0) {
    return result2;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result2 = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result2);
    }
  } else {
    var tag = getTag$1(value), isFunc = tag == funcTag || tag == genTag;
    if (isBuffer$1(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$1 || tag == argsTag$1 || isFunc && !object2) {
      result2 = isFlat || isFunc ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object2 ? value : {};
      }
      result2 = initCloneByTag(value, tag, isDeep);
    }
  }
  stack2 || (stack2 = new Stack());
  var stacked = stack2.get(value);
  if (stacked) {
    return stacked;
  }
  stack2.set(value, result2);
  if (isSet$1(value)) {
    value.forEach(function(subValue) {
      result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack2));
    });
  } else if (isMap$1(value)) {
    value.forEach(function(subValue, key2) {
      result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack2));
    });
  }
  var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
  var props = isArr ? void 0 : keysFunc(value);
  arrayEach(props || value, function(subValue, key2) {
    if (props) {
      key2 = subValue;
      subValue = value[key2];
    }
    assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack2));
  });
  return result2;
}
var CLONE_SYMBOLS_FLAG$4 = 4;
function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG$4);
}
var CLONE_DEEP_FLAG$6 = 1, CLONE_SYMBOLS_FLAG$3 = 4;
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG$6 | CLONE_SYMBOLS_FLAG$3);
}
var CLONE_DEEP_FLAG$5 = 1, CLONE_SYMBOLS_FLAG$2 = 4;
function cloneDeepWith(value, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  return baseClone(value, CLONE_DEEP_FLAG$5 | CLONE_SYMBOLS_FLAG$2, customizer);
}
var CLONE_SYMBOLS_FLAG$1 = 4;
function cloneWith(value, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  return baseClone(value, CLONE_SYMBOLS_FLAG$1, customizer);
}
function wrapperCommit() {
  return new LodashWrapper(this.value(), this.__chain__);
}
function compact(array2) {
  var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result2 = [];
  while (++index < length) {
    var value = array2[index];
    if (value) {
      result2[resIndex++] = value;
    }
  }
  return result2;
}
function concat() {
  var length = arguments.length;
  if (!length) {
    return [];
  }
  var args = Array(length - 1), array2 = arguments[0], index = length;
  while (index--) {
    args[index - 1] = arguments[index];
  }
  return arrayPush(isArray(array2) ? copyArray(array2) : [array2], baseFlatten(args, 1));
}
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values2) {
  var index = -1, length = values2 == null ? 0 : values2.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values2[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (predicate(array2[index], index, array2)) {
      return true;
    }
  }
  return false;
}
function cacheHas(cache, key) {
  return cache.has(key);
}
var COMPARE_PARTIAL_FLAG$5 = 1, COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays(array2, other, bitmask, customizer, equalFunc, stack2) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array2.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack2.get(array2);
  var othStacked = stack2.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array2;
  }
  var index = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : void 0;
  stack2.set(array2, other);
  stack2.set(other, array2);
  while (++index < arrLength) {
    var arrValue = array2[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array2, stack2) : customizer(arrValue, othValue, index, array2, other, stack2);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result2 = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack2))) {
          return seen.push(othIndex);
        }
      })) {
        result2 = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack2))) {
      result2 = false;
      break;
    }
  }
  stack2["delete"](array2);
  stack2["delete"](other);
  return result2;
}
function mapToArray(map2) {
  var index = -1, result2 = Array(map2.size);
  map2.forEach(function(value, key) {
    result2[++index] = [key, value];
  });
  return result2;
}
function setToArray(set2) {
  var index = -1, result2 = Array(set2.size);
  set2.forEach(function(value) {
    result2[++index] = value;
  });
  return result2;
}
var COMPARE_PARTIAL_FLAG$4 = 1, COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag = "[object Error]", mapTag$4 = "[object Map]", numberTag$1 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$4 = "[object Set]", stringTag$1 = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack2) {
  switch (tag) {
    case dataViewTag:
      if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
        return false;
      }
      object2 = object2.buffer;
      other = other.buffer;
    case arrayBufferTag$1:
      if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object2), new Uint8Array$1(other))) {
        return false;
      }
      return true;
    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      return eq(+object2, +other);
    case errorTag:
      return object2.name == other.name && object2.message == other.message;
    case regexpTag$1:
    case stringTag$1:
      return object2 == other + "";
    case mapTag$4:
      var convert = mapToArray;
    case setTag$4:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);
      if (object2.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack2.get(object2);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack2.set(object2, other);
      var result2 = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack2);
      stack2["delete"](object2);
      return result2;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object2) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$b = Object.prototype;
var hasOwnProperty$a = objectProto$b.hasOwnProperty;
function equalObjects(object2, other, bitmask, customizer, equalFunc, stack2) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$a.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack2.get(object2);
  var othStacked = stack2.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object2;
  }
  var result2 = true;
  stack2.set(object2, other);
  stack2.set(other, object2);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object2[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack2) : customizer(objValue, othValue, key, object2, other, stack2);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack2) : compared)) {
      result2 = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result2 && !skipCtor) {
    var objCtor = object2.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result2 = false;
    }
  }
  stack2["delete"](object2);
  stack2["delete"](other);
  return result2;
}
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto$a = Object.prototype;
var hasOwnProperty$9 = objectProto$a.hasOwnProperty;
function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack2) {
  var objIsArr = isArray(object2), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag$1(object2), othTag = othIsArr ? arrayTag : getTag$1(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer$1(object2)) {
    if (!isBuffer$1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack2 || (stack2 = new Stack());
    return objIsArr || isTypedArray$1(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack2) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack2);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$9.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty$9.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
      stack2 || (stack2 = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack2);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack2 || (stack2 = new Stack());
  return equalObjects(object2, other, bitmask, customizer, equalFunc, stack2);
}
function baseIsEqual(value, other, bitmask, customizer, stack2) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack2);
}
var COMPARE_PARTIAL_FLAG$1 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch(object2, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object2 == null) {
    return !length;
  }
  object2 = Object(object2);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object2[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object2)) {
        return false;
      }
    } else {
      var stack2 = new Stack();
      if (customizer) {
        var result2 = customizer(objValue, srcValue, key, object2, source, stack2);
      }
      if (!(result2 === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack2) : result2)) {
        return false;
      }
    }
  }
  return true;
}
function isStrictComparable(value) {
  return value === value && !isObject(value);
}
function getMatchData(object2) {
  var result2 = keys(object2), length = result2.length;
  while (length--) {
    var key = result2[length], value = object2[key];
    result2[length] = [key, value, isStrictComparable(value)];
  }
  return result2;
}
function matchesStrictComparable(key, srcValue) {
  return function(object2) {
    if (object2 == null) {
      return false;
    }
    return object2[key] === srcValue && (srcValue !== void 0 || key in Object(object2));
  };
}
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object2) {
    return object2 === source || baseIsMatch(object2, source, matchData);
  };
}
function baseHasIn(object2, key) {
  return object2 != null && key in Object(object2);
}
function hasPath(object2, path, hasFunc) {
  path = castPath(path, object2);
  var index = -1, length = path.length, result2 = false;
  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result2 = object2 != null && hasFunc(object2, key))) {
      break;
    }
    object2 = object2[key];
  }
  if (result2 || ++index != length) {
    return result2;
  }
  length = object2 == null ? 0 : object2.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object2) || isArguments$1(object2));
}
function hasIn(object2, path) {
  return object2 != null && hasPath(object2, path, baseHasIn);
}
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object2) {
    var objValue = get(object2, path);
    return objValue === void 0 && objValue === srcValue ? hasIn(object2, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
function baseProperty(key) {
  return function(object2) {
    return object2 == null ? void 0 : object2[key];
  };
}
function basePropertyDeep(path) {
  return function(object2) {
    return baseGet(object2, path);
  };
}
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == "object") {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
var FUNC_ERROR_TEXT$7 = "Expected a function";
function cond(pairs) {
  var length = pairs == null ? 0 : pairs.length, toIteratee = baseIteratee;
  pairs = !length ? [] : arrayMap(pairs, function(pair) {
    if (typeof pair[1] != "function") {
      throw new TypeError(FUNC_ERROR_TEXT$7);
    }
    return [toIteratee(pair[0]), pair[1]];
  });
  return baseRest(function(args) {
    var index = -1;
    while (++index < length) {
      var pair = pairs[index];
      if (apply(pair[0], this, args)) {
        return apply(pair[1], this, args);
      }
    }
  });
}
function baseConformsTo(object2, source, props) {
  var length = props.length;
  if (object2 == null) {
    return !length;
  }
  object2 = Object(object2);
  while (length--) {
    var key = props[length], predicate = source[key], value = object2[key];
    if (value === void 0 && !(key in object2) || !predicate(value)) {
      return false;
    }
  }
  return true;
}
function baseConforms(source) {
  var props = keys(source);
  return function(object2) {
    return baseConformsTo(object2, source, props);
  };
}
var CLONE_DEEP_FLAG$4 = 1;
function conforms(source) {
  return baseConforms(baseClone(source, CLONE_DEEP_FLAG$4));
}
function conformsTo(object2, source) {
  return source == null || baseConformsTo(object2, source, keys(source));
}
function arrayAggregator(array2, setter, iteratee2, accumulator) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    var value = array2[index];
    setter(accumulator, value, iteratee2(value), array2);
  }
  return accumulator;
}
function createBaseFor(fromRight) {
  return function(object2, iteratee2, keysFunc) {
    var index = -1, iterable = Object(object2), props = keysFunc(object2), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee2(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object2;
  };
}
var baseFor = createBaseFor();
function baseForOwn(object2, iteratee2) {
  return object2 && baseFor(object2, iteratee2, keys);
}
function createBaseEach(eachFunc, fromRight) {
  return function(collection2, iteratee2) {
    if (collection2 == null) {
      return collection2;
    }
    if (!isArrayLike(collection2)) {
      return eachFunc(collection2, iteratee2);
    }
    var length = collection2.length, index = fromRight ? length : -1, iterable = Object(collection2);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee2(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection2;
  };
}
var baseEach = createBaseEach(baseForOwn);
function baseAggregator(collection2, setter, iteratee2, accumulator) {
  baseEach(collection2, function(value, key, collection3) {
    setter(accumulator, value, iteratee2(value), collection3);
  });
  return accumulator;
}
function createAggregator(setter, initializer) {
  return function(collection2, iteratee2) {
    var func2 = isArray(collection2) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
    return func2(collection2, setter, baseIteratee(iteratee2), accumulator);
  };
}
var objectProto$9 = Object.prototype;
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;
var countBy = createAggregator(function(result2, value, key) {
  if (hasOwnProperty$8.call(result2, key)) {
    ++result2[key];
  } else {
    baseAssignValue(result2, key, 1);
  }
});
const countBy$1 = countBy;
function create(prototype, properties) {
  var result2 = baseCreate(prototype);
  return properties == null ? result2 : baseAssign(result2, properties);
}
var WRAP_CURRY_FLAG$1 = 8;
function curry(func2, arity, guard) {
  arity = guard ? void 0 : arity;
  var result2 = createWrap(func2, WRAP_CURRY_FLAG$1, void 0, void 0, void 0, void 0, void 0, arity);
  result2.placeholder = curry.placeholder;
  return result2;
}
curry.placeholder = {};
var WRAP_CURRY_RIGHT_FLAG = 16;
function curryRight(func2, arity, guard) {
  arity = guard ? void 0 : arity;
  var result2 = createWrap(func2, WRAP_CURRY_RIGHT_FLAG, void 0, void 0, void 0, void 0, void 0, arity);
  result2.placeholder = curryRight.placeholder;
  return result2;
}
curryRight.placeholder = {};
var now$1 = function() {
  return root.Date.now();
};
const now$2 = now$1;
var FUNC_ERROR_TEXT$6 = "Expected a function";
var nativeMax$b = Math.max, nativeMin$b = Math.min;
function debounce(func2, wait, options) {
  var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$6);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax$b(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result2 = func2.apply(thisArg, args);
    return result2;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result2;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin$b(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now$2();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result2;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result2 : trailingEdge(now$2());
  }
  function debounced() {
    var time = now$2(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result2;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
function defaultTo(value, defaultValue) {
  return value == null || value !== value ? defaultValue : value;
}
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
var defaults = baseRest(function(object2, sources) {
  object2 = Object(object2);
  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : void 0;
  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    length = 1;
  }
  while (++index < length) {
    var source = sources[index];
    var props = keysIn(source);
    var propsIndex = -1;
    var propsLength = props.length;
    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object2[key];
      if (value === void 0 || eq(value, objectProto$8[key]) && !hasOwnProperty$7.call(object2, key)) {
        object2[key] = source[key];
      }
    }
  }
  return object2;
});
const defaults$1 = defaults;
function assignMergeValue(object2, key, value) {
  if (value !== void 0 && !eq(object2[key], value) || value === void 0 && !(key in object2)) {
    baseAssignValue(object2, key, value);
  }
}
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
function safeGet(object2, key) {
  if (key === "constructor" && typeof object2[key] === "function") {
    return;
  }
  if (key == "__proto__") {
    return;
  }
  return object2[key];
}
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}
function baseMergeDeep(object2, source, key, srcIndex, mergeFunc, customizer, stack2) {
  var objValue = safeGet(object2, key), srcValue = safeGet(source, key), stacked = stack2.get(srcValue);
  if (stacked) {
    assignMergeValue(object2, key, stacked);
    return;
  }
  var newValue = customizer ? customizer(objValue, srcValue, key + "", object2, source, stack2) : void 0;
  var isCommon = newValue === void 0;
  if (isCommon) {
    var isArr = isArray(srcValue), isBuff = !isArr && isBuffer$1(srcValue), isTyped = !isArr && !isBuff && isTypedArray$1(srcValue);
    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments$1(srcValue)) {
      newValue = objValue;
      if (isArguments$1(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }
  if (isCommon) {
    stack2.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack2);
    stack2["delete"](srcValue);
  }
  assignMergeValue(object2, key, newValue);
}
function baseMerge(object2, source, srcIndex, customizer, stack2) {
  if (object2 === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack2 || (stack2 = new Stack());
    if (isObject(srcValue)) {
      baseMergeDeep(object2, source, key, srcIndex, baseMerge, customizer, stack2);
    } else {
      var newValue = customizer ? customizer(safeGet(object2, key), srcValue, key + "", object2, source, stack2) : void 0;
      if (newValue === void 0) {
        newValue = srcValue;
      }
      assignMergeValue(object2, key, newValue);
    }
  }, keysIn);
}
function customDefaultsMerge(objValue, srcValue, key, object2, source, stack2) {
  if (isObject(objValue) && isObject(srcValue)) {
    stack2.set(srcValue, objValue);
    baseMerge(objValue, srcValue, void 0, customDefaultsMerge, stack2);
    stack2["delete"](srcValue);
  }
  return objValue;
}
var mergeWith = createAssigner(function(object2, source, srcIndex, customizer) {
  baseMerge(object2, source, srcIndex, customizer);
});
const mergeWith$1 = mergeWith;
var defaultsDeep = baseRest(function(args) {
  args.push(void 0, customDefaultsMerge);
  return apply(mergeWith$1, void 0, args);
});
const defaultsDeep$1 = defaultsDeep;
var FUNC_ERROR_TEXT$5 = "Expected a function";
function baseDelay(func2, wait, args) {
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$5);
  }
  return setTimeout(function() {
    func2.apply(void 0, args);
  }, wait);
}
var defer = baseRest(function(func2, args) {
  return baseDelay(func2, 1, args);
});
const defer$1 = defer;
var delay = baseRest(function(func2, wait, args) {
  return baseDelay(func2, toNumber(wait) || 0, args);
});
const delay$1 = delay;
function arrayIncludesWith(array2, value, comparator2) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (comparator2(value, array2[index])) {
      return true;
    }
  }
  return false;
}
var LARGE_ARRAY_SIZE$1 = 200;
function baseDifference(array2, values2, iteratee2, comparator2) {
  var index = -1, includes2 = arrayIncludes, isCommon = true, length = array2.length, result2 = [], valuesLength = values2.length;
  if (!length) {
    return result2;
  }
  if (iteratee2) {
    values2 = arrayMap(values2, baseUnary(iteratee2));
  }
  if (comparator2) {
    includes2 = arrayIncludesWith;
    isCommon = false;
  } else if (values2.length >= LARGE_ARRAY_SIZE$1) {
    includes2 = cacheHas;
    isCommon = false;
    values2 = new SetCache(values2);
  }
  outer:
    while (++index < length) {
      var value = array2[index], computed2 = iteratee2 == null ? value : iteratee2(value);
      value = comparator2 || value !== 0 ? value : 0;
      if (isCommon && computed2 === computed2) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values2[valuesIndex] === computed2) {
            continue outer;
          }
        }
        result2.push(value);
      } else if (!includes2(values2, computed2, comparator2)) {
        result2.push(value);
      }
    }
  return result2;
}
var difference = baseRest(function(array2, values2) {
  return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
});
const difference$1 = difference;
function last(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? array2[length - 1] : void 0;
}
var differenceBy = baseRest(function(array2, values2) {
  var iteratee2 = last(values2);
  if (isArrayLikeObject(iteratee2)) {
    iteratee2 = void 0;
  }
  return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), baseIteratee(iteratee2)) : [];
});
const differenceBy$1 = differenceBy;
var differenceWith = baseRest(function(array2, values2) {
  var comparator2 = last(values2);
  if (isArrayLikeObject(comparator2)) {
    comparator2 = void 0;
  }
  return isArrayLikeObject(array2) ? baseDifference(array2, baseFlatten(values2, 1, isArrayLikeObject, true), void 0, comparator2) : [];
});
const differenceWith$1 = differenceWith;
var divide = createMathOperation(function(dividend, divisor) {
  return dividend / divisor;
}, 1);
const divide$1 = divide;
function drop(array2, n, guard) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger(n);
  return baseSlice(array2, n < 0 ? 0 : n, length);
}
function dropRight(array2, n, guard) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger(n);
  n = length - n;
  return baseSlice(array2, 0, n < 0 ? 0 : n);
}
function baseWhile(array2, predicate, isDrop, fromRight) {
  var length = array2.length, index = fromRight ? length : -1;
  while ((fromRight ? index-- : ++index < length) && predicate(array2[index], index, array2)) {
  }
  return isDrop ? baseSlice(array2, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array2, fromRight ? index + 1 : 0, fromRight ? length : index);
}
function dropRightWhile(array2, predicate) {
  return array2 && array2.length ? baseWhile(array2, baseIteratee(predicate), true, true) : [];
}
function dropWhile(array2, predicate) {
  return array2 && array2.length ? baseWhile(array2, baseIteratee(predicate), true) : [];
}
function castFunction(value) {
  return typeof value == "function" ? value : identity;
}
function forEach(collection2, iteratee2) {
  var func2 = isArray(collection2) ? arrayEach : baseEach;
  return func2(collection2, castFunction(iteratee2));
}
function arrayEachRight(array2, iteratee2) {
  var length = array2 == null ? 0 : array2.length;
  while (length--) {
    if (iteratee2(array2[length], length, array2) === false) {
      break;
    }
  }
  return array2;
}
var baseForRight = createBaseFor(true);
function baseForOwnRight(object2, iteratee2) {
  return object2 && baseForRight(object2, iteratee2, keys);
}
var baseEachRight = createBaseEach(baseForOwnRight, true);
const baseEachRight$1 = baseEachRight;
function forEachRight(collection2, iteratee2) {
  var func2 = isArray(collection2) ? arrayEachRight : baseEachRight$1;
  return func2(collection2, castFunction(iteratee2));
}
function endsWith(string2, target, position) {
  string2 = toString(string2);
  target = baseToString(target);
  var length = string2.length;
  position = position === void 0 ? length : baseClamp(toInteger(position), 0, length);
  var end = position;
  position -= target.length;
  return position >= 0 && string2.slice(position, end) == target;
}
function baseToPairs(object2, props) {
  return arrayMap(props, function(key) {
    return [key, object2[key]];
  });
}
function setToPairs(set2) {
  var index = -1, result2 = Array(set2.size);
  set2.forEach(function(value) {
    result2[++index] = [value, value];
  });
  return result2;
}
var mapTag$3 = "[object Map]", setTag$3 = "[object Set]";
function createToPairs(keysFunc) {
  return function(object2) {
    var tag = getTag$1(object2);
    if (tag == mapTag$3) {
      return mapToArray(object2);
    }
    if (tag == setTag$3) {
      return setToPairs(object2);
    }
    return baseToPairs(object2, keysFunc(object2));
  };
}
var toPairs = createToPairs(keys);
const toPairs$1 = toPairs;
var toPairsIn = createToPairs(keysIn);
const toPairsIn$1 = toPairsIn;
var htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var escapeHtmlChar = basePropertyOf(htmlEscapes);
const escapeHtmlChar$1 = escapeHtmlChar;
var reUnescapedHtml = /[&<>"']/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
function escape(string2) {
  string2 = toString(string2);
  return string2 && reHasUnescapedHtml.test(string2) ? string2.replace(reUnescapedHtml, escapeHtmlChar$1) : string2;
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(string2) {
  string2 = toString(string2);
  return string2 && reHasRegExpChar.test(string2) ? string2.replace(reRegExpChar, "\\$&") : string2;
}
function arrayEvery(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (!predicate(array2[index], index, array2)) {
      return false;
    }
  }
  return true;
}
function baseEvery(collection2, predicate) {
  var result2 = true;
  baseEach(collection2, function(value, index, collection3) {
    result2 = !!predicate(value, index, collection3);
    return result2;
  });
  return result2;
}
function every(collection2, predicate, guard) {
  var func2 = isArray(collection2) ? arrayEvery : baseEvery;
  if (guard && isIterateeCall(collection2, predicate, guard)) {
    predicate = void 0;
  }
  return func2(collection2, baseIteratee(predicate));
}
var MAX_ARRAY_LENGTH$5 = 4294967295;
function toLength(value) {
  return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH$5) : 0;
}
function baseFill(array2, value, start, end) {
  var length = array2.length;
  start = toInteger(start);
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end === void 0 || end > length ? length : toInteger(end);
  if (end < 0) {
    end += length;
  }
  end = start > end ? 0 : toLength(end);
  while (start < end) {
    array2[start++] = value;
  }
  return array2;
}
function fill(array2, value, start, end) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  if (start && typeof start != "number" && isIterateeCall(array2, value, start)) {
    start = 0;
    end = length;
  }
  return baseFill(array2, value, start, end);
}
function baseFilter(collection2, predicate) {
  var result2 = [];
  baseEach(collection2, function(value, index, collection3) {
    if (predicate(value, index, collection3)) {
      result2.push(value);
    }
  });
  return result2;
}
function filter(collection2, predicate) {
  var func2 = isArray(collection2) ? arrayFilter : baseFilter;
  return func2(collection2, baseIteratee(predicate));
}
function createFind(findIndexFunc) {
  return function(collection2, predicate, fromIndex) {
    var iterable = Object(collection2);
    if (!isArrayLike(collection2)) {
      var iteratee2 = baseIteratee(predicate);
      collection2 = keys(collection2);
      predicate = function(key) {
        return iteratee2(iterable[key], key, iterable);
      };
    }
    var index = findIndexFunc(collection2, predicate, fromIndex);
    return index > -1 ? iterable[iteratee2 ? collection2[index] : index] : void 0;
  };
}
var nativeMax$a = Math.max;
function findIndex(array2, predicate, fromIndex) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax$a(length + index, 0);
  }
  return baseFindIndex(array2, baseIteratee(predicate), index);
}
var find = createFind(findIndex);
const find$1 = find;
function baseFindKey(collection2, predicate, eachFunc) {
  var result2;
  eachFunc(collection2, function(value, key, collection3) {
    if (predicate(value, key, collection3)) {
      result2 = key;
      return false;
    }
  });
  return result2;
}
function findKey(object2, predicate) {
  return baseFindKey(object2, baseIteratee(predicate), baseForOwn);
}
var nativeMax$9 = Math.max, nativeMin$a = Math.min;
function findLastIndex(array2, predicate, fromIndex) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return -1;
  }
  var index = length - 1;
  if (fromIndex !== void 0) {
    index = toInteger(fromIndex);
    index = fromIndex < 0 ? nativeMax$9(length + index, 0) : nativeMin$a(index, length - 1);
  }
  return baseFindIndex(array2, baseIteratee(predicate), index, true);
}
var findLast = createFind(findLastIndex);
const findLast$1 = findLast;
function findLastKey(object2, predicate) {
  return baseFindKey(object2, baseIteratee(predicate), baseForOwnRight);
}
function head(array2) {
  return array2 && array2.length ? array2[0] : void 0;
}
function baseMap(collection2, iteratee2) {
  var index = -1, result2 = isArrayLike(collection2) ? Array(collection2.length) : [];
  baseEach(collection2, function(value, key, collection3) {
    result2[++index] = iteratee2(value, key, collection3);
  });
  return result2;
}
function map(collection2, iteratee2) {
  var func2 = isArray(collection2) ? arrayMap : baseMap;
  return func2(collection2, baseIteratee(iteratee2));
}
function flatMap(collection2, iteratee2) {
  return baseFlatten(map(collection2, iteratee2), 1);
}
var INFINITY$2 = 1 / 0;
function flatMapDeep(collection2, iteratee2) {
  return baseFlatten(map(collection2, iteratee2), INFINITY$2);
}
function flatMapDepth(collection2, iteratee2, depth) {
  depth = depth === void 0 ? 1 : toInteger(depth);
  return baseFlatten(map(collection2, iteratee2), depth);
}
var INFINITY$1 = 1 / 0;
function flattenDeep(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? baseFlatten(array2, INFINITY$1) : [];
}
function flattenDepth(array2, depth) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  depth = depth === void 0 ? 1 : toInteger(depth);
  return baseFlatten(array2, depth);
}
var WRAP_FLIP_FLAG = 512;
function flip(func2) {
  return createWrap(func2, WRAP_FLIP_FLAG);
}
var floor = createRound("floor");
const floor$1 = floor;
var FUNC_ERROR_TEXT$4 = "Expected a function";
var WRAP_CURRY_FLAG = 8, WRAP_PARTIAL_FLAG$1 = 32, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG$1 = 256;
function createFlow(fromRight) {
  return flatRest(function(funcs) {
    var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
    if (fromRight) {
      funcs.reverse();
    }
    while (index--) {
      var func2 = funcs[index];
      if (typeof func2 != "function") {
        throw new TypeError(FUNC_ERROR_TEXT$4);
      }
      if (prereq && !wrapper && getFuncName(func2) == "wrapper") {
        var wrapper = new LodashWrapper([], true);
      }
    }
    index = wrapper ? index : length;
    while (++index < length) {
      func2 = funcs[index];
      var funcName = getFuncName(func2), data = funcName == "wrapper" ? getData(func2) : void 0;
      if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG$1 | WRAP_REARG_FLAG$1) && !data[4].length && data[9] == 1) {
        wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
      } else {
        wrapper = func2.length == 1 && isLaziable(func2) ? wrapper[funcName]() : wrapper.thru(func2);
      }
    }
    return function() {
      var args = arguments, value = args[0];
      if (wrapper && args.length == 1 && isArray(value)) {
        return wrapper.plant(value).value();
      }
      var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
      while (++index2 < length) {
        result2 = funcs[index2].call(this, result2);
      }
      return result2;
    };
  });
}
var flow = createFlow();
const flow$1 = flow;
var flowRight = createFlow(true);
const flowRight$1 = flowRight;
function forIn(object2, iteratee2) {
  return object2 == null ? object2 : baseFor(object2, castFunction(iteratee2), keysIn);
}
function forInRight(object2, iteratee2) {
  return object2 == null ? object2 : baseForRight(object2, castFunction(iteratee2), keysIn);
}
function forOwn(object2, iteratee2) {
  return object2 && baseForOwn(object2, castFunction(iteratee2));
}
function forOwnRight(object2, iteratee2) {
  return object2 && baseForOwnRight(object2, castFunction(iteratee2));
}
function fromPairs(pairs) {
  var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
  while (++index < length) {
    var pair = pairs[index];
    result2[pair[0]] = pair[1];
  }
  return result2;
}
function baseFunctions(object2, props) {
  return arrayFilter(props, function(key) {
    return isFunction(object2[key]);
  });
}
function functions(object2) {
  return object2 == null ? [] : baseFunctions(object2, keys(object2));
}
function functionsIn(object2) {
  return object2 == null ? [] : baseFunctions(object2, keysIn(object2));
}
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
var groupBy = createAggregator(function(result2, value, key) {
  if (hasOwnProperty$6.call(result2, key)) {
    result2[key].push(value);
  } else {
    baseAssignValue(result2, key, [value]);
  }
});
const groupBy$1 = groupBy;
function baseGt(value, other) {
  return value > other;
}
function createRelationalOperation(operator) {
  return function(value, other) {
    if (!(typeof value == "string" && typeof other == "string")) {
      value = toNumber(value);
      other = toNumber(other);
    }
    return operator(value, other);
  };
}
var gt = createRelationalOperation(baseGt);
const gt$1 = gt;
var gte = createRelationalOperation(function(value, other) {
  return value >= other;
});
const gte$1 = gte;
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function baseHas(object2, key) {
  return object2 != null && hasOwnProperty$5.call(object2, key);
}
function has(object2, path) {
  return object2 != null && hasPath(object2, path, baseHas);
}
var nativeMax$8 = Math.max, nativeMin$9 = Math.min;
function baseInRange(number2, start, end) {
  return number2 >= nativeMin$9(start, end) && number2 < nativeMax$8(start, end);
}
function inRange(number2, start, end) {
  start = toFinite(start);
  if (end === void 0) {
    end = start;
    start = 0;
  } else {
    end = toFinite(end);
  }
  number2 = toNumber(number2);
  return baseInRange(number2, start, end);
}
var stringTag = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
}
function baseValues(object2, props) {
  return arrayMap(props, function(key) {
    return object2[key];
  });
}
function values(object2) {
  return object2 == null ? [] : baseValues(object2, keys(object2));
}
var nativeMax$7 = Math.max;
function includes(collection2, value, fromIndex, guard) {
  collection2 = isArrayLike(collection2) ? collection2 : values(collection2);
  fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
  var length = collection2.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax$7(length + fromIndex, 0);
  }
  return isString(collection2) ? fromIndex <= length && collection2.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection2, value, fromIndex) > -1;
}
var nativeMax$6 = Math.max;
function indexOf(array2, value, fromIndex) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax$6(length + index, 0);
  }
  return baseIndexOf(array2, value, index);
}
function initial(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? baseSlice(array2, 0, -1) : [];
}
var nativeMin$8 = Math.min;
function baseIntersection(arrays, iteratee2, comparator2) {
  var includes2 = comparator2 ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array(othLength), maxLength = Infinity, result2 = [];
  while (othIndex--) {
    var array2 = arrays[othIndex];
    if (othIndex && iteratee2) {
      array2 = arrayMap(array2, baseUnary(iteratee2));
    }
    maxLength = nativeMin$8(array2.length, maxLength);
    caches[othIndex] = !comparator2 && (iteratee2 || length >= 120 && array2.length >= 120) ? new SetCache(othIndex && array2) : void 0;
  }
  array2 = arrays[0];
  var index = -1, seen = caches[0];
  outer:
    while (++index < length && result2.length < maxLength) {
      var value = array2[index], computed2 = iteratee2 ? iteratee2(value) : value;
      value = comparator2 || value !== 0 ? value : 0;
      if (!(seen ? cacheHas(seen, computed2) : includes2(result2, computed2, comparator2))) {
        othIndex = othLength;
        while (--othIndex) {
          var cache = caches[othIndex];
          if (!(cache ? cacheHas(cache, computed2) : includes2(arrays[othIndex], computed2, comparator2))) {
            continue outer;
          }
        }
        if (seen) {
          seen.push(computed2);
        }
        result2.push(value);
      }
    }
  return result2;
}
function castArrayLikeObject(value) {
  return isArrayLikeObject(value) ? value : [];
}
var intersection = baseRest(function(arrays) {
  var mapped = arrayMap(arrays, castArrayLikeObject);
  return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
});
const intersection$1 = intersection;
var intersectionBy = baseRest(function(arrays) {
  var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
  if (iteratee2 === last(mapped)) {
    iteratee2 = void 0;
  } else {
    mapped.pop();
  }
  return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, baseIteratee(iteratee2)) : [];
});
const intersectionBy$1 = intersectionBy;
var intersectionWith = baseRest(function(arrays) {
  var comparator2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
  comparator2 = typeof comparator2 == "function" ? comparator2 : void 0;
  if (comparator2) {
    mapped.pop();
  }
  return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, void 0, comparator2) : [];
});
const intersectionWith$1 = intersectionWith;
function baseInverter(object2, setter, iteratee2, accumulator) {
  baseForOwn(object2, function(value, key, object3) {
    setter(accumulator, iteratee2(value), key, object3);
  });
  return accumulator;
}
function createInverter(setter, toIteratee) {
  return function(object2, iteratee2) {
    return baseInverter(object2, setter, toIteratee(iteratee2), {});
  };
}
var objectProto$5 = Object.prototype;
var nativeObjectToString$1 = objectProto$5.toString;
var invert = createInverter(function(result2, value, key) {
  if (value != null && typeof value.toString != "function") {
    value = nativeObjectToString$1.call(value);
  }
  result2[value] = key;
}, constant(identity));
const invert$1 = invert;
var objectProto$4 = Object.prototype;
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;
var nativeObjectToString = objectProto$4.toString;
var invertBy = createInverter(function(result2, value, key) {
  if (value != null && typeof value.toString != "function") {
    value = nativeObjectToString.call(value);
  }
  if (hasOwnProperty$4.call(result2, value)) {
    result2[value].push(key);
  } else {
    result2[value] = [key];
  }
}, baseIteratee);
const invertBy$1 = invertBy;
function parent(object2, path) {
  return path.length < 2 ? object2 : baseGet(object2, baseSlice(path, 0, -1));
}
function baseInvoke(object2, path, args) {
  path = castPath(path, object2);
  object2 = parent(object2, path);
  var func2 = object2 == null ? object2 : object2[toKey(last(path))];
  return func2 == null ? void 0 : apply(func2, object2, args);
}
var invoke = baseRest(baseInvoke);
const invoke$1 = invoke;
var invokeMap = baseRest(function(collection2, path, args) {
  var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection2) ? Array(collection2.length) : [];
  baseEach(collection2, function(value) {
    result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
  });
  return result2;
});
const invokeMap$1 = invokeMap;
var arrayBufferTag = "[object ArrayBuffer]";
function baseIsArrayBuffer(value) {
  return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
}
var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer;
var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
const isArrayBuffer$1 = isArrayBuffer;
var boolTag = "[object Boolean]";
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
}
var dateTag = "[object Date]";
function baseIsDate(value) {
  return isObjectLike(value) && baseGetTag(value) == dateTag;
}
var nodeIsDate = nodeUtil && nodeUtil.isDate;
var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
const isDate$1 = isDate;
function isElement(value) {
  return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
}
var mapTag$2 = "[object Map]", setTag$2 = "[object Set]";
var objectProto$3 = Object.prototype;
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer$1(value) || isTypedArray$1(value) || isArguments$1(value))) {
    return !value.length;
  }
  var tag = getTag$1(value);
  if (tag == mapTag$2 || tag == setTag$2) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty$3.call(value, key)) {
      return false;
    }
  }
  return true;
}
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
function isEqualWith(value, other, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  var result2 = customizer ? customizer(value, other) : void 0;
  return result2 === void 0 ? baseIsEqual(value, other, void 0, customizer) : !!result2;
}
var nativeIsFinite = root.isFinite;
function isFinite$1(value) {
  return typeof value == "number" && nativeIsFinite(value);
}
function isInteger(value) {
  return typeof value == "number" && value == toInteger(value);
}
function isMatch(object2, source) {
  return object2 === source || baseIsMatch(object2, source, getMatchData(source));
}
function isMatchWith(object2, source, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  return baseIsMatch(object2, source, getMatchData(source), customizer);
}
var numberTag = "[object Number]";
function isNumber(value) {
  return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
}
function isNaN$1(value) {
  return isNumber(value) && value != +value;
}
var isMaskable = coreJsData ? isFunction : stubFalse;
var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.";
function isNative(value) {
  if (isMaskable(value)) {
    throw new Error(CORE_ERROR_TEXT);
  }
  return baseIsNative(value);
}
function isNil(value) {
  return value == null;
}
function isNull(value) {
  return value === null;
}
var regexpTag = "[object RegExp]";
function baseIsRegExp(value) {
  return isObjectLike(value) && baseGetTag(value) == regexpTag;
}
var nodeIsRegExp = nodeUtil && nodeUtil.isRegExp;
var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
const isRegExp$1 = isRegExp;
var MAX_SAFE_INTEGER$4 = 9007199254740991;
function isSafeInteger(value) {
  return isInteger(value) && value >= -MAX_SAFE_INTEGER$4 && value <= MAX_SAFE_INTEGER$4;
}
function isUndefined(value) {
  return value === void 0;
}
var weakMapTag = "[object WeakMap]";
function isWeakMap(value) {
  return isObjectLike(value) && getTag$1(value) == weakMapTag;
}
var weakSetTag = "[object WeakSet]";
function isWeakSet(value) {
  return isObjectLike(value) && baseGetTag(value) == weakSetTag;
}
var CLONE_DEEP_FLAG$3 = 1;
function iteratee(func2) {
  return baseIteratee(typeof func2 == "function" ? func2 : baseClone(func2, CLONE_DEEP_FLAG$3));
}
var arrayProto$4 = Array.prototype;
var nativeJoin = arrayProto$4.join;
function join(array2, separator) {
  return array2 == null ? "" : nativeJoin.call(array2, separator);
}
var kebabCase = createCompounder(function(result2, word, index) {
  return result2 + (index ? "-" : "") + word.toLowerCase();
});
const kebabCase$1 = kebabCase;
var keyBy = createAggregator(function(result2, value, key) {
  baseAssignValue(result2, key, value);
});
const keyBy$1 = keyBy;
function strictLastIndexOf(array2, value, fromIndex) {
  var index = fromIndex + 1;
  while (index--) {
    if (array2[index] === value) {
      return index;
    }
  }
  return index;
}
var nativeMax$5 = Math.max, nativeMin$7 = Math.min;
function lastIndexOf(array2, value, fromIndex) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return -1;
  }
  var index = length;
  if (fromIndex !== void 0) {
    index = toInteger(fromIndex);
    index = index < 0 ? nativeMax$5(length + index, 0) : nativeMin$7(index, length - 1);
  }
  return value === value ? strictLastIndexOf(array2, value, index) : baseFindIndex(array2, baseIsNaN, index, true);
}
var lowerCase = createCompounder(function(result2, word, index) {
  return result2 + (index ? " " : "") + word.toLowerCase();
});
const lowerCase$1 = lowerCase;
var lowerFirst = createCaseFirst("toLowerCase");
const lowerFirst$1 = lowerFirst;
function baseLt(value, other) {
  return value < other;
}
var lt = createRelationalOperation(baseLt);
const lt$1 = lt;
var lte = createRelationalOperation(function(value, other) {
  return value <= other;
});
const lte$1 = lte;
function mapKeys(object2, iteratee2) {
  var result2 = {};
  iteratee2 = baseIteratee(iteratee2);
  baseForOwn(object2, function(value, key, object3) {
    baseAssignValue(result2, iteratee2(value, key, object3), value);
  });
  return result2;
}
function mapValues(object2, iteratee2) {
  var result2 = {};
  iteratee2 = baseIteratee(iteratee2);
  baseForOwn(object2, function(value, key, object3) {
    baseAssignValue(result2, key, iteratee2(value, key, object3));
  });
  return result2;
}
var CLONE_DEEP_FLAG$2 = 1;
function matches(source) {
  return baseMatches(baseClone(source, CLONE_DEEP_FLAG$2));
}
var CLONE_DEEP_FLAG$1 = 1;
function matchesProperty(path, srcValue) {
  return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG$1));
}
function baseExtremum(array2, iteratee2, comparator2) {
  var index = -1, length = array2.length;
  while (++index < length) {
    var value = array2[index], current = iteratee2(value);
    if (current != null && (computed2 === void 0 ? current === current && !isSymbol(current) : comparator2(current, computed2))) {
      var computed2 = current, result2 = value;
    }
  }
  return result2;
}
function max(array2) {
  return array2 && array2.length ? baseExtremum(array2, identity, baseGt) : void 0;
}
function maxBy(array2, iteratee2) {
  return array2 && array2.length ? baseExtremum(array2, baseIteratee(iteratee2), baseGt) : void 0;
}
function baseSum(array2, iteratee2) {
  var result2, index = -1, length = array2.length;
  while (++index < length) {
    var current = iteratee2(array2[index]);
    if (current !== void 0) {
      result2 = result2 === void 0 ? current : result2 + current;
    }
  }
  return result2;
}
var NAN = 0 / 0;
function baseMean(array2, iteratee2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? baseSum(array2, iteratee2) / length : NAN;
}
function mean(array2) {
  return baseMean(array2, identity);
}
function meanBy(array2, iteratee2) {
  return baseMean(array2, baseIteratee(iteratee2));
}
var merge = createAssigner(function(object2, source, srcIndex) {
  baseMerge(object2, source, srcIndex);
});
const merge$1 = merge;
var method = baseRest(function(path, args) {
  return function(object2) {
    return baseInvoke(object2, path, args);
  };
});
const method$1 = method;
var methodOf = baseRest(function(object2, args) {
  return function(path) {
    return baseInvoke(object2, path, args);
  };
});
const methodOf$1 = methodOf;
function min(array2) {
  return array2 && array2.length ? baseExtremum(array2, identity, baseLt) : void 0;
}
function minBy(array2, iteratee2) {
  return array2 && array2.length ? baseExtremum(array2, baseIteratee(iteratee2), baseLt) : void 0;
}
function mixin$1(object2, source, options) {
  var props = keys(source), methodNames = baseFunctions(source, props);
  var chain2 = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object2);
  arrayEach(methodNames, function(methodName) {
    var func2 = source[methodName];
    object2[methodName] = func2;
    if (isFunc) {
      object2.prototype[methodName] = function() {
        var chainAll = this.__chain__;
        if (chain2 || chainAll) {
          var result2 = object2(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
          actions.push({ "func": func2, "args": arguments, "thisArg": object2 });
          result2.__chain__ = chainAll;
          return result2;
        }
        return func2.apply(object2, arrayPush([this.value()], arguments));
      };
    }
  });
  return object2;
}
var multiply = createMathOperation(function(multiplier, multiplicand) {
  return multiplier * multiplicand;
}, 1);
const multiply$1 = multiply;
var FUNC_ERROR_TEXT$3 = "Expected a function";
function negate(predicate) {
  if (typeof predicate != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$3);
  }
  return function() {
    var args = arguments;
    switch (args.length) {
      case 0:
        return !predicate.call(this);
      case 1:
        return !predicate.call(this, args[0]);
      case 2:
        return !predicate.call(this, args[0], args[1]);
      case 3:
        return !predicate.call(this, args[0], args[1], args[2]);
    }
    return !predicate.apply(this, args);
  };
}
function iteratorToArray(iterator) {
  var data, result2 = [];
  while (!(data = iterator.next()).done) {
    result2.push(data.value);
  }
  return result2;
}
var mapTag$1 = "[object Map]", setTag$1 = "[object Set]";
var symIterator$1 = Symbol$1 ? Symbol$1.iterator : void 0;
function toArray(value) {
  if (!value) {
    return [];
  }
  if (isArrayLike(value)) {
    return isString(value) ? stringToArray$1(value) : copyArray(value);
  }
  if (symIterator$1 && value[symIterator$1]) {
    return iteratorToArray(value[symIterator$1]());
  }
  var tag = getTag$1(value), func2 = tag == mapTag$1 ? mapToArray : tag == setTag$1 ? setToArray : values;
  return func2(value);
}
function wrapperNext() {
  if (this.__values__ === void 0) {
    this.__values__ = toArray(this.value());
  }
  var done = this.__index__ >= this.__values__.length, value = done ? void 0 : this.__values__[this.__index__++];
  return { "done": done, "value": value };
}
function baseNth(array2, n) {
  var length = array2.length;
  if (!length) {
    return;
  }
  n += n < 0 ? length : 0;
  return isIndex(n, length) ? array2[n] : void 0;
}
function nth(array2, n) {
  return array2 && array2.length ? baseNth(array2, toInteger(n)) : void 0;
}
function nthArg(n) {
  n = toInteger(n);
  return baseRest(function(args) {
    return baseNth(args, n);
  });
}
function baseUnset(object2, path) {
  path = castPath(path, object2);
  object2 = parent(object2, path);
  return object2 == null || delete object2[toKey(last(path))];
}
function customOmitClone(value) {
  return isPlainObject(value) ? void 0 : value;
}
var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
var omit = flatRest(function(object2, paths) {
  var result2 = {};
  if (object2 == null) {
    return result2;
  }
  var isDeep = false;
  paths = arrayMap(paths, function(path) {
    path = castPath(path, object2);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object2, getAllKeysIn(object2), result2);
  if (isDeep) {
    result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    baseUnset(result2, paths[length]);
  }
  return result2;
});
const omit$1 = omit;
function baseSet(object2, path, value, customizer) {
  if (!isObject(object2)) {
    return object2;
  }
  path = castPath(path, object2);
  var index = -1, length = path.length, lastIndex = length - 1, nested = object2;
  while (nested != null && ++index < length) {
    var key = toKey(path[index]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object2;
    }
    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : void 0;
      if (newValue === void 0) {
        newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object2;
}
function basePickBy(object2, paths, predicate) {
  var index = -1, length = paths.length, result2 = {};
  while (++index < length) {
    var path = paths[index], value = baseGet(object2, path);
    if (predicate(value, path)) {
      baseSet(result2, castPath(path, object2), value);
    }
  }
  return result2;
}
function pickBy(object2, predicate) {
  if (object2 == null) {
    return {};
  }
  var props = arrayMap(getAllKeysIn(object2), function(prop) {
    return [prop];
  });
  predicate = baseIteratee(predicate);
  return basePickBy(object2, props, function(value, path) {
    return predicate(value, path[0]);
  });
}
function omitBy(object2, predicate) {
  return pickBy(object2, negate(baseIteratee(predicate)));
}
function once(func2) {
  return before(2, func2);
}
function baseSortBy(array2, comparer) {
  var length = array2.length;
  array2.sort(comparer);
  while (length--) {
    array2[length] = array2[length].value;
  }
  return array2;
}
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
    var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
    if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
      return 1;
    }
    if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}
function compareMultiple(object2, other, orders) {
  var index = -1, objCriteria = object2.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
  while (++index < length) {
    var result2 = compareAscending(objCriteria[index], othCriteria[index]);
    if (result2) {
      if (index >= ordersLength) {
        return result2;
      }
      var order = orders[index];
      return result2 * (order == "desc" ? -1 : 1);
    }
  }
  return object2.index - other.index;
}
function baseOrderBy(collection2, iteratees, orders) {
  if (iteratees.length) {
    iteratees = arrayMap(iteratees, function(iteratee2) {
      if (isArray(iteratee2)) {
        return function(value) {
          return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
        };
      }
      return iteratee2;
    });
  } else {
    iteratees = [identity];
  }
  var index = -1;
  iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
  var result2 = baseMap(collection2, function(value, key, collection3) {
    var criteria = arrayMap(iteratees, function(iteratee2) {
      return iteratee2(value);
    });
    return { "criteria": criteria, "index": ++index, "value": value };
  });
  return baseSortBy(result2, function(object2, other) {
    return compareMultiple(object2, other, orders);
  });
}
function orderBy(collection2, iteratees, orders, guard) {
  if (collection2 == null) {
    return [];
  }
  if (!isArray(iteratees)) {
    iteratees = iteratees == null ? [] : [iteratees];
  }
  orders = guard ? void 0 : orders;
  if (!isArray(orders)) {
    orders = orders == null ? [] : [orders];
  }
  return baseOrderBy(collection2, iteratees, orders);
}
function createOver(arrayFunc) {
  return flatRest(function(iteratees) {
    iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
    return baseRest(function(args) {
      var thisArg = this;
      return arrayFunc(iteratees, function(iteratee2) {
        return apply(iteratee2, thisArg, args);
      });
    });
  });
}
var over = createOver(arrayMap);
const over$1 = over;
var castRest = baseRest;
var nativeMin$6 = Math.min;
var overArgs = castRest(function(func2, transforms) {
  transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(baseIteratee)) : arrayMap(baseFlatten(transforms, 1), baseUnary(baseIteratee));
  var funcsLength = transforms.length;
  return baseRest(function(args) {
    var index = -1, length = nativeMin$6(args.length, funcsLength);
    while (++index < length) {
      args[index] = transforms[index].call(this, args[index]);
    }
    return apply(func2, this, args);
  });
});
const overArgs$1 = overArgs;
var overEvery = createOver(arrayEvery);
const overEvery$1 = overEvery;
var overSome = createOver(arraySome);
const overSome$1 = overSome;
var MAX_SAFE_INTEGER$3 = 9007199254740991;
var nativeFloor$3 = Math.floor;
function baseRepeat(string2, n) {
  var result2 = "";
  if (!string2 || n < 1 || n > MAX_SAFE_INTEGER$3) {
    return result2;
  }
  do {
    if (n % 2) {
      result2 += string2;
    }
    n = nativeFloor$3(n / 2);
    if (n) {
      string2 += string2;
    }
  } while (n);
  return result2;
}
var asciiSize = baseProperty("length");
var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange + "]", rsCombo = "[" + rsComboRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ = "\\u200d";
var reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
function unicodeSize(string2) {
  var result2 = reUnicode.lastIndex = 0;
  while (reUnicode.test(string2)) {
    ++result2;
  }
  return result2;
}
function stringSize(string2) {
  return hasUnicode(string2) ? unicodeSize(string2) : asciiSize(string2);
}
var nativeCeil$2 = Math.ceil;
function createPadding(length, chars) {
  chars = chars === void 0 ? " " : baseToString(chars);
  var charsLength = chars.length;
  if (charsLength < 2) {
    return charsLength ? baseRepeat(chars, length) : chars;
  }
  var result2 = baseRepeat(chars, nativeCeil$2(length / stringSize(chars)));
  return hasUnicode(chars) ? castSlice(stringToArray$1(result2), 0, length).join("") : result2.slice(0, length);
}
var nativeCeil$1 = Math.ceil, nativeFloor$2 = Math.floor;
function pad(string2, length, chars) {
  string2 = toString(string2);
  length = toInteger(length);
  var strLength = length ? stringSize(string2) : 0;
  if (!length || strLength >= length) {
    return string2;
  }
  var mid = (length - strLength) / 2;
  return createPadding(nativeFloor$2(mid), chars) + string2 + createPadding(nativeCeil$1(mid), chars);
}
function padEnd(string2, length, chars) {
  string2 = toString(string2);
  length = toInteger(length);
  var strLength = length ? stringSize(string2) : 0;
  return length && strLength < length ? string2 + createPadding(length - strLength, chars) : string2;
}
function padStart(string2, length, chars) {
  string2 = toString(string2);
  length = toInteger(length);
  var strLength = length ? stringSize(string2) : 0;
  return length && strLength < length ? createPadding(length - strLength, chars) + string2 : string2;
}
var reTrimStart$1 = /^\s+/;
var nativeParseInt = root.parseInt;
function parseInt$1(string2, radix, guard) {
  if (guard || radix == null) {
    radix = 0;
  } else if (radix) {
    radix = +radix;
  }
  return nativeParseInt(toString(string2).replace(reTrimStart$1, ""), radix || 0);
}
var WRAP_PARTIAL_FLAG = 32;
var partial = baseRest(function(func2, partials) {
  var holders = replaceHolders(partials, getHolder(partial));
  return createWrap(func2, WRAP_PARTIAL_FLAG, void 0, partials, holders);
});
partial.placeholder = {};
const partial$1 = partial;
var WRAP_PARTIAL_RIGHT_FLAG = 64;
var partialRight = baseRest(function(func2, partials) {
  var holders = replaceHolders(partials, getHolder(partialRight));
  return createWrap(func2, WRAP_PARTIAL_RIGHT_FLAG, void 0, partials, holders);
});
partialRight.placeholder = {};
const partialRight$1 = partialRight;
var partition = createAggregator(function(result2, value, key) {
  result2[key ? 0 : 1].push(value);
}, function() {
  return [[], []];
});
const partition$1 = partition;
function basePick(object2, paths) {
  return basePickBy(object2, paths, function(value, path) {
    return hasIn(object2, path);
  });
}
var pick = flatRest(function(object2, paths) {
  return object2 == null ? {} : basePick(object2, paths);
});
const pick$1 = pick;
function wrapperPlant(value) {
  var result2, parent2 = this;
  while (parent2 instanceof baseLodash) {
    var clone2 = wrapperClone(parent2);
    clone2.__index__ = 0;
    clone2.__values__ = void 0;
    if (result2) {
      previous.__wrapped__ = clone2;
    } else {
      result2 = clone2;
    }
    var previous = clone2;
    parent2 = parent2.__wrapped__;
  }
  previous.__wrapped__ = value;
  return result2;
}
function propertyOf(object2) {
  return function(path) {
    return object2 == null ? void 0 : baseGet(object2, path);
  };
}
function baseIndexOfWith(array2, value, fromIndex, comparator2) {
  var index = fromIndex - 1, length = array2.length;
  while (++index < length) {
    if (comparator2(array2[index], value)) {
      return index;
    }
  }
  return -1;
}
var arrayProto$3 = Array.prototype;
var splice$1 = arrayProto$3.splice;
function basePullAll(array2, values2, iteratee2, comparator2) {
  var indexOf2 = comparator2 ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen = array2;
  if (array2 === values2) {
    values2 = copyArray(values2);
  }
  if (iteratee2) {
    seen = arrayMap(array2, baseUnary(iteratee2));
  }
  while (++index < length) {
    var fromIndex = 0, value = values2[index], computed2 = iteratee2 ? iteratee2(value) : value;
    while ((fromIndex = indexOf2(seen, computed2, fromIndex, comparator2)) > -1) {
      if (seen !== array2) {
        splice$1.call(seen, fromIndex, 1);
      }
      splice$1.call(array2, fromIndex, 1);
    }
  }
  return array2;
}
function pullAll(array2, values2) {
  return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2) : array2;
}
var pull = baseRest(pullAll);
const pull$1 = pull;
function pullAllBy(array2, values2, iteratee2) {
  return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, baseIteratee(iteratee2)) : array2;
}
function pullAllWith(array2, values2, comparator2) {
  return array2 && array2.length && values2 && values2.length ? basePullAll(array2, values2, void 0, comparator2) : array2;
}
var arrayProto$2 = Array.prototype;
var splice = arrayProto$2.splice;
function basePullAt(array2, indexes) {
  var length = array2 ? indexes.length : 0, lastIndex = length - 1;
  while (length--) {
    var index = indexes[length];
    if (length == lastIndex || index !== previous) {
      var previous = index;
      if (isIndex(index)) {
        splice.call(array2, index, 1);
      } else {
        baseUnset(array2, index);
      }
    }
  }
  return array2;
}
var pullAt = flatRest(function(array2, indexes) {
  var length = array2 == null ? 0 : array2.length, result2 = baseAt(array2, indexes);
  basePullAt(array2, arrayMap(indexes, function(index) {
    return isIndex(index, length) ? +index : index;
  }).sort(compareAscending));
  return result2;
});
const pullAt$1 = pullAt;
var nativeFloor$1 = Math.floor, nativeRandom$1 = Math.random;
function baseRandom(lower, upper) {
  return lower + nativeFloor$1(nativeRandom$1() * (upper - lower + 1));
}
var freeParseFloat = parseFloat;
var nativeMin$5 = Math.min, nativeRandom = Math.random;
function random(lower, upper, floating) {
  if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
    upper = floating = void 0;
  }
  if (floating === void 0) {
    if (typeof upper == "boolean") {
      floating = upper;
      upper = void 0;
    } else if (typeof lower == "boolean") {
      floating = lower;
      lower = void 0;
    }
  }
  if (lower === void 0 && upper === void 0) {
    lower = 0;
    upper = 1;
  } else {
    lower = toFinite(lower);
    if (upper === void 0) {
      upper = lower;
      lower = 0;
    } else {
      upper = toFinite(upper);
    }
  }
  if (lower > upper) {
    var temp = lower;
    lower = upper;
    upper = temp;
  }
  if (floating || lower % 1 || upper % 1) {
    var rand = nativeRandom();
    return nativeMin$5(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
  }
  return baseRandom(lower, upper);
}
var nativeCeil = Math.ceil, nativeMax$4 = Math.max;
function baseRange(start, end, step, fromRight) {
  var index = -1, length = nativeMax$4(nativeCeil((end - start) / (step || 1)), 0), result2 = Array(length);
  while (length--) {
    result2[fromRight ? length : ++index] = start;
    start += step;
  }
  return result2;
}
function createRange(fromRight) {
  return function(start, end, step) {
    if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
      end = step = void 0;
    }
    start = toFinite(start);
    if (end === void 0) {
      end = start;
      start = 0;
    } else {
      end = toFinite(end);
    }
    step = step === void 0 ? start < end ? 1 : -1 : toFinite(step);
    return baseRange(start, end, step, fromRight);
  };
}
var range = createRange();
const range$1 = range;
var rangeRight = createRange(true);
const rangeRight$1 = rangeRight;
var WRAP_REARG_FLAG = 256;
var rearg = flatRest(function(func2, indexes) {
  return createWrap(func2, WRAP_REARG_FLAG, void 0, void 0, void 0, indexes);
});
const rearg$1 = rearg;
function baseReduce(collection2, iteratee2, accumulator, initAccum, eachFunc) {
  eachFunc(collection2, function(value, index, collection3) {
    accumulator = initAccum ? (initAccum = false, value) : iteratee2(accumulator, value, index, collection3);
  });
  return accumulator;
}
function reduce(collection2, iteratee2, accumulator) {
  var func2 = isArray(collection2) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
  return func2(collection2, baseIteratee(iteratee2), accumulator, initAccum, baseEach);
}
function arrayReduceRight(array2, iteratee2, accumulator, initAccum) {
  var length = array2 == null ? 0 : array2.length;
  if (initAccum && length) {
    accumulator = array2[--length];
  }
  while (length--) {
    accumulator = iteratee2(accumulator, array2[length], length, array2);
  }
  return accumulator;
}
function reduceRight(collection2, iteratee2, accumulator) {
  var func2 = isArray(collection2) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
  return func2(collection2, baseIteratee(iteratee2), accumulator, initAccum, baseEachRight$1);
}
function reject(collection2, predicate) {
  var func2 = isArray(collection2) ? arrayFilter : baseFilter;
  return func2(collection2, negate(baseIteratee(predicate)));
}
function remove(array2, predicate) {
  var result2 = [];
  if (!(array2 && array2.length)) {
    return result2;
  }
  var index = -1, indexes = [], length = array2.length;
  predicate = baseIteratee(predicate);
  while (++index < length) {
    var value = array2[index];
    if (predicate(value, index, array2)) {
      result2.push(value);
      indexes.push(index);
    }
  }
  basePullAt(array2, indexes);
  return result2;
}
function repeat(string2, n, guard) {
  if (guard ? isIterateeCall(string2, n, guard) : n === void 0) {
    n = 1;
  } else {
    n = toInteger(n);
  }
  return baseRepeat(toString(string2), n);
}
function replace() {
  var args = arguments, string2 = toString(args[0]);
  return args.length < 3 ? string2 : string2.replace(args[1], args[2]);
}
var FUNC_ERROR_TEXT$2 = "Expected a function";
function rest(func2, start) {
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$2);
  }
  start = start === void 0 ? start : toInteger(start);
  return baseRest(func2, start);
}
function result(object2, path, defaultValue) {
  path = castPath(path, object2);
  var index = -1, length = path.length;
  if (!length) {
    length = 1;
    object2 = void 0;
  }
  while (++index < length) {
    var value = object2 == null ? void 0 : object2[toKey(path[index])];
    if (value === void 0) {
      index = length;
      value = defaultValue;
    }
    object2 = isFunction(value) ? value.call(object2) : value;
  }
  return object2;
}
var arrayProto$1 = Array.prototype;
var nativeReverse = arrayProto$1.reverse;
function reverse(array2) {
  return array2 == null ? array2 : nativeReverse.call(array2);
}
var round = createRound("round");
const round$1 = round;
function arraySample(array2) {
  var length = array2.length;
  return length ? array2[baseRandom(0, length - 1)] : void 0;
}
function baseSample(collection2) {
  return arraySample(values(collection2));
}
function sample(collection2) {
  var func2 = isArray(collection2) ? arraySample : baseSample;
  return func2(collection2);
}
function shuffleSelf(array2, size2) {
  var index = -1, length = array2.length, lastIndex = length - 1;
  size2 = size2 === void 0 ? length : size2;
  while (++index < size2) {
    var rand = baseRandom(index, lastIndex), value = array2[rand];
    array2[rand] = array2[index];
    array2[index] = value;
  }
  array2.length = size2;
  return array2;
}
function arraySampleSize(array2, n) {
  return shuffleSelf(copyArray(array2), baseClamp(n, 0, array2.length));
}
function baseSampleSize(collection2, n) {
  var array2 = values(collection2);
  return shuffleSelf(array2, baseClamp(n, 0, array2.length));
}
function sampleSize(collection2, n, guard) {
  if (guard ? isIterateeCall(collection2, n, guard) : n === void 0) {
    n = 1;
  } else {
    n = toInteger(n);
  }
  var func2 = isArray(collection2) ? arraySampleSize : baseSampleSize;
  return func2(collection2, n);
}
function set(object2, path, value) {
  return object2 == null ? object2 : baseSet(object2, path, value);
}
function setWith(object2, path, value, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  return object2 == null ? object2 : baseSet(object2, path, value, customizer);
}
function arrayShuffle(array2) {
  return shuffleSelf(copyArray(array2));
}
function baseShuffle(collection2) {
  return shuffleSelf(values(collection2));
}
function shuffle(collection2) {
  var func2 = isArray(collection2) ? arrayShuffle : baseShuffle;
  return func2(collection2);
}
var mapTag = "[object Map]", setTag = "[object Set]";
function size(collection2) {
  if (collection2 == null) {
    return 0;
  }
  if (isArrayLike(collection2)) {
    return isString(collection2) ? stringSize(collection2) : collection2.length;
  }
  var tag = getTag$1(collection2);
  if (tag == mapTag || tag == setTag) {
    return collection2.size;
  }
  return baseKeys(collection2).length;
}
function slice(array2, start, end) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  if (end && typeof end != "number" && isIterateeCall(array2, start, end)) {
    start = 0;
    end = length;
  } else {
    start = start == null ? 0 : toInteger(start);
    end = end === void 0 ? length : toInteger(end);
  }
  return baseSlice(array2, start, end);
}
var snakeCase = createCompounder(function(result2, word, index) {
  return result2 + (index ? "_" : "") + word.toLowerCase();
});
const snakeCase$1 = snakeCase;
function baseSome(collection2, predicate) {
  var result2;
  baseEach(collection2, function(value, index, collection3) {
    result2 = predicate(value, index, collection3);
    return !result2;
  });
  return !!result2;
}
function some(collection2, predicate, guard) {
  var func2 = isArray(collection2) ? arraySome : baseSome;
  if (guard && isIterateeCall(collection2, predicate, guard)) {
    predicate = void 0;
  }
  return func2(collection2, baseIteratee(predicate));
}
var sortBy = baseRest(function(collection2, iteratees) {
  if (collection2 == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall(collection2, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection2, baseFlatten(iteratees, 1), []);
});
const sortBy$1 = sortBy;
var MAX_ARRAY_LENGTH$4 = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH$4 - 1;
var nativeFloor = Math.floor, nativeMin$4 = Math.min;
function baseSortedIndexBy(array2, value, iteratee2, retHighest) {
  var low = 0, high = array2 == null ? 0 : array2.length;
  if (high === 0) {
    return 0;
  }
  value = iteratee2(value);
  var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === void 0;
  while (low < high) {
    var mid = nativeFloor((low + high) / 2), computed2 = iteratee2(array2[mid]), othIsDefined = computed2 !== void 0, othIsNull = computed2 === null, othIsReflexive = computed2 === computed2, othIsSymbol = isSymbol(computed2);
    if (valIsNaN) {
      var setLow = retHighest || othIsReflexive;
    } else if (valIsUndefined) {
      setLow = othIsReflexive && (retHighest || othIsDefined);
    } else if (valIsNull) {
      setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
    } else if (valIsSymbol) {
      setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
    } else if (othIsNull || othIsSymbol) {
      setLow = false;
    } else {
      setLow = retHighest ? computed2 <= value : computed2 < value;
    }
    if (setLow) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return nativeMin$4(high, MAX_ARRAY_INDEX);
}
var MAX_ARRAY_LENGTH$3 = 4294967295, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH$3 >>> 1;
function baseSortedIndex(array2, value, retHighest) {
  var low = 0, high = array2 == null ? low : array2.length;
  if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
    while (low < high) {
      var mid = low + high >>> 1, computed2 = array2[mid];
      if (computed2 !== null && !isSymbol(computed2) && (retHighest ? computed2 <= value : computed2 < value)) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  }
  return baseSortedIndexBy(array2, value, identity, retHighest);
}
function sortedIndex(array2, value) {
  return baseSortedIndex(array2, value);
}
function sortedIndexBy(array2, value, iteratee2) {
  return baseSortedIndexBy(array2, value, baseIteratee(iteratee2));
}
function sortedIndexOf(array2, value) {
  var length = array2 == null ? 0 : array2.length;
  if (length) {
    var index = baseSortedIndex(array2, value);
    if (index < length && eq(array2[index], value)) {
      return index;
    }
  }
  return -1;
}
function sortedLastIndex(array2, value) {
  return baseSortedIndex(array2, value, true);
}
function sortedLastIndexBy(array2, value, iteratee2) {
  return baseSortedIndexBy(array2, value, baseIteratee(iteratee2), true);
}
function sortedLastIndexOf(array2, value) {
  var length = array2 == null ? 0 : array2.length;
  if (length) {
    var index = baseSortedIndex(array2, value, true) - 1;
    if (eq(array2[index], value)) {
      return index;
    }
  }
  return -1;
}
function baseSortedUniq(array2, iteratee2) {
  var index = -1, length = array2.length, resIndex = 0, result2 = [];
  while (++index < length) {
    var value = array2[index], computed2 = iteratee2 ? iteratee2(value) : value;
    if (!index || !eq(computed2, seen)) {
      var seen = computed2;
      result2[resIndex++] = value === 0 ? 0 : value;
    }
  }
  return result2;
}
function sortedUniq(array2) {
  return array2 && array2.length ? baseSortedUniq(array2) : [];
}
function sortedUniqBy(array2, iteratee2) {
  return array2 && array2.length ? baseSortedUniq(array2, baseIteratee(iteratee2)) : [];
}
var MAX_ARRAY_LENGTH$2 = 4294967295;
function split(string2, separator, limit) {
  if (limit && typeof limit != "number" && isIterateeCall(string2, separator, limit)) {
    separator = limit = void 0;
  }
  limit = limit === void 0 ? MAX_ARRAY_LENGTH$2 : limit >>> 0;
  if (!limit) {
    return [];
  }
  string2 = toString(string2);
  if (string2 && (typeof separator == "string" || separator != null && !isRegExp$1(separator))) {
    separator = baseToString(separator);
    if (!separator && hasUnicode(string2)) {
      return castSlice(stringToArray$1(string2), 0, limit);
    }
  }
  return string2.split(separator, limit);
}
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax$3 = Math.max;
function spread(func2, start) {
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  start = start == null ? 0 : nativeMax$3(toInteger(start), 0);
  return baseRest(function(args) {
    var array2 = args[start], otherArgs = castSlice(args, 0, start);
    if (array2) {
      arrayPush(otherArgs, array2);
    }
    return apply(func2, this, otherArgs);
  });
}
var startCase = createCompounder(function(result2, word, index) {
  return result2 + (index ? " " : "") + upperFirst$1(word);
});
const startCase$1 = startCase;
function startsWith(string2, target, position) {
  string2 = toString(string2);
  position = position == null ? 0 : baseClamp(toInteger(position), 0, string2.length);
  target = baseToString(target);
  return string2.slice(position, position + target.length) == target;
}
function stubObject() {
  return {};
}
function stubString() {
  return "";
}
function stubTrue() {
  return true;
}
var subtract = createMathOperation(function(minuend, subtrahend) {
  return minuend - subtrahend;
}, 0);
const subtract$1 = subtract;
function sum(array2) {
  return array2 && array2.length ? baseSum(array2, identity) : 0;
}
function sumBy(array2, iteratee2) {
  return array2 && array2.length ? baseSum(array2, baseIteratee(iteratee2)) : 0;
}
function tail(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? baseSlice(array2, 1, length) : [];
}
function take(array2, n, guard) {
  if (!(array2 && array2.length)) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger(n);
  return baseSlice(array2, 0, n < 0 ? 0 : n);
}
function takeRight(array2, n, guard) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return [];
  }
  n = guard || n === void 0 ? 1 : toInteger(n);
  n = length - n;
  return baseSlice(array2, n < 0 ? 0 : n, length);
}
function takeRightWhile(array2, predicate) {
  return array2 && array2.length ? baseWhile(array2, baseIteratee(predicate), false, true) : [];
}
function takeWhile(array2, predicate) {
  return array2 && array2.length ? baseWhile(array2, baseIteratee(predicate)) : [];
}
function tap(value, interceptor) {
  interceptor(value);
  return value;
}
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function customDefaultsAssignIn(objValue, srcValue, key, object2) {
  if (objValue === void 0 || eq(objValue, objectProto$2[key]) && !hasOwnProperty$2.call(object2, key)) {
    return srcValue;
  }
  return objValue;
}
var stringEscapes = {
  "\\": "\\",
  "'": "'",
  "\n": "n",
  "\r": "r",
  "\u2028": "u2028",
  "\u2029": "u2029"
};
function escapeStringChar(chr) {
  return "\\" + stringEscapes[chr];
}
var reInterpolate = /<%=([\s\S]+?)%>/g;
const reInterpolate$1 = reInterpolate;
var reEscape = /<%-([\s\S]+?)%>/g;
const reEscape$1 = reEscape;
var reEvaluate = /<%([\s\S]+?)%>/g;
const reEvaluate$1 = reEvaluate;
var templateSettings = {
  /**
   * Used to detect `data` property values to be HTML-escaped.
   *
   * @memberOf _.templateSettings
   * @type {RegExp}
   */
  "escape": reEscape$1,
  /**
   * Used to detect code to be evaluated.
   *
   * @memberOf _.templateSettings
   * @type {RegExp}
   */
  "evaluate": reEvaluate$1,
  /**
   * Used to detect `data` property values to inject.
   *
   * @memberOf _.templateSettings
   * @type {RegExp}
   */
  "interpolate": reInterpolate$1,
  /**
   * Used to reference the data object in the template text.
   *
   * @memberOf _.templateSettings
   * @type {string}
   */
  "variable": "",
  /**
   * Used to import variables into the compiled template.
   *
   * @memberOf _.templateSettings
   * @type {Object}
   */
  "imports": {
    /**
     * A reference to the `lodash` function.
     *
     * @memberOf _.templateSettings.imports
     * @type {Function}
     */
    "_": { "escape": escape }
  }
};
const templateSettings$1 = templateSettings;
var INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
var reNoMatch = /($^)/;
var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function template(string2, options, guard) {
  var settings = templateSettings$1.imports._.templateSettings || templateSettings$1;
  if (guard && isIterateeCall(string2, options, guard)) {
    options = void 0;
  }
  string2 = toString(string2);
  options = extendWith({}, options, settings, customDefaultsAssignIn);
  var imports = extendWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
  var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
  var reDelimiters = RegExp(
    (options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate$1 ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
    "g"
  );
  var sourceURL = hasOwnProperty$1.call(options, "sourceURL") ? "//# sourceURL=" + (options.sourceURL + "").replace(/\s/g, " ") + "\n" : "";
  string2.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
    interpolateValue || (interpolateValue = esTemplateValue);
    source += string2.slice(index, offset).replace(reUnescapedString, escapeStringChar);
    if (escapeValue) {
      isEscaping = true;
      source += "' +\n__e(" + escapeValue + ") +\n'";
    }
    if (evaluateValue) {
      isEvaluating = true;
      source += "';\n" + evaluateValue + ";\n__p += '";
    }
    if (interpolateValue) {
      source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
    }
    index = offset + match.length;
    return match;
  });
  source += "';\n";
  var variable = hasOwnProperty$1.call(options, "variable") && options.variable;
  if (!variable) {
    source = "with (obj) {\n" + source + "\n}\n";
  } else if (reForbiddenIdentifierChars.test(variable)) {
    throw new Error(INVALID_TEMPL_VAR_ERROR_TEXT);
  }
  source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
  source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
  var result2 = attempt$1(function() {
    return Function(importsKeys, sourceURL + "return " + source).apply(void 0, importsValues);
  });
  result2.source = source;
  if (isError(result2)) {
    throw result2;
  }
  return result2;
}
var FUNC_ERROR_TEXT = "Expected a function";
function throttle(func2, wait, options) {
  var leading = true, trailing = true;
  if (typeof func2 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func2, wait, {
    "leading": leading,
    "maxWait": wait,
    "trailing": trailing
  });
}
function thru(value, interceptor) {
  return interceptor(value);
}
var MAX_SAFE_INTEGER$2 = 9007199254740991;
var MAX_ARRAY_LENGTH$1 = 4294967295;
var nativeMin$3 = Math.min;
function times(n, iteratee2) {
  n = toInteger(n);
  if (n < 1 || n > MAX_SAFE_INTEGER$2) {
    return [];
  }
  var index = MAX_ARRAY_LENGTH$1, length = nativeMin$3(n, MAX_ARRAY_LENGTH$1);
  iteratee2 = castFunction(iteratee2);
  n -= MAX_ARRAY_LENGTH$1;
  var result2 = baseTimes(length, iteratee2);
  while (++index < n) {
    iteratee2(index);
  }
  return result2;
}
function wrapperToIterator() {
  return this;
}
function baseWrapperValue(value, actions) {
  var result2 = value;
  if (result2 instanceof LazyWrapper) {
    result2 = result2.value();
  }
  return arrayReduce(actions, function(result3, action) {
    return action.func.apply(action.thisArg, arrayPush([result3], action.args));
  }, result2);
}
function wrapperValue() {
  return baseWrapperValue(this.__wrapped__, this.__actions__);
}
function toLower(value) {
  return toString(value).toLowerCase();
}
function toPath(value) {
  if (isArray(value)) {
    return arrayMap(value, toKey);
  }
  return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
function toSafeInteger(value) {
  return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER$1, MAX_SAFE_INTEGER$1) : value === 0 ? value : 0;
}
function toUpper(value) {
  return toString(value).toUpperCase();
}
function transform(object2, iteratee2, accumulator) {
  var isArr = isArray(object2), isArrLike = isArr || isBuffer$1(object2) || isTypedArray$1(object2);
  iteratee2 = baseIteratee(iteratee2);
  if (accumulator == null) {
    var Ctor = object2 && object2.constructor;
    if (isArrLike) {
      accumulator = isArr ? new Ctor() : [];
    } else if (isObject(object2)) {
      accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object2)) : {};
    } else {
      accumulator = {};
    }
  }
  (isArrLike ? arrayEach : baseForOwn)(object2, function(value, index, object3) {
    return iteratee2(accumulator, value, index, object3);
  });
  return accumulator;
}
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;
  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
  }
  return index;
}
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1, length = strSymbols.length;
  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
  }
  return index;
}
function trim(string2, chars, guard) {
  string2 = toString(string2);
  if (string2 && (guard || chars === void 0)) {
    return baseTrim(string2);
  }
  if (!string2 || !(chars = baseToString(chars))) {
    return string2;
  }
  var strSymbols = stringToArray$1(string2), chrSymbols = stringToArray$1(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
  return castSlice(strSymbols, start, end).join("");
}
function trimEnd(string2, chars, guard) {
  string2 = toString(string2);
  if (string2 && (guard || chars === void 0)) {
    return string2.slice(0, trimmedEndIndex(string2) + 1);
  }
  if (!string2 || !(chars = baseToString(chars))) {
    return string2;
  }
  var strSymbols = stringToArray$1(string2), end = charsEndIndex(strSymbols, stringToArray$1(chars)) + 1;
  return castSlice(strSymbols, 0, end).join("");
}
var reTrimStart = /^\s+/;
function trimStart(string2, chars, guard) {
  string2 = toString(string2);
  if (string2 && (guard || chars === void 0)) {
    return string2.replace(reTrimStart, "");
  }
  if (!string2 || !(chars = baseToString(chars))) {
    return string2;
  }
  var strSymbols = stringToArray$1(string2), start = charsStartIndex(strSymbols, stringToArray$1(chars));
  return castSlice(strSymbols, start).join("");
}
var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
var reFlags = /\w*$/;
function truncate(string2, options) {
  var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
  if (isObject(options)) {
    var separator = "separator" in options ? options.separator : separator;
    length = "length" in options ? toInteger(options.length) : length;
    omission = "omission" in options ? baseToString(options.omission) : omission;
  }
  string2 = toString(string2);
  var strLength = string2.length;
  if (hasUnicode(string2)) {
    var strSymbols = stringToArray$1(string2);
    strLength = strSymbols.length;
  }
  if (length >= strLength) {
    return string2;
  }
  var end = length - stringSize(omission);
  if (end < 1) {
    return omission;
  }
  var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string2.slice(0, end);
  if (separator === void 0) {
    return result2 + omission;
  }
  if (strSymbols) {
    end += result2.length - end;
  }
  if (isRegExp$1(separator)) {
    if (string2.slice(end).search(separator)) {
      var match, substring = result2;
      if (!separator.global) {
        separator = RegExp(separator.source, toString(reFlags.exec(separator)) + "g");
      }
      separator.lastIndex = 0;
      while (match = separator.exec(substring)) {
        var newEnd = match.index;
      }
      result2 = result2.slice(0, newEnd === void 0 ? end : newEnd);
    }
  } else if (string2.indexOf(baseToString(separator), end) != end) {
    var index = result2.lastIndexOf(separator);
    if (index > -1) {
      result2 = result2.slice(0, index);
    }
  }
  return result2 + omission;
}
function unary(func2) {
  return ary(func2, 1);
}
var htmlUnescapes = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'"
};
var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
const unescapeHtmlChar$1 = unescapeHtmlChar;
var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reHasEscapedHtml = RegExp(reEscapedHtml.source);
function unescape(string2) {
  string2 = toString(string2);
  return string2 && reHasEscapedHtml.test(string2) ? string2.replace(reEscapedHtml, unescapeHtmlChar$1) : string2;
}
var INFINITY = 1 / 0;
var createSet = !(Set$1 && 1 / setToArray(new Set$1([, -0]))[1] == INFINITY) ? noop : function(values2) {
  return new Set$1(values2);
};
var LARGE_ARRAY_SIZE = 200;
function baseUniq(array2, iteratee2, comparator2) {
  var index = -1, includes2 = arrayIncludes, length = array2.length, isCommon = true, result2 = [], seen = result2;
  if (comparator2) {
    isCommon = false;
    includes2 = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set2 = iteratee2 ? null : createSet(array2);
    if (set2) {
      return setToArray(set2);
    }
    isCommon = false;
    includes2 = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee2 ? [] : result2;
  }
  outer:
    while (++index < length) {
      var value = array2[index], computed2 = iteratee2 ? iteratee2(value) : value;
      value = comparator2 || value !== 0 ? value : 0;
      if (isCommon && computed2 === computed2) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed2) {
            continue outer;
          }
        }
        if (iteratee2) {
          seen.push(computed2);
        }
        result2.push(value);
      } else if (!includes2(seen, computed2, comparator2)) {
        if (seen !== result2) {
          seen.push(computed2);
        }
        result2.push(value);
      }
    }
  return result2;
}
var union = baseRest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});
const union$1 = union;
var unionBy = baseRest(function(arrays) {
  var iteratee2 = last(arrays);
  if (isArrayLikeObject(iteratee2)) {
    iteratee2 = void 0;
  }
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), baseIteratee(iteratee2));
});
const unionBy$1 = unionBy;
var unionWith = baseRest(function(arrays) {
  var comparator2 = last(arrays);
  comparator2 = typeof comparator2 == "function" ? comparator2 : void 0;
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), void 0, comparator2);
});
const unionWith$1 = unionWith;
function uniq(array2) {
  return array2 && array2.length ? baseUniq(array2) : [];
}
function uniqBy(array2, iteratee2) {
  return array2 && array2.length ? baseUniq(array2, baseIteratee(iteratee2)) : [];
}
function uniqWith(array2, comparator2) {
  comparator2 = typeof comparator2 == "function" ? comparator2 : void 0;
  return array2 && array2.length ? baseUniq(array2, void 0, comparator2) : [];
}
var idCounter$1 = 0;
function uniqueId(prefix) {
  var id = ++idCounter$1;
  return toString(prefix) + id;
}
function unset(object2, path) {
  return object2 == null ? true : baseUnset(object2, path);
}
var nativeMax$2 = Math.max;
function unzip(array2) {
  if (!(array2 && array2.length)) {
    return [];
  }
  var length = 0;
  array2 = arrayFilter(array2, function(group) {
    if (isArrayLikeObject(group)) {
      length = nativeMax$2(group.length, length);
      return true;
    }
  });
  return baseTimes(length, function(index) {
    return arrayMap(array2, baseProperty(index));
  });
}
function unzipWith(array2, iteratee2) {
  if (!(array2 && array2.length)) {
    return [];
  }
  var result2 = unzip(array2);
  if (iteratee2 == null) {
    return result2;
  }
  return arrayMap(result2, function(group) {
    return apply(iteratee2, void 0, group);
  });
}
function baseUpdate(object2, path, updater, customizer) {
  return baseSet(object2, path, updater(baseGet(object2, path)), customizer);
}
function update(object2, path, updater) {
  return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater));
}
function updateWith(object2, path, updater, customizer) {
  customizer = typeof customizer == "function" ? customizer : void 0;
  return object2 == null ? object2 : baseUpdate(object2, path, castFunction(updater), customizer);
}
var upperCase = createCompounder(function(result2, word, index) {
  return result2 + (index ? " " : "") + word.toUpperCase();
});
const upperCase$1 = upperCase;
function valuesIn(object2) {
  return object2 == null ? [] : baseValues(object2, keysIn(object2));
}
var without = baseRest(function(array2, values2) {
  return isArrayLikeObject(array2) ? baseDifference(array2, values2) : [];
});
const without$1 = without;
function wrap(value, wrapper) {
  return partial$1(castFunction(wrapper), value);
}
var wrapperAt = flatRest(function(paths) {
  var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object2) {
    return baseAt(object2, paths);
  };
  if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
    return this.thru(interceptor);
  }
  value = value.slice(start, +start + (length ? 1 : 0));
  value.__actions__.push({
    "func": thru,
    "args": [interceptor],
    "thisArg": void 0
  });
  return new LodashWrapper(value, this.__chain__).thru(function(array2) {
    if (length && !array2.length) {
      array2.push(void 0);
    }
    return array2;
  });
});
const at = wrapperAt;
function wrapperChain() {
  return chain(this);
}
function wrapperReverse() {
  var value = this.__wrapped__;
  if (value instanceof LazyWrapper) {
    var wrapped = value;
    if (this.__actions__.length) {
      wrapped = new LazyWrapper(this);
    }
    wrapped = wrapped.reverse();
    wrapped.__actions__.push({
      "func": thru,
      "args": [reverse],
      "thisArg": void 0
    });
    return new LodashWrapper(wrapped, this.__chain__);
  }
  return this.thru(reverse);
}
function baseXor(arrays, iteratee2, comparator2) {
  var length = arrays.length;
  if (length < 2) {
    return length ? baseUniq(arrays[0]) : [];
  }
  var index = -1, result2 = Array(length);
  while (++index < length) {
    var array2 = arrays[index], othIndex = -1;
    while (++othIndex < length) {
      if (othIndex != index) {
        result2[index] = baseDifference(result2[index] || array2, arrays[othIndex], iteratee2, comparator2);
      }
    }
  }
  return baseUniq(baseFlatten(result2, 1), iteratee2, comparator2);
}
var xor = baseRest(function(arrays) {
  return baseXor(arrayFilter(arrays, isArrayLikeObject));
});
const xor$1 = xor;
var xorBy = baseRest(function(arrays) {
  var iteratee2 = last(arrays);
  if (isArrayLikeObject(iteratee2)) {
    iteratee2 = void 0;
  }
  return baseXor(arrayFilter(arrays, isArrayLikeObject), baseIteratee(iteratee2));
});
const xorBy$1 = xorBy;
var xorWith = baseRest(function(arrays) {
  var comparator2 = last(arrays);
  comparator2 = typeof comparator2 == "function" ? comparator2 : void 0;
  return baseXor(arrayFilter(arrays, isArrayLikeObject), void 0, comparator2);
});
const xorWith$1 = xorWith;
var zip = baseRest(unzip);
const zip$1 = zip;
function baseZipObject(props, values2, assignFunc) {
  var index = -1, length = props.length, valsLength = values2.length, result2 = {};
  while (++index < length) {
    var value = index < valsLength ? values2[index] : void 0;
    assignFunc(result2, props[index], value);
  }
  return result2;
}
function zipObject(props, values2) {
  return baseZipObject(props || [], values2 || [], assignValue);
}
function zipObjectDeep(props, values2) {
  return baseZipObject(props || [], values2 || [], baseSet);
}
var zipWith = baseRest(function(arrays) {
  var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : void 0;
  iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : void 0;
  return unzipWith(arrays, iteratee2);
});
const zipWith$1 = zipWith;
const array = {
  chunk,
  compact,
  concat,
  difference: difference$1,
  differenceBy: differenceBy$1,
  differenceWith: differenceWith$1,
  drop,
  dropRight,
  dropRightWhile,
  dropWhile,
  fill,
  findIndex,
  findLastIndex,
  first: head,
  flatten,
  flattenDeep,
  flattenDepth,
  fromPairs,
  head,
  indexOf,
  initial,
  intersection: intersection$1,
  intersectionBy: intersectionBy$1,
  intersectionWith: intersectionWith$1,
  join,
  last,
  lastIndexOf,
  nth,
  pull: pull$1,
  pullAll,
  pullAllBy,
  pullAllWith,
  pullAt: pullAt$1,
  remove,
  reverse,
  slice,
  sortedIndex,
  sortedIndexBy,
  sortedIndexOf,
  sortedLastIndex,
  sortedLastIndexBy,
  sortedLastIndexOf,
  sortedUniq,
  sortedUniqBy,
  tail,
  take,
  takeRight,
  takeRightWhile,
  takeWhile,
  union: union$1,
  unionBy: unionBy$1,
  unionWith: unionWith$1,
  uniq,
  uniqBy,
  uniqWith,
  unzip,
  unzipWith,
  without: without$1,
  xor: xor$1,
  xorBy: xorBy$1,
  xorWith: xorWith$1,
  zip: zip$1,
  zipObject,
  zipObjectDeep,
  zipWith: zipWith$1
};
const collection = {
  countBy: countBy$1,
  each: forEach,
  eachRight: forEachRight,
  every,
  filter,
  find: find$1,
  findLast: findLast$1,
  flatMap,
  flatMapDeep,
  flatMapDepth,
  forEach,
  forEachRight,
  groupBy: groupBy$1,
  includes,
  invokeMap: invokeMap$1,
  keyBy: keyBy$1,
  map,
  orderBy,
  partition: partition$1,
  reduce,
  reduceRight,
  reject,
  sample,
  sampleSize,
  shuffle,
  size,
  some,
  sortBy: sortBy$1
};
const date = {
  now: now$2
};
const func = {
  after,
  ary,
  before,
  bind: bind$1,
  bindKey: bindKey$1,
  curry,
  curryRight,
  debounce,
  defer: defer$1,
  delay: delay$1,
  flip,
  memoize,
  negate,
  once,
  overArgs: overArgs$1,
  partial: partial$1,
  partialRight: partialRight$1,
  rearg: rearg$1,
  rest,
  spread,
  throttle,
  unary,
  wrap
};
const lang = {
  castArray,
  clone,
  cloneDeep,
  cloneDeepWith,
  cloneWith,
  conformsTo,
  eq,
  gt: gt$1,
  gte: gte$1,
  isArguments: isArguments$1,
  isArray,
  isArrayBuffer: isArrayBuffer$1,
  isArrayLike,
  isArrayLikeObject,
  isBoolean,
  isBuffer: isBuffer$1,
  isDate: isDate$1,
  isElement,
  isEmpty,
  isEqual,
  isEqualWith,
  isError,
  isFinite: isFinite$1,
  isFunction,
  isInteger,
  isLength,
  isMap: isMap$1,
  isMatch,
  isMatchWith,
  isNaN: isNaN$1,
  isNative,
  isNil,
  isNull,
  isNumber,
  isObject,
  isObjectLike,
  isPlainObject,
  isRegExp: isRegExp$1,
  isSafeInteger,
  isSet: isSet$1,
  isString,
  isSymbol,
  isTypedArray: isTypedArray$1,
  isUndefined,
  isWeakMap,
  isWeakSet,
  lt: lt$1,
  lte: lte$1,
  toArray,
  toFinite,
  toInteger,
  toLength,
  toNumber,
  toPlainObject,
  toSafeInteger,
  toString
};
const math = {
  add: add$1,
  ceil: ceil$1,
  divide: divide$1,
  floor: floor$1,
  max,
  maxBy,
  mean,
  meanBy,
  min,
  minBy,
  multiply: multiply$1,
  round: round$1,
  subtract: subtract$1,
  sum,
  sumBy
};
const number = {
  clamp,
  inRange,
  random
};
const object = {
  assign: assign$1,
  assignIn: extend,
  assignInWith: extendWith,
  assignWith: assignWith$1,
  at: at$2,
  create,
  defaults: defaults$1,
  defaultsDeep: defaultsDeep$1,
  entries: toPairs$1,
  entriesIn: toPairsIn$1,
  extend,
  extendWith,
  findKey,
  findLastKey,
  forIn,
  forInRight,
  forOwn,
  forOwnRight,
  functions,
  functionsIn,
  get,
  has,
  hasIn,
  invert: invert$1,
  invertBy: invertBy$1,
  invoke: invoke$1,
  keys,
  keysIn,
  mapKeys,
  mapValues,
  merge: merge$1,
  mergeWith: mergeWith$1,
  omit: omit$1,
  omitBy,
  pick: pick$1,
  pickBy,
  result,
  set,
  setWith,
  toPairs: toPairs$1,
  toPairsIn: toPairsIn$1,
  transform,
  unset,
  update,
  updateWith,
  values,
  valuesIn
};
const seq = {
  at,
  chain,
  commit: wrapperCommit,
  lodash,
  next: wrapperNext,
  plant: wrapperPlant,
  reverse: wrapperReverse,
  tap,
  thru,
  toIterator: wrapperToIterator,
  toJSON: wrapperValue,
  value: wrapperValue,
  valueOf: wrapperValue,
  wrapperChain
};
const string = {
  camelCase: camelCase$1,
  capitalize,
  deburr,
  endsWith,
  escape,
  escapeRegExp,
  kebabCase: kebabCase$1,
  lowerCase: lowerCase$1,
  lowerFirst: lowerFirst$1,
  pad,
  padEnd,
  padStart,
  parseInt: parseInt$1,
  repeat,
  replace,
  snakeCase: snakeCase$1,
  split,
  startCase: startCase$1,
  startsWith,
  template,
  templateSettings: templateSettings$1,
  toLower,
  toUpper,
  trim,
  trimEnd,
  trimStart,
  truncate,
  unescape,
  upperCase: upperCase$1,
  upperFirst: upperFirst$1,
  words
};
const util = {
  attempt: attempt$1,
  bindAll: bindAll$1,
  cond,
  conforms,
  constant,
  defaultTo,
  flow: flow$1,
  flowRight: flowRight$1,
  identity,
  iteratee,
  matches,
  matchesProperty,
  method: method$1,
  methodOf: methodOf$1,
  mixin: mixin$1,
  noop,
  nthArg,
  over: over$1,
  overEvery: overEvery$1,
  overSome: overSome$1,
  property,
  propertyOf,
  range: range$1,
  rangeRight: rangeRight$1,
  stubArray,
  stubFalse,
  stubObject,
  stubString,
  stubTrue,
  times,
  toPath,
  uniqueId
};
function lazyClone() {
  var result2 = new LazyWrapper(this.__wrapped__);
  result2.__actions__ = copyArray(this.__actions__);
  result2.__dir__ = this.__dir__;
  result2.__filtered__ = this.__filtered__;
  result2.__iteratees__ = copyArray(this.__iteratees__);
  result2.__takeCount__ = this.__takeCount__;
  result2.__views__ = copyArray(this.__views__);
  return result2;
}
function lazyReverse() {
  if (this.__filtered__) {
    var result2 = new LazyWrapper(this);
    result2.__dir__ = -1;
    result2.__filtered__ = true;
  } else {
    result2 = this.clone();
    result2.__dir__ *= -1;
  }
  return result2;
}
var nativeMax$1 = Math.max, nativeMin$2 = Math.min;
function getView(start, end, transforms) {
  var index = -1, length = transforms.length;
  while (++index < length) {
    var data = transforms[index], size2 = data.size;
    switch (data.type) {
      case "drop":
        start += size2;
        break;
      case "dropRight":
        end -= size2;
        break;
      case "take":
        end = nativeMin$2(end, start + size2);
        break;
      case "takeRight":
        start = nativeMax$1(start, end - size2);
        break;
    }
  }
  return { "start": start, "end": end };
}
var LAZY_FILTER_FLAG$1 = 1, LAZY_MAP_FLAG = 2;
var nativeMin$1 = Math.min;
function lazyValue() {
  var array2 = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array2), isRight = dir < 0, arrLength = isArr ? array2.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin$1(length, this.__takeCount__);
  if (!isArr || !isRight && arrLength == length && takeCount == length) {
    return baseWrapperValue(array2, this.__actions__);
  }
  var result2 = [];
  outer:
    while (length-- && resIndex < takeCount) {
      index += dir;
      var iterIndex = -1, value = array2[index];
      while (++iterIndex < iterLength) {
        var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed2 = iteratee2(value);
        if (type == LAZY_MAP_FLAG) {
          value = computed2;
        } else if (!computed2) {
          if (type == LAZY_FILTER_FLAG$1) {
            continue outer;
          } else {
            break outer;
          }
        }
      }
      result2[resIndex++] = value;
    }
  return result2;
}
/**
 * @license
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="es" -o ./`
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var VERSION = "4.17.21";
var WRAP_BIND_KEY_FLAG = 2;
var LAZY_FILTER_FLAG = 1, LAZY_WHILE_FLAG = 3;
var MAX_ARRAY_LENGTH = 4294967295;
var arrayProto = Array.prototype, objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var symIterator = Symbol$1 ? Symbol$1.iterator : void 0;
var nativeMax = Math.max, nativeMin = Math.min;
var mixin = /* @__PURE__ */ function(func2) {
  return function(object2, source, options) {
    if (options == null) {
      var isObj = isObject(source), props = isObj && keys(source), methodNames = props && props.length && baseFunctions(source, props);
      if (!(methodNames ? methodNames.length : isObj)) {
        options = source;
        source = object2;
        object2 = this;
      }
    }
    return func2(object2, source, options);
  };
}(mixin$1);
lodash.after = func.after;
lodash.ary = func.ary;
lodash.assign = object.assign;
lodash.assignIn = object.assignIn;
lodash.assignInWith = object.assignInWith;
lodash.assignWith = object.assignWith;
lodash.at = object.at;
lodash.before = func.before;
lodash.bind = func.bind;
lodash.bindAll = util.bindAll;
lodash.bindKey = func.bindKey;
lodash.castArray = lang.castArray;
lodash.chain = seq.chain;
lodash.chunk = array.chunk;
lodash.compact = array.compact;
lodash.concat = array.concat;
lodash.cond = util.cond;
lodash.conforms = util.conforms;
lodash.constant = util.constant;
lodash.countBy = collection.countBy;
lodash.create = object.create;
lodash.curry = func.curry;
lodash.curryRight = func.curryRight;
lodash.debounce = func.debounce;
lodash.defaults = object.defaults;
lodash.defaultsDeep = object.defaultsDeep;
lodash.defer = func.defer;
lodash.delay = func.delay;
lodash.difference = array.difference;
lodash.differenceBy = array.differenceBy;
lodash.differenceWith = array.differenceWith;
lodash.drop = array.drop;
lodash.dropRight = array.dropRight;
lodash.dropRightWhile = array.dropRightWhile;
lodash.dropWhile = array.dropWhile;
lodash.fill = array.fill;
lodash.filter = collection.filter;
lodash.flatMap = collection.flatMap;
lodash.flatMapDeep = collection.flatMapDeep;
lodash.flatMapDepth = collection.flatMapDepth;
lodash.flatten = array.flatten;
lodash.flattenDeep = array.flattenDeep;
lodash.flattenDepth = array.flattenDepth;
lodash.flip = func.flip;
lodash.flow = util.flow;
lodash.flowRight = util.flowRight;
lodash.fromPairs = array.fromPairs;
lodash.functions = object.functions;
lodash.functionsIn = object.functionsIn;
lodash.groupBy = collection.groupBy;
lodash.initial = array.initial;
lodash.intersection = array.intersection;
lodash.intersectionBy = array.intersectionBy;
lodash.intersectionWith = array.intersectionWith;
lodash.invert = object.invert;
lodash.invertBy = object.invertBy;
lodash.invokeMap = collection.invokeMap;
lodash.iteratee = util.iteratee;
lodash.keyBy = collection.keyBy;
lodash.keys = keys;
lodash.keysIn = object.keysIn;
lodash.map = collection.map;
lodash.mapKeys = object.mapKeys;
lodash.mapValues = object.mapValues;
lodash.matches = util.matches;
lodash.matchesProperty = util.matchesProperty;
lodash.memoize = func.memoize;
lodash.merge = object.merge;
lodash.mergeWith = object.mergeWith;
lodash.method = util.method;
lodash.methodOf = util.methodOf;
lodash.mixin = mixin;
lodash.negate = negate;
lodash.nthArg = util.nthArg;
lodash.omit = object.omit;
lodash.omitBy = object.omitBy;
lodash.once = func.once;
lodash.orderBy = collection.orderBy;
lodash.over = util.over;
lodash.overArgs = func.overArgs;
lodash.overEvery = util.overEvery;
lodash.overSome = util.overSome;
lodash.partial = func.partial;
lodash.partialRight = func.partialRight;
lodash.partition = collection.partition;
lodash.pick = object.pick;
lodash.pickBy = object.pickBy;
lodash.property = util.property;
lodash.propertyOf = util.propertyOf;
lodash.pull = array.pull;
lodash.pullAll = array.pullAll;
lodash.pullAllBy = array.pullAllBy;
lodash.pullAllWith = array.pullAllWith;
lodash.pullAt = array.pullAt;
lodash.range = util.range;
lodash.rangeRight = util.rangeRight;
lodash.rearg = func.rearg;
lodash.reject = collection.reject;
lodash.remove = array.remove;
lodash.rest = func.rest;
lodash.reverse = array.reverse;
lodash.sampleSize = collection.sampleSize;
lodash.set = object.set;
lodash.setWith = object.setWith;
lodash.shuffle = collection.shuffle;
lodash.slice = array.slice;
lodash.sortBy = collection.sortBy;
lodash.sortedUniq = array.sortedUniq;
lodash.sortedUniqBy = array.sortedUniqBy;
lodash.split = string.split;
lodash.spread = func.spread;
lodash.tail = array.tail;
lodash.take = array.take;
lodash.takeRight = array.takeRight;
lodash.takeRightWhile = array.takeRightWhile;
lodash.takeWhile = array.takeWhile;
lodash.tap = seq.tap;
lodash.throttle = func.throttle;
lodash.thru = thru;
lodash.toArray = lang.toArray;
lodash.toPairs = object.toPairs;
lodash.toPairsIn = object.toPairsIn;
lodash.toPath = util.toPath;
lodash.toPlainObject = lang.toPlainObject;
lodash.transform = object.transform;
lodash.unary = func.unary;
lodash.union = array.union;
lodash.unionBy = array.unionBy;
lodash.unionWith = array.unionWith;
lodash.uniq = array.uniq;
lodash.uniqBy = array.uniqBy;
lodash.uniqWith = array.uniqWith;
lodash.unset = object.unset;
lodash.unzip = array.unzip;
lodash.unzipWith = array.unzipWith;
lodash.update = object.update;
lodash.updateWith = object.updateWith;
lodash.values = object.values;
lodash.valuesIn = object.valuesIn;
lodash.without = array.without;
lodash.words = string.words;
lodash.wrap = func.wrap;
lodash.xor = array.xor;
lodash.xorBy = array.xorBy;
lodash.xorWith = array.xorWith;
lodash.zip = array.zip;
lodash.zipObject = array.zipObject;
lodash.zipObjectDeep = array.zipObjectDeep;
lodash.zipWith = array.zipWith;
lodash.entries = object.toPairs;
lodash.entriesIn = object.toPairsIn;
lodash.extend = object.assignIn;
lodash.extendWith = object.assignInWith;
mixin(lodash, lodash);
lodash.add = math.add;
lodash.attempt = util.attempt;
lodash.camelCase = string.camelCase;
lodash.capitalize = string.capitalize;
lodash.ceil = math.ceil;
lodash.clamp = number.clamp;
lodash.clone = lang.clone;
lodash.cloneDeep = lang.cloneDeep;
lodash.cloneDeepWith = lang.cloneDeepWith;
lodash.cloneWith = lang.cloneWith;
lodash.conformsTo = lang.conformsTo;
lodash.deburr = string.deburr;
lodash.defaultTo = util.defaultTo;
lodash.divide = math.divide;
lodash.endsWith = string.endsWith;
lodash.eq = lang.eq;
lodash.escape = string.escape;
lodash.escapeRegExp = string.escapeRegExp;
lodash.every = collection.every;
lodash.find = collection.find;
lodash.findIndex = array.findIndex;
lodash.findKey = object.findKey;
lodash.findLast = collection.findLast;
lodash.findLastIndex = array.findLastIndex;
lodash.findLastKey = object.findLastKey;
lodash.floor = math.floor;
lodash.forEach = collection.forEach;
lodash.forEachRight = collection.forEachRight;
lodash.forIn = object.forIn;
lodash.forInRight = object.forInRight;
lodash.forOwn = object.forOwn;
lodash.forOwnRight = object.forOwnRight;
lodash.get = object.get;
lodash.gt = lang.gt;
lodash.gte = lang.gte;
lodash.has = object.has;
lodash.hasIn = object.hasIn;
lodash.head = array.head;
lodash.identity = identity;
lodash.includes = collection.includes;
lodash.indexOf = array.indexOf;
lodash.inRange = number.inRange;
lodash.invoke = object.invoke;
lodash.isArguments = lang.isArguments;
lodash.isArray = isArray;
lodash.isArrayBuffer = lang.isArrayBuffer;
lodash.isArrayLike = lang.isArrayLike;
lodash.isArrayLikeObject = lang.isArrayLikeObject;
lodash.isBoolean = lang.isBoolean;
lodash.isBuffer = lang.isBuffer;
lodash.isDate = lang.isDate;
lodash.isElement = lang.isElement;
lodash.isEmpty = lang.isEmpty;
lodash.isEqual = lang.isEqual;
lodash.isEqualWith = lang.isEqualWith;
lodash.isError = lang.isError;
lodash.isFinite = lang.isFinite;
lodash.isFunction = lang.isFunction;
lodash.isInteger = lang.isInteger;
lodash.isLength = lang.isLength;
lodash.isMap = lang.isMap;
lodash.isMatch = lang.isMatch;
lodash.isMatchWith = lang.isMatchWith;
lodash.isNaN = lang.isNaN;
lodash.isNative = lang.isNative;
lodash.isNil = lang.isNil;
lodash.isNull = lang.isNull;
lodash.isNumber = lang.isNumber;
lodash.isObject = isObject;
lodash.isObjectLike = lang.isObjectLike;
lodash.isPlainObject = lang.isPlainObject;
lodash.isRegExp = lang.isRegExp;
lodash.isSafeInteger = lang.isSafeInteger;
lodash.isSet = lang.isSet;
lodash.isString = lang.isString;
lodash.isSymbol = lang.isSymbol;
lodash.isTypedArray = lang.isTypedArray;
lodash.isUndefined = lang.isUndefined;
lodash.isWeakMap = lang.isWeakMap;
lodash.isWeakSet = lang.isWeakSet;
lodash.join = array.join;
lodash.kebabCase = string.kebabCase;
lodash.last = last;
lodash.lastIndexOf = array.lastIndexOf;
lodash.lowerCase = string.lowerCase;
lodash.lowerFirst = string.lowerFirst;
lodash.lt = lang.lt;
lodash.lte = lang.lte;
lodash.max = math.max;
lodash.maxBy = math.maxBy;
lodash.mean = math.mean;
lodash.meanBy = math.meanBy;
lodash.min = math.min;
lodash.minBy = math.minBy;
lodash.stubArray = util.stubArray;
lodash.stubFalse = util.stubFalse;
lodash.stubObject = util.stubObject;
lodash.stubString = util.stubString;
lodash.stubTrue = util.stubTrue;
lodash.multiply = math.multiply;
lodash.nth = array.nth;
lodash.noop = util.noop;
lodash.now = date.now;
lodash.pad = string.pad;
lodash.padEnd = string.padEnd;
lodash.padStart = string.padStart;
lodash.parseInt = string.parseInt;
lodash.random = number.random;
lodash.reduce = collection.reduce;
lodash.reduceRight = collection.reduceRight;
lodash.repeat = string.repeat;
lodash.replace = string.replace;
lodash.result = object.result;
lodash.round = math.round;
lodash.sample = collection.sample;
lodash.size = collection.size;
lodash.snakeCase = string.snakeCase;
lodash.some = collection.some;
lodash.sortedIndex = array.sortedIndex;
lodash.sortedIndexBy = array.sortedIndexBy;
lodash.sortedIndexOf = array.sortedIndexOf;
lodash.sortedLastIndex = array.sortedLastIndex;
lodash.sortedLastIndexBy = array.sortedLastIndexBy;
lodash.sortedLastIndexOf = array.sortedLastIndexOf;
lodash.startCase = string.startCase;
lodash.startsWith = string.startsWith;
lodash.subtract = math.subtract;
lodash.sum = math.sum;
lodash.sumBy = math.sumBy;
lodash.template = string.template;
lodash.times = util.times;
lodash.toFinite = lang.toFinite;
lodash.toInteger = toInteger;
lodash.toLength = lang.toLength;
lodash.toLower = string.toLower;
lodash.toNumber = lang.toNumber;
lodash.toSafeInteger = lang.toSafeInteger;
lodash.toString = lang.toString;
lodash.toUpper = string.toUpper;
lodash.trim = string.trim;
lodash.trimEnd = string.trimEnd;
lodash.trimStart = string.trimStart;
lodash.truncate = string.truncate;
lodash.unescape = string.unescape;
lodash.uniqueId = util.uniqueId;
lodash.upperCase = string.upperCase;
lodash.upperFirst = string.upperFirst;
lodash.each = collection.forEach;
lodash.eachRight = collection.forEachRight;
lodash.first = array.head;
mixin(lodash, function() {
  var source = {};
  baseForOwn(lodash, function(func2, methodName) {
    if (!hasOwnProperty.call(lodash.prototype, methodName)) {
      source[methodName] = func2;
    }
  });
  return source;
}(), { "chain": false });
lodash.VERSION = VERSION;
(lodash.templateSettings = string.templateSettings).imports._ = lodash;
arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
  lodash[methodName].placeholder = lodash;
});
arrayEach(["drop", "take"], function(methodName, index) {
  LazyWrapper.prototype[methodName] = function(n) {
    n = n === void 0 ? 1 : nativeMax(toInteger(n), 0);
    var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
    if (result2.__filtered__) {
      result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
    } else {
      result2.__views__.push({
        "size": nativeMin(n, MAX_ARRAY_LENGTH),
        "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
      });
    }
    return result2;
  };
  LazyWrapper.prototype[methodName + "Right"] = function(n) {
    return this.reverse()[methodName](n).reverse();
  };
});
arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
  var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
  LazyWrapper.prototype[methodName] = function(iteratee2) {
    var result2 = this.clone();
    result2.__iteratees__.push({
      "iteratee": baseIteratee(iteratee2),
      "type": type
    });
    result2.__filtered__ = result2.__filtered__ || isFilter;
    return result2;
  };
});
arrayEach(["head", "last"], function(methodName, index) {
  var takeName = "take" + (index ? "Right" : "");
  LazyWrapper.prototype[methodName] = function() {
    return this[takeName](1).value()[0];
  };
});
arrayEach(["initial", "tail"], function(methodName, index) {
  var dropName = "drop" + (index ? "" : "Right");
  LazyWrapper.prototype[methodName] = function() {
    return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
  };
});
LazyWrapper.prototype.compact = function() {
  return this.filter(identity);
};
LazyWrapper.prototype.find = function(predicate) {
  return this.filter(predicate).head();
};
LazyWrapper.prototype.findLast = function(predicate) {
  return this.reverse().find(predicate);
};
LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
  if (typeof path == "function") {
    return new LazyWrapper(this);
  }
  return this.map(function(value) {
    return baseInvoke(value, path, args);
  });
});
LazyWrapper.prototype.reject = function(predicate) {
  return this.filter(negate(baseIteratee(predicate)));
};
LazyWrapper.prototype.slice = function(start, end) {
  start = toInteger(start);
  var result2 = this;
  if (result2.__filtered__ && (start > 0 || end < 0)) {
    return new LazyWrapper(result2);
  }
  if (start < 0) {
    result2 = result2.takeRight(-start);
  } else if (start) {
    result2 = result2.drop(start);
  }
  if (end !== void 0) {
    end = toInteger(end);
    result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
  }
  return result2;
};
LazyWrapper.prototype.takeRightWhile = function(predicate) {
  return this.reverse().takeWhile(predicate).reverse();
};
LazyWrapper.prototype.toArray = function() {
  return this.take(MAX_ARRAY_LENGTH);
};
baseForOwn(LazyWrapper.prototype, function(func2, methodName) {
  var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
  if (!lodashFunc) {
    return;
  }
  lodash.prototype[methodName] = function() {
    var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
    var interceptor = function(value2) {
      var result3 = lodashFunc.apply(lodash, arrayPush([value2], args));
      return isTaker && chainAll ? result3[0] : result3;
    };
    if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
      isLazy = useLazy = false;
    }
    var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
    if (!retUnwrapped && useLazy) {
      value = onlyLazy ? value : new LazyWrapper(this);
      var result2 = func2.apply(value, args);
      result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": void 0 });
      return new LodashWrapper(result2, chainAll);
    }
    if (isUnwrapped && onlyLazy) {
      return func2.apply(this, args);
    }
    result2 = this.thru(interceptor);
    return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
  };
});
arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
  var func2 = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
  lodash.prototype[methodName] = function() {
    var args = arguments;
    if (retUnwrapped && !this.__chain__) {
      var value = this.value();
      return func2.apply(isArray(value) ? value : [], args);
    }
    return this[chainName](function(value2) {
      return func2.apply(isArray(value2) ? value2 : [], args);
    });
  };
});
baseForOwn(LazyWrapper.prototype, function(func2, methodName) {
  var lodashFunc = lodash[methodName];
  if (lodashFunc) {
    var key = lodashFunc.name + "";
    if (!hasOwnProperty.call(realNames, key)) {
      realNames[key] = [];
    }
    realNames[key].push({ "name": methodName, "func": lodashFunc });
  }
});
realNames[createHybrid(void 0, WRAP_BIND_KEY_FLAG).name] = [{
  "name": "wrapper",
  "func": void 0
}];
LazyWrapper.prototype.clone = lazyClone;
LazyWrapper.prototype.reverse = lazyReverse;
LazyWrapper.prototype.value = lazyValue;
lodash.prototype.at = seq.at;
lodash.prototype.chain = seq.wrapperChain;
lodash.prototype.commit = seq.commit;
lodash.prototype.next = seq.next;
lodash.prototype.plant = seq.plant;
lodash.prototype.reverse = seq.reverse;
lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = seq.value;
lodash.prototype.first = lodash.prototype.head;
if (symIterator) {
  lodash.prototype[symIterator] = seq.toIterator;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lib$1 = { exports: {} };
var _FullInternals = {};
var _CoreInternals = {};
var Global = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2._registerNode = exports2.Konva = exports2.glob = void 0;
  const PI_OVER_180 = Math.PI / 180;
  function detectBrowser() {
    return typeof window !== "undefined" && ({}.toString.call(window) === "[object Window]" || {}.toString.call(window) === "[object global]");
  }
  exports2.glob = typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof WorkerGlobalScope !== "undefined" ? self : {};
  exports2.Konva = {
    _global: exports2.glob,
    version: "9.3.6",
    isBrowser: detectBrowser(),
    isUnminified: /param/.test((function(param) {
    }).toString()),
    dblClickWindow: 400,
    getAngle(angle) {
      return exports2.Konva.angleDeg ? angle * PI_OVER_180 : angle;
    },
    enableTrace: false,
    pointerEventsEnabled: true,
    autoDrawEnabled: true,
    hitOnDragEnabled: false,
    capturePointerEventsEnabled: false,
    _mouseListenClick: false,
    _touchListenClick: false,
    _pointerListenClick: false,
    _mouseInDblClickWindow: false,
    _touchInDblClickWindow: false,
    _pointerInDblClickWindow: false,
    _mouseDblClickPointerId: null,
    _touchDblClickPointerId: null,
    _pointerDblClickPointerId: null,
    pixelRatio: typeof window !== "undefined" && window.devicePixelRatio || 1,
    dragDistance: 3,
    angleDeg: true,
    showWarnings: true,
    dragButtons: [0, 1],
    isDragging() {
      return exports2.Konva["DD"].isDragging;
    },
    isTransforming() {
      var _a;
      return (_a = exports2.Konva["Transformer"]) === null || _a === void 0 ? void 0 : _a.isTransforming();
    },
    isDragReady() {
      return !!exports2.Konva["DD"].node;
    },
    releaseCanvasOnDestroy: true,
    document: exports2.glob.document,
    _injectGlobal(Konva2) {
      exports2.glob.Konva = Konva2;
    }
  };
  const _registerNode = (NodeClass) => {
    exports2.Konva[NodeClass.prototype.getClassName()] = NodeClass;
  };
  exports2._registerNode = _registerNode;
  exports2.Konva._injectGlobal(exports2.Konva);
})(Global);
var Util = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Util = exports2.Transform = void 0;
  const Global_12 = Global;
  class Transform {
    constructor(m = [1, 0, 0, 1, 0, 0]) {
      this.dirty = false;
      this.m = m && m.slice() || [1, 0, 0, 1, 0, 0];
    }
    reset() {
      this.m[0] = 1;
      this.m[1] = 0;
      this.m[2] = 0;
      this.m[3] = 1;
      this.m[4] = 0;
      this.m[5] = 0;
    }
    copy() {
      return new Transform(this.m);
    }
    copyInto(tr) {
      tr.m[0] = this.m[0];
      tr.m[1] = this.m[1];
      tr.m[2] = this.m[2];
      tr.m[3] = this.m[3];
      tr.m[4] = this.m[4];
      tr.m[5] = this.m[5];
    }
    point(point) {
      var m = this.m;
      return {
        x: m[0] * point.x + m[2] * point.y + m[4],
        y: m[1] * point.x + m[3] * point.y + m[5]
      };
    }
    translate(x, y) {
      this.m[4] += this.m[0] * x + this.m[2] * y;
      this.m[5] += this.m[1] * x + this.m[3] * y;
      return this;
    }
    scale(sx, sy) {
      this.m[0] *= sx;
      this.m[1] *= sx;
      this.m[2] *= sy;
      this.m[3] *= sy;
      return this;
    }
    rotate(rad) {
      var c = Math.cos(rad);
      var s = Math.sin(rad);
      var m11 = this.m[0] * c + this.m[2] * s;
      var m12 = this.m[1] * c + this.m[3] * s;
      var m21 = this.m[0] * -s + this.m[2] * c;
      var m22 = this.m[1] * -s + this.m[3] * c;
      this.m[0] = m11;
      this.m[1] = m12;
      this.m[2] = m21;
      this.m[3] = m22;
      return this;
    }
    getTranslation() {
      return {
        x: this.m[4],
        y: this.m[5]
      };
    }
    skew(sx, sy) {
      var m11 = this.m[0] + this.m[2] * sy;
      var m12 = this.m[1] + this.m[3] * sy;
      var m21 = this.m[2] + this.m[0] * sx;
      var m22 = this.m[3] + this.m[1] * sx;
      this.m[0] = m11;
      this.m[1] = m12;
      this.m[2] = m21;
      this.m[3] = m22;
      return this;
    }
    multiply(matrix) {
      var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
      var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
      var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
      var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
      var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
      var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
      this.m[0] = m11;
      this.m[1] = m12;
      this.m[2] = m21;
      this.m[3] = m22;
      this.m[4] = dx;
      this.m[5] = dy;
      return this;
    }
    invert() {
      var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
      var m0 = this.m[3] * d;
      var m1 = -this.m[1] * d;
      var m2 = -this.m[2] * d;
      var m3 = this.m[0] * d;
      var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
      var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
      this.m[0] = m0;
      this.m[1] = m1;
      this.m[2] = m2;
      this.m[3] = m3;
      this.m[4] = m4;
      this.m[5] = m5;
      return this;
    }
    getMatrix() {
      return this.m;
    }
    decompose() {
      var a = this.m[0];
      var b = this.m[1];
      var c = this.m[2];
      var d = this.m[3];
      var e = this.m[4];
      var f = this.m[5];
      var delta = a * d - b * c;
      let result2 = {
        x: e,
        y: f,
        rotation: 0,
        scaleX: 0,
        scaleY: 0,
        skewX: 0,
        skewY: 0
      };
      if (a != 0 || b != 0) {
        var r = Math.sqrt(a * a + b * b);
        result2.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
        result2.scaleX = r;
        result2.scaleY = delta / r;
        result2.skewX = (a * c + b * d) / delta;
        result2.skewY = 0;
      } else if (c != 0 || d != 0) {
        var s = Math.sqrt(c * c + d * d);
        result2.rotation = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
        result2.scaleX = delta / s;
        result2.scaleY = s;
        result2.skewX = 0;
        result2.skewY = (a * c + b * d) / delta;
      } else
        ;
      result2.rotation = exports2.Util._getRotation(result2.rotation);
      return result2;
    }
  }
  exports2.Transform = Transform;
  var OBJECT_ARRAY = "[object Array]", OBJECT_NUMBER = "[object Number]", OBJECT_STRING = "[object String]", OBJECT_BOOLEAN = "[object Boolean]", PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH2 = "#", EMPTY_STRING2 = "", ZERO = "0", KONVA_WARNING = "Konva warning: ", KONVA_ERROR = "Konva error: ", RGB_PAREN = "rgb(", COLORS = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 132, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 255, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 203],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [119, 128, 144],
    slategrey: [119, 128, 144],
    snow: [255, 255, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    transparent: [255, 255, 255, 0],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 5]
  }, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
  const req = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame || function(f) {
    setTimeout(f, 60);
  };
  exports2.Util = {
    _isElement(obj) {
      return !!(obj && obj.nodeType == 1);
    },
    _isFunction(obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isPlainObject(obj) {
      return !!obj && obj.constructor === Object;
    },
    _isArray(obj) {
      return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
    },
    _isNumber(obj) {
      return Object.prototype.toString.call(obj) === OBJECT_NUMBER && !isNaN(obj) && isFinite(obj);
    },
    _isString(obj) {
      return Object.prototype.toString.call(obj) === OBJECT_STRING;
    },
    _isBoolean(obj) {
      return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
    },
    isObject(val) {
      return val instanceof Object;
    },
    isValidSelector(selector) {
      if (typeof selector !== "string") {
        return false;
      }
      var firstChar = selector[0];
      return firstChar === "#" || firstChar === "." || firstChar === firstChar.toUpperCase();
    },
    _sign(number2) {
      if (number2 === 0) {
        return 1;
      }
      if (number2 > 0) {
        return 1;
      } else {
        return -1;
      }
    },
    requestAnimFrame(callback) {
      animQueue.push(callback);
      if (animQueue.length === 1) {
        req(function() {
          const queue2 = animQueue;
          animQueue = [];
          queue2.forEach(function(cb) {
            cb();
          });
        });
      }
    },
    createCanvasElement() {
      var canvas = document.createElement("canvas");
      try {
        canvas.style = canvas.style || {};
      } catch (e) {
      }
      return canvas;
    },
    createImageElement() {
      return document.createElement("img");
    },
    _isInDocument(el) {
      while (el = el.parentNode) {
        if (el == document) {
          return true;
        }
      }
      return false;
    },
    _urlToImage(url, callback) {
      var imageObj = exports2.Util.createImageElement();
      imageObj.onload = function() {
        callback(imageObj);
      };
      imageObj.src = url;
    },
    _rgbToHex(r, g, b) {
      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    _hexToRgb(hex) {
      hex = hex.replace(HASH2, EMPTY_STRING2);
      var bigint = parseInt(hex, 16);
      return {
        r: bigint >> 16 & 255,
        g: bigint >> 8 & 255,
        b: bigint & 255
      };
    },
    getRandomColor() {
      var randColor = (Math.random() * 16777215 << 0).toString(16);
      while (randColor.length < 6) {
        randColor = ZERO + randColor;
      }
      return HASH2 + randColor;
    },
    getRGB(color) {
      var rgb;
      if (color in COLORS) {
        rgb = COLORS[color];
        return {
          r: rgb[0],
          g: rgb[1],
          b: rgb[2]
        };
      } else if (color[0] === HASH2) {
        return this._hexToRgb(color.substring(1));
      } else if (color.substr(0, 4) === RGB_PAREN) {
        rgb = RGB_REGEX.exec(color.replace(/ /g, ""));
        return {
          r: parseInt(rgb[1], 10),
          g: parseInt(rgb[2], 10),
          b: parseInt(rgb[3], 10)
        };
      } else {
        return {
          r: 0,
          g: 0,
          b: 0
        };
      }
    },
    colorToRGBA(str) {
      str = str || "black";
      return exports2.Util._namedColorToRBA(str) || exports2.Util._hex3ColorToRGBA(str) || exports2.Util._hex4ColorToRGBA(str) || exports2.Util._hex6ColorToRGBA(str) || exports2.Util._hex8ColorToRGBA(str) || exports2.Util._rgbColorToRGBA(str) || exports2.Util._rgbaColorToRGBA(str) || exports2.Util._hslColorToRGBA(str);
    },
    _namedColorToRBA(str) {
      var c = COLORS[str.toLowerCase()];
      if (!c) {
        return null;
      }
      return {
        r: c[0],
        g: c[1],
        b: c[2],
        a: 1
      };
    },
    _rgbColorToRGBA(str) {
      if (str.indexOf("rgb(") === 0) {
        str = str.match(/rgb\(([^)]+)\)/)[1];
        var parts = str.split(/ *, */).map(Number);
        return {
          r: parts[0],
          g: parts[1],
          b: parts[2],
          a: 1
        };
      }
    },
    _rgbaColorToRGBA(str) {
      if (str.indexOf("rgba(") === 0) {
        str = str.match(/rgba\(([^)]+)\)/)[1];
        var parts = str.split(/ *, */).map((n, index) => {
          if (n.slice(-1) === "%") {
            return index === 3 ? parseInt(n) / 100 : parseInt(n) / 100 * 255;
          }
          return Number(n);
        });
        return {
          r: parts[0],
          g: parts[1],
          b: parts[2],
          a: parts[3]
        };
      }
    },
    _hex8ColorToRGBA(str) {
      if (str[0] === "#" && str.length === 9) {
        return {
          r: parseInt(str.slice(1, 3), 16),
          g: parseInt(str.slice(3, 5), 16),
          b: parseInt(str.slice(5, 7), 16),
          a: parseInt(str.slice(7, 9), 16) / 255
        };
      }
    },
    _hex6ColorToRGBA(str) {
      if (str[0] === "#" && str.length === 7) {
        return {
          r: parseInt(str.slice(1, 3), 16),
          g: parseInt(str.slice(3, 5), 16),
          b: parseInt(str.slice(5, 7), 16),
          a: 1
        };
      }
    },
    _hex4ColorToRGBA(str) {
      if (str[0] === "#" && str.length === 5) {
        return {
          r: parseInt(str[1] + str[1], 16),
          g: parseInt(str[2] + str[2], 16),
          b: parseInt(str[3] + str[3], 16),
          a: parseInt(str[4] + str[4], 16) / 255
        };
      }
    },
    _hex3ColorToRGBA(str) {
      if (str[0] === "#" && str.length === 4) {
        return {
          r: parseInt(str[1] + str[1], 16),
          g: parseInt(str[2] + str[2], 16),
          b: parseInt(str[3] + str[3], 16),
          a: 1
        };
      }
    },
    _hslColorToRGBA(str) {
      if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
        const [_, ...hsl] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str);
        const h = Number(hsl[0]) / 360;
        const s = Number(hsl[1]) / 100;
        const l = Number(hsl[2]) / 100;
        let t2;
        let t3;
        let val;
        if (s === 0) {
          val = l * 255;
          return {
            r: Math.round(val),
            g: Math.round(val),
            b: Math.round(val),
            a: 1
          };
        }
        if (l < 0.5) {
          t2 = l * (1 + s);
        } else {
          t2 = l + s - l * s;
        }
        const t1 = 2 * l - t2;
        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          t3 = h + 1 / 3 * -(i - 1);
          if (t3 < 0) {
            t3++;
          }
          if (t3 > 1) {
            t3--;
          }
          if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
          } else if (2 * t3 < 1) {
            val = t2;
          } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
          } else {
            val = t1;
          }
          rgb[i] = val * 255;
        }
        return {
          r: Math.round(rgb[0]),
          g: Math.round(rgb[1]),
          b: Math.round(rgb[2]),
          a: 1
        };
      }
    },
    haveIntersection(r1, r2) {
      return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
    },
    cloneObject(obj) {
      var retObj = {};
      for (var key in obj) {
        if (this._isPlainObject(obj[key])) {
          retObj[key] = this.cloneObject(obj[key]);
        } else if (this._isArray(obj[key])) {
          retObj[key] = this.cloneArray(obj[key]);
        } else {
          retObj[key] = obj[key];
        }
      }
      return retObj;
    },
    cloneArray(arr) {
      return arr.slice(0);
    },
    degToRad(deg) {
      return deg * PI_OVER_DEG180;
    },
    radToDeg(rad) {
      return rad * DEG180_OVER_PI;
    },
    _degToRad(deg) {
      exports2.Util.warn("Util._degToRad is removed. Please use public Util.degToRad instead.");
      return exports2.Util.degToRad(deg);
    },
    _radToDeg(rad) {
      exports2.Util.warn("Util._radToDeg is removed. Please use public Util.radToDeg instead.");
      return exports2.Util.radToDeg(rad);
    },
    _getRotation(radians) {
      return Global_12.Konva.angleDeg ? exports2.Util.radToDeg(radians) : radians;
    },
    _capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    throw(str) {
      throw new Error(KONVA_ERROR + str);
    },
    error(str) {
      console.error(KONVA_ERROR + str);
    },
    warn(str) {
      if (!Global_12.Konva.showWarnings) {
        return;
      }
      console.warn(KONVA_WARNING + str);
    },
    each(obj, func2) {
      for (var key in obj) {
        func2(key, obj[key]);
      }
    },
    _inRange(val, left, right) {
      return left <= val && val < right;
    },
    _getProjectionToSegment(x1, y1, x2, y2, x3, y3) {
      var x, y, dist;
      var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
      if (pd2 == 0) {
        x = x1;
        y = y1;
        dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
      } else {
        var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
        if (u < 0) {
          x = x1;
          y = y1;
          dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
        } else if (u > 1) {
          x = x2;
          y = y2;
          dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
        } else {
          x = x1 + u * (x2 - x1);
          y = y1 + u * (y2 - y1);
          dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
        }
      }
      return [x, y, dist];
    },
    _getProjectionToLine(pt, line, isClosed) {
      var pc = exports2.Util.cloneObject(pt);
      var dist = Number.MAX_VALUE;
      line.forEach(function(p1, i) {
        if (!isClosed && i === line.length - 1) {
          return;
        }
        var p2 = line[(i + 1) % line.length];
        var proj = exports2.Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
        var px = proj[0], py = proj[1], pdist = proj[2];
        if (pdist < dist) {
          pc.x = px;
          pc.y = py;
          dist = pdist;
        }
      });
      return pc;
    },
    _prepareArrayForTween(startArray, endArray, isClosed) {
      var n, start = [], end = [];
      if (startArray.length > endArray.length) {
        var temp = endArray;
        endArray = startArray;
        startArray = temp;
      }
      for (n = 0; n < startArray.length; n += 2) {
        start.push({
          x: startArray[n],
          y: startArray[n + 1]
        });
      }
      for (n = 0; n < endArray.length; n += 2) {
        end.push({
          x: endArray[n],
          y: endArray[n + 1]
        });
      }
      var newStart = [];
      end.forEach(function(point) {
        var pr = exports2.Util._getProjectionToLine(point, start, isClosed);
        newStart.push(pr.x);
        newStart.push(pr.y);
      });
      return newStart;
    },
    _prepareToStringify(obj) {
      var desc;
      obj.visitedByCircularReferenceRemoval = true;
      for (var key in obj) {
        if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == "object")) {
          continue;
        }
        desc = Object.getOwnPropertyDescriptor(obj, key);
        if (obj[key].visitedByCircularReferenceRemoval || exports2.Util._isElement(obj[key])) {
          if (desc.configurable) {
            delete obj[key];
          } else {
            return null;
          }
        } else if (exports2.Util._prepareToStringify(obj[key]) === null) {
          if (desc.configurable) {
            delete obj[key];
          } else {
            return null;
          }
        }
      }
      delete obj.visitedByCircularReferenceRemoval;
      return obj;
    },
    _assign(target, source) {
      for (var key in source) {
        target[key] = source[key];
      }
      return target;
    },
    _getFirstPointerId(evt) {
      if (!evt.touches) {
        return evt.pointerId || 999;
      } else {
        return evt.changedTouches[0].identifier;
      }
    },
    releaseCanvas(...canvases) {
      if (!Global_12.Konva.releaseCanvasOnDestroy)
        return;
      canvases.forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    },
    drawRoundedRectPath(context, width, height, cornerRadius) {
      let topLeft = 0;
      let topRight = 0;
      let bottomLeft = 0;
      let bottomRight = 0;
      if (typeof cornerRadius === "number") {
        topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
      } else {
        topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
        topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
        bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
        bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
      }
      context.moveTo(topLeft, 0);
      context.lineTo(width - topRight, 0);
      context.arc(width - topRight, topRight, topRight, Math.PI * 3 / 2, 0, false);
      context.lineTo(width, height - bottomRight);
      context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
      context.lineTo(bottomLeft, height);
      context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
      context.lineTo(0, topLeft);
      context.arc(topLeft, topLeft, topLeft, Math.PI, Math.PI * 3 / 2, false);
    }
  };
})(Util);
var Node$1 = {};
var Factory = {};
var Validators = {};
Object.defineProperty(Validators, "__esModule", { value: true });
Validators.getComponentValidator = Validators.getBooleanValidator = Validators.getNumberArrayValidator = Validators.getFunctionValidator = Validators.getStringOrGradientValidator = Validators.getStringValidator = Validators.getNumberOrAutoValidator = Validators.getNumberOrArrayOfNumbersValidator = Validators.getNumberValidator = Validators.alphaComponent = Validators.RGBComponent = void 0;
const Global_1$p = Global;
const Util_1$f = Util;
function _formatValue(val) {
  if (Util_1$f.Util._isString(val)) {
    return '"' + val + '"';
  }
  if (Object.prototype.toString.call(val) === "[object Number]") {
    return val;
  }
  if (Util_1$f.Util._isBoolean(val)) {
    return val;
  }
  return Object.prototype.toString.call(val);
}
function RGBComponent(val) {
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  }
  return Math.round(val);
}
Validators.RGBComponent = RGBComponent;
function alphaComponent(val) {
  if (val > 1) {
    return 1;
  } else if (val < 1e-4) {
    return 1e-4;
  }
  return val;
}
Validators.alphaComponent = alphaComponent;
function getNumberValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      if (!Util_1$f.Util._isNumber(val)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a number.');
      }
      return val;
    };
  }
}
Validators.getNumberValidator = getNumberValidator;
function getNumberOrArrayOfNumbersValidator(noOfElements) {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      let isNumber2 = Util_1$f.Util._isNumber(val);
      let isValidArray = Util_1$f.Util._isArray(val) && val.length == noOfElements;
      if (!isNumber2 && !isValidArray) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a number or Array<number>(' + noOfElements + ")");
      }
      return val;
    };
  }
}
Validators.getNumberOrArrayOfNumbersValidator = getNumberOrArrayOfNumbersValidator;
function getNumberOrAutoValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      var isNumber2 = Util_1$f.Util._isNumber(val);
      var isAuto = val === "auto";
      if (!(isNumber2 || isAuto)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a number or "auto".');
      }
      return val;
    };
  }
}
Validators.getNumberOrAutoValidator = getNumberOrAutoValidator;
function getStringValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      if (!Util_1$f.Util._isString(val)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a string.');
      }
      return val;
    };
  }
}
Validators.getStringValidator = getStringValidator;
function getStringOrGradientValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      const isString2 = Util_1$f.Util._isString(val);
      const isGradient = Object.prototype.toString.call(val) === "[object CanvasGradient]" || val && val.addColorStop;
      if (!(isString2 || isGradient)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a string or a native gradient.');
      }
      return val;
    };
  }
}
Validators.getStringOrGradientValidator = getStringOrGradientValidator;
function getFunctionValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      if (!Util_1$f.Util._isFunction(val)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a function.');
      }
      return val;
    };
  }
}
Validators.getFunctionValidator = getFunctionValidator;
function getNumberArrayValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      const TypedArray = Int8Array ? Object.getPrototypeOf(Int8Array) : null;
      if (TypedArray && val instanceof TypedArray) {
        return val;
      }
      if (!Util_1$f.Util._isArray(val)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a array of numbers.');
      } else {
        val.forEach(function(item) {
          if (!Util_1$f.Util._isNumber(item)) {
            Util_1$f.Util.warn('"' + attr + '" attribute has non numeric element ' + item + ". Make sure that all elements are numbers.");
          }
        });
      }
      return val;
    };
  }
}
Validators.getNumberArrayValidator = getNumberArrayValidator;
function getBooleanValidator() {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      var isBool = val === true || val === false;
      if (!isBool) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be a boolean.');
      }
      return val;
    };
  }
}
Validators.getBooleanValidator = getBooleanValidator;
function getComponentValidator(components) {
  if (Global_1$p.Konva.isUnminified) {
    return function(val, attr) {
      if (val === void 0 || val === null) {
        return val;
      }
      if (!Util_1$f.Util.isObject(val)) {
        Util_1$f.Util.warn(_formatValue(val) + ' is a not valid value for "' + attr + '" attribute. The value should be an object with properties ' + components);
      }
      return val;
    };
  }
}
Validators.getComponentValidator = getComponentValidator;
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Factory = void 0;
  const Util_12 = Util;
  const Validators_12 = Validators;
  var GET = "get", SET2 = "set";
  exports2.Factory = {
    addGetterSetter(constructor, attr, def2, validator, after2) {
      exports2.Factory.addGetter(constructor, attr, def2);
      exports2.Factory.addSetter(constructor, attr, validator, after2);
      exports2.Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addGetter(constructor, attr, def2) {
      var method2 = GET + Util_12.Util._capitalize(attr);
      constructor.prototype[method2] = constructor.prototype[method2] || function() {
        var val = this.attrs[attr];
        return val === void 0 ? def2 : val;
      };
    },
    addSetter(constructor, attr, validator, after2) {
      var method2 = SET2 + Util_12.Util._capitalize(attr);
      if (!constructor.prototype[method2]) {
        exports2.Factory.overWriteSetter(constructor, attr, validator, after2);
      }
    },
    overWriteSetter(constructor, attr, validator, after2) {
      var method2 = SET2 + Util_12.Util._capitalize(attr);
      constructor.prototype[method2] = function(val) {
        if (validator && val !== void 0 && val !== null) {
          val = validator.call(this, val, attr);
        }
        this._setAttr(attr, val);
        if (after2) {
          after2.call(this);
        }
        return this;
      };
    },
    addComponentsGetterSetter(constructor, attr, components, validator, after2) {
      var len = components.length, capitalize2 = Util_12.Util._capitalize, getter = GET + capitalize2(attr), setter = SET2 + capitalize2(attr), n, component;
      constructor.prototype[getter] = function() {
        var ret = {};
        for (n = 0; n < len; n++) {
          component = components[n];
          ret[component] = this.getAttr(attr + capitalize2(component));
        }
        return ret;
      };
      var basicValidator = (0, Validators_12.getComponentValidator)(components);
      constructor.prototype[setter] = function(val) {
        var oldVal = this.attrs[attr], key;
        if (validator) {
          val = validator.call(this, val);
        }
        if (basicValidator) {
          basicValidator.call(this, val, attr);
        }
        for (key in val) {
          if (!val.hasOwnProperty(key)) {
            continue;
          }
          this._setAttr(attr + capitalize2(key), val[key]);
        }
        if (!val) {
          components.forEach((component2) => {
            this._setAttr(attr + capitalize2(component2), void 0);
          });
        }
        this._fireChangeEvent(attr, oldVal, val);
        if (after2) {
          after2.call(this);
        }
        return this;
      };
      exports2.Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addOverloadedGetterSetter(constructor, attr) {
      var capitalizedAttr = Util_12.Util._capitalize(attr), setter = SET2 + capitalizedAttr, getter = GET + capitalizedAttr;
      constructor.prototype[attr] = function() {
        if (arguments.length) {
          this[setter](arguments[0]);
          return this;
        }
        return this[getter]();
      };
    },
    addDeprecatedGetterSetter(constructor, attr, def2, validator) {
      Util_12.Util.error("Adding deprecated " + attr);
      var method2 = GET + Util_12.Util._capitalize(attr);
      var message = attr + " property is deprecated and will be removed soon. Look at Konva change log for more information.";
      constructor.prototype[method2] = function() {
        Util_12.Util.error(message);
        var val = this.attrs[attr];
        return val === void 0 ? def2 : val;
      };
      exports2.Factory.addSetter(constructor, attr, validator, function() {
        Util_12.Util.error(message);
      });
      exports2.Factory.addOverloadedGetterSetter(constructor, attr);
    },
    backCompat(constructor, methods) {
      Util_12.Util.each(methods, function(oldMethodName, newMethodName) {
        var method2 = constructor.prototype[newMethodName];
        var oldGetter = GET + Util_12.Util._capitalize(oldMethodName);
        var oldSetter = SET2 + Util_12.Util._capitalize(oldMethodName);
        function deprecated() {
          method2.apply(this, arguments);
          Util_12.Util.error('"' + oldMethodName + '" method is deprecated and will be removed soon. Use ""' + newMethodName + '" instead.');
        }
        constructor.prototype[oldMethodName] = deprecated;
        constructor.prototype[oldGetter] = deprecated;
        constructor.prototype[oldSetter] = deprecated;
      });
    },
    afterSetFilter() {
      this._filterUpToDate = false;
    }
  };
})(Factory);
var Canvas$1 = {};
var Context$1 = {};
Object.defineProperty(Context$1, "__esModule", { value: true });
Context$1.HitContext = Context$1.SceneContext = Context$1.Context = void 0;
const Util_1$e = Util;
const Global_1$o = Global;
function simplifyArray(arr) {
  var retArr = [], len = arr.length, util2 = Util_1$e.Util, n, val;
  for (n = 0; n < len; n++) {
    val = arr[n];
    if (util2._isNumber(val)) {
      val = Math.round(val * 1e3) / 1e3;
    } else if (!util2._isString(val)) {
      val = val + "";
    }
    retArr.push(val);
  }
  return retArr;
}
var COMMA = ",", OPEN_PAREN = "(", CLOSE_PAREN = ")", OPEN_PAREN_BRACKET = "([", CLOSE_BRACKET_PAREN = "])", SEMICOLON = ";", DOUBLE_PAREN = "()", EQUALS = "=", CONTEXT_METHODS = [
  "arc",
  "arcTo",
  "beginPath",
  "bezierCurveTo",
  "clearRect",
  "clip",
  "closePath",
  "createLinearGradient",
  "createPattern",
  "createRadialGradient",
  "drawImage",
  "ellipse",
  "fill",
  "fillText",
  "getImageData",
  "createImageData",
  "lineTo",
  "moveTo",
  "putImageData",
  "quadraticCurveTo",
  "rect",
  "roundRect",
  "restore",
  "rotate",
  "save",
  "scale",
  "setLineDash",
  "setTransform",
  "stroke",
  "strokeText",
  "transform",
  "translate"
];
var CONTEXT_PROPERTIES = [
  "fillStyle",
  "strokeStyle",
  "shadowColor",
  "shadowBlur",
  "shadowOffsetX",
  "shadowOffsetY",
  "letterSpacing",
  "lineCap",
  "lineDashOffset",
  "lineJoin",
  "lineWidth",
  "miterLimit",
  "direction",
  "font",
  "textAlign",
  "textBaseline",
  "globalAlpha",
  "globalCompositeOperation",
  "imageSmoothingEnabled"
];
const traceArrMax = 100;
class Context {
  constructor(canvas) {
    this.canvas = canvas;
    if (Global_1$o.Konva.enableTrace) {
      this.traceArr = [];
      this._enableTrace();
    }
  }
  fillShape(shape) {
    if (shape.fillEnabled()) {
      this._fill(shape);
    }
  }
  _fill(shape) {
  }
  strokeShape(shape) {
    if (shape.hasStroke()) {
      this._stroke(shape);
    }
  }
  _stroke(shape) {
  }
  fillStrokeShape(shape) {
    if (shape.attrs.fillAfterStrokeEnabled) {
      this.strokeShape(shape);
      this.fillShape(shape);
    } else {
      this.fillShape(shape);
      this.strokeShape(shape);
    }
  }
  getTrace(relaxed, rounded) {
    var traceArr = this.traceArr, len = traceArr.length, str = "", n, trace, method2, args;
    for (n = 0; n < len; n++) {
      trace = traceArr[n];
      method2 = trace.method;
      if (method2) {
        args = trace.args;
        str += method2;
        if (relaxed) {
          str += DOUBLE_PAREN;
        } else {
          if (Util_1$e.Util._isArray(args[0])) {
            str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
          } else {
            if (rounded) {
              args = args.map((a) => typeof a === "number" ? Math.floor(a) : a);
            }
            str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
          }
        }
      } else {
        str += trace.property;
        if (!relaxed) {
          str += EQUALS + trace.val;
        }
      }
      str += SEMICOLON;
    }
    return str;
  }
  clearTrace() {
    this.traceArr = [];
  }
  _trace(str) {
    var traceArr = this.traceArr, len;
    traceArr.push(str);
    len = traceArr.length;
    if (len >= traceArrMax) {
      traceArr.shift();
    }
  }
  reset() {
    var pixelRatio = this.getCanvas().getPixelRatio();
    this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
  }
  getCanvas() {
    return this.canvas;
  }
  clear(bounds) {
    var canvas = this.getCanvas();
    if (bounds) {
      this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
    } else {
      this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
    }
  }
  _applyLineCap(shape) {
    const lineCap = shape.attrs.lineCap;
    if (lineCap) {
      this.setAttr("lineCap", lineCap);
    }
  }
  _applyOpacity(shape) {
    var absOpacity = shape.getAbsoluteOpacity();
    if (absOpacity !== 1) {
      this.setAttr("globalAlpha", absOpacity);
    }
  }
  _applyLineJoin(shape) {
    const lineJoin = shape.attrs.lineJoin;
    if (lineJoin) {
      this.setAttr("lineJoin", lineJoin);
    }
  }
  setAttr(attr, val) {
    this._context[attr] = val;
  }
  arc(x, y, radius, startAngle, endAngle, counterClockwise) {
    this._context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
  }
  arcTo(x1, y1, x2, y2, radius) {
    this._context.arcTo(x1, y1, x2, y2, radius);
  }
  beginPath() {
    this._context.beginPath();
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }
  clearRect(x, y, width, height) {
    this._context.clearRect(x, y, width, height);
  }
  clip(...args) {
    this._context.clip.apply(this._context, args);
  }
  closePath() {
    this._context.closePath();
  }
  createImageData(width, height) {
    var a = arguments;
    if (a.length === 2) {
      return this._context.createImageData(width, height);
    } else if (a.length === 1) {
      return this._context.createImageData(width);
    }
  }
  createLinearGradient(x0, y0, x1, y1) {
    return this._context.createLinearGradient(x0, y0, x1, y1);
  }
  createPattern(image, repetition) {
    return this._context.createPattern(image, repetition);
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    var a = arguments, _context = this._context;
    if (a.length === 3) {
      _context.drawImage(image, sx, sy);
    } else if (a.length === 5) {
      _context.drawImage(image, sx, sy, sWidth, sHeight);
    } else if (a.length === 9) {
      _context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
  }
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise) {
    this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
  }
  isPointInPath(x, y, path, fillRule) {
    if (path) {
      return this._context.isPointInPath(path, x, y, fillRule);
    }
    return this._context.isPointInPath(x, y, fillRule);
  }
  fill(...args) {
    this._context.fill.apply(this._context, args);
  }
  fillRect(x, y, width, height) {
    this._context.fillRect(x, y, width, height);
  }
  strokeRect(x, y, width, height) {
    this._context.strokeRect(x, y, width, height);
  }
  fillText(text, x, y, maxWidth) {
    if (maxWidth) {
      this._context.fillText(text, x, y, maxWidth);
    } else {
      this._context.fillText(text, x, y);
    }
  }
  measureText(text) {
    return this._context.measureText(text);
  }
  getImageData(sx, sy, sw, sh) {
    return this._context.getImageData(sx, sy, sw, sh);
  }
  lineTo(x, y) {
    this._context.lineTo(x, y);
  }
  moveTo(x, y) {
    this._context.moveTo(x, y);
  }
  rect(x, y, width, height) {
    this._context.rect(x, y, width, height);
  }
  roundRect(x, y, width, height, radii) {
    this._context.roundRect(x, y, width, height, radii);
  }
  putImageData(imageData, dx, dy) {
    this._context.putImageData(imageData, dx, dy);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    this._context.quadraticCurveTo(cpx, cpy, x, y);
  }
  restore() {
    this._context.restore();
  }
  rotate(angle) {
    this._context.rotate(angle);
  }
  save() {
    this._context.save();
  }
  scale(x, y) {
    this._context.scale(x, y);
  }
  setLineDash(segments) {
    if (this._context.setLineDash) {
      this._context.setLineDash(segments);
    } else if ("mozDash" in this._context) {
      this._context["mozDash"] = segments;
    } else if ("webkitLineDash" in this._context) {
      this._context["webkitLineDash"] = segments;
    }
  }
  getLineDash() {
    return this._context.getLineDash();
  }
  setTransform(a, b, c, d, e, f) {
    this._context.setTransform(a, b, c, d, e, f);
  }
  stroke(path2d) {
    if (path2d) {
      this._context.stroke(path2d);
    } else {
      this._context.stroke();
    }
  }
  strokeText(text, x, y, maxWidth) {
    this._context.strokeText(text, x, y, maxWidth);
  }
  transform(a, b, c, d, e, f) {
    this._context.transform(a, b, c, d, e, f);
  }
  translate(x, y) {
    this._context.translate(x, y);
  }
  _enableTrace() {
    var that = this, len = CONTEXT_METHODS.length, origSetter = this.setAttr, n, args;
    var func2 = function(methodName) {
      var origMethod = that[methodName], ret;
      that[methodName] = function() {
        args = simplifyArray(Array.prototype.slice.call(arguments, 0));
        ret = origMethod.apply(that, arguments);
        that._trace({
          method: methodName,
          args
        });
        return ret;
      };
    };
    for (n = 0; n < len; n++) {
      func2(CONTEXT_METHODS[n]);
    }
    that.setAttr = function() {
      origSetter.apply(that, arguments);
      var prop = arguments[0];
      var val = arguments[1];
      if (prop === "shadowOffsetX" || prop === "shadowOffsetY" || prop === "shadowBlur") {
        val = val / this.canvas.getPixelRatio();
      }
      that._trace({
        property: prop,
        val
      });
    };
  }
  _applyGlobalCompositeOperation(node) {
    const op = node.attrs.globalCompositeOperation;
    var def2 = !op || op === "source-over";
    if (!def2) {
      this.setAttr("globalCompositeOperation", op);
    }
  }
}
Context$1.Context = Context;
CONTEXT_PROPERTIES.forEach(function(prop) {
  Object.defineProperty(Context.prototype, prop, {
    get() {
      return this._context[prop];
    },
    set(val) {
      this._context[prop] = val;
    }
  });
});
class SceneContext extends Context {
  constructor(canvas, { willReadFrequently = false } = {}) {
    super(canvas);
    this._context = canvas._canvas.getContext("2d", {
      willReadFrequently
    });
  }
  _fillColor(shape) {
    var fill2 = shape.fill();
    this.setAttr("fillStyle", fill2);
    shape._fillFunc(this);
  }
  _fillPattern(shape) {
    this.setAttr("fillStyle", shape._getFillPattern());
    shape._fillFunc(this);
  }
  _fillLinearGradient(shape) {
    var grd = shape._getLinearGradient();
    if (grd) {
      this.setAttr("fillStyle", grd);
      shape._fillFunc(this);
    }
  }
  _fillRadialGradient(shape) {
    const grd = shape._getRadialGradient();
    if (grd) {
      this.setAttr("fillStyle", grd);
      shape._fillFunc(this);
    }
  }
  _fill(shape) {
    const hasColor = shape.fill(), fillPriority = shape.getFillPriority();
    if (hasColor && fillPriority === "color") {
      this._fillColor(shape);
      return;
    }
    const hasPattern = shape.getFillPatternImage();
    if (hasPattern && fillPriority === "pattern") {
      this._fillPattern(shape);
      return;
    }
    const hasLinearGradient = shape.getFillLinearGradientColorStops();
    if (hasLinearGradient && fillPriority === "linear-gradient") {
      this._fillLinearGradient(shape);
      return;
    }
    const hasRadialGradient = shape.getFillRadialGradientColorStops();
    if (hasRadialGradient && fillPriority === "radial-gradient") {
      this._fillRadialGradient(shape);
      return;
    }
    if (hasColor) {
      this._fillColor(shape);
    } else if (hasPattern) {
      this._fillPattern(shape);
    } else if (hasLinearGradient) {
      this._fillLinearGradient(shape);
    } else if (hasRadialGradient) {
      this._fillRadialGradient(shape);
    }
  }
  _strokeLinearGradient(shape) {
    const start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
    if (colorStops) {
      for (var n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n], colorStops[n + 1]);
      }
      this.setAttr("strokeStyle", grd);
    }
  }
  _stroke(shape) {
    var dash = shape.dash(), strokeScaleEnabled = shape.getStrokeScaleEnabled();
    if (shape.hasStroke()) {
      if (!strokeScaleEnabled) {
        this.save();
        var pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);
      if (dash && shape.dashEnabled()) {
        this.setLineDash(dash);
        this.setAttr("lineDashOffset", shape.dashOffset());
      }
      this.setAttr("lineWidth", shape.strokeWidth());
      if (!shape.getShadowForStrokeEnabled()) {
        this.setAttr("shadowColor", "rgba(0,0,0,0)");
      }
      var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
      if (hasLinearGradient) {
        this._strokeLinearGradient(shape);
      } else {
        this.setAttr("strokeStyle", shape.stroke());
      }
      shape._strokeFunc(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
  _applyShadow(shape) {
    var _a, _b, _c;
    var color = (_a = shape.getShadowRGBA()) !== null && _a !== void 0 ? _a : "black", blur = (_b = shape.getShadowBlur()) !== null && _b !== void 0 ? _b : 5, offset = (_c = shape.getShadowOffset()) !== null && _c !== void 0 ? _c : {
      x: 0,
      y: 0
    }, scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
    this.setAttr("shadowColor", color);
    this.setAttr("shadowBlur", blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
    this.setAttr("shadowOffsetX", offset.x * scaleX);
    this.setAttr("shadowOffsetY", offset.y * scaleY);
  }
}
Context$1.SceneContext = SceneContext;
class HitContext extends Context {
  constructor(canvas) {
    super(canvas);
    this._context = canvas._canvas.getContext("2d", {
      willReadFrequently: true
    });
  }
  _fill(shape) {
    this.save();
    this.setAttr("fillStyle", shape.colorKey);
    shape._fillFuncHit(this);
    this.restore();
  }
  strokeShape(shape) {
    if (shape.hasHitStroke()) {
      this._stroke(shape);
    }
  }
  _stroke(shape) {
    if (shape.hasHitStroke()) {
      const strokeScaleEnabled = shape.getStrokeScaleEnabled();
      if (!strokeScaleEnabled) {
        this.save();
        var pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);
      var hitStrokeWidth = shape.hitStrokeWidth();
      var strokeWidth = hitStrokeWidth === "auto" ? shape.strokeWidth() : hitStrokeWidth;
      this.setAttr("lineWidth", strokeWidth);
      this.setAttr("strokeStyle", shape.colorKey);
      shape._strokeFuncHit(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
}
Context$1.HitContext = HitContext;
Object.defineProperty(Canvas$1, "__esModule", { value: true });
Canvas$1.HitCanvas = Canvas$1.SceneCanvas = Canvas$1.Canvas = void 0;
const Util_1$d = Util;
const Context_1 = Context$1;
const Global_1$n = Global;
const Factory_1$z = Factory;
const Validators_1$y = Validators;
var _pixelRatio;
function getDevicePixelRatio() {
  if (_pixelRatio) {
    return _pixelRatio;
  }
  var canvas = Util_1$d.Util.createCanvasElement();
  var context = canvas.getContext("2d");
  _pixelRatio = function() {
    var devicePixelRatio = Global_1$n.Konva._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  }();
  Util_1$d.Util.releaseCanvas(canvas);
  return _pixelRatio;
}
class Canvas {
  constructor(config) {
    this.pixelRatio = 1;
    this.width = 0;
    this.height = 0;
    this.isCache = false;
    var conf = config || {};
    var pixelRatio = conf.pixelRatio || Global_1$n.Konva.pixelRatio || getDevicePixelRatio();
    this.pixelRatio = pixelRatio;
    this._canvas = Util_1$d.Util.createCanvasElement();
    this._canvas.style.padding = "0";
    this._canvas.style.margin = "0";
    this._canvas.style.border = "0";
    this._canvas.style.background = "transparent";
    this._canvas.style.position = "absolute";
    this._canvas.style.top = "0";
    this._canvas.style.left = "0";
  }
  getContext() {
    return this.context;
  }
  getPixelRatio() {
    return this.pixelRatio;
  }
  setPixelRatio(pixelRatio) {
    var previousRatio = this.pixelRatio;
    this.pixelRatio = pixelRatio;
    this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
  }
  setWidth(width) {
    this.width = this._canvas.width = width * this.pixelRatio;
    this._canvas.style.width = width + "px";
    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  setHeight(height) {
    this.height = this._canvas.height = height * this.pixelRatio;
    this._canvas.style.height = height + "px";
    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setSize(width, height) {
    this.setWidth(width || 0);
    this.setHeight(height || 0);
  }
  toDataURL(mimeType, quality) {
    try {
      return this._canvas.toDataURL(mimeType, quality);
    } catch (e) {
      try {
        return this._canvas.toDataURL();
      } catch (err) {
        Util_1$d.Util.error("Unable to get data URL. " + err.message + " For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.");
        return "";
      }
    }
  }
}
Canvas$1.Canvas = Canvas;
Factory_1$z.Factory.addGetterSetter(Canvas, "pixelRatio", void 0, (0, Validators_1$y.getNumberValidator)());
class SceneCanvas extends Canvas {
  constructor(config = { width: 0, height: 0, willReadFrequently: false }) {
    super(config);
    this.context = new Context_1.SceneContext(this, {
      willReadFrequently: config.willReadFrequently
    });
    this.setSize(config.width, config.height);
  }
}
Canvas$1.SceneCanvas = SceneCanvas;
class HitCanvas extends Canvas {
  constructor(config = { width: 0, height: 0 }) {
    super(config);
    this.hitCanvas = true;
    this.context = new Context_1.HitContext(this);
    this.setSize(config.width, config.height);
  }
}
Canvas$1.HitCanvas = HitCanvas;
var DragAndDrop = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.DD = void 0;
  const Global_12 = Global;
  const Util_12 = Util;
  exports2.DD = {
    get isDragging() {
      var flag = false;
      exports2.DD._dragElements.forEach((elem) => {
        if (elem.dragStatus === "dragging") {
          flag = true;
        }
      });
      return flag;
    },
    justDragged: false,
    get node() {
      var node;
      exports2.DD._dragElements.forEach((elem) => {
        node = elem.node;
      });
      return node;
    },
    _dragElements: /* @__PURE__ */ new Map(),
    _drag(evt) {
      const nodesToFireEvents = [];
      exports2.DD._dragElements.forEach((elem, key) => {
        const { node } = elem;
        const stage = node.getStage();
        stage.setPointersPositions(evt);
        if (elem.pointerId === void 0) {
          elem.pointerId = Util_12.Util._getFirstPointerId(evt);
        }
        const pos = stage._changedPointerPositions.find((pos2) => pos2.id === elem.pointerId);
        if (!pos) {
          return;
        }
        if (elem.dragStatus !== "dragging") {
          var dragDistance = node.dragDistance();
          var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
          if (distance < dragDistance) {
            return;
          }
          node.startDrag({ evt });
          if (!node.isDragging()) {
            return;
          }
        }
        node._setDragPosition(evt, elem);
        nodesToFireEvents.push(node);
      });
      nodesToFireEvents.forEach((node) => {
        node.fire("dragmove", {
          type: "dragmove",
          target: node,
          evt
        }, true);
      });
    },
    _endDragBefore(evt) {
      const drawNodes = [];
      exports2.DD._dragElements.forEach((elem) => {
        const { node } = elem;
        const stage = node.getStage();
        if (evt) {
          stage.setPointersPositions(evt);
        }
        const pos = stage._changedPointerPositions.find((pos2) => pos2.id === elem.pointerId);
        if (!pos) {
          return;
        }
        if (elem.dragStatus === "dragging" || elem.dragStatus === "stopped") {
          exports2.DD.justDragged = true;
          Global_12.Konva._mouseListenClick = false;
          Global_12.Konva._touchListenClick = false;
          Global_12.Konva._pointerListenClick = false;
          elem.dragStatus = "stopped";
        }
        const drawNode = elem.node.getLayer() || elem.node instanceof Global_12.Konva["Stage"] && elem.node;
        if (drawNode && drawNodes.indexOf(drawNode) === -1) {
          drawNodes.push(drawNode);
        }
      });
      drawNodes.forEach((drawNode) => {
        drawNode.draw();
      });
    },
    _endDragAfter(evt) {
      exports2.DD._dragElements.forEach((elem, key) => {
        if (elem.dragStatus === "stopped") {
          elem.node.fire("dragend", {
            type: "dragend",
            target: elem.node,
            evt
          }, true);
        }
        if (elem.dragStatus !== "dragging") {
          exports2.DD._dragElements.delete(key);
        }
      });
    }
  };
  if (Global_12.Konva.isBrowser) {
    window.addEventListener("mouseup", exports2.DD._endDragBefore, true);
    window.addEventListener("touchend", exports2.DD._endDragBefore, true);
    window.addEventListener("mousemove", exports2.DD._drag);
    window.addEventListener("touchmove", exports2.DD._drag);
    window.addEventListener("mouseup", exports2.DD._endDragAfter, false);
    window.addEventListener("touchend", exports2.DD._endDragAfter, false);
  }
})(DragAndDrop);
Object.defineProperty(Node$1, "__esModule", { value: true });
Node$1.Node = void 0;
const Util_1$c = Util;
const Factory_1$y = Factory;
const Canvas_1$1 = Canvas$1;
const Global_1$m = Global;
const DragAndDrop_1 = DragAndDrop;
const Validators_1$x = Validators;
var ABSOLUTE_OPACITY = "absoluteOpacity", ALL_LISTENERS = "allEventListeners", ABSOLUTE_TRANSFORM = "absoluteTransform", ABSOLUTE_SCALE = "absoluteScale", CANVAS = "canvas", CHANGE = "Change", CHILDREN = "children", KONVA = "konva", LISTENING = "listening", MOUSEENTER = "mouseenter", MOUSELEAVE = "mouseleave", SET = "set", SHAPE = "Shape", SPACE$1 = " ", STAGE = "stage", TRANSFORM = "transform", UPPER_STAGE = "Stage", VISIBLE = "visible", TRANSFORM_CHANGE_STR$1 = [
  "xChange.konva",
  "yChange.konva",
  "scaleXChange.konva",
  "scaleYChange.konva",
  "skewXChange.konva",
  "skewYChange.konva",
  "rotationChange.konva",
  "offsetXChange.konva",
  "offsetYChange.konva",
  "transformsEnabledChange.konva"
].join(SPACE$1);
let idCounter = 1;
class Node {
  constructor(config) {
    this._id = idCounter++;
    this.eventListeners = {};
    this.attrs = {};
    this.index = 0;
    this._allEventListeners = null;
    this.parent = null;
    this._cache = /* @__PURE__ */ new Map();
    this._attachedDepsListeners = /* @__PURE__ */ new Map();
    this._lastPos = null;
    this._batchingTransformChange = false;
    this._needClearTransformCache = false;
    this._filterUpToDate = false;
    this._isUnderCache = false;
    this._dragEventId = null;
    this._shouldFireChangeEvents = false;
    this.setAttrs(config);
    this._shouldFireChangeEvents = true;
  }
  hasChildren() {
    return false;
  }
  _clearCache(attr) {
    if ((attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM) && this._cache.get(attr)) {
      this._cache.get(attr).dirty = true;
    } else if (attr) {
      this._cache.delete(attr);
    } else {
      this._cache.clear();
    }
  }
  _getCache(attr, privateGetter) {
    var cache = this._cache.get(attr);
    var isTransform = attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM;
    var invalid = cache === void 0 || isTransform && cache.dirty === true;
    if (invalid) {
      cache = privateGetter.call(this);
      this._cache.set(attr, cache);
    }
    return cache;
  }
  _calculate(name, deps, getter) {
    if (!this._attachedDepsListeners.get(name)) {
      const depsString = deps.map((dep) => dep + "Change.konva").join(SPACE$1);
      this.on(depsString, () => {
        this._clearCache(name);
      });
      this._attachedDepsListeners.set(name, true);
    }
    return this._getCache(name, getter);
  }
  _getCanvasCache() {
    return this._cache.get(CANVAS);
  }
  _clearSelfAndDescendantCache(attr) {
    this._clearCache(attr);
    if (attr === ABSOLUTE_TRANSFORM) {
      this.fire("absoluteTransformChange");
    }
  }
  clearCache() {
    if (this._cache.has(CANVAS)) {
      const { scene, filter: filter2, hit } = this._cache.get(CANVAS);
      Util_1$c.Util.releaseCanvas(scene, filter2, hit);
      this._cache.delete(CANVAS);
    }
    this._clearSelfAndDescendantCache();
    this._requestDraw();
    return this;
  }
  cache(config) {
    var conf = config || {};
    var rect = {};
    if (conf.x === void 0 || conf.y === void 0 || conf.width === void 0 || conf.height === void 0) {
      rect = this.getClientRect({
        skipTransform: true,
        relativeTo: this.getParent() || void 0
      });
    }
    var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === void 0 ? Math.floor(rect.x) : conf.x, y = conf.y === void 0 ? Math.floor(rect.y) : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false, hitCanvasPixelRatio = conf.hitCanvasPixelRatio || 1;
    if (!width || !height) {
      Util_1$c.Util.error("Can not cache the node. Width or height of the node equals 0. Caching is skipped.");
      return;
    }
    const extraPaddingX = Math.abs(Math.round(rect.x) - x) > 0.5 ? 1 : 0;
    const extraPaddingY = Math.abs(Math.round(rect.y) - y) > 0.5 ? 1 : 0;
    width += offset * 2 + extraPaddingX;
    height += offset * 2 + extraPaddingY;
    x -= offset;
    y -= offset;
    var cachedSceneCanvas = new Canvas_1$1.SceneCanvas({
      pixelRatio,
      width,
      height
    }), cachedFilterCanvas = new Canvas_1$1.SceneCanvas({
      pixelRatio,
      width: 0,
      height: 0,
      willReadFrequently: true
    }), cachedHitCanvas = new Canvas_1$1.HitCanvas({
      pixelRatio: hitCanvasPixelRatio,
      width,
      height
    }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
    cachedHitCanvas.isCache = true;
    cachedSceneCanvas.isCache = true;
    this._cache.delete(CANVAS);
    this._filterUpToDate = false;
    if (conf.imageSmoothingEnabled === false) {
      cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
      cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
    }
    sceneContext.save();
    hitContext.save();
    sceneContext.translate(-x, -y);
    hitContext.translate(-x, -y);
    this._isUnderCache = true;
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
    this.drawScene(cachedSceneCanvas, this);
    this.drawHit(cachedHitCanvas, this);
    this._isUnderCache = false;
    sceneContext.restore();
    hitContext.restore();
    if (drawBorder) {
      sceneContext.save();
      sceneContext.beginPath();
      sceneContext.rect(0, 0, width, height);
      sceneContext.closePath();
      sceneContext.setAttr("strokeStyle", "red");
      sceneContext.setAttr("lineWidth", 5);
      sceneContext.stroke();
      sceneContext.restore();
    }
    this._cache.set(CANVAS, {
      scene: cachedSceneCanvas,
      filter: cachedFilterCanvas,
      hit: cachedHitCanvas,
      x,
      y
    });
    this._requestDraw();
    return this;
  }
  isCached() {
    return this._cache.has(CANVAS);
  }
  getClientRect(config) {
    throw new Error('abstract "getClientRect" method call');
  }
  _transformedRect(rect, top) {
    var points = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var trans = this.getAbsoluteTransform(top);
    points.forEach(function(point) {
      var transformed = trans.point(point);
      if (minX === void 0) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  _drawCachedSceneCanvas(context) {
    context.save();
    context._applyOpacity(this);
    context._applyGlobalCompositeOperation(this);
    const canvasCache = this._getCanvasCache();
    context.translate(canvasCache.x, canvasCache.y);
    var cacheCanvas = this._getCachedSceneCanvas();
    var ratio = cacheCanvas.pixelRatio;
    context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
    context.restore();
  }
  _drawCachedHitCanvas(context) {
    var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
    context.save();
    context.translate(canvasCache.x, canvasCache.y);
    context.drawImage(hitCanvas._canvas, 0, 0, hitCanvas.width / hitCanvas.pixelRatio, hitCanvas.height / hitCanvas.pixelRatio);
    context.restore();
  }
  _getCachedSceneCanvas() {
    var filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter2;
    if (filters) {
      if (!this._filterUpToDate) {
        var ratio = sceneCanvas.pixelRatio;
        filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
        try {
          len = filters.length;
          filterContext.clear();
          filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
          imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
          for (n = 0; n < len; n++) {
            filter2 = filters[n];
            if (typeof filter2 !== "function") {
              Util_1$c.Util.error("Filter should be type of function, but got " + typeof filter2 + " instead. Please check correct filters");
              continue;
            }
            filter2.call(this, imageData);
            filterContext.putImageData(imageData, 0, 0);
          }
        } catch (e) {
          Util_1$c.Util.error("Unable to apply filter. " + e.message + " This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.");
        }
        this._filterUpToDate = true;
      }
      return filterCanvas;
    }
    return sceneCanvas;
  }
  on(evtStr, handler) {
    this._cache && this._cache.delete(ALL_LISTENERS);
    if (arguments.length === 3) {
      return this._delegate.apply(this, arguments);
    }
    var events = evtStr.split(SPACE$1), len = events.length, n, event, parts, baseEvent, name;
    for (n = 0; n < len; n++) {
      event = events[n];
      parts = event.split(".");
      baseEvent = parts[0];
      name = parts[1] || "";
      if (!this.eventListeners[baseEvent]) {
        this.eventListeners[baseEvent] = [];
      }
      this.eventListeners[baseEvent].push({
        name,
        handler
      });
    }
    return this;
  }
  off(evtStr, callback) {
    var events = (evtStr || "").split(SPACE$1), len = events.length, n, t, event, parts, baseEvent, name;
    this._cache && this._cache.delete(ALL_LISTENERS);
    if (!evtStr) {
      for (t in this.eventListeners) {
        this._off(t);
      }
    }
    for (n = 0; n < len; n++) {
      event = events[n];
      parts = event.split(".");
      baseEvent = parts[0];
      name = parts[1];
      if (baseEvent) {
        if (this.eventListeners[baseEvent]) {
          this._off(baseEvent, name, callback);
        }
      } else {
        for (t in this.eventListeners) {
          this._off(t, name, callback);
        }
      }
    }
    return this;
  }
  dispatchEvent(evt) {
    var e = {
      target: this,
      type: evt.type,
      evt
    };
    this.fire(evt.type, e);
    return this;
  }
  addEventListener(type, handler) {
    this.on(type, function(evt) {
      handler.call(this, evt.evt);
    });
    return this;
  }
  removeEventListener(type) {
    this.off(type);
    return this;
  }
  _delegate(event, selector, handler) {
    var stopNode = this;
    this.on(event, function(evt) {
      var targets = evt.target.findAncestors(selector, true, stopNode);
      for (var i = 0; i < targets.length; i++) {
        evt = Util_1$c.Util.cloneObject(evt);
        evt.currentTarget = targets[i];
        handler.call(targets[i], evt);
      }
    });
  }
  remove() {
    if (this.isDragging()) {
      this.stopDrag();
    }
    DragAndDrop_1.DD._dragElements.delete(this._id);
    this._remove();
    return this;
  }
  _clearCaches() {
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
    this._clearSelfAndDescendantCache(STAGE);
    this._clearSelfAndDescendantCache(VISIBLE);
    this._clearSelfAndDescendantCache(LISTENING);
  }
  _remove() {
    this._clearCaches();
    var parent2 = this.getParent();
    if (parent2 && parent2.children) {
      parent2.children.splice(this.index, 1);
      parent2._setChildrenIndices();
      this.parent = null;
    }
  }
  destroy() {
    this.remove();
    this.clearCache();
    return this;
  }
  getAttr(attr) {
    var method2 = "get" + Util_1$c.Util._capitalize(attr);
    if (Util_1$c.Util._isFunction(this[method2])) {
      return this[method2]();
    }
    return this.attrs[attr];
  }
  getAncestors() {
    var parent2 = this.getParent(), ancestors = [];
    while (parent2) {
      ancestors.push(parent2);
      parent2 = parent2.getParent();
    }
    return ancestors;
  }
  getAttrs() {
    return this.attrs || {};
  }
  setAttrs(config) {
    this._batchTransformChanges(() => {
      var key, method2;
      if (!config) {
        return this;
      }
      for (key in config) {
        if (key === CHILDREN) {
          continue;
        }
        method2 = SET + Util_1$c.Util._capitalize(key);
        if (Util_1$c.Util._isFunction(this[method2])) {
          this[method2](config[key]);
        } else {
          this._setAttr(key, config[key]);
        }
      }
    });
    return this;
  }
  isListening() {
    return this._getCache(LISTENING, this._isListening);
  }
  _isListening(relativeTo) {
    const listening = this.listening();
    if (!listening) {
      return false;
    }
    const parent2 = this.getParent();
    if (parent2 && parent2 !== relativeTo && this !== relativeTo) {
      return parent2._isListening(relativeTo);
    } else {
      return true;
    }
  }
  isVisible() {
    return this._getCache(VISIBLE, this._isVisible);
  }
  _isVisible(relativeTo) {
    const visible = this.visible();
    if (!visible) {
      return false;
    }
    const parent2 = this.getParent();
    if (parent2 && parent2 !== relativeTo && this !== relativeTo) {
      return parent2._isVisible(relativeTo);
    } else {
      return true;
    }
  }
  shouldDrawHit(top, skipDragCheck = false) {
    if (top) {
      return this._isVisible(top) && this._isListening(top);
    }
    var layer = this.getLayer();
    var layerUnderDrag = false;
    DragAndDrop_1.DD._dragElements.forEach((elem) => {
      if (elem.dragStatus !== "dragging") {
        return;
      } else if (elem.node.nodeType === "Stage") {
        layerUnderDrag = true;
      } else if (elem.node.getLayer() === layer) {
        layerUnderDrag = true;
      }
    });
    var dragSkip = !skipDragCheck && !Global_1$m.Konva.hitOnDragEnabled && (layerUnderDrag || Global_1$m.Konva.isTransforming());
    return this.isListening() && this.isVisible() && !dragSkip;
  }
  show() {
    this.visible(true);
    return this;
  }
  hide() {
    this.visible(false);
    return this;
  }
  getZIndex() {
    return this.index || 0;
  }
  getAbsoluteZIndex() {
    var depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
    function addChildren(children) {
      nodes = [];
      len = children.length;
      for (n = 0; n < len; n++) {
        child = children[n];
        index++;
        if (child.nodeType !== SHAPE) {
          nodes = nodes.concat(child.getChildren().slice());
        }
        if (child._id === that._id) {
          n = len;
        }
      }
      if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
        addChildren(nodes);
      }
    }
    const stage = this.getStage();
    if (that.nodeType !== UPPER_STAGE && stage) {
      addChildren(stage.getChildren());
    }
    return index;
  }
  getDepth() {
    var depth = 0, parent2 = this.parent;
    while (parent2) {
      depth++;
      parent2 = parent2.parent;
    }
    return depth;
  }
  _batchTransformChanges(func2) {
    this._batchingTransformChange = true;
    func2();
    this._batchingTransformChange = false;
    if (this._needClearTransformCache) {
      this._clearCache(TRANSFORM);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    }
    this._needClearTransformCache = false;
  }
  setPosition(pos) {
    this._batchTransformChanges(() => {
      this.x(pos.x);
      this.y(pos.y);
    });
    return this;
  }
  getPosition() {
    return {
      x: this.x(),
      y: this.y()
    };
  }
  getRelativePointerPosition() {
    const stage = this.getStage();
    if (!stage) {
      return null;
    }
    var pos = stage.getPointerPosition();
    if (!pos) {
      return null;
    }
    var transform2 = this.getAbsoluteTransform().copy();
    transform2.invert();
    return transform2.point(pos);
  }
  getAbsolutePosition(top) {
    let haveCachedParent = false;
    let parent2 = this.parent;
    while (parent2) {
      if (parent2.isCached()) {
        haveCachedParent = true;
        break;
      }
      parent2 = parent2.parent;
    }
    if (haveCachedParent && !top) {
      top = true;
    }
    var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Util_1$c.Transform(), offset = this.offset();
    absoluteTransform.m = absoluteMatrix.slice();
    absoluteTransform.translate(offset.x, offset.y);
    return absoluteTransform.getTranslation();
  }
  setAbsolutePosition(pos) {
    const { x, y, ...origTrans } = this._clearTransform();
    this.attrs.x = x;
    this.attrs.y = y;
    this._clearCache(TRANSFORM);
    var it = this._getAbsoluteTransform().copy();
    it.invert();
    it.translate(pos.x, pos.y);
    pos = {
      x: this.attrs.x + it.getTranslation().x,
      y: this.attrs.y + it.getTranslation().y
    };
    this._setTransform(origTrans);
    this.setPosition({ x: pos.x, y: pos.y });
    this._clearCache(TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    return this;
  }
  _setTransform(trans) {
    var key;
    for (key in trans) {
      this.attrs[key] = trans[key];
    }
  }
  _clearTransform() {
    var trans = {
      x: this.x(),
      y: this.y(),
      rotation: this.rotation(),
      scaleX: this.scaleX(),
      scaleY: this.scaleY(),
      offsetX: this.offsetX(),
      offsetY: this.offsetY(),
      skewX: this.skewX(),
      skewY: this.skewY()
    };
    this.attrs.x = 0;
    this.attrs.y = 0;
    this.attrs.rotation = 0;
    this.attrs.scaleX = 1;
    this.attrs.scaleY = 1;
    this.attrs.offsetX = 0;
    this.attrs.offsetY = 0;
    this.attrs.skewX = 0;
    this.attrs.skewY = 0;
    return trans;
  }
  move(change) {
    var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
    if (changeX !== void 0) {
      x += changeX;
    }
    if (changeY !== void 0) {
      y += changeY;
    }
    this.setPosition({ x, y });
    return this;
  }
  _eachAncestorReverse(func2, top) {
    var family = [], parent2 = this.getParent(), len, n;
    if (top && top._id === this._id) {
      return;
    }
    family.unshift(this);
    while (parent2 && (!top || parent2._id !== top._id)) {
      family.unshift(parent2);
      parent2 = parent2.parent;
    }
    len = family.length;
    for (n = 0; n < len; n++) {
      func2(family[n]);
    }
  }
  rotate(theta) {
    this.rotation(this.rotation() + theta);
    return this;
  }
  moveToTop() {
    if (!this.parent) {
      Util_1$c.Util.warn("Node has no parent. moveToTop function is ignored.");
      return false;
    }
    var index = this.index, len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.push(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveUp() {
    if (!this.parent) {
      Util_1$c.Util.warn("Node has no parent. moveUp function is ignored.");
      return false;
    }
    var index = this.index, len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index + 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveDown() {
    if (!this.parent) {
      Util_1$c.Util.warn("Node has no parent. moveDown function is ignored.");
      return false;
    }
    var index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index - 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveToBottom() {
    if (!this.parent) {
      Util_1$c.Util.warn("Node has no parent. moveToBottom function is ignored.");
      return false;
    }
    var index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.unshift(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  setZIndex(zIndex) {
    if (!this.parent) {
      Util_1$c.Util.warn("Node has no parent. zIndex parameter is ignored.");
      return this;
    }
    if (zIndex < 0 || zIndex >= this.parent.children.length) {
      Util_1$c.Util.warn("Unexpected value " + zIndex + " for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to " + (this.parent.children.length - 1) + ".");
    }
    var index = this.index;
    this.parent.children.splice(index, 1);
    this.parent.children.splice(zIndex, 0, this);
    this.parent._setChildrenIndices();
    return this;
  }
  getAbsoluteOpacity() {
    return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
  }
  _getAbsoluteOpacity() {
    var absOpacity = this.opacity();
    var parent2 = this.getParent();
    if (parent2 && !parent2._isUnderCache) {
      absOpacity *= parent2.getAbsoluteOpacity();
    }
    return absOpacity;
  }
  moveTo(newContainer) {
    if (this.getParent() !== newContainer) {
      this._remove();
      newContainer.add(this);
    }
    return this;
  }
  toObject() {
    var attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
    const obj = {
      attrs: {},
      className: this.getClassName()
    };
    for (key in attrs) {
      val = attrs[key];
      nonPlainObject = Util_1$c.Util.isObject(val) && !Util_1$c.Util._isPlainObject(val) && !Util_1$c.Util._isArray(val);
      if (nonPlainObject) {
        continue;
      }
      getter = typeof this[key] === "function" && this[key];
      delete attrs[key];
      defaultValue = getter ? getter.call(this) : null;
      attrs[key] = val;
      if (defaultValue !== val) {
        obj.attrs[key] = val;
      }
    }
    return Util_1$c.Util._prepareToStringify(obj);
  }
  toJSON() {
    return JSON.stringify(this.toObject());
  }
  getParent() {
    return this.parent;
  }
  findAncestors(selector, includeSelf, stopNode) {
    var res = [];
    if (includeSelf && this._isMatch(selector)) {
      res.push(this);
    }
    var ancestor = this.parent;
    while (ancestor) {
      if (ancestor === stopNode) {
        return res;
      }
      if (ancestor._isMatch(selector)) {
        res.push(ancestor);
      }
      ancestor = ancestor.parent;
    }
    return res;
  }
  isAncestorOf(node) {
    return false;
  }
  findAncestor(selector, includeSelf, stopNode) {
    return this.findAncestors(selector, includeSelf, stopNode)[0];
  }
  _isMatch(selector) {
    if (!selector) {
      return false;
    }
    if (typeof selector === "function") {
      return selector(this);
    }
    var selectorArr = selector.replace(/ /g, "").split(","), len = selectorArr.length, n, sel;
    for (n = 0; n < len; n++) {
      sel = selectorArr[n];
      if (!Util_1$c.Util.isValidSelector(sel)) {
        Util_1$c.Util.warn('Selector "' + sel + '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
        Util_1$c.Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
        Util_1$c.Util.warn("Konva is awesome, right?");
      }
      if (sel.charAt(0) === "#") {
        if (this.id() === sel.slice(1)) {
          return true;
        }
      } else if (sel.charAt(0) === ".") {
        if (this.hasName(sel.slice(1))) {
          return true;
        }
      } else if (this.className === sel || this.nodeType === sel) {
        return true;
      }
    }
    return false;
  }
  getLayer() {
    var parent2 = this.getParent();
    return parent2 ? parent2.getLayer() : null;
  }
  getStage() {
    return this._getCache(STAGE, this._getStage);
  }
  _getStage() {
    var parent2 = this.getParent();
    if (parent2) {
      return parent2.getStage();
    } else {
      return null;
    }
  }
  fire(eventType, evt = {}, bubble) {
    evt.target = evt.target || this;
    if (bubble) {
      this._fireAndBubble(eventType, evt);
    } else {
      this._fire(eventType, evt);
    }
    return this;
  }
  getAbsoluteTransform(top) {
    if (top) {
      return this._getAbsoluteTransform(top);
    } else {
      return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
    }
  }
  _getAbsoluteTransform(top) {
    var at2;
    if (top) {
      at2 = new Util_1$c.Transform();
      this._eachAncestorReverse(function(node) {
        var transformsEnabled2 = node.transformsEnabled();
        if (transformsEnabled2 === "all") {
          at2.multiply(node.getTransform());
        } else if (transformsEnabled2 === "position") {
          at2.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
        }
      }, top);
      return at2;
    } else {
      at2 = this._cache.get(ABSOLUTE_TRANSFORM) || new Util_1$c.Transform();
      if (this.parent) {
        this.parent.getAbsoluteTransform().copyInto(at2);
      } else {
        at2.reset();
      }
      var transformsEnabled = this.transformsEnabled();
      if (transformsEnabled === "all") {
        at2.multiply(this.getTransform());
      } else if (transformsEnabled === "position") {
        const x = this.attrs.x || 0;
        const y = this.attrs.y || 0;
        const offsetX = this.attrs.offsetX || 0;
        const offsetY = this.attrs.offsetY || 0;
        at2.translate(x - offsetX, y - offsetY);
      }
      at2.dirty = false;
      return at2;
    }
  }
  getAbsoluteScale(top) {
    var parent2 = this;
    while (parent2) {
      if (parent2._isUnderCache) {
        top = parent2;
      }
      parent2 = parent2.getParent();
    }
    const transform2 = this.getAbsoluteTransform(top);
    const attrs = transform2.decompose();
    return {
      x: attrs.scaleX,
      y: attrs.scaleY
    };
  }
  getAbsoluteRotation() {
    return this.getAbsoluteTransform().decompose().rotation;
  }
  getTransform() {
    return this._getCache(TRANSFORM, this._getTransform);
  }
  _getTransform() {
    var _a, _b;
    var m = this._cache.get(TRANSFORM) || new Util_1$c.Transform();
    m.reset();
    var x = this.x(), y = this.y(), rotation = Global_1$m.Konva.getAngle(this.rotation()), scaleX = (_a = this.attrs.scaleX) !== null && _a !== void 0 ? _a : 1, scaleY = (_b = this.attrs.scaleY) !== null && _b !== void 0 ? _b : 1, skewX = this.attrs.skewX || 0, skewY = this.attrs.skewY || 0, offsetX = this.attrs.offsetX || 0, offsetY = this.attrs.offsetY || 0;
    if (x !== 0 || y !== 0) {
      m.translate(x, y);
    }
    if (rotation !== 0) {
      m.rotate(rotation);
    }
    if (skewX !== 0 || skewY !== 0) {
      m.skew(skewX, skewY);
    }
    if (scaleX !== 1 || scaleY !== 1) {
      m.scale(scaleX, scaleY);
    }
    if (offsetX !== 0 || offsetY !== 0) {
      m.translate(-1 * offsetX, -1 * offsetY);
    }
    m.dirty = false;
    return m;
  }
  clone(obj) {
    var attrs = Util_1$c.Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
    for (key in obj) {
      attrs[key] = obj[key];
    }
    var node = new this.constructor(attrs);
    for (key in this.eventListeners) {
      allListeners = this.eventListeners[key];
      len = allListeners.length;
      for (n = 0; n < len; n++) {
        listener = allListeners[n];
        if (listener.name.indexOf(KONVA) < 0) {
          if (!node.eventListeners[key]) {
            node.eventListeners[key] = [];
          }
          node.eventListeners[key].push(listener);
        }
      }
    }
    return node;
  }
  _toKonvaCanvas(config) {
    config = config || {};
    var box = this.getClientRect();
    var stage = this.getStage(), x = config.x !== void 0 ? config.x : Math.floor(box.x), y = config.y !== void 0 ? config.y : Math.floor(box.y), pixelRatio = config.pixelRatio || 1, canvas = new Canvas_1$1.SceneCanvas({
      width: config.width || Math.ceil(box.width) || (stage ? stage.width() : 0),
      height: config.height || Math.ceil(box.height) || (stage ? stage.height() : 0),
      pixelRatio
    }), context = canvas.getContext();
    const bufferCanvas = new Canvas_1$1.SceneCanvas({
      width: canvas.width / canvas.pixelRatio + Math.abs(x),
      height: canvas.height / canvas.pixelRatio + Math.abs(y),
      pixelRatio: canvas.pixelRatio
    });
    if (config.imageSmoothingEnabled === false) {
      context._context.imageSmoothingEnabled = false;
    }
    context.save();
    if (x || y) {
      context.translate(-1 * x, -1 * y);
    }
    this.drawScene(canvas, void 0, bufferCanvas);
    context.restore();
    return canvas;
  }
  toCanvas(config) {
    return this._toKonvaCanvas(config)._canvas;
  }
  toDataURL(config) {
    config = config || {};
    var mimeType = config.mimeType || null, quality = config.quality || null;
    var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
    if (config.callback) {
      config.callback(url);
    }
    return url;
  }
  toImage(config) {
    return new Promise((resolve, reject2) => {
      try {
        const callback = config === null || config === void 0 ? void 0 : config.callback;
        if (callback)
          delete config.callback;
        Util_1$c.Util._urlToImage(this.toDataURL(config), function(img) {
          resolve(img);
          callback === null || callback === void 0 ? void 0 : callback(img);
        });
      } catch (err) {
        reject2(err);
      }
    });
  }
  toBlob(config) {
    return new Promise((resolve, reject2) => {
      try {
        const callback = config === null || config === void 0 ? void 0 : config.callback;
        if (callback)
          delete config.callback;
        this.toCanvas(config).toBlob((blob) => {
          resolve(blob);
          callback === null || callback === void 0 ? void 0 : callback(blob);
        }, config === null || config === void 0 ? void 0 : config.mimeType, config === null || config === void 0 ? void 0 : config.quality);
      } catch (err) {
        reject2(err);
      }
    });
  }
  setSize(size2) {
    this.width(size2.width);
    this.height(size2.height);
    return this;
  }
  getSize() {
    return {
      width: this.width(),
      height: this.height()
    };
  }
  getClassName() {
    return this.className || this.nodeType;
  }
  getType() {
    return this.nodeType;
  }
  getDragDistance() {
    if (this.attrs.dragDistance !== void 0) {
      return this.attrs.dragDistance;
    } else if (this.parent) {
      return this.parent.getDragDistance();
    } else {
      return Global_1$m.Konva.dragDistance;
    }
  }
  _off(type, name, callback) {
    var evtListeners = this.eventListeners[type], i, evtName, handler;
    for (i = 0; i < evtListeners.length; i++) {
      evtName = evtListeners[i].name;
      handler = evtListeners[i].handler;
      if ((evtName !== "konva" || name === "konva") && (!name || evtName === name) && (!callback || callback === handler)) {
        evtListeners.splice(i, 1);
        if (evtListeners.length === 0) {
          delete this.eventListeners[type];
          break;
        }
        i--;
      }
    }
  }
  _fireChangeEvent(attr, oldVal, newVal) {
    this._fire(attr + CHANGE, {
      oldVal,
      newVal
    });
  }
  addName(name) {
    if (!this.hasName(name)) {
      var oldName = this.name();
      var newName = oldName ? oldName + " " + name : name;
      this.name(newName);
    }
    return this;
  }
  hasName(name) {
    if (!name) {
      return false;
    }
    const fullName = this.name();
    if (!fullName) {
      return false;
    }
    var names = (fullName || "").split(/\s/g);
    return names.indexOf(name) !== -1;
  }
  removeName(name) {
    var names = (this.name() || "").split(/\s/g);
    var index = names.indexOf(name);
    if (index !== -1) {
      names.splice(index, 1);
      this.name(names.join(" "));
    }
    return this;
  }
  setAttr(attr, val) {
    var func2 = this[SET + Util_1$c.Util._capitalize(attr)];
    if (Util_1$c.Util._isFunction(func2)) {
      func2.call(this, val);
    } else {
      this._setAttr(attr, val);
    }
    return this;
  }
  _requestDraw() {
    if (Global_1$m.Konva.autoDrawEnabled) {
      const drawNode = this.getLayer() || this.getStage();
      drawNode === null || drawNode === void 0 ? void 0 : drawNode.batchDraw();
    }
  }
  _setAttr(key, val) {
    var oldVal = this.attrs[key];
    if (oldVal === val && !Util_1$c.Util.isObject(val)) {
      return;
    }
    if (val === void 0 || val === null) {
      delete this.attrs[key];
    } else {
      this.attrs[key] = val;
    }
    if (this._shouldFireChangeEvents) {
      this._fireChangeEvent(key, oldVal, val);
    }
    this._requestDraw();
  }
  _setComponentAttr(key, component, val) {
    var oldVal;
    if (val !== void 0) {
      oldVal = this.attrs[key];
      if (!oldVal) {
        this.attrs[key] = this.getAttr(key);
      }
      this.attrs[key][component] = val;
      this._fireChangeEvent(key, oldVal, val);
    }
  }
  _fireAndBubble(eventType, evt, compareShape) {
    if (evt && this.nodeType === SHAPE) {
      evt.target = this;
    }
    var shouldStop = (eventType === MOUSEENTER || eventType === MOUSELEAVE) && (compareShape && (this === compareShape || this.isAncestorOf && this.isAncestorOf(compareShape)) || this.nodeType === "Stage" && !compareShape);
    if (!shouldStop) {
      this._fire(eventType, evt);
      var stopBubble = (eventType === MOUSEENTER || eventType === MOUSELEAVE) && compareShape && compareShape.isAncestorOf && compareShape.isAncestorOf(this) && !compareShape.isAncestorOf(this.parent);
      if ((evt && !evt.cancelBubble || !evt) && this.parent && this.parent.isListening() && !stopBubble) {
        if (compareShape && compareShape.parent) {
          this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
        } else {
          this._fireAndBubble.call(this.parent, eventType, evt);
        }
      }
    }
  }
  _getProtoListeners(eventType) {
    var _a, _b, _c;
    const allListeners = (_a = this._cache.get(ALL_LISTENERS)) !== null && _a !== void 0 ? _a : {};
    let events = allListeners === null || allListeners === void 0 ? void 0 : allListeners[eventType];
    if (events === void 0) {
      events = [];
      let obj = Object.getPrototypeOf(this);
      while (obj) {
        const hierarchyEvents = (_c = (_b = obj.eventListeners) === null || _b === void 0 ? void 0 : _b[eventType]) !== null && _c !== void 0 ? _c : [];
        events.push(...hierarchyEvents);
        obj = Object.getPrototypeOf(obj);
      }
      allListeners[eventType] = events;
      this._cache.set(ALL_LISTENERS, allListeners);
    }
    return events;
  }
  _fire(eventType, evt) {
    evt = evt || {};
    evt.currentTarget = this;
    evt.type = eventType;
    const topListeners = this._getProtoListeners(eventType);
    if (topListeners) {
      for (var i = 0; i < topListeners.length; i++) {
        topListeners[i].handler.call(this, evt);
      }
    }
    const selfListeners = this.eventListeners[eventType];
    if (selfListeners) {
      for (var i = 0; i < selfListeners.length; i++) {
        selfListeners[i].handler.call(this, evt);
      }
    }
  }
  draw() {
    this.drawScene();
    this.drawHit();
    return this;
  }
  _createDragElement(evt) {
    var pointerId = evt ? evt.pointerId : void 0;
    var stage = this.getStage();
    var ap = this.getAbsolutePosition();
    if (!stage) {
      return;
    }
    var pos = stage._getPointerById(pointerId) || stage._changedPointerPositions[0] || ap;
    DragAndDrop_1.DD._dragElements.set(this._id, {
      node: this,
      startPointerPos: pos,
      offset: {
        x: pos.x - ap.x,
        y: pos.y - ap.y
      },
      dragStatus: "ready",
      pointerId
    });
  }
  startDrag(evt, bubbleEvent = true) {
    if (!DragAndDrop_1.DD._dragElements.has(this._id)) {
      this._createDragElement(evt);
    }
    const elem = DragAndDrop_1.DD._dragElements.get(this._id);
    elem.dragStatus = "dragging";
    this.fire("dragstart", {
      type: "dragstart",
      target: this,
      evt: evt && evt.evt
    }, bubbleEvent);
  }
  _setDragPosition(evt, elem) {
    const pos = this.getStage()._getPointerById(elem.pointerId);
    if (!pos) {
      return;
    }
    var newNodePos = {
      x: pos.x - elem.offset.x,
      y: pos.y - elem.offset.y
    };
    var dbf = this.dragBoundFunc();
    if (dbf !== void 0) {
      const bounded = dbf.call(this, newNodePos, evt);
      if (!bounded) {
        Util_1$c.Util.warn("dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.");
      } else {
        newNodePos = bounded;
      }
    }
    if (!this._lastPos || this._lastPos.x !== newNodePos.x || this._lastPos.y !== newNodePos.y) {
      this.setAbsolutePosition(newNodePos);
      this._requestDraw();
    }
    this._lastPos = newNodePos;
  }
  stopDrag(evt) {
    const elem = DragAndDrop_1.DD._dragElements.get(this._id);
    if (elem) {
      elem.dragStatus = "stopped";
    }
    DragAndDrop_1.DD._endDragBefore(evt);
    DragAndDrop_1.DD._endDragAfter(evt);
  }
  setDraggable(draggable) {
    this._setAttr("draggable", draggable);
    this._dragChange();
  }
  isDragging() {
    const elem = DragAndDrop_1.DD._dragElements.get(this._id);
    return elem ? elem.dragStatus === "dragging" : false;
  }
  _listenDrag() {
    this._dragCleanup();
    this.on("mousedown.konva touchstart.konva", function(evt) {
      var shouldCheckButton = evt.evt["button"] !== void 0;
      var canDrag = !shouldCheckButton || Global_1$m.Konva.dragButtons.indexOf(evt.evt["button"]) >= 0;
      if (!canDrag) {
        return;
      }
      if (this.isDragging()) {
        return;
      }
      var hasDraggingChild = false;
      DragAndDrop_1.DD._dragElements.forEach((elem) => {
        if (this.isAncestorOf(elem.node)) {
          hasDraggingChild = true;
        }
      });
      if (!hasDraggingChild) {
        this._createDragElement(evt);
      }
    });
  }
  _dragChange() {
    if (this.attrs.draggable) {
      this._listenDrag();
    } else {
      this._dragCleanup();
      var stage = this.getStage();
      if (!stage) {
        return;
      }
      const dragElement = DragAndDrop_1.DD._dragElements.get(this._id);
      const isDragging = dragElement && dragElement.dragStatus === "dragging";
      const isReady = dragElement && dragElement.dragStatus === "ready";
      if (isDragging) {
        this.stopDrag();
      } else if (isReady) {
        DragAndDrop_1.DD._dragElements.delete(this._id);
      }
    }
  }
  _dragCleanup() {
    this.off("mousedown.konva");
    this.off("touchstart.konva");
  }
  isClientRectOnScreen(margin = { x: 0, y: 0 }) {
    const stage = this.getStage();
    if (!stage) {
      return false;
    }
    const screenRect = {
      x: -margin.x,
      y: -margin.y,
      width: stage.width() + 2 * margin.x,
      height: stage.height() + 2 * margin.y
    };
    return Util_1$c.Util.haveIntersection(screenRect, this.getClientRect());
  }
  static create(data, container) {
    if (Util_1$c.Util._isString(data)) {
      data = JSON.parse(data);
    }
    return this._createNode(data, container);
  }
  static _createNode(obj, container) {
    var className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
    if (container) {
      obj.attrs.container = container;
    }
    if (!Global_1$m.Konva[className]) {
      Util_1$c.Util.warn('Can not find a node with class name "' + className + '". Fallback to "Shape".');
      className = "Shape";
    }
    const Class = Global_1$m.Konva[className];
    no = new Class(obj.attrs);
    if (children) {
      len = children.length;
      for (n = 0; n < len; n++) {
        no.add(Node._createNode(children[n]));
      }
    }
    return no;
  }
}
Node$1.Node = Node;
Node.prototype.nodeType = "Node";
Node.prototype._attrsAffectingSize = [];
Node.prototype.eventListeners = {};
Node.prototype.on.call(Node.prototype, TRANSFORM_CHANGE_STR$1, function() {
  if (this._batchingTransformChange) {
    this._needClearTransformCache = true;
    return;
  }
  this._clearCache(TRANSFORM);
  this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
});
Node.prototype.on.call(Node.prototype, "visibleChange.konva", function() {
  this._clearSelfAndDescendantCache(VISIBLE);
});
Node.prototype.on.call(Node.prototype, "listeningChange.konva", function() {
  this._clearSelfAndDescendantCache(LISTENING);
});
Node.prototype.on.call(Node.prototype, "opacityChange.konva", function() {
  this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
});
const addGetterSetter = Factory_1$y.Factory.addGetterSetter;
addGetterSetter(Node, "zIndex");
addGetterSetter(Node, "absolutePosition");
addGetterSetter(Node, "position");
addGetterSetter(Node, "x", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "y", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "globalCompositeOperation", "source-over", (0, Validators_1$x.getStringValidator)());
addGetterSetter(Node, "opacity", 1, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "name", "", (0, Validators_1$x.getStringValidator)());
addGetterSetter(Node, "id", "", (0, Validators_1$x.getStringValidator)());
addGetterSetter(Node, "rotation", 0, (0, Validators_1$x.getNumberValidator)());
Factory_1$y.Factory.addComponentsGetterSetter(Node, "scale", ["x", "y"]);
addGetterSetter(Node, "scaleX", 1, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "scaleY", 1, (0, Validators_1$x.getNumberValidator)());
Factory_1$y.Factory.addComponentsGetterSetter(Node, "skew", ["x", "y"]);
addGetterSetter(Node, "skewX", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "skewY", 0, (0, Validators_1$x.getNumberValidator)());
Factory_1$y.Factory.addComponentsGetterSetter(Node, "offset", ["x", "y"]);
addGetterSetter(Node, "offsetX", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "offsetY", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "dragDistance", null, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "width", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "height", 0, (0, Validators_1$x.getNumberValidator)());
addGetterSetter(Node, "listening", true, (0, Validators_1$x.getBooleanValidator)());
addGetterSetter(Node, "preventDefault", true, (0, Validators_1$x.getBooleanValidator)());
addGetterSetter(Node, "filters", null, function(val) {
  this._filterUpToDate = false;
  return val;
});
addGetterSetter(Node, "visible", true, (0, Validators_1$x.getBooleanValidator)());
addGetterSetter(Node, "transformsEnabled", "all", (0, Validators_1$x.getStringValidator)());
addGetterSetter(Node, "size");
addGetterSetter(Node, "dragBoundFunc");
addGetterSetter(Node, "draggable", false, (0, Validators_1$x.getBooleanValidator)());
Factory_1$y.Factory.backCompat(Node, {
  rotateDeg: "rotate",
  setRotationDeg: "setRotation",
  getRotationDeg: "getRotation"
});
var Container$1 = {};
Object.defineProperty(Container$1, "__esModule", { value: true });
Container$1.Container = void 0;
const Factory_1$x = Factory;
const Node_1$h = Node$1;
const Validators_1$w = Validators;
class Container extends Node_1$h.Node {
  constructor() {
    super(...arguments);
    this.children = [];
  }
  getChildren(filterFunc) {
    if (!filterFunc) {
      return this.children || [];
    }
    const children = this.children || [];
    var results = [];
    children.forEach(function(child) {
      if (filterFunc(child)) {
        results.push(child);
      }
    });
    return results;
  }
  hasChildren() {
    return this.getChildren().length > 0;
  }
  removeChildren() {
    this.getChildren().forEach((child) => {
      child.parent = null;
      child.index = 0;
      child.remove();
    });
    this.children = [];
    this._requestDraw();
    return this;
  }
  destroyChildren() {
    this.getChildren().forEach((child) => {
      child.parent = null;
      child.index = 0;
      child.destroy();
    });
    this.children = [];
    this._requestDraw();
    return this;
  }
  add(...children) {
    if (children.length === 0) {
      return this;
    }
    if (children.length > 1) {
      for (var i = 0; i < children.length; i++) {
        this.add(children[i]);
      }
      return this;
    }
    const child = children[0];
    if (child.getParent()) {
      child.moveTo(this);
      return this;
    }
    this._validateAdd(child);
    child.index = this.getChildren().length;
    child.parent = this;
    child._clearCaches();
    this.getChildren().push(child);
    this._fire("add", {
      child
    });
    this._requestDraw();
    return this;
  }
  destroy() {
    if (this.hasChildren()) {
      this.destroyChildren();
    }
    super.destroy();
    return this;
  }
  find(selector) {
    return this._generalFind(selector, false);
  }
  findOne(selector) {
    var result2 = this._generalFind(selector, true);
    return result2.length > 0 ? result2[0] : void 0;
  }
  _generalFind(selector, findOne) {
    var retArr = [];
    this._descendants((node) => {
      const valid = node._isMatch(selector);
      if (valid) {
        retArr.push(node);
      }
      if (valid && findOne) {
        return true;
      }
      return false;
    });
    return retArr;
  }
  _descendants(fn) {
    let shouldStop = false;
    const children = this.getChildren();
    for (const child of children) {
      shouldStop = fn(child);
      if (shouldStop) {
        return true;
      }
      if (!child.hasChildren()) {
        continue;
      }
      shouldStop = child._descendants(fn);
      if (shouldStop) {
        return true;
      }
    }
    return false;
  }
  toObject() {
    var obj = Node_1$h.Node.prototype.toObject.call(this);
    obj.children = [];
    this.getChildren().forEach((child) => {
      obj.children.push(child.toObject());
    });
    return obj;
  }
  isAncestorOf(node) {
    var parent2 = node.getParent();
    while (parent2) {
      if (parent2._id === this._id) {
        return true;
      }
      parent2 = parent2.getParent();
    }
    return false;
  }
  clone(obj) {
    var node = Node_1$h.Node.prototype.clone.call(this, obj);
    this.getChildren().forEach(function(no) {
      node.add(no.clone());
    });
    return node;
  }
  getAllIntersections(pos) {
    var arr = [];
    this.find("Shape").forEach((shape) => {
      if (shape.isVisible() && shape.intersects(pos)) {
        arr.push(shape);
      }
    });
    return arr;
  }
  _clearSelfAndDescendantCache(attr) {
    var _a;
    super._clearSelfAndDescendantCache(attr);
    if (this.isCached()) {
      return;
    }
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(node) {
      node._clearSelfAndDescendantCache(attr);
    });
  }
  _setChildrenIndices() {
    var _a;
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child, n) {
      child.index = n;
    });
    this._requestDraw();
  }
  drawScene(can, top, bufferCanvas) {
    var layer = this.getLayer(), canvas = can || layer && layer.getCanvas(), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
    var caching = canvas && canvas.isCache;
    if (!this.isVisible() && !caching) {
      return this;
    }
    if (cachedSceneCanvas) {
      context.save();
      var m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedSceneCanvas(context);
      context.restore();
    } else {
      this._drawChildren("drawScene", canvas, top, bufferCanvas);
    }
    return this;
  }
  drawHit(can, top) {
    if (!this.shouldDrawHit(top)) {
      return this;
    }
    var layer = this.getLayer(), canvas = can || layer && layer.hitCanvas, context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
    if (cachedHitCanvas) {
      context.save();
      var m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedHitCanvas(context);
      context.restore();
    } else {
      this._drawChildren("drawHit", canvas, top);
    }
    return this;
  }
  _drawChildren(drawMethod, canvas, top, bufferCanvas) {
    var _a;
    var context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = typeof clipWidth === "number" && typeof clipHeight === "number" || clipFunc;
    const selfCache = top === this;
    if (hasClip) {
      context.save();
      var transform2 = this.getAbsoluteTransform(top);
      var m = transform2.getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      context.beginPath();
      let clipArgs;
      if (clipFunc) {
        clipArgs = clipFunc.call(this, context, this);
      } else {
        var clipX = this.clipX();
        var clipY = this.clipY();
        context.rect(clipX || 0, clipY || 0, clipWidth, clipHeight);
      }
      context.clip.apply(context, clipArgs);
      m = transform2.copy().invert().getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }
    var hasComposition = !selfCache && this.globalCompositeOperation() !== "source-over" && drawMethod === "drawScene";
    if (hasComposition) {
      context.save();
      context._applyGlobalCompositeOperation(this);
    }
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child) {
      child[drawMethod](canvas, top, bufferCanvas);
    });
    if (hasComposition) {
      context.restore();
    }
    if (hasClip) {
      context.restore();
    }
  }
  getClientRect(config = {}) {
    var _a;
    var skipTransform = config.skipTransform;
    var relativeTo = config.relativeTo;
    var minX, minY, maxX, maxY;
    var selfRect = {
      x: Infinity,
      y: Infinity,
      width: 0,
      height: 0
    };
    var that = this;
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child) {
      if (!child.visible()) {
        return;
      }
      var rect = child.getClientRect({
        relativeTo: that,
        skipShadow: config.skipShadow,
        skipStroke: config.skipStroke
      });
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      if (minX === void 0) {
        minX = rect.x;
        minY = rect.y;
        maxX = rect.x + rect.width;
        maxY = rect.y + rect.height;
      } else {
        minX = Math.min(minX, rect.x);
        minY = Math.min(minY, rect.y);
        maxX = Math.max(maxX, rect.x + rect.width);
        maxY = Math.max(maxY, rect.y + rect.height);
      }
    });
    var shapes = this.find("Shape");
    var hasVisible = false;
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      if (shape._isVisible(this)) {
        hasVisible = true;
        break;
      }
    }
    if (hasVisible && minX !== void 0) {
      selfRect = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    } else {
      selfRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }
    if (!skipTransform) {
      return this._transformedRect(selfRect, relativeTo);
    }
    return selfRect;
  }
}
Container$1.Container = Container;
Factory_1$x.Factory.addComponentsGetterSetter(Container, "clip", [
  "x",
  "y",
  "width",
  "height"
]);
Factory_1$x.Factory.addGetterSetter(Container, "clipX", void 0, (0, Validators_1$w.getNumberValidator)());
Factory_1$x.Factory.addGetterSetter(Container, "clipY", void 0, (0, Validators_1$w.getNumberValidator)());
Factory_1$x.Factory.addGetterSetter(Container, "clipWidth", void 0, (0, Validators_1$w.getNumberValidator)());
Factory_1$x.Factory.addGetterSetter(Container, "clipHeight", void 0, (0, Validators_1$w.getNumberValidator)());
Factory_1$x.Factory.addGetterSetter(Container, "clipFunc");
var Stage = {};
var PointerEvents = {};
Object.defineProperty(PointerEvents, "__esModule", { value: true });
PointerEvents.releaseCapture = PointerEvents.setPointerCapture = PointerEvents.hasPointerCapture = PointerEvents.createEvent = PointerEvents.getCapturedShape = void 0;
const Global_1$l = Global;
const Captures = /* @__PURE__ */ new Map();
const SUPPORT_POINTER_EVENTS = Global_1$l.Konva._global["PointerEvent"] !== void 0;
function getCapturedShape(pointerId) {
  return Captures.get(pointerId);
}
PointerEvents.getCapturedShape = getCapturedShape;
function createEvent(evt) {
  return {
    evt,
    pointerId: evt.pointerId
  };
}
PointerEvents.createEvent = createEvent;
function hasPointerCapture(pointerId, shape) {
  return Captures.get(pointerId) === shape;
}
PointerEvents.hasPointerCapture = hasPointerCapture;
function setPointerCapture(pointerId, shape) {
  releaseCapture(pointerId);
  const stage = shape.getStage();
  if (!stage)
    return;
  Captures.set(pointerId, shape);
  if (SUPPORT_POINTER_EVENTS) {
    shape._fire("gotpointercapture", createEvent(new PointerEvent("gotpointercapture")));
  }
}
PointerEvents.setPointerCapture = setPointerCapture;
function releaseCapture(pointerId, target) {
  const shape = Captures.get(pointerId);
  if (!shape)
    return;
  const stage = shape.getStage();
  if (stage && stage.content)
    ;
  Captures.delete(pointerId);
  if (SUPPORT_POINTER_EVENTS) {
    shape._fire("lostpointercapture", createEvent(new PointerEvent("lostpointercapture")));
  }
}
PointerEvents.releaseCapture = releaseCapture;
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Stage = exports2.stages = void 0;
  const Util_12 = Util;
  const Factory_12 = Factory;
  const Container_12 = Container$1;
  const Global_12 = Global;
  const Canvas_12 = Canvas$1;
  const DragAndDrop_12 = DragAndDrop;
  const Global_22 = Global;
  const PointerEvents$1 = PointerEvents;
  var STAGE2 = "Stage", STRING = "string", PX = "px", MOUSEOUT = "mouseout", MOUSELEAVE2 = "mouseleave", MOUSEOVER = "mouseover", MOUSEENTER2 = "mouseenter", MOUSEMOVE = "mousemove", MOUSEDOWN = "mousedown", MOUSEUP = "mouseup", POINTERMOVE = "pointermove", POINTERDOWN = "pointerdown", POINTERUP = "pointerup", POINTERCANCEL = "pointercancel", LOSTPOINTERCAPTURE = "lostpointercapture", POINTEROUT = "pointerout", POINTERLEAVE = "pointerleave", POINTEROVER = "pointerover", POINTERENTER = "pointerenter", CONTEXTMENU = "contextmenu", TOUCHSTART = "touchstart", TOUCHEND = "touchend", TOUCHMOVE = "touchmove", TOUCHCANCEL = "touchcancel", WHEEL = "wheel", MAX_LAYERS_NUMBER = 5, EVENTS = [
    [MOUSEENTER2, "_pointerenter"],
    [MOUSEDOWN, "_pointerdown"],
    [MOUSEMOVE, "_pointermove"],
    [MOUSEUP, "_pointerup"],
    [MOUSELEAVE2, "_pointerleave"],
    [TOUCHSTART, "_pointerdown"],
    [TOUCHMOVE, "_pointermove"],
    [TOUCHEND, "_pointerup"],
    [TOUCHCANCEL, "_pointercancel"],
    [MOUSEOVER, "_pointerover"],
    [WHEEL, "_wheel"],
    [CONTEXTMENU, "_contextmenu"],
    [POINTERDOWN, "_pointerdown"],
    [POINTERMOVE, "_pointermove"],
    [POINTERUP, "_pointerup"],
    [POINTERCANCEL, "_pointercancel"],
    [LOSTPOINTERCAPTURE, "_lostpointercapture"]
  ];
  const EVENTS_MAP = {
    mouse: {
      [POINTEROUT]: MOUSEOUT,
      [POINTERLEAVE]: MOUSELEAVE2,
      [POINTEROVER]: MOUSEOVER,
      [POINTERENTER]: MOUSEENTER2,
      [POINTERMOVE]: MOUSEMOVE,
      [POINTERDOWN]: MOUSEDOWN,
      [POINTERUP]: MOUSEUP,
      [POINTERCANCEL]: "mousecancel",
      pointerclick: "click",
      pointerdblclick: "dblclick"
    },
    touch: {
      [POINTEROUT]: "touchout",
      [POINTERLEAVE]: "touchleave",
      [POINTEROVER]: "touchover",
      [POINTERENTER]: "touchenter",
      [POINTERMOVE]: TOUCHMOVE,
      [POINTERDOWN]: TOUCHSTART,
      [POINTERUP]: TOUCHEND,
      [POINTERCANCEL]: TOUCHCANCEL,
      pointerclick: "tap",
      pointerdblclick: "dbltap"
    },
    pointer: {
      [POINTEROUT]: POINTEROUT,
      [POINTERLEAVE]: POINTERLEAVE,
      [POINTEROVER]: POINTEROVER,
      [POINTERENTER]: POINTERENTER,
      [POINTERMOVE]: POINTERMOVE,
      [POINTERDOWN]: POINTERDOWN,
      [POINTERUP]: POINTERUP,
      [POINTERCANCEL]: POINTERCANCEL,
      pointerclick: "pointerclick",
      pointerdblclick: "pointerdblclick"
    }
  };
  const getEventType = (type) => {
    if (type.indexOf("pointer") >= 0) {
      return "pointer";
    }
    if (type.indexOf("touch") >= 0) {
      return "touch";
    }
    return "mouse";
  };
  const getEventsMap = (eventType) => {
    const type = getEventType(eventType);
    if (type === "pointer") {
      return Global_12.Konva.pointerEventsEnabled && EVENTS_MAP.pointer;
    }
    if (type === "touch") {
      return EVENTS_MAP.touch;
    }
    if (type === "mouse") {
      return EVENTS_MAP.mouse;
    }
  };
  function checkNoClip(attrs = {}) {
    if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
      Util_12.Util.warn("Stage does not support clipping. Please use clip for Layers or Groups.");
    }
    return attrs;
  }
  const NO_POINTERS_MESSAGE = `Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);`;
  exports2.stages = [];
  class Stage2 extends Container_12.Container {
    constructor(config) {
      super(checkNoClip(config));
      this._pointerPositions = [];
      this._changedPointerPositions = [];
      this._buildDOM();
      this._bindContentEvents();
      exports2.stages.push(this);
      this.on("widthChange.konva heightChange.konva", this._resizeDOM);
      this.on("visibleChange.konva", this._checkVisibility);
      this.on("clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva", () => {
        checkNoClip(this.attrs);
      });
      this._checkVisibility();
    }
    _validateAdd(child) {
      const isLayer = child.getType() === "Layer";
      const isFastLayer = child.getType() === "FastLayer";
      const valid = isLayer || isFastLayer;
      if (!valid) {
        Util_12.Util.throw("You may only add layers to the stage.");
      }
    }
    _checkVisibility() {
      if (!this.content) {
        return;
      }
      const style = this.visible() ? "" : "none";
      this.content.style.display = style;
    }
    setContainer(container) {
      if (typeof container === STRING) {
        if (container.charAt(0) === ".") {
          var className = container.slice(1);
          container = document.getElementsByClassName(className)[0];
        } else {
          var id;
          if (container.charAt(0) !== "#") {
            id = container;
          } else {
            id = container.slice(1);
          }
          container = document.getElementById(id);
        }
        if (!container) {
          throw "Can not find container in document with id " + id;
        }
      }
      this._setAttr("container", container);
      if (this.content) {
        if (this.content.parentElement) {
          this.content.parentElement.removeChild(this.content);
        }
        container.appendChild(this.content);
      }
      return this;
    }
    shouldDrawHit() {
      return true;
    }
    clear() {
      var layers = this.children, len = layers.length, n;
      for (n = 0; n < len; n++) {
        layers[n].clear();
      }
      return this;
    }
    clone(obj) {
      if (!obj) {
        obj = {};
      }
      obj.container = typeof document !== "undefined" && document.createElement("div");
      return Container_12.Container.prototype.clone.call(this, obj);
    }
    destroy() {
      super.destroy();
      var content = this.content;
      if (content && Util_12.Util._isInDocument(content)) {
        this.container().removeChild(content);
      }
      var index = exports2.stages.indexOf(this);
      if (index > -1) {
        exports2.stages.splice(index, 1);
      }
      Util_12.Util.releaseCanvas(this.bufferCanvas._canvas, this.bufferHitCanvas._canvas);
      return this;
    }
    getPointerPosition() {
      const pos = this._pointerPositions[0] || this._changedPointerPositions[0];
      if (!pos) {
        Util_12.Util.warn(NO_POINTERS_MESSAGE);
        return null;
      }
      return {
        x: pos.x,
        y: pos.y
      };
    }
    _getPointerById(id) {
      return this._pointerPositions.find((p2) => p2.id === id);
    }
    getPointersPositions() {
      return this._pointerPositions;
    }
    getStage() {
      return this;
    }
    getContent() {
      return this.content;
    }
    _toKonvaCanvas(config) {
      config = config || {};
      config.x = config.x || 0;
      config.y = config.y || 0;
      config.width = config.width || this.width();
      config.height = config.height || this.height();
      var canvas = new Canvas_12.SceneCanvas({
        width: config.width,
        height: config.height,
        pixelRatio: config.pixelRatio || 1
      });
      var _context = canvas.getContext()._context;
      var layers = this.children;
      if (config.x || config.y) {
        _context.translate(-1 * config.x, -1 * config.y);
      }
      layers.forEach(function(layer) {
        if (!layer.isVisible()) {
          return;
        }
        var layerCanvas = layer._toKonvaCanvas(config);
        _context.drawImage(layerCanvas._canvas, config.x, config.y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
      });
      return canvas;
    }
    getIntersection(pos) {
      if (!pos) {
        return null;
      }
      var layers = this.children, len = layers.length, end = len - 1, n;
      for (n = end; n >= 0; n--) {
        const shape = layers[n].getIntersection(pos);
        if (shape) {
          return shape;
        }
      }
      return null;
    }
    _resizeDOM() {
      var width = this.width();
      var height = this.height();
      if (this.content) {
        this.content.style.width = width + PX;
        this.content.style.height = height + PX;
      }
      this.bufferCanvas.setSize(width, height);
      this.bufferHitCanvas.setSize(width, height);
      this.children.forEach((layer) => {
        layer.setSize({ width, height });
        layer.draw();
      });
    }
    add(layer, ...rest2) {
      if (arguments.length > 1) {
        for (var i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      super.add(layer);
      var length = this.children.length;
      if (length > MAX_LAYERS_NUMBER) {
        Util_12.Util.warn("The stage has " + length + " layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.");
      }
      layer.setSize({ width: this.width(), height: this.height() });
      layer.draw();
      if (Global_12.Konva.isBrowser) {
        this.content.appendChild(layer.canvas._canvas);
      }
      return this;
    }
    getParent() {
      return null;
    }
    getLayer() {
      return null;
    }
    hasPointerCapture(pointerId) {
      return PointerEvents$1.hasPointerCapture(pointerId, this);
    }
    setPointerCapture(pointerId) {
      PointerEvents$1.setPointerCapture(pointerId, this);
    }
    releaseCapture(pointerId) {
      PointerEvents$1.releaseCapture(pointerId, this);
    }
    getLayers() {
      return this.children;
    }
    _bindContentEvents() {
      if (!Global_12.Konva.isBrowser) {
        return;
      }
      EVENTS.forEach(([event, methodName]) => {
        this.content.addEventListener(event, (evt) => {
          this[methodName](evt);
        }, { passive: false });
      });
    }
    _pointerenter(evt) {
      this.setPointersPositions(evt);
      const events = getEventsMap(evt.type);
      if (events) {
        this._fire(events.pointerenter, {
          evt,
          target: this,
          currentTarget: this
        });
      }
    }
    _pointerover(evt) {
      this.setPointersPositions(evt);
      const events = getEventsMap(evt.type);
      if (events) {
        this._fire(events.pointerover, {
          evt,
          target: this,
          currentTarget: this
        });
      }
    }
    _getTargetShape(evenType) {
      let shape = this[evenType + "targetShape"];
      if (shape && !shape.getStage()) {
        shape = null;
      }
      return shape;
    }
    _pointerleave(evt) {
      const events = getEventsMap(evt.type);
      const eventType = getEventType(evt.type);
      if (!events) {
        return;
      }
      this.setPointersPositions(evt);
      var targetShape = this._getTargetShape(eventType);
      var eventsEnabled = !(Global_12.Konva.isDragging() || Global_12.Konva.isTransforming()) || Global_12.Konva.hitOnDragEnabled;
      if (targetShape && eventsEnabled) {
        targetShape._fireAndBubble(events.pointerout, { evt });
        targetShape._fireAndBubble(events.pointerleave, { evt });
        this._fire(events.pointerleave, {
          evt,
          target: this,
          currentTarget: this
        });
        this[eventType + "targetShape"] = null;
      } else if (eventsEnabled) {
        this._fire(events.pointerleave, {
          evt,
          target: this,
          currentTarget: this
        });
        this._fire(events.pointerout, {
          evt,
          target: this,
          currentTarget: this
        });
      }
      this.pointerPos = null;
      this._pointerPositions = [];
    }
    _pointerdown(evt) {
      const events = getEventsMap(evt.type);
      const eventType = getEventType(evt.type);
      if (!events) {
        return;
      }
      this.setPointersPositions(evt);
      var triggeredOnShape = false;
      this._changedPointerPositions.forEach((pos) => {
        var shape = this.getIntersection(pos);
        DragAndDrop_12.DD.justDragged = false;
        Global_12.Konva["_" + eventType + "ListenClick"] = true;
        if (!shape || !shape.isListening()) {
          return;
        }
        if (Global_12.Konva.capturePointerEventsEnabled) {
          shape.setPointerCapture(pos.id);
        }
        this[eventType + "ClickStartShape"] = shape;
        shape._fireAndBubble(events.pointerdown, {
          evt,
          pointerId: pos.id
        });
        triggeredOnShape = true;
        const isTouch = evt.type.indexOf("touch") >= 0;
        if (shape.preventDefault() && evt.cancelable && isTouch) {
          evt.preventDefault();
        }
      });
      if (!triggeredOnShape) {
        this._fire(events.pointerdown, {
          evt,
          target: this,
          currentTarget: this,
          pointerId: this._pointerPositions[0].id
        });
      }
    }
    _pointermove(evt) {
      const events = getEventsMap(evt.type);
      const eventType = getEventType(evt.type);
      if (!events) {
        return;
      }
      if (Global_12.Konva.isDragging() && DragAndDrop_12.DD.node.preventDefault() && evt.cancelable) {
        evt.preventDefault();
      }
      this.setPointersPositions(evt);
      var eventsEnabled = !(Global_12.Konva.isDragging() || Global_12.Konva.isTransforming()) || Global_12.Konva.hitOnDragEnabled;
      if (!eventsEnabled) {
        return;
      }
      var processedShapesIds = {};
      let triggeredOnShape = false;
      var targetShape = this._getTargetShape(eventType);
      this._changedPointerPositions.forEach((pos) => {
        const shape = PointerEvents$1.getCapturedShape(pos.id) || this.getIntersection(pos);
        const pointerId = pos.id;
        const event = { evt, pointerId };
        var differentTarget = targetShape !== shape;
        if (differentTarget && targetShape) {
          targetShape._fireAndBubble(events.pointerout, { ...event }, shape);
          targetShape._fireAndBubble(events.pointerleave, { ...event }, shape);
        }
        if (shape) {
          if (processedShapesIds[shape._id]) {
            return;
          }
          processedShapesIds[shape._id] = true;
        }
        if (shape && shape.isListening()) {
          triggeredOnShape = true;
          if (differentTarget) {
            shape._fireAndBubble(events.pointerover, { ...event }, targetShape);
            shape._fireAndBubble(events.pointerenter, { ...event }, targetShape);
            this[eventType + "targetShape"] = shape;
          }
          shape._fireAndBubble(events.pointermove, { ...event });
        } else {
          if (targetShape) {
            this._fire(events.pointerover, {
              evt,
              target: this,
              currentTarget: this,
              pointerId
            });
            this[eventType + "targetShape"] = null;
          }
        }
      });
      if (!triggeredOnShape) {
        this._fire(events.pointermove, {
          evt,
          target: this,
          currentTarget: this,
          pointerId: this._changedPointerPositions[0].id
        });
      }
    }
    _pointerup(evt) {
      const events = getEventsMap(evt.type);
      const eventType = getEventType(evt.type);
      if (!events) {
        return;
      }
      this.setPointersPositions(evt);
      const clickStartShape = this[eventType + "ClickStartShape"];
      const clickEndShape = this[eventType + "ClickEndShape"];
      var processedShapesIds = {};
      let triggeredOnShape = false;
      this._changedPointerPositions.forEach((pos) => {
        const shape = PointerEvents$1.getCapturedShape(pos.id) || this.getIntersection(pos);
        if (shape) {
          shape.releaseCapture(pos.id);
          if (processedShapesIds[shape._id]) {
            return;
          }
          processedShapesIds[shape._id] = true;
        }
        const pointerId = pos.id;
        const event = { evt, pointerId };
        let fireDblClick = false;
        if (Global_12.Konva["_" + eventType + "InDblClickWindow"]) {
          fireDblClick = true;
          clearTimeout(this[eventType + "DblTimeout"]);
        } else if (!DragAndDrop_12.DD.justDragged) {
          Global_12.Konva["_" + eventType + "InDblClickWindow"] = true;
          clearTimeout(this[eventType + "DblTimeout"]);
        }
        this[eventType + "DblTimeout"] = setTimeout(function() {
          Global_12.Konva["_" + eventType + "InDblClickWindow"] = false;
        }, Global_12.Konva.dblClickWindow);
        if (shape && shape.isListening()) {
          triggeredOnShape = true;
          this[eventType + "ClickEndShape"] = shape;
          shape._fireAndBubble(events.pointerup, { ...event });
          if (Global_12.Konva["_" + eventType + "ListenClick"] && clickStartShape && clickStartShape === shape) {
            shape._fireAndBubble(events.pointerclick, { ...event });
            if (fireDblClick && clickEndShape && clickEndShape === shape) {
              shape._fireAndBubble(events.pointerdblclick, { ...event });
            }
          }
        } else {
          this[eventType + "ClickEndShape"] = null;
          if (Global_12.Konva["_" + eventType + "ListenClick"]) {
            this._fire(events.pointerclick, {
              evt,
              target: this,
              currentTarget: this,
              pointerId
            });
          }
          if (fireDblClick) {
            this._fire(events.pointerdblclick, {
              evt,
              target: this,
              currentTarget: this,
              pointerId
            });
          }
        }
      });
      if (!triggeredOnShape) {
        this._fire(events.pointerup, {
          evt,
          target: this,
          currentTarget: this,
          pointerId: this._changedPointerPositions[0].id
        });
      }
      Global_12.Konva["_" + eventType + "ListenClick"] = false;
      if (evt.cancelable && eventType !== "touch") {
        evt.preventDefault();
      }
    }
    _contextmenu(evt) {
      this.setPointersPositions(evt);
      var shape = this.getIntersection(this.getPointerPosition());
      if (shape && shape.isListening()) {
        shape._fireAndBubble(CONTEXTMENU, { evt });
      } else {
        this._fire(CONTEXTMENU, {
          evt,
          target: this,
          currentTarget: this
        });
      }
    }
    _wheel(evt) {
      this.setPointersPositions(evt);
      var shape = this.getIntersection(this.getPointerPosition());
      if (shape && shape.isListening()) {
        shape._fireAndBubble(WHEEL, { evt });
      } else {
        this._fire(WHEEL, {
          evt,
          target: this,
          currentTarget: this
        });
      }
    }
    _pointercancel(evt) {
      this.setPointersPositions(evt);
      const shape = PointerEvents$1.getCapturedShape(evt.pointerId) || this.getIntersection(this.getPointerPosition());
      if (shape) {
        shape._fireAndBubble(POINTERUP, PointerEvents$1.createEvent(evt));
      }
      PointerEvents$1.releaseCapture(evt.pointerId);
    }
    _lostpointercapture(evt) {
      PointerEvents$1.releaseCapture(evt.pointerId);
    }
    setPointersPositions(evt) {
      var contentPosition = this._getContentPosition(), x = null, y = null;
      evt = evt ? evt : window.event;
      if (evt.touches !== void 0) {
        this._pointerPositions = [];
        this._changedPointerPositions = [];
        Array.prototype.forEach.call(evt.touches, (touch) => {
          this._pointerPositions.push({
            id: touch.identifier,
            x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
            y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
          });
        });
        Array.prototype.forEach.call(evt.changedTouches || evt.touches, (touch) => {
          this._changedPointerPositions.push({
            id: touch.identifier,
            x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
            y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
          });
        });
      } else {
        x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
        y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
        this.pointerPos = {
          x,
          y
        };
        this._pointerPositions = [{ x, y, id: Util_12.Util._getFirstPointerId(evt) }];
        this._changedPointerPositions = [
          { x, y, id: Util_12.Util._getFirstPointerId(evt) }
        ];
      }
    }
    _setPointerPosition(evt) {
      Util_12.Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
      this.setPointersPositions(evt);
    }
    _getContentPosition() {
      if (!this.content || !this.content.getBoundingClientRect) {
        return {
          top: 0,
          left: 0,
          scaleX: 1,
          scaleY: 1
        };
      }
      var rect = this.content.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        scaleX: rect.width / this.content.clientWidth || 1,
        scaleY: rect.height / this.content.clientHeight || 1
      };
    }
    _buildDOM() {
      this.bufferCanvas = new Canvas_12.SceneCanvas({
        width: this.width(),
        height: this.height()
      });
      this.bufferHitCanvas = new Canvas_12.HitCanvas({
        pixelRatio: 1,
        width: this.width(),
        height: this.height()
      });
      if (!Global_12.Konva.isBrowser) {
        return;
      }
      var container = this.container();
      if (!container) {
        throw "Stage has no container. A container is required.";
      }
      container.innerHTML = "";
      this.content = document.createElement("div");
      this.content.style.position = "relative";
      this.content.style.userSelect = "none";
      this.content.className = "konvajs-content";
      this.content.setAttribute("role", "presentation");
      container.appendChild(this.content);
      this._resizeDOM();
    }
    cache() {
      Util_12.Util.warn("Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.");
      return this;
    }
    clearCache() {
      return this;
    }
    batchDraw() {
      this.getChildren().forEach(function(layer) {
        layer.batchDraw();
      });
      return this;
    }
  }
  exports2.Stage = Stage2;
  Stage2.prototype.nodeType = STAGE2;
  (0, Global_22._registerNode)(Stage2);
  Factory_12.Factory.addGetterSetter(Stage2, "container");
})(Stage);
var Layer$1 = {};
var Shape = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Shape = exports2.shapes = void 0;
  const Global_12 = Global;
  const Util_12 = Util;
  const Factory_12 = Factory;
  const Node_12 = Node$1;
  const Validators_12 = Validators;
  const Global_22 = Global;
  const PointerEvents$1 = PointerEvents;
  var HAS_SHADOW = "hasShadow";
  var SHADOW_RGBA = "shadowRGBA";
  var patternImage = "patternImage";
  var linearGradient = "linearGradient";
  var radialGradient = "radialGradient";
  let dummyContext2;
  function getDummyContext2() {
    if (dummyContext2) {
      return dummyContext2;
    }
    dummyContext2 = Util_12.Util.createCanvasElement().getContext("2d");
    return dummyContext2;
  }
  exports2.shapes = {};
  function _fillFunc2(context) {
    const fillRule = this.attrs.fillRule;
    if (fillRule) {
      context.fill(fillRule);
    } else {
      context.fill();
    }
  }
  function _strokeFunc2(context) {
    context.stroke();
  }
  function _fillFuncHit(context) {
    context.fill();
  }
  function _strokeFuncHit(context) {
    context.stroke();
  }
  function _clearHasShadowCache() {
    this._clearCache(HAS_SHADOW);
  }
  function _clearGetShadowRGBACache() {
    this._clearCache(SHADOW_RGBA);
  }
  function _clearFillPatternCache() {
    this._clearCache(patternImage);
  }
  function _clearLinearGradientCache() {
    this._clearCache(linearGradient);
  }
  function _clearRadialGradientCache() {
    this._clearCache(radialGradient);
  }
  class Shape2 extends Node_12.Node {
    constructor(config) {
      super(config);
      let key;
      while (true) {
        key = Util_12.Util.getRandomColor();
        if (key && !(key in exports2.shapes)) {
          break;
        }
      }
      this.colorKey = key;
      exports2.shapes[key] = this;
    }
    getContext() {
      Util_12.Util.warn("shape.getContext() method is deprecated. Please do not use it.");
      return this.getLayer().getContext();
    }
    getCanvas() {
      Util_12.Util.warn("shape.getCanvas() method is deprecated. Please do not use it.");
      return this.getLayer().getCanvas();
    }
    getSceneFunc() {
      return this.attrs.sceneFunc || this["_sceneFunc"];
    }
    getHitFunc() {
      return this.attrs.hitFunc || this["_hitFunc"];
    }
    hasShadow() {
      return this._getCache(HAS_SHADOW, this._hasShadow);
    }
    _hasShadow() {
      return this.shadowEnabled() && this.shadowOpacity() !== 0 && !!(this.shadowColor() || this.shadowBlur() || this.shadowOffsetX() || this.shadowOffsetY());
    }
    _getFillPattern() {
      return this._getCache(patternImage, this.__getFillPattern);
    }
    __getFillPattern() {
      if (this.fillPatternImage()) {
        var ctx = getDummyContext2();
        const pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || "repeat");
        if (pattern && pattern.setTransform) {
          const tr = new Util_12.Transform();
          tr.translate(this.fillPatternX(), this.fillPatternY());
          tr.rotate(Global_12.Konva.getAngle(this.fillPatternRotation()));
          tr.scale(this.fillPatternScaleX(), this.fillPatternScaleY());
          tr.translate(-1 * this.fillPatternOffsetX(), -1 * this.fillPatternOffsetY());
          const m = tr.getMatrix();
          const matrix = typeof DOMMatrix === "undefined" ? {
            a: m[0],
            b: m[1],
            c: m[2],
            d: m[3],
            e: m[4],
            f: m[5]
          } : new DOMMatrix(m);
          pattern.setTransform(matrix);
        }
        return pattern;
      }
    }
    _getLinearGradient() {
      return this._getCache(linearGradient, this.__getLinearGradient);
    }
    __getLinearGradient() {
      var colorStops = this.fillLinearGradientColorStops();
      if (colorStops) {
        var ctx = getDummyContext2();
        var start = this.fillLinearGradientStartPoint();
        var end = this.fillLinearGradientEndPoint();
        var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        for (var n = 0; n < colorStops.length; n += 2) {
          grd.addColorStop(colorStops[n], colorStops[n + 1]);
        }
        return grd;
      }
    }
    _getRadialGradient() {
      return this._getCache(radialGradient, this.__getRadialGradient);
    }
    __getRadialGradient() {
      var colorStops = this.fillRadialGradientColorStops();
      if (colorStops) {
        var ctx = getDummyContext2();
        var start = this.fillRadialGradientStartPoint();
        var end = this.fillRadialGradientEndPoint();
        var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
        for (var n = 0; n < colorStops.length; n += 2) {
          grd.addColorStop(colorStops[n], colorStops[n + 1]);
        }
        return grd;
      }
    }
    getShadowRGBA() {
      return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
    }
    _getShadowRGBA() {
      if (!this.hasShadow()) {
        return;
      }
      var rgba = Util_12.Util.colorToRGBA(this.shadowColor());
      if (rgba) {
        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a * (this.shadowOpacity() || 1) + ")";
      }
    }
    hasFill() {
      return this._calculate("hasFill", [
        "fillEnabled",
        "fill",
        "fillPatternImage",
        "fillLinearGradientColorStops",
        "fillRadialGradientColorStops"
      ], () => {
        return this.fillEnabled() && !!(this.fill() || this.fillPatternImage() || this.fillLinearGradientColorStops() || this.fillRadialGradientColorStops());
      });
    }
    hasStroke() {
      return this._calculate("hasStroke", [
        "strokeEnabled",
        "strokeWidth",
        "stroke",
        "strokeLinearGradientColorStops"
      ], () => {
        return this.strokeEnabled() && this.strokeWidth() && !!(this.stroke() || this.strokeLinearGradientColorStops());
      });
    }
    hasHitStroke() {
      const width = this.hitStrokeWidth();
      if (width === "auto") {
        return this.hasStroke();
      }
      return this.strokeEnabled() && !!width;
    }
    intersects(point) {
      var stage = this.getStage();
      if (!stage) {
        return false;
      }
      const bufferHitCanvas = stage.bufferHitCanvas;
      bufferHitCanvas.getContext().clear();
      this.drawHit(bufferHitCanvas, void 0, true);
      const p2 = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
      return p2[3] > 0;
    }
    destroy() {
      Node_12.Node.prototype.destroy.call(this);
      delete exports2.shapes[this.colorKey];
      delete this.colorKey;
      return this;
    }
    _useBufferCanvas(forceFill) {
      var _a;
      const perfectDrawEnabled = (_a = this.attrs.perfectDrawEnabled) !== null && _a !== void 0 ? _a : true;
      if (!perfectDrawEnabled) {
        return false;
      }
      const hasFill = forceFill || this.hasFill();
      const hasStroke = this.hasStroke();
      const isTransparent = this.getAbsoluteOpacity() !== 1;
      if (hasFill && hasStroke && isTransparent) {
        return true;
      }
      const hasShadow = this.hasShadow();
      const strokeForShadow = this.shadowForStrokeEnabled();
      if (hasFill && hasStroke && hasShadow && strokeForShadow) {
        return true;
      }
      return false;
    }
    setStrokeHitEnabled(val) {
      Util_12.Util.warn("strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.");
      if (val) {
        this.hitStrokeWidth("auto");
      } else {
        this.hitStrokeWidth(0);
      }
    }
    getStrokeHitEnabled() {
      if (this.hitStrokeWidth() === 0) {
        return false;
      } else {
        return true;
      }
    }
    getSelfRect() {
      var size2 = this.size();
      return {
        x: this._centroid ? -size2.width / 2 : 0,
        y: this._centroid ? -size2.height / 2 : 0,
        width: size2.width,
        height: size2.height
      };
    }
    getClientRect(config = {}) {
      const skipTransform = config.skipTransform;
      const relativeTo = config.relativeTo;
      const fillRect = this.getSelfRect();
      const applyStroke = !config.skipStroke && this.hasStroke();
      const strokeWidth = applyStroke && this.strokeWidth() || 0;
      const fillAndStrokeWidth = fillRect.width + strokeWidth;
      const fillAndStrokeHeight = fillRect.height + strokeWidth;
      const applyShadow = !config.skipShadow && this.hasShadow();
      const shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
      const shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
      const preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
      const preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
      const blurRadius = applyShadow && this.shadowBlur() || 0;
      const width = preWidth + blurRadius * 2;
      const height = preHeight + blurRadius * 2;
      const rect = {
        width,
        height,
        x: -(strokeWidth / 2 + blurRadius) + Math.min(shadowOffsetX, 0) + fillRect.x,
        y: -(strokeWidth / 2 + blurRadius) + Math.min(shadowOffsetY, 0) + fillRect.y
      };
      if (!skipTransform) {
        return this._transformedRect(rect, relativeTo);
      }
      return rect;
    }
    drawScene(can, top, bufferCanvas) {
      var layer = this.getLayer();
      var canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.getSceneFunc(), hasShadow = this.hasShadow(), stage, bufferContext;
      var skipBuffer = canvas.isCache;
      var cachingSelf = top === this;
      if (!this.isVisible() && !cachingSelf) {
        return this;
      }
      if (cachedCanvas) {
        context.save();
        var m = this.getAbsoluteTransform(top).getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._drawCachedSceneCanvas(context);
        context.restore();
        return this;
      }
      if (!drawFunc) {
        return this;
      }
      context.save();
      if (this._useBufferCanvas() && !skipBuffer) {
        stage = this.getStage();
        const bc = bufferCanvas || stage.bufferCanvas;
        bufferContext = bc.getContext();
        bufferContext.clear();
        bufferContext.save();
        bufferContext._applyLineJoin(this);
        var o = this.getAbsoluteTransform(top).getMatrix();
        bufferContext.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
        drawFunc.call(this, bufferContext, this);
        bufferContext.restore();
        var ratio = bc.pixelRatio;
        if (hasShadow) {
          context._applyShadow(this);
        }
        context._applyOpacity(this);
        context._applyGlobalCompositeOperation(this);
        context.drawImage(bc._canvas, 0, 0, bc.width / ratio, bc.height / ratio);
      } else {
        context._applyLineJoin(this);
        if (!cachingSelf) {
          var o = this.getAbsoluteTransform(top).getMatrix();
          context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
          context._applyOpacity(this);
          context._applyGlobalCompositeOperation(this);
        }
        if (hasShadow) {
          context._applyShadow(this);
        }
        drawFunc.call(this, context, this);
      }
      context.restore();
      return this;
    }
    drawHit(can, top, skipDragCheck = false) {
      if (!this.shouldDrawHit(top, skipDragCheck)) {
        return this;
      }
      var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
      if (!this.colorKey) {
        Util_12.Util.warn("Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()");
      }
      if (cachedHitCanvas) {
        context.save();
        var m = this.getAbsoluteTransform(top).getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._drawCachedHitCanvas(context);
        context.restore();
        return this;
      }
      if (!drawFunc) {
        return this;
      }
      context.save();
      context._applyLineJoin(this);
      const selfCache = this === top;
      if (!selfCache) {
        var o = this.getAbsoluteTransform(top).getMatrix();
        context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
      }
      drawFunc.call(this, context, this);
      context.restore();
      return this;
    }
    drawHitFromCache(alphaThreshold = 0) {
      var cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight(), hitImageData, hitData, len, rgbColorKey, i, alpha;
      hitContext.clear();
      hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
      try {
        hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
        hitData = hitImageData.data;
        len = hitData.length;
        rgbColorKey = Util_12.Util._hexToRgb(this.colorKey);
        for (i = 0; i < len; i += 4) {
          alpha = hitData[i + 3];
          if (alpha > alphaThreshold) {
            hitData[i] = rgbColorKey.r;
            hitData[i + 1] = rgbColorKey.g;
            hitData[i + 2] = rgbColorKey.b;
            hitData[i + 3] = 255;
          } else {
            hitData[i + 3] = 0;
          }
        }
        hitContext.putImageData(hitImageData, 0, 0);
      } catch (e) {
        Util_12.Util.error("Unable to draw hit graph from cached scene canvas. " + e.message);
      }
      return this;
    }
    hasPointerCapture(pointerId) {
      return PointerEvents$1.hasPointerCapture(pointerId, this);
    }
    setPointerCapture(pointerId) {
      PointerEvents$1.setPointerCapture(pointerId, this);
    }
    releaseCapture(pointerId) {
      PointerEvents$1.releaseCapture(pointerId, this);
    }
  }
  exports2.Shape = Shape2;
  Shape2.prototype._fillFunc = _fillFunc2;
  Shape2.prototype._strokeFunc = _strokeFunc2;
  Shape2.prototype._fillFuncHit = _fillFuncHit;
  Shape2.prototype._strokeFuncHit = _strokeFuncHit;
  Shape2.prototype._centroid = false;
  Shape2.prototype.nodeType = "Shape";
  (0, Global_22._registerNode)(Shape2);
  Shape2.prototype.eventListeners = {};
  Shape2.prototype.on.call(Shape2.prototype, "shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva", _clearHasShadowCache);
  Shape2.prototype.on.call(Shape2.prototype, "shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva", _clearGetShadowRGBACache);
  Shape2.prototype.on.call(Shape2.prototype, "fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva", _clearFillPatternCache);
  Shape2.prototype.on.call(Shape2.prototype, "fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva", _clearLinearGradientCache);
  Shape2.prototype.on.call(Shape2.prototype, "fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva", _clearRadialGradientCache);
  Factory_12.Factory.addGetterSetter(Shape2, "stroke", void 0, (0, Validators_12.getStringOrGradientValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "strokeWidth", 2, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillAfterStrokeEnabled", false);
  Factory_12.Factory.addGetterSetter(Shape2, "hitStrokeWidth", "auto", (0, Validators_12.getNumberOrAutoValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "strokeHitEnabled", true, (0, Validators_12.getBooleanValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "perfectDrawEnabled", true, (0, Validators_12.getBooleanValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "shadowForStrokeEnabled", true, (0, Validators_12.getBooleanValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "lineJoin");
  Factory_12.Factory.addGetterSetter(Shape2, "lineCap");
  Factory_12.Factory.addGetterSetter(Shape2, "sceneFunc");
  Factory_12.Factory.addGetterSetter(Shape2, "hitFunc");
  Factory_12.Factory.addGetterSetter(Shape2, "dash");
  Factory_12.Factory.addGetterSetter(Shape2, "dashOffset", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "shadowColor", void 0, (0, Validators_12.getStringValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "shadowBlur", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "shadowOpacity", 1, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "shadowOffset", ["x", "y"]);
  Factory_12.Factory.addGetterSetter(Shape2, "shadowOffsetX", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "shadowOffsetY", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternImage");
  Factory_12.Factory.addGetterSetter(Shape2, "fill", void 0, (0, Validators_12.getStringOrGradientValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternX", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternY", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillLinearGradientColorStops");
  Factory_12.Factory.addGetterSetter(Shape2, "strokeLinearGradientColorStops");
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientStartRadius", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientEndRadius", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientColorStops");
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternRepeat", "repeat");
  Factory_12.Factory.addGetterSetter(Shape2, "fillEnabled", true);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeEnabled", true);
  Factory_12.Factory.addGetterSetter(Shape2, "shadowEnabled", true);
  Factory_12.Factory.addGetterSetter(Shape2, "dashEnabled", true);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeScaleEnabled", true);
  Factory_12.Factory.addGetterSetter(Shape2, "fillPriority", "color");
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillPatternOffset", ["x", "y"]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternOffsetX", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternOffsetY", 0, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillPatternScale", ["x", "y"]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternScaleX", 1, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternScaleY", 1, (0, Validators_12.getNumberValidator)());
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillLinearGradientStartPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "strokeLinearGradientStartPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillLinearGradientStartPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeLinearGradientStartPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillLinearGradientStartPointY", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeLinearGradientStartPointY", 0);
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillLinearGradientEndPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "strokeLinearGradientEndPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillLinearGradientEndPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeLinearGradientEndPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillLinearGradientEndPointY", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "strokeLinearGradientEndPointY", 0);
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillRadialGradientStartPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientStartPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientStartPointY", 0);
  Factory_12.Factory.addComponentsGetterSetter(Shape2, "fillRadialGradientEndPoint", [
    "x",
    "y"
  ]);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientEndPointX", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRadialGradientEndPointY", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillPatternRotation", 0);
  Factory_12.Factory.addGetterSetter(Shape2, "fillRule", void 0, (0, Validators_12.getStringValidator)());
  Factory_12.Factory.backCompat(Shape2, {
    dashArray: "dash",
    getDashArray: "getDash",
    setDashArray: "getDash",
    drawFunc: "sceneFunc",
    getDrawFunc: "getSceneFunc",
    setDrawFunc: "setSceneFunc",
    drawHitFunc: "hitFunc",
    getDrawHitFunc: "getHitFunc",
    setDrawHitFunc: "setHitFunc"
  });
})(Shape);
Object.defineProperty(Layer$1, "__esModule", { value: true });
Layer$1.Layer = void 0;
const Util_1$b = Util;
const Container_1$1 = Container$1;
const Node_1$g = Node$1;
const Factory_1$w = Factory;
const Canvas_1 = Canvas$1;
const Validators_1$v = Validators;
const Shape_1$g = Shape;
const Global_1$k = Global;
var HASH = "#", BEFORE_DRAW = "beforeDraw", DRAW = "draw", INTERSECTION_OFFSETS = [
  { x: 0, y: 0 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 }
], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
class Layer extends Container_1$1.Container {
  constructor(config) {
    super(config);
    this.canvas = new Canvas_1.SceneCanvas();
    this.hitCanvas = new Canvas_1.HitCanvas({
      pixelRatio: 1
    });
    this._waitingForDraw = false;
    this.on("visibleChange.konva", this._checkVisibility);
    this._checkVisibility();
    this.on("imageSmoothingEnabledChange.konva", this._setSmoothEnabled);
    this._setSmoothEnabled();
  }
  createPNGStream() {
    const c = this.canvas._canvas;
    return c.createPNGStream();
  }
  getCanvas() {
    return this.canvas;
  }
  getNativeCanvasElement() {
    return this.canvas._canvas;
  }
  getHitCanvas() {
    return this.hitCanvas;
  }
  getContext() {
    return this.getCanvas().getContext();
  }
  clear(bounds) {
    this.getContext().clear(bounds);
    this.getHitCanvas().getContext().clear(bounds);
    return this;
  }
  setZIndex(index) {
    super.setZIndex(index);
    var stage = this.getStage();
    if (stage && stage.content) {
      stage.content.removeChild(this.getNativeCanvasElement());
      if (index < stage.children.length - 1) {
        stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[index + 1].getCanvas()._canvas);
      } else {
        stage.content.appendChild(this.getNativeCanvasElement());
      }
    }
    return this;
  }
  moveToTop() {
    Node_1$g.Node.prototype.moveToTop.call(this);
    var stage = this.getStage();
    if (stage && stage.content) {
      stage.content.removeChild(this.getNativeCanvasElement());
      stage.content.appendChild(this.getNativeCanvasElement());
    }
    return true;
  }
  moveUp() {
    var moved = Node_1$g.Node.prototype.moveUp.call(this);
    if (!moved) {
      return false;
    }
    var stage = this.getStage();
    if (!stage || !stage.content) {
      return false;
    }
    stage.content.removeChild(this.getNativeCanvasElement());
    if (this.index < stage.children.length - 1) {
      stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[this.index + 1].getCanvas()._canvas);
    } else {
      stage.content.appendChild(this.getNativeCanvasElement());
    }
    return true;
  }
  moveDown() {
    if (Node_1$g.Node.prototype.moveDown.call(this)) {
      var stage = this.getStage();
      if (stage) {
        var children = stage.children;
        if (stage.content) {
          stage.content.removeChild(this.getNativeCanvasElement());
          stage.content.insertBefore(this.getNativeCanvasElement(), children[this.index + 1].getCanvas()._canvas);
        }
      }
      return true;
    }
    return false;
  }
  moveToBottom() {
    if (Node_1$g.Node.prototype.moveToBottom.call(this)) {
      var stage = this.getStage();
      if (stage) {
        var children = stage.children;
        if (stage.content) {
          stage.content.removeChild(this.getNativeCanvasElement());
          stage.content.insertBefore(this.getNativeCanvasElement(), children[1].getCanvas()._canvas);
        }
      }
      return true;
    }
    return false;
  }
  getLayer() {
    return this;
  }
  remove() {
    var _canvas = this.getNativeCanvasElement();
    Node_1$g.Node.prototype.remove.call(this);
    if (_canvas && _canvas.parentNode && Util_1$b.Util._isInDocument(_canvas)) {
      _canvas.parentNode.removeChild(_canvas);
    }
    return this;
  }
  getStage() {
    return this.parent;
  }
  setSize({ width, height }) {
    this.canvas.setSize(width, height);
    this.hitCanvas.setSize(width, height);
    this._setSmoothEnabled();
    return this;
  }
  _validateAdd(child) {
    var type = child.getType();
    if (type !== "Group" && type !== "Shape") {
      Util_1$b.Util.throw("You may only add groups and shapes to a layer.");
    }
  }
  _toKonvaCanvas(config) {
    config = config || {};
    config.width = config.width || this.getWidth();
    config.height = config.height || this.getHeight();
    config.x = config.x !== void 0 ? config.x : this.x();
    config.y = config.y !== void 0 ? config.y : this.y();
    return Node_1$g.Node.prototype._toKonvaCanvas.call(this, config);
  }
  _checkVisibility() {
    const visible = this.visible();
    if (visible) {
      this.canvas._canvas.style.display = "block";
    } else {
      this.canvas._canvas.style.display = "none";
    }
  }
  _setSmoothEnabled() {
    this.getContext()._context.imageSmoothingEnabled = this.imageSmoothingEnabled();
  }
  getWidth() {
    if (this.parent) {
      return this.parent.width();
    }
  }
  setWidth() {
    Util_1$b.Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
  }
  getHeight() {
    if (this.parent) {
      return this.parent.height();
    }
  }
  setHeight() {
    Util_1$b.Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
  }
  batchDraw() {
    if (!this._waitingForDraw) {
      this._waitingForDraw = true;
      Util_1$b.Util.requestAnimFrame(() => {
        this.draw();
        this._waitingForDraw = false;
      });
    }
    return this;
  }
  getIntersection(pos) {
    if (!this.isListening() || !this.isVisible()) {
      return null;
    }
    var spiralSearchDistance = 1;
    var continueSearch = false;
    while (true) {
      for (let i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
        const intersectionOffset = INTERSECTION_OFFSETS[i];
        const obj = this._getIntersection({
          x: pos.x + intersectionOffset.x * spiralSearchDistance,
          y: pos.y + intersectionOffset.y * spiralSearchDistance
        });
        const shape = obj.shape;
        if (shape) {
          return shape;
        }
        continueSearch = !!obj.antialiased;
        if (!obj.antialiased) {
          break;
        }
      }
      if (continueSearch) {
        spiralSearchDistance += 1;
      } else {
        return null;
      }
    }
  }
  _getIntersection(pos) {
    const ratio = this.hitCanvas.pixelRatio;
    const p2 = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data;
    const p3 = p2[3];
    if (p3 === 255) {
      const colorKey = Util_1$b.Util._rgbToHex(p2[0], p2[1], p2[2]);
      const shape = Shape_1$g.shapes[HASH + colorKey];
      if (shape) {
        return {
          shape
        };
      }
      return {
        antialiased: true
      };
    } else if (p3 > 0) {
      return {
        antialiased: true
      };
    }
    return {};
  }
  drawScene(can, top) {
    var layer = this.getLayer(), canvas = can || layer && layer.getCanvas();
    this._fire(BEFORE_DRAW, {
      node: this
    });
    if (this.clearBeforeDraw()) {
      canvas.getContext().clear();
    }
    Container_1$1.Container.prototype.drawScene.call(this, canvas, top);
    this._fire(DRAW, {
      node: this
    });
    return this;
  }
  drawHit(can, top) {
    var layer = this.getLayer(), canvas = can || layer && layer.hitCanvas;
    if (layer && layer.clearBeforeDraw()) {
      layer.getHitCanvas().getContext().clear();
    }
    Container_1$1.Container.prototype.drawHit.call(this, canvas, top);
    return this;
  }
  enableHitGraph() {
    this.hitGraphEnabled(true);
    return this;
  }
  disableHitGraph() {
    this.hitGraphEnabled(false);
    return this;
  }
  setHitGraphEnabled(val) {
    Util_1$b.Util.warn("hitGraphEnabled method is deprecated. Please use layer.listening() instead.");
    this.listening(val);
  }
  getHitGraphEnabled(val) {
    Util_1$b.Util.warn("hitGraphEnabled method is deprecated. Please use layer.listening() instead.");
    return this.listening();
  }
  toggleHitCanvas() {
    if (!this.parent || !this.parent["content"]) {
      return;
    }
    var parent2 = this.parent;
    var added = !!this.hitCanvas._canvas.parentNode;
    if (added) {
      parent2.content.removeChild(this.hitCanvas._canvas);
    } else {
      parent2.content.appendChild(this.hitCanvas._canvas);
    }
  }
  destroy() {
    Util_1$b.Util.releaseCanvas(this.getNativeCanvasElement(), this.getHitCanvas()._canvas);
    return super.destroy();
  }
}
Layer$1.Layer = Layer;
Layer.prototype.nodeType = "Layer";
(0, Global_1$k._registerNode)(Layer);
Factory_1$w.Factory.addGetterSetter(Layer, "imageSmoothingEnabled", true);
Factory_1$w.Factory.addGetterSetter(Layer, "clearBeforeDraw", true);
Factory_1$w.Factory.addGetterSetter(Layer, "hitGraphEnabled", true, (0, Validators_1$v.getBooleanValidator)());
var FastLayer$1 = {};
Object.defineProperty(FastLayer$1, "__esModule", { value: true });
FastLayer$1.FastLayer = void 0;
const Util_1$a = Util;
const Layer_1 = Layer$1;
const Global_1$j = Global;
class FastLayer extends Layer_1.Layer {
  constructor(attrs) {
    super(attrs);
    this.listening(false);
    Util_1$a.Util.warn('Konva.Fast layer is deprecated. Please use "new Konva.Layer({ listening: false })" instead.');
  }
}
FastLayer$1.FastLayer = FastLayer;
FastLayer.prototype.nodeType = "FastLayer";
(0, Global_1$j._registerNode)(FastLayer);
var Group$1 = {};
Object.defineProperty(Group$1, "__esModule", { value: true });
Group$1.Group = void 0;
const Util_1$9 = Util;
const Container_1 = Container$1;
const Global_1$i = Global;
class Group extends Container_1.Container {
  _validateAdd(child) {
    var type = child.getType();
    if (type !== "Group" && type !== "Shape") {
      Util_1$9.Util.throw("You may only add groups and shapes to groups.");
    }
  }
}
Group$1.Group = Group;
Group.prototype.nodeType = "Group";
(0, Global_1$i._registerNode)(Group);
var Animation$1 = {};
Object.defineProperty(Animation$1, "__esModule", { value: true });
Animation$1.Animation = void 0;
const Global_1$h = Global;
const Util_1$8 = Util;
const now = function() {
  if (Global_1$h.glob.performance && Global_1$h.glob.performance.now) {
    return function() {
      return Global_1$h.glob.performance.now();
    };
  }
  return function() {
    return (/* @__PURE__ */ new Date()).getTime();
  };
}();
class Animation {
  constructor(func2, layers) {
    this.id = Animation.animIdCounter++;
    this.frame = {
      time: 0,
      timeDiff: 0,
      lastTime: now(),
      frameRate: 0
    };
    this.func = func2;
    this.setLayers(layers);
  }
  setLayers(layers) {
    let lays = [];
    if (layers) {
      lays = Array.isArray(layers) ? layers : [layers];
    }
    this.layers = lays;
    return this;
  }
  getLayers() {
    return this.layers;
  }
  addLayer(layer) {
    const layers = this.layers;
    const len = layers.length;
    for (let n = 0; n < len; n++) {
      if (layers[n]._id === layer._id) {
        return false;
      }
    }
    this.layers.push(layer);
    return true;
  }
  isRunning() {
    const a = Animation;
    const animations = a.animations;
    const len = animations.length;
    for (let n = 0; n < len; n++) {
      if (animations[n].id === this.id) {
        return true;
      }
    }
    return false;
  }
  start() {
    this.stop();
    this.frame.timeDiff = 0;
    this.frame.lastTime = now();
    Animation._addAnimation(this);
    return this;
  }
  stop() {
    Animation._removeAnimation(this);
    return this;
  }
  _updateFrameObject(time) {
    this.frame.timeDiff = time - this.frame.lastTime;
    this.frame.lastTime = time;
    this.frame.time += this.frame.timeDiff;
    this.frame.frameRate = 1e3 / this.frame.timeDiff;
  }
  static _addAnimation(anim) {
    this.animations.push(anim);
    this._handleAnimation();
  }
  static _removeAnimation(anim) {
    const id = anim.id;
    const animations = this.animations;
    const len = animations.length;
    for (let n = 0; n < len; n++) {
      if (animations[n].id === id) {
        this.animations.splice(n, 1);
        break;
      }
    }
  }
  static _runFrames() {
    const layerHash = {};
    const animations = this.animations;
    for (let n = 0; n < animations.length; n++) {
      const anim = animations[n];
      const layers = anim.layers;
      const func2 = anim.func;
      anim._updateFrameObject(now());
      const layersLen = layers.length;
      let needRedraw;
      if (func2) {
        needRedraw = func2.call(anim, anim.frame) !== false;
      } else {
        needRedraw = true;
      }
      if (!needRedraw) {
        continue;
      }
      for (let i = 0; i < layersLen; i++) {
        const layer = layers[i];
        if (layer._id !== void 0) {
          layerHash[layer._id] = layer;
        }
      }
    }
    for (let key in layerHash) {
      if (!layerHash.hasOwnProperty(key)) {
        continue;
      }
      layerHash[key].batchDraw();
    }
  }
  static _animationLoop() {
    const Anim = Animation;
    if (Anim.animations.length) {
      Anim._runFrames();
      Util_1$8.Util.requestAnimFrame(Anim._animationLoop);
    } else {
      Anim.animRunning = false;
    }
  }
  static _handleAnimation() {
    if (!this.animRunning) {
      this.animRunning = true;
      Util_1$8.Util.requestAnimFrame(this._animationLoop);
    }
  }
}
Animation$1.Animation = Animation;
Animation.animations = [];
Animation.animIdCounter = 0;
Animation.animRunning = false;
var Tween = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Easings = exports2.Tween = void 0;
  const Util_12 = Util;
  const Animation_12 = Animation$1;
  const Node_12 = Node$1;
  const Global_12 = Global;
  var blacklist = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    yoyo: 1
  }, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter2 = 0, colorAttrs = ["fill", "stroke", "shadowColor"];
  class TweenEngine {
    constructor(prop, propFunc, func2, begin, finish, duration, yoyo) {
      this.prop = prop;
      this.propFunc = propFunc;
      this.begin = begin;
      this._pos = begin;
      this.duration = duration;
      this._change = 0;
      this.prevPos = 0;
      this.yoyo = yoyo;
      this._time = 0;
      this._position = 0;
      this._startTime = 0;
      this._finish = 0;
      this.func = func2;
      this._change = finish - this.begin;
      this.pause();
    }
    fire(str) {
      var handler = this[str];
      if (handler) {
        handler();
      }
    }
    setTime(t) {
      if (t > this.duration) {
        if (this.yoyo) {
          this._time = this.duration;
          this.reverse();
        } else {
          this.finish();
        }
      } else if (t < 0) {
        if (this.yoyo) {
          this._time = 0;
          this.play();
        } else {
          this.reset();
        }
      } else {
        this._time = t;
        this.update();
      }
    }
    getTime() {
      return this._time;
    }
    setPosition(p2) {
      this.prevPos = this._pos;
      this.propFunc(p2);
      this._pos = p2;
    }
    getPosition(t) {
      if (t === void 0) {
        t = this._time;
      }
      return this.func(t, this.begin, this._change, this.duration);
    }
    play() {
      this.state = PLAYING;
      this._startTime = this.getTimer() - this._time;
      this.onEnterFrame();
      this.fire("onPlay");
    }
    reverse() {
      this.state = REVERSING;
      this._time = this.duration - this._time;
      this._startTime = this.getTimer() - this._time;
      this.onEnterFrame();
      this.fire("onReverse");
    }
    seek(t) {
      this.pause();
      this._time = t;
      this.update();
      this.fire("onSeek");
    }
    reset() {
      this.pause();
      this._time = 0;
      this.update();
      this.fire("onReset");
    }
    finish() {
      this.pause();
      this._time = this.duration;
      this.update();
      this.fire("onFinish");
    }
    update() {
      this.setPosition(this.getPosition(this._time));
      this.fire("onUpdate");
    }
    onEnterFrame() {
      var t = this.getTimer() - this._startTime;
      if (this.state === PLAYING) {
        this.setTime(t);
      } else if (this.state === REVERSING) {
        this.setTime(this.duration - t);
      }
    }
    pause() {
      this.state = PAUSED;
      this.fire("onPause");
    }
    getTimer() {
      return (/* @__PURE__ */ new Date()).getTime();
    }
  }
  class Tween2 {
    constructor(config) {
      var that = this, node = config.node, nodeId = node._id, duration, easing = config.easing || exports2.Easings.Linear, yoyo = !!config.yoyo, key;
      if (typeof config.duration === "undefined") {
        duration = 0.3;
      } else if (config.duration === 0) {
        duration = 1e-3;
      } else {
        duration = config.duration;
      }
      this.node = node;
      this._id = idCounter2++;
      var layers = node.getLayer() || (node instanceof Global_12.Konva["Stage"] ? node.getLayers() : null);
      if (!layers) {
        Util_12.Util.error("Tween constructor have `node` that is not in a layer. Please add node into layer first.");
      }
      this.anim = new Animation_12.Animation(function() {
        that.tween.onEnterFrame();
      }, layers);
      this.tween = new TweenEngine(key, function(i) {
        that._tweenFunc(i);
      }, easing, 0, 1, duration * 1e3, yoyo);
      this._addListeners();
      if (!Tween2.attrs[nodeId]) {
        Tween2.attrs[nodeId] = {};
      }
      if (!Tween2.attrs[nodeId][this._id]) {
        Tween2.attrs[nodeId][this._id] = {};
      }
      if (!Tween2.tweens[nodeId]) {
        Tween2.tweens[nodeId] = {};
      }
      for (key in config) {
        if (blacklist[key] === void 0) {
          this._addAttr(key, config[key]);
        }
      }
      this.reset();
      this.onFinish = config.onFinish;
      this.onReset = config.onReset;
      this.onUpdate = config.onUpdate;
    }
    _addAttr(key, end) {
      var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA;
      tweenId = Tween2.tweens[nodeId][key];
      if (tweenId) {
        delete Tween2.attrs[nodeId][tweenId][key];
      }
      start = node.getAttr(key);
      if (Util_12.Util._isArray(end)) {
        diff = [];
        len = Math.max(end.length, start.length);
        if (key === "points" && end.length !== start.length) {
          if (end.length > start.length) {
            trueStart = start;
            start = Util_12.Util._prepareArrayForTween(start, end, node.closed());
          } else {
            trueEnd = end;
            end = Util_12.Util._prepareArrayForTween(end, start, node.closed());
          }
        }
        if (key.indexOf("fill") === 0) {
          for (n = 0; n < len; n++) {
            if (n % 2 === 0) {
              diff.push(end[n] - start[n]);
            } else {
              var startRGBA = Util_12.Util.colorToRGBA(start[n]);
              endRGBA = Util_12.Util.colorToRGBA(end[n]);
              start[n] = startRGBA;
              diff.push({
                r: endRGBA.r - startRGBA.r,
                g: endRGBA.g - startRGBA.g,
                b: endRGBA.b - startRGBA.b,
                a: endRGBA.a - startRGBA.a
              });
            }
          }
        } else {
          for (n = 0; n < len; n++) {
            diff.push(end[n] - start[n]);
          }
        }
      } else if (colorAttrs.indexOf(key) !== -1) {
        start = Util_12.Util.colorToRGBA(start);
        endRGBA = Util_12.Util.colorToRGBA(end);
        diff = {
          r: endRGBA.r - start.r,
          g: endRGBA.g - start.g,
          b: endRGBA.b - start.b,
          a: endRGBA.a - start.a
        };
      } else {
        diff = end - start;
      }
      Tween2.attrs[nodeId][this._id][key] = {
        start,
        diff,
        end,
        trueEnd,
        trueStart
      };
      Tween2.tweens[nodeId][key] = this._id;
    }
    _tweenFunc(i) {
      var node = this.node, attrs = Tween2.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, end;
      for (key in attrs) {
        attr = attrs[key];
        start = attr.start;
        diff = attr.diff;
        end = attr.end;
        if (Util_12.Util._isArray(start)) {
          newVal = [];
          len = Math.max(start.length, end.length);
          if (key.indexOf("fill") === 0) {
            for (n = 0; n < len; n++) {
              if (n % 2 === 0) {
                newVal.push((start[n] || 0) + diff[n] * i);
              } else {
                newVal.push("rgba(" + Math.round(start[n].r + diff[n].r * i) + "," + Math.round(start[n].g + diff[n].g * i) + "," + Math.round(start[n].b + diff[n].b * i) + "," + (start[n].a + diff[n].a * i) + ")");
              }
            }
          } else {
            for (n = 0; n < len; n++) {
              newVal.push((start[n] || 0) + diff[n] * i);
            }
          }
        } else if (colorAttrs.indexOf(key) !== -1) {
          newVal = "rgba(" + Math.round(start.r + diff.r * i) + "," + Math.round(start.g + diff.g * i) + "," + Math.round(start.b + diff.b * i) + "," + (start.a + diff.a * i) + ")";
        } else {
          newVal = start + diff * i;
        }
        node.setAttr(key, newVal);
      }
    }
    _addListeners() {
      this.tween.onPlay = () => {
        this.anim.start();
      };
      this.tween.onReverse = () => {
        this.anim.start();
      };
      this.tween.onPause = () => {
        this.anim.stop();
      };
      this.tween.onFinish = () => {
        var node = this.node;
        var attrs = Tween2.attrs[node._id][this._id];
        if (attrs.points && attrs.points.trueEnd) {
          node.setAttr("points", attrs.points.trueEnd);
        }
        if (this.onFinish) {
          this.onFinish.call(this);
        }
      };
      this.tween.onReset = () => {
        var node = this.node;
        var attrs = Tween2.attrs[node._id][this._id];
        if (attrs.points && attrs.points.trueStart) {
          node.points(attrs.points.trueStart);
        }
        if (this.onReset) {
          this.onReset();
        }
      };
      this.tween.onUpdate = () => {
        if (this.onUpdate) {
          this.onUpdate.call(this);
        }
      };
    }
    play() {
      this.tween.play();
      return this;
    }
    reverse() {
      this.tween.reverse();
      return this;
    }
    reset() {
      this.tween.reset();
      return this;
    }
    seek(t) {
      this.tween.seek(t * 1e3);
      return this;
    }
    pause() {
      this.tween.pause();
      return this;
    }
    finish() {
      this.tween.finish();
      return this;
    }
    destroy() {
      var nodeId = this.node._id, thisId = this._id, attrs = Tween2.tweens[nodeId], key;
      this.pause();
      for (key in attrs) {
        delete Tween2.tweens[nodeId][key];
      }
      delete Tween2.attrs[nodeId][thisId];
    }
  }
  exports2.Tween = Tween2;
  Tween2.attrs = {};
  Tween2.tweens = {};
  Node_12.Node.prototype.to = function(params) {
    var onFinish = params.onFinish;
    params.node = this;
    params.onFinish = function() {
      this.destroy();
      if (onFinish) {
        onFinish();
      }
    };
    var tween = new Tween2(params);
    tween.play();
  };
  exports2.Easings = {
    BackEaseIn(t, b, c, d) {
      var s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    BackEaseOut(t, b, c, d) {
      var s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    BackEaseInOut(t, b, c, d) {
      var s = 1.70158;
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      }
      return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    ElasticEaseIn(t, b, c, d, a, p2) {
      var s = 0;
      if (t === 0) {
        return b;
      }
      if ((t /= d) === 1) {
        return b + c;
      }
      if (!p2) {
        p2 = d * 0.3;
      }
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p2 / 4;
      } else {
        s = p2 / (2 * Math.PI) * Math.asin(c / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p2)) + b;
    },
    ElasticEaseOut(t, b, c, d, a, p2) {
      var s = 0;
      if (t === 0) {
        return b;
      }
      if ((t /= d) === 1) {
        return b + c;
      }
      if (!p2) {
        p2 = d * 0.3;
      }
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p2 / 4;
      } else {
        s = p2 / (2 * Math.PI) * Math.asin(c / a);
      }
      return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p2) + c + b;
    },
    ElasticEaseInOut(t, b, c, d, a, p2) {
      var s = 0;
      if (t === 0) {
        return b;
      }
      if ((t /= d / 2) === 2) {
        return b + c;
      }
      if (!p2) {
        p2 = d * (0.3 * 1.5);
      }
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p2 / 4;
      } else {
        s = p2 / (2 * Math.PI) * Math.asin(c / a);
      }
      if (t < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p2)) + b;
      }
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p2) * 0.5 + c + b;
    },
    BounceEaseOut(t, b, c, d) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
      }
    },
    BounceEaseIn(t, b, c, d) {
      return c - exports2.Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    BounceEaseInOut(t, b, c, d) {
      if (t < d / 2) {
        return exports2.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
      } else {
        return exports2.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
      }
    },
    EaseIn(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    EaseOut(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    EaseInOut(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      }
      return -c / 2 * (--t * (t - 2) - 1) + b;
    },
    StrongEaseIn(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    StrongEaseOut(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    StrongEaseInOut(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
      }
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    Linear(t, b, c, d) {
      return c * t / d + b;
    }
  };
})(Tween);
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.Konva = void 0;
  const Global_12 = Global;
  const Util_12 = Util;
  const Node_12 = Node$1;
  const Container_12 = Container$1;
  const Stage_1 = Stage;
  const Layer_12 = Layer$1;
  const FastLayer_1 = FastLayer$1;
  const Group_12 = Group$1;
  const DragAndDrop_12 = DragAndDrop;
  const Shape_12 = Shape;
  const Animation_12 = Animation$1;
  const Tween_1 = Tween;
  const Context_12 = Context$1;
  const Canvas_12 = Canvas$1;
  exports2.Konva = Util_12.Util._assign(Global_12.Konva, {
    Util: Util_12.Util,
    Transform: Util_12.Transform,
    Node: Node_12.Node,
    Container: Container_12.Container,
    Stage: Stage_1.Stage,
    stages: Stage_1.stages,
    Layer: Layer_12.Layer,
    FastLayer: FastLayer_1.FastLayer,
    Group: Group_12.Group,
    DD: DragAndDrop_12.DD,
    Shape: Shape_12.Shape,
    shapes: Shape_12.shapes,
    Animation: Animation_12.Animation,
    Tween: Tween_1.Tween,
    Easings: Tween_1.Easings,
    Context: Context_12.Context,
    Canvas: Canvas_12.Canvas
  });
  exports2.default = exports2.Konva;
})(_CoreInternals);
var Arc$1 = {};
Object.defineProperty(Arc$1, "__esModule", { value: true });
Arc$1.Arc = void 0;
const Factory_1$v = Factory;
const Shape_1$f = Shape;
const Global_1$g = Global;
const Validators_1$u = Validators;
const Global_2$2 = Global;
class Arc extends Shape_1$f.Shape {
  _sceneFunc(context) {
    var angle = Global_1$g.Konva.getAngle(this.angle()), clockwise = this.clockwise();
    context.beginPath();
    context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
    context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width) {
    this.outerRadius(width / 2);
  }
  setHeight(height) {
    this.outerRadius(height / 2);
  }
  getSelfRect() {
    const innerRadius = this.innerRadius();
    const outerRadius = this.outerRadius();
    const clockwise = this.clockwise();
    const angle = Global_1$g.Konva.getAngle(clockwise ? 360 - this.angle() : this.angle());
    const boundLeftRatio = Math.cos(Math.min(angle, Math.PI));
    const boundRightRatio = 1;
    const boundTopRatio = Math.sin(Math.min(Math.max(Math.PI, angle), 3 * Math.PI / 2));
    const boundBottomRatio = Math.sin(Math.min(angle, Math.PI / 2));
    const boundLeft = boundLeftRatio * (boundLeftRatio > 0 ? innerRadius : outerRadius);
    const boundRight = boundRightRatio * outerRadius;
    const boundTop = boundTopRatio * (boundTopRatio > 0 ? innerRadius : outerRadius);
    const boundBottom = boundBottomRatio * (boundBottomRatio > 0 ? outerRadius : innerRadius);
    return {
      x: boundLeft,
      y: clockwise ? -1 * boundBottom : boundTop,
      width: boundRight - boundLeft,
      height: boundBottom - boundTop
    };
  }
}
Arc$1.Arc = Arc;
Arc.prototype._centroid = true;
Arc.prototype.className = "Arc";
Arc.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"];
(0, Global_2$2._registerNode)(Arc);
Factory_1$v.Factory.addGetterSetter(Arc, "innerRadius", 0, (0, Validators_1$u.getNumberValidator)());
Factory_1$v.Factory.addGetterSetter(Arc, "outerRadius", 0, (0, Validators_1$u.getNumberValidator)());
Factory_1$v.Factory.addGetterSetter(Arc, "angle", 0, (0, Validators_1$u.getNumberValidator)());
Factory_1$v.Factory.addGetterSetter(Arc, "clockwise", false, (0, Validators_1$u.getBooleanValidator)());
var Arrow$1 = {};
var Line$1 = {};
Object.defineProperty(Line$1, "__esModule", { value: true });
Line$1.Line = void 0;
const Factory_1$u = Factory;
const Shape_1$e = Shape;
const Validators_1$t = Validators;
const Global_1$f = Global;
function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
  var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = t * d01 / (d01 + d12), fb = t * d12 / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
  return [p1x, p1y, p2x, p2y];
}
function expandPoints(p2, tension) {
  var len = p2.length, allPoints = [], n, cp;
  for (n = 2; n < len - 2; n += 2) {
    cp = getControlPoints(p2[n - 2], p2[n - 1], p2[n], p2[n + 1], p2[n + 2], p2[n + 3], tension);
    if (isNaN(cp[0])) {
      continue;
    }
    allPoints.push(cp[0]);
    allPoints.push(cp[1]);
    allPoints.push(p2[n]);
    allPoints.push(p2[n + 1]);
    allPoints.push(cp[2]);
    allPoints.push(cp[3]);
  }
  return allPoints;
}
class Line extends Shape_1$e.Shape {
  constructor(config) {
    super(config);
    this.on("pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva", function() {
      this._clearCache("tensionPoints");
    });
  }
  _sceneFunc(context) {
    var points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier(), tp, len, n;
    if (!length) {
      return;
    }
    context.beginPath();
    context.moveTo(points[0], points[1]);
    if (tension !== 0 && length > 4) {
      tp = this.getTensionPoints();
      len = tp.length;
      n = closed ? 0 : 4;
      if (!closed) {
        context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
      }
      while (n < len - 2) {
        context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
      }
      if (!closed) {
        context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
      }
    } else if (bezier) {
      n = 2;
      while (n < length) {
        context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
      }
    } else {
      for (n = 2; n < length; n += 2) {
        context.lineTo(points[n], points[n + 1]);
      }
    }
    if (closed) {
      context.closePath();
      context.fillStrokeShape(this);
    } else {
      context.strokeShape(this);
    }
  }
  getTensionPoints() {
    return this._getCache("tensionPoints", this._getTensionPoints);
  }
  _getTensionPoints() {
    if (this.closed()) {
      return this._getTensionPointsClosed();
    } else {
      return expandPoints(this.points(), this.tension());
    }
  }
  _getTensionPointsClosed() {
    var p2 = this.points(), len = p2.length, tension = this.tension(), firstControlPoints = getControlPoints(p2[len - 2], p2[len - 1], p2[0], p2[1], p2[2], p2[3], tension), lastControlPoints = getControlPoints(p2[len - 4], p2[len - 3], p2[len - 2], p2[len - 1], p2[0], p2[1], tension), middle = expandPoints(p2, tension), tp = [firstControlPoints[2], firstControlPoints[3]].concat(middle).concat([
      lastControlPoints[0],
      lastControlPoints[1],
      p2[len - 2],
      p2[len - 1],
      lastControlPoints[2],
      lastControlPoints[3],
      firstControlPoints[0],
      firstControlPoints[1],
      p2[0],
      p2[1]
    ]);
    return tp;
  }
  getWidth() {
    return this.getSelfRect().width;
  }
  getHeight() {
    return this.getSelfRect().height;
  }
  getSelfRect() {
    var points = this.points();
    if (points.length < 4) {
      return {
        x: points[0] || 0,
        y: points[1] || 0,
        width: 0,
        height: 0
      };
    }
    if (this.tension() !== 0) {
      points = [
        points[0],
        points[1],
        ...this._getTensionPoints(),
        points[points.length - 2],
        points[points.length - 1]
      ];
    } else {
      points = this.points();
    }
    var minX = points[0];
    var maxX = points[0];
    var minY = points[1];
    var maxY = points[1];
    var x, y;
    for (var i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}
Line$1.Line = Line;
Line.prototype.className = "Line";
Line.prototype._attrsAffectingSize = ["points", "bezier", "tension"];
(0, Global_1$f._registerNode)(Line);
Factory_1$u.Factory.addGetterSetter(Line, "closed", false);
Factory_1$u.Factory.addGetterSetter(Line, "bezier", false);
Factory_1$u.Factory.addGetterSetter(Line, "tension", 0, (0, Validators_1$t.getNumberValidator)());
Factory_1$u.Factory.addGetterSetter(Line, "points", [], (0, Validators_1$t.getNumberArrayValidator)());
var Path$1 = {};
var BezierFunctions = {};
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.t2length = exports2.getQuadraticArcLength = exports2.getCubicArcLength = exports2.binomialCoefficients = exports2.cValues = exports2.tValues = void 0;
  exports2.tValues = [
    [],
    [],
    [
      -0.5773502691896257,
      0.5773502691896257
    ],
    [
      0,
      -0.7745966692414834,
      0.7745966692414834
    ],
    [
      -0.33998104358485626,
      0.33998104358485626,
      -0.8611363115940526,
      0.8611363115940526
    ],
    [
      0,
      -0.5384693101056831,
      0.5384693101056831,
      -0.906179845938664,
      0.906179845938664
    ],
    [
      0.6612093864662645,
      -0.6612093864662645,
      -0.2386191860831969,
      0.2386191860831969,
      -0.932469514203152,
      0.932469514203152
    ],
    [
      0,
      0.4058451513773972,
      -0.4058451513773972,
      -0.7415311855993945,
      0.7415311855993945,
      -0.9491079123427585,
      0.9491079123427585
    ],
    [
      -0.1834346424956498,
      0.1834346424956498,
      -0.525532409916329,
      0.525532409916329,
      -0.7966664774136267,
      0.7966664774136267,
      -0.9602898564975363,
      0.9602898564975363
    ],
    [
      0,
      -0.8360311073266358,
      0.8360311073266358,
      -0.9681602395076261,
      0.9681602395076261,
      -0.3242534234038089,
      0.3242534234038089,
      -0.6133714327005904,
      0.6133714327005904
    ],
    [
      -0.14887433898163122,
      0.14887433898163122,
      -0.4333953941292472,
      0.4333953941292472,
      -0.6794095682990244,
      0.6794095682990244,
      -0.8650633666889845,
      0.8650633666889845,
      -0.9739065285171717,
      0.9739065285171717
    ],
    [
      0,
      -0.26954315595234496,
      0.26954315595234496,
      -0.5190961292068118,
      0.5190961292068118,
      -0.7301520055740494,
      0.7301520055740494,
      -0.8870625997680953,
      0.8870625997680953,
      -0.978228658146057,
      0.978228658146057
    ],
    [
      -0.1252334085114689,
      0.1252334085114689,
      -0.3678314989981802,
      0.3678314989981802,
      -0.5873179542866175,
      0.5873179542866175,
      -0.7699026741943047,
      0.7699026741943047,
      -0.9041172563704749,
      0.9041172563704749,
      -0.9815606342467192,
      0.9815606342467192
    ],
    [
      0,
      -0.2304583159551348,
      0.2304583159551348,
      -0.44849275103644687,
      0.44849275103644687,
      -0.6423493394403402,
      0.6423493394403402,
      -0.8015780907333099,
      0.8015780907333099,
      -0.9175983992229779,
      0.9175983992229779,
      -0.9841830547185881,
      0.9841830547185881
    ],
    [
      -0.10805494870734367,
      0.10805494870734367,
      -0.31911236892788974,
      0.31911236892788974,
      -0.5152486363581541,
      0.5152486363581541,
      -0.6872929048116855,
      0.6872929048116855,
      -0.827201315069765,
      0.827201315069765,
      -0.9284348836635735,
      0.9284348836635735,
      -0.9862838086968123,
      0.9862838086968123
    ],
    [
      0,
      -0.20119409399743451,
      0.20119409399743451,
      -0.3941513470775634,
      0.3941513470775634,
      -0.5709721726085388,
      0.5709721726085388,
      -0.7244177313601701,
      0.7244177313601701,
      -0.8482065834104272,
      0.8482065834104272,
      -0.937273392400706,
      0.937273392400706,
      -0.9879925180204854,
      0.9879925180204854
    ],
    [
      -0.09501250983763744,
      0.09501250983763744,
      -0.2816035507792589,
      0.2816035507792589,
      -0.45801677765722737,
      0.45801677765722737,
      -0.6178762444026438,
      0.6178762444026438,
      -0.755404408355003,
      0.755404408355003,
      -0.8656312023878318,
      0.8656312023878318,
      -0.9445750230732326,
      0.9445750230732326,
      -0.9894009349916499,
      0.9894009349916499
    ],
    [
      0,
      -0.17848418149584785,
      0.17848418149584785,
      -0.3512317634538763,
      0.3512317634538763,
      -0.5126905370864769,
      0.5126905370864769,
      -0.6576711592166907,
      0.6576711592166907,
      -0.7815140038968014,
      0.7815140038968014,
      -0.8802391537269859,
      0.8802391537269859,
      -0.9506755217687678,
      0.9506755217687678,
      -0.9905754753144174,
      0.9905754753144174
    ],
    [
      -0.0847750130417353,
      0.0847750130417353,
      -0.2518862256915055,
      0.2518862256915055,
      -0.41175116146284263,
      0.41175116146284263,
      -0.5597708310739475,
      0.5597708310739475,
      -0.6916870430603532,
      0.6916870430603532,
      -0.8037049589725231,
      0.8037049589725231,
      -0.8926024664975557,
      0.8926024664975557,
      -0.9558239495713977,
      0.9558239495713977,
      -0.9915651684209309,
      0.9915651684209309
    ],
    [
      0,
      -0.16035864564022537,
      0.16035864564022537,
      -0.31656409996362983,
      0.31656409996362983,
      -0.46457074137596094,
      0.46457074137596094,
      -0.600545304661681,
      0.600545304661681,
      -0.7209661773352294,
      0.7209661773352294,
      -0.8227146565371428,
      0.8227146565371428,
      -0.9031559036148179,
      0.9031559036148179,
      -0.96020815213483,
      0.96020815213483,
      -0.9924068438435844,
      0.9924068438435844
    ],
    [
      -0.07652652113349734,
      0.07652652113349734,
      -0.22778585114164507,
      0.22778585114164507,
      -0.37370608871541955,
      0.37370608871541955,
      -0.5108670019508271,
      0.5108670019508271,
      -0.636053680726515,
      0.636053680726515,
      -0.7463319064601508,
      0.7463319064601508,
      -0.8391169718222188,
      0.8391169718222188,
      -0.912234428251326,
      0.912234428251326,
      -0.9639719272779138,
      0.9639719272779138,
      -0.9931285991850949,
      0.9931285991850949
    ],
    [
      0,
      -0.1455618541608951,
      0.1455618541608951,
      -0.2880213168024011,
      0.2880213168024011,
      -0.4243421202074388,
      0.4243421202074388,
      -0.5516188358872198,
      0.5516188358872198,
      -0.6671388041974123,
      0.6671388041974123,
      -0.7684399634756779,
      0.7684399634756779,
      -0.8533633645833173,
      0.8533633645833173,
      -0.9200993341504008,
      0.9200993341504008,
      -0.9672268385663063,
      0.9672268385663063,
      -0.9937521706203895,
      0.9937521706203895
    ],
    [
      -0.06973927331972223,
      0.06973927331972223,
      -0.20786042668822127,
      0.20786042668822127,
      -0.34193582089208424,
      0.34193582089208424,
      -0.469355837986757,
      0.469355837986757,
      -0.5876404035069116,
      0.5876404035069116,
      -0.6944872631866827,
      0.6944872631866827,
      -0.7878168059792081,
      0.7878168059792081,
      -0.8658125777203002,
      0.8658125777203002,
      -0.926956772187174,
      0.926956772187174,
      -0.9700604978354287,
      0.9700604978354287,
      -0.9942945854823992,
      0.9942945854823992
    ],
    [
      0,
      -0.1332568242984661,
      0.1332568242984661,
      -0.26413568097034495,
      0.26413568097034495,
      -0.3903010380302908,
      0.3903010380302908,
      -0.5095014778460075,
      0.5095014778460075,
      -0.6196098757636461,
      0.6196098757636461,
      -0.7186613631319502,
      0.7186613631319502,
      -0.8048884016188399,
      0.8048884016188399,
      -0.8767523582704416,
      0.8767523582704416,
      -0.9329710868260161,
      0.9329710868260161,
      -0.9725424712181152,
      0.9725424712181152,
      -0.9947693349975522,
      0.9947693349975522
    ],
    [
      -0.06405689286260563,
      0.06405689286260563,
      -0.1911188674736163,
      0.1911188674736163,
      -0.3150426796961634,
      0.3150426796961634,
      -0.4337935076260451,
      0.4337935076260451,
      -0.5454214713888396,
      0.5454214713888396,
      -0.6480936519369755,
      0.6480936519369755,
      -0.7401241915785544,
      0.7401241915785544,
      -0.820001985973903,
      0.820001985973903,
      -0.8864155270044011,
      0.8864155270044011,
      -0.9382745520027328,
      0.9382745520027328,
      -0.9747285559713095,
      0.9747285559713095,
      -0.9951872199970213,
      0.9951872199970213
    ]
  ];
  exports2.cValues = [
    [],
    [],
    [1, 1],
    [
      0.8888888888888888,
      0.5555555555555556,
      0.5555555555555556
    ],
    [
      0.6521451548625461,
      0.6521451548625461,
      0.34785484513745385,
      0.34785484513745385
    ],
    [
      0.5688888888888889,
      0.47862867049936647,
      0.47862867049936647,
      0.23692688505618908,
      0.23692688505618908
    ],
    [
      0.3607615730481386,
      0.3607615730481386,
      0.46791393457269104,
      0.46791393457269104,
      0.17132449237917036,
      0.17132449237917036
    ],
    [
      0.4179591836734694,
      0.3818300505051189,
      0.3818300505051189,
      0.27970539148927664,
      0.27970539148927664,
      0.1294849661688697,
      0.1294849661688697
    ],
    [
      0.362683783378362,
      0.362683783378362,
      0.31370664587788727,
      0.31370664587788727,
      0.22238103445337448,
      0.22238103445337448,
      0.10122853629037626,
      0.10122853629037626
    ],
    [
      0.3302393550012598,
      0.1806481606948574,
      0.1806481606948574,
      0.08127438836157441,
      0.08127438836157441,
      0.31234707704000286,
      0.31234707704000286,
      0.26061069640293544,
      0.26061069640293544
    ],
    [
      0.29552422471475287,
      0.29552422471475287,
      0.26926671930999635,
      0.26926671930999635,
      0.21908636251598204,
      0.21908636251598204,
      0.1494513491505806,
      0.1494513491505806,
      0.06667134430868814,
      0.06667134430868814
    ],
    [
      0.2729250867779006,
      0.26280454451024665,
      0.26280454451024665,
      0.23319376459199048,
      0.23319376459199048,
      0.18629021092773426,
      0.18629021092773426,
      0.1255803694649046,
      0.1255803694649046,
      0.05566856711617366,
      0.05566856711617366
    ],
    [
      0.24914704581340277,
      0.24914704581340277,
      0.2334925365383548,
      0.2334925365383548,
      0.20316742672306592,
      0.20316742672306592,
      0.16007832854334622,
      0.16007832854334622,
      0.10693932599531843,
      0.10693932599531843,
      0.04717533638651183,
      0.04717533638651183
    ],
    [
      0.2325515532308739,
      0.22628318026289723,
      0.22628318026289723,
      0.2078160475368885,
      0.2078160475368885,
      0.17814598076194574,
      0.17814598076194574,
      0.13887351021978725,
      0.13887351021978725,
      0.09212149983772845,
      0.09212149983772845,
      0.04048400476531588,
      0.04048400476531588
    ],
    [
      0.2152638534631578,
      0.2152638534631578,
      0.2051984637212956,
      0.2051984637212956,
      0.18553839747793782,
      0.18553839747793782,
      0.15720316715819355,
      0.15720316715819355,
      0.12151857068790319,
      0.12151857068790319,
      0.08015808715976021,
      0.08015808715976021,
      0.03511946033175186,
      0.03511946033175186
    ],
    [
      0.2025782419255613,
      0.19843148532711158,
      0.19843148532711158,
      0.1861610000155622,
      0.1861610000155622,
      0.16626920581699392,
      0.16626920581699392,
      0.13957067792615432,
      0.13957067792615432,
      0.10715922046717194,
      0.10715922046717194,
      0.07036604748810812,
      0.07036604748810812,
      0.03075324199611727,
      0.03075324199611727
    ],
    [
      0.1894506104550685,
      0.1894506104550685,
      0.18260341504492358,
      0.18260341504492358,
      0.16915651939500254,
      0.16915651939500254,
      0.14959598881657674,
      0.14959598881657674,
      0.12462897125553388,
      0.12462897125553388,
      0.09515851168249279,
      0.09515851168249279,
      0.062253523938647894,
      0.062253523938647894,
      0.027152459411754096,
      0.027152459411754096
    ],
    [
      0.17944647035620653,
      0.17656270536699264,
      0.17656270536699264,
      0.16800410215645004,
      0.16800410215645004,
      0.15404576107681028,
      0.15404576107681028,
      0.13513636846852548,
      0.13513636846852548,
      0.11188384719340397,
      0.11188384719340397,
      0.08503614831717918,
      0.08503614831717918,
      0.0554595293739872,
      0.0554595293739872,
      0.02414830286854793,
      0.02414830286854793
    ],
    [
      0.1691423829631436,
      0.1691423829631436,
      0.16427648374583273,
      0.16427648374583273,
      0.15468467512626524,
      0.15468467512626524,
      0.14064291467065065,
      0.14064291467065065,
      0.12255520671147846,
      0.12255520671147846,
      0.10094204410628717,
      0.10094204410628717,
      0.07642573025488905,
      0.07642573025488905,
      0.0497145488949698,
      0.0497145488949698,
      0.02161601352648331,
      0.02161601352648331
    ],
    [
      0.1610544498487837,
      0.15896884339395434,
      0.15896884339395434,
      0.15276604206585967,
      0.15276604206585967,
      0.1426067021736066,
      0.1426067021736066,
      0.12875396253933621,
      0.12875396253933621,
      0.11156664554733399,
      0.11156664554733399,
      0.09149002162245,
      0.09149002162245,
      0.06904454273764123,
      0.06904454273764123,
      0.0448142267656996,
      0.0448142267656996,
      0.019461788229726478,
      0.019461788229726478
    ],
    [
      0.15275338713072584,
      0.15275338713072584,
      0.14917298647260374,
      0.14917298647260374,
      0.14209610931838204,
      0.14209610931838204,
      0.13168863844917664,
      0.13168863844917664,
      0.11819453196151841,
      0.11819453196151841,
      0.10193011981724044,
      0.10193011981724044,
      0.08327674157670475,
      0.08327674157670475,
      0.06267204833410907,
      0.06267204833410907,
      0.04060142980038694,
      0.04060142980038694,
      0.017614007139152118,
      0.017614007139152118
    ],
    [
      0.14608113364969041,
      0.14452440398997005,
      0.14452440398997005,
      0.13988739479107315,
      0.13988739479107315,
      0.13226893863333747,
      0.13226893863333747,
      0.12183141605372853,
      0.12183141605372853,
      0.10879729916714838,
      0.10879729916714838,
      0.09344442345603386,
      0.09344442345603386,
      0.0761001136283793,
      0.0761001136283793,
      0.057134425426857205,
      0.057134425426857205,
      0.036953789770852494,
      0.036953789770852494,
      0.016017228257774335,
      0.016017228257774335
    ],
    [
      0.13925187285563198,
      0.13925187285563198,
      0.13654149834601517,
      0.13654149834601517,
      0.13117350478706238,
      0.13117350478706238,
      0.12325237681051242,
      0.12325237681051242,
      0.11293229608053922,
      0.11293229608053922,
      0.10041414444288096,
      0.10041414444288096,
      0.08594160621706773,
      0.08594160621706773,
      0.06979646842452049,
      0.06979646842452049,
      0.052293335152683286,
      0.052293335152683286,
      0.03377490158481415,
      0.03377490158481415,
      0.0146279952982722,
      0.0146279952982722
    ],
    [
      0.13365457218610619,
      0.1324620394046966,
      0.1324620394046966,
      0.12890572218808216,
      0.12890572218808216,
      0.12304908430672953,
      0.12304908430672953,
      0.11499664022241136,
      0.11499664022241136,
      0.10489209146454141,
      0.10489209146454141,
      0.09291576606003515,
      0.09291576606003515,
      0.07928141177671895,
      0.07928141177671895,
      0.06423242140852585,
      0.06423242140852585,
      0.04803767173108467,
      0.04803767173108467,
      0.030988005856979445,
      0.030988005856979445,
      0.013411859487141771,
      0.013411859487141771
    ],
    [
      0.12793819534675216,
      0.12793819534675216,
      0.1258374563468283,
      0.1258374563468283,
      0.12167047292780339,
      0.12167047292780339,
      0.1155056680537256,
      0.1155056680537256,
      0.10744427011596563,
      0.10744427011596563,
      0.09761865210411388,
      0.09761865210411388,
      0.08619016153195327,
      0.08619016153195327,
      0.0733464814110803,
      0.0733464814110803,
      0.05929858491543678,
      0.05929858491543678,
      0.04427743881741981,
      0.04427743881741981,
      0.028531388628933663,
      0.028531388628933663,
      0.0123412297999872,
      0.0123412297999872
    ]
  ];
  exports2.binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
  const getCubicArcLength = (xs, ys, t) => {
    let z;
    let sum2;
    let correctedT;
    const n = 20;
    z = t / 2;
    sum2 = 0;
    for (let i = 0; i < n; i++) {
      correctedT = z * exports2.tValues[n][i] + z;
      sum2 += exports2.cValues[n][i] * BFunc(xs, ys, correctedT);
    }
    return z * sum2;
  };
  exports2.getCubicArcLength = getCubicArcLength;
  const getQuadraticArcLength = (xs, ys, t) => {
    if (t === void 0) {
      t = 1;
    }
    const ax = xs[0] - 2 * xs[1] + xs[2];
    const ay = ys[0] - 2 * ys[1] + ys[2];
    const bx = 2 * xs[1] - 2 * xs[0];
    const by = 2 * ys[1] - 2 * ys[0];
    const A = 4 * (ax * ax + ay * ay);
    const B = 4 * (ax * bx + ay * by);
    const C = bx * bx + by * by;
    if (A === 0) {
      return t * Math.sqrt(Math.pow(xs[2] - xs[0], 2) + Math.pow(ys[2] - ys[0], 2));
    }
    const b = B / (2 * A);
    const c = C / A;
    const u = t + b;
    const k = c - b * b;
    const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
    const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
    const term = b + Math.sqrt(b * b + k) !== 0 ? k * Math.log(Math.abs((u + uuk) / (b + bbk))) : 0;
    return Math.sqrt(A) / 2 * (u * uuk - b * bbk + term);
  };
  exports2.getQuadraticArcLength = getQuadraticArcLength;
  function BFunc(xs, ys, t) {
    const xbase = getDerivative(1, t, xs);
    const ybase = getDerivative(1, t, ys);
    const combined = xbase * xbase + ybase * ybase;
    return Math.sqrt(combined);
  }
  const getDerivative = (derivative, t, vs) => {
    const n = vs.length - 1;
    let _vs;
    let value;
    if (n === 0) {
      return 0;
    }
    if (derivative === 0) {
      value = 0;
      for (let k = 0; k <= n; k++) {
        value += exports2.binomialCoefficients[n][k] * Math.pow(1 - t, n - k) * Math.pow(t, k) * vs[k];
      }
      return value;
    } else {
      _vs = new Array(n);
      for (let k = 0; k < n; k++) {
        _vs[k] = n * (vs[k + 1] - vs[k]);
      }
      return getDerivative(derivative - 1, t, _vs);
    }
  };
  const t2length = (length, totalLength, func2) => {
    let error = 1;
    let t = length / totalLength;
    let step = (length - func2(t)) / totalLength;
    let numIterations = 0;
    while (error > 1e-3) {
      const increasedTLength = func2(t + step);
      const increasedTError = Math.abs(length - increasedTLength) / totalLength;
      if (increasedTError < error) {
        error = increasedTError;
        t += step;
      } else {
        const decreasedTLength = func2(t - step);
        const decreasedTError = Math.abs(length - decreasedTLength) / totalLength;
        if (decreasedTError < error) {
          error = decreasedTError;
          t -= step;
        } else {
          step /= 2;
        }
      }
      numIterations++;
      if (numIterations > 500) {
        break;
      }
    }
    return t;
  };
  exports2.t2length = t2length;
})(BezierFunctions);
Object.defineProperty(Path$1, "__esModule", { value: true });
Path$1.Path = void 0;
const Factory_1$t = Factory;
const Shape_1$d = Shape;
const Global_1$e = Global;
const BezierFunctions_1 = BezierFunctions;
class Path extends Shape_1$d.Shape {
  constructor(config) {
    super(config);
    this.dataArray = [];
    this.pathLength = 0;
    this._readDataAttribute();
    this.on("dataChange.konva", function() {
      this._readDataAttribute();
    });
  }
  _readDataAttribute() {
    this.dataArray = Path.parsePathData(this.data());
    this.pathLength = Path.getPathLength(this.dataArray);
  }
  _sceneFunc(context) {
    var ca = this.dataArray;
    context.beginPath();
    var isClosed = false;
    for (var n = 0; n < ca.length; n++) {
      var c = ca[n].command;
      var p2 = ca[n].points;
      switch (c) {
        case "L":
          context.lineTo(p2[0], p2[1]);
          break;
        case "M":
          context.moveTo(p2[0], p2[1]);
          break;
        case "C":
          context.bezierCurveTo(p2[0], p2[1], p2[2], p2[3], p2[4], p2[5]);
          break;
        case "Q":
          context.quadraticCurveTo(p2[0], p2[1], p2[2], p2[3]);
          break;
        case "A":
          var cx = p2[0], cy = p2[1], rx = p2[2], ry = p2[3], theta = p2[4], dTheta = p2[5], psi = p2[6], fs = p2[7];
          var r = rx > ry ? rx : ry;
          var scaleX = rx > ry ? 1 : rx / ry;
          var scaleY = rx > ry ? ry / rx : 1;
          context.translate(cx, cy);
          context.rotate(psi);
          context.scale(scaleX, scaleY);
          context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
          context.scale(1 / scaleX, 1 / scaleY);
          context.rotate(-psi);
          context.translate(-cx, -cy);
          break;
        case "z":
          isClosed = true;
          context.closePath();
          break;
      }
    }
    if (!isClosed && !this.hasFill()) {
      context.strokeShape(this);
    } else {
      context.fillStrokeShape(this);
    }
  }
  getSelfRect() {
    var points = [];
    this.dataArray.forEach(function(data) {
      if (data.command === "A") {
        var start = data.points[4];
        var dTheta = data.points[5];
        var end = data.points[4] + dTheta;
        var inc = Math.PI / 180;
        if (Math.abs(start - end) < inc) {
          inc = Math.abs(start - end);
        }
        if (dTheta < 0) {
          for (let t = start - inc; t > end; t -= inc) {
            const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
            points.push(point.x, point.y);
          }
        } else {
          for (let t = start + inc; t < end; t += inc) {
            const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
            points.push(point.x, point.y);
          }
        }
      } else if (data.command === "C") {
        for (let t = 0; t <= 1; t += 0.01) {
          const point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
          points.push(point.x, point.y);
        }
      } else {
        points = points.concat(data.points);
      }
    });
    var minX = points[0];
    var maxX = points[0];
    var minY = points[1];
    var maxY = points[1];
    var x, y;
    for (var i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      if (!isNaN(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (!isNaN(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  getLength() {
    return this.pathLength;
  }
  getPointAtLength(length) {
    return Path.getPointAtLengthOfDataArray(length, this.dataArray);
  }
  static getLineLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
  static getPathLength(dataArray) {
    let pathLength = 0;
    for (var i = 0; i < dataArray.length; ++i) {
      pathLength += dataArray[i].pathLength;
    }
    return pathLength;
  }
  static getPointAtLengthOfDataArray(length, dataArray) {
    var point, i = 0, ii = dataArray.length;
    if (!ii) {
      return null;
    }
    while (i < ii && length > dataArray[i].pathLength) {
      length -= dataArray[i].pathLength;
      ++i;
    }
    if (i === ii) {
      point = dataArray[i - 1].points.slice(-2);
      return {
        x: point[0],
        y: point[1]
      };
    }
    if (length < 0.01) {
      point = dataArray[i].points.slice(0, 2);
      return {
        x: point[0],
        y: point[1]
      };
    }
    var cp = dataArray[i];
    var p2 = cp.points;
    switch (cp.command) {
      case "L":
        return Path.getPointOnLine(length, cp.start.x, cp.start.y, p2[0], p2[1]);
      case "C":
        return Path.getPointOnCubicBezier((0, BezierFunctions_1.t2length)(length, Path.getPathLength(dataArray), (i2) => {
          return (0, BezierFunctions_1.getCubicArcLength)([cp.start.x, p2[0], p2[2], p2[4]], [cp.start.y, p2[1], p2[3], p2[5]], i2);
        }), cp.start.x, cp.start.y, p2[0], p2[1], p2[2], p2[3], p2[4], p2[5]);
      case "Q":
        return Path.getPointOnQuadraticBezier((0, BezierFunctions_1.t2length)(length, Path.getPathLength(dataArray), (i2) => {
          return (0, BezierFunctions_1.getQuadraticArcLength)([cp.start.x, p2[0], p2[2]], [cp.start.y, p2[1], p2[3]], i2);
        }), cp.start.x, cp.start.y, p2[0], p2[1], p2[2], p2[3]);
      case "A":
        var cx = p2[0], cy = p2[1], rx = p2[2], ry = p2[3], theta = p2[4], dTheta = p2[5], psi = p2[6];
        theta += dTheta * length / cp.pathLength;
        return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
    }
    return null;
  }
  static getPointOnLine(dist, P1x, P1y, P2x, P2y, fromX, fromY) {
    if (fromX === void 0) {
      fromX = P1x;
    }
    if (fromY === void 0) {
      fromY = P1y;
    }
    var m = (P2y - P1y) / (P2x - P1x + 1e-8);
    var run = Math.sqrt(dist * dist / (1 + m * m));
    if (P2x < P1x) {
      run *= -1;
    }
    var rise = m * run;
    var pt;
    if (P2x === P1x) {
      pt = {
        x: fromX,
        y: fromY + rise
      };
    } else if ((fromY - P1y) / (fromX - P1x + 1e-8) === m) {
      pt = {
        x: fromX + run,
        y: fromY + rise
      };
    } else {
      var ix, iy;
      var len = this.getLineLength(P1x, P1y, P2x, P2y);
      var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
      u = u / (len * len);
      ix = P1x + u * (P2x - P1x);
      iy = P1y + u * (P2y - P1y);
      var pRise = this.getLineLength(fromX, fromY, ix, iy);
      var pRun = Math.sqrt(dist * dist - pRise * pRise);
      run = Math.sqrt(pRun * pRun / (1 + m * m));
      if (P2x < P1x) {
        run *= -1;
      }
      rise = m * run;
      pt = {
        x: ix + run,
        y: iy + rise
      };
    }
    return pt;
  }
  static getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
    function CB1(t) {
      return t * t * t;
    }
    function CB2(t) {
      return 3 * t * t * (1 - t);
    }
    function CB3(t) {
      return 3 * t * (1 - t) * (1 - t);
    }
    function CB4(t) {
      return (1 - t) * (1 - t) * (1 - t);
    }
    var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
    var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
    return {
      x,
      y
    };
  }
  static getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
    function QB1(t) {
      return t * t;
    }
    function QB2(t) {
      return 2 * t * (1 - t);
    }
    function QB3(t) {
      return (1 - t) * (1 - t);
    }
    var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
    var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
    return {
      x,
      y
    };
  }
  static getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
    var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
    var pt = {
      x: rx * Math.cos(theta),
      y: ry * Math.sin(theta)
    };
    return {
      x: cx + (pt.x * cosPsi - pt.y * sinPsi),
      y: cy + (pt.x * sinPsi + pt.y * cosPsi)
    };
  }
  static parsePathData(data) {
    if (!data) {
      return [];
    }
    var cs = data;
    var cc = [
      "m",
      "M",
      "l",
      "L",
      "v",
      "V",
      "h",
      "H",
      "z",
      "Z",
      "c",
      "C",
      "q",
      "Q",
      "t",
      "T",
      "s",
      "S",
      "a",
      "A"
    ];
    cs = cs.replace(new RegExp(" ", "g"), ",");
    for (var n = 0; n < cc.length; n++) {
      cs = cs.replace(new RegExp(cc[n], "g"), "|" + cc[n]);
    }
    var arr = cs.split("|");
    var ca = [];
    var coords = [];
    var cpx = 0;
    var cpy = 0;
    var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
    var match;
    for (n = 1; n < arr.length; n++) {
      var str = arr[n];
      var c = str.charAt(0);
      str = str.slice(1);
      coords.length = 0;
      while (match = re.exec(str)) {
        coords.push(match[0]);
      }
      var p2 = [];
      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        if (coords[j] === "00") {
          p2.push(0, 0);
          continue;
        }
        var parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          p2.push(parsed);
        } else {
          p2.push(0);
        }
      }
      while (p2.length > 0) {
        if (isNaN(p2[0])) {
          break;
        }
        var cmd = "";
        var points = [];
        var startX = cpx, startY = cpy;
        var prevCmd, ctlPtx, ctlPty;
        var rx, ry, psi, fa, fs, x1, y1;
        switch (c) {
          case "l":
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "L";
            points.push(cpx, cpy);
            break;
          case "L":
            cpx = p2.shift();
            cpy = p2.shift();
            points.push(cpx, cpy);
            break;
          case "m":
            var dx = p2.shift();
            var dy = p2.shift();
            cpx += dx;
            cpy += dy;
            cmd = "M";
            if (ca.length > 2 && ca[ca.length - 1].command === "z") {
              for (var idx = ca.length - 2; idx >= 0; idx--) {
                if (ca[idx].command === "M") {
                  cpx = ca[idx].points[0] + dx;
                  cpy = ca[idx].points[1] + dy;
                  break;
                }
              }
            }
            points.push(cpx, cpy);
            c = "l";
            break;
          case "M":
            cpx = p2.shift();
            cpy = p2.shift();
            cmd = "M";
            points.push(cpx, cpy);
            c = "L";
            break;
          case "h":
            cpx += p2.shift();
            cmd = "L";
            points.push(cpx, cpy);
            break;
          case "H":
            cpx = p2.shift();
            cmd = "L";
            points.push(cpx, cpy);
            break;
          case "v":
            cpy += p2.shift();
            cmd = "L";
            points.push(cpx, cpy);
            break;
          case "V":
            cpy = p2.shift();
            cmd = "L";
            points.push(cpx, cpy);
            break;
          case "C":
            points.push(p2.shift(), p2.shift(), p2.shift(), p2.shift());
            cpx = p2.shift();
            cpy = p2.shift();
            points.push(cpx, cpy);
            break;
          case "c":
            points.push(cpx + p2.shift(), cpy + p2.shift(), cpx + p2.shift(), cpy + p2.shift());
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "C";
            points.push(cpx, cpy);
            break;
          case "S":
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === "C") {
              ctlPtx = cpx + (cpx - prevCmd.points[2]);
              ctlPty = cpy + (cpy - prevCmd.points[3]);
            }
            points.push(ctlPtx, ctlPty, p2.shift(), p2.shift());
            cpx = p2.shift();
            cpy = p2.shift();
            cmd = "C";
            points.push(cpx, cpy);
            break;
          case "s":
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === "C") {
              ctlPtx = cpx + (cpx - prevCmd.points[2]);
              ctlPty = cpy + (cpy - prevCmd.points[3]);
            }
            points.push(ctlPtx, ctlPty, cpx + p2.shift(), cpy + p2.shift());
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "C";
            points.push(cpx, cpy);
            break;
          case "Q":
            points.push(p2.shift(), p2.shift());
            cpx = p2.shift();
            cpy = p2.shift();
            points.push(cpx, cpy);
            break;
          case "q":
            points.push(cpx + p2.shift(), cpy + p2.shift());
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "Q";
            points.push(cpx, cpy);
            break;
          case "T":
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === "Q") {
              ctlPtx = cpx + (cpx - prevCmd.points[0]);
              ctlPty = cpy + (cpy - prevCmd.points[1]);
            }
            cpx = p2.shift();
            cpy = p2.shift();
            cmd = "Q";
            points.push(ctlPtx, ctlPty, cpx, cpy);
            break;
          case "t":
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === "Q") {
              ctlPtx = cpx + (cpx - prevCmd.points[0]);
              ctlPty = cpy + (cpy - prevCmd.points[1]);
            }
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "Q";
            points.push(ctlPtx, ctlPty, cpx, cpy);
            break;
          case "A":
            rx = p2.shift();
            ry = p2.shift();
            psi = p2.shift();
            fa = p2.shift();
            fs = p2.shift();
            x1 = cpx;
            y1 = cpy;
            cpx = p2.shift();
            cpy = p2.shift();
            cmd = "A";
            points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
            break;
          case "a":
            rx = p2.shift();
            ry = p2.shift();
            psi = p2.shift();
            fa = p2.shift();
            fs = p2.shift();
            x1 = cpx;
            y1 = cpy;
            cpx += p2.shift();
            cpy += p2.shift();
            cmd = "A";
            points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
            break;
        }
        ca.push({
          command: cmd || c,
          points,
          start: {
            x: startX,
            y: startY
          },
          pathLength: this.calcLength(startX, startY, cmd || c, points)
        });
      }
      if (c === "z" || c === "Z") {
        ca.push({
          command: "z",
          points: [],
          start: void 0,
          pathLength: 0
        });
      }
    }
    return ca;
  }
  static calcLength(x, y, cmd, points) {
    var len, p1, p2, t;
    var path = Path;
    switch (cmd) {
      case "L":
        return path.getLineLength(x, y, points[0], points[1]);
      case "C":
        return (0, BezierFunctions_1.getCubicArcLength)([x, points[0], points[2], points[4]], [y, points[1], points[3], points[5]], 1);
      case "Q":
        return (0, BezierFunctions_1.getQuadraticArcLength)([x, points[0], points[2]], [y, points[1], points[3]], 1);
      case "A":
        len = 0;
        var start = points[4];
        var dTheta = points[5];
        var end = points[4] + dTheta;
        var inc = Math.PI / 180;
        if (Math.abs(start - end) < inc) {
          inc = Math.abs(start - end);
        }
        p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
        if (dTheta < 0) {
          for (t = start - inc; t > end; t -= inc) {
            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }
        } else {
          for (t = start + inc; t < end; t += inc) {
            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }
        }
        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
        return len;
    }
    return 0;
  }
  static convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
    var psi = psiDeg * (Math.PI / 180);
    var xp = Math.cos(psi) * (x1 - x2) / 2 + Math.sin(psi) * (y1 - y2) / 2;
    var yp = -1 * Math.sin(psi) * (x1 - x2) / 2 + Math.cos(psi) * (y1 - y2) / 2;
    var lambda = xp * xp / (rx * rx) + yp * yp / (ry * ry);
    if (lambda > 1) {
      rx *= Math.sqrt(lambda);
      ry *= Math.sqrt(lambda);
    }
    var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) / (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
    if (fa === fs) {
      f *= -1;
    }
    if (isNaN(f)) {
      f = 0;
    }
    var cxp = f * rx * yp / ry;
    var cyp = f * -ry * xp / rx;
    var cx = (x1 + x2) / 2 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
    var cy = (y1 + y2) / 2 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
    var vMag = function(v2) {
      return Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    };
    var vRatio = function(u2, v2) {
      return (u2[0] * v2[0] + u2[1] * v2[1]) / (vMag(u2) * vMag(v2));
    };
    var vAngle = function(u2, v2) {
      return (u2[0] * v2[1] < u2[1] * v2[0] ? -1 : 1) * Math.acos(vRatio(u2, v2));
    };
    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    var dTheta = vAngle(u, v);
    if (vRatio(u, v) <= -1) {
      dTheta = Math.PI;
    }
    if (vRatio(u, v) >= 1) {
      dTheta = 0;
    }
    if (fs === 0 && dTheta > 0) {
      dTheta = dTheta - 2 * Math.PI;
    }
    if (fs === 1 && dTheta < 0) {
      dTheta = dTheta + 2 * Math.PI;
    }
    return [cx, cy, rx, ry, theta, dTheta, psi, fs];
  }
}
Path$1.Path = Path;
Path.prototype.className = "Path";
Path.prototype._attrsAffectingSize = ["data"];
(0, Global_1$e._registerNode)(Path);
Factory_1$t.Factory.addGetterSetter(Path, "data");
Object.defineProperty(Arrow$1, "__esModule", { value: true });
Arrow$1.Arrow = void 0;
const Factory_1$s = Factory;
const Line_1$1 = Line$1;
const Validators_1$s = Validators;
const Global_1$d = Global;
const Path_1$2 = Path$1;
class Arrow extends Line_1$1.Line {
  _sceneFunc(ctx) {
    super._sceneFunc(ctx);
    var PI2 = Math.PI * 2;
    var points = this.points();
    var tp = points;
    var fromTension = this.tension() !== 0 && points.length > 4;
    if (fromTension) {
      tp = this.getTensionPoints();
    }
    var length = this.pointerLength();
    var n = points.length;
    var dx, dy;
    if (fromTension) {
      const lp = [
        tp[tp.length - 4],
        tp[tp.length - 3],
        tp[tp.length - 2],
        tp[tp.length - 1],
        points[n - 2],
        points[n - 1]
      ];
      const lastLength = Path_1$2.Path.calcLength(tp[tp.length - 4], tp[tp.length - 3], "C", lp);
      const previous = Path_1$2.Path.getPointOnQuadraticBezier(Math.min(1, 1 - length / lastLength), lp[0], lp[1], lp[2], lp[3], lp[4], lp[5]);
      dx = points[n - 2] - previous.x;
      dy = points[n - 1] - previous.y;
    } else {
      dx = points[n - 2] - points[n - 4];
      dy = points[n - 1] - points[n - 3];
    }
    var radians = (Math.atan2(dy, dx) + PI2) % PI2;
    var width = this.pointerWidth();
    if (this.pointerAtEnding()) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(points[n - 2], points[n - 1]);
      ctx.rotate(radians);
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();
      this.__fillStroke(ctx);
    }
    if (this.pointerAtBeginning()) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(points[0], points[1]);
      if (fromTension) {
        dx = (tp[0] + tp[2]) / 2 - points[0];
        dy = (tp[1] + tp[3]) / 2 - points[1];
      } else {
        dx = points[2] - points[0];
        dy = points[3] - points[1];
      }
      ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();
      this.__fillStroke(ctx);
    }
  }
  __fillStroke(ctx) {
    var isDashEnabled = this.dashEnabled();
    if (isDashEnabled) {
      this.attrs.dashEnabled = false;
      ctx.setLineDash([]);
    }
    ctx.fillStrokeShape(this);
    if (isDashEnabled) {
      this.attrs.dashEnabled = true;
    }
  }
  getSelfRect() {
    const lineRect = super.getSelfRect();
    const offset = this.pointerWidth() / 2;
    return {
      x: lineRect.x - offset,
      y: lineRect.y - offset,
      width: lineRect.width + offset * 2,
      height: lineRect.height + offset * 2
    };
  }
}
Arrow$1.Arrow = Arrow;
Arrow.prototype.className = "Arrow";
(0, Global_1$d._registerNode)(Arrow);
Factory_1$s.Factory.addGetterSetter(Arrow, "pointerLength", 10, (0, Validators_1$s.getNumberValidator)());
Factory_1$s.Factory.addGetterSetter(Arrow, "pointerWidth", 10, (0, Validators_1$s.getNumberValidator)());
Factory_1$s.Factory.addGetterSetter(Arrow, "pointerAtBeginning", false);
Factory_1$s.Factory.addGetterSetter(Arrow, "pointerAtEnding", true);
var Circle$1 = {};
Object.defineProperty(Circle$1, "__esModule", { value: true });
Circle$1.Circle = void 0;
const Factory_1$r = Factory;
const Shape_1$c = Shape;
const Validators_1$r = Validators;
const Global_1$c = Global;
class Circle extends Shape_1$c.Shape {
  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.attrs.radius || 0, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radius() * 2;
  }
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width) {
    if (this.radius() !== width / 2) {
      this.radius(width / 2);
    }
  }
  setHeight(height) {
    if (this.radius() !== height / 2) {
      this.radius(height / 2);
    }
  }
}
Circle$1.Circle = Circle;
Circle.prototype._centroid = true;
Circle.prototype.className = "Circle";
Circle.prototype._attrsAffectingSize = ["radius"];
(0, Global_1$c._registerNode)(Circle);
Factory_1$r.Factory.addGetterSetter(Circle, "radius", 0, (0, Validators_1$r.getNumberValidator)());
var Ellipse$1 = {};
Object.defineProperty(Ellipse$1, "__esModule", { value: true });
Ellipse$1.Ellipse = void 0;
const Factory_1$q = Factory;
const Shape_1$b = Shape;
const Validators_1$q = Validators;
const Global_1$b = Global;
class Ellipse extends Shape_1$b.Shape {
  _sceneFunc(context) {
    var rx = this.radiusX(), ry = this.radiusY();
    context.beginPath();
    context.save();
    if (rx !== ry) {
      context.scale(1, ry / rx);
    }
    context.arc(0, 0, rx, 0, Math.PI * 2, false);
    context.restore();
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radiusX() * 2;
  }
  getHeight() {
    return this.radiusY() * 2;
  }
  setWidth(width) {
    this.radiusX(width / 2);
  }
  setHeight(height) {
    this.radiusY(height / 2);
  }
}
Ellipse$1.Ellipse = Ellipse;
Ellipse.prototype.className = "Ellipse";
Ellipse.prototype._centroid = true;
Ellipse.prototype._attrsAffectingSize = ["radiusX", "radiusY"];
(0, Global_1$b._registerNode)(Ellipse);
Factory_1$q.Factory.addComponentsGetterSetter(Ellipse, "radius", ["x", "y"]);
Factory_1$q.Factory.addGetterSetter(Ellipse, "radiusX", 0, (0, Validators_1$q.getNumberValidator)());
Factory_1$q.Factory.addGetterSetter(Ellipse, "radiusY", 0, (0, Validators_1$q.getNumberValidator)());
var Image$2 = {};
Object.defineProperty(Image$2, "__esModule", { value: true });
Image$2.Image = void 0;
const Util_1$7 = Util;
const Factory_1$p = Factory;
const Shape_1$a = Shape;
const Global_1$a = Global;
const Validators_1$p = Validators;
let Image$1 = class Image2 extends Shape_1$a.Shape {
  constructor(attrs) {
    super(attrs);
    this.on("imageChange.konva", () => {
      this._setImageLoad();
    });
    this._setImageLoad();
  }
  _setImageLoad() {
    const image = this.image();
    if (image && image.complete) {
      return;
    }
    if (image && image.readyState === 4) {
      return;
    }
    if (image && image["addEventListener"]) {
      image["addEventListener"]("load", () => {
        this._requestDraw();
      });
    }
  }
  _useBufferCanvas() {
    return super._useBufferCanvas(true);
  }
  _sceneFunc(context) {
    const width = this.getWidth();
    const height = this.getHeight();
    const cornerRadius = this.cornerRadius();
    const image = this.attrs.image;
    let params;
    if (image) {
      const cropWidth = this.attrs.cropWidth;
      const cropHeight = this.attrs.cropHeight;
      if (cropWidth && cropHeight) {
        params = [
          image,
          this.cropX(),
          this.cropY(),
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height
        ];
      } else {
        params = [image, 0, 0, width, height];
      }
    }
    if (this.hasFill() || this.hasStroke() || cornerRadius) {
      context.beginPath();
      cornerRadius ? Util_1$7.Util.drawRoundedRectPath(context, width, height, cornerRadius) : context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    }
    if (image) {
      if (cornerRadius) {
        context.clip();
      }
      context.drawImage.apply(context, params);
    }
  }
  _hitFunc(context) {
    var width = this.width(), height = this.height(), cornerRadius = this.cornerRadius();
    context.beginPath();
    if (!cornerRadius) {
      context.rect(0, 0, width, height);
    } else {
      Util_1$7.Util.drawRoundedRectPath(context, width, height, cornerRadius);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    var _a, _b;
    return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.width;
  }
  getHeight() {
    var _a, _b;
    return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.height;
  }
  static fromURL(url, callback, onError = null) {
    var img = Util_1$7.Util.createImageElement();
    img.onload = function() {
      var image = new Image2({
        image: img
      });
      callback(image);
    };
    img.onerror = onError;
    img.crossOrigin = "Anonymous";
    img.src = url;
  }
};
Image$2.Image = Image$1;
Image$1.prototype.className = "Image";
(0, Global_1$a._registerNode)(Image$1);
Factory_1$p.Factory.addGetterSetter(Image$1, "cornerRadius", 0, (0, Validators_1$p.getNumberOrArrayOfNumbersValidator)(4));
Factory_1$p.Factory.addGetterSetter(Image$1, "image");
Factory_1$p.Factory.addComponentsGetterSetter(Image$1, "crop", ["x", "y", "width", "height"]);
Factory_1$p.Factory.addGetterSetter(Image$1, "cropX", 0, (0, Validators_1$p.getNumberValidator)());
Factory_1$p.Factory.addGetterSetter(Image$1, "cropY", 0, (0, Validators_1$p.getNumberValidator)());
Factory_1$p.Factory.addGetterSetter(Image$1, "cropWidth", 0, (0, Validators_1$p.getNumberValidator)());
Factory_1$p.Factory.addGetterSetter(Image$1, "cropHeight", 0, (0, Validators_1$p.getNumberValidator)());
var Label$1 = {};
Object.defineProperty(Label$1, "__esModule", { value: true });
Label$1.Tag = Label$1.Label = void 0;
const Factory_1$o = Factory;
const Shape_1$9 = Shape;
const Group_1$1 = Group$1;
const Validators_1$o = Validators;
const Global_1$9 = Global;
var ATTR_CHANGE_LIST$2 = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "padding",
  "lineHeight",
  "text",
  "width",
  "height",
  "pointerDirection",
  "pointerWidth",
  "pointerHeight"
], CHANGE_KONVA$1 = "Change.konva", NONE$1 = "none", UP = "up", RIGHT$1 = "right", DOWN = "down", LEFT$1 = "left", attrChangeListLen$1 = ATTR_CHANGE_LIST$2.length;
class Label extends Group_1$1.Group {
  constructor(config) {
    super(config);
    this.on("add.konva", function(evt) {
      this._addListeners(evt.child);
      this._sync();
    });
  }
  getText() {
    return this.find("Text")[0];
  }
  getTag() {
    return this.find("Tag")[0];
  }
  _addListeners(text) {
    var that = this, n;
    var func2 = function() {
      that._sync();
    };
    for (n = 0; n < attrChangeListLen$1; n++) {
      text.on(ATTR_CHANGE_LIST$2[n] + CHANGE_KONVA$1, func2);
    }
  }
  getWidth() {
    return this.getText().width();
  }
  getHeight() {
    return this.getText().height();
  }
  _sync() {
    var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
    if (text && tag) {
      width = text.width();
      height = text.height();
      pointerDirection = tag.pointerDirection();
      pointerWidth = tag.pointerWidth();
      pointerHeight = tag.pointerHeight();
      x = 0;
      y = 0;
      switch (pointerDirection) {
        case UP:
          x = width / 2;
          y = -1 * pointerHeight;
          break;
        case RIGHT$1:
          x = width + pointerWidth;
          y = height / 2;
          break;
        case DOWN:
          x = width / 2;
          y = height + pointerHeight;
          break;
        case LEFT$1:
          x = -1 * pointerWidth;
          y = height / 2;
          break;
      }
      tag.setAttrs({
        x: -1 * x,
        y: -1 * y,
        width,
        height
      });
      text.setAttrs({
        x: -1 * x,
        y: -1 * y
      });
    }
  }
}
Label$1.Label = Label;
Label.prototype.className = "Label";
(0, Global_1$9._registerNode)(Label);
class Tag extends Shape_1$9.Shape {
  _sceneFunc(context) {
    var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = this.cornerRadius();
    let topLeft = 0;
    let topRight = 0;
    let bottomLeft = 0;
    let bottomRight = 0;
    if (typeof cornerRadius === "number") {
      topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
    } else {
      topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
      topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
      bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
      bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
    }
    context.beginPath();
    context.moveTo(topLeft, 0);
    if (pointerDirection === UP) {
      context.lineTo((width - pointerWidth) / 2, 0);
      context.lineTo(width / 2, -1 * pointerHeight);
      context.lineTo((width + pointerWidth) / 2, 0);
    }
    context.lineTo(width - topRight, 0);
    context.arc(width - topRight, topRight, topRight, Math.PI * 3 / 2, 0, false);
    if (pointerDirection === RIGHT$1) {
      context.lineTo(width, (height - pointerHeight) / 2);
      context.lineTo(width + pointerWidth, height / 2);
      context.lineTo(width, (height + pointerHeight) / 2);
    }
    context.lineTo(width, height - bottomRight);
    context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
    if (pointerDirection === DOWN) {
      context.lineTo((width + pointerWidth) / 2, height);
      context.lineTo(width / 2, height + pointerHeight);
      context.lineTo((width - pointerWidth) / 2, height);
    }
    context.lineTo(bottomLeft, height);
    context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
    if (pointerDirection === LEFT$1) {
      context.lineTo(0, (height + pointerHeight) / 2);
      context.lineTo(-1 * pointerWidth, height / 2);
      context.lineTo(0, (height - pointerHeight) / 2);
    }
    context.lineTo(0, topLeft);
    context.arc(topLeft, topLeft, topLeft, Math.PI, Math.PI * 3 / 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getSelfRect() {
    var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
    if (direction === UP) {
      y -= pointerHeight;
      height += pointerHeight;
    } else if (direction === DOWN) {
      height += pointerHeight;
    } else if (direction === LEFT$1) {
      x -= pointerWidth * 1.5;
      width += pointerWidth;
    } else if (direction === RIGHT$1) {
      width += pointerWidth * 1.5;
    }
    return {
      x,
      y,
      width,
      height
    };
  }
}
Label$1.Tag = Tag;
Tag.prototype.className = "Tag";
(0, Global_1$9._registerNode)(Tag);
Factory_1$o.Factory.addGetterSetter(Tag, "pointerDirection", NONE$1);
Factory_1$o.Factory.addGetterSetter(Tag, "pointerWidth", 0, (0, Validators_1$o.getNumberValidator)());
Factory_1$o.Factory.addGetterSetter(Tag, "pointerHeight", 0, (0, Validators_1$o.getNumberValidator)());
Factory_1$o.Factory.addGetterSetter(Tag, "cornerRadius", 0, (0, Validators_1$o.getNumberOrArrayOfNumbersValidator)(4));
var Rect$1 = {};
Object.defineProperty(Rect$1, "__esModule", { value: true });
Rect$1.Rect = void 0;
const Factory_1$n = Factory;
const Shape_1$8 = Shape;
const Global_1$8 = Global;
const Util_1$6 = Util;
const Validators_1$n = Validators;
class Rect extends Shape_1$8.Shape {
  _sceneFunc(context) {
    var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
    context.beginPath();
    if (!cornerRadius) {
      context.rect(0, 0, width, height);
    } else {
      Util_1$6.Util.drawRoundedRectPath(context, width, height, cornerRadius);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
}
Rect$1.Rect = Rect;
Rect.prototype.className = "Rect";
(0, Global_1$8._registerNode)(Rect);
Factory_1$n.Factory.addGetterSetter(Rect, "cornerRadius", 0, (0, Validators_1$n.getNumberOrArrayOfNumbersValidator)(4));
var RegularPolygon$1 = {};
Object.defineProperty(RegularPolygon$1, "__esModule", { value: true });
RegularPolygon$1.RegularPolygon = void 0;
const Factory_1$m = Factory;
const Shape_1$7 = Shape;
const Validators_1$m = Validators;
const Global_1$7 = Global;
class RegularPolygon extends Shape_1$7.Shape {
  _sceneFunc(context) {
    const points = this._getPoints();
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var n = 1; n < points.length; n++) {
      context.lineTo(points[n].x, points[n].y);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
  _getPoints() {
    const sides = this.attrs.sides;
    const radius = this.attrs.radius || 0;
    const points = [];
    for (var n = 0; n < sides; n++) {
      points.push({
        x: radius * Math.sin(n * 2 * Math.PI / sides),
        y: -1 * radius * Math.cos(n * 2 * Math.PI / sides)
      });
    }
    return points;
  }
  getSelfRect() {
    const points = this._getPoints();
    var minX = points[0].x;
    var maxX = points[0].y;
    var minY = points[0].x;
    var maxY = points[0].y;
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  getWidth() {
    return this.radius() * 2;
  }
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width) {
    this.radius(width / 2);
  }
  setHeight(height) {
    this.radius(height / 2);
  }
}
RegularPolygon$1.RegularPolygon = RegularPolygon;
RegularPolygon.prototype.className = "RegularPolygon";
RegularPolygon.prototype._centroid = true;
RegularPolygon.prototype._attrsAffectingSize = ["radius"];
(0, Global_1$7._registerNode)(RegularPolygon);
Factory_1$m.Factory.addGetterSetter(RegularPolygon, "radius", 0, (0, Validators_1$m.getNumberValidator)());
Factory_1$m.Factory.addGetterSetter(RegularPolygon, "sides", 0, (0, Validators_1$m.getNumberValidator)());
var Ring$1 = {};
Object.defineProperty(Ring$1, "__esModule", { value: true });
Ring$1.Ring = void 0;
const Factory_1$l = Factory;
const Shape_1$6 = Shape;
const Validators_1$l = Validators;
const Global_1$6 = Global;
var PIx2 = Math.PI * 2;
class Ring extends Shape_1$6.Shape {
  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
    context.moveTo(this.outerRadius(), 0);
    context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width) {
    this.outerRadius(width / 2);
  }
  setHeight(height) {
    this.outerRadius(height / 2);
  }
}
Ring$1.Ring = Ring;
Ring.prototype.className = "Ring";
Ring.prototype._centroid = true;
Ring.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"];
(0, Global_1$6._registerNode)(Ring);
Factory_1$l.Factory.addGetterSetter(Ring, "innerRadius", 0, (0, Validators_1$l.getNumberValidator)());
Factory_1$l.Factory.addGetterSetter(Ring, "outerRadius", 0, (0, Validators_1$l.getNumberValidator)());
var Sprite$1 = {};
Object.defineProperty(Sprite$1, "__esModule", { value: true });
Sprite$1.Sprite = void 0;
const Factory_1$k = Factory;
const Shape_1$5 = Shape;
const Animation_1 = Animation$1;
const Validators_1$k = Validators;
const Global_1$5 = Global;
class Sprite extends Shape_1$5.Shape {
  constructor(config) {
    super(config);
    this._updated = true;
    this.anim = new Animation_1.Animation(() => {
      var updated = this._updated;
      this._updated = false;
      return updated;
    });
    this.on("animationChange.konva", function() {
      this.frameIndex(0);
    });
    this.on("frameIndexChange.konva", function() {
      this._updated = true;
    });
    this.on("frameRateChange.konva", function() {
      if (!this.anim.isRunning()) {
        return;
      }
      clearInterval(this.interval);
      this._setInterval();
    });
  }
  _sceneFunc(context) {
    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set2 = this.animations()[anim], offsets = this.frameOffsets(), x = set2[ix4 + 0], y = set2[ix4 + 1], width = set2[ix4 + 2], height = set2[ix4 + 3], image = this.image();
    if (this.hasFill() || this.hasStroke()) {
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    }
    if (image) {
      if (offsets) {
        var offset = offsets[anim], ix2 = index * 2;
        context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
      } else {
        context.drawImage(image, x, y, width, height, 0, 0, width, height);
      }
    }
  }
  _hitFunc(context) {
    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set2 = this.animations()[anim], offsets = this.frameOffsets(), width = set2[ix4 + 2], height = set2[ix4 + 3];
    context.beginPath();
    if (offsets) {
      var offset = offsets[anim];
      var ix2 = index * 2;
      context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
    } else {
      context.rect(0, 0, width, height);
    }
    context.closePath();
    context.fillShape(this);
  }
  _useBufferCanvas() {
    return super._useBufferCanvas(true);
  }
  _setInterval() {
    var that = this;
    this.interval = setInterval(function() {
      that._updateIndex();
    }, 1e3 / this.frameRate());
  }
  start() {
    if (this.isRunning()) {
      return;
    }
    var layer = this.getLayer();
    this.anim.setLayers(layer);
    this._setInterval();
    this.anim.start();
  }
  stop() {
    this.anim.stop();
    clearInterval(this.interval);
  }
  isRunning() {
    return this.anim.isRunning();
  }
  _updateIndex() {
    var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
    if (index < len - 1) {
      this.frameIndex(index + 1);
    } else {
      this.frameIndex(0);
    }
  }
}
Sprite$1.Sprite = Sprite;
Sprite.prototype.className = "Sprite";
(0, Global_1$5._registerNode)(Sprite);
Factory_1$k.Factory.addGetterSetter(Sprite, "animation");
Factory_1$k.Factory.addGetterSetter(Sprite, "animations");
Factory_1$k.Factory.addGetterSetter(Sprite, "frameOffsets");
Factory_1$k.Factory.addGetterSetter(Sprite, "image");
Factory_1$k.Factory.addGetterSetter(Sprite, "frameIndex", 0, (0, Validators_1$k.getNumberValidator)());
Factory_1$k.Factory.addGetterSetter(Sprite, "frameRate", 17, (0, Validators_1$k.getNumberValidator)());
Factory_1$k.Factory.backCompat(Sprite, {
  index: "frameIndex",
  getIndex: "getFrameIndex",
  setIndex: "setFrameIndex"
});
var Star$1 = {};
Object.defineProperty(Star$1, "__esModule", { value: true });
Star$1.Star = void 0;
const Factory_1$j = Factory;
const Shape_1$4 = Shape;
const Validators_1$j = Validators;
const Global_1$4 = Global;
class Star extends Shape_1$4.Shape {
  _sceneFunc(context) {
    var innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
    context.beginPath();
    context.moveTo(0, 0 - outerRadius);
    for (var n = 1; n < numPoints * 2; n++) {
      var radius = n % 2 === 0 ? outerRadius : innerRadius;
      var x = radius * Math.sin(n * Math.PI / numPoints);
      var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
      context.lineTo(x, y);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width) {
    this.outerRadius(width / 2);
  }
  setHeight(height) {
    this.outerRadius(height / 2);
  }
}
Star$1.Star = Star;
Star.prototype.className = "Star";
Star.prototype._centroid = true;
Star.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"];
(0, Global_1$4._registerNode)(Star);
Factory_1$j.Factory.addGetterSetter(Star, "numPoints", 5, (0, Validators_1$j.getNumberValidator)());
Factory_1$j.Factory.addGetterSetter(Star, "innerRadius", 0, (0, Validators_1$j.getNumberValidator)());
Factory_1$j.Factory.addGetterSetter(Star, "outerRadius", 0, (0, Validators_1$j.getNumberValidator)());
var Text$1 = {};
Object.defineProperty(Text$1, "__esModule", { value: true });
Text$1.Text = Text$1.stringToArray = void 0;
const Util_1$5 = Util;
const Factory_1$i = Factory;
const Shape_1$3 = Shape;
const Validators_1$i = Validators;
const Global_1$3 = Global;
function stringToArray(string2) {
  return Array.from(string2);
}
Text$1.stringToArray = stringToArray;
var AUTO = "auto", CENTER = "center", INHERIT = "inherit", JUSTIFY = "justify", CHANGE_KONVA = "Change.konva", CONTEXT_2D = "2d", DASH = "-", LEFT = "left", TEXT = "text", TEXT_UPPER = "Text", TOP = "top", BOTTOM = "bottom", MIDDLE = "middle", NORMAL$1 = "normal", PX_SPACE = "px ", SPACE = " ", RIGHT = "right", RTL = "rtl", WORD = "word", CHAR = "char", NONE = "none", ELLIPSIS = "…", ATTR_CHANGE_LIST$1 = [
  "direction",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontVariant",
  "padding",
  "align",
  "verticalAlign",
  "lineHeight",
  "text",
  "width",
  "height",
  "wrap",
  "ellipsis",
  "letterSpacing"
], attrChangeListLen = ATTR_CHANGE_LIST$1.length;
function normalizeFontFamily(fontFamily) {
  return fontFamily.split(",").map((family) => {
    family = family.trim();
    const hasSpace = family.indexOf(" ") >= 0;
    const hasQuotes = family.indexOf('"') >= 0 || family.indexOf("'") >= 0;
    if (hasSpace && !hasQuotes) {
      family = `"${family}"`;
    }
    return family;
  }).join(", ");
}
var dummyContext;
function getDummyContext() {
  if (dummyContext) {
    return dummyContext;
  }
  dummyContext = Util_1$5.Util.createCanvasElement().getContext(CONTEXT_2D);
  return dummyContext;
}
function _fillFunc$1(context) {
  context.fillText(this._partialText, this._partialTextX, this._partialTextY);
}
function _strokeFunc$1(context) {
  context.setAttr("miterLimit", 2);
  context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
}
function checkDefaultFill(config) {
  config = config || {};
  if (!config.fillLinearGradientColorStops && !config.fillRadialGradientColorStops && !config.fillPatternImage) {
    config.fill = config.fill || "black";
  }
  return config;
}
class Text extends Shape_1$3.Shape {
  constructor(config) {
    super(checkDefaultFill(config));
    this._partialTextX = 0;
    this._partialTextY = 0;
    for (var n = 0; n < attrChangeListLen; n++) {
      this.on(ATTR_CHANGE_LIST$1[n] + CHANGE_KONVA, this._setTextData);
    }
    this._setTextData();
  }
  _sceneFunc(context) {
    var textArr = this.textArr, textArrLen = textArr.length;
    if (!this.text()) {
      return;
    }
    var padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, verticalAlign = this.verticalAlign(), direction = this.direction(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), fill2 = this.fill(), textDecoration = this.textDecoration(), shouldUnderline = textDecoration.indexOf("underline") !== -1, shouldLineThrough = textDecoration.indexOf("line-through") !== -1, n;
    direction = direction === INHERIT ? context.direction : direction;
    var translateY = 0;
    var translateY = lineHeightPx / 2;
    var lineTranslateX = 0;
    var lineTranslateY = 0;
    if (direction === RTL) {
      context.setAttr("direction", direction);
    }
    context.setAttr("font", this._getContextFont());
    context.setAttr("textBaseline", MIDDLE);
    context.setAttr("textAlign", LEFT);
    if (verticalAlign === MIDDLE) {
      alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
    } else if (verticalAlign === BOTTOM) {
      alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
    }
    context.translate(padding, alignY + padding);
    for (n = 0; n < textArrLen; n++) {
      var lineTranslateX = 0;
      var lineTranslateY = 0;
      var obj = textArr[n], text = obj.text, width = obj.width, lastLine = obj.lastInParagraph, spacesNumber, oneWord, lineWidth;
      context.save();
      if (align === RIGHT) {
        lineTranslateX += totalWidth - width - padding * 2;
      } else if (align === CENTER) {
        lineTranslateX += (totalWidth - width - padding * 2) / 2;
      }
      if (shouldUnderline) {
        context.save();
        context.beginPath();
        context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
        spacesNumber = text.split(" ").length - 1;
        oneWord = spacesNumber === 0;
        lineWidth = align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;
        context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));
        context.lineWidth = fontSize / 15;
        const gradient = this._getLinearGradient();
        context.strokeStyle = gradient || fill2;
        context.stroke();
        context.restore();
      }
      if (shouldLineThrough) {
        context.save();
        context.beginPath();
        context.moveTo(lineTranslateX, translateY + lineTranslateY);
        spacesNumber = text.split(" ").length - 1;
        oneWord = spacesNumber === 0;
        lineWidth = align === JUSTIFY && lastLine && !oneWord ? totalWidth - padding * 2 : width;
        context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
        context.lineWidth = fontSize / 15;
        const gradient = this._getLinearGradient();
        context.strokeStyle = gradient || fill2;
        context.stroke();
        context.restore();
      }
      if (direction !== RTL && (letterSpacing !== 0 || align === JUSTIFY)) {
        spacesNumber = text.split(" ").length - 1;
        var array2 = stringToArray(text);
        for (var li = 0; li < array2.length; li++) {
          var letter = array2[li];
          if (letter === " " && !lastLine && align === JUSTIFY) {
            lineTranslateX += (totalWidth - padding * 2 - width) / spacesNumber;
          }
          this._partialTextX = lineTranslateX;
          this._partialTextY = translateY + lineTranslateY;
          this._partialText = letter;
          context.fillStrokeShape(this);
          lineTranslateX += this.measureSize(letter).width + letterSpacing;
        }
      } else {
        if (letterSpacing !== 0) {
          context.setAttr("letterSpacing", `${letterSpacing}px`);
        }
        this._partialTextX = lineTranslateX;
        this._partialTextY = translateY + lineTranslateY;
        this._partialText = text;
        context.fillStrokeShape(this);
      }
      context.restore();
      if (textArrLen > 1) {
        translateY += lineHeightPx;
      }
    }
  }
  _hitFunc(context) {
    var width = this.getWidth(), height = this.getHeight();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.fillStrokeShape(this);
  }
  setText(text) {
    var str = Util_1$5.Util._isString(text) ? text : text === null || text === void 0 ? "" : text + "";
    this._setAttr(TEXT, str);
    return this;
  }
  getWidth() {
    var isAuto = this.attrs.width === AUTO || this.attrs.width === void 0;
    return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
  }
  getHeight() {
    var isAuto = this.attrs.height === AUTO || this.attrs.height === void 0;
    return isAuto ? this.fontSize() * this.textArr.length * this.lineHeight() + this.padding() * 2 : this.attrs.height;
  }
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    Util_1$5.Util.warn("text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.");
    return this.textHeight;
  }
  measureSize(text) {
    var _context = getDummyContext(), fontSize = this.fontSize(), metrics;
    _context.save();
    _context.font = this._getContextFont();
    metrics = _context.measureText(text);
    _context.restore();
    return {
      width: metrics.width,
      height: fontSize
    };
  }
  _getContextFont() {
    return this.fontStyle() + SPACE + this.fontVariant() + SPACE + (this.fontSize() + PX_SPACE) + normalizeFontFamily(this.fontFamily());
  }
  _addTextLine(line) {
    const align = this.align();
    if (align === JUSTIFY) {
      line = line.trim();
    }
    var width = this._getTextWidth(line);
    return this.textArr.push({
      text: line,
      width,
      lastInParagraph: false
    });
  }
  _getTextWidth(text) {
    var letterSpacing = this.letterSpacing();
    var length = text.length;
    return getDummyContext().measureText(text).width + (length ? letterSpacing * (length - 1) : 0);
  }
  _setTextData() {
    var lines = this.text().split("\n"), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== void 0, fixedHeight = height !== AUTO && height !== void 0, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap2 = this.wrap(), shouldWrap = wrap2 !== NONE, wrapAtWord = wrap2 !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis();
    this.textArr = [];
    getDummyContext().font = this._getContextFont();
    var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
    for (var i = 0, max2 = lines.length; i < max2; ++i) {
      var line = lines[i];
      var lineWidth = this._getTextWidth(line);
      if (fixedWidth && lineWidth > maxWidth) {
        while (line.length > 0) {
          var low = 0, high = line.length, match = "", matchWidth = 0;
          while (low < high) {
            var mid = low + high >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr) + additionalWidth;
            if (substrWidth <= maxWidth) {
              low = mid + 1;
              match = substr;
              matchWidth = substrWidth;
            } else {
              high = mid;
            }
          }
          if (match) {
            if (wrapAtWord) {
              var wrapIndex;
              var nextChar = line[match.length];
              var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
              if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                wrapIndex = match.length;
              } else {
                wrapIndex = Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) + 1;
              }
              if (wrapIndex > 0) {
                low = wrapIndex;
                match = match.slice(0, low);
                matchWidth = this._getTextWidth(match);
              }
            }
            match = match.trimRight();
            this._addTextLine(match);
            textWidth = Math.max(textWidth, matchWidth);
            currentHeightPx += lineHeightPx;
            var shouldHandleEllipsis = this._shouldHandleEllipsis(currentHeightPx);
            if (shouldHandleEllipsis) {
              this._tryToAddEllipsisToLastLine();
              break;
            }
            line = line.slice(low);
            line = line.trimLeft();
            if (line.length > 0) {
              lineWidth = this._getTextWidth(line);
              if (lineWidth <= maxWidth) {
                this._addTextLine(line);
                currentHeightPx += lineHeightPx;
                textWidth = Math.max(textWidth, lineWidth);
                break;
              }
            }
          } else {
            break;
          }
        }
      } else {
        this._addTextLine(line);
        currentHeightPx += lineHeightPx;
        textWidth = Math.max(textWidth, lineWidth);
        if (this._shouldHandleEllipsis(currentHeightPx) && i < max2 - 1) {
          this._tryToAddEllipsisToLastLine();
        }
      }
      if (this.textArr[this.textArr.length - 1]) {
        this.textArr[this.textArr.length - 1].lastInParagraph = true;
      }
      if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
        break;
      }
    }
    this.textHeight = fontSize;
    this.textWidth = textWidth;
  }
  _shouldHandleEllipsis(currentHeightPx) {
    var fontSize = +this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, height = this.attrs.height, fixedHeight = height !== AUTO && height !== void 0, padding = this.padding(), maxHeightPx = height - padding * 2, wrap2 = this.wrap(), shouldWrap = wrap2 !== NONE;
    return !shouldWrap || fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx;
  }
  _tryToAddEllipsisToLastLine() {
    var width = this.attrs.width, fixedWidth = width !== AUTO && width !== void 0, padding = this.padding(), maxWidth = width - padding * 2, shouldAddEllipsis = this.ellipsis();
    var lastLine = this.textArr[this.textArr.length - 1];
    if (!lastLine || !shouldAddEllipsis) {
      return;
    }
    if (fixedWidth) {
      var haveSpace = this._getTextWidth(lastLine.text + ELLIPSIS) < maxWidth;
      if (!haveSpace) {
        lastLine.text = lastLine.text.slice(0, lastLine.text.length - 3);
      }
    }
    this.textArr.splice(this.textArr.length - 1, 1);
    this._addTextLine(lastLine.text + ELLIPSIS);
  }
  getStrokeScaleEnabled() {
    return true;
  }
  _useBufferCanvas() {
    const hasLine = this.textDecoration().indexOf("underline") !== -1 || this.textDecoration().indexOf("line-through") !== -1;
    const hasShadow = this.hasShadow();
    if (hasLine && hasShadow) {
      return true;
    }
    return super._useBufferCanvas();
  }
}
Text$1.Text = Text;
Text.prototype._fillFunc = _fillFunc$1;
Text.prototype._strokeFunc = _strokeFunc$1;
Text.prototype.className = TEXT_UPPER;
Text.prototype._attrsAffectingSize = [
  "text",
  "fontSize",
  "padding",
  "wrap",
  "lineHeight",
  "letterSpacing"
];
(0, Global_1$3._registerNode)(Text);
Factory_1$i.Factory.overWriteSetter(Text, "width", (0, Validators_1$i.getNumberOrAutoValidator)());
Factory_1$i.Factory.overWriteSetter(Text, "height", (0, Validators_1$i.getNumberOrAutoValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "direction", INHERIT);
Factory_1$i.Factory.addGetterSetter(Text, "fontFamily", "Arial");
Factory_1$i.Factory.addGetterSetter(Text, "fontSize", 12, (0, Validators_1$i.getNumberValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "fontStyle", NORMAL$1);
Factory_1$i.Factory.addGetterSetter(Text, "fontVariant", NORMAL$1);
Factory_1$i.Factory.addGetterSetter(Text, "padding", 0, (0, Validators_1$i.getNumberValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "align", LEFT);
Factory_1$i.Factory.addGetterSetter(Text, "verticalAlign", TOP);
Factory_1$i.Factory.addGetterSetter(Text, "lineHeight", 1, (0, Validators_1$i.getNumberValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "wrap", WORD);
Factory_1$i.Factory.addGetterSetter(Text, "ellipsis", false, (0, Validators_1$i.getBooleanValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "letterSpacing", 0, (0, Validators_1$i.getNumberValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "text", "", (0, Validators_1$i.getStringValidator)());
Factory_1$i.Factory.addGetterSetter(Text, "textDecoration", "");
var TextPath$1 = {};
Object.defineProperty(TextPath$1, "__esModule", { value: true });
TextPath$1.TextPath = void 0;
const Util_1$4 = Util;
const Factory_1$h = Factory;
const Shape_1$2 = Shape;
const Path_1$1 = Path$1;
const Text_1$1 = Text$1;
const Validators_1$h = Validators;
const Global_1$2 = Global;
var EMPTY_STRING = "", NORMAL = "normal";
function _fillFunc(context) {
  context.fillText(this.partialText, 0, 0);
}
function _strokeFunc(context) {
  context.strokeText(this.partialText, 0, 0);
}
class TextPath extends Shape_1$2.Shape {
  constructor(config) {
    super(config);
    this.dummyCanvas = Util_1$4.Util.createCanvasElement();
    this.dataArray = [];
    this._readDataAttribute();
    this.on("dataChange.konva", function() {
      this._readDataAttribute();
      this._setTextData();
    });
    this.on("textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva fontFamilyChange.konva", this._setTextData);
    this._setTextData();
  }
  _getTextPathLength() {
    return Path_1$1.Path.getPathLength(this.dataArray);
  }
  _getPointAtLength(length) {
    if (!this.attrs.data) {
      return null;
    }
    const totalLength = this.pathLength;
    if (length - 1 > totalLength) {
      return null;
    }
    return Path_1$1.Path.getPointAtLengthOfDataArray(length, this.dataArray);
  }
  _readDataAttribute() {
    this.dataArray = Path_1$1.Path.parsePathData(this.attrs.data);
    this.pathLength = this._getTextPathLength();
  }
  _sceneFunc(context) {
    context.setAttr("font", this._getContextFont());
    context.setAttr("textBaseline", this.textBaseline());
    context.setAttr("textAlign", "left");
    context.save();
    var textDecoration = this.textDecoration();
    var fill2 = this.fill();
    var fontSize = this.fontSize();
    var glyphInfo = this.glyphInfo;
    if (textDecoration === "underline") {
      context.beginPath();
    }
    for (var i = 0; i < glyphInfo.length; i++) {
      context.save();
      var p0 = glyphInfo[i].p0;
      context.translate(p0.x, p0.y);
      context.rotate(glyphInfo[i].rotation);
      this.partialText = glyphInfo[i].text;
      context.fillStrokeShape(this);
      if (textDecoration === "underline") {
        if (i === 0) {
          context.moveTo(0, fontSize / 2 + 1);
        }
        context.lineTo(fontSize, fontSize / 2 + 1);
      }
      context.restore();
    }
    if (textDecoration === "underline") {
      context.strokeStyle = fill2;
      context.lineWidth = fontSize / 20;
      context.stroke();
    }
    context.restore();
  }
  _hitFunc(context) {
    context.beginPath();
    var glyphInfo = this.glyphInfo;
    if (glyphInfo.length >= 1) {
      var p0 = glyphInfo[0].p0;
      context.moveTo(p0.x, p0.y);
    }
    for (var i = 0; i < glyphInfo.length; i++) {
      var p1 = glyphInfo[i].p1;
      context.lineTo(p1.x, p1.y);
    }
    context.setAttr("lineWidth", this.fontSize());
    context.setAttr("strokeStyle", this.colorKey);
    context.stroke();
  }
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    Util_1$4.Util.warn("text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.");
    return this.textHeight;
  }
  setText(text) {
    return Text_1$1.Text.prototype.setText.call(this, text);
  }
  _getContextFont() {
    return Text_1$1.Text.prototype._getContextFont.call(this);
  }
  _getTextSize(text) {
    var dummyCanvas = this.dummyCanvas;
    var _context = dummyCanvas.getContext("2d");
    _context.save();
    _context.font = this._getContextFont();
    var metrics = _context.measureText(text);
    _context.restore();
    return {
      width: metrics.width,
      height: parseInt(`${this.fontSize()}`, 10)
    };
  }
  _setTextData() {
    const { width, height } = this._getTextSize(this.attrs.text);
    this.textWidth = width;
    this.textHeight = height;
    this.glyphInfo = [];
    if (!this.attrs.data) {
      return null;
    }
    const letterSpacing = this.letterSpacing();
    const align = this.align();
    const kerningFunc = this.kerningFunc();
    const textWidth = Math.max(this.textWidth + ((this.attrs.text || "").length - 1) * letterSpacing, 0);
    let offset = 0;
    if (align === "center") {
      offset = Math.max(0, this.pathLength / 2 - textWidth / 2);
    }
    if (align === "right") {
      offset = Math.max(0, this.pathLength - textWidth);
    }
    const charArr = (0, Text_1$1.stringToArray)(this.text());
    let offsetToGlyph = offset;
    for (var i = 0; i < charArr.length; i++) {
      const charStartPoint = this._getPointAtLength(offsetToGlyph);
      if (!charStartPoint)
        return;
      let glyphWidth = this._getTextSize(charArr[i]).width + letterSpacing;
      if (charArr[i] === " " && align === "justify") {
        const numberOfSpaces = this.text().split(" ").length - 1;
        glyphWidth += (this.pathLength - textWidth) / numberOfSpaces;
      }
      const charEndPoint = this._getPointAtLength(offsetToGlyph + glyphWidth);
      if (!charEndPoint)
        return;
      const width2 = Path_1$1.Path.getLineLength(charStartPoint.x, charStartPoint.y, charEndPoint.x, charEndPoint.y);
      let kern = 0;
      if (kerningFunc) {
        try {
          kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
        } catch (e) {
          kern = 0;
        }
      }
      charStartPoint.x += kern;
      charEndPoint.x += kern;
      this.textWidth += kern;
      const midpoint = Path_1$1.Path.getPointOnLine(kern + width2 / 2, charStartPoint.x, charStartPoint.y, charEndPoint.x, charEndPoint.y);
      const rotation = Math.atan2(charEndPoint.y - charStartPoint.y, charEndPoint.x - charStartPoint.x);
      this.glyphInfo.push({
        transposeX: midpoint.x,
        transposeY: midpoint.y,
        text: charArr[i],
        rotation,
        p0: charStartPoint,
        p1: charEndPoint
      });
      offsetToGlyph += glyphWidth;
    }
  }
  getSelfRect() {
    if (!this.glyphInfo.length) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }
    var points = [];
    this.glyphInfo.forEach(function(info) {
      points.push(info.p0.x);
      points.push(info.p0.y);
      points.push(info.p1.x);
      points.push(info.p1.y);
    });
    var minX = points[0] || 0;
    var maxX = points[0] || 0;
    var minY = points[1] || 0;
    var maxY = points[1] || 0;
    var x, y;
    for (var i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    var fontSize = this.fontSize();
    return {
      x: minX - fontSize / 2,
      y: minY - fontSize / 2,
      width: maxX - minX + fontSize,
      height: maxY - minY + fontSize
    };
  }
  destroy() {
    Util_1$4.Util.releaseCanvas(this.dummyCanvas);
    return super.destroy();
  }
}
TextPath$1.TextPath = TextPath;
TextPath.prototype._fillFunc = _fillFunc;
TextPath.prototype._strokeFunc = _strokeFunc;
TextPath.prototype._fillFuncHit = _fillFunc;
TextPath.prototype._strokeFuncHit = _strokeFunc;
TextPath.prototype.className = "TextPath";
TextPath.prototype._attrsAffectingSize = ["text", "fontSize", "data"];
(0, Global_1$2._registerNode)(TextPath);
Factory_1$h.Factory.addGetterSetter(TextPath, "data");
Factory_1$h.Factory.addGetterSetter(TextPath, "fontFamily", "Arial");
Factory_1$h.Factory.addGetterSetter(TextPath, "fontSize", 12, (0, Validators_1$h.getNumberValidator)());
Factory_1$h.Factory.addGetterSetter(TextPath, "fontStyle", NORMAL);
Factory_1$h.Factory.addGetterSetter(TextPath, "align", "left");
Factory_1$h.Factory.addGetterSetter(TextPath, "letterSpacing", 0, (0, Validators_1$h.getNumberValidator)());
Factory_1$h.Factory.addGetterSetter(TextPath, "textBaseline", "middle");
Factory_1$h.Factory.addGetterSetter(TextPath, "fontVariant", NORMAL);
Factory_1$h.Factory.addGetterSetter(TextPath, "text", EMPTY_STRING);
Factory_1$h.Factory.addGetterSetter(TextPath, "textDecoration", null);
Factory_1$h.Factory.addGetterSetter(TextPath, "kerningFunc", null);
var Transformer$1 = {};
Object.defineProperty(Transformer$1, "__esModule", { value: true });
Transformer$1.Transformer = void 0;
const Util_1$3 = Util;
const Factory_1$g = Factory;
const Node_1$f = Node$1;
const Shape_1$1 = Shape;
const Rect_1$1 = Rect$1;
const Group_1 = Group$1;
const Global_1$1 = Global;
const Validators_1$g = Validators;
const Global_2$1 = Global;
var EVENTS_NAME = "tr-konva";
var ATTR_CHANGE_LIST = [
  "resizeEnabledChange",
  "rotateAnchorOffsetChange",
  "rotateEnabledChange",
  "enabledAnchorsChange",
  "anchorSizeChange",
  "borderEnabledChange",
  "borderStrokeChange",
  "borderStrokeWidthChange",
  "borderDashChange",
  "anchorStrokeChange",
  "anchorStrokeWidthChange",
  "anchorFillChange",
  "anchorCornerRadiusChange",
  "ignoreStrokeChange",
  "anchorStyleFuncChange"
].map((e) => e + `.${EVENTS_NAME}`).join(" ");
var NODES_RECT = "nodesRect";
var TRANSFORM_CHANGE_STR = [
  "widthChange",
  "heightChange",
  "scaleXChange",
  "scaleYChange",
  "skewXChange",
  "skewYChange",
  "rotationChange",
  "offsetXChange",
  "offsetYChange",
  "transformsEnabledChange",
  "strokeWidthChange"
];
var ANGLES = {
  "top-left": -45,
  "top-center": 0,
  "top-right": 45,
  "middle-right": -90,
  "middle-left": 90,
  "bottom-left": -135,
  "bottom-center": 180,
  "bottom-right": 135
};
const TOUCH_DEVICE = "ontouchstart" in Global_1$1.Konva._global;
function getCursor(anchorName, rad, rotateCursor) {
  if (anchorName === "rotater") {
    return rotateCursor;
  }
  rad += Util_1$3.Util.degToRad(ANGLES[anchorName] || 0);
  var angle = (Util_1$3.Util.radToDeg(rad) % 360 + 360) % 360;
  if (Util_1$3.Util._inRange(angle, 315 + 22.5, 360) || Util_1$3.Util._inRange(angle, 0, 22.5)) {
    return "ns-resize";
  } else if (Util_1$3.Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
    return "nesw-resize";
  } else if (Util_1$3.Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
    return "ew-resize";
  } else if (Util_1$3.Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
    return "nwse-resize";
  } else if (Util_1$3.Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
    return "ns-resize";
  } else if (Util_1$3.Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
    return "nesw-resize";
  } else if (Util_1$3.Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
    return "ew-resize";
  } else if (Util_1$3.Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
    return "nwse-resize";
  } else {
    Util_1$3.Util.error("Transformer has unknown angle for cursor detection: " + angle);
    return "pointer";
  }
}
var ANCHORS_NAMES = [
  "top-left",
  "top-center",
  "top-right",
  "middle-right",
  "middle-left",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];
var MAX_SAFE_INTEGER = 1e8;
function getCenter(shape) {
  return {
    x: shape.x + shape.width / 2 * Math.cos(shape.rotation) + shape.height / 2 * Math.sin(-shape.rotation),
    y: shape.y + shape.height / 2 * Math.cos(shape.rotation) + shape.width / 2 * Math.sin(shape.rotation)
  };
}
function rotateAroundPoint(shape, angleRad, point) {
  const x = point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad);
  const y = point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad);
  return {
    ...shape,
    rotation: shape.rotation + angleRad,
    x,
    y
  };
}
function rotateAroundCenter(shape, deltaRad) {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaRad, center);
}
function getSnap(snaps, newRotationRad, tol) {
  let snapped = newRotationRad;
  for (let i = 0; i < snaps.length; i++) {
    const angle = Global_1$1.Konva.getAngle(snaps[i]);
    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);
    if (dif < tol) {
      snapped = angle;
    }
  }
  return snapped;
}
let activeTransformersCount = 0;
class Transformer extends Group_1.Group {
  constructor(config) {
    super(config);
    this._movingAnchorName = null;
    this._transforming = false;
    this._createElements();
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this.update = this.update.bind(this);
    this.on(ATTR_CHANGE_LIST, this.update);
    if (this.getNode()) {
      this.update();
    }
  }
  attachTo(node) {
    this.setNode(node);
    return this;
  }
  setNode(node) {
    Util_1$3.Util.warn("tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.");
    return this.setNodes([node]);
  }
  getNode() {
    return this._nodes && this._nodes[0];
  }
  _getEventNamespace() {
    return EVENTS_NAME + this._id;
  }
  setNodes(nodes = []) {
    if (this._nodes && this._nodes.length) {
      this.detach();
    }
    const filteredNodes = nodes.filter((node) => {
      if (node.isAncestorOf(this)) {
        Util_1$3.Util.error("Konva.Transformer cannot be an a child of the node you are trying to attach");
        return false;
      }
      return true;
    });
    this._nodes = nodes = filteredNodes;
    if (nodes.length === 1 && this.useSingleNodeRotation()) {
      this.rotation(nodes[0].getAbsoluteRotation());
    } else {
      this.rotation(0);
    }
    this._nodes.forEach((node) => {
      const onChange = () => {
        if (this.nodes().length === 1 && this.useSingleNodeRotation()) {
          this.rotation(this.nodes()[0].getAbsoluteRotation());
        }
        this._resetTransformCache();
        if (!this._transforming && !this.isDragging()) {
          this.update();
        }
      };
      const additionalEvents = node._attrsAffectingSize.map((prop) => prop + "Change." + this._getEventNamespace()).join(" ");
      node.on(additionalEvents, onChange);
      node.on(TRANSFORM_CHANGE_STR.map((e) => e + `.${this._getEventNamespace()}`).join(" "), onChange);
      node.on(`absoluteTransformChange.${this._getEventNamespace()}`, onChange);
      this._proxyDrag(node);
    });
    this._resetTransformCache();
    var elementsCreated = !!this.findOne(".top-left");
    if (elementsCreated) {
      this.update();
    }
    return this;
  }
  _proxyDrag(node) {
    let lastPos;
    node.on(`dragstart.${this._getEventNamespace()}`, (e) => {
      lastPos = node.getAbsolutePosition();
      if (!this.isDragging() && node !== this.findOne(".back")) {
        this.startDrag(e, false);
      }
    });
    node.on(`dragmove.${this._getEventNamespace()}`, (e) => {
      if (!lastPos) {
        return;
      }
      const abs = node.getAbsolutePosition();
      const dx = abs.x - lastPos.x;
      const dy = abs.y - lastPos.y;
      this.nodes().forEach((otherNode) => {
        if (otherNode === node) {
          return;
        }
        if (otherNode.isDragging()) {
          return;
        }
        const otherAbs = otherNode.getAbsolutePosition();
        otherNode.setAbsolutePosition({
          x: otherAbs.x + dx,
          y: otherAbs.y + dy
        });
        otherNode.startDrag(e);
      });
      lastPos = null;
    });
  }
  getNodes() {
    return this._nodes || [];
  }
  getActiveAnchor() {
    return this._movingAnchorName;
  }
  detach() {
    if (this._nodes) {
      this._nodes.forEach((node) => {
        node.off("." + this._getEventNamespace());
      });
    }
    this._nodes = [];
    this._resetTransformCache();
  }
  _resetTransformCache() {
    this._clearCache(NODES_RECT);
    this._clearCache("transform");
    this._clearSelfAndDescendantCache("absoluteTransform");
  }
  _getNodeRect() {
    return this._getCache(NODES_RECT, this.__getNodeRect);
  }
  __getNodeShape(node, rot = this.rotation(), relative) {
    var rect = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke()
    });
    var absScale = node.getAbsoluteScale(relative);
    var absPos = node.getAbsolutePosition(relative);
    var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
    var dy = rect.y * absScale.y - node.offsetY() * absScale.y;
    const rotation = (Global_1$1.Konva.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) % (Math.PI * 2);
    const box = {
      x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
      y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
      width: rect.width * absScale.x,
      height: rect.height * absScale.y,
      rotation
    };
    return rotateAroundPoint(box, -Global_1$1.Konva.getAngle(rot), {
      x: 0,
      y: 0
    });
  }
  __getNodeRect() {
    var node = this.getNode();
    if (!node) {
      return {
        x: -MAX_SAFE_INTEGER,
        y: -MAX_SAFE_INTEGER,
        width: 0,
        height: 0,
        rotation: 0
      };
    }
    const totalPoints = [];
    this.nodes().map((node2) => {
      const box = node2.getClientRect({
        skipTransform: true,
        skipShadow: true,
        skipStroke: this.ignoreStroke()
      });
      var points = [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
        { x: box.x, y: box.y + box.height }
      ];
      var trans = node2.getAbsoluteTransform();
      points.forEach(function(point) {
        var transformed = trans.point(point);
        totalPoints.push(transformed);
      });
    });
    const tr = new Util_1$3.Transform();
    tr.rotate(-Global_1$1.Konva.getAngle(this.rotation()));
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    totalPoints.forEach(function(point) {
      var transformed = tr.point(point);
      if (minX === void 0) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });
    tr.invert();
    const p2 = tr.point({ x: minX, y: minY });
    return {
      x: p2.x,
      y: p2.y,
      width: maxX - minX,
      height: maxY - minY,
      rotation: Global_1$1.Konva.getAngle(this.rotation())
    };
  }
  getX() {
    return this._getNodeRect().x;
  }
  getY() {
    return this._getNodeRect().y;
  }
  getWidth() {
    return this._getNodeRect().width;
  }
  getHeight() {
    return this._getNodeRect().height;
  }
  _createElements() {
    this._createBack();
    ANCHORS_NAMES.forEach((name) => {
      this._createAnchor(name);
    });
    this._createAnchor("rotater");
  }
  _createAnchor(name) {
    var anchor = new Rect_1$1.Rect({
      stroke: "rgb(0, 161, 255)",
      fill: "white",
      strokeWidth: 1,
      name: name + " _anchor",
      dragDistance: 0,
      draggable: true,
      hitStrokeWidth: TOUCH_DEVICE ? 10 : "auto"
    });
    var self2 = this;
    anchor.on("mousedown touchstart", function(e) {
      self2._handleMouseDown(e);
    });
    anchor.on("dragstart", (e) => {
      anchor.stopDrag();
      e.cancelBubble = true;
    });
    anchor.on("dragend", (e) => {
      e.cancelBubble = true;
    });
    anchor.on("mouseenter", () => {
      var rad = Global_1$1.Konva.getAngle(this.rotation());
      var rotateCursor = this.rotateAnchorCursor();
      var cursor = getCursor(name, rad, rotateCursor);
      anchor.getStage().content && (anchor.getStage().content.style.cursor = cursor);
      this._cursorChange = true;
    });
    anchor.on("mouseout", () => {
      anchor.getStage().content && (anchor.getStage().content.style.cursor = "");
      this._cursorChange = false;
    });
    this.add(anchor);
  }
  _createBack() {
    var back = new Shape_1$1.Shape({
      name: "back",
      width: 0,
      height: 0,
      draggable: true,
      sceneFunc(ctx, shape) {
        var tr = shape.getParent();
        var padding = tr.padding();
        ctx.beginPath();
        ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
        ctx.moveTo(shape.width() / 2, -padding);
        if (tr.rotateEnabled() && tr.rotateLineVisible()) {
          ctx.lineTo(shape.width() / 2, -tr.rotateAnchorOffset() * Util_1$3.Util._sign(shape.height()) - padding);
        }
        ctx.fillStrokeShape(shape);
      },
      hitFunc: (ctx, shape) => {
        if (!this.shouldOverdrawWholeArea()) {
          return;
        }
        var padding = this.padding();
        ctx.beginPath();
        ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
        ctx.fillStrokeShape(shape);
      }
    });
    this.add(back);
    this._proxyDrag(back);
    back.on("dragstart", (e) => {
      e.cancelBubble = true;
    });
    back.on("dragmove", (e) => {
      e.cancelBubble = true;
    });
    back.on("dragend", (e) => {
      e.cancelBubble = true;
    });
    this.on("dragmove", (e) => {
      this.update();
    });
  }
  _handleMouseDown(e) {
    this._movingAnchorName = e.target.name().split(" ")[0];
    var attrs = this._getNodeRect();
    var width = attrs.width;
    var height = attrs.height;
    var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    this.sin = Math.abs(height / hypotenuse);
    this.cos = Math.abs(width / hypotenuse);
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this._handleMouseMove);
      window.addEventListener("touchmove", this._handleMouseMove);
      window.addEventListener("mouseup", this._handleMouseUp, true);
      window.addEventListener("touchend", this._handleMouseUp, true);
    }
    this._transforming = true;
    var ap = e.target.getAbsolutePosition();
    var pos = e.target.getStage().getPointerPosition();
    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y
    };
    activeTransformersCount++;
    this._fire("transformstart", { evt: e.evt, target: this.getNode() });
    this._nodes.forEach((target) => {
      target._fire("transformstart", { evt: e.evt, target });
    });
  }
  _handleMouseMove(e) {
    var x, y, newHypotenuse;
    var anchorNode = this.findOne("." + this._movingAnchorName);
    var stage = anchorNode.getStage();
    stage.setPointersPositions(e);
    const pp = stage.getPointerPosition();
    let newNodePos = {
      x: pp.x - this._anchorDragOffset.x,
      y: pp.y - this._anchorDragOffset.y
    };
    const oldAbs = anchorNode.getAbsolutePosition();
    if (this.anchorDragBoundFunc()) {
      newNodePos = this.anchorDragBoundFunc()(oldAbs, newNodePos, e);
    }
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();
    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }
    if (this._movingAnchorName === "rotater") {
      var attrs = this._getNodeRect();
      x = anchorNode.x() - attrs.width / 2;
      y = -anchorNode.y() + attrs.height / 2;
      let delta = Math.atan2(-y, x) + Math.PI / 2;
      if (attrs.height < 0) {
        delta -= Math.PI;
      }
      var oldRotation = Global_1$1.Konva.getAngle(this.rotation());
      const newRotation = oldRotation + delta;
      const tol = Global_1$1.Konva.getAngle(this.rotationSnapTolerance());
      const snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
      const diff = snappedRot - attrs.rotation;
      const shape = rotateAroundCenter(attrs, diff);
      this._fitNodesInto(shape, e);
      return;
    }
    var shiftBehavior = this.shiftBehavior();
    var keepProportion;
    if (shiftBehavior === "inverted") {
      keepProportion = this.keepRatio() && !e.shiftKey;
    } else if (shiftBehavior === "none") {
      keepProportion = this.keepRatio();
    } else {
      keepProportion = this.keepRatio() || e.shiftKey;
    }
    var centeredScaling = this.centeredScaling() || e.altKey;
    if (this._movingAnchorName === "top-left") {
      if (keepProportion) {
        var comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".bottom-right").x(),
          y: this.findOne(".bottom-right").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
        var reverseX = this.findOne(".top-left").x() > comparePoint.x ? -1 : 1;
        var reverseY = this.findOne(".top-left").y() > comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".top-left").x(comparePoint.x - x);
        this.findOne(".top-left").y(comparePoint.y - y);
      }
    } else if (this._movingAnchorName === "top-center") {
      this.findOne(".top-left").y(anchorNode.y());
    } else if (this._movingAnchorName === "top-right") {
      if (keepProportion) {
        var comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".bottom-left").x(),
          y: this.findOne(".bottom-left").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
        var reverseX = this.findOne(".top-right").x() < comparePoint.x ? -1 : 1;
        var reverseY = this.findOne(".top-right").y() > comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".top-right").x(comparePoint.x + x);
        this.findOne(".top-right").y(comparePoint.y - y);
      }
      var pos = anchorNode.position();
      this.findOne(".top-left").y(pos.y);
      this.findOne(".bottom-right").x(pos.x);
    } else if (this._movingAnchorName === "middle-left") {
      this.findOne(".top-left").x(anchorNode.x());
    } else if (this._movingAnchorName === "middle-right") {
      this.findOne(".bottom-right").x(anchorNode.x());
    } else if (this._movingAnchorName === "bottom-left") {
      if (keepProportion) {
        var comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".top-right").x(),
          y: this.findOne(".top-right").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
        var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
        var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        anchorNode.x(comparePoint.x - x);
        anchorNode.y(comparePoint.y + y);
      }
      pos = anchorNode.position();
      this.findOne(".top-left").x(pos.x);
      this.findOne(".bottom-right").y(pos.y);
    } else if (this._movingAnchorName === "bottom-center") {
      this.findOne(".bottom-right").y(anchorNode.y());
    } else if (this._movingAnchorName === "bottom-right") {
      if (keepProportion) {
        var comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".top-left").x(),
          y: this.findOne(".top-left").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
        var reverseX = this.findOne(".bottom-right").x() < comparePoint.x ? -1 : 1;
        var reverseY = this.findOne(".bottom-right").y() < comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".bottom-right").x(comparePoint.x + x);
        this.findOne(".bottom-right").y(comparePoint.y + y);
      }
    } else {
      console.error(new Error("Wrong position argument of selection resizer: " + this._movingAnchorName));
    }
    var centeredScaling = this.centeredScaling() || e.altKey;
    if (centeredScaling) {
      var topLeft = this.findOne(".top-left");
      var bottomRight = this.findOne(".bottom-right");
      var topOffsetX = topLeft.x();
      var topOffsetY = topLeft.y();
      var bottomOffsetX = this.getWidth() - bottomRight.x();
      var bottomOffsetY = this.getHeight() - bottomRight.y();
      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY
      });
      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY
      });
    }
    var absPos = this.findOne(".top-left").getAbsolutePosition();
    x = absPos.x;
    y = absPos.y;
    var width = this.findOne(".bottom-right").x() - this.findOne(".top-left").x();
    var height = this.findOne(".bottom-right").y() - this.findOne(".top-left").y();
    this._fitNodesInto({
      x,
      y,
      width,
      height,
      rotation: Global_1$1.Konva.getAngle(this.rotation())
    }, e);
  }
  _handleMouseUp(e) {
    this._removeEvents(e);
  }
  getAbsoluteTransform() {
    return this.getTransform();
  }
  _removeEvents(e) {
    var _a;
    if (this._transforming) {
      this._transforming = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", this._handleMouseMove);
        window.removeEventListener("touchmove", this._handleMouseMove);
        window.removeEventListener("mouseup", this._handleMouseUp, true);
        window.removeEventListener("touchend", this._handleMouseUp, true);
      }
      var node = this.getNode();
      activeTransformersCount--;
      this._fire("transformend", { evt: e, target: node });
      (_a = this.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
      if (node) {
        this._nodes.forEach((target) => {
          var _a2;
          target._fire("transformend", { evt: e, target });
          (_a2 = target.getLayer()) === null || _a2 === void 0 ? void 0 : _a2.batchDraw();
        });
      }
      this._movingAnchorName = null;
    }
  }
  _fitNodesInto(newAttrs, evt) {
    var oldAttrs = this._getNodeRect();
    const minSize = 1;
    if (Util_1$3.Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    if (Util_1$3.Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    var t = new Util_1$3.Transform();
    t.rotate(Global_1$1.Konva.getAngle(this.rotation()));
    if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("left") >= 0) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = this._movingAnchorName.replace("left", "right");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
    } else if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("right") >= 0) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0
      });
      this._movingAnchorName = this._movingAnchorName.replace("right", "left");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
    }
    if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("top") >= 0) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = this._movingAnchorName.replace("top", "bottom");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    } else if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("bottom") >= 0) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2
      });
      this._movingAnchorName = this._movingAnchorName.replace("bottom", "top");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    }
    if (this.boundBoxFunc()) {
      const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
      if (bounded) {
        newAttrs = bounded;
      } else {
        Util_1$3.Util.warn("boundBoxFunc returned falsy. You should return new bound rect from it!");
      }
    }
    const baseSize = 1e7;
    const oldTr = new Util_1$3.Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
    const newTr = new Util_1$3.Transform();
    const newScaleX = newAttrs.width / baseSize;
    const newScaleY = newAttrs.height / baseSize;
    if (this.flipEnabled() === false) {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.translate(newAttrs.width < 0 ? newAttrs.width : 0, newAttrs.height < 0 ? newAttrs.height : 0);
      newTr.scale(Math.abs(newScaleX), Math.abs(newScaleY));
    } else {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.scale(newScaleX, newScaleY);
    }
    const delta = newTr.multiply(oldTr.invert());
    this._nodes.forEach((node) => {
      var _a;
      const parentTransform = node.getParent().getAbsoluteTransform();
      const localTransform = node.getTransform().copy();
      localTransform.translate(node.offsetX(), node.offsetY());
      const newLocalTransform = new Util_1$3.Transform();
      newLocalTransform.multiply(parentTransform.copy().invert()).multiply(delta).multiply(parentTransform).multiply(localTransform);
      const attrs = newLocalTransform.decompose();
      node.setAttrs(attrs);
      (_a = node.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
    });
    this.rotation(Util_1$3.Util._getRotation(newAttrs.rotation));
    this._nodes.forEach((node) => {
      this._fire("transform", { evt, target: node });
      node._fire("transform", { evt, target: node });
    });
    this._resetTransformCache();
    this.update();
    this.getLayer().batchDraw();
  }
  forceUpdate() {
    this._resetTransformCache();
    this.update();
  }
  _batchChangeChild(selector, attrs) {
    const anchor = this.findOne(selector);
    anchor.setAttrs(attrs);
  }
  update() {
    var _a;
    var attrs = this._getNodeRect();
    this.rotation(Util_1$3.Util._getRotation(attrs.rotation));
    var width = attrs.width;
    var height = attrs.height;
    var enabledAnchors = this.enabledAnchors();
    var resizeEnabled = this.resizeEnabled();
    var padding = this.padding();
    var anchorSize = this.anchorSize();
    const anchors = this.find("._anchor");
    anchors.forEach((node) => {
      node.setAttrs({
        width: anchorSize,
        height: anchorSize,
        offsetX: anchorSize / 2,
        offsetY: anchorSize / 2,
        stroke: this.anchorStroke(),
        strokeWidth: this.anchorStrokeWidth(),
        fill: this.anchorFill(),
        cornerRadius: this.anchorCornerRadius()
      });
    });
    this._batchChangeChild(".top-left", {
      x: 0,
      y: 0,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-left") >= 0
    });
    this._batchChangeChild(".top-center", {
      x: width / 2,
      y: 0,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-center") >= 0
    });
    this._batchChangeChild(".top-right", {
      x: width,
      y: 0,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-right") >= 0
    });
    this._batchChangeChild(".middle-left", {
      x: 0,
      y: height / 2,
      offsetX: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("middle-left") >= 0
    });
    this._batchChangeChild(".middle-right", {
      x: width,
      y: height / 2,
      offsetX: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("middle-right") >= 0
    });
    this._batchChangeChild(".bottom-left", {
      x: 0,
      y: height,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-left") >= 0
    });
    this._batchChangeChild(".bottom-center", {
      x: width / 2,
      y: height,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-center") >= 0
    });
    this._batchChangeChild(".bottom-right", {
      x: width,
      y: height,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-right") >= 0
    });
    this._batchChangeChild(".rotater", {
      x: width / 2,
      y: -this.rotateAnchorOffset() * Util_1$3.Util._sign(height) - padding,
      visible: this.rotateEnabled()
    });
    this._batchChangeChild(".back", {
      width,
      height,
      visible: this.borderEnabled(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash(),
      x: 0,
      y: 0
    });
    const styleFunc = this.anchorStyleFunc();
    if (styleFunc) {
      anchors.forEach((node) => {
        styleFunc(node);
      });
    }
    (_a = this.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
  }
  isTransforming() {
    return this._transforming;
  }
  stopTransform() {
    if (this._transforming) {
      this._removeEvents();
      var anchorNode = this.findOne("." + this._movingAnchorName);
      if (anchorNode) {
        anchorNode.stopDrag();
      }
    }
  }
  destroy() {
    if (this.getStage() && this._cursorChange) {
      this.getStage().content && (this.getStage().content.style.cursor = "");
    }
    Group_1.Group.prototype.destroy.call(this);
    this.detach();
    this._removeEvents();
    return this;
  }
  toObject() {
    return Node_1$f.Node.prototype.toObject.call(this);
  }
  clone(obj) {
    var node = Node_1$f.Node.prototype.clone.call(this, obj);
    return node;
  }
  getClientRect() {
    if (this.nodes().length > 0) {
      return super.getClientRect();
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  }
}
Transformer$1.Transformer = Transformer;
Transformer.isTransforming = () => {
  return activeTransformersCount > 0;
};
function validateAnchors(val) {
  if (!(val instanceof Array)) {
    Util_1$3.Util.warn("enabledAnchors value should be an array");
  }
  if (val instanceof Array) {
    val.forEach(function(name) {
      if (ANCHORS_NAMES.indexOf(name) === -1) {
        Util_1$3.Util.warn("Unknown anchor name: " + name + ". Available names are: " + ANCHORS_NAMES.join(", "));
      }
    });
  }
  return val || [];
}
Transformer.prototype.className = "Transformer";
(0, Global_2$1._registerNode)(Transformer);
Factory_1$g.Factory.addGetterSetter(Transformer, "enabledAnchors", ANCHORS_NAMES, validateAnchors);
Factory_1$g.Factory.addGetterSetter(Transformer, "flipEnabled", true, (0, Validators_1$g.getBooleanValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "resizeEnabled", true);
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorSize", 10, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "rotateEnabled", true);
Factory_1$g.Factory.addGetterSetter(Transformer, "rotateLineVisible", true);
Factory_1$g.Factory.addGetterSetter(Transformer, "rotationSnaps", []);
Factory_1$g.Factory.addGetterSetter(Transformer, "rotateAnchorOffset", 50, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "rotateAnchorCursor", "crosshair");
Factory_1$g.Factory.addGetterSetter(Transformer, "rotationSnapTolerance", 5, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "borderEnabled", true);
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorStroke", "rgb(0, 161, 255)");
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorStrokeWidth", 1, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorFill", "white");
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorCornerRadius", 0, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "borderStroke", "rgb(0, 161, 255)");
Factory_1$g.Factory.addGetterSetter(Transformer, "borderStrokeWidth", 1, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "borderDash");
Factory_1$g.Factory.addGetterSetter(Transformer, "keepRatio", true);
Factory_1$g.Factory.addGetterSetter(Transformer, "shiftBehavior", "default");
Factory_1$g.Factory.addGetterSetter(Transformer, "centeredScaling", false);
Factory_1$g.Factory.addGetterSetter(Transformer, "ignoreStroke", false);
Factory_1$g.Factory.addGetterSetter(Transformer, "padding", 0, (0, Validators_1$g.getNumberValidator)());
Factory_1$g.Factory.addGetterSetter(Transformer, "node");
Factory_1$g.Factory.addGetterSetter(Transformer, "nodes");
Factory_1$g.Factory.addGetterSetter(Transformer, "boundBoxFunc");
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorDragBoundFunc");
Factory_1$g.Factory.addGetterSetter(Transformer, "anchorStyleFunc");
Factory_1$g.Factory.addGetterSetter(Transformer, "shouldOverdrawWholeArea", false);
Factory_1$g.Factory.addGetterSetter(Transformer, "useSingleNodeRotation", true);
Factory_1$g.Factory.backCompat(Transformer, {
  lineEnabled: "borderEnabled",
  rotateHandlerOffset: "rotateAnchorOffset",
  enabledHandlers: "enabledAnchors"
});
var Wedge$1 = {};
Object.defineProperty(Wedge$1, "__esModule", { value: true });
Wedge$1.Wedge = void 0;
const Factory_1$f = Factory;
const Shape_1 = Shape;
const Global_1 = Global;
const Validators_1$f = Validators;
const Global_2 = Global;
class Wedge extends Shape_1.Shape {
  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.radius(), 0, Global_1.Konva.getAngle(this.angle()), this.clockwise());
    context.lineTo(0, 0);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radius() * 2;
  }
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width) {
    this.radius(width / 2);
  }
  setHeight(height) {
    this.radius(height / 2);
  }
}
Wedge$1.Wedge = Wedge;
Wedge.prototype.className = "Wedge";
Wedge.prototype._centroid = true;
Wedge.prototype._attrsAffectingSize = ["radius"];
(0, Global_2._registerNode)(Wedge);
Factory_1$f.Factory.addGetterSetter(Wedge, "radius", 0, (0, Validators_1$f.getNumberValidator)());
Factory_1$f.Factory.addGetterSetter(Wedge, "angle", 0, (0, Validators_1$f.getNumberValidator)());
Factory_1$f.Factory.addGetterSetter(Wedge, "clockwise", false);
Factory_1$f.Factory.backCompat(Wedge, {
  angleDeg: "angle",
  getAngleDeg: "getAngle",
  setAngleDeg: "setAngle"
});
var Blur$1 = {};
Object.defineProperty(Blur$1, "__esModule", { value: true });
Blur$1.Blur = void 0;
const Factory_1$e = Factory;
const Node_1$e = Node$1;
const Validators_1$e = Validators;
function BlurStack() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
}
var mul_table = [
  512,
  512,
  456,
  512,
  328,
  456,
  335,
  512,
  405,
  328,
  271,
  456,
  388,
  335,
  292,
  512,
  454,
  405,
  364,
  328,
  298,
  271,
  496,
  456,
  420,
  388,
  360,
  335,
  312,
  292,
  273,
  512,
  482,
  454,
  428,
  405,
  383,
  364,
  345,
  328,
  312,
  298,
  284,
  271,
  259,
  496,
  475,
  456,
  437,
  420,
  404,
  388,
  374,
  360,
  347,
  335,
  323,
  312,
  302,
  292,
  282,
  273,
  265,
  512,
  497,
  482,
  468,
  454,
  441,
  428,
  417,
  405,
  394,
  383,
  373,
  364,
  354,
  345,
  337,
  328,
  320,
  312,
  305,
  298,
  291,
  284,
  278,
  271,
  265,
  259,
  507,
  496,
  485,
  475,
  465,
  456,
  446,
  437,
  428,
  420,
  412,
  404,
  396,
  388,
  381,
  374,
  367,
  360,
  354,
  347,
  341,
  335,
  329,
  323,
  318,
  312,
  307,
  302,
  297,
  292,
  287,
  282,
  278,
  273,
  269,
  265,
  261,
  512,
  505,
  497,
  489,
  482,
  475,
  468,
  461,
  454,
  447,
  441,
  435,
  428,
  422,
  417,
  411,
  405,
  399,
  394,
  389,
  383,
  378,
  373,
  368,
  364,
  359,
  354,
  350,
  345,
  341,
  337,
  332,
  328,
  324,
  320,
  316,
  312,
  309,
  305,
  301,
  298,
  294,
  291,
  287,
  284,
  281,
  278,
  274,
  271,
  268,
  265,
  262,
  259,
  257,
  507,
  501,
  496,
  491,
  485,
  480,
  475,
  470,
  465,
  460,
  456,
  451,
  446,
  442,
  437,
  433,
  428,
  424,
  420,
  416,
  412,
  408,
  404,
  400,
  396,
  392,
  388,
  385,
  381,
  377,
  374,
  370,
  367,
  363,
  360,
  357,
  354,
  350,
  347,
  344,
  341,
  338,
  335,
  332,
  329,
  326,
  323,
  320,
  318,
  315,
  312,
  310,
  307,
  304,
  302,
  299,
  297,
  294,
  292,
  289,
  287,
  285,
  282,
  280,
  278,
  275,
  273,
  271,
  269,
  267,
  265,
  263,
  261,
  259
];
var shg_table = [
  9,
  11,
  12,
  13,
  13,
  14,
  14,
  15,
  15,
  15,
  15,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  18,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  21,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  22,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  23,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24
];
function filterGaussBlurRGBA(imageData, radius) {
  var pixels = imageData.data, width = imageData.width, height = imageData.height;
  var x, y, i, p2, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
  var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2, stackStart = new BlurStack(), stackEnd = null, stack2 = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
  for (i = 1; i < div; i++) {
    stack2 = stack2.next = new BlurStack();
    if (i === radiusPlus1) {
      stackEnd = stack2;
    }
  }
  stack2.next = stackStart;
  yw = yi = 0;
  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;
    stack2 = stackStart;
    for (i = 0; i < radiusPlus1; i++) {
      stack2.r = pr;
      stack2.g = pg;
      stack2.b = pb;
      stack2.a = pa;
      stack2 = stack2.next;
    }
    for (i = 1; i < radiusPlus1; i++) {
      p2 = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack2.r = pr = pixels[p2]) * (rbs = radiusPlus1 - i);
      g_sum += (stack2.g = pg = pixels[p2 + 1]) * rbs;
      b_sum += (stack2.b = pb = pixels[p2 + 2]) * rbs;
      a_sum += (stack2.a = pa = pixels[p2 + 3]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;
      stack2 = stack2.next;
    }
    stackIn = stackStart;
    stackOut = stackEnd;
    for (x = 0; x < width; x++) {
      pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
      if (pa !== 0) {
        pa = 255 / pa;
        pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
        pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
        pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;
      p2 = yw + ((p2 = x + radius + 1) < widthMinus1 ? p2 : widthMinus1) << 2;
      r_in_sum += stackIn.r = pixels[p2];
      g_in_sum += stackIn.g = pixels[p2 + 1];
      b_in_sum += stackIn.b = pixels[p2 + 2];
      a_in_sum += stackIn.a = pixels[p2 + 3];
      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      a_sum += a_in_sum;
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      a_out_sum += pa = stackOut.a;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;
      stackOut = stackOut.next;
      yi += 4;
    }
    yw += width;
  }
  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;
    stack2 = stackStart;
    for (i = 0; i < radiusPlus1; i++) {
      stack2.r = pr;
      stack2.g = pg;
      stack2.b = pb;
      stack2.a = pa;
      stack2 = stack2.next;
    }
    yp = width;
    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;
      r_sum += (stack2.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack2.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack2.b = pb = pixels[yi + 2]) * rbs;
      a_sum += (stack2.a = pa = pixels[yi + 3]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;
      stack2 = stack2.next;
      if (i < heightMinus1) {
        yp += width;
      }
    }
    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (y = 0; y < height; y++) {
      p2 = yi << 2;
      pixels[p2 + 3] = pa = a_sum * mul_sum >> shg_sum;
      if (pa > 0) {
        pa = 255 / pa;
        pixels[p2] = (r_sum * mul_sum >> shg_sum) * pa;
        pixels[p2 + 1] = (g_sum * mul_sum >> shg_sum) * pa;
        pixels[p2 + 2] = (b_sum * mul_sum >> shg_sum) * pa;
      } else {
        pixels[p2] = pixels[p2 + 1] = pixels[p2 + 2] = 0;
      }
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;
      p2 = x + ((p2 = y + radiusPlus1) < heightMinus1 ? p2 : heightMinus1) * width << 2;
      r_sum += r_in_sum += stackIn.r = pixels[p2];
      g_sum += g_in_sum += stackIn.g = pixels[p2 + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p2 + 2];
      a_sum += a_in_sum += stackIn.a = pixels[p2 + 3];
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      a_out_sum += pa = stackOut.a;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;
      stackOut = stackOut.next;
      yi += width;
    }
  }
}
const Blur = function Blur2(imageData) {
  var radius = Math.round(this.blurRadius());
  if (radius > 0) {
    filterGaussBlurRGBA(imageData, radius);
  }
};
Blur$1.Blur = Blur;
Factory_1$e.Factory.addGetterSetter(Node_1$e.Node, "blurRadius", 0, (0, Validators_1$e.getNumberValidator)(), Factory_1$e.Factory.afterSetFilter);
var Brighten$1 = {};
Object.defineProperty(Brighten$1, "__esModule", { value: true });
Brighten$1.Brighten = void 0;
const Factory_1$d = Factory;
const Node_1$d = Node$1;
const Validators_1$d = Validators;
const Brighten = function(imageData) {
  var brightness = this.brightness() * 255, data = imageData.data, len = data.length, i;
  for (i = 0; i < len; i += 4) {
    data[i] += brightness;
    data[i + 1] += brightness;
    data[i + 2] += brightness;
  }
};
Brighten$1.Brighten = Brighten;
Factory_1$d.Factory.addGetterSetter(Node_1$d.Node, "brightness", 0, (0, Validators_1$d.getNumberValidator)(), Factory_1$d.Factory.afterSetFilter);
var Contrast$1 = {};
Object.defineProperty(Contrast$1, "__esModule", { value: true });
Contrast$1.Contrast = void 0;
const Factory_1$c = Factory;
const Node_1$c = Node$1;
const Validators_1$c = Validators;
const Contrast = function(imageData) {
  var adjust = Math.pow((this.contrast() + 100) / 100, 2);
  var data = imageData.data, nPixels = data.length, red = 150, green = 150, blue = 150, i;
  for (i = 0; i < nPixels; i += 4) {
    red = data[i];
    green = data[i + 1];
    blue = data[i + 2];
    red /= 255;
    red -= 0.5;
    red *= adjust;
    red += 0.5;
    red *= 255;
    green /= 255;
    green -= 0.5;
    green *= adjust;
    green += 0.5;
    green *= 255;
    blue /= 255;
    blue -= 0.5;
    blue *= adjust;
    blue += 0.5;
    blue *= 255;
    red = red < 0 ? 0 : red > 255 ? 255 : red;
    green = green < 0 ? 0 : green > 255 ? 255 : green;
    blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
    data[i] = red;
    data[i + 1] = green;
    data[i + 2] = blue;
  }
};
Contrast$1.Contrast = Contrast;
Factory_1$c.Factory.addGetterSetter(Node_1$c.Node, "contrast", 0, (0, Validators_1$c.getNumberValidator)(), Factory_1$c.Factory.afterSetFilter);
var Emboss$1 = {};
Object.defineProperty(Emboss$1, "__esModule", { value: true });
Emboss$1.Emboss = void 0;
const Factory_1$b = Factory;
const Node_1$b = Node$1;
const Util_1$2 = Util;
const Validators_1$b = Validators;
const Emboss = function(imageData) {
  var strength = this.embossStrength() * 10, greyLevel = this.embossWhiteLevel() * 255, direction = this.embossDirection(), blend = this.embossBlend(), dirY = 0, dirX = 0, data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
  switch (direction) {
    case "top-left":
      dirY = -1;
      dirX = -1;
      break;
    case "top":
      dirY = -1;
      dirX = 0;
      break;
    case "top-right":
      dirY = -1;
      dirX = 1;
      break;
    case "right":
      dirY = 0;
      dirX = 1;
      break;
    case "bottom-right":
      dirY = 1;
      dirX = 1;
      break;
    case "bottom":
      dirY = 1;
      dirX = 0;
      break;
    case "bottom-left":
      dirY = 1;
      dirX = -1;
      break;
    case "left":
      dirY = 0;
      dirX = -1;
      break;
    default:
      Util_1$2.Util.error("Unknown emboss direction: " + direction);
  }
  do {
    var offsetY = (y - 1) * w4;
    var otherY = dirY;
    if (y + otherY < 1) {
      otherY = 0;
    }
    if (y + otherY > h) {
      otherY = 0;
    }
    var offsetYOther = (y - 1 + otherY) * w * 4;
    var x = w;
    do {
      var offset = offsetY + (x - 1) * 4;
      var otherX = dirX;
      if (x + otherX < 1) {
        otherX = 0;
      }
      if (x + otherX > w) {
        otherX = 0;
      }
      var offsetOther = offsetYOther + (x - 1 + otherX) * 4;
      var dR = data[offset] - data[offsetOther];
      var dG = data[offset + 1] - data[offsetOther + 1];
      var dB = data[offset + 2] - data[offsetOther + 2];
      var dif = dR;
      var absDif = dif > 0 ? dif : -dif;
      var absG = dG > 0 ? dG : -dG;
      var absB = dB > 0 ? dB : -dB;
      if (absG > absDif) {
        dif = dG;
      }
      if (absB > absDif) {
        dif = dB;
      }
      dif *= strength;
      if (blend) {
        var r = data[offset] + dif;
        var g = data[offset + 1] + dif;
        var b = data[offset + 2] + dif;
        data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
      } else {
        var grey = greyLevel - dif;
        if (grey < 0) {
          grey = 0;
        } else if (grey > 255) {
          grey = 255;
        }
        data[offset] = data[offset + 1] = data[offset + 2] = grey;
      }
    } while (--x);
  } while (--y);
};
Emboss$1.Emboss = Emboss;
Factory_1$b.Factory.addGetterSetter(Node_1$b.Node, "embossStrength", 0.5, (0, Validators_1$b.getNumberValidator)(), Factory_1$b.Factory.afterSetFilter);
Factory_1$b.Factory.addGetterSetter(Node_1$b.Node, "embossWhiteLevel", 0.5, (0, Validators_1$b.getNumberValidator)(), Factory_1$b.Factory.afterSetFilter);
Factory_1$b.Factory.addGetterSetter(Node_1$b.Node, "embossDirection", "top-left", null, Factory_1$b.Factory.afterSetFilter);
Factory_1$b.Factory.addGetterSetter(Node_1$b.Node, "embossBlend", false, null, Factory_1$b.Factory.afterSetFilter);
var Enhance$1 = {};
Object.defineProperty(Enhance$1, "__esModule", { value: true });
Enhance$1.Enhance = void 0;
const Factory_1$a = Factory;
const Node_1$a = Node$1;
const Validators_1$a = Validators;
function remap(fromValue, fromMin, fromMax, toMin, toMax) {
  var fromRange = fromMax - fromMin, toRange = toMax - toMin, toValue;
  if (fromRange === 0) {
    return toMin + toRange / 2;
  }
  if (toRange === 0) {
    return toMin;
  }
  toValue = (fromValue - fromMin) / fromRange;
  toValue = toRange * toValue + toMin;
  return toValue;
}
const Enhance = function(imageData) {
  var data = imageData.data, nSubPixels = data.length, rMin = data[0], rMax = rMin, r, gMin = data[1], gMax = gMin, g, bMin = data[2], bMax = bMin, b, i;
  var enhanceAmount = this.enhance();
  if (enhanceAmount === 0) {
    return;
  }
  for (i = 0; i < nSubPixels; i += 4) {
    r = data[i + 0];
    if (r < rMin) {
      rMin = r;
    } else if (r > rMax) {
      rMax = r;
    }
    g = data[i + 1];
    if (g < gMin) {
      gMin = g;
    } else if (g > gMax) {
      gMax = g;
    }
    b = data[i + 2];
    if (b < bMin) {
      bMin = b;
    } else if (b > bMax) {
      bMax = b;
    }
  }
  if (rMax === rMin) {
    rMax = 255;
    rMin = 0;
  }
  if (gMax === gMin) {
    gMax = 255;
    gMin = 0;
  }
  if (bMax === bMin) {
    bMax = 255;
    bMin = 0;
  }
  var rMid, rGoalMax, rGoalMin, gMid, gGoalMax, gGoalMin, bMid, bGoalMax, bGoalMin;
  if (enhanceAmount > 0) {
    rGoalMax = rMax + enhanceAmount * (255 - rMax);
    rGoalMin = rMin - enhanceAmount * (rMin - 0);
    gGoalMax = gMax + enhanceAmount * (255 - gMax);
    gGoalMin = gMin - enhanceAmount * (gMin - 0);
    bGoalMax = bMax + enhanceAmount * (255 - bMax);
    bGoalMin = bMin - enhanceAmount * (bMin - 0);
  } else {
    rMid = (rMax + rMin) * 0.5;
    rGoalMax = rMax + enhanceAmount * (rMax - rMid);
    rGoalMin = rMin + enhanceAmount * (rMin - rMid);
    gMid = (gMax + gMin) * 0.5;
    gGoalMax = gMax + enhanceAmount * (gMax - gMid);
    gGoalMin = gMin + enhanceAmount * (gMin - gMid);
    bMid = (bMax + bMin) * 0.5;
    bGoalMax = bMax + enhanceAmount * (bMax - bMid);
    bGoalMin = bMin + enhanceAmount * (bMin - bMid);
  }
  for (i = 0; i < nSubPixels; i += 4) {
    data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
    data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
    data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
  }
};
Enhance$1.Enhance = Enhance;
Factory_1$a.Factory.addGetterSetter(Node_1$a.Node, "enhance", 0, (0, Validators_1$a.getNumberValidator)(), Factory_1$a.Factory.afterSetFilter);
var Grayscale$1 = {};
Object.defineProperty(Grayscale$1, "__esModule", { value: true });
Grayscale$1.Grayscale = void 0;
const Grayscale = function(imageData) {
  var data = imageData.data, len = data.length, i, brightness;
  for (i = 0; i < len; i += 4) {
    brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    data[i] = brightness;
    data[i + 1] = brightness;
    data[i + 2] = brightness;
  }
};
Grayscale$1.Grayscale = Grayscale;
var HSL$1 = {};
Object.defineProperty(HSL$1, "__esModule", { value: true });
HSL$1.HSL = void 0;
const Factory_1$9 = Factory;
const Node_1$9 = Node$1;
const Validators_1$9 = Validators;
Factory_1$9.Factory.addGetterSetter(Node_1$9.Node, "hue", 0, (0, Validators_1$9.getNumberValidator)(), Factory_1$9.Factory.afterSetFilter);
Factory_1$9.Factory.addGetterSetter(Node_1$9.Node, "saturation", 0, (0, Validators_1$9.getNumberValidator)(), Factory_1$9.Factory.afterSetFilter);
Factory_1$9.Factory.addGetterSetter(Node_1$9.Node, "luminance", 0, (0, Validators_1$9.getNumberValidator)(), Factory_1$9.Factory.afterSetFilter);
const HSL = function(imageData) {
  var data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127, i;
  var vsu = v * s * Math.cos(h * Math.PI / 180), vsw = v * s * Math.sin(h * Math.PI / 180);
  var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
  var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
  var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
  var r, g, b, a;
  for (i = 0; i < nPixels; i += 4) {
    r = data[i + 0];
    g = data[i + 1];
    b = data[i + 2];
    a = data[i + 3];
    data[i + 0] = rr * r + rg * g + rb * b + l;
    data[i + 1] = gr * r + gg * g + gb * b + l;
    data[i + 2] = br * r + bg * g + bb * b + l;
    data[i + 3] = a;
  }
};
HSL$1.HSL = HSL;
var HSV$1 = {};
Object.defineProperty(HSV$1, "__esModule", { value: true });
HSV$1.HSV = void 0;
const Factory_1$8 = Factory;
const Node_1$8 = Node$1;
const Validators_1$8 = Validators;
const HSV = function(imageData) {
  var data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, i;
  var vsu = v * s * Math.cos(h * Math.PI / 180), vsw = v * s * Math.sin(h * Math.PI / 180);
  var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
  var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
  var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
  var r, g, b, a;
  for (i = 0; i < nPixels; i += 4) {
    r = data[i + 0];
    g = data[i + 1];
    b = data[i + 2];
    a = data[i + 3];
    data[i + 0] = rr * r + rg * g + rb * b;
    data[i + 1] = gr * r + gg * g + gb * b;
    data[i + 2] = br * r + bg * g + bb * b;
    data[i + 3] = a;
  }
};
HSV$1.HSV = HSV;
Factory_1$8.Factory.addGetterSetter(Node_1$8.Node, "hue", 0, (0, Validators_1$8.getNumberValidator)(), Factory_1$8.Factory.afterSetFilter);
Factory_1$8.Factory.addGetterSetter(Node_1$8.Node, "saturation", 0, (0, Validators_1$8.getNumberValidator)(), Factory_1$8.Factory.afterSetFilter);
Factory_1$8.Factory.addGetterSetter(Node_1$8.Node, "value", 0, (0, Validators_1$8.getNumberValidator)(), Factory_1$8.Factory.afterSetFilter);
var Invert$1 = {};
Object.defineProperty(Invert$1, "__esModule", { value: true });
Invert$1.Invert = void 0;
const Invert = function(imageData) {
  var data = imageData.data, len = data.length, i;
  for (i = 0; i < len; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
};
Invert$1.Invert = Invert;
var Kaleidoscope$1 = {};
Object.defineProperty(Kaleidoscope$1, "__esModule", { value: true });
Kaleidoscope$1.Kaleidoscope = void 0;
const Factory_1$7 = Factory;
const Node_1$7 = Node$1;
const Util_1$1 = Util;
const Validators_1$7 = Validators;
var ToPolar = function(src, dst, opt) {
  var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, r = 0, g = 0, b = 0, a = 0;
  var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
  x = xSize - xMid;
  y = ySize - yMid;
  rad = Math.sqrt(x * x + y * y);
  rMax = rad > rMax ? rad : rMax;
  var rSize = ySize, tSize = xSize, radius, theta;
  var conversion = 360 / tSize * Math.PI / 180, sin, cos;
  for (theta = 0; theta < tSize; theta += 1) {
    sin = Math.sin(theta * conversion);
    cos = Math.cos(theta * conversion);
    for (radius = 0; radius < rSize; radius += 1) {
      x = Math.floor(xMid + rMax * radius / rSize * cos);
      y = Math.floor(yMid + rMax * radius / rSize * sin);
      i = (y * xSize + x) * 4;
      r = srcPixels[i + 0];
      g = srcPixels[i + 1];
      b = srcPixels[i + 2];
      a = srcPixels[i + 3];
      i = (theta + radius * xSize) * 4;
      dstPixels[i + 0] = r;
      dstPixels[i + 1] = g;
      dstPixels[i + 2] = b;
      dstPixels[i + 3] = a;
    }
  }
};
var FromPolar = function(src, dst, opt) {
  var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, dx, dy, r = 0, g = 0, b = 0, a = 0;
  var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
  x = xSize - xMid;
  y = ySize - yMid;
  rad = Math.sqrt(x * x + y * y);
  rMax = rad > rMax ? rad : rMax;
  var rSize = ySize, tSize = xSize, radius, theta, phaseShift = opt.polarRotation || 0;
  var x1, y1;
  for (x = 0; x < xSize; x += 1) {
    for (y = 0; y < ySize; y += 1) {
      dx = x - xMid;
      dy = y - yMid;
      radius = Math.sqrt(dx * dx + dy * dy) * rSize / rMax;
      theta = (Math.atan2(dy, dx) * 180 / Math.PI + 360 + phaseShift) % 360;
      theta = theta * tSize / 360;
      x1 = Math.floor(theta);
      y1 = Math.floor(radius);
      i = (y1 * xSize + x1) * 4;
      r = srcPixels[i + 0];
      g = srcPixels[i + 1];
      b = srcPixels[i + 2];
      a = srcPixels[i + 3];
      i = (y * xSize + x) * 4;
      dstPixels[i + 0] = r;
      dstPixels[i + 1] = g;
      dstPixels[i + 2] = b;
      dstPixels[i + 3] = a;
    }
  }
};
const Kaleidoscope = function(imageData) {
  var xSize = imageData.width, ySize = imageData.height;
  var x, y, xoff, i, r, g, b, a, srcPos, dstPos;
  var power = Math.round(this.kaleidoscopePower());
  var angle = Math.round(this.kaleidoscopeAngle());
  var offset = Math.floor(xSize * (angle % 360) / 360);
  if (power < 1) {
    return;
  }
  var tempCanvas = Util_1$1.Util.createCanvasElement();
  tempCanvas.width = xSize;
  tempCanvas.height = ySize;
  var scratchData = tempCanvas.getContext("2d").getImageData(0, 0, xSize, ySize);
  Util_1$1.Util.releaseCanvas(tempCanvas);
  ToPolar(imageData, scratchData, {
    polarCenterX: xSize / 2,
    polarCenterY: ySize / 2
  });
  var minSectionSize = xSize / Math.pow(2, power);
  while (minSectionSize <= 8) {
    minSectionSize = minSectionSize * 2;
    power -= 1;
  }
  minSectionSize = Math.ceil(minSectionSize);
  var sectionSize = minSectionSize;
  var xStart = 0, xEnd = sectionSize, xDelta = 1;
  if (offset + minSectionSize > xSize) {
    xStart = sectionSize;
    xEnd = 0;
    xDelta = -1;
  }
  for (y = 0; y < ySize; y += 1) {
    for (x = xStart; x !== xEnd; x += xDelta) {
      xoff = Math.round(x + offset) % xSize;
      srcPos = (xSize * y + xoff) * 4;
      r = scratchData.data[srcPos + 0];
      g = scratchData.data[srcPos + 1];
      b = scratchData.data[srcPos + 2];
      a = scratchData.data[srcPos + 3];
      dstPos = (xSize * y + x) * 4;
      scratchData.data[dstPos + 0] = r;
      scratchData.data[dstPos + 1] = g;
      scratchData.data[dstPos + 2] = b;
      scratchData.data[dstPos + 3] = a;
    }
  }
  for (y = 0; y < ySize; y += 1) {
    sectionSize = Math.floor(minSectionSize);
    for (i = 0; i < power; i += 1) {
      for (x = 0; x < sectionSize + 1; x += 1) {
        srcPos = (xSize * y + x) * 4;
        r = scratchData.data[srcPos + 0];
        g = scratchData.data[srcPos + 1];
        b = scratchData.data[srcPos + 2];
        a = scratchData.data[srcPos + 3];
        dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
        scratchData.data[dstPos + 0] = r;
        scratchData.data[dstPos + 1] = g;
        scratchData.data[dstPos + 2] = b;
        scratchData.data[dstPos + 3] = a;
      }
      sectionSize *= 2;
    }
  }
  FromPolar(scratchData, imageData, { polarRotation: 0 });
};
Kaleidoscope$1.Kaleidoscope = Kaleidoscope;
Factory_1$7.Factory.addGetterSetter(Node_1$7.Node, "kaleidoscopePower", 2, (0, Validators_1$7.getNumberValidator)(), Factory_1$7.Factory.afterSetFilter);
Factory_1$7.Factory.addGetterSetter(Node_1$7.Node, "kaleidoscopeAngle", 0, (0, Validators_1$7.getNumberValidator)(), Factory_1$7.Factory.afterSetFilter);
var Mask$1 = {};
Object.defineProperty(Mask$1, "__esModule", { value: true });
Mask$1.Mask = void 0;
const Factory_1$6 = Factory;
const Node_1$6 = Node$1;
const Validators_1$6 = Validators;
function pixelAt(idata, x, y) {
  var idx = (y * idata.width + x) * 4;
  var d = [];
  d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
  return d;
}
function rgbDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[2] - p2[2], 2));
}
function rgbMean(pTab) {
  var m = [0, 0, 0];
  for (var i = 0; i < pTab.length; i++) {
    m[0] += pTab[i][0];
    m[1] += pTab[i][1];
    m[2] += pTab[i][2];
  }
  m[0] /= pTab.length;
  m[1] /= pTab.length;
  m[2] /= pTab.length;
  return m;
}
function backgroundMask(idata, threshold) {
  var rgbv_no = pixelAt(idata, 0, 0);
  var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
  var rgbv_so = pixelAt(idata, 0, idata.height - 1);
  var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
  var thres = threshold || 10;
  if (rgbDistance(rgbv_no, rgbv_ne) < thres && rgbDistance(rgbv_ne, rgbv_se) < thres && rgbDistance(rgbv_se, rgbv_so) < thres && rgbDistance(rgbv_so, rgbv_no) < thres) {
    var mean2 = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
    var mask = [];
    for (var i = 0; i < idata.width * idata.height; i++) {
      var d = rgbDistance(mean2, [
        idata.data[i * 4],
        idata.data[i * 4 + 1],
        idata.data[i * 4 + 2]
      ]);
      mask[i] = d < thres ? 0 : 255;
    }
    return mask;
  }
}
function applyMask(idata, mask) {
  for (var i = 0; i < idata.width * idata.height; i++) {
    idata.data[4 * i + 3] = mask[i];
  }
}
function erodeMask(mask, sw, sh) {
  var weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);
  var maskResult = [];
  for (var y = 0; y < sh; y++) {
    for (var x = 0; x < sw; x++) {
      var so = y * sw + x;
      var a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = y + cy - halfSide;
          var scx = x + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = scy * sw + scx;
            var wt = weights[cy * side + cx];
            a += mask[srcOff] * wt;
          }
        }
      }
      maskResult[so] = a === 255 * 8 ? 255 : 0;
    }
  }
  return maskResult;
}
function dilateMask(mask, sw, sh) {
  var weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);
  var maskResult = [];
  for (var y = 0; y < sh; y++) {
    for (var x = 0; x < sw; x++) {
      var so = y * sw + x;
      var a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = y + cy - halfSide;
          var scx = x + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = scy * sw + scx;
            var wt = weights[cy * side + cx];
            a += mask[srcOff] * wt;
          }
        }
      }
      maskResult[so] = a >= 255 * 4 ? 255 : 0;
    }
  }
  return maskResult;
}
function smoothEdgeMask(mask, sw, sh) {
  var weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);
  var maskResult = [];
  for (var y = 0; y < sh; y++) {
    for (var x = 0; x < sw; x++) {
      var so = y * sw + x;
      var a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = y + cy - halfSide;
          var scx = x + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = scy * sw + scx;
            var wt = weights[cy * side + cx];
            a += mask[srcOff] * wt;
          }
        }
      }
      maskResult[so] = a;
    }
  }
  return maskResult;
}
const Mask = function(imageData) {
  var threshold = this.threshold(), mask = backgroundMask(imageData, threshold);
  if (mask) {
    mask = erodeMask(mask, imageData.width, imageData.height);
    mask = dilateMask(mask, imageData.width, imageData.height);
    mask = smoothEdgeMask(mask, imageData.width, imageData.height);
    applyMask(imageData, mask);
  }
  return imageData;
};
Mask$1.Mask = Mask;
Factory_1$6.Factory.addGetterSetter(Node_1$6.Node, "threshold", 0, (0, Validators_1$6.getNumberValidator)(), Factory_1$6.Factory.afterSetFilter);
var Noise$1 = {};
Object.defineProperty(Noise$1, "__esModule", { value: true });
Noise$1.Noise = void 0;
const Factory_1$5 = Factory;
const Node_1$5 = Node$1;
const Validators_1$5 = Validators;
const Noise = function(imageData) {
  var amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2, i;
  for (i = 0; i < nPixels; i += 4) {
    data[i + 0] += half - 2 * half * Math.random();
    data[i + 1] += half - 2 * half * Math.random();
    data[i + 2] += half - 2 * half * Math.random();
  }
};
Noise$1.Noise = Noise;
Factory_1$5.Factory.addGetterSetter(Node_1$5.Node, "noise", 0.2, (0, Validators_1$5.getNumberValidator)(), Factory_1$5.Factory.afterSetFilter);
var Pixelate$1 = {};
Object.defineProperty(Pixelate$1, "__esModule", { value: true });
Pixelate$1.Pixelate = void 0;
const Factory_1$4 = Factory;
const Util_1 = Util;
const Node_1$4 = Node$1;
const Validators_1$4 = Validators;
const Pixelate = function(imageData) {
  var pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, x, y, i, red, green, blue, alpha, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), xBinStart, xBinEnd, yBinStart, yBinEnd, xBin, yBin, pixelsInBin, data = imageData.data;
  if (pixelSize <= 0) {
    Util_1.Util.error("pixelSize value can not be <= 0");
    return;
  }
  for (xBin = 0; xBin < nBinsX; xBin += 1) {
    for (yBin = 0; yBin < nBinsY; yBin += 1) {
      red = 0;
      green = 0;
      blue = 0;
      alpha = 0;
      xBinStart = xBin * pixelSize;
      xBinEnd = xBinStart + pixelSize;
      yBinStart = yBin * pixelSize;
      yBinEnd = yBinStart + pixelSize;
      pixelsInBin = 0;
      for (x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
          i = (width * y + x) * 4;
          red += data[i + 0];
          green += data[i + 1];
          blue += data[i + 2];
          alpha += data[i + 3];
          pixelsInBin += 1;
        }
      }
      red = red / pixelsInBin;
      green = green / pixelsInBin;
      blue = blue / pixelsInBin;
      alpha = alpha / pixelsInBin;
      for (x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
          i = (width * y + x) * 4;
          data[i + 0] = red;
          data[i + 1] = green;
          data[i + 2] = blue;
          data[i + 3] = alpha;
        }
      }
    }
  }
};
Pixelate$1.Pixelate = Pixelate;
Factory_1$4.Factory.addGetterSetter(Node_1$4.Node, "pixelSize", 8, (0, Validators_1$4.getNumberValidator)(), Factory_1$4.Factory.afterSetFilter);
var Posterize$1 = {};
Object.defineProperty(Posterize$1, "__esModule", { value: true });
Posterize$1.Posterize = void 0;
const Factory_1$3 = Factory;
const Node_1$3 = Node$1;
const Validators_1$3 = Validators;
const Posterize = function(imageData) {
  var levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels, i;
  for (i = 0; i < len; i += 1) {
    data[i] = Math.floor(data[i] / scale) * scale;
  }
};
Posterize$1.Posterize = Posterize;
Factory_1$3.Factory.addGetterSetter(Node_1$3.Node, "levels", 0.5, (0, Validators_1$3.getNumberValidator)(), Factory_1$3.Factory.afterSetFilter);
var RGB$1 = {};
Object.defineProperty(RGB$1, "__esModule", { value: true });
RGB$1.RGB = void 0;
const Factory_1$2 = Factory;
const Node_1$2 = Node$1;
const Validators_1$2 = Validators;
const RGB = function(imageData) {
  var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), i, brightness;
  for (i = 0; i < nPixels; i += 4) {
    brightness = (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
    data[i] = brightness * red;
    data[i + 1] = brightness * green;
    data[i + 2] = brightness * blue;
    data[i + 3] = data[i + 3];
  }
};
RGB$1.RGB = RGB;
Factory_1$2.Factory.addGetterSetter(Node_1$2.Node, "red", 0, function(val) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
Factory_1$2.Factory.addGetterSetter(Node_1$2.Node, "green", 0, function(val) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
Factory_1$2.Factory.addGetterSetter(Node_1$2.Node, "blue", 0, Validators_1$2.RGBComponent, Factory_1$2.Factory.afterSetFilter);
var RGBA$1 = {};
Object.defineProperty(RGBA$1, "__esModule", { value: true });
RGBA$1.RGBA = void 0;
const Factory_1$1 = Factory;
const Node_1$1 = Node$1;
const Validators_1$1 = Validators;
const RGBA = function(imageData) {
  var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha(), i, ia;
  for (i = 0; i < nPixels; i += 4) {
    ia = 1 - alpha;
    data[i] = red * alpha + data[i] * ia;
    data[i + 1] = green * alpha + data[i + 1] * ia;
    data[i + 2] = blue * alpha + data[i + 2] * ia;
  }
};
RGBA$1.RGBA = RGBA;
Factory_1$1.Factory.addGetterSetter(Node_1$1.Node, "red", 0, function(val) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
Factory_1$1.Factory.addGetterSetter(Node_1$1.Node, "green", 0, function(val) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
Factory_1$1.Factory.addGetterSetter(Node_1$1.Node, "blue", 0, Validators_1$1.RGBComponent, Factory_1$1.Factory.afterSetFilter);
Factory_1$1.Factory.addGetterSetter(Node_1$1.Node, "alpha", 1, function(val) {
  this._filterUpToDate = false;
  if (val > 1) {
    return 1;
  } else if (val < 0) {
    return 0;
  } else {
    return val;
  }
});
var Sepia$1 = {};
Object.defineProperty(Sepia$1, "__esModule", { value: true });
Sepia$1.Sepia = void 0;
const Sepia = function(imageData) {
  var data = imageData.data, nPixels = data.length, i, r, g, b;
  for (i = 0; i < nPixels; i += 4) {
    r = data[i + 0];
    g = data[i + 1];
    b = data[i + 2];
    data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }
};
Sepia$1.Sepia = Sepia;
var Solarize$1 = {};
Object.defineProperty(Solarize$1, "__esModule", { value: true });
Solarize$1.Solarize = void 0;
const Solarize = function(imageData) {
  var data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
  do {
    var offsetY = (y - 1) * w4;
    var x = w;
    do {
      var offset = offsetY + (x - 1) * 4;
      var r = data[offset];
      var g = data[offset + 1];
      var b = data[offset + 2];
      if (r > 127) {
        r = 255 - r;
      }
      if (g > 127) {
        g = 255 - g;
      }
      if (b > 127) {
        b = 255 - b;
      }
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
    } while (--x);
  } while (--y);
};
Solarize$1.Solarize = Solarize;
var Threshold$1 = {};
Object.defineProperty(Threshold$1, "__esModule", { value: true });
Threshold$1.Threshold = void 0;
const Factory_1 = Factory;
const Node_1 = Node$1;
const Validators_1 = Validators;
const Threshold = function(imageData) {
  var level = this.threshold() * 255, data = imageData.data, len = data.length, i;
  for (i = 0; i < len; i += 1) {
    data[i] = data[i] < level ? 0 : 255;
  }
};
Threshold$1.Threshold = Threshold;
Factory_1.Factory.addGetterSetter(Node_1.Node, "threshold", 0.5, (0, Validators_1.getNumberValidator)(), Factory_1.Factory.afterSetFilter);
Object.defineProperty(_FullInternals, "__esModule", { value: true });
_FullInternals.Konva = void 0;
const _CoreInternals_1 = _CoreInternals;
const Arc_1 = Arc$1;
const Arrow_1 = Arrow$1;
const Circle_1 = Circle$1;
const Ellipse_1 = Ellipse$1;
const Image_1 = Image$2;
const Label_1 = Label$1;
const Line_1 = Line$1;
const Path_1 = Path$1;
const Rect_1 = Rect$1;
const RegularPolygon_1 = RegularPolygon$1;
const Ring_1 = Ring$1;
const Sprite_1 = Sprite$1;
const Star_1 = Star$1;
const Text_1 = Text$1;
const TextPath_1 = TextPath$1;
const Transformer_1 = Transformer$1;
const Wedge_1 = Wedge$1;
const Blur_1 = Blur$1;
const Brighten_1 = Brighten$1;
const Contrast_1 = Contrast$1;
const Emboss_1 = Emboss$1;
const Enhance_1 = Enhance$1;
const Grayscale_1 = Grayscale$1;
const HSL_1 = HSL$1;
const HSV_1 = HSV$1;
const Invert_1 = Invert$1;
const Kaleidoscope_1 = Kaleidoscope$1;
const Mask_1 = Mask$1;
const Noise_1 = Noise$1;
const Pixelate_1 = Pixelate$1;
const Posterize_1 = Posterize$1;
const RGB_1 = RGB$1;
const RGBA_1 = RGBA$1;
const Sepia_1 = Sepia$1;
const Solarize_1 = Solarize$1;
const Threshold_1 = Threshold$1;
_FullInternals.Konva = _CoreInternals_1.Konva.Util._assign(_CoreInternals_1.Konva, {
  Arc: Arc_1.Arc,
  Arrow: Arrow_1.Arrow,
  Circle: Circle_1.Circle,
  Ellipse: Ellipse_1.Ellipse,
  Image: Image_1.Image,
  Label: Label_1.Label,
  Tag: Label_1.Tag,
  Line: Line_1.Line,
  Path: Path_1.Path,
  Rect: Rect_1.Rect,
  RegularPolygon: RegularPolygon_1.RegularPolygon,
  Ring: Ring_1.Ring,
  Sprite: Sprite_1.Sprite,
  Star: Star_1.Star,
  Text: Text_1.Text,
  TextPath: TextPath_1.TextPath,
  Transformer: Transformer_1.Transformer,
  Wedge: Wedge_1.Wedge,
  Filters: {
    Blur: Blur_1.Blur,
    Brighten: Brighten_1.Brighten,
    Contrast: Contrast_1.Contrast,
    Emboss: Emboss_1.Emboss,
    Enhance: Enhance_1.Enhance,
    Grayscale: Grayscale_1.Grayscale,
    HSL: HSL_1.HSL,
    HSV: HSV_1.HSV,
    Invert: Invert_1.Invert,
    Kaleidoscope: Kaleidoscope_1.Kaleidoscope,
    Mask: Mask_1.Mask,
    Noise: Noise_1.Noise,
    Pixelate: Pixelate_1.Pixelate,
    Posterize: Posterize_1.Posterize,
    RGB: RGB_1.RGB,
    RGBA: RGBA_1.RGBA,
    Sepia: Sepia_1.Sepia,
    Solarize: Solarize_1.Solarize,
    Threshold: Threshold_1.Threshold
  }
});
var lib = lib$1.exports;
Object.defineProperty(lib, "__esModule", { value: true });
const _FullInternals_1 = _FullInternals;
lib$1.exports = _FullInternals_1.Konva;
var libExports = lib$1.exports;
const Konva = /* @__PURE__ */ getDefaultExportFromCjs(libExports);
var MouseButton = /* @__PURE__ */ ((MouseButton2) => {
  MouseButton2[MouseButton2["左键"] = 0] = "左键";
  MouseButton2[MouseButton2["右键"] = 2] = "右键";
  return MouseButton2;
})(MouseButton || {});
class BaseDraw {
  constructor(render, layer) {
    __publicField(this, "render");
    __publicField(this, "layer");
    __publicField(this, "group");
    this.render = render;
    this.layer = layer;
    this.group = new Konva.Group();
  }
  init() {
    this.layer.add(this.group);
    this.draw();
  }
  draw() {
  }
  clear() {
    this.group.removeChildren();
  }
}
var MoveKey = /* @__PURE__ */ ((MoveKey2) => {
  MoveKey2["上"] = "ArrowUp";
  MoveKey2["左"] = "ArrowLeft";
  MoveKey2["右"] = "ArrowRight";
  MoveKey2["下"] = "ArrowDown";
  return MoveKey2;
})(MoveKey || {});
var ShutcutKey = /* @__PURE__ */ ((ShutcutKey2) => {
  ShutcutKey2["删除"] = "Delete";
  ShutcutKey2["C"] = "KeyC";
  ShutcutKey2["V"] = "KeyV";
  ShutcutKey2["Z"] = "KeyZ";
  return ShutcutKey2;
})(ShutcutKey || {});
class BgDraw extends BaseDraw {
  constructor(render, layer, option) {
    super(render, layer);
    __publicField(this, "option");
    this.option = option;
    this.group.listening(false);
  }
  draw() {
    if (this.render.config.showBg) {
      this.clear();
      const stageState = this.render.getStageState();
      const cellSize = this.option.size;
      const lenX = Math.ceil(this.render.toStageValue(stageState.width) / cellSize);
      const lenY = Math.ceil(this.render.toStageValue(stageState.height) / cellSize);
      const startX = -Math.ceil(this.render.toStageValue(stageState.x) / cellSize);
      const startY = -Math.ceil(this.render.toStageValue(stageState.y) / cellSize);
      const group = new Konva.Group();
      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: stageState.width,
          height: stageState.height,
          stroke: "rgba(255,0,0,0.2)",
          strokeWidth: this.render.toStageValue(2),
          listening: false,
          dash: [this.render.toStageValue(6), this.render.toStageValue(6)]
        })
      );
      for (let x = startX; x < lenX + startX + 2; x++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: lodash.flatten([
              [cellSize * x, this.render.toStageValue(-stageState.y + this.render.rulerSize)],
              [
                cellSize * x,
                this.render.toStageValue(stageState.height - stageState.y + this.render.rulerSize)
              ]
            ]),
            stroke: "#ddd",
            strokeWidth: this.render.toStageValue(1),
            listening: false
          })
        );
      }
      for (let y = startY; y < lenY + startY + 2; y++) {
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: lodash.flatten([
              [this.render.toStageValue(-stageState.x + this.render.rulerSize), cellSize * y],
              [
                this.render.toStageValue(stageState.width - stageState.x + this.render.rulerSize),
                cellSize * y
              ]
            ]),
            stroke: "#ddd",
            strokeWidth: this.render.toStageValue(1),
            listening: false
          })
        );
      }
      this.group.add(group);
    }
  }
}
__publicField(BgDraw, "name", "bg");
class RulerDraw extends BaseDraw {
  constructor(render, layer, option) {
    super(render, layer);
    __publicField(this, "option");
    this.option = option;
    this.group.listening(false);
  }
  draw() {
    if (this.render.config.showRuler) {
      this.clear();
      const stageState = this.render.getStageState();
      const cellSize = 20;
      const fontSizeMax = 12;
      const lenX = Math.ceil(this.render.toStageValue(stageState.width) / cellSize);
      const lenY = Math.ceil(this.render.toStageValue(stageState.height) / cellSize);
      const startX = -Math.ceil(
        this.render.toStageValue(stageState.x - this.option.size) / cellSize
      );
      const startY = -Math.ceil(
        this.render.toStageValue(stageState.y - this.option.size) / cellSize
      );
      const group = new Konva.Group();
      const groupTop = new Konva.Group({
        x: this.render.toStageValue(-stageState.x + this.option.size),
        y: this.render.toStageValue(-stageState.y),
        width: this.render.toStageValue(
          stageState.width - this.option.size + this.render.rulerSize
        ),
        height: this.render.toStageValue(this.option.size)
      });
      const groupLeft = new Konva.Group({
        x: this.render.toStageValue(-stageState.x),
        y: this.render.toStageValue(-stageState.y + this.option.size),
        width: this.render.toStageValue(this.option.size),
        height: this.render.toStageValue(
          stageState.height - this.option.size + this.render.rulerSize
        )
      });
      {
        groupTop.add(
          // 上
          new Konva.Rect({
            name: this.constructor.name,
            x: 0,
            y: 0,
            width: groupTop.width(),
            height: groupTop.height(),
            fill: "#ddd"
          })
        );
        for (let x = lenX + startX - 1; x >= startX; x--) {
          const nx = -groupTop.x() + cellSize * x;
          const long = this.render.toStageValue(this.option.size) / 5 * 4;
          const short = this.render.toStageValue(this.option.size) / 5 * 3;
          if (nx >= 0) {
            groupTop.add(
              new Konva.Line({
                name: this.constructor.name,
                points: lodash.flatten([
                  [nx, x % 5 ? long : short],
                  [nx, this.render.toStageValue(this.option.size)]
                ]),
                stroke: "#999",
                strokeWidth: this.render.toStageValue(1),
                listening: false
              })
            );
            if (x % 5 === 0) {
              let fontSize = fontSizeMax;
              const text = new Konva.Text({
                name: this.constructor.name,
                y: this.render.toStageValue(this.option.size / 2 - fontSize),
                text: (x * cellSize).toString(),
                fontSize: this.render.toStageValue(fontSize),
                fill: "#999",
                align: "center",
                verticalAlign: "bottom",
                lineHeight: 1.6
              });
              while (this.render.toStageValue(text.width()) > this.render.toStageValue(cellSize) * 4.6) {
                fontSize -= 1;
                text.fontSize(this.render.toStageValue(fontSize));
                text.y(this.render.toStageValue(this.option.size / 2 - fontSize) / 2);
              }
              text.x(nx - text.width() / 2);
              groupTop.add(text);
            }
          }
        }
      }
      {
        groupLeft.add(
          // 左
          new Konva.Rect({
            name: this.constructor.name,
            x: 0,
            y: 0,
            width: groupLeft.width(),
            height: groupLeft.height(),
            fill: "#ddd"
          })
        );
        for (let y = lenY + startY - 1; y >= startY; y--) {
          const ny = -groupLeft.y() + cellSize * y;
          const long = this.render.toStageValue(this.option.size) / 5 * 4;
          const short = this.render.toStageValue(this.option.size) / 5 * 3;
          if (ny >= 0) {
            groupLeft.add(
              new Konva.Line({
                name: this.constructor.name,
                points: lodash.flatten([
                  [y % 5 ? long : short, ny],
                  [this.render.toStageValue(this.option.size), ny]
                ]),
                stroke: "#999",
                strokeWidth: this.render.toStageValue(1),
                listening: false
              })
            );
            if (y % 5 === 0) {
              let fontSize = fontSizeMax;
              const text = new Konva.Text({
                name: this.constructor.name,
                x: 0,
                y: ny,
                text: (y * cellSize).toString(),
                fontSize: this.render.toStageValue(fontSize),
                fill: "#999",
                align: "right",
                verticalAlign: "bottom",
                lineHeight: 1.6,
                wrap: "none"
              });
              while (text.width() > short * 0.8) {
                fontSize -= 1;
                text.fontSize(this.render.toStageValue(fontSize));
              }
              text.y(ny - text.height() / 2);
              text.width(short - this.render.toStageValue(1));
              groupLeft.add(text);
            }
          }
        }
      }
      group.add(
        // 角
        new Konva.Rect({
          name: this.constructor.name,
          x: this.render.toStageValue(-stageState.x),
          y: this.render.toStageValue(-stageState.y),
          width: this.render.toStageValue(this.option.size),
          height: this.render.toStageValue(this.option.size),
          fill: "#ddd"
        })
      );
      group.add(
        // 倍率
        new Konva.Text({
          name: this.constructor.name,
          x: this.render.toStageValue(-stageState.x),
          y: this.render.toStageValue(-stageState.y),
          text: `x${stageState.scale.toFixed(1)}`,
          fontSize: this.render.toStageValue(14),
          fill: "blue",
          align: "center",
          verticalAlign: "middle",
          width: this.render.toStageValue(this.option.size),
          height: this.render.toStageValue(this.option.size)
        })
      );
      group.add(groupTop);
      group.add(groupLeft);
      this.group.add(group);
    }
  }
}
__publicField(RulerDraw, "name", "ruler");
class RefLineDraw extends BaseDraw {
  constructor(render, layer, option) {
    super(render, layer);
    __publicField(this, "option");
    __publicField(this, "handlers", {
      dom: {
        mousemove: () => {
          this.draw();
        },
        mouseout: () => {
          this.clear();
        }
      }
    });
    this.option = option;
    this.group.listening(false);
  }
  draw() {
    if (this.render.config.showRefLine) {
      this.clear();
      const stageState = this.render.getStageState();
      const group = new Konva.Group();
      const pos = this.render.stage.getPointerPosition();
      if (pos) {
        if (pos.y >= this.option.padding) {
          group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: lodash.flatten([
                [
                  this.render.toStageValue(-stageState.x),
                  this.render.toStageValue(pos.y - stageState.y)
                ],
                [
                  this.render.toStageValue(stageState.width - stageState.x + this.render.rulerSize),
                  this.render.toStageValue(pos.y - stageState.y)
                ]
              ]),
              stroke: "rgba(255,0,0,0.2)",
              strokeWidth: this.render.toStageValue(1),
              listening: false
            })
          );
        }
        if (pos.x >= this.option.padding) {
          group.add(
            new Konva.Line({
              name: this.constructor.name,
              points: lodash.flatten([
                [
                  this.render.toStageValue(pos.x - stageState.x),
                  this.render.toStageValue(-stageState.y)
                ],
                [
                  this.render.toStageValue(pos.x - stageState.x),
                  this.render.toStageValue(stageState.height - stageState.y + this.render.rulerSize)
                ]
              ]),
              stroke: "rgba(255,0,0,0.2)",
              strokeWidth: this.render.toStageValue(1),
              listening: false
            })
          );
        }
      }
      this.group.add(group);
    }
  }
}
__publicField(RefLineDraw, "name", "refLine");
class ContextmenuDraw extends BaseDraw {
  constructor(render, layer, option) {
    super(render, layer);
    __publicField(this, "option");
    __publicField(this, "state");
    __publicField(this, "handlers", {
      stage: {
        mousedown: (e) => {
          this.state.lastPos = this.render.stage.getPointerPosition();
          if (e.evt.button === MouseButton.左键) {
            if (!this.state.menuIsMousedown) {
              this.state.target = null;
              this.draw();
            }
          } else if (e.evt.button === MouseButton.右键) {
            this.state.right = true;
          }
        },
        mousemove: () => {
          if (this.state.target && this.state.right) {
            this.state.target = null;
            this.draw();
          }
        },
        mouseup: () => {
          this.state.right = false;
        },
        contextmenu: (e) => {
          const pos = this.render.stage.getPointerPosition();
          if (pos && this.state.lastPos) {
            if (pos.x === this.state.lastPos.x || pos.y === this.state.lastPos.y) {
              this.state.target = e.target;
            } else {
              this.state.target = null;
            }
            this.draw();
          }
        },
        wheel: () => {
          this.state.target = null;
          this.draw();
        }
      }
    });
    this.option = option;
    this.state = { target: null, menuIsMousedown: false, lastPos: null, right: false };
  }
  draw() {
    this.clear();
    if (this.state.target) {
      const menus = [];
      if (this.state.target === this.render.stage) {
        menus.push({
          name: "恢复位置",
          action: () => {
            this.render.positionTool.positionReset();
          }
        });
        menus.push({
          name: "恢复大小位置",
          action: () => {
            this.render.positionTool.positionZoomReset();
          }
        });
      } else {
        const target = this.state.target.parent;
        menus.push({
          name: "复制",
          action: () => {
            if (target) {
              this.render.copyTool.copy([target]);
            }
          }
        });
        menus.push({
          name: "删除",
          action: () => {
            if (target) {
              this.render.remove([target]);
            }
          }
        });
        menus.push({
          name: "上移",
          action: () => {
            if (target) {
              this.render.zIndexTool.up([target]);
            }
          }
        });
        menus.push({
          name: "下移",
          action: () => {
            if (target) {
              this.render.zIndexTool.down([target]);
            }
          }
        });
        menus.push({
          name: "置顶",
          action: () => {
            if (target) {
              this.render.zIndexTool.top([target]);
            }
          }
        });
        menus.push({
          name: "置底",
          action: () => {
            if (target) {
              this.render.zIndexTool.bottom([target]);
            }
          }
        });
      }
      const stageState = this.render.getStageState();
      const group = new Konva.Group({
        name: "contextmenu",
        width: stageState.width,
        height: stageState.height
      });
      let top = 0;
      const lineHeight = 30;
      const pos = this.render.stage.getPointerPosition();
      if (pos) {
        for (const menu of menus) {
          const rect = new Konva.Rect({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            width: this.render.toStageValue(100),
            height: this.render.toStageValue(lineHeight),
            fill: "#fff",
            stroke: "#999",
            strokeWidth: this.render.toStageValue(1),
            name: "contextmenu"
          });
          const text = new Konva.Text({
            x: this.render.toStageValue(pos.x - stageState.x),
            y: this.render.toStageValue(pos.y + top - stageState.y),
            text: menu.name,
            name: "contextmenu",
            listening: false,
            fontSize: this.render.toStageValue(16),
            fill: "#333",
            width: this.render.toStageValue(100),
            height: this.render.toStageValue(lineHeight),
            align: "center",
            verticalAlign: "middle"
          });
          group.add(rect);
          group.add(text);
          rect.on("click", (e) => {
            if (e.evt.button === MouseButton.左键) {
              menu.action(e);
              this.group.removeChildren();
              this.state.target = null;
            }
            e.evt.preventDefault();
            e.evt.stopPropagation();
          });
          rect.on("mousedown", (e) => {
            if (e.evt.button === MouseButton.左键) {
              this.state.menuIsMousedown = true;
              rect.fill("#dfdfdf");
            }
            e.evt.preventDefault();
            e.evt.stopPropagation();
          });
          rect.on("mouseup", (e) => {
            if (e.evt.button === MouseButton.左键) {
              this.state.menuIsMousedown = false;
            }
          });
          rect.on("mouseenter", (e) => {
            if (this.state.menuIsMousedown) {
              rect.fill("#dfdfdf");
            } else {
              rect.fill("#efefef");
            }
            e.evt.preventDefault();
            e.evt.stopPropagation();
          });
          rect.on("mouseout", () => {
            rect.fill("#fff");
          });
          rect.on("contextmenu", (e) => {
            e.evt.preventDefault();
            e.evt.stopPropagation();
          });
          top += lineHeight - 1;
        }
      }
      this.group.add(group);
    }
  }
}
__publicField(ContextmenuDraw, "name", "contextmenu");
class PreviewDraw extends BaseDraw {
  constructor(render, layer, option) {
    super(render, layer);
    __publicField(this, "option");
    __publicField(this, "state", {
      moving: false
      // 正在预览框内部拖动
    });
    this.option = option;
  }
  draw() {
    if (this.render.config.showPreview) {
      this.clear();
      const stageState = this.render.getStageState();
      const previewMargin = 20;
      const group = new Konva.Group({
        name: "preview",
        scale: {
          x: this.render.toStageValue(this.option.size),
          y: this.render.toStageValue(this.option.size)
        },
        width: stageState.width,
        height: stageState.height
      });
      const main = this.render.stage.find("#main")[0];
      const nodes = main.getChildren((node) => {
        return !this.render.ignore(node);
      });
      let minX = 0;
      let maxX = group.width();
      let minY = 0;
      let maxY = group.height();
      for (const node of nodes) {
        const x = node.x();
        const y = node.y();
        const width = node.width();
        const height = node.height();
        if (x < minX) {
          minX = x;
        }
        if (x + width > maxX) {
          maxX = x + width;
        }
        if (y < minY) {
          minY = y;
        }
        if (y + height > maxY) {
          maxY = y + height;
        }
      }
      group.setAttrs({
        x: this.render.toStageValue(
          -stageState.x + this.render.rulerSize + stageState.width - maxX * this.option.size - previewMargin
        ),
        y: this.render.toStageValue(
          -stageState.y + this.render.rulerSize + stageState.height - maxY * this.option.size - previewMargin
        ),
        width: maxX - minX,
        height: maxY - minY
      });
      const bg = new Konva.Rect({
        name: this.constructor.name,
        x: minX,
        y: minY,
        width: group.width(),
        height: group.height(),
        stroke: "#666",
        strokeWidth: this.render.toStageValue(1),
        fill: "#eee"
      });
      const move = () => {
        this.state.moving = true;
        const pos = this.render.stage.getPointerPosition();
        if (pos) {
          const pWidth = group.width() * this.option.size;
          const pHeight = group.height() * this.option.size;
          const pOffsetX = pWidth - (stageState.width - pos.x - previewMargin);
          const pOffsetY = pHeight - (stageState.height - pos.y - previewMargin);
          const offsetX = pOffsetX / this.option.size;
          const offsetY = pOffsetY / this.option.size;
          this.render.positionTool.updateCenter(
            offsetX - this.render.rulerSize / this.option.size,
            offsetY - this.render.rulerSize / this.option.size
          );
        }
      };
      bg.on("mousedown", (e) => {
        if (e.evt.button === MouseButton.左键) {
          move();
        }
        e.evt.preventDefault();
      });
      bg.on("mousemove", (e) => {
        if (this.state.moving) {
          move();
        }
        e.evt.preventDefault();
      });
      bg.on("mouseup", () => {
        this.state.moving = false;
      });
      group.add(bg);
      group.add(
        new Konva.Rect({
          name: this.constructor.name,
          x: 0,
          y: 0,
          width: stageState.width,
          height: stageState.height,
          stroke: "rgba(255,0,0,0.2)",
          strokeWidth: 1 / this.option.size,
          listening: false
        })
      );
      for (const node of nodes) {
        const copy = node.clone();
        copy.listening(false);
        copy.name(this.constructor.name);
        group.add(copy);
      }
      if (stageState.scale > 1) {
        let x1 = this.render.toStageValue(-stageState.x + this.render.rulerSize);
        let y1 = this.render.toStageValue(-stageState.y + this.render.rulerSize);
        x1 = x1 > minX ? x1 : minX;
        x1 = x1 < maxX ? x1 : maxX;
        y1 = y1 > minY ? y1 : minY;
        y1 = y1 < maxY ? y1 : maxY;
        let x2 = this.render.toStageValue(-stageState.x + this.render.rulerSize) + this.render.toStageValue(stageState.width);
        let y2 = this.render.toStageValue(-stageState.y + this.render.rulerSize) + this.render.toStageValue(stageState.height);
        x2 = x2 > minX ? x2 : minX;
        x2 = x2 < maxX ? x2 : maxX;
        y2 = y2 > minY ? y2 : minY;
        y2 = y2 < maxY ? y2 : maxY;
        let points = [];
        if (x1 > minX && x1 < maxX && x2 > minX && x2 < maxX && y1 > minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ];
        }
        if (x1 > minX && x1 < maxX && x2 > minX && x2 < maxX && y1 === minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x2, y1],
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ];
        }
        if (x1 > minX && x1 < maxX && x2 > minX && x2 < maxX && y1 > minY && y1 < maxY && y2 > minY && y2 === maxY) {
          points = [
            [x1, y2],
            [x1, y1],
            [x2, y1],
            [x2, y2]
          ];
        }
        if (x1 === minX && x1 < maxX && x2 > minX && x2 < maxX && y1 > minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2],
            [x1, y2]
          ];
        }
        if (x1 > minX && x1 < maxX && x2 > minX && x2 === maxX && y1 > minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x2, y1],
            [x1, y1],
            [x1, y2],
            [x2, y2]
          ];
        }
        if (x1 === minX && x1 < maxX && x2 > minX && x2 < maxX && y1 === minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x2, y1],
            [x2, y2],
            [x1, y2]
          ];
        }
        if (x1 > minX && x1 < maxX && x2 > minX && x2 === maxX && y1 === minY && y1 < maxY && y2 > minY && y2 < maxY) {
          points = [
            [x2, y2],
            [x1, y2],
            [x1, y1]
          ];
        }
        if (x1 === minX && x1 < maxX && x2 > minX && x2 < maxX && y1 > minY && y1 < maxY && y2 > minY && y2 === maxY) {
          points = [
            [x1, y1],
            [x2, y1],
            [x2, y2]
          ];
        }
        if (x1 > minX && x1 < maxX && x2 > minX && x2 === maxX && y1 > minY && y1 < maxY && y2 > minY && y2 === maxY) {
          points = [
            [x2, y1],
            [x1, y1],
            [x1, y2]
          ];
        }
        group.add(
          new Konva.Line({
            name: this.constructor.name,
            points: lodash.flatten(points),
            stroke: "blue",
            strokeWidth: 1 / this.option.size,
            listening: false
          })
        );
      }
      this.group.add(group);
    }
  }
}
__publicField(PreviewDraw, "name", "preview");
class DragHandlers {
  constructor(render) {
    __publicField(this, "render");
    // 右键是否按下
    __publicField(this, "mousedownRight", false);
    // 右键按下 stage 位置
    __publicField(this, "mousedownStagePos", { x: 0, y: 0 });
    // 右键按下位置
    __publicField(this, "mousedownPointerPos", { x: 0, y: 0 });
    __publicField(this, "handlers", {
      stage: {
        mousedown: (e) => {
          if (e.evt.button === MouseButton.右键) {
            const stageState = this.render.getStageState();
            this.mousedownRight = true;
            this.mousedownStagePos = { x: stageState.x, y: stageState.y };
            const pos = this.render.stage.getPointerPosition();
            if (pos) {
              this.mousedownPointerPos = { x: pos.x, y: pos.y };
            }
            document.body.style.cursor = "pointer";
          }
        },
        mouseup: () => {
          this.mousedownRight = false;
          document.body.style.cursor = "default";
        },
        mousemove: () => {
          if (this.mousedownRight) {
            const pos = this.render.stage.getPointerPosition();
            if (pos) {
              const offsetX = pos.x - this.mousedownPointerPos.x;
              const offsetY = pos.y - this.mousedownPointerPos.y;
              this.render.stage.position({
                x: this.mousedownStagePos.x + offsetX,
                y: this.mousedownStagePos.y + offsetY
              });
              this.render.draws[BgDraw.name].draw();
              this.render.draws[RulerDraw.name].draw();
              this.render.draws[PreviewDraw.name].draw();
            }
          }
        }
      }
    });
    this.render = render;
  }
}
__publicField(DragHandlers, "name", "Drag");
class ZoomHandlers {
  constructor(render) {
    __publicField(this, "render");
    // zoom 速度
    __publicField(this, "scaleBy", 0.1);
    // zoom 范围
    __publicField(this, "scaleMin", 0.5);
    __publicField(this, "scaleMax", 5);
    __publicField(this, "handlers", {
      stage: {
        wheel: (e) => {
          const stageState = this.render.getStageState();
          const oldScale = stageState.scale;
          const pos = this.render.stage.getPointerPosition();
          if (pos) {
            const mousePointTo = {
              x: (pos.x - stageState.x) / oldScale,
              y: (pos.y - stageState.y) / oldScale
            };
            const direction = e.evt.deltaY > 0 ? 1 : -1;
            const newScale = direction > 0 ? oldScale + this.scaleBy : oldScale - this.scaleBy;
            if (newScale >= this.scaleMin && newScale < this.scaleMax) {
              this.render.stage.scale({ x: newScale, y: newScale });
              this.render.stage.position({
                x: pos.x - mousePointTo.x * newScale,
                y: pos.y - mousePointTo.y * newScale
              });
              this.render.draws[BgDraw.name].draw();
              this.render.draws[RulerDraw.name].draw();
              this.render.draws[PreviewDraw.name].draw();
            }
          }
        }
      }
    });
    this.render = render;
  }
}
__publicField(ZoomHandlers, "name", "Zoom");
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (size2 = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size2));
  while (size2--) {
    id += urlAlphabet[bytes[size2] & 63];
  }
  return id;
};
class DragOutsideHandlers {
  constructor(render) {
    __publicField(this, "render");
    __publicField(this, "handlers", {
      dom: {
        dragenter: (e) => {
          this.render.stage.setPointersPositions(e);
          this.render.draws[RefLineDraw.name].draw();
        },
        dragover: (e) => {
          this.render.stage.setPointersPositions(e);
          this.render.draws[RefLineDraw.name].draw();
        },
        drop: (e) => {
          var _a, _b;
          const src = (_a = e.dataTransfer) == null ? void 0 : _a.getData("src");
          const type = (_b = e.dataTransfer) == null ? void 0 : _b.getData("type");
          if (src && type) {
            const stageState = this.render.getStageState();
            this.render.stage.setPointersPositions(e);
            const pos = this.render.stage.getPointerPosition();
            if (pos) {
              this.render.assetTool[type === "svg" ? `loadSvg` : type === "gif" ? "loadGif" : "loadImg"](src).then((image) => {
                const group = new Konva.Group({
                  id: nanoid(),
                  width: image.width(),
                  height: image.height(),
                  name: "asset"
                });
                this.render.layer.add(group);
                image.setAttrs({
                  x: 0,
                  y: 0
                });
                group.add(image);
                const x = this.render.toStageValue(pos.x - stageState.x) - group.width() / 2;
                const y = this.render.toStageValue(pos.y - stageState.y) - group.height() / 2;
                group.setAttrs({
                  x,
                  y
                });
                this.render.updateHistory();
                this.render.draws[PreviewDraw.name].draw();
              });
            }
          }
        }
      }
    });
    this.render = render;
  }
}
__publicField(DragOutsideHandlers, "name", "DragOutside");
class SelectionHandlers {
  constructor(render) {
    __publicField(this, "render");
    // selectRect 拉动的开始和结束坐标
    __publicField(this, "selectRectStartX", 0);
    __publicField(this, "selectRectStartY", 0);
    __publicField(this, "selectRectEndX", 0);
    __publicField(this, "selectRectEndY", 0);
    // 是否正在使用 selectRect
    __publicField(this, "selecting", false);
    // 拖动前的位置
    __publicField(this, "transformerMousedownPos", { x: 0, y: 0 });
    // 对齐线
    __publicField(this, "alignLines", []);
    __publicField(this, "handlers", {
      // 选择相关
      stage: {
        mousedown: (e) => {
          const parent2 = e.target.getParent();
          if (e.target === this.render.stage) {
            this.render.selectionTool.selectingClear();
            if (e.evt.button === MouseButton.左键) {
              const pos = this.render.stage.getPointerPosition();
              if (pos) {
                this.selectRectStartX = pos.x;
                this.selectRectStartY = pos.y;
                this.selectRectEndX = pos.x;
                this.selectRectEndY = pos.y;
              }
              this.render.selectRect.width(0);
              this.render.selectRect.height(0);
              this.selecting = true;
            }
          } else if (parent2 instanceof Konva.Transformer)
            ;
          else if (parent2 instanceof Konva.Group) {
            if (e.evt.button === MouseButton.左键) {
              if (!this.render.ignore(parent2) && !this.render.ignoreDraw(e.target)) {
                if (e.evt.ctrlKey) {
                  this.render.selectionTool.select([
                    ...this.render.selectionTool.selectingNodes,
                    parent2
                  ]);
                } else {
                  this.render.selectionTool.select([parent2]);
                }
              }
            } else {
              this.render.selectionTool.selectingClear();
            }
          }
        },
        mousemove: () => {
          const stageState = this.render.getStageState();
          if (this.selecting) {
            const pos = this.render.stage.getPointerPosition();
            if (pos) {
              this.selectRectEndX = pos.x;
              this.selectRectEndY = pos.y;
            }
            this.render.selectRect.setAttrs({
              visible: true,
              // 显示
              x: this.render.toStageValue(
                Math.min(this.selectRectStartX, this.selectRectEndX) - stageState.x
              ),
              y: this.render.toStageValue(
                Math.min(this.selectRectStartY, this.selectRectEndY) - stageState.y
              ),
              width: this.render.toStageValue(Math.abs(this.selectRectEndX - this.selectRectStartX)),
              height: this.render.toStageValue(Math.abs(this.selectRectEndY - this.selectRectStartY))
            });
          }
        },
        mouseup: () => {
          const box = this.render.selectRect.getClientRect();
          if (box.width > 0 && box.height > 0) {
            const shapes = this.render.layer.getChildren((node) => {
              return !this.render.ignore(node);
            });
            const selected = shapes.filter(
              (shape) => (
                // 关键 api
                Konva.Util.haveIntersection(box, shape.getClientRect())
              )
            );
            this.render.selectionTool.select(selected);
          }
          this.render.selectRect.setAttrs({
            visible: false,
            // 隐藏
            x: 0,
            y: 0,
            width: 0,
            height: 0
          });
          this.selecting = false;
        }
      },
      transformer: {
        // 记录初始状态
        mousedown: (e) => {
          const anchor = this.render.transformer.getActiveAnchor();
          if (!anchor) {
            if (e.evt.ctrlKey) {
              if (this.render.selectionTool.selectingNodes.length > 0) {
                const pos = this.render.stage.getPointerPosition();
                if (pos) {
                  const keeps = [];
                  const removes = [];
                  let finded = false;
                  for (const node of this.render.selectionTool.selectingNodes.sort(
                    (a, b) => b.zIndex() - a.zIndex()
                  )) {
                    if (!finded && Konva.Util.haveIntersection(node.getClientRect(), {
                      ...pos,
                      width: 1,
                      height: 1
                    })) {
                      removes.unshift(node);
                      finded = true;
                    } else {
                      keeps.unshift(node);
                    }
                  }
                  if (removes.length > 0) {
                    this.render.selectionTool.select(keeps);
                  } else {
                    let finded2 = false;
                    const adds = [];
                    for (const node of this.render.layer.getChildren().filter((node2) => !this.render.ignore(node2)).sort((a, b) => b.zIndex() - a.zIndex())) {
                      if (!finded2 && Konva.Util.haveIntersection(node.getClientRect(), {
                        ...pos,
                        width: 1,
                        height: 1
                      })) {
                        adds.unshift(node);
                        finded2 = true;
                      }
                    }
                    if (adds.length > 0) {
                      this.render.selectionTool.select([
                        ...this.render.selectionTool.selectingNodes,
                        ...adds
                      ]);
                    }
                  }
                }
              }
            } else {
              if (this.render.selectionTool.selectingNodes.length > 0) {
                this.reset();
              }
            }
          } else {
            this.reset();
          }
        },
        transform: () => {
          this.render.draws[PreviewDraw.name].draw();
        },
        transformend: () => {
          this.reset();
          this.render.updateHistory();
          this.render.draws[PreviewDraw.name].draw();
        },
        //
        dragstart: () => {
        },
        // 拖动
        dragmove: () => {
          const pos = this.render.transformer.position();
          const { pos: transformerPos, isAttract } = this.attract(pos);
          if (isAttract) {
            this.selectingNodesPositionByOffset({
              x: this.render.toStageValue(transformerPos.x - this.transformerMousedownPos.x),
              y: this.render.toStageValue(transformerPos.y - this.transformerMousedownPos.y)
            });
            this.render.draws[PreviewDraw.name].draw();
          }
        },
        dragend: () => {
          this.reset();
          this.render.updateHistory();
          this.render.draws[PreviewDraw.name].draw();
        }
      }
    });
    // 磁吸逻辑
    __publicField(this, "attract", (newPos) => {
      this.alignLinesClear();
      const stageState = this.render.getStageState();
      const width = this.render.transformer.width();
      const height = this.render.transformer.height();
      let newPosX = newPos.x;
      let newPosY = newPos.y;
      let isAttract = false;
      let pairX = null;
      let pairY = null;
      if (this.render.config.attractNode) {
        const sortX = [];
        const sortY = [];
        sortX.push(
          {
            value: this.render.toStageValue(newPos.x - stageState.x)
            // 左
          },
          {
            value: this.render.toStageValue(newPos.x - stageState.x + width / 2)
            // 垂直中
          },
          {
            value: this.render.toStageValue(newPos.x - stageState.x + width)
            // 右
          }
        );
        sortY.push(
          {
            value: this.render.toStageValue(newPos.y - stageState.y)
            // 上
          },
          {
            value: this.render.toStageValue(newPos.y - stageState.y + height / 2)
            // 水平中
          },
          {
            value: this.render.toStageValue(newPos.y - stageState.y + height)
            // 下
          }
        );
        const targetIds = this.render.selectionTool.selectingNodes.map((o) => o._id);
        const otherNodes = this.render.layer.getChildren((node) => !targetIds.includes(node._id));
        for (const node of otherNodes) {
          sortX.push(
            {
              id: node._id,
              value: node.x()
              // 左
            },
            {
              id: node._id,
              value: node.x() + node.width() / 2
              // 垂直中
            },
            {
              id: node._id,
              value: node.x() + node.width()
              // 右
            }
          );
          sortY.push(
            {
              id: node._id,
              value: node.y()
              // 上
            },
            {
              id: node._id,
              value: node.y() + node.height() / 2
              // 水平中
            },
            {
              id: node._id,
              value: node.y() + node.height()
              // 下
            }
          );
        }
        sortX.sort((a, b) => a.value - b.value);
        sortY.sort((a, b) => a.value - b.value);
        let XMin = Infinity;
        let pairXMin = [];
        let YMin = Infinity;
        let pairYMin = [];
        for (let i = 0; i < sortX.length - 1; i++) {
          if (sortX[i].id === void 0 && sortX[i + 1].id !== void 0 || sortX[i].id !== void 0 && sortX[i + 1].id === void 0) {
            const offset = Math.abs(sortX[i].value - sortX[i + 1].value);
            if (offset < XMin) {
              XMin = offset;
              pairXMin = [[sortX[i], sortX[i + 1]]];
            } else if (offset === XMin) {
              pairXMin.push([sortX[i], sortX[i + 1]]);
            }
          }
        }
        for (let i = 0; i < sortY.length - 1; i++) {
          if (sortY[i].id === void 0 && sortY[i + 1].id !== void 0 || sortY[i].id !== void 0 && sortY[i + 1].id === void 0) {
            const offset = Math.abs(sortY[i].value - sortY[i + 1].value);
            if (offset < YMin) {
              YMin = offset;
              pairYMin = [[sortY[i], sortY[i + 1]]];
            } else if (offset === YMin) {
              pairYMin.push([sortY[i], sortY[i + 1]]);
            }
          }
        }
        if (pairXMin[0]) {
          if (Math.abs(pairXMin[0][0].value - pairXMin[0][1].value) < this.render.bgSize / 2) {
            pairX = pairXMin[0];
          }
        }
        if (pairYMin[0]) {
          if (Math.abs(pairYMin[0][0].value - pairYMin[0][1].value) < this.render.bgSize / 2) {
            pairY = pairYMin[0];
          }
        }
        if ((pairX == null ? void 0 : pairX.length) === 2) {
          for (const pair of pairXMin) {
            const other2 = pair.find((o) => o.id !== void 0);
            if (other2) {
              const line = new Konva.Line({
                points: lodash.flatten([
                  [other2.value, this.render.toStageValue(-stageState.y)],
                  [other2.value, this.render.toStageValue(this.render.stage.height() - stageState.y)]
                ]),
                stroke: "blue",
                strokeWidth: this.render.toStageValue(1),
                dash: [4, 4],
                listening: false
              });
              this.alignLines.push(line);
              this.render.layerCover.add(line);
            }
          }
          const target = pairX.find((o) => o.id === void 0);
          const other = pairX.find((o) => o.id !== void 0);
          if (target && other) {
            newPosX = newPosX - this.render.toBoardValue(target.value - other.value);
            isAttract = true;
          }
        }
        if ((pairY == null ? void 0 : pairY.length) === 2) {
          for (const pair of pairYMin) {
            const other2 = pair.find((o) => o.id !== void 0);
            if (other2) {
              const line = new Konva.Line({
                points: lodash.flatten([
                  [this.render.toStageValue(-stageState.x), other2.value],
                  [this.render.toStageValue(this.render.stage.width() - stageState.x), other2.value]
                ]),
                stroke: "blue",
                strokeWidth: this.render.toStageValue(1),
                dash: [4, 4],
                listening: false
              });
              this.alignLines.push(line);
              this.render.layerCover.add(line);
            }
          }
          const target = pairY.find((o) => o.id === void 0);
          const other = pairY.find((o) => o.id !== void 0);
          if (target && other) {
            newPosY = newPosY - this.render.toBoardValue(target.value - other.value);
            isAttract = true;
          }
        }
      }
      if (this.render.config.attractBg) {
        if (pairX === null) {
          const logicLeftX = this.render.toStageValue(newPos.x - stageState.x);
          const logicNumLeftX = Math.round(logicLeftX / this.render.bgSize);
          const logicClosestLeftX = logicNumLeftX * this.render.bgSize;
          const logicDiffLeftX = Math.abs(logicLeftX - logicClosestLeftX);
          const logicRightX = this.render.toStageValue(newPos.x + width - stageState.x);
          const logicNumRightX = Math.round(logicRightX / this.render.bgSize);
          const logicClosestRightX = logicNumRightX * this.render.bgSize;
          const logicDiffRightX = Math.abs(logicRightX - logicClosestRightX);
          const logicStageRightX = stageState.width;
          const logicDiffStageRightX = Math.abs(logicRightX - logicStageRightX);
          for (const diff of [
            { type: "leftX", value: logicDiffLeftX },
            { type: "rightX", value: logicDiffRightX },
            { type: "stageRightX", value: logicDiffStageRightX }
          ].sort((a, b) => a.value - b.value)) {
            if (diff.value < 5) {
              if (diff.type === "stageRightX") {
                console.log(1, newPosX);
                newPosX = this.render.toBoardValue(logicStageRightX) + stageState.x - width;
                console.log(2, newPosX);
              } else if (diff.type === "leftX") {
                newPosX = this.render.toBoardValue(logicClosestLeftX) + stageState.x;
              } else if (diff.type === "rightX") {
                newPosX = this.render.toBoardValue(logicClosestRightX) + stageState.x - width;
              }
              isAttract = true;
              break;
            }
          }
        }
        if (pairY === null) {
          const logicTopY = this.render.toStageValue(newPos.y - stageState.y);
          const logicNumTopY = Math.round(logicTopY / this.render.bgSize);
          const logicClosestTopY = logicNumTopY * this.render.bgSize;
          const logicDiffTopY = Math.abs(logicTopY - logicClosestTopY);
          const logicBottomY = this.render.toStageValue(newPos.y + height - stageState.y);
          const logicNumBottomY = Math.round(logicBottomY / this.render.bgSize);
          const logicClosestBottomY = logicNumBottomY * this.render.bgSize;
          const logicDiffBottomY = Math.abs(logicBottomY - logicClosestBottomY);
          const logicStageBottomY = stageState.height;
          const logicDiffStageBottomY = Math.abs(logicBottomY - logicStageBottomY);
          for (const diff of [
            { type: "topY", value: logicDiffTopY },
            { type: "bottomY", value: logicDiffBottomY },
            { type: "stageBottomY", value: logicDiffStageBottomY }
          ].sort((a, b) => a.value - b.value)) {
            if (diff.value < 5) {
              if (diff.type === "stageBottomY") {
                newPosY = this.render.toBoardValue(logicStageBottomY) + stageState.y - height;
              } else if (diff.type === "topY") {
                newPosY = this.render.toBoardValue(logicClosestTopY) + stageState.y;
              } else if (diff.type === "bottomY") {
                newPosY = this.render.toBoardValue(logicClosestBottomY) + stageState.y - height;
              }
              isAttract = true;
              break;
            }
          }
        }
      }
      return {
        pos: {
          x: newPosX,
          y: newPosY
        },
        isAttract
      };
    });
    // transformer config
    __publicField(this, "transformerConfig", {
      // 变换中
      anchorDragBoundFunc: (oldPos, newPos) => {
        if (this.render.config.attractResize) {
          const anchor = this.render.transformer.getActiveAnchor();
          if (anchor && anchor !== "rotater") {
            const stageState = this.render.getStageState();
            const logicX = this.render.toStageValue(newPos.x - stageState.x);
            const logicNumX = Math.round(logicX / this.render.bgSize);
            const logicClosestX = logicNumX * this.render.bgSize;
            const logicDiffX = Math.abs(logicX - logicClosestX);
            const snappedX = /-(left|right)$/.test(anchor) && logicDiffX < 5;
            const logicY = this.render.toStageValue(newPos.y - stageState.y);
            const logicNumY = Math.round(logicY / this.render.bgSize);
            const logicClosestY = logicNumY * this.render.bgSize;
            const logicDiffY = Math.abs(logicY - logicClosestY);
            const snappedY = /^(top|bottom)-/.test(anchor) && logicDiffY < 5;
            if (snappedX && !snappedY) {
              return {
                x: this.render.toBoardValue(logicClosestX) + stageState.x,
                y: oldPos.y
              };
            } else if (snappedY && !snappedX) {
              return {
                x: oldPos.x,
                y: this.render.toBoardValue(logicClosestY) + stageState.y
              };
            } else if (snappedX && snappedY) {
              return {
                x: this.render.toBoardValue(logicClosestX) + stageState.x,
                y: this.render.toBoardValue(logicClosestY) + stageState.y
              };
            }
          }
        }
        return newPos;
      }
    });
    this.render = render;
  }
  // 对齐线清除
  alignLinesClear() {
    for (const line of this.alignLines) {
      line.remove();
    }
    this.alignLines = [];
  }
  // 通过偏移量移动【目标节点】
  selectingNodesPositionByOffset(offset) {
    for (const node of this.render.selectionTool.selectingNodes) {
      const x = node.attrs.nodeMousedownPos.x + offset.x;
      const y = node.attrs.nodeMousedownPos.y + offset.y;
      node.x(x);
      node.y(y);
    }
  }
  // 重置【目标节点】的 nodeMousedownPos
  selectingNodesPositionReset() {
    for (const node of this.render.selectionTool.selectingNodes) {
      node.attrs.nodeMousedownPos.x = node.x();
      node.attrs.nodeMousedownPos.y = node.y();
    }
  }
  // 重置 transformer 状态
  transformerStateReset() {
    this.transformerMousedownPos = this.render.transformer.position();
  }
  // 重置
  reset() {
    this.alignLinesClear();
    this.transformerStateReset();
    this.selectingNodesPositionReset();
  }
}
__publicField(SelectionHandlers, "name", "Selection");
class KeyMoveHandlers {
  constructor(render) {
    __publicField(this, "render");
    __publicField(this, "speed", 1);
    __publicField(this, "speedMax", 20);
    __publicField(this, "change", lodash.debounce(() => {
      this.render.updateHistory();
    }, 200));
    __publicField(this, "handlers", {
      dom: {
        keydown: (e) => {
          if (!e.ctrlKey) {
            if (Object.values(MoveKey).map((o) => o.toString()).includes(e.code)) {
              if (e.code === MoveKey.上) {
                this.render.selectionTool.selectingNodesMove({ x: 0, y: -this.speed });
              } else if (e.code === MoveKey.左) {
                this.render.selectionTool.selectingNodesMove({ x: -this.speed, y: 0 });
              } else if (e.code === MoveKey.右) {
                this.render.selectionTool.selectingNodesMove({ x: this.speed, y: 0 });
              } else if (e.code === MoveKey.下) {
                this.render.selectionTool.selectingNodesMove({ x: 0, y: this.speed });
              }
              if (this.speed < this.speedMax) {
                this.speed++;
              }
              this.change();
              this.render.draws[PreviewDraw.name].draw();
            }
          }
        },
        keyup: () => {
          this.speed = 1;
        }
      }
    });
    this.render = render;
  }
}
__publicField(KeyMoveHandlers, "name", "KeyMove");
class ShutcutHandlers {
  constructor(render) {
    __publicField(this, "render");
    __publicField(this, "handlers", {
      dom: {
        keydown: (e) => {
          if (e.ctrlKey) {
            if (e.code === ShutcutKey.C) {
              this.render.copyTool.pasteStart();
            } else if (e.code === ShutcutKey.V) {
              this.render.copyTool.pasteEnd();
            } else if (e.code === ShutcutKey.Z) {
              if (e.shiftKey) {
                this.render.nextHistory();
              } else {
                this.render.prevHistory();
              }
            }
          } else if (e.code === ShutcutKey.删除) {
            this.render.remove(this.render.selectionTool.selectingNodes);
          }
        }
      }
    });
    this.render = render;
  }
}
__publicField(ShutcutHandlers, "name", "Shutcut");
const gifler = window.gifler;
class AssetTool {
  constructor(render) {
    __publicField(this, "render");
    this.render = render;
  }
  // 加载 svg
  async loadSvg(src) {
    const svgXML = await (await fetch(src)).text();
    const blob = new Blob([svgXML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      Konva.Image.fromURL(url, (imageNode) => {
        imageNode.setAttrs({
          svgXML
        });
        resolve(imageNode);
      });
    });
  }
  // 加载 gif
  async loadGif(src) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      gifler(src).frames(canvas, (ctx, frame) => {
        canvas.width = frame.width;
        canvas.height = frame.height;
        ctx.drawImage(frame.buffer, 0, 0);
        this.render.layer.draw();
        this.render.draws[PreviewDraw.name].draw();
        resolve(
          new Konva.Image({
            image: canvas,
            gif: src
          })
        );
      });
    });
  }
  // 加载图片
  async loadImg(src) {
    return new Promise((resolve) => {
      Konva.Image.fromURL(src, (imageNode) => {
        imageNode.setAttrs({ src });
        resolve(imageNode);
      });
    });
  }
}
__publicField(AssetTool, "name", "AssetTool");
class SelectionTool {
  constructor(render) {
    __publicField(this, "render");
    // 【被选中的】
    __publicField(this, "selectingNodes", []);
    this.render = render;
  }
  // 清空已选
  selectingClear() {
    this.render.transformer.nodes([]);
    const change = this.selectingNodes.findIndex(
      (o) => o.attrs.lastZIndex !== void 0 && o.zIndex() !== o.attrs.lastZIndex
    ) > -1;
    for (const node of [...this.selectingNodes].sort(
      (a, b) => a.attrs.lastZIndex - b.attrs.lastZIndex
    )) {
      node.setAttrs({
        listening: true,
        opacity: node.attrs.lastOpacity ?? 1,
        zIndex: node.attrs.lastZIndex
      });
    }
    for (const node of this.selectingNodes) {
      node.setAttrs({
        nodeMousedownPos: void 0,
        lastOpacity: void 0,
        lastZIndex: void 0,
        selectingZIndex: void 0
      });
    }
    this.selectingNodes = [];
    if (change) {
      this.render.draws[PreviewDraw.name].draw();
    }
  }
  // 选择节点
  select(nodes) {
    this.selectingClear();
    if (nodes.length > 0) {
      const maxZIndex = Math.max(
        ...this.render.layer.getChildren((node) => {
          return !this.render.ignore(node);
        }).map((o) => o.zIndex())
      );
      for (const node of nodes) {
        node.setAttrs({
          nodeMousedownPos: node.position(),
          // 后面用于移动所选
          lastOpacity: node.opacity(),
          // 选中时，下面会使其变透明，记录原有的透明度
          lastZIndex: node.zIndex()
          // 记录原有的层次，后面暂时提升所选节点的层次
        });
      }
      for (const node of nodes.sort((a, b) => a.zIndex() - b.zIndex())) {
        node.setAttrs({
          listening: false,
          opacity: node.opacity() * 0.8,
          zIndex: maxZIndex
        });
      }
      this.selectingNodes = nodes;
      this.render.transformer.nodes(this.selectingNodes);
    }
  }
  // 更新节点位置
  selectingNodesMove(offset) {
    for (const node of this.render.selectionTool.selectingNodes) {
      node.x(node.x() + offset.x);
      node.y(node.y() + offset.y);
    }
  }
}
__publicField(SelectionTool, "name", "SelectionTool");
class CopyTool {
  constructor(render) {
    __publicField(this, "render");
    // 复制暂存
    __publicField(this, "pasteCache", []);
    // 粘贴次数（用于定义新节点的偏移距离）
    __publicField(this, "pasteCount", 1);
    this.render = render;
  }
  // 复制
  pasteStart() {
    this.pasteCache = this.render.selectionTool.selectingNodes.map((o) => {
      const copy = o.clone();
      copy.setAttrs({
        listening: true,
        opacity: copy.attrs.lastOpacity ?? 1
      });
      copy.setAttrs({
        nodeMousedownPos: void 0,
        lastOpacity: void 0,
        lastZIndex: void 0,
        selectingZIndex: void 0
      });
      return copy;
    });
    this.pasteCount = 1;
  }
  // 粘贴
  pasteEnd() {
    if (this.pasteCache.length > 0) {
      this.render.selectionTool.selectingClear();
      this.copy(this.pasteCache);
      this.pasteCount++;
    }
  }
  /**
   * 复制粘贴
   * @param nodes 节点数组
   * @param skip 跳过检查
   * @returns 复制的元素
   */
  copy(nodes) {
    const arr = [];
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        const backup = [...this.render.selectionTool.selectingNodes];
        this.render.selectionTool.selectingClear();
        this.copy(backup);
      } else {
        const copy = node.clone();
        copy.setAttrs({
          x: copy.x() + this.render.toStageValue(this.render.bgSize) * this.pasteCount,
          y: copy.y() + this.render.toStageValue(this.render.bgSize) * this.pasteCount
        });
        this.render.layer.add(copy);
        this.render.selectionTool.select([...this.render.selectionTool.selectingNodes, copy]);
      }
    }
    this.render.updateHistory();
    this.render.draws[PreviewDraw.name].draw();
    return arr;
  }
}
__publicField(CopyTool, "name", "CopyTool");
class PositionTool {
  constructor(render) {
    __publicField(this, "render");
    this.render = render;
  }
  // 恢复位置大小
  positionZoomReset() {
    this.render.stage.setAttrs({
      scale: { x: 1, y: 1 }
    });
    this.positionReset();
  }
  // 恢复位置
  positionReset() {
    this.render.stage.setAttrs({
      x: this.render.rulerSize,
      y: this.render.rulerSize
    });
    this.render.draws[BgDraw.name].draw();
    this.render.draws[RulerDraw.name].draw();
    this.render.draws[RefLineDraw.name].draw();
    this.render.draws[PreviewDraw.name].draw();
  }
  // 更新中心位置
  updateCenter(x = 0, y = 0) {
    const stageState = this.render.getStageState();
    const nodes = this.render.layer.getChildren((node) => {
      return !this.render.ignore(node);
    });
    let minX = 0;
    let minY = 0;
    for (const node of nodes) {
      const x2 = node.x();
      const y2 = node.y();
      if (x2 < minX) {
        minX = x2;
      }
      if (y2 < minY) {
        minY = y2;
      }
    }
    this.render.stage.setAttrs({
      x: stageState.width / 2 - this.render.toBoardValue(minX) - this.render.toBoardValue(x) + this.render.rulerSize,
      y: stageState.height / 2 - this.render.toBoardValue(minY) - this.render.toBoardValue(y) + this.render.rulerSize
    });
    this.render.draws[BgDraw.name].draw();
    this.render.draws[RulerDraw.name].draw();
    this.render.draws[RefLineDraw.name].draw();
    this.render.draws[PreviewDraw.name].draw();
  }
}
__publicField(PositionTool, "name", "PositionTool");
class ZIndexTool {
  constructor(render) {
    __publicField(this, "render");
    this.render = render;
  }
  // 获取移动节点
  getNodes(nodes) {
    const targets = [];
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        targets.push(...this.render.selectionTool.selectingNodes);
      } else {
        targets.push(node);
      }
    }
    return targets;
  }
  // 最大 zIndex
  getMaxZIndex() {
    return Math.max(
      ...this.render.layer.getChildren((node) => {
        return !this.render.ignore(node);
      }).map((o) => o.zIndex())
    );
  }
  // 最小 zIndex
  getMinZIndex() {
    return Math.min(
      ...this.render.layer.getChildren((node) => {
        return !this.render.ignore(node);
      }).map((o) => o.zIndex())
    );
  }
  // 记录选择期间的 zIndex
  updateSelectingZIndex(nodes) {
    for (const node of nodes) {
      node.setAttrs({
        selectingZIndex: node.zIndex()
      });
    }
  }
  // 恢复选择期间的 zIndex
  resetSelectingZIndex(nodes) {
    nodes.sort((a, b) => a.zIndex() - b.zIndex());
    for (const node of nodes) {
      node.zIndex(node.attrs.selectingZIndex);
    }
  }
  // 更新 zIndex 缓存
  updateLastZindex(nodes) {
    for (const node of nodes) {
      node.setAttrs({
        lastZIndex: node.zIndex()
      });
    }
  }
  // 上移
  up(nodes) {
    const maxZIndex = this.getMaxZIndex();
    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex());
    let lastNode = null;
    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted);
      for (const node of sorted) {
        if (node.attrs.lastZIndex < maxZIndex && (lastNode === null || node.attrs.lastZIndex < lastNode.attrs.lastZIndex - 1)) {
          node.setAttrs({
            lastZIndex: node.attrs.lastZIndex + 1
          });
        }
        lastNode = node;
      }
      this.resetSelectingZIndex(sorted);
    } else {
      for (const node of sorted) {
        if (node.zIndex() < maxZIndex && (lastNode === null || node.zIndex() < lastNode.zIndex() - 1)) {
          node.zIndex(node.zIndex() + 1);
        }
        lastNode = node;
      }
      this.updateLastZindex(sorted);
      this.render.updateHistory();
      this.render.draws[PreviewDraw.name].draw();
    }
  }
  // 下移
  down(nodes) {
    const minZIndex = this.getMinZIndex();
    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex());
    let lastNode = null;
    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted);
      for (const node of sorted) {
        if (node.attrs.lastZIndex > minZIndex && (lastNode === null || node.attrs.lastZIndex > lastNode.attrs.lastZIndex + 1)) {
          node.setAttrs({
            lastZIndex: node.attrs.lastZIndex - 1
          });
        }
        lastNode = node;
      }
      this.resetSelectingZIndex(sorted);
    } else {
      for (const node of sorted) {
        if (node.zIndex() > minZIndex && (lastNode === null || node.zIndex() > lastNode.zIndex() + 1)) {
          node.zIndex(node.zIndex() - 1);
        }
        lastNode = node;
      }
      this.updateLastZindex(sorted);
      this.render.updateHistory();
      this.render.draws[PreviewDraw.name].draw();
    }
  }
  // 置顶
  top(nodes) {
    let maxZIndex = this.getMaxZIndex();
    const sorted = this.getNodes(nodes).sort((a, b) => b.zIndex() - a.zIndex());
    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted);
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: maxZIndex--
        });
      }
      this.resetSelectingZIndex(sorted);
    } else {
      for (const node of sorted) {
        node.zIndex(maxZIndex);
      }
      this.updateLastZindex(sorted);
      this.render.updateHistory();
      this.render.draws[PreviewDraw.name].draw();
    }
  }
  // 置底
  bottom(nodes) {
    let minZIndex = this.getMinZIndex();
    const sorted = this.getNodes(nodes).sort((a, b) => a.zIndex() - b.zIndex());
    if (this.render.selectionTool.selectingNodes.length > 0) {
      this.updateSelectingZIndex(sorted);
      for (const node of sorted) {
        node.setAttrs({
          lastZIndex: minZIndex++
        });
      }
      this.resetSelectingZIndex(sorted);
    } else {
      for (const node of sorted) {
        node.zIndex(minZIndex);
      }
      this.updateLastZindex(sorted);
      this.render.updateHistory();
      this.render.draws[PreviewDraw.name].draw();
    }
  }
}
__publicField(ZIndexTool, "name", "ZIndexTool");
var canvas2svg = { exports: {} };
/*!!
 *  Canvas 2 Svg v1.0.15
 *  A low level canvas to SVG converter. Uses a mock canvas context to build an SVG document.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Kerry Liu
 *
 *  Copyright (c) 2014 Gliffy Inc.
 */
(function(module2) {
  (function() {
    var STYLES, ctx, CanvasGradient, CanvasPattern, namedEntities;
    function format(str, args) {
      var keys2 = Object.keys(args), i;
      for (i = 0; i < keys2.length; i++) {
        str = str.replace(new RegExp("\\{" + keys2[i] + "\\}", "gi"), args[keys2[i]]);
      }
      return str;
    }
    function randomString(holder) {
      var chars, randomstring, i;
      if (!holder) {
        throw new Error("cannot create a random attribute name for an undefined object");
      }
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      randomstring = "";
      do {
        randomstring = "";
        for (i = 0; i < 12; i++) {
          randomstring += chars[Math.floor(Math.random() * chars.length)];
        }
      } while (holder[randomstring]);
      return randomstring;
    }
    function createNamedToNumberedLookup(items, radix) {
      var i, entity, lookup = {}, base10;
      items = items.split(",");
      radix = radix || 10;
      for (i = 0; i < items.length; i += 2) {
        entity = "&" + items[i + 1] + ";";
        base10 = parseInt(items[i], radix);
        lookup[entity] = "&#" + base10 + ";";
      }
      lookup["\\xa0"] = "&#160;";
      return lookup;
    }
    function getTextAnchor(textAlign) {
      var mapping = { "left": "start", "right": "end", "center": "middle", "start": "start", "end": "end" };
      return mapping[textAlign] || mapping.start;
    }
    function getDominantBaseline(textBaseline) {
      var mapping = { "alphabetic": "alphabetic", "hanging": "hanging", "top": "text-before-edge", "bottom": "text-after-edge", "middle": "central" };
      return mapping[textBaseline] || mapping.alphabetic;
    }
    namedEntities = createNamedToNumberedLookup(
      "50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,t9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro",
      32
    );
    STYLES = {
      "strokeStyle": {
        svgAttr: "stroke",
        //corresponding svg attribute
        canvas: "#000000",
        //canvas default
        svg: "none",
        //svg default
        apply: "stroke"
        //apply on stroke() or fill()
      },
      "fillStyle": {
        svgAttr: "fill",
        canvas: "#000000",
        svg: null,
        //svg default is black, but we need to special case this to handle canvas stroke without fill
        apply: "fill"
      },
      "lineCap": {
        svgAttr: "stroke-linecap",
        canvas: "butt",
        svg: "butt",
        apply: "stroke"
      },
      "lineJoin": {
        svgAttr: "stroke-linejoin",
        canvas: "miter",
        svg: "miter",
        apply: "stroke"
      },
      "miterLimit": {
        svgAttr: "stroke-miterlimit",
        canvas: 10,
        svg: 4,
        apply: "stroke"
      },
      "lineWidth": {
        svgAttr: "stroke-width",
        canvas: 1,
        svg: 1,
        apply: "stroke"
      },
      "globalAlpha": {
        svgAttr: "opacity",
        canvas: 1,
        svg: 1,
        apply: "fill stroke"
      },
      "font": {
        //font converts to multiple svg attributes, there is custom logic for this
        canvas: "10px sans-serif"
      },
      "shadowColor": {
        canvas: "#000000"
      },
      "shadowOffsetX": {
        canvas: 0
      },
      "shadowOffsetY": {
        canvas: 0
      },
      "shadowBlur": {
        canvas: 0
      },
      "textAlign": {
        canvas: "start"
      },
      "textBaseline": {
        canvas: "alphabetic"
      }
    };
    CanvasGradient = function(gradientNode, ctx2) {
      this.__root = gradientNode;
      this.__ctx = ctx2;
    };
    CanvasGradient.prototype.addColorStop = function(offset, color) {
      var stop = this.__ctx.__createElement("stop"), regex, matches2;
      stop.setAttribute("offset", offset);
      if (color.indexOf("rgba") !== -1) {
        regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
        matches2 = regex.exec(color);
        stop.setAttribute("stop-color", format("rgb({r},{g},{b})", { r: matches2[1], g: matches2[2], b: matches2[3] }));
        stop.setAttribute("stop-opacity", matches2[4]);
      } else {
        stop.setAttribute("stop-color", color);
      }
      this.__root.appendChild(stop);
    };
    CanvasPattern = function(pattern, ctx2) {
      this.__root = pattern;
      this.__ctx = ctx2;
    };
    ctx = function(o) {
      var defaultOptions = { width: 500, height: 500, enableMirroring: false }, options;
      if (arguments.length > 1) {
        options = defaultOptions;
        options.width = arguments[0];
        options.height = arguments[1];
      } else if (!o) {
        options = defaultOptions;
      } else {
        options = o;
      }
      if (!(this instanceof ctx)) {
        return new ctx(options);
      }
      this.width = options.width || defaultOptions.width;
      this.height = options.height || defaultOptions.height;
      this.enableMirroring = options.enableMirroring !== void 0 ? options.enableMirroring : defaultOptions.enableMirroring;
      this.canvas = this;
      this.__document = options.document || document;
      this.__canvas = this.__document.createElement("canvas");
      this.__ctx = this.__canvas.getContext("2d");
      this.__setDefaultStyles();
      this.__stack = [this.__getStyleState()];
      this.__groupStack = [];
      this.__root = this.__document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.__root.setAttribute("version", 1.1);
      this.__root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      this.__root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      this.__root.setAttribute("width", this.width);
      this.__root.setAttribute("height", this.height);
      this.__ids = {};
      this.__defs = this.__document.createElementNS("http://www.w3.org/2000/svg", "defs");
      this.__root.appendChild(this.__defs);
      this.__currentElement = this.__document.createElementNS("http://www.w3.org/2000/svg", "g");
      this.__root.appendChild(this.__currentElement);
    };
    ctx.prototype.__createElement = function(elementName, properties, resetFill) {
      if (typeof properties === "undefined") {
        properties = {};
      }
      var element = this.__document.createElementNS("http://www.w3.org/2000/svg", elementName), keys2 = Object.keys(properties), i, key;
      if (resetFill) {
        element.setAttribute("fill", "none");
        element.setAttribute("stroke", "none");
      }
      for (i = 0; i < keys2.length; i++) {
        key = keys2[i];
        element.setAttribute(key, properties[key]);
      }
      return element;
    };
    ctx.prototype.__setDefaultStyles = function() {
      var keys2 = Object.keys(STYLES), i, key;
      for (i = 0; i < keys2.length; i++) {
        key = keys2[i];
        this[key] = STYLES[key].canvas;
      }
    };
    ctx.prototype.__applyStyleState = function(styleState) {
      var keys2 = Object.keys(styleState), i, key;
      for (i = 0; i < keys2.length; i++) {
        key = keys2[i];
        this[key] = styleState[key];
      }
    };
    ctx.prototype.__getStyleState = function() {
      var i, styleState = {}, keys2 = Object.keys(STYLES), key;
      for (i = 0; i < keys2.length; i++) {
        key = keys2[i];
        styleState[key] = this[key];
      }
      return styleState;
    };
    ctx.prototype.__applyStyleToCurrentElement = function(type) {
      var keys2 = Object.keys(STYLES), i, style, value, id, regex, matches2;
      for (i = 0; i < keys2.length; i++) {
        style = STYLES[keys2[i]];
        value = this[keys2[i]];
        if (style.apply) {
          if (style.apply.indexOf("fill") !== -1 && value instanceof CanvasPattern) {
            if (value.__ctx) {
              while (value.__ctx.__defs.childNodes.length) {
                id = value.__ctx.__defs.childNodes[0].getAttribute("id");
                this.__ids[id] = id;
                this.__defs.appendChild(value.__ctx.__defs.childNodes[0]);
              }
            }
            this.__currentElement.setAttribute("fill", format("url(#{id})", { id: value.__root.getAttribute("id") }));
          } else if (style.apply.indexOf("fill") !== -1 && value instanceof CanvasGradient) {
            this.__currentElement.setAttribute("fill", format("url(#{id})", { id: value.__root.getAttribute("id") }));
          } else if (style.apply.indexOf(type) !== -1 && style.svg !== value) {
            if ((style.svgAttr === "stroke" || style.svgAttr === "fill") && value.indexOf("rgba") !== -1) {
              regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?\.?\d*)\s*\)/gi;
              matches2 = regex.exec(value);
              this.__currentElement.setAttribute(style.svgAttr, format("rgb({r},{g},{b})", { r: matches2[1], g: matches2[2], b: matches2[3] }));
              this.__currentElement.setAttribute(style.svgAttr + "-opacity", matches2[4]);
            } else {
              this.__currentElement.setAttribute(style.svgAttr, value);
            }
          }
        }
      }
    };
    ctx.prototype.__closestGroupOrSvg = function(node) {
      node = node || this.__currentElement;
      if (node.nodeName === "g" || node.nodeName === "svg") {
        return node;
      } else {
        return this.__closestGroupOrSvg(node.parentNode);
      }
    };
    ctx.prototype.getSerializedSvg = function(fixNamedEntities) {
      var serialized = new XMLSerializer().serializeToString(this.__root), keys2, i, key, value, regexp, xmlns;
      xmlns = /xmlns="http:\/\/www\.w3\.org\/2000\/svg".+xmlns="http:\/\/www\.w3\.org\/2000\/svg/gi;
      if (xmlns.test(serialized)) {
        serialized = serialized.replace('xmlns="http://www.w3.org/2000/svg', 'xmlns:xlink="http://www.w3.org/1999/xlink');
      }
      if (fixNamedEntities) {
        keys2 = Object.keys(namedEntities);
        for (i = 0; i < keys2.length; i++) {
          key = keys2[i];
          value = namedEntities[key];
          regexp = new RegExp(key, "gi");
          if (regexp.test(serialized)) {
            serialized = serialized.replace(regexp, value);
          }
        }
      }
      return serialized;
    };
    ctx.prototype.getSvg = function() {
      return this.__root;
    };
    ctx.prototype.save = function() {
      var group = this.__createElement("g"), parent2 = this.__closestGroupOrSvg();
      this.__groupStack.push(parent2);
      parent2.appendChild(group);
      this.__currentElement = group;
      this.__stack.push(this.__getStyleState());
    };
    ctx.prototype.restore = function() {
      this.__currentElement = this.__groupStack.pop();
      var state = this.__stack.pop();
      this.__applyStyleState(state);
    };
    ctx.prototype.__addTransform = function(t) {
      var parent2 = this.__closestGroupOrSvg();
      if (parent2.childNodes.length > 0) {
        var group = this.__createElement("g");
        parent2.appendChild(group);
        this.__currentElement = group;
      }
      var transform2 = this.__currentElement.getAttribute("transform");
      if (transform2) {
        transform2 += " ";
      } else {
        transform2 = "";
      }
      transform2 += t;
      this.__currentElement.setAttribute("transform", transform2);
    };
    ctx.prototype.scale = function(x, y) {
      if (y === void 0) {
        y = x;
      }
      this.__addTransform(format("scale({x},{y})", { x, y }));
    };
    ctx.prototype.rotate = function(angle) {
      var degrees = angle * 180 / Math.PI;
      this.__addTransform(format("rotate({angle},{cx},{cy})", { angle: degrees, cx: 0, cy: 0 }));
    };
    ctx.prototype.translate = function(x, y) {
      this.__addTransform(format("translate({x},{y})", { x, y }));
    };
    ctx.prototype.transform = function(a, b, c, d, e, f) {
      this.__addTransform(format("matrix({a},{b},{c},{d},{e},{f})", { a, b, c, d, e, f }));
    };
    ctx.prototype.beginPath = function() {
      var path, parent2;
      this.__currentDefaultPath = "";
      this.__currentPosition = {};
      path = this.__createElement("path", {}, true);
      parent2 = this.__closestGroupOrSvg();
      parent2.appendChild(path);
      this.__currentElement = path;
    };
    ctx.prototype.__applyCurrentDefaultPath = function() {
      if (this.__currentElement.nodeName === "path") {
        var d = this.__currentDefaultPath;
        this.__currentElement.setAttribute("d", d);
      } else {
        throw new Error("Attempted to apply path command to node " + this.__currentElement.nodeName);
      }
    };
    ctx.prototype.__addPathCommand = function(command) {
      this.__currentDefaultPath += " ";
      this.__currentDefaultPath += command;
    };
    ctx.prototype.moveTo = function(x, y) {
      if (this.__currentElement.nodeName !== "path") {
        this.beginPath();
      }
      this.__currentPosition = { x, y };
      this.__addPathCommand(format("M {x} {y}", { x, y }));
    };
    ctx.prototype.closePath = function() {
      this.__addPathCommand("Z");
    };
    ctx.prototype.lineTo = function(x, y) {
      this.__currentPosition = { x, y };
      if (this.__currentDefaultPath.indexOf("M") > -1) {
        this.__addPathCommand(format("L {x} {y}", { x, y }));
      } else {
        this.__addPathCommand(format("M {x} {y}", { x, y }));
      }
    };
    ctx.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
      this.__currentPosition = { x, y };
      this.__addPathCommand(format(
        "C {cp1x} {cp1y} {cp2x} {cp2y} {x} {y}",
        { cp1x, cp1y, cp2x, cp2y, x, y }
      ));
    };
    ctx.prototype.quadraticCurveTo = function(cpx, cpy, x, y) {
      this.__currentPosition = { x, y };
      this.__addPathCommand(format("Q {cpx} {cpy} {x} {y}", { cpx, cpy, x, y }));
    };
    var normalize = function(vector) {
      var len = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
      return [vector[0] / len, vector[1] / len];
    };
    ctx.prototype.arcTo = function(x1, y1, x2, y2, radius) {
      var x0 = this.__currentPosition && this.__currentPosition.x;
      var y0 = this.__currentPosition && this.__currentPosition.y;
      if (typeof x0 == "undefined" || typeof y0 == "undefined") {
        return;
      }
      if (radius < 0) {
        throw new Error("IndexSizeError: The radius provided (" + radius + ") is negative.");
      }
      if (x0 === x1 && y0 === y1 || x1 === x2 && y1 === y2 || radius === 0) {
        this.lineTo(x1, y1);
        return;
      }
      var unit_vec_p1_p0 = normalize([x0 - x1, y0 - y1]);
      var unit_vec_p1_p2 = normalize([x2 - x1, y2 - y1]);
      if (unit_vec_p1_p0[0] * unit_vec_p1_p2[1] === unit_vec_p1_p0[1] * unit_vec_p1_p2[0]) {
        this.lineTo(x1, y1);
        return;
      }
      var cos = unit_vec_p1_p0[0] * unit_vec_p1_p2[0] + unit_vec_p1_p0[1] * unit_vec_p1_p2[1];
      var theta = Math.acos(Math.abs(cos));
      var unit_vec_p1_origin = normalize([
        unit_vec_p1_p0[0] + unit_vec_p1_p2[0],
        unit_vec_p1_p0[1] + unit_vec_p1_p2[1]
      ]);
      var len_p1_origin = radius / Math.sin(theta / 2);
      var x = x1 + len_p1_origin * unit_vec_p1_origin[0];
      var y = y1 + len_p1_origin * unit_vec_p1_origin[1];
      var unit_vec_origin_start_tangent = [
        -unit_vec_p1_p0[1],
        unit_vec_p1_p0[0]
      ];
      var unit_vec_origin_end_tangent = [
        unit_vec_p1_p2[1],
        -unit_vec_p1_p2[0]
      ];
      var getAngle = function(vector) {
        var x3 = vector[0];
        var y3 = vector[1];
        if (y3 >= 0) {
          return Math.acos(x3);
        } else {
          return -Math.acos(x3);
        }
      };
      var startAngle = getAngle(unit_vec_origin_start_tangent);
      var endAngle = getAngle(unit_vec_origin_end_tangent);
      this.lineTo(
        x + unit_vec_origin_start_tangent[0] * radius,
        y + unit_vec_origin_start_tangent[1] * radius
      );
      this.arc(x, y, radius, startAngle, endAngle);
    };
    ctx.prototype.stroke = function() {
      if (this.__currentElement.nodeName === "path") {
        this.__currentElement.setAttribute("paint-order", "fill stroke markers");
      }
      this.__applyCurrentDefaultPath();
      this.__applyStyleToCurrentElement("stroke");
    };
    ctx.prototype.fill = function() {
      if (this.__currentElement.nodeName === "path") {
        this.__currentElement.setAttribute("paint-order", "stroke fill markers");
      }
      this.__applyCurrentDefaultPath();
      this.__applyStyleToCurrentElement("fill");
    };
    ctx.prototype.rect = function(x, y, width, height) {
      if (this.__currentElement.nodeName !== "path") {
        this.beginPath();
      }
      this.moveTo(x, y);
      this.lineTo(x + width, y);
      this.lineTo(x + width, y + height);
      this.lineTo(x, y + height);
      this.lineTo(x, y);
      this.closePath();
    };
    ctx.prototype.fillRect = function(x, y, width, height) {
      var rect, parent2;
      rect = this.__createElement("rect", {
        x,
        y,
        width,
        height
      }, true);
      parent2 = this.__closestGroupOrSvg();
      parent2.appendChild(rect);
      this.__currentElement = rect;
      this.__applyStyleToCurrentElement("fill");
    };
    ctx.prototype.strokeRect = function(x, y, width, height) {
      var rect, parent2;
      rect = this.__createElement("rect", {
        x,
        y,
        width,
        height
      }, true);
      parent2 = this.__closestGroupOrSvg();
      parent2.appendChild(rect);
      this.__currentElement = rect;
      this.__applyStyleToCurrentElement("stroke");
    };
    ctx.prototype.clearRect = function(x, y, width, height) {
      var rect, parent2 = this.__closestGroupOrSvg();
      rect = this.__createElement("rect", {
        x,
        y,
        width,
        height,
        fill: "#FFFFFF"
      }, true);
      parent2.appendChild(rect);
    };
    ctx.prototype.createLinearGradient = function(x1, y1, x2, y2) {
      var grad = this.__createElement("linearGradient", {
        id: randomString(this.__ids),
        x1: x1 + "px",
        x2: x2 + "px",
        y1: y1 + "px",
        y2: y2 + "px",
        "gradientUnits": "userSpaceOnUse"
      }, false);
      this.__defs.appendChild(grad);
      return new CanvasGradient(grad, this);
    };
    ctx.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
      var grad = this.__createElement("radialGradient", {
        id: randomString(this.__ids),
        cx: x1 + "px",
        cy: y1 + "px",
        r: r1 + "px",
        fx: x0 + "px",
        fy: y0 + "px",
        "gradientUnits": "userSpaceOnUse"
      }, false);
      this.__defs.appendChild(grad);
      return new CanvasGradient(grad, this);
    };
    ctx.prototype.__parseFont = function() {
      var regex = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\"\sa-z]+?)\s*$/i;
      var fontPart = regex.exec(this.font);
      var data = {
        style: fontPart[1] || "normal",
        size: fontPart[4] || "10px",
        family: fontPart[6] || "sans-serif",
        weight: fontPart[3] || "normal",
        decoration: fontPart[2] || "normal",
        href: null
      };
      if (this.__fontUnderline === "underline") {
        data.decoration = "underline";
      }
      if (this.__fontHref) {
        data.href = this.__fontHref;
      }
      return data;
    };
    ctx.prototype.__wrapTextLink = function(font, element) {
      if (font.href) {
        var a = this.__createElement("a");
        a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", font.href);
        a.appendChild(element);
        return a;
      }
      return element;
    };
    ctx.prototype.__applyText = function(text, x, y, action) {
      var font = this.__parseFont(), parent2 = this.__closestGroupOrSvg(), textElement = this.__createElement("text", {
        "font-family": font.family,
        "font-size": font.size,
        "font-style": font.style,
        "font-weight": font.weight,
        "text-decoration": font.decoration,
        "x": x,
        "y": y,
        "text-anchor": getTextAnchor(this.textAlign),
        "dominant-baseline": getDominantBaseline(this.textBaseline)
      }, true);
      textElement.appendChild(this.__document.createTextNode(text));
      this.__currentElement = textElement;
      this.__applyStyleToCurrentElement(action);
      parent2.appendChild(this.__wrapTextLink(font, textElement));
    };
    ctx.prototype.fillText = function(text, x, y) {
      this.__applyText(text, x, y, "fill");
    };
    ctx.prototype.strokeText = function(text, x, y) {
      this.__applyText(text, x, y, "stroke");
    };
    ctx.prototype.measureText = function(text) {
      this.__ctx.font = this.font;
      return this.__ctx.measureText(text);
    };
    ctx.prototype.arc = function(x, y, radius, startAngle, endAngle, counterClockwise) {
      if (startAngle === endAngle) {
        return;
      }
      startAngle = startAngle % (2 * Math.PI);
      endAngle = endAngle % (2 * Math.PI);
      if (startAngle === endAngle) {
        endAngle = (endAngle + 2 * Math.PI - 1e-3 * (counterClockwise ? -1 : 1)) % (2 * Math.PI);
      }
      var endX = x + radius * Math.cos(endAngle), endY = y + radius * Math.sin(endAngle), startX = x + radius * Math.cos(startAngle), startY = y + radius * Math.sin(startAngle), sweepFlag = counterClockwise ? 0 : 1, largeArcFlag = 0, diff = endAngle - startAngle;
      if (diff < 0) {
        diff += 2 * Math.PI;
      }
      if (counterClockwise) {
        largeArcFlag = diff > Math.PI ? 0 : 1;
      } else {
        largeArcFlag = diff > Math.PI ? 1 : 0;
      }
      this.lineTo(startX, startY);
      this.__addPathCommand(format(
        "A {rx} {ry} {xAxisRotation} {largeArcFlag} {sweepFlag} {endX} {endY}",
        { rx: radius, ry: radius, xAxisRotation: 0, largeArcFlag, sweepFlag, endX, endY }
      ));
      this.__currentPosition = { x: endX, y: endY };
    };
    ctx.prototype.clip = function() {
      var group = this.__closestGroupOrSvg(), clipPath = this.__createElement("clipPath"), id = randomString(this.__ids), newGroup = this.__createElement("g");
      group.removeChild(this.__currentElement);
      clipPath.setAttribute("id", id);
      clipPath.appendChild(this.__currentElement);
      this.__defs.appendChild(clipPath);
      group.setAttribute("clip-path", format("url(#{id})", { id }));
      group.appendChild(newGroup);
      this.__currentElement = newGroup;
    };
    ctx.prototype.drawImage = function() {
      var args = Array.prototype.slice.call(arguments), image = args[0], dx, dy, dw, dh, sx = 0, sy = 0, sw, sh, parent2, svg, defs, group, currentElement, svgImage, canvas, context, id;
      if (args.length === 3) {
        dx = args[1];
        dy = args[2];
        sw = image.width;
        sh = image.height;
        dw = sw;
        dh = sh;
      } else if (args.length === 5) {
        dx = args[1];
        dy = args[2];
        dw = args[3];
        dh = args[4];
        sw = image.width;
        sh = image.height;
      } else if (args.length === 9) {
        sx = args[1];
        sy = args[2];
        sw = args[3];
        sh = args[4];
        dx = args[5];
        dy = args[6];
        dw = args[7];
        dh = args[8];
      } else {
        throw new Error("Inavlid number of arguments passed to drawImage: " + arguments.length);
      }
      parent2 = this.__closestGroupOrSvg();
      currentElement = this.__currentElement;
      if (image instanceof ctx) {
        svg = image.getSvg();
        defs = svg.childNodes[0];
        while (defs.childNodes.length) {
          id = defs.childNodes[0].getAttribute("id");
          this.__ids[id] = id;
          this.__defs.appendChild(defs.childNodes[0]);
        }
        group = svg.childNodes[1];
        parent2.appendChild(group);
        this.__currentElement = group;
        this.translate(dx, dy);
        this.__currentElement = currentElement;
      } else if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
        svgImage = this.__createElement("image");
        svgImage.setAttribute("width", dw);
        svgImage.setAttribute("height", dh);
        svgImage.setAttribute("preserveAspectRatio", "none");
        if (sx || sy || sw !== image.width || sh !== image.height) {
          canvas = this.__document.createElement("canvas");
          canvas.width = dw;
          canvas.height = dh;
          context = canvas.getContext("2d");
          context.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
          image = canvas;
        }
        svgImage.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src")
        );
        parent2.appendChild(svgImage);
        this.__currentElement = svgImage;
        this.translate(dx, dy);
        this.__currentElement = currentElement;
      }
    };
    ctx.prototype.createPattern = function(image, repetition) {
      var pattern = this.__document.createElementNS("http://www.w3.org/2000/svg", "pattern"), id = randomString(this.__ids), img;
      pattern.setAttribute("id", id);
      pattern.setAttribute("width", image.width);
      pattern.setAttribute("height", image.height);
      if (image.nodeName === "CANVAS" || image.nodeName === "IMG") {
        img = this.__document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("width", image.width);
        img.setAttribute("height", image.height);
        img.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          image.nodeName === "CANVAS" ? image.toDataURL() : image.getAttribute("src")
        );
        pattern.appendChild(img);
        this.__defs.appendChild(pattern);
      } else if (image instanceof ctx) {
        pattern.appendChild(image.__root.childNodes[1]);
        this.__defs.appendChild(pattern);
      }
      return new CanvasPattern(pattern, this);
    };
    ctx.prototype.drawFocusRing = function() {
    };
    ctx.prototype.createImageData = function() {
    };
    ctx.prototype.getImageData = function() {
    };
    ctx.prototype.putImageData = function() {
    };
    ctx.prototype.globalCompositeOperation = function() {
    };
    ctx.prototype.setTransform = function() {
    };
    if (typeof window === "object") {
      window.C2S = ctx;
    }
    {
      module2.exports = ctx;
    }
  })();
})(canvas2svg);
var canvas2svgExports = canvas2svg.exports;
const C2S = /* @__PURE__ */ getDefaultExportFromCjs(canvas2svgExports);
class ImportExportTool {
  constructor(render) {
    __publicField(this, "render");
    this.render = render;
  }
  getView() {
    const copy = this.render.stage.clone();
    const main = copy.find("#main")[0];
    copy.removeChildren();
    let nodes = main.getChildren((node) => {
      return !this.render.ignore(node) && !this.render.ignoreDraw(node);
    });
    const layer = new Konva.Layer();
    layer.add(...nodes);
    nodes = layer.getChildren();
    let minX = 0;
    let maxX = copy.width() - this.render.rulerSize;
    let minY = 0;
    let maxY = copy.height() - this.render.rulerSize;
    for (const node of nodes) {
      const x = node.x();
      const y = node.y();
      const width = node.width();
      const height = node.height();
      if (x < minX) {
        minX = x;
      }
      if (x + width > maxX) {
        maxX = x + width;
      }
      if (y < minY) {
        minY = y;
      }
      if (y + height > maxY) {
        maxY = y + height;
      }
      if (node.attrs.nodeMousedownPos) {
        node.setAttrs({
          opacity: copy.attrs.lastOpacity ?? 1
        });
      }
    }
    copy.add(layer);
    copy.setAttrs({
      x: -minX,
      y: -minY,
      scale: { x: 1, y: 1 },
      width: maxX - minX,
      height: maxY - minY
    });
    return copy;
  }
  // 保存
  save() {
    const copy = this.getView();
    return copy.toJSON();
  }
  // 加载 image（用于导入）
  loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = src;
    });
  }
  // 恢复图片（用于导入）
  async restoreImage(nodes = []) {
    for (const node of nodes) {
      if (node instanceof Konva.Group) {
        await this.restoreImage(node.getChildren());
      } else if (node instanceof Konva.Image) {
        if (node.attrs.svgXML) {
          const blob = new Blob([node.attrs.svgXML], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const image = await this.loadImage(url);
          if (image) {
            node.image(image);
          }
        } else if (node.attrs.gif) {
          const imageNode = await this.render.assetTool.loadGif(node.attrs.gif);
          if (imageNode) {
            node.image(imageNode.image());
          }
        } else if (node.attrs.src) {
          const image = await this.loadImage(node.attrs.src);
          if (image) {
            node.image(image);
          }
        }
      }
    }
  }
  // 恢复
  async restore(json, silent = false) {
    try {
      this.render.selectionTool.selectingClear();
      this.render.layer.removeChildren();
      const container = document.createElement("div");
      const stage = Konva.Node.create(json, container);
      const main = stage.getChildren()[0];
      const nodes = main.getChildren();
      await this.restoreImage(nodes);
      this.render.layer.add(...nodes);
      this.render.selectionTool.select(this.render.layer.getChildren());
      this.render.selectionTool.selectingClear();
      if (!silent) {
        this.render.updateHistory();
      }
      this.render.draws[PreviewDraw.name].draw();
    } catch (e) {
      console.error(e);
    }
  }
  // 获取图片
  getImage(pixelRatio = 1, bgColor) {
    const copy = this.getView();
    const bgLayer = new Konva.Layer();
    const bg = new Konva.Rect({
      listening: false
    });
    bg.setAttrs({
      x: -copy.x(),
      y: -copy.y(),
      width: copy.width(),
      height: copy.height(),
      fill: bgColor
    });
    bgLayer.add(bg);
    const children = copy.getChildren();
    copy.removeChildren();
    copy.add(bgLayer);
    copy.add(children[0], ...children.slice(1));
    return copy.toDataURL({ pixelRatio });
  }
  // blob to base64 url
  blobToBase64(blob, type) {
    return new Promise((resolve) => {
      const file = new File([blob], "image", { type });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = function() {
        resolve(this.result ?? "");
      };
    });
  }
  // 替换 svg blob: 链接
  parseSvgImage(urls) {
    return new Promise((resolve) => {
      if (urls.length > 0) {
        Promise.all(urls.map((o) => fetch(o))).then((rs) => {
          Promise.all(rs.map((o) => o.text())).then((xmls) => {
            resolve(xmls);
          });
        });
      } else {
        resolve([]);
      }
    });
  }
  // 替换其他 image 链接
  parseOtherImage(urls) {
    return new Promise((resolve) => {
      if (urls.length > 0) {
        Promise.all(urls.map((o) => fetch(o))).then((rs) => {
          Promise.all(rs.map((o) => o.blob())).then((bs) => {
            Promise.all(bs.map((o) => this.blobToBase64(o, "image/*"))).then((urls2) => {
              resolve(urls2);
            });
          });
        });
      } else {
        resolve([]);
      }
    });
  }
  // 替换 image 链接
  parseImage(xml) {
    return new Promise((resolve) => {
      const svgs = xml.match(new RegExp('(?<=xlink:href=")blob:https?:\\/\\/[^"]+(?=")', "g")) ?? [];
      const imgs = xml.match(new RegExp('(?<=xlink:href=")(?<!blob:)[^"]+(?=")', "g")) ?? [];
      Promise.all([this.parseSvgImage(svgs), this.parseOtherImage(imgs)]).then(
        ([svgXmls, imgUrls]) => {
          svgs.forEach((svg, idx) => {
            var _a;
            xml = xml.replace(
              new RegExp(`<image[^><]* xlink:href="${svg}"[^><]*/>`),
              ((_a = svgXmls[idx].match(/<svg[^><]*>.*<\/svg>/)) == null ? void 0 : _a[0]) ?? ""
              // 仅保留 svg 结构
            );
          });
          imgs.forEach((img, idx) => {
            xml = xml.replace(`"${img}"`, `"${imgUrls[idx]}"`);
          });
          resolve(xml);
        }
      );
    });
  }
  // 获取Svg
  async getSvg() {
    const copy = this.getView();
    const main = copy.children[0];
    const ctx = main.canvas.context._context;
    if (ctx) {
      const c2s = new C2S({ ctx, ...main.size() });
      main.canvas.context._context = c2s;
      main.draw();
      const rawSvg = c2s.getSerializedSvg();
      console.log(rawSvg);
      const svg = await this.parseImage(rawSvg);
      console.log(svg);
      return svg;
    }
    return Promise.resolve(
      `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0"></svg>`
    );
  }
}
__publicField(ImportExportTool, "name", "ImportExportTool");
class Render {
  constructor(stageEle, config) {
    __publicField(this, "stage");
    // 主要层
    __publicField(this, "layer", new Konva.Layer({ id: "main" }));
    // 辅助层 - 底层
    __publicField(this, "layerFloor", new Konva.Layer());
    // 辅助层 - 顶层
    __publicField(this, "layerCover", new Konva.Layer());
    // 配置
    __publicField(this, "config");
    // 附加工具
    __publicField(this, "draws", {});
    // 素材工具
    __publicField(this, "assetTool");
    // 选择工具
    __publicField(this, "selectionTool");
    // 复制工具
    __publicField(this, "copyTool");
    // 定位工具
    __publicField(this, "positionTool");
    // 层级工具
    __publicField(this, "zIndexTool");
    // 导入导出
    __publicField(this, "importExportTool");
    // 多选器层
    __publicField(this, "groupTransformer", new Konva.Group());
    // 多选器
    __publicField(this, "transformer", new Konva.Transformer({
      shouldOverdrawWholeArea: true,
      borderDash: [4, 4],
      padding: 1,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315, 360]
    }));
    // 选择框
    __publicField(this, "selectRect", new Konva.Rect({
      id: "selectRect",
      fill: "rgba(0,0,255,0.1)",
      visible: false
    }));
    // 事件处理
    __publicField(this, "handlers", {});
    // 参数
    __publicField(this, "bgSize", 20);
    __publicField(this, "rulerSize", 0);
    __publicField(this, "previewSize", 0.2);
    // 预览框大小（比例）
    __publicField(this, "history", []);
    __publicField(this, "historyIndex", -1);
    this.config = config;
    if (this.config.showRuler) {
      this.rulerSize = 40;
    }
    this.stage = new Konva.Stage({
      container: stageEle,
      x: this.rulerSize,
      y: this.rulerSize,
      width: config.width,
      height: config.height
    });
    this.groupTransformer.add(this.transformer);
    this.groupTransformer.add(this.selectRect);
    this.layerCover.add(this.groupTransformer);
    this.draws[BgDraw.name] = new BgDraw(this, this.layerFloor, {
      size: this.bgSize
    });
    this.draws[RulerDraw.name] = new RulerDraw(this, this.layerCover, {
      size: this.rulerSize
    });
    this.draws[RefLineDraw.name] = new RefLineDraw(this, this.layerCover, {
      padding: this.rulerSize
    });
    this.draws[ContextmenuDraw.name] = new ContextmenuDraw(this, this.layerCover, {
      //
    });
    this.draws[PreviewDraw.name] = new PreviewDraw(this, this.layerCover, {
      size: this.previewSize
    });
    this.assetTool = new AssetTool(this);
    this.selectionTool = new SelectionTool(this);
    this.copyTool = new CopyTool(this);
    this.positionTool = new PositionTool(this);
    this.zIndexTool = new ZIndexTool(this);
    this.importExportTool = new ImportExportTool(this);
    this.handlers[DragHandlers.name] = new DragHandlers(this);
    this.handlers[ZoomHandlers.name] = new ZoomHandlers(this);
    this.handlers[DragOutsideHandlers.name] = new DragOutsideHandlers(this);
    this.handlers[RefLineDraw.name] = this.draws[RefLineDraw.name];
    this.handlers[SelectionHandlers.name] = new SelectionHandlers(this);
    this.handlers[KeyMoveHandlers.name] = new KeyMoveHandlers(this);
    this.handlers[ShutcutHandlers.name] = new ShutcutHandlers(this);
    this.init();
  }
  // 初始化
  init() {
    this.stage.add(this.layerFloor);
    this.draws[BgDraw.name].init();
    this.stage.add(this.layer);
    this.stage.add(this.layerCover);
    this.draws[RulerDraw.name].init();
    this.draws[RefLineDraw.name].init();
    this.draws[ContextmenuDraw.name].init();
    this.draws[PreviewDraw.name].init();
    this.eventBind();
    this.updateHistory();
  }
  // 更新 stage 尺寸
  resize(width, height) {
    this.stage.setAttrs({
      width,
      height
    });
    this.draws[BgDraw.name].draw();
    this.draws[RulerDraw.name].draw();
    this.draws[PreviewDraw.name].draw();
  }
  // 移除元素
  remove(nodes) {
    for (const node of nodes) {
      if (node instanceof Konva.Transformer) {
        this.remove(this.selectionTool.selectingNodes);
        this.selectionTool.selectingClear();
      } else {
        node.remove();
      }
    }
    if (nodes.length > 0) {
      this.updateHistory();
      this.draws[PreviewDraw.name].draw();
    }
  }
  prevHistory() {
    var _a, _b;
    const record = this.history[this.historyIndex - 1];
    if (record) {
      this.importExportTool.restore(record, true);
      this.historyIndex--;
      (_b = (_a = this.config.on) == null ? void 0 : _a.historyChange) == null ? void 0 : _b.call(_a, lodash.clone(this.history), this.historyIndex);
    }
  }
  nextHistory() {
    var _a, _b;
    const record = this.history[this.historyIndex + 1];
    if (record) {
      this.importExportTool.restore(record, true);
      this.historyIndex++;
      (_b = (_a = this.config.on) == null ? void 0 : _a.historyChange) == null ? void 0 : _b.call(_a, lodash.clone(this.history), this.historyIndex);
    }
  }
  updateHistory() {
    var _a, _b;
    this.history.splice(this.historyIndex + 1);
    this.history.push(this.importExportTool.save());
    this.historyIndex = this.history.length - 1;
    (_b = (_a = this.config.on) == null ? void 0 : _a.historyChange) == null ? void 0 : _b.call(_a, lodash.clone(this.history), this.historyIndex);
  }
  // 事件绑定
  eventBind() {
    var _a;
    for (const event of ["mousedown", "mouseup", "mousemove", "wheel", "contextmenu"]) {
      this.stage.on(event, (e) => {
        var _a2, _b, _c, _d, _e, _f, _g;
        (_a2 = e == null ? void 0 : e.evt) == null ? void 0 : _a2.preventDefault();
        for (const k in this.draws) {
          (_d = (_c = (_b = this.draws[k].handlers) == null ? void 0 : _b.stage) == null ? void 0 : _c[event]) == null ? void 0 : _d.call(_c, e);
        }
        for (const k in this.handlers) {
          (_g = (_f = (_e = this.handlers[k].handlers) == null ? void 0 : _e.stage) == null ? void 0 : _f[event]) == null ? void 0 : _g.call(_f, e);
        }
      });
    }
    const container = this.stage.container();
    container.tabIndex = 1;
    container.focus();
    for (const event of [
      "mouseenter",
      "dragenter",
      "mousemove",
      "mouseout",
      "dragenter",
      "dragover",
      "drop",
      "keydown",
      "keyup"
    ]) {
      container.addEventListener(event, (e) => {
        var _a2, _b, _c, _d, _e, _f;
        e == null ? void 0 : e.preventDefault();
        if (["mouseenter", "dragenter"].includes(event)) {
          this.stage.container().focus();
        }
        for (const k in this.draws) {
          (_c = (_b = (_a2 = this.draws[k].handlers) == null ? void 0 : _a2.dom) == null ? void 0 : _b[event]) == null ? void 0 : _c.call(_b, e);
        }
        for (const k in this.handlers) {
          (_f = (_e = (_d = this.handlers[k].handlers) == null ? void 0 : _d.dom) == null ? void 0 : _e[event]) == null ? void 0 : _f.call(_e, e);
        }
      });
    }
    for (const event of [
      "mousedown",
      "transform",
      "transformend",
      "dragstart",
      "dragmove",
      "dragend"
    ]) {
      this.transformer.on(event, (e) => {
        var _a2, _b, _c, _d, _e, _f, _g;
        (_a2 = e == null ? void 0 : e.evt) == null ? void 0 : _a2.preventDefault();
        for (const k in this.draws) {
          (_d = (_c = (_b = this.draws[k].handlers) == null ? void 0 : _b.transformer) == null ? void 0 : _c[event]) == null ? void 0 : _d.call(_c, e);
        }
        for (const k in this.handlers) {
          (_g = (_f = (_e = this.handlers[k].handlers) == null ? void 0 : _e.transformer) == null ? void 0 : _f[event]) == null ? void 0 : _g.call(_f, e);
        }
      });
    }
    ((_a = this.handlers[SelectionHandlers.name].transformerConfig) == null ? void 0 : _a.anchorDragBoundFunc) && this.transformer.anchorDragBoundFunc(
      this.handlers[SelectionHandlers.name].transformerConfig.anchorDragBoundFunc
    );
  }
  // 获取 stage 状态
  getStageState() {
    return {
      width: this.stage.width() - this.rulerSize,
      height: this.stage.height() - this.rulerSize,
      scale: this.stage.scaleX(),
      x: this.stage.x(),
      y: this.stage.y()
    };
  }
  // 相对大小（基于 stage，且无视 scale）
  toStageValue(boardPos) {
    return boardPos / this.stage.scaleX();
  }
  // 绝对大小（基于可视区域像素）
  toBoardValue(stagePos) {
    return stagePos * this.stage.scaleX();
  }
  // 忽略非素材
  ignore(node) {
    const isGroup = node instanceof Konva.Group;
    return !isGroup || node.id() === "selectRect" || this.ignoreDraw(node);
  }
  // 忽略各 draw 的根 group
  ignoreDraw(node) {
    return node.name() === BgDraw.name || node.name() === RulerDraw.name || node.name() === RefLineDraw.name || node.name() === ContextmenuDraw.name || node.name() === PreviewDraw.name;
  }
}
const _withScopeId = (n) => (pushScopeId("data-v-fb782ae1"), n = n(), popScopeId(), n);
const _hoisted_1 = { class: "page" };
const _hoisted_2 = ["disabled"];
const _hoisted_3 = ["disabled"];
const _hoisted_4 = ["onDragstart"];
const _hoisted_5 = ["src"];
const _hoisted_6 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("footer", null, null, -1));
const _hoisted_7 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("footer", null, null, -1));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    const boardElement = ref();
    const stageElement = ref();
    let render = null;
    const resizer = /* @__PURE__ */ (() => {
      let resizeObserver = null;
      let x = 0;
      function init2(target, config) {
        function getStageSize() {
          const { width, height } = target.getBoundingClientRect();
          return [0, 0, width, height];
        }
        if (resizeObserver) {
          resizeObserver.observe(target);
        } else {
          resizeObserver = new ResizeObserver(() => {
            const [, , w, h] = getStageSize();
            config.resize(x - target.getBoundingClientRect().x, 0, w, h);
          });
          resizeObserver.observe(target);
          x = target.getBoundingClientRect().x;
        }
      }
      function pause() {
        resizeObserver == null ? void 0 : resizeObserver.disconnect();
      }
      return {
        init: init2,
        pause
      };
    })();
    const history = ref([]);
    const historyIndex = ref(-1);
    function onPrev() {
      if (render) {
        render.prevHistory();
      }
    }
    function onNext() {
      if (render) {
        render.nextHistory();
      }
    }
    function init() {
      if (boardElement.value && stageElement.value) {
        resizer.init(boardElement.value, {
          resize: (x, y, width, height) => {
            if (render === null) {
              render = new Render(stageElement.value, {
                width,
                height,
                //
                showBg: true,
                showRuler: true,
                showRefLine: true,
                attractResize: true,
                attractBg: true,
                showPreview: true,
                attractNode: true,
                //
                on: {
                  historyChange: (records, index) => {
                    history.value = records;
                    historyIndex.value = index;
                  }
                }
              });
            }
            render.resize(width, height);
          }
        });
      }
    }
    onMounted(() => {
      init();
    });
    const assetsModules = /* @__PURE__ */ Object.assign({
      "./assets/img/gif/5.gif": __vite_glob_0_0,
      "./assets/img/gif/6.gif": __vite_glob_0_1,
      "./assets/img/gif/8.gif": __vite_glob_0_2,
      "./assets/img/png/1.png": __vite_glob_0_3,
      "./assets/img/png/2.png": __vite_glob_0_4,
      "./assets/img/png/3.png": __vite_glob_0_5,
      "./assets/img/png/7.png": __vite_glob_0_6,
      "./assets/img/png/9.png": __vite_glob_0_7,
      "./assets/img/svg/AC_2.svg": __vite_glob_0_8,
      "./assets/img/svg/AC_SOURCE.svg": __vite_glob_0_9,
      "./assets/img/svg/ARCSUPPCOIL.svg": __vite_glob_0_10,
      "./assets/img/svg/ARRESTER_1.svg": __vite_glob_0_11,
      "./assets/img/svg/ARRESTER_2.svg": __vite_glob_0_12,
      "./assets/img/svg/ARRESTER_2_1.svg": __vite_glob_0_13,
      "./assets/img/svg/BREAKER_CLOSE.svg": __vite_glob_0_14,
      "./assets/img/svg/BREAKER_OPEN.svg": __vite_glob_0_15,
      "./assets/img/svg/CAPACITOR.svg": __vite_glob_0_16,
      "./assets/img/svg/CT.svg": __vite_glob_0_17,
      "./assets/img/svg/CT_1.svg": __vite_glob_0_18,
      "./assets/img/svg/CT_2.svg": __vite_glob_0_19,
      "./assets/img/svg/CT_3.svg": __vite_glob_0_20,
      "./assets/img/svg/DDCT.svg": __vite_glob_0_21,
      "./assets/img/svg/DELTAWINDING.svg": __vite_glob_0_22,
      "./assets/img/svg/EQUIVALENTSOURCE.svg": __vite_glob_0_23,
      "./assets/img/svg/FLANGED_CONNECTION.svg": __vite_glob_0_24,
      "./assets/img/svg/GROUND.svg": __vite_glob_0_25,
      "./assets/img/svg/HL.svg": __vite_glob_0_26,
      "./assets/img/svg/INDUCTOR.svg": __vite_glob_0_27,
      "./assets/img/svg/IRONCOREGAPINDUCTOR.svg": __vite_glob_0_28,
      "./assets/img/svg/IRONCOREINDUCTOR.svg": __vite_glob_0_29,
      "./assets/img/svg/IRONCOREVARINDUCTOR.svg": __vite_glob_0_30,
      "./assets/img/svg/LOAD.svg": __vite_glob_0_31,
      "./assets/img/svg/MEMRISTOR_1.svg": __vite_glob_0_32,
      "./assets/img/svg/MULTIPLIER.svg": __vite_glob_0_33,
      "./assets/img/svg/POTENTIAL_TRANSFORMER_2.svg": __vite_glob_0_34,
      "./assets/img/svg/POT_TRANS_3_WINDINGS.svg": __vite_glob_0_35,
      "./assets/img/svg/PROTECT_GROUND.svg": __vite_glob_0_36,
      "./assets/img/svg/PT.svg": __vite_glob_0_37,
      "./assets/img/svg/PT_1.svg": __vite_glob_0_38,
      "./assets/img/svg/REACTOR.svg": __vite_glob_0_39,
      "./assets/img/svg/REGUINDUCTOR.svg": __vite_glob_0_40,
      "./assets/img/svg/REGYCAPACITOR.svg": __vite_glob_0_41,
      "./assets/img/svg/SERIES_CAPACITOR.svg": __vite_glob_0_42,
      "./assets/img/svg/SHUNT_REACTOR.svg": __vite_glob_0_43,
      "./assets/img/svg/SHUNT_REACTOR_1.svg": __vite_glob_0_44,
      "./assets/img/svg/SIX_CIRCLE.svg": __vite_glob_0_45,
      "./assets/img/svg/ST.svg": __vite_glob_0_46,
      "./assets/img/svg/THERR_CIRCLE.svg": __vite_glob_0_47,
      "./assets/img/svg/WINDING.svg": __vite_glob_0_48,
      "./assets/img/svg/WINDINGX.svg": __vite_glob_0_49,
      "./assets/img/svg/YWINDING.svg": __vite_glob_0_50,
      "./assets/img/svg/a-CT2xianghu.svg": __vite_glob_0_51,
      "./assets/img/svg/a-CTsanxiang.svg": __vite_glob_0_52,
      "./assets/img/svg/combin.svg": __vite_glob_0_53,
      "./assets/img/svg/combin2.svg": __vite_glob_0_54,
      "./assets/img/svg/combin3.svg": __vite_glob_0_55,
      "./assets/img/svg/combin4.svg": __vite_glob_0_56,
      "./assets/img/svg/combin5.svg": __vite_glob_0_57,
      "./assets/img/svg/guangfufadian.svg": __vite_glob_0_58,
      "./assets/img/svg/jiedidaozha.svg": __vite_glob_0_59,
      "./assets/img/svg/sukeduanluqi.svg": __vite_glob_0_60,
      "./assets/img/svg/xianshideng.svg": __vite_glob_0_61
    });
    const assetsInfos = computed(() => {
      return Object.keys(assetsModules).map((o) => ({
        url: assetsModules[o].default
      }));
    });
    function onDragstart(e, item) {
      var _a;
      if (e.dataTransfer) {
        e.dataTransfer.setData("src", item.url);
        e.dataTransfer.setData("type", ((_a = item.url.match(/([^./]+)\.([^./]+)$/)) == null ? void 0 : _a[2]) ?? "");
      }
    }
    function onSave() {
      if (render) {
        const a = document.createElement("a");
        const event = new MouseEvent("click");
        a.download = "data.json";
        a.href = window.URL.createObjectURL(new Blob([render.importExportTool.save()]));
        a.dispatchEvent(event);
        a.remove();
      }
    }
    function onRestore() {
      if (render) {
        const input = document.createElement("input");
        input.type = "file";
        const event = new MouseEvent("click");
        input.dispatchEvent(event);
        input.remove();
        input.onchange = () => {
          const files = input.files;
          if (files) {
            let reader = new FileReader();
            reader.onload = function() {
              render.importExportTool.restore(this.result.toString());
            };
            reader.readAsText(files[0]);
          }
        };
      }
    }
    function onSavePNG() {
      if (render) {
        const url = render.importExportTool.getImage(3, "#ffffff");
        const a = document.createElement("a");
        const event = new MouseEvent("click");
        a.download = "image";
        a.href = url;
        a.dispatchEvent(event);
        a.remove();
      }
    }
    async function onSaveSvg() {
      if (render) {
        const svg = await render.importExportTool.getSvg();
        const a = document.createElement("a");
        const event = new MouseEvent("click");
        a.download = "image.svg";
        a.href = window.URL.createObjectURL(new Blob([svg]));
        a.dispatchEvent(event);
        a.remove();
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("header", null, [
          createBaseVNode("button", { onClick: onRestore }, "导入"),
          createBaseVNode("button", { onClick: onSave }, "导出"),
          createBaseVNode("button", { onClick: onSavePNG }, "另存为图片"),
          createBaseVNode("button", { onClick: onSaveSvg }, "另存为Svg"),
          createBaseVNode("button", {
            onClick: onPrev,
            disabled: historyIndex.value <= 0
          }, "上一步", 8, _hoisted_2),
          createBaseVNode("button", {
            onClick: onNext,
            disabled: historyIndex.value >= history.value.length - 1
          }, "下一步", 8, _hoisted_3)
        ]),
        createBaseVNode("section", null, [
          createBaseVNode("header", null, [
            createBaseVNode("ul", null, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(assetsInfos.value, (item, idx) => {
                return openBlock(), createElementBlock("li", {
                  key: idx,
                  draggable: "true",
                  onDragstart: ($event) => onDragstart($event, item)
                }, [
                  createBaseVNode("img", {
                    src: item.url,
                    style: { "object-fit": "contain", "width": "100%", "height": "100%" }
                  }, null, 8, _hoisted_5)
                ], 40, _hoisted_4);
              }), 128))
            ])
          ]),
          createBaseVNode("section", {
            ref_key: "boardElement",
            ref: boardElement
          }, [
            createBaseVNode("div", {
              ref_key: "stageElement",
              ref: stageElement
            }, null, 512)
          ], 512),
          _hoisted_6
        ]),
        _hoisted_7
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fb782ae1"]]);
createApp(App).mount("#app");
