const nativeToString = Function.prototype.toString;
const patchedFns = new WeakSet<Function>();

export function defineNative<T extends Function>(fn: T, name: string): T {
  try {
    Object.defineProperty(fn, "name", { value: name, configurable: true });
  } catch {
  }
  patchedFns.add(fn);
  return fn;
}

const fakeToString = function (this: Function) {
  if (patchedFns.has(this)) {
    return `function ${this.name}() { [native code] }`;
  }
  return nativeToString.call(this);
};
patchedFns.add(fakeToString);
Object.defineProperty(Function.prototype, "toString", {
  value: fakeToString,
  configurable: true,
  writable: true,
});

export function patchProperty(
  target: object,
  prop: string,
  getter: () => unknown
): void {
  try {
    Object.defineProperty(target, prop, {
      get: defineNative(getter, `get ${prop}`),
      configurable: true,
      enumerable: true,
    });
  } catch {
  }
}
