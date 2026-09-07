export interface LegalPage {
  readonly slug: string;
  readonly title: string;
  readonly body: readonly string[];
}

export type LegalPageLoadResult =
  | { readonly status: "available"; readonly page: LegalPage }
  | {
      readonly status: "unavailable";
      readonly reason: "configuration" | "provider" | "invalid_response" | "missing";
    };

function readNonEmptyString(record: object, key: string): string | null {
  const value = Reflect.get(record, key);
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function parseLegalPageRow(row: unknown): LegalPage | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const slug = readNonEmptyString(row, "slug");
  const title = readNonEmptyString(row, "title");
  const bodyValue = Reflect.get(row, "body_jsonb");

  if (!slug || !title || !Array.isArray(bodyValue)) {
    return null;
  }

  if (
    bodyValue.length === 0 ||
    !bodyValue.every((block) => typeof block === "string" && block.trim().length > 0)
  ) {
    return null;
  }

  return { slug, title, body: bodyValue };
}
