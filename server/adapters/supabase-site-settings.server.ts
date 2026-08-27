import {
  getBookPurchaseDestination,
  type BookPurchaseDestination,
  type SiteSettingReadResult,
  type SiteSettingsRepository,
} from "../domain/book-purchase";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type SettingsFetch = (input: URL, init: RequestInit) => Promise<Response>;

const SETTINGS_READ_TIMEOUT_MS = 2_000;

interface SupabaseSiteSettingsOptions {
  env?: ServerEnvironment;
  fetchImpl?: SettingsFetch;
}

function getSettingValue(row: unknown): { valid: true; value: unknown } | { valid: false } {
  if (typeof row !== "object" || row === null || !("setting_value" in row)) {
    return { valid: false };
  }

  return { valid: true, value: Reflect.get(row, "setting_value") };
}

export function createSupabaseSiteSettingsRepository(
  options: SupabaseSiteSettingsOptions = {},
): SiteSettingsRepository {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async read(settingKey: string): Promise<SiteSettingReadResult> {
      const supabaseUrl = env.SUPABASE_URL;
      const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !publishableKey) {
        return { ok: false, code: "configuration_unavailable" };
      }

      let endpoint: URL;
      try {
        endpoint = new URL("/rest/v1/site_settings", supabaseUrl);
      } catch {
        return { ok: false, code: "configuration_unavailable" };
      }

      endpoint.searchParams.set("setting_key", `eq.${settingKey}`);
      endpoint.searchParams.set("select", "setting_value");
      endpoint.searchParams.set("limit", "1");

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), SETTINGS_READ_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          headers: {
            apikey: publishableKey,
            authorization: `Bearer ${publishableKey}`,
          },
          signal: abortController.signal,
        });
      } catch {
        return { ok: false, code: "provider_unavailable" };
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        return { ok: false, code: "provider_unavailable" };
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return { ok: false, code: "invalid_response" };
      }

      if (!Array.isArray(payload)) {
        return { ok: false, code: "invalid_response" };
      }

      if (payload.length === 0) {
        return { ok: true, value: null };
      }

      const setting = getSettingValue(payload[0]);
      if (!setting.valid) {
        return { ok: false, code: "invalid_response" };
      }

      return { ok: true, value: setting.value };
    },
  };
}

export async function loadBookPurchaseDestination(): Promise<BookPurchaseDestination> {
  return getBookPurchaseDestination(createSupabaseSiteSettingsRepository());
}
