export type PublicPageContext = {
  canonicalUrl: string | null;
  robots: "index,follow" | "noindex,nofollow";
};

function resolveCanonicalUrl(pathname: string): string | null {
  const canonicalOrigin = process.env.CANONICAL_ORIGIN;

  if (!canonicalOrigin) {
    return null;
  }

  try {
    const origin = new URL(canonicalOrigin);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") {
      return null;
    }

    return new URL(pathname, origin).toString();
  } catch {
    return null;
  }
}

export function getPublicPageContext(pathname: string): PublicPageContext {
  const canonicalUrl = resolveCanonicalUrl(pathname);
  const canIndex = process.env.VERCEL_ENV === "production" && canonicalUrl !== null;

  return {
    canonicalUrl,
    robots: canIndex ? "index,follow" : "noindex,nofollow",
  };
}
