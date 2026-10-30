# Deploying DevPath to MonsterASP.NET

DevPath runs as **one IIS site**: the ASP.NET Core API serves the built Angular app from `wwwroot` and answers `/api/*`.
Because the app and the API share one address, the auth cookie stays first-party (`SameSite=Strict`) and CORS isn't needed.

```text
https://your-site.runasp.net/            → Angular app (index.html, deep links like /admin fall back to it)
https://your-site.runasp.net/api/...     → ASP.NET Core API (.NET 10)
                                          → MonsterASP.NET SQL Server database
                                          → Brevo (transactional email over HTTPS)
```

> **Status:** the build, the configuration check and the published app were tested **locally** in Production mode
> (HTTPS, a fresh SQL Server database, the main administrator created from the secret, sign-in and the admin area in
> a browser). Publishing to the live MonsterASP.NET site and real email delivery have **not** been tested yet: they need
> your MonsterASP.NET Web Deploy credentials, the database connection string and a Brevo API key with a verified sender.

## Checklist

1. **The main administrator** is `muhammadssaeed0@gmail.com` (`Admin:OwnerEmail` in
   `backend/DevPath.Api/appsettings.json`). Whoever controls that inbox can take over the main administrator account
   (through "Forgot password"). To change it, override it with `Admin__OwnerEmail`.
2. Create the site and the database in the MonsterASP.NET control panel (see below).
3. Confirm the free `*.runasp.net` address opens over **https**. Production requires HTTPS: secure cookies, HSTS and
   https links in emails. If your plan doesn't serve HTTPS, the app can't keep anyone signed in.
4. Set up Brevo and verify the sender address ([EMAIL.md](EMAIL.md)).
5. Copy `deploy/production.env.example` to `deploy/production.env` and fill it in (it is git-ignored).
6. Run `./deploy/publish.ps1` (build and check), then `./deploy/publish.ps1 -Deploy`.
7. Sign in as the main administrator, open **Administration**, send a **test email**, and check that it arrives.
8. Register a second account with another address, confirm it from the email, and approve it in the admin area.
9. If you set `Admin__OwnerPassword`, change that password after the first sign-in (Settings → Change password) and
   remove the value from `production.env`.

## 1. MonsterASP.NET set-up

Free plan (at the time of writing): one website, 5 GB disk, 256 MB RAM, one MSSQL database (1 GB), a free
`*.runasp.net` subdomain. There are no email accounts on the free plan, which is why email goes through Brevo.

1. **Websites → Create website.** Note the site name (e.g. `site12345`) and its address (`https://site12345.runasp.net`).
2. **Databases → Create MSSQL database.** Copy the connection string the panel shows. Apps on MonsterASP.NET reach the
   database on the internal network; remote access from your computer is off by default, which is fine because the app
   applies its own migrations when it starts.
3. **Websites → your site → Deploy → WebDeploy:** enable Web Deploy and note the server, user name and password.

Framework: the publish script builds a **framework-dependent** app that runs on the server's .NET 10 runtime
(MonsterASP.NET provides .NET 10). It works whether the site's app pool is 32-bit (the free plan) or 64-bit.
`-SelfContained` bundles a 64-bit runtime instead (about 130 MB); use it only on a 64-bit host without .NET 10.

## 2. Settings and secrets

Nothing secret is committed. `appsettings.json` holds development defaults, `appsettings.Production.json` holds
production defaults with the secret values empty, and the real values come from **environment variables** that the
publish script writes into the **published copy** of `web.config` (IIS never serves `web.config`).

| Setting | Environment variable | Required |
|---|---|---|
| Public address (https) | `Frontend__BaseUrl` | yes |
| SQL Server connection string | `ConnectionStrings__DevPath` | yes |
| Email provider | `Email__Provider` = `Brevo` | yes |
| Verified sender address | `Email__SenderEmail` | yes |
| Brevo API key | `Email__Brevo__ApiKey` | yes |
| Main administrator's address | `Admin__OwnerEmail` | in appsettings.json already |
| First password for the main administrator | `Admin__OwnerPassword` | optional |

In Production the app **refuses to start** when a required value is missing or still has a development value
(LocalDB, the console-only `Log` email provider, a localhost or http address). The log line says which one.
Run the same check yourself with `DevPath.Api.exe --check-config` (the publish script does this for you).

### The main administrator

The owner is recognised only from trusted server configuration (`Admin:OwnerEmail`), never from what someone types in
the browser. Becoming the owner also requires control of the password, so registering that address isn't enough:

- **With `Admin__OwnerPassword`:** on first start, if no account uses the address, the app creates it (approved, email
  confirmed, administrator) with that password. Nothing happens if the account already exists.
- **Without it:** register with the owner's address, then use **Forgot password** and follow the emailed link. The
  reset proves you control the inbox; the account becomes the owner and any other session on it ends immediately.

The owner can't be suspended, rejected or demoted from the admin area (by anyone, including themselves), and
start-up re-applies the owner's administrator role if it was ever removed.

## 3. Publish

```powershell
# from the repository root
./deploy/publish.ps1             # tests, build, configuration check, migration script → deploy/out/
./deploy/publish.ps1 -Deploy     # the same, then Web Deploy to the site and a live smoke test
```

The script:

1. reads `deploy/production.env` and refuses placeholder values;
2. runs the backend and Angular tests and checks every Practice Lab exercise (`npm run verify:exercises`) (`-SkipTests` to skip);
3. builds the in-browser code runners (`npm run build:runners`: the C# compiler on .NET WebAssembly and the Angular preview packages, which need the .NET 10 SDK and Node 24), builds the Angular app, writes Brotli copies of its files (`npm run precompress`) and publishes the API with it in `wwwroot` (`deploy/out/publish`);
4. runs `--check-config` against the published app with your settings;
5. writes the settings into the published `web.config`;
6. writes `deploy/out/migrations.sql`, an idempotent script of every migration (for running by hand if you prefer);
7. with `-Deploy`: syncs the folder with `msdeploy` (app offline during the copy), then checks `/api/health` and that
   `/sign-in` returns the app.

`deploy/out/publish/web.config` contains your secrets after step 5: don't share or commit `deploy/out` (it is
git-ignored). Web Deploy needs **Web Deploy 4.0** (`msdeploy.exe`) on the machine that deploys.

### Database migrations

The app applies pending EF Core migrations when it starts (`Database:MigrateOnStartup`), then seeds the learning
content and sets up the main administrator. All three steps are safe to repeat. The migrations only add tables and
columns; existing accounts are kept and marked approved with a confirmed email. Back up the database from the control
panel before deploying a new version.

## 4. Automated deployment (GitHub Actions)

- **CI** (`.github/workflows/ci.yml`) runs the backend and frontend tests and the production build on every push and
  pull request. It needs no secrets.
- **Deploy** (`.github/workflows/deploy.yml`) runs on **every push to `main`** (documentation-only changes are
  skipped) and can also be started by hand (**Actions → Deploy to MonsterASP.NET → Run workflow**). On a Windows
  runner it installs Web Deploy, writes `production.env` from secrets, runs the tests and `publish.ps1 -Deploy`, and
  deletes the secrets file afterwards. A failing test stops the deployment, so the live site keeps the last good version.

Add these repository secrets (**Settings → Secrets and variables → Actions**). Putting them in a `production`
environment lets you require an approval before each deployment.

| Secret | Value |
|---|---|
| `SITE_URL` | `https://site12345.runasp.net` |
| `DB_CONNECTION_STRING` | the MonsterASP.NET connection string |
| `BREVO_API_KEY` | Brevo API key |
| `EMAIL_SENDER` | verified sender address |
| `OWNER_EMAIL` | optional, overrides `Admin:OwnerEmail` |
| `OWNER_PASSWORD` | optional, first owner password |
| `MONSTERASP_SITE`, `MONSTERASP_SERVER`, `MONSTERASP_USERNAME`, `MONSTERASP_PASSWORD` | Web Deploy details |

## 5. After deploying

- `https://your-site/api/health` should answer `{"status":"ok","database":"connected"}`.
- The admin area shows the email provider; it must say **Brevo**.
- Logs: enable `stdoutLogEnabled="true"` in the site's `web.config` temporarily (and create a `logs` folder) if the
  site answers 500.30, then turn it off again.

## Troubleshooting

| Problem | Fix |
|---|---|
| HTTP 500.30 on start | Usually a missing setting: the log line starts with "Production configuration is incomplete". Run `--check-config` locally with the same values. |
| HTTP 500.31 | The server lacks the .NET 10 runtime. Choose .NET 10 in the site's settings, or publish with `-SelfContained` on a 64-bit site. |
| HTTP 500.32 | A self-contained (64-bit) build on a 32-bit app pool. Publish framework-dependent (the default). |
| Signed out after every page | The site isn't served over https, so the secure cookie is dropped. |
| Every form answers `bad_origin` | `Frontend__BaseUrl` doesn't match the address in the browser (scheme, host and port must be identical). |
| No emails arrive | Admin area → Send a test email. Then check the Brevo dashboard (sender verified? daily limit?) and the site log. |
| `Web Deploy failed` | Check site name, server, user name and password from the control panel, and that Web Deploy is enabled for the site. |
| Database errors at start | Check the connection string. The database user needs rights to create tables (the default user has them). |
