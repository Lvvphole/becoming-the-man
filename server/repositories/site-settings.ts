export const BOOK_PURCHASE_URL_KEY = "book_purchase_url";

export interface SiteSettingsRepository {
  getPublicSetting(key: string): Promise<string | null>;
}
