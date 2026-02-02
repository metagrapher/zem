"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Err: () => Err,
  Ok: () => Ok,
  Result: () => Result,
  atomic: () => atomic,
  atomicAsync: () => atomicAsync,
  chain: () => chain,
  choice: () => choice,
  compose: () => compose,
  constant: () => constant,
  curry: () => curry,
  fold: () => fold,
  formatDate: () => formatDate,
  fromHex: () => fromHex,
  fromPromise: () => fromPromise,
  identity: () => identity,
  map: () => map,
  pipe: () => pipe,
  safeJSON: () => safeJSON,
  safeURL: () => safeURL,
  sequence: () => sequence,
  tap: () => tap,
  toHex: () => toHex
});
module.exports = __toCommonJS(index_exports);

// src/algebra/Result.ts
var Ok = (value) => ({ ok: true, value });
var Err = (error) => ({ ok: false, error });
var atomic = (fn) => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e instanceof Error ? e.message : String(e));
  }
};
var atomicAsync = async (fn) => {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e instanceof Error ? e.message : String(e));
  }
};
var fromPromise = async (promise) => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(e instanceof Error ? e.message : String(e));
  }
};
var Result = {
  fromPromise,
  Ok,
  Err,
  atomic,
  atomicAsync
};

// src/logic/choice.ts
var choice = (...results) => results.find((r) => r.ok) || results[results.length - 1] || Err("EMPTY_CHOICE");

// src/logic/transform.ts
var chain = (result, fn) => result.ok ? fn(result.value) : result;
var map = (result, fn) => result.ok ? Ok(fn(result.value)) : result;
var fold = (result, match) => result.ok ? match.ok(result.value) : match.err(result.error);
var sequence = (results) => results.reduce(
  (acc, r) => acc.ok ? r.ok ? Ok([...acc.value, r.value]) : r : acc,
  Ok([])
);
var tap = (result, fn) => {
  if (result.ok) fn(result.value);
  return result;
};

// src/logic/composition.ts
var identity = (v) => v;
var constant = (v) => () => v;
var curry = (fn) => {
  const curried = (...args) => args.length >= fn.length ? fn(...args) : (...nextArgs) => curried(...args, ...nextArgs);
  return curried;
};
var pipe = (value, ...fns) => fns.reduce((acc, fn) => fn(acc), value);
var compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

// src/logic/web.ts
var formatDate = (date) => new Intl.DateTimeFormat(
  "en-US",
  {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }
).format(date);
var safeURL = (input) => {
  if (input instanceof URL) return Ok(input);
  const urlStr = typeof input === "object" && input !== null && "url" in input ? String(input.url) : String(input);
  return atomic(() => new URL(urlStr));
};
var safeJSON = (input) => atomic(() => JSON.parse(input));

// src/binary/hex.ts
var toHex = (buffer) => Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
var fromHex = (hex) => {
  const pairs = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Err,
  Ok,
  Result,
  atomic,
  atomicAsync,
  chain,
  choice,
  compose,
  constant,
  curry,
  fold,
  formatDate,
  fromHex,
  fromPromise,
  identity,
  map,
  pipe,
  safeJSON,
  safeURL,
  sequence,
  tap,
  toHex
});
