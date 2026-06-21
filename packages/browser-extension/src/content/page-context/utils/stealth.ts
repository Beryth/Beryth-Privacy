const nativeToString = Function.prototype.toString;

const fakeNatives = new WeakMap<Function, string>();

export function defineNative<T extends Function>(
  fn: T,
  name: string
): T {
  try {
    Object.defineProperty(fn, "name", {
      value: name,
      configurable: true,
      writable: false,
      enumerable: false
    });
  } catch {}

  fakeNatives.set(fn, `function ${name}() { [native code] }`);
  return fn;
}

const fakeToString = function (this: Function) {
  if (fakeNatives.has(this)) return fakeNatives.get(this)!;
  return nativeToString.call(this);
};

defineNative(fakeToString, "toString");

Object.defineProperty(Function.prototype, "toString", {
  value: fakeToString,
  configurable: true,
  writable: true,
  enumerable: false,
});

export function patchProperty(
  obj: object,
  prop: string,
  getter: () => unknown
): void {
  try {
    Object.defineProperty(obj, prop, {
      get: defineNative(getter, `get ${prop}`),
      configurable: true,
      enumerable: true,
    });
  } catch {}
}
