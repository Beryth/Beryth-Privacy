import type { RulesManager } from "./rulesManager";
import { activeProfile } from "./configResolver";

export async function applyHeaderRules(_rules: RulesManager): Promise<void> {
  const p = activeProfile();

  const headerRules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1001,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          { header: "user-agent", operation: "set", value: p.userAgent },
          {
            header: "accept-language",
            operation: "set",
            value: p.acceptLanguage,
          },
          { header: "sec-ch-ua", operation: "set", value: p.secChUa },
          { header: "sec-ch-ua-platform", operation: "set", value: p.secChUaPlatform },
          { header: "sec-ch-ua-mobile", operation: "set", value: "?0" },
          { header: "sec-ch-ua-full-version-list", operation: "remove" },
          { header: "sec-ch-ua-arch", operation: "remove" },
          { header: "sec-ch-ua-model", operation: "remove" },
          { header: "sec-ch-ua-bitness", operation: "remove" },
          { header: "dnt", operation: "remove" },
        ],
      },
      condition: {
        urlFilter: "*",
        resourceTypes: [
          "main_frame",
          "sub_frame",
          "xmlhttprequest",
          "script",
          "image",
          "stylesheet",
          "font",
          "media",
          "websocket",
          "other",
        ],
      },
    },
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: headerRules.map((r) => r.id),
    addRules: headerRules,
  });
}
