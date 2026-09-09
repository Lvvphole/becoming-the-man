import { useEffect, useState, type FormEvent } from "react";

interface CommunitySignupProps {
  turnstileSiteKey?: string;
}

export function CommunitySignup({ turnstileSiteKey }: CommunitySignupProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "pending" | "error">("idle");

  useEffect(() => {
    if (!turnstileSiteKey || document.querySelector('script[data-community-turnstile="true"]')) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.communityTurnstile = "true";
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstileSiteKey || status === "submitting") return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const firstName = String(form.get("first_name") ?? "").trim();
    const marketingConsent = form.get("marketing_consent") === "on";
    const turnstileToken = String(form.get("cf-turnstile-response") ?? "");

    if (!marketingConsent || !turnstileToken) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          request_id: crypto.randomUUID(),
          email,
          first_name: firstName || undefined,
          marketing_consent: true,
          turnstile_token: turnstileToken,
        }),
      });

      if (response.status === 200) setStatus("success");
      else if (response.status === 202) setStatus("pending");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const unavailable = !turnstileSiteKey;
  const message = unavailable
    ? "Community signup is temporarily unavailable."
    : status === "success"
      ? "You’re subscribed."
      : status === "pending"
        ? "Your signup was saved. Email delivery setup is still processing."
        : status === "error"
          ? "We couldn’t complete your signup. Please review the form and try again."
          : "You can unsubscribe from marketing emails at any time.";

  return (
    <form className="community-form" aria-describedby="community-status" onSubmit={submit}>
      <label className="sr-only" htmlFor="community-first-name">First name</label>
      <input id="community-first-name" name="first_name" type="text" autoComplete="given-name" placeholder="First name (optional)" maxLength={80} />
      <label className="sr-only" htmlFor="community-email">Email address</label>
      <input id="community-email" name="email" type="email" autoComplete="email" placeholder="Your email address" maxLength={254} required />
      <label className="community-consent">
        <input name="marketing_consent" type="checkbox" required />
        <span>I agree to receive marketing emails and future communications from Emory Harris.</span>
      </label>
      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} /> : null}
      <button type="submit" disabled={unavailable || status === "submitting" || status === "success"}>
        {status === "submitting" ? "Joining…" : status === "success" ? "Joined" : "Join the Community"}
      </button>
      <p className="community-note" id="community-status" aria-live="polite">{message}</p>
    </form>
  );
}
