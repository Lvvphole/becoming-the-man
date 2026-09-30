export function meta() {
  return [
    { title: "Contact | Becoming the Man She Can Trust" },
    {
      name: "description",
      content: "Reader, media, speaking, or business inquiries for Becoming the Man She Can Trust.",
    },
  ];
}

export function ContactPage() {
  return (
    <div className="site-page urban-home contact-page">
      <header className="site-header urban-header">
        <a
          className="brand-mark brand-lockup"
          href="/"
          aria-label="Becoming the Man She Can Trust home"
        >
          <span>BECOMING</span>
          <span>THE MAN SHE CAN TRUST</span>
          <small>LOVE | PURPOSE | FLOURISH</small>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="/">HOME</a>
          <a href="/book">BOOK</a>
          <a href="/#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <a href="/#community">NEWSLETTER</a>
          <a href="/contact" aria-current="page">CONTACT</a>
        </nav>

        <a className="header-purchase-link" href="/#purchase">
          Get Your Copy <span aria-hidden="true">→</span>
        </a>
      </header>

      <main className="contact-main">
        <section className="contact-intro" aria-labelledby="contact-title">
          <p className="contact-eyebrow">LOVE | PURPOSE | FLOURISH</p>
          <h1 id="contact-title">CONTACT</h1>
          <div className="contact-rule" aria-hidden="true" />
          <p>Reader, media, speaking, or business inquiries.</p>
        </section>

        <section className="contact-form-section" aria-label="Contact inquiry">
          <div className="contact-form-card">
            <div className="contact-form-heading">
              <p className="contact-kicker">START A CONVERSATION</p>
              <h2>Send an inquiry</h2>
              <p>Choose the inquiry type and provide the details needed to understand your message.</p>
            </div>

            <form
              className="contact-form"
              method="post"
              aria-describedby="contact-availability contact-privacy"
            >
              <label htmlFor="contact-inquiry-type">Inquiry type</label>
              <select
                id="contact-inquiry-type"
                name="inquiryType"
                defaultValue=""
                required
              >
                <option value="" disabled>Select an inquiry type</option>
                <option value="reader">Reader</option>
                <option value="media">Media</option>
                <option value="speaking">Speaking</option>
                <option value="business">Business</option>
              </select>

              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />

              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />

              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={8}
                required
              />

              <p className="contact-privacy" id="contact-privacy">
                Read our <a href="/privacy">Privacy Policy</a> before submitting an inquiry.
              </p>

              <button
                className="contact-submit"
                type="submit"
                disabled
                aria-describedby="contact-availability"
              >
                Send inquiry
              </button>

              <p
                className="contact-availability"
                id="contact-availability"
                role="status"
                aria-live="polite"
              >
                Online submission is temporarily unavailable.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer urban-footer">
        <div className="footer-brand">
          <strong>BECOMING<br />THE MAN SHE CAN TRUST</strong>
          <span>LOVE | PURPOSE | FLOURISH</span>
          <small>© 2026 Emory Harris. All rights reserved.</small>
        </div>

        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/book">Book</a>
          <a href="/#non-negotiables">The 24 Non-Negotiables</a>
          <a href="/#community">Newsletter</a>
          <a href="/contact" aria-current="page">Contact</a>
        </nav>

        <nav aria-label="Legal">
          <a href="/disclaimer">Disclaimer</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <span aria-disabled="true">Accessibility</span>
        </nav>
      </footer>
    </div>
  );
}

export default ContactPage;
