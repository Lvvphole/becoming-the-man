export type PublicPageContext = {
  canonicalUrl: string | null;
  robots: "index,follow" | "noindex,nofollow";
};

export function getPublicPageContext(pathname: string): PublicPageContext {
  const canonicalOrigin = process.env.CANONICAL_ORIGIN;
  const isProduction = process.env.VERCEL_ENV === "production";

  let canonicalUrl: string | null = null;

  if (canonicalOrigin) {
    try {
      canonicalUrl = new URL(pathname, canonicalOrigin).toString();
    } catch {
      canonicalUrl = null;
    }
  }

  return {
    canonicalUrl,
    robots: isProduction ? "index,follow" : "noindex,nofollow",
  };
}
