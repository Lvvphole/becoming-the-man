import { describe, expect, it } from "vitest";
import {
  COMMUNITY_ERROR_CODE,
  shouldRotateSubscribeRequestId,
} from "../../contracts/community";

describe("subscribe request-id rotation after an error", () => {
  it("keeps the same request id while the original claim is still in progress", () => {
    expect(shouldRotateSubscribeRequestId(COMMUNITY_ERROR_CODE.requestInProgress)).toBe(false);
  });

  it.each([
    COMMUNITY_ERROR_CODE.consentRequired,
    COMMUNITY_ERROR_CODE.emailInvalid,
    COMMUNITY_ERROR_CODE.firstNameRequired,
    COMMUNITY_ERROR_CODE.fieldTooLong,
    COMMUNITY_ERROR_CODE.requestConflict,
    COMMUNITY_ERROR_CODE.storageUnavailable,
    COMMUNITY_ERROR_CODE.providerUnavailable,
    COMMUNITY_ERROR_CODE.rejected,
  ])("rotates after %s so an abandoned claim is not retried", (code) => {
    expect(shouldRotateSubscribeRequestId(code)).toBe(true);
  });
});
