import { afterEach, describe, expect, it } from "vitest";

import { getPublicPageContext } from "../../server/page-context.server";

const originalCanonicalOrigin = process.env.CANONICAL_ORIGIN;
const originalVercelEnv = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalCanonicalOrigin === undefined) {
    delete process.env.CANONICAL_ORIGIN;
  } else {
    process.env.CANONICAL_ORIGIN = originalCanonicalOrigin;
  }

  if (originalVercelEnv === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = originalVercelEnv;
  }
});

describe("getPublicPageContext", () => {
  it("keeps previews non-indexable while still emitting configured canonicals", () => {
    process.env.CANONICAL_ORIGIN = "https://example.test";
    process.env.VERCEL_ENV = "preview";

    expect(getPublicPageContext("/book")).toEqual({
      canonicalUrl: "https://example.test/book",
      robots: "noindex,nofollow",
    });
  });

  it("does not allow production indexing without a valid canonical origin", () => {
    process.env.CANONICAL_ORIGIN = "not-a-url";
    process.env.VERCEL_ENV = "production";

    expect(getPublicPageContext("/")).toEqual({
      canonicalUrl: null,
      robots: "noindex,nofollow",
    });
  });

  it("allows indexing only with production plus a valid canonical", () => {
    process.env.CANONICAL_ORIGIN = "https://example.test";
    process.env.VERCEL_ENV = "production";

    expect(getPublicPageContext("/")).toEqual({
      canonicalUrl: "https://example.test/",
      robots: "index,follow",
    });
  });
});
