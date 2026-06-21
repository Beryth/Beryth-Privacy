import type { Profile } from "../../../shared/profiles";
import { patchProperty } from "../utils/stealth";

export function applyScreenGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const { width, height, colorDepth } = profile.screen;

  patchProperty(screen, "width", () => width);
  patchProperty(screen, "height", () => height);
  patchProperty(screen, "availWidth", () => width);
  patchProperty(screen, "availHeight", () => height - 40);
  patchProperty(screen, "colorDepth", () => colorDepth);
  patchProperty(screen, "pixelDepth", () => colorDepth);
  patchProperty(screen, "availLeft", () => 0);
  patchProperty(screen, "availTop", () => 0);

  patchProperty(window, "devicePixelRatio", () => 1);

  patchProperty(window, "outerWidth", () => width);
  patchProperty(window, "outerHeight", () => height - 40);
}
