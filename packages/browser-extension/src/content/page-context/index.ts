import type { Profile } from "../../shared/profiles";
import { applyNavigatorGuard } from "./guards/navigator.guard";
import { applyScreenGuard } from "./guards/screen.guard";
import { applyTimezoneGuard } from "./guards/timezone.guard";
import { applyCanvasGuard } from "./guards/canvas.guard";
import { applyWebglGuard } from "./guards/webgl.guard";
import { applyAudioGuard } from "./guards/audio.guard";
import { applyFontsGuard } from "./guards/fonts.guard";
import { applyWebrtcGuard } from "./guards/webrtc.guard";
import { applyPluginsGuard } from "./guards/plugins.guard";
import { applyStorageGuard } from "./guards/storage.guard";

export interface GuardConfig {
  profile: Profile;
  modes: Record<string, string>;
  enabled: boolean;
}


export function bootstrap(config: GuardConfig): void {
  if (!config.enabled) return;

  const m = config.modes;

  applyNavigatorGuard(config.profile, m.navigator ?? "uniform");
  applyScreenGuard(config.profile, m.screen ?? "uniform");
  applyTimezoneGuard(config.profile, m.timezone ?? "uniform");
  applyPluginsGuard(m.plugins ?? "uniform");
  applyFontsGuard(config.profile, m.fonts ?? "uniform");

  applyCanvasGuard(m.canvas ?? "uniform");
  applyWebglGuard(config.profile, m.webgl ?? "uniform");
  applyAudioGuard(m.audio ?? "uniform");

  applyWebrtcGuard(m.webrtc ?? "relay"); 
  applyStorageGuard(m.storage ?? "off"); 
}

declare global {
  interface Window {
    __GK_CONFIG__?: string;
  }
}

(function init() {
  try {
    const raw = window.__GK_CONFIG__;
    if (!raw) return;
    
    delete window.__GK_CONFIG__;

    const config = JSON.parse(raw) as GuardConfig;
    bootstrap(config);
  } catch (err) {
  }
})();
