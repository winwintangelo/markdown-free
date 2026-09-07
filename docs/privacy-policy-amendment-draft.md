# Privacy policy amendment — DRAFT (not published)

Build plan Phase −1 deliverable. This is the text the live `/privacy` page moves to when Phase 1.5 / Phase 2 ship. It is a draft for review; nothing here is live. Translate to zh-Hans and zh-Hant before publishing (JA/KO next).

## Why an amendment is needed

The current policy says:

- "We don't collect … file names or **metadata**" — read literally, this forbids even bucketed structural statistics (Phase 2 fingerprints). Reword to *file-system metadata* and disclose the bucketed stats explicitly.
- "Files are never stored on our servers" and "No accounts" — true for the anonymous converter, and must stay true for it; accounts and the library are opt-in and need their own section.
- "We do not share any data with third parties" — two processors act on our behalf (Umami Cloud for cookieless analytics; Resend for delivering feedback emails). Name them.
- Format-by-format accuracy: HTML, TXT, PNG, JPG (and EPUB after Phase 0a; DOCX after Phase 0b) never leave the browser; PDF is processed transiently on our server. Say exactly that, per format.

## Draft text (English)

### The short version

- **The converter needs no account.** Everything on this page about accounts applies only if you choose to sign in.
- **Your documents are yours.** Anonymous conversions are never stored. Signed-in users choose what to save, and saved documents are encrypted.
- **No tracking cookies** on the public site. Analytics is cookieless and aggregate.
- **HTTPS only.**

### What leaves your browser, by format

| Format | Where it renders | What leaves your browser |
|---|---|---|
| HTML, TXT, PNG, JPG, EPUB | In your browser | Nothing. Remote images inside your document may be fetched through our image proxy so they can be embedded; the proxy fetches the image URL and does not see your text. |
| DOCX | In your browser (from Phase 0b; until then on our server, transiently) | Nothing (from Phase 0b). |
| PDF | On our server, transiently | Your Markdown is sent to our server, converted in memory, returned, and discarded. It is never written to disk, logged, or analyzed. |

### What we collect, by tier

| | Anonymous | Signed in | Paid |
|---|---|---|---|
| Documents | Never stored | Only what you save to your library, encrypted at rest with a per-user key. We can technically decrypt it; we publish that we don't, and an optional passphrase lock is planned. | Same |
| Account data | None | Email, sign-in method, settings, templates | Same, plus billing status from our payment provider (we never see card numbers) |
| Usage events | Cookieless page and conversion counts | Product events (what features you use), tied to your account | Same |
| Document structure | None | **Bucketed** structure only: e.g. "1–3 tables", "has formulas", "size: medium", "script: CJK". Never text, exact counts, or file names. | Same |
| Problem reports | None | Only if you opt in, per report; you can attach the document, encrypted | Same |

### Service providers

We do not sell or share your data. These providers process limited data on our behalf:

- **Vercel** — hosts the site and runs PDF conversion (transient, in memory).
- **Umami Cloud** — cookieless analytics: page views, referrers, conversion counts, device class. No content, no file names, no personal information.
- **Resend** — delivers feedback-form messages, and the reply address you optionally give, to our inbox.
- Signed-in and paid tiers add: **Neon** (account database), **Cloudflare R2** (encrypted saved documents), **Stripe** (payments), **PostHog** (product analytics, proxied through our domain so no third-party script loads).

### Your controls

- Export everything we hold about you, and delete your account, each in one click from the account page.
- Feedback: use the feedback form; if you include an email we reply there.

### Mainland China users

We are not established in mainland China. Account data is stored outside the mainland. We keep what we hold minimal and describe it on this page.

### Changes

We date every change and note significant ones on the homepage.

## Before publishing

- Confirm the format table against what actually shipped (EPUB client-side = Phase 0a; DOCX = Phase 0b).
- Confirm the processor list against the Phase 2 stack actually chosen.
- Legal review is the owner's call; this draft is not legal advice.
