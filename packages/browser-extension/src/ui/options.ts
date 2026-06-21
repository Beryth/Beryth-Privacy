const MODULES: { key: string; label: string; modes: string[] }[] = [
  { key: "navigator", label: "Navigator / Platform", modes: ["off", "uniform"] },
  { key: "screen", label: "Screen / Window", modes: ["off", "uniform"] },
  { key: "timezone", label: "Timezone / Locale", modes: ["off", "uniform"] },
  { key: "clienthints", label: "Client Hints (UA-CH)", modes: ["off", "uniform"] },
  { key: "plugins", label: "Plugins / MimeTypes", modes: ["off", "uniform"] },
  { key: "fonts", label: "Fonts", modes: ["off", "uniform", "block"] },
  { key: "canvas", label: "Canvas", modes: ["off", "uniform", "block"] },
  { key: "webgl", label: "WebGL", modes: ["off", "uniform", "block"] },
  { key: "audio", label: "AudioContext", modes: ["off", "uniform", "block"] },
  { key: "webrtc", label: "WebRTC", modes: ["off", "block"] },
  { key: "storage", label: "Storage / Supercookies", modes: ["off", "block"] },
];

async function loadConfig() {
  const { config } = await chrome.storage.local.get("config");
  return config;
}

async function saveConfig(config: unknown) {
  await chrome.storage.local.set({ config });
  await chrome.runtime.sendMessage({ type: "CONFIG_CHANGED" });
}

function switchTab(tab: string): void {
  document
    .querySelectorAll(".gk-tab")
    .forEach((b) =>
      b.classList.toggle("active", (b as HTMLElement).dataset.tab === tab)
    );
  document.querySelectorAll(".gk-panel").forEach((p) =>
    p.classList.toggle("active", p.id === `tab-${tab}`)
  );
}

function renderModules(config: any): void {
  const list = document.getElementById("gk-modules-list")!;
  list.innerHTML = "";
  config.modules = config.modules ?? {};

  for (const mod of MODULES) {
    const current = config.modules[mod.key] ?? mod.modes[mod.modes.length - 1];

    const row = document.createElement("div");
    row.className = "gk-module-row";

    const label = document.createElement("span");
    label.className = "gk-module-label";
    label.textContent = mod.label;

    const select = document.createElement("select");
    select.className = "gk-module-mode";
    for (const mode of mod.modes) {
      const opt = document.createElement("option");
      opt.value = mode;
      opt.textContent = mode;
      if (mode === current) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", async () => {
      config.modules[mod.key] = select.value;
      await saveConfig(config);
    });

    row.appendChild(label);
    row.appendChild(select);
    list.appendChild(row);
  }
}

async function renderRules(): Promise<void> {
  const status = document.getElementById("gk-rules-status")!;
  const { rulesMeta } = await chrome.storage.local.get("rulesMeta");
  const last = rulesMeta?.lastUpdate
    ? new Date(rulesMeta.lastUpdate).toLocaleString()
    : "jamais";
  status.textContent = `Dernière mise à jour : ${last}`;
}

async function renderAudit(): Promise<void> {
  const report = document.getElementById("gk-audit-report")!;
  const audit = await chrome.runtime.sendMessage({ type: "RUN_LOCAL_AUDIT" });
  if (!audit) {
    report.textContent = "Aucun audit disponible.";
    return;
  }
  report.innerHTML = `
    <div class="gk-audit-score">${audit.bits.toFixed(2)} bits estimés</div>
    <ul class="gk-audit-list">
      ${audit.vectors
        .map(
          (v: any) =>
            `<li><span>${v.name}</span><span>${v.status}</span></li>`
        )
        .join("")}
    </ul>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadConfig();

  document.querySelectorAll(".gk-tab").forEach((btn) =>
    btn.addEventListener("click", () =>
      switchTab((btn as HTMLElement).dataset.tab!)
    )
  );

  renderModules(config);
  await renderRules();

  document
    .getElementById("gk-update-rules")!
    .addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ type: "FORCE_RULES_UPDATE" });
      await renderRules();
    });

  document
    .getElementById("gk-run-audit")!
    .addEventListener("click", renderAudit);
});
