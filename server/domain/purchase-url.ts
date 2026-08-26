export type PurchaseDestination = {
  href: string;
  host: string;
};

export function parsePurchaseDestination(
  value: string | null | undefined,
): PurchaseDestination | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (!url.hostname || url.username || url.password) {
      return null;
    }

    return {
      href: url.toString(),
      host: url.hostname.toLowerCase(),
    };
  } catch {
    return null;
  }
}
