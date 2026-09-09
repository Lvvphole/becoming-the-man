import { describe, expect, it, vi } from "vitest";
import { createCommunitySubmissionSession } from "../../src/lib/community-submission-session";

const payload = {
  email: "reader@example.com",
  firstName: "Reader",
  marketingConsent: true,
} as const;

describe("community submission session", () => {
  it("keeps one request id for the same logical payload across retryable attempts", () => {
    const resetChallenge = vi.fn();
    const createId = vi.fn().mockReturnValueOnce("request-1").mockReturnValueOnce("request-2");
    const session = createCommunitySubmissionSession({ createId, resetChallenge });

    expect(session.requestIdFor(payload)).toBe("request-1");
    session.finish("retryable");
    expect(resetChallenge).toHaveBeenCalledTimes(1);
    expect(session.requestIdFor({ ...payload, email: " READER@example.com " })).toBe("request-1");
    expect(createId).toHaveBeenCalledTimes(1);
  });

  it("creates a new request id when the idempotency-significant payload changes", () => {
    const createId = vi.fn().mockReturnValueOnce("request-1").mockReturnValueOnce("request-2");
    const session = createCommunitySubmissionSession({ createId, resetChallenge: vi.fn() });

    expect(session.requestIdFor(payload)).toBe("request-1");
    expect(session.requestIdFor({ ...payload, firstName: "Different" })).toBe("request-2");
  });

  it("does not reset the consumed challenge after a terminal success", () => {
    const resetChallenge = vi.fn();
    const createId = vi.fn().mockReturnValueOnce("request-1").mockReturnValueOnce("request-2");
    const session = createCommunitySubmissionSession({ createId, resetChallenge });

    expect(session.requestIdFor(payload)).toBe("request-1");
    session.finish("success");
    expect(resetChallenge).not.toHaveBeenCalled();
    expect(session.requestIdFor(payload)).toBe("request-2");
  });
});
