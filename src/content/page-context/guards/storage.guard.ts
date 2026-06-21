import { defineNative } from "../utils/stealth";

export function applyStorageGuard(mode: string): void {
  if (mode === "off") return;

  if (mode === "block") {
    installEphemeralStorage("localStorage");
    installEphemeralStorage("sessionStorage");

    if (typeof BroadcastChannel !== "undefined") {
      const Noop = function (this: unknown) {
        return {
          postMessage() {},
          close() {},
          addEventListener() {},
          removeEventListener() {},
          onmessage: null,
        };
      } as unknown as typeof BroadcastChannel;
      (window as unknown as { BroadcastChannel: unknown }).BroadcastChannel =
        Noop;
    }
  }

}

function installEphemeralStorage(kind: "localStorage" | "sessionStorage") {
  const store = new Map<string, string>();
  const ephemeral: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(i: number) {
      return Array.from(store.keys())[i] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    Object.defineProperty(window, kind, {
      get: defineNative(() => ephemeral, `get ${kind}`),
      configurable: true,
    });
  } catch {
  }
}
