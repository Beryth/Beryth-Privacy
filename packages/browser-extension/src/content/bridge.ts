import { computeOriginSeed } from "./page-context/utils/originSeed";

(async function bridge() {
  try {
    const config = await chrome.runtime.sendMessage({
      type: "GET_CONFIG_FOR_ORIGIN",
      origin: location.origin,
    });

    if (!config || !config.enabled) return;

    const seed = await computeOriginSeed(location.origin, config.salt);

    const payload = JSON.stringify(config);
    const script = document.createElement("script");
    script.textContent =
      `window.__GK_SEED__=${seed};` +
      `window.__GK_CONFIG__=${JSON.stringify(payload)};` +
      `(${injectedLoader.toString()})();`;
    (document.head || document.documentElement).prepend(script);
    script.remove();
  } catch {
  }
})();

function injectedLoader() {
}
