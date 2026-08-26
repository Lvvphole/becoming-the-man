import type { SiteSettingsRepository } from "../repositories/site-settings";

type SupabaseSettingRow = {
  value_text?: unknown;
};

export class SupabaseSiteSettingsRepository implements SiteSettingsRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly anonKey: string,
  ) {}

  async getPublicSetting(key: string): Promise<string | null> {
    const endpoint = new URL("/rest/v1/site_settings", this.baseUrl);
    endpoint.searchParams.set("select", "value_text");
    endpoint.searchParams.set("key", `eq.${key}`);
    endpoint.searchParams.set("is_public", "eq.true");
    endpoint.searchParams.set("limit", "1");

    const response = await fetch(endpoint, {
      headers: {
        apikey: this.anonKey,
        Authorization: `Bearer ${this.anonKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as SupabaseSettingRow[];
    const value = rows[0]?.value_text;

    return typeof value === "string" ? value : null;
  }
}
