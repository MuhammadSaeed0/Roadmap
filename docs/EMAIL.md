# Email

DevPath sends these emails, each in Arabic and English (HTML plus a plain-text version):
email verification, account approved, account rejected (with the optional note), account suspended (with the note),
account reactivated, administrator promotion, and password reset, plus a test message from the admin area.

## Provider choice

MonsterASP.NET's free plan has no mailboxes, so a transactional email service sends the messages.

| Service | Free tier (approximate; check the provider's current pricing) | Notes |
|---|---|---|
| **Brevo** (chosen) | about 300 emails/day, no expiry | HTTPS API, single-sender verification works without owning a domain, templates and logs in the dashboard |
| Resend | about 3,000/month, 100/day | needs your own verified domain to send to anyone but yourself |
| Mailjet | about 6,000/month, 200/day | similar API; sender verification required |
| SMTP from a Gmail account | small daily limits | needs an app password and SMTP ports; weaker deliverability for app mail |

Brevo was picked because it works with a free `*.runasp.net` site and no domain of your own (verify a single sender
address), has the highest daily allowance for this kind of app, and uses a plain HTTPS API, so no SMTP ports are
needed on the host. The code is behind `IAccountEmailSender`, so switching later means one new class.

## Set up Brevo

1. Create a free account at brevo.com.
2. **Senders, domains & dedicated IPs → Senders → Add a sender:** use an address you can read, then click the link
   Brevo emails you. If you own a domain, authenticate it instead (DKIM/DMARC) for better deliverability.
3. **SMTP & API → API keys → Generate a new API key.** Copy it once; Brevo won't show it again.
4. Put the values in `deploy/production.env` (or the GitHub secrets):

   ```text
   Email__Provider=Brevo
   Email__SenderEmail=the-verified-sender@example.com
   Email__SenderName=DevPath
   Email__Brevo__ApiKey=xkeysib-...
   ```

5. After deploying, sign in as the main administrator → **Administration → Administrators → Send a test email**.

The API key is a secret: it lives only in `production.env` (git-ignored), the published `web.config` and GitHub
secrets. It is sent only in the `api-key` header to `api.brevo.com` and never logged.

## Development

`Email:Provider` defaults to `Log`: every email is written to the API console (log level Warning), including its
link, so you can follow verification and reset links locally. Production refuses to start with `Log`.

To try Brevo locally, use user secrets instead of a file:

```bash
cd backend/DevPath.Api
dotnet user-secrets set "Email:Provider" "Brevo"
dotnet user-secrets set "Email:SenderEmail" "you@example.com"
dotnet user-secrets set "Email:Brevo:ApiKey" "xkeysib-..."
```

## How links and tokens work

- Verification and reset links point to `Frontend:BaseUrl` (`/verify-email?token=…`, `/reset-password?token=…`).
- Each token is 32 random bytes from the operating system's secure generator, sent only in the email. The database
  stores only its SHA-256 hash, so a database leak doesn't reveal working links.
- Tokens work **once**, expire (verification 24 hours, reset 1 hour), and asking for a new one retires the old one.
  Redemption is an atomic database update, so two simultaneous clicks can't both succeed.
- The link opens a page in the app; the token is sent to the API (with a POST) only when the person clicks
  **Confirm my email**, so mail scanners that open or render links don't use up the token.
- Request logs replace `token=…` in query strings with `[redacted]`.
- Resending a verification email is limited to once a minute per account, on top of the per-address rate limit on
  every account endpoint.
- If sending fails at sign-up, the account is still created; the status page offers "Send the confirmation email again".
