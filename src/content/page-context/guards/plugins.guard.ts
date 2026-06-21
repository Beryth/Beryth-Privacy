import { patchProperty } from "../utils/stealth";

export function applyPluginsGuard(mode: string): void {
  if (mode === "off") return;

  const emptyArray = mode === "block";

  const makeArrayLike = (items: unknown[]) => {
    const arr = items.slice();
    return new Proxy(arr, {
      get(target, prop) {
        if (prop === "length") return target.length;
        if (prop === "item")
          return (i: number) => target[i] ?? null;
        if (prop === "namedItem") return () => null;
        return target[prop as unknown as number];
      },
    });
  };

  patchProperty(navigator, "plugins", () =>
    makeArrayLike(emptyArray ? [] : [])
  );
  patchProperty(navigator, "mimeTypes", () =>
    makeArrayLike([])
  );
}
