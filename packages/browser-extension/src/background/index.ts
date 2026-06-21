import { RulesManager } from "./rulesManager";
import { resolveConfigForOrigin } from "./configResolver";
import { applyHeaderRules } from "./headerMutator";
import { StoragePolicy } from "./storagePolicy";

const rules = new RulesManager();
const storagePolicy = new StoragePolicy();

chrome.runtime.onInstalled.addListener(async () => {
  await rules.bootstrap();
  await applyHeaderRules(rules);
});

chrome.runtime.onStartup.addListener(async () => {
  await rules.refreshIfStale();
  await applyHeaderRules(rules);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_CONFIG_FOR_ORIGIN") {
    resolveConfigForOrigin(msg.origin).then(sendResponse);
    return true; 
  }
  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  storagePolicy.onTabClosed(tabId);
});
