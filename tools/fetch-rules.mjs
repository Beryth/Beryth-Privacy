import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const SOURCES = [
  {
    name: "easyprivacy",
    url: "https://easylist.to/easylist/easyprivacy.txt",
    out: "raw/easyprivacy.txt",
  },
  {
    name: "tracker-radar",
    url: "https://raw.githubusercontent.com/duckduckgo/tracker-radar/main/build-data/generated/domain_map.json",
    out: "raw/tracker-radar.json",
  },
];

for (const src of SOURCES) {
  process.stdout.write(`Fetching ${src.name}… `);
  const res = await fetch(src.url);
  if (!res.ok) {
    console.error(`FAILED (${res.status})`);
    continue;
  }
  const body = await res.text();
  await mkdir(dirname(src.out), { recursive: true });
  await writeFile(src.out, body, "utf8");
  console.log("ok");
}
