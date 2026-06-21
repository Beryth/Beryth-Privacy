export class StoragePolicy {
  private tabOrigins = new Map<number, string>();

  trackTab(tabId: number, origin: string): void {
    this.tabOrigins.set(tabId, origin);
  }

  async onTabClosed(tabId: number): Promise<void> {
    const origin = this.tabOrigins.get(tabId);
    if (!origin) return;
    this.tabOrigins.delete(tabId);

    if ([...this.tabOrigins.values()].includes(origin)) return;

    try {
      await chrome.browsingData.remove(
        { origins: [origin] },
        {
          cacheStorage: true,
          cookies: true,
          indexedDB: true,
          localStorage: true,
          serviceWorkers: true,
        }
      );
    } catch {
    }
  }
}
