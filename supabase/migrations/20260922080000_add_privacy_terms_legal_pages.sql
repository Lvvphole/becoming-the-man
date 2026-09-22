insert into public.legal_pages (slug, title, body_jsonb, is_published)
values
(
  'privacy',
  'Privacy Policy',
  jsonb_build_array(
    'Becoming the Man She Can Trust is operated by Emory Harris. This Privacy Policy explains how this website handles personal information when you join the mailing list or use related site features.',
    'Information we collect. When you join the community, we collect your first name, email address, marketing-consent choice, and request and consent metadata needed to record and process the signup. Our hosting and analytics services may also process limited technical and usage information needed to operate, secure, and measure the website.',
    'How we use information. We use signup information to manage the owned audience, send book updates, newsletters, announcements, or other communications you requested, document consent, prevent duplicate processing, maintain delivery state, and operate and improve the website.',
    'Service providers. Supabase provides backend data storage for subscriber, consent, request, and delivery records. Resend receives the name and email information needed to manage the email audience and deliver messages. Vercel provides website hosting and site analytics. When configured, PostHog receives governed analytics events used to understand website journeys. We do not intentionally send the email address entered in the signup form as an analytics event property.',
    'Marketing choices. You may unsubscribe from marketing communications at any time using the unsubscribe method provided in those messages. An unsubscribe request does not require you to stop using the public website.',
    'Retention. Subscriber, consent, delivery, and suppression records are retained for as long as reasonably needed to manage the mailing relationship, document consent, honor unsubscribe or suppression requests, maintain security and reliability, resolve disputes, or satisfy applicable legal obligations. Retention may therefore differ by record type.',
    'Your privacy rights. Depending on where you live and the law that applies, you may have rights to request access to, correction of, or deletion of personal information, or to object to or restrict certain processing. Requests may be subject to identity verification and lawful exceptions. You may make a request by replying to a communication from us or through any current contact channel published by the site operator.',
    'Data protection. We use service providers and access controls intended to limit personal information to the purposes described here. No method of storage or transmission can be guaranteed to be completely secure.',
    'Changes to this policy. We may update this Privacy Policy as the website changes. Material changes will be reflected in the published policy so that the current practices remain disclosed.'
  ),
  true
),
(
  'terms',
  'Terms',
  jsonb_build_array(
    'These Terms govern use of the Becoming the Man She Can Trust website and its public content. By accessing or using the website, you agree to use it lawfully and consistently with these Terms.',
    'Educational purpose. The website, book-related material, and Love | Purpose | Flourish framework are provided for educational and informational purposes. They are not individualized medical, mental-health, legal, therapeutic, or other professional advice. The separate Disclaimer forms part of these Terms and explains the applicable safety, scope, and outcome boundaries.',
    'Intellectual property. Unless otherwise stated, the website content, branding, text, graphics, framework materials, and other original materials are owned by Emory Harris or used with permission. You may access them for personal, lawful use. You may not copy, republish, sell, misrepresent, or exploit protected content in a way that violates applicable intellectual-property rights.',
    'Acceptable use. You may not use the website to interfere with its operation, bypass security controls, submit unlawful or abusive material, impersonate another person, attempt unauthorized access, or use automated methods in a way that damages or materially burdens the service.',
    'Email communications. Joining the community is voluntary and is governed by the consent presented at signup and the Privacy Policy. Marketing communications may be unsubscribed from using the method provided in those messages.',
    'External services and retailer links. The website may link to third-party retailers or other services. Those services control their own availability, transactions, terms, privacy practices, pricing, fulfillment, and content. A link does not make this website responsible for a third party’s acts or omissions.',
    'No guaranteed outcomes. The website does not guarantee relationship, personal, commercial, availability, purchase, or other outcomes. You remain responsible for your own decisions, conduct, safety, and use of the information provided.',
    'Limitation and non-waivable rights. To the fullest extent permitted by applicable law, the site operator is not liable for indirect, incidental, special, consequential, or punitive losses arising from use of the website or reliance on its content. Nothing in these Terms excludes rights or responsibilities that applicable law does not permit to be excluded.',
    'Changes. These Terms may be updated as the website and its services change. Continued use after updated Terms are published is subject to the version then in effect.'
  ),
  true
)
on conflict (slug) do update
set title = excluded.title,
    body_jsonb = excluded.body_jsonb,
    is_published = excluded.is_published,
    updated_at = now();
