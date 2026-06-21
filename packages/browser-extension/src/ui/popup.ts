interface PopupState {
  enabled: boolean;
  origin: string;
  trackers: number;
  apis: number;
  profileId: string;
}

async function getActiveOrigin(): Promise<string> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  try {
    return tab?.url ? new URL(tab.url).origin : "—";
  } catch {
    return "—";
  }
}

async function loadState(): Promise<PopupState> {
  const origin = await getActiveOrigin();
  const { config } = await chrome.storage.local.get("config");
  const stats = await chrome.runtime.sendMessage({
    type: "GET_STATS_FOR_ORIGIN",
    origin,
  });
  return {
    enabled: config?.enabled ?? true,
    origin,
    trackers: stats?.trackers ?? 0,
    apis: stats?.apis ?? 0,
    profileId: config?.activeProfileId ?? "uniform",
  };
}

function render(state: PopupState): void {
  (document.getElementById("gk-master") as HTMLInputElement).checked =
    state.enabled;
  document.getElementById("gk-origin")!.textContent = state.origin;
  document.getElementById("gk-trackers")!.textContent = String(state.trackers);
  document.getElementById("gk-apis")!.textContent = String(state.apis);
}

async function setMaster(enabled: boolean): Promise<void> {
  const { config } = await chrome.storage.local.get("config");
  config.enabled = enabled;
  await chrome.storage.local.set({ config });
  await chrome.runtime.sendMessage({ type: "CONFIG_CHANGED" });
}

async function trustSite(origin: string): Promise<void> {
  const { config } = await chrome.storage.local.get("config");
  config.overrides = config.overrides ?? {};
  config.overrides[origin] = { ...config.overrides[origin], trusted: true };
  await chrome.storage.local.set({ config });
  await chrome.runtime.sendMessage({ type: "CONFIG_CHANGED" });
}

document.addEventListener("DOMContentLoaded", async () => {
  const state = await loadState();
  render(state);

  document
    .getElementById("gk-master")!
    .addEventListener("change", (e) =>
      setMaster((e.target as HTMLInputElement).checked)
    );

  document
    .getElementById("gk-trust")!
    .addEventListener("click", () => trustSite(state.origin));

  document
    .getElementById("gk-open-options")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
});
