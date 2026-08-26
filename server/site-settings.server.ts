import { SupabaseSiteSettingsRepository } from "./adapters/supabase-site-settings";
import {
  BOOK_PURCHASE_URL_KEY,
  type SiteSettingsRepository,
} from "./repositories/site-settings";
import {
  parsePurchaseDestination,
  type PurchaseDestination,
} from "./domain/purchase-url";

function fixtureRepository(value: string): SiteSettingsRepository {
  return {
    async getPublicSetting(key: string) {
      return key === BOOK_PURCHASE_URL_KEY ? value : null;
    },
  };
}

function createRepository(): SiteSettingsRepository | null {
  const fixture = process.env.BOOK_PURCHASE_URL_FIXTURE;

  if (fixture && process.env.NODE_ENV !== "production") {
    return fixtureRepository(fixture);
  }

  const baseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return null;
  }

  return new SupabaseSiteSettingsRepository(baseUrl, anonKey);
}

export async function getBookPurchaseDestination(): Promise<PurchaseDestination | null> {
  const repository = createRepository();

  if (!repository) {
    return null;
  }

  try {
    const rawValue = await repository.getPublicSetting(BOOK_PURCHASE_URL_KEY);
    return parsePurchaseDestination(rawValue);
  } catch {
    return null;
  }
}
