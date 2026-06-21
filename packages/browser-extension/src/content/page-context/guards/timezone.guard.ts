import type { Profile } from "../../../shared/profiles";
import { defineNative } from "../utils/stealth";

export function applyTimezoneGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const tz = profile.timezone;
  const offset = profile.timezoneOffset; 

  const proto = Date.prototype;
  const origGetOffset = proto.getTimezoneOffset;
  
  proto.getTimezoneOffset = defineNative(function (this: Date) {
    return offset;
  }, "getTimezoneOffset");

  const OrigDTF = Intl.DateTimeFormat;
  
  const patchedDTF = defineNative(function (
    this: unknown,
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions
  ) {
    const opts = { ...(options || {}) };
    if (!opts.timeZone) opts.timeZone = tz;
    return new OrigDTF(locales, opts);
  }, "DateTimeFormat") as unknown as typeof Intl.DateTimeFormat;

  patchedDTF.prototype = OrigDTF.prototype;
  patchedDTF.supportedLocalesOf = OrigDTF.supportedLocalesOf;
  Intl.DateTimeFormat = patchedDTF;

  const origResolved = OrigDTF.prototype.resolvedOptions;
  OrigDTF.prototype.resolvedOptions = defineNative(function (this: Intl.DateTimeFormat) {
    const res = origResolved.call(this);
    res.timeZone = tz; 
    return res;
  }, "resolvedOptions");
}
