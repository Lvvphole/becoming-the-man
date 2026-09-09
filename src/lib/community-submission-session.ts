export interface CommunitySubmissionPayload {
  email: string;
  firstName?: string;
  marketingConsent: boolean;
}

interface CommunitySubmissionSessionOptions {
  createId: () => string;
  resetChallenge: () => void;
}

export interface CommunitySubmissionSession {
  requestIdFor(payload: CommunitySubmissionPayload): string;
  finish(outcome: "success" | "retryable"): void;
}

function payloadKey(payload: CommunitySubmissionPayload): string {
  return JSON.stringify([
    payload.email.trim().toLowerCase(),
    payload.firstName?.trim() ?? "",
    payload.marketingConsent,
  ]);
}

export function createCommunitySubmissionSession(
  options: CommunitySubmissionSessionOptions,
): CommunitySubmissionSession {
  let current: { key: string; id: string } | null = null;

  return {
    requestIdFor(payload) {
      const key = payloadKey(payload);
      if (!current || current.key !== key) {
        current = { key, id: options.createId() };
      }
      return current.id;
    },
    finish(outcome) {
      if (outcome === "success") {
        current = null;
        return;
      }
      options.resetChallenge();
    },
  };
}
