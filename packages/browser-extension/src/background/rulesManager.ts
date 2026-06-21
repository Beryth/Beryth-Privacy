const RULES_TTL_MS = 1000 * 60 * 60 * 24;

export class RulesManager {
  private lastUpdate = 0;

  async bootstrap(): Promise<void> {
    await this.refreshIfStale();
  }

  async refreshIfStale(): Promise<void> {
    const { rulesMeta } = await chrome.storage.local.get("rulesMeta");
    this.lastUpdate = rulesMeta?.lastUpdate ?? 0;

    if (Date.now() - this.lastUpdate < RULES_TTL_MS) return;
    await this.update();
  }

  async update(): Promise<void> {
    try {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["easyprivacy", "tracker-radar", "cname-cloak"],
      });
      this.lastUpdate = Date.now();
      await chrome.storage.local.set({
        rulesMeta: { lastUpdate: this.lastUpdate },
      });
    } catch {
    }
  }
}
