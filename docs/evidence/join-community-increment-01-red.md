# Increment 01 RED intent

The first production mutation is intentionally withheld.

RED oracle: `tests/server/community-consent.test.ts` imports the not-yet-present `server/domain/community-subscription` module and requires missing marketing consent to produce an error with zero repository and provider calls.

Expected baseline result: exact-head verification fails because the required domain module does not yet exist.

No production behavior is authorized until this RED condition is observed by CI.
