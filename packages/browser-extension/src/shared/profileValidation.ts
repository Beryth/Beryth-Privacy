import type { Profile } from "./profiles";

export interface ProfileIssue {
  profileId: string;
  field: string;
  message: string;
}

export function validateProfile(p: Profile): ProfileIssue[] {
  const issues: ProfileIssue[] = [];
  const add = (field: string, message: string) =>
    issues.push({ profileId: p.id, field, message });

  if (!p.id) add("id", "id manquant");
  if (!p.userAgent) add("userAgent", "userAgent manquant");
  if (!p.languages?.length) add("languages", "languages vide");
  if (p.language && p.languages && p.languages[0] !== p.language) {
    add("language", `language "${p.language}" != languages[0] "${p.languages[0]}"`);
  }


  if (p.acceptLanguage && p.languages?.length) {
    const primary = p.languages[0];
    if (!p.acceptLanguage.startsWith(primary)) {
      add(
        "acceptLanguage",
        `acceptLanguage "${p.acceptLanguage}" ne commence pas par languages[0] "${primary}"`
      );
    }
  }

  const chPlatform = p.secChUaPlatform.replace(/"/g, "");
  if (chPlatform !== p.uaClientHints.platform) {
    add(
      "secChUaPlatform",
      `secChUaPlatform "${chPlatform}" != uaClientHints.platform "${p.uaClientHints.platform}"`
    );
  }
  if (p.platform === "Win32" && chPlatform !== "Windows") {
    add("platform", `platform Win32 mais secChUaPlatform "${chPlatform}"`);
  }

  const uaMajor = p.userAgent.match(/Chrome\/(\d+)/)?.[1];
  if (uaMajor) {
    const fvMajor = p.uaClientHints.fullVersion.split(".")[0];
    if (fvMajor !== uaMajor) {
      add(
        "uaClientHints.fullVersion",
        `UA Chrome ${uaMajor} != fullVersion major ${fvMajor}`
      );
    }
    const brandMatch = p.uaClientHints.brands.some((b) => b.version === uaMajor);
    if (!brandMatch) {
      add(
        "uaClientHints.brands",
        `aucune brand ne porte la version majeure ${uaMajor}`
      );
    }
    if (!p.secChUa.includes(`v="${uaMajor}"`)) {
      add("secChUa", `secChUa ne mentionne pas v="${uaMajor}"`);
    }
  }

  const s = p.screen;
  if (s.availWidth > s.width) add("screen.availWidth", "availWidth > width");
  if (s.availHeight > s.height) add("screen.availHeight", "availHeight > height");
  if (s.colorDepth !== s.pixelDepth) {
    add("screen.pixelDepth", `colorDepth ${s.colorDepth} != pixelDepth ${s.pixelDepth}`);
  }
  if (s.devicePixelRatio <= 0) add("screen.devicePixelRatio", "dpr <= 0");

  if (!p.timezone) add("timezone", "timezone manquant");
  if (!Number.isFinite(p.timezoneOffset)) {
    add("timezoneOffset", "timezoneOffset non numérique");
  }

  if (!p.webgl?.vendor || !p.webgl?.renderer) {
    add("webgl", "vendor/renderer manquant");
  }

  if (!p.fonts?.length) add("fonts", "liste de polices vide");
  else if (new Set(p.fonts).size !== p.fonts.length) {
    add("fonts", "doublons dans la liste de polices");
  }

  return issues;
}

export function validateAllProfiles(
  profiles: Record<string, Profile>
): ProfileIssue[] {
  const all: ProfileIssue[] = [];
  const ids = new Set<string>();
  for (const [key, p] of Object.entries(profiles)) {
    if (key !== p.id) {
      all.push({ profileId: p.id, field: "id", message: `clé "${key}" != id "${p.id}"` });
    }
    if (ids.has(p.id)) {
      all.push({ profileId: p.id, field: "id", message: `id dupliqué "${p.id}"` });
    }
    ids.add(p.id);
    all.push(...validateProfile(p));
  }
  return all;
}
