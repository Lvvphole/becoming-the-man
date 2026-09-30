export interface ContactRateLimitInput {
  email: string;
  ip: string;
}

export type ContactRateLimitResult =
  | { status: "claimed" }
  | { status: "rate_limited" }
  | { status: "unavailable" };

export interface ContactRateLimiter {
  claim(input: ContactRateLimitInput): Promise<ContactRateLimitResult>;
}
