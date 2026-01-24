// src/algebra/Result.ts
var Ok = (value) => ({ ok: true, value });
var Err = (error) => ({ ok: false, error });
var atomic = (fn) => {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e.message || String(e));
  }
};
var atomicAsync = async (fn) => {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e.message || String(e));
  }
};
var fromPromise = async (promise) => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(e.message || String(e));
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
export {
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
};
