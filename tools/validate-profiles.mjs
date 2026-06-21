#!/usr/bin/env node

import { PROFILES } from "../packages/browser-extension/dist/shared/profiles.js";
import { validateAllProfiles } from "../packages/browser-extension/dist/shared/profileValidation.js";

const issues = validateAllProfiles(PROFILES);

if (issues.length === 0) {
  console.log(`✓ ${Object.keys(PROFILES).length} profil(s) valides, cohérence OK.`);
  process.exit(0);
}

console.error(`✗ ${issues.length} problème(s) de cohérence détecté(s) :\n`);
for (const i of issues) {
  console.error(`  [${i.profileId}] ${i.field}: ${i.message}`);
}
process.exit(1);
