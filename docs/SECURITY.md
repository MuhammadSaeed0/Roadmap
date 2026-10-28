# Security review: accounts, approval and administration

This covers the account workflow added for public hosting: email verification, administrator approval, roles,
password reset and the production configuration. Each item says what protects it and which test covers it.

## Roles and account states

| Role | Can |
|---|---|
| **Main administrator (owner)** | everything an administrator can, plus grant and revoke administrator rights and send a test email. Can't be suspended, rejected or demoted by anyone. Exactly one (unique filtered index on `IsOwner`). |
| **Administrator** | view accounts and statistics, approve, reject, suspend, reactivate, resend verification. Can't act on themselves, on the owner or on other administrators, and can't grant roles. |
| **User** | the learning app, once approved. |

Account states: `PendingEmailVerification` → `PendingApproval` → `Approved`, or `Rejected` / `Suspended`.
Accounts that existed before this feature were migrated as `Approved` with a confirmed email.

## Findings and protections

| Area | Protection | Tests |
|---|---|---|
| **Access control** | Every endpoint requires an approved account by default (fallback policy). The status and roles are read from the database on **every request**, so approving, suspending or demoting takes effect immediately, not when the cookie is renewed. Only `me`, sign-out, verify, resend and change-password accept unapproved accounts. Angular guards only decide navigation. | `AccountApprovalTests`, `AdminTests.Admin_area_requires_an_administrator` |
| **Privilege escalation** | Admin rights only come from the `Admin` role in the database, granted by the owner. Role and owner checks happen in `AdminService` on the server; there is no endpoint that sets `IsOwner`. | `Administrators_cannot_act_on_themselves_the_owner_or_other_admins`, `Owner_promotes_and_revokes_administrators` |
| **Owner takeover by pre-registration** | Registering (or verifying) the owner's address grants nothing, because whoever registered chose the password and may hold a session. Ownership needs the deployment secret `Admin:OwnerPassword` or a password reset through the owner's inbox; the reset rotates the security stamp, which ends the other sessions at once. | `Registering_or_verifying_the_owner_address_grants_nothing_and_a_reset_takes_it_over`, `OwnerInitializationTests` |
| **Revoked sessions** | Besides Identity's periodic re-validation, each request compares the cookie's security stamp with the database, so a password reset or change signs other devices out immediately. | `A_password_reset_ends_other_sessions_immediately` |
| **IDOR** | User data has database-level query filters (`UserId == current user`); admin endpoints are role-checked; ids in URLs don't bypass either. | `IsolationTests` |
| **SQL injection** | All queries go through EF Core with parameters; the only raw SQL is a constant in a migration. | — |
| **XSS** | Angular escapes every binding (no `innerHTML` with user data). Email templates HTML-encode every value. A strict Content-Security-Policy allows only this site's scripts (no inline script; the theme boot script is a file). | `HostingTests.Responses_carry_security_headers` |
| **CSRF** | The auth cookie is `HttpOnly`, `SameSite=Strict`, and `Secure` in production. In addition, state-changing requests with a foreign `Origin` header are refused (`bad_origin`). Production is same-origin, so CORS is off there. | `HostingTests.State_changing_requests_from_another_site_are_refused` |
| **Clickjacking** | `X-Frame-Options: DENY` and `frame-ancestors 'none'`. | `HostingTests` |
| **Tokens** | 32 random bytes, SHA-256 hash stored, single use (atomic update), expiry (24 h / 1 h), purpose-bound, old tokens retired on reissue, never logged. | `AccountApprovalTests`, `AuthTests.Forgot_password_…` |
| **Verification and approval bypass** | Approval requires a confirmed email; status transitions are validated server-side (`invalid_status`); blocked users get 403 with a clear code on every endpoint. | `Approval_needs_a_confirmed_email`, `Unverified_and_unapproved_accounts_are_blocked_with_a_clear_code` |
| **Brute force** | Per-address rate limit on all account endpoints, lockout after 5 wrong passwords, resend throttled per account. Wrong passwords for blocked accounts get the generic error, so the status isn't revealed without the password. | `AuthRateLimitTests`, `Account_locks_after_repeated_wrong_passwords`, `Resend_is_rate_limited_and_replaces_the_old_link` |
| **Account enumeration** | Sign-in and forgot-password answer the same way whether or not the address exists. (Sign-up still says "email taken", a deliberate usability trade-off.) | `AuthTests` |
| **Open redirects** | `returnUrl` is accepted only as a path inside the app. | `auth-ui.spec.ts` (`safeReturnUrl`) |
| **Secrets** | No secrets in the repository. Production values come from environment variables written into the published `web.config` only; the app refuses to start with development values. The configuration check never prints values. | `ProductionSettingsTests` |
| **Audit** | Approve, reject, suspend, reactivate, resend, grant/revoke admin, owner assignment and test emails are logged with actor, target, time and note, in the same transaction as the change. No passwords or tokens. | `Audit_log_never_contains_tokens_or_passwords` |
| **Data protection keys** | Stored in the database so cookies survive restarts and redeploys. The keys aren't encrypted at rest (no certificate on the free host): anyone with database access could forge cookies, so protect the connection string like the database itself. | — |

## Known limitations

- The free MonsterASP.NET plan's HTTPS support must be confirmed; the production configuration assumes HTTPS.
- Rate limits are in memory per process; they reset when the site restarts (fine for one small site).
- Email delivery depends on Brevo; a failed send is logged and the user can resend, but nothing retries automatically.
