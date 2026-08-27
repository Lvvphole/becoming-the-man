export const BOOK_PURCHASE_SETTING_KEY = "book_purchase_url";

export type SiteSettingReadErrorCode =
  | "configuration_unavailable"
  | "provider_unavailable"
  | "invalid_response";

export type SiteSettingReadResult =
  | { ok: true; value: unknown | null }
  | { ok: false; code: SiteSettingReadErrorCode };

export interface SiteSettingsRepository {
  read(settingKey: string): Promise<SiteSettingReadResult>;
}

export type BookPurchaseUnavailableReason =
  | "missing"
  | "invalid"
  | SiteSettingReadErrorCode;

export type BookPurchaseDestination =
  | { status: "available"; url: string }
  | { status: "unavailable"; reason: BookPurchaseUnavailableReason };

export function parseBookPurchaseUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function getBookPurchaseDestination(
  repository: SiteSettingsRepository,
): Promise<BookPurchaseDestination> {
  const result = await repository.read(BOOK_PURCHASE_SETTING_KEY);

  if (!result.ok) {
    return { status: "unavailable", reason: result.code };
  }

  if (result.value === null) {
    return { status: "unavailable", reason: "missing" };
  }

  const url = parseBookPurchaseUrl(result.value);
  if (url === null) {
    return { status: "unavailable", reason: "invalid" };
  }

  return { status: "available", url };
}
