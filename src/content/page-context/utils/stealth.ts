const nativeToString = Function.prototype.toString;

const fakeNatives = new WeakMap<Function, string>();

export function defineNative<T extends Function>(
  fn: T,
  name: string
): T {
  fakeNatives.set(fn, `function ${name}() { [native code] }`);
  return fn;
}

Function.prototype.toString = defineNative(function (this: Function) {
  if (fakeNatives.has(this)) return fakeNatives.get(this)!;
  return nativeToString.call(this);
}, "toString");

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
  } catch {
  }
}
