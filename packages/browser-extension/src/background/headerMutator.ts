import type { RulesManager } from "./rulesManager";
import { activeProfile } from "./configResolver";

const dnr = chrome.declarativeNetRequest;

export async function applyHeaderRules(_rules: RulesManager): Promise<void> {
  const p = activeProfile();

  const headerRules: chrome.declarativeNetRequest.Rule[] = [
    {
      id: 1001,
      priority: 1,
      action: {
        type: dnr.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          { header: "user-agent", operation: dnr.HeaderOperation.SET, value: p.userAgent },
          {
            header: "accept-language",
            operation: dnr.HeaderOperation.SET,
            value: p.acceptLanguage,
          },
          { header: "sec-ch-ua", operation: dnr.HeaderOperation.SET, value: p.secChUa },
          { header: "sec-ch-ua-platform", operation: dnr.HeaderOperation.SET, value: p.secChUaPlatform },
          { header: "sec-ch-ua-mobile", operation: dnr.HeaderOperation.SET, value: "?0" },
          { header: "sec-ch-ua-full-version-list", operation: dnr.HeaderOperation.REMOVE },
          { header: "sec-ch-ua-arch", operation: dnr.HeaderOperation.REMOVE },
          { header: "sec-ch-ua-model", operation: dnr.HeaderOperation.REMOVE },
          { header: "sec-ch-ua-bitness", operation: dnr.HeaderOperation.REMOVE },
          { header: "dnt", operation: dnr.HeaderOperation.REMOVE },
        ],
      },
      condition: {
        urlFilter: "*",
        resourceTypes: [
          dnr.ResourceType.MAIN_FRAME,
          dnr.ResourceType.SUB_FRAME,
          dnr.ResourceType.XMLHTTPREQUEST,
          dnr.ResourceType.SCRIPT,
          dnr.ResourceType.IMAGE,
          dnr.ResourceType.STYLESHEET,
          dnr.ResourceType.FONT,
          dnr.ResourceType.MEDIA,
          dnr.ResourceType.WEBSOCKET,
          dnr.ResourceType.OTHER,
        ],
      },
    },
  ];

  await dnr.updateDynamicRules({
    removeRuleIds: headerRules.map((r) => r.id),
    addRules: headerRules,
  });
}
