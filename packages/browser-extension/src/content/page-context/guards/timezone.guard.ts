import type { Profile } from "../../../shared/profiles";
import { patchProperty } from "../utils/stealth";

export function applyTimezoneGuard(profile: Profile, mode: string): void {
  if (mode === "off") return;

  const tz = profile.timezone;
  const offset = profile.timezoneOffset; 

  const OrigDate = Date;
  const proto = OrigDate.prototype;
  const origGetOffset = proto.getTimezoneOffset;
  proto.getTimezoneOffset = function () {
    return offset;
  };
  void origGetOffset;

  const OrigDTF = Intl.DateTimeFormat;
  const patchedDTF = function (
    this: unknown,
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions
  ) {
    const opts = { ...(options || {}) };
    if (!opts.timeZone) opts.timeZone = tz;
    return new OrigDTF(locales, opts);
  } as unknown as typeof Intl.DateTimeFormat;

  patchedDTF.prototype = OrigDTF.prototype;
  patchedDTF.supportedLocalesOf = OrigDTF.supportedLocalesOf;
  Intl.DateTimeFormat = patchedDTF;

  const origResolved = OrigDTF.prototype.resolvedOptions;
  OrigDTF.prototype.resolvedOptions = function () {
    const res = origResolved.call(this);
    res.timeZone = tz;
    return res;
  };

  void patchProperty;
}
