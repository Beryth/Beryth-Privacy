import type { Profile } from "../../../shared/profiles";
import { patchProperty } from "../utils/stealth";

export function applyScreenGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const { width, height, colorDepth } = profile.screen;
  const devicePixelRatio = profile.screen.devicePixelRatio ?? 1;

  const taskbarOffset = 40;
  const availableHeight = height - taskbarOffset;

  patchProperty(screen, "width", () => width);
  patchProperty(screen, "height", () => height);
  patchProperty(screen, "availWidth", () => width);
  patchProperty(screen, "availHeight", () => availableHeight);
  patchProperty(screen, "colorDepth", () => colorDepth);
  patchProperty(screen, "pixelDepth", () => colorDepth);
  patchProperty(screen, "availLeft", () => 0);
  patchProperty(screen, "availTop", () => 0);

  patchProperty(window, "devicePixelRatio", () => devicePixelRatio);
  patchProperty(window, "outerWidth", () => width);
  patchProperty(window, "outerHeight", () => availableHeight);
}
