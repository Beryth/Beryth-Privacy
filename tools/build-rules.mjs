import { readFile, writeFile } from "node:fs/promises";

const OUT_DIR = "packages/browser-extension/public/rules";

function easylistLineToRule(line, id) {
  const trimmed = line.trim();
  if (
    !trimmed ||
    trimmed.startsWith("!") ||
    trimmed.includes("##") ||
    trimmed.includes("#@#")
  ) {
    return null;
  }

  const m = trimmed.match(/^\|\|([a-z0-9.-]+)\^?$/i);
  if (!m) return null;

  return {
    id,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${m[1]}^`,
      resourceTypes: [
        "script",
        "image",
        "xmlhttprequest",
        "sub_frame",
        "ping",
        "websocket",
        "media",
        "font",
      ],
    },
  };
}

async function buildEasyPrivacy() {
  const raw = await readFile("raw/easyprivacy.txt", "utf8");
  const rules = [];
  let id = 1;
  for (const line of raw.split("\n")) {
    const rule = easylistLineToRule(line, id);
    if (rule) {
      rules.push(rule);
      id++;
    }
    if (id > 30000) break;
  }
  await writeFile(
    `${OUT_DIR}/easyprivacy.json`,
    JSON.stringify(rules, null, 0),
    "utf8"
  );
  console.log(`easyprivacy: ${rules.length} règles`);
}

async function buildTrackerRadar() {
  const raw = JSON.parse(await readFile("raw/tracker-radar.json", "utf8"));
  const domains = Object.keys(raw);
  const rules = domains.slice(0, 20000).map((domain, i) => ({
    id: 100000 + i,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${domain}^`,
      resourceTypes: ["script", "xmlhttprequest", "image", "sub_frame", "ping"],
    },
  }));
  await writeFile(
    `${OUT_DIR}/tracker-radar.json`,
    JSON.stringify(rules, null, 0),
    "utf8"
  );
  console.log(`tracker-radar: ${rules.length} règles`);
}

await buildEasyPrivacy();
await buildTrackerRadar();
