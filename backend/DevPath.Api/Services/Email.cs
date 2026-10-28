using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

/// <summary>A ready-to-send email. <see cref="Kind"/> names the template (handy in logs and tests).</summary>
public record EmailMessage(string Kind, string To, string ToName, string Subject, string Html, string Text, string? Link = null);

/// <summary>Sends account emails (verification, password reset, approval decisions…).</summary>
public interface IAccountEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct);
}

public class EmailOptions
{
    public const string SectionName = "Email";
    /// <summary>"Log" (development: writes the email to the console) or "Brevo" (real delivery over Brevo's HTTPS API).</summary>
    public string Provider { get; set; } = "Log";
    public string SenderEmail { get; set; } = "";
    public string SenderName { get; set; } = "DevPath";
    public BrevoOptions Brevo { get; set; } = new();
}

public class BrevoOptions
{
    /// <summary>Secret: set through the environment variable Email__Brevo__ApiKey, never in a committed file.</summary>
    public string ApiKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://api.brevo.com/v3/";
}

/// <summary>
/// Development sender: logs the email instead of sending it, so links can be opened locally.
/// The link contains a one-time token, which is why this sender is refused in Production (see ConfigurationCheck).
/// </summary>
public class LoggingAccountEmailSender(ILogger<LoggingAccountEmailSender> logger) : IAccountEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        logger.LogWarning("Email ({Kind}) to {To}: \"{Subject}\"{Link}", message.Kind, message.To, message.Subject,
            message.Link is null ? "" : $" — open this link: {message.Link}");
        return Task.CompletedTask;
    }
}

/// <summary>
/// Sends through Brevo's transactional email API (https://developers.brevo.com/reference/sendtransacemail).
/// It uses HTTPS on port 443, which works on shared hosting where outgoing SMTP is often blocked.
/// </summary>
public class BrevoEmailSender(HttpClient http, IOptions<EmailOptions> options, ILogger<BrevoEmailSender> logger) : IAccountEmailSender
{
    public async Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        var o = options.Value;
        using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(new Uri(o.Brevo.BaseUrl), "smtp/email"))
        {
            Content = JsonContent.Create(new
            {
                sender = new { email = o.SenderEmail, name = o.SenderName },
                to = new[] { new { email = message.To, name = string.IsNullOrWhiteSpace(message.ToName) ? message.To : message.ToName } },
                subject = message.Subject,
                htmlContent = message.Html,
                textContent = message.Text,
                tags = new[] { message.Kind },
            }),
        };
        request.Headers.Add("api-key", o.Brevo.ApiKey);
        request.Headers.Accept.ParseAdd("application/json");

        using var response = await http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            // Brevo's error body explains the cause (e.g. unverified sender); it never echoes the API key.
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Brevo refused the {Kind} email to {To}: {Status} {Body}", message.Kind, message.To, (int)response.StatusCode, body);
            throw new EmailDeliveryException($"The email provider answered {(int)response.StatusCode}.");
        }
        logger.LogInformation("Sent {Kind} email to {To} through Brevo", message.Kind, message.To);
    }
}

public class EmailDeliveryException(string message) : Exception(message);

/// <summary>
/// The account emails, in Arabic and English (the app is bilingual and doesn't know which language
/// the reader prefers yet). Every value is HTML-encoded; links are built from Frontend:BaseUrl.
/// </summary>
public class AccountEmails(IConfiguration config)
{
    private string BaseUrl => (config["Frontend:BaseUrl"] ?? "http://localhost:4200").TrimEnd('/');

    public string Link(string path, string? token = null) =>
        token is null ? $"{BaseUrl}{path}" : $"{BaseUrl}{path}?token={Uri.EscapeDataString(token)}";

    public EmailMessage Verification(string to, string name, string token)
    {
        var link = Link("/verify-email", token);
        return Build("verification", to, name, "تأكيد بريدك الإلكتروني · Confirm your email — DevPath",
            ar: ["شكرًا لتسجيلك في DevPath. اضغط الزر لتأكيد بريدك الإلكتروني. صلاحية الرابط 24 ساعة ويعمل مرة واحدة.",
                 "بعد التأكيد سيراجع أحد المسؤولين حسابك، وسنرسل لك رسالة عند الموافقة."],
            en: ["Thanks for signing up to DevPath. Use the button to confirm your email address. The link works once and expires in 24 hours.",
                 "After that, an administrator reviews your account and we'll email you once it's approved."],
            buttonAr: "تأكيد البريد", buttonEn: "Confirm email", link: link,
            footerAr: "إن لم تنشئ هذا الحساب فتجاهل هذه الرسالة.", footerEn: "If you didn't create this account, you can ignore this email.");
    }

    public EmailMessage PasswordReset(string to, string name, string token)
    {
        var link = Link("/reset-password", token);
        return Build("password-reset", to, name, "إعادة تعيين كلمة المرور · Reset your password — DevPath",
            ar: ["طلب أحدهم إعادة تعيين كلمة مرور حسابك. اضغط الزر لاختيار كلمة مرور جديدة. صلاحية الرابط ساعة واحدة ويعمل مرة واحدة."],
            en: ["Someone asked to reset the password of your account. Use the button to choose a new one. The link works once and expires in 1 hour."],
            buttonAr: "اختيار كلمة مرور جديدة", buttonEn: "Choose a new password", link: link,
            footerAr: "إن لم تطلب ذلك فتجاهل الرسالة، وستبقى كلمة مرورك كما هي.", footerEn: "If you didn't ask for this, ignore this email; your password stays the same.");
    }

    public EmailMessage Approved(string to, string name) =>
        Build("approved", to, name, "تمت الموافقة على حسابك · Your account is approved — DevPath",
            ar: ["تمت الموافقة على حسابك في DevPath، ويمكنك الآن استخدام كل ميزات المنصة."],
            en: ["Your DevPath account has been approved. You can now use everything in the app."],
            buttonAr: "ابدأ التعلم", buttonEn: "Start learning", link: Link("/"));

    public EmailMessage Rejected(string to, string name, string? reason) =>
        Build("rejected", to, name, "بخصوص طلب حسابك · About your account request — DevPath",
            ar: ["نأسف، لم تتم الموافقة على طلب حسابك في DevPath.", .. Reason(reason, "السبب")],
            en: ["Sorry, your DevPath account request was not approved.", .. Reason(reason, "Reason")],
            footerAr: "إن كنت تظن أن هذا خطأ فتواصل مع مسؤول المنصة.", footerEn: "If you think this is a mistake, contact the site administrator.");

    public EmailMessage Suspended(string to, string name, string? reason) =>
        Build("suspended", to, name, "تم إيقاف حسابك مؤقتًا · Your account is suspended — DevPath",
            ar: ["تم إيقاف حسابك في DevPath مؤقتًا، ولن تتمكن من استخدام المنصة حتى يعيد أحد المسؤولين تفعيله.", .. Reason(reason, "السبب")],
            en: ["Your DevPath account has been suspended. You can't use the app until an administrator reactivates it.", .. Reason(reason, "Reason")],
            footerAr: "إن كنت تظن أن هذا خطأ فتواصل مع مسؤول المنصة.", footerEn: "If you think this is a mistake, contact the site administrator.");

    public EmailMessage Reactivated(string to, string name) =>
        Build("reactivated", to, name, "تمت إعادة تفعيل حسابك · Your account is active again — DevPath",
            ar: ["أعاد أحد المسؤولين تفعيل حسابك في DevPath."], en: ["An administrator reactivated your DevPath account."],
            buttonAr: "افتح DevPath", buttonEn: "Open DevPath", link: Link("/"));

    public EmailMessage Promoted(string to, string name) =>
        Build("admin-promoted", to, name, "أصبحت مسؤولًا · You are now an administrator — DevPath",
            ar: ["منحك المسؤول الرئيسي صلاحيات المسؤول في DevPath. يمكنك الآن مراجعة الحسابات والموافقة عليها من لوحة الإدارة."],
            en: ["The main administrator made you an administrator of DevPath. You can now review and approve accounts in the admin area."],
            buttonAr: "لوحة الإدارة", buttonEn: "Open the admin area", link: Link("/admin"));

    public EmailMessage Test(string to, string name) =>
        Build("test", to, name, "رسالة تجريبية · Test email — DevPath",
            ar: ["هذه رسالة تجريبية من DevPath. وصولها يعني أن إعدادات البريد تعمل."],
            en: ["This is a test email from DevPath. If you can read it, email delivery works."]);

    private static string[] Reason(string? reason, string label) =>
        string.IsNullOrWhiteSpace(reason) ? [] : [$"{label}: {reason.Trim()}"];

    private static EmailMessage Build(string kind, string to, string name, string subject, string[] ar, string[] en,
        string? buttonAr = null, string? buttonEn = null, string? link = null, string? footerAr = null, string? footerEn = null)
    {
        string E(string s) => WebUtility.HtmlEncode(s);
        string Paragraphs(IEnumerable<string> lines) =>
            string.Concat(lines.Select(l => $"<p style=\"margin:0 0 14px;font-size:15px;line-height:1.7;color:#1f2937\">{E(l)}</p>"));
        string Button(string label) => link is null ? "" :
            $"<p style=\"margin:20px 0\"><a href=\"{E(link)}\" style=\"display:inline-block;background:#4f46e5;color:#ffffff;" +
            $"text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px\">{E(label)}</a></p>";
        string Footer(string? text) => text is null ? "" : $"<p style=\"margin:12px 0 0;font-size:13px;color:#6b7280\">{E(text)}</p>";
        var greetingAr = string.IsNullOrWhiteSpace(name) ? "مرحبًا،" : $"مرحبًا {name}،";
        var greetingEn = string.IsNullOrWhiteSpace(name) ? "Hello," : $"Hello {name},";
        var fallback = link is null ? "" :
            $"<p style=\"margin:18px 0 0;font-size:12px;color:#6b7280;direction:ltr;text-align:left\">If the button doesn't work, copy this link:<br>" +
            $"<a href=\"{E(link)}\" style=\"color:#4f46e5;word-break:break-all\">{E(link)}</a></p>";

        var html = $"""
            <!doctype html>
            <html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(subject)}</title></head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Segoe UI,Tahoma,Arial,sans-serif">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px">
                <tr><td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
                    <tr><td style="background:linear-gradient(135deg,#4f46e5,#0ea5e9);background-color:#4f46e5;padding:22px 28px;color:#ffffff;font-size:20px;font-weight:700">DevPath</td></tr>
                    <tr><td dir="rtl" style="padding:26px 28px 6px;text-align:right">
                      <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111827">{E(greetingAr)}</p>
                      {Paragraphs(ar)}{Button(buttonAr ?? "")}{Footer(footerAr)}
                    </td></tr>
                    <tr><td style="padding:0 28px"><hr style="border:0;border-top:1px solid #e5e7eb;margin:18px 0"></td></tr>
                    <tr><td dir="ltr" style="padding:0 28px 26px;text-align:left">
                      <p style="margin:0 0 14px;font-size:16px;font-weight:600;color:#111827">{E(greetingEn)}</p>
                      {Paragraphs(en)}{Button(buttonEn ?? "")}{Footer(footerEn)}{fallback}
                    </td></tr>
                  </table>
                  <p style="margin:14px 0 0;font-size:12px;color:#9ca3af">DevPath — Full-Stack Developer Academy</p>
                </td></tr>
              </table>
            </body></html>
            """;

        var text = new StringBuilder();
        text.AppendLine(greetingAr);
        foreach (var l in ar) text.AppendLine(l);
        if (link is not null) text.AppendLine(link);
        if (footerAr is not null) text.AppendLine(footerAr);
        text.AppendLine().AppendLine("—").AppendLine().AppendLine(greetingEn);
        foreach (var l in en) text.AppendLine(l);
        if (link is not null) text.AppendLine(link);
        if (footerEn is not null) text.AppendLine(footerEn);
        return new EmailMessage(kind, to, name, subject, html, text.ToString(), link);
    }
}
