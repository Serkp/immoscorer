interface WelcomeEmailProps {
  name?: string;
  email: string;
}

export function welcomeEmailSubject(): string {
  return "Willkommen bei ImmoScorer – Ihre Registrierung war erfolgreich!";
}

export function welcomeEmailHtml({ name, email }: WelcomeEmailProps): string {
  const displayName = name || email.split("@")[0];
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "https://immoscorer.de/dashboard";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen bei ImmoScorer</title>
</head>
<body style="margin:0;padding:0;background-color:#08090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08090E;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#7C6AFF,#4C9AFF);border-radius:12px;padding:12px 24px;">
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">ImmoScorer</span>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color:#0D0F16;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 36px;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#EAEDF3;">
                Willkommen, ${displayName}!
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#8B8FA3;line-height:1.6;">
                Ihre Registrierung bei ImmoScorer war erfolgreich. Ab sofort haben Sie Zugriff auf alle Funktionen unserer Plattform.
              </p>

              <!-- Features -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 16px;background-color:rgba(124,106,255,0.08);border-radius:12px;border:1px solid rgba(124,106,255,0.15);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:12px;">
                          <span style="font-size:14px;font-weight:600;color:#EAEDF3;">Das erwartet Sie:</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#7C6AFF;font-size:14px;">&#10003;</span>
                          <span style="color:#8B8FA3;font-size:13px;margin-left:8px;">KI-gestützte Immobilienbewertung in Sekunden</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#7C6AFF;font-size:14px;">&#10003;</span>
                          <span style="color:#8B8FA3;font-size:13px;margin-left:8px;">Detaillierte Renditeanalysen und Scoring</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#7C6AFF;font-size:14px;">&#10003;</span>
                          <span style="color:#8B8FA3;font-size:13px;margin-left:8px;">Ihr persönliches Immobilien-Portfolio</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#7C6AFF;font-size:14px;">&#10003;</span>
                          <span style="color:#8B8FA3;font-size:13px;margin-left:8px;">KI-Investmentstrategie und Marktanalysen</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <a href="${dashboardUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#7C6AFF,#4C9AFF);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">
                      Zum Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#555869;">
                Sie erhalten diese E-Mail, weil Sie sich bei ImmoScorer registriert haben.
              </p>
              <p style="margin:0;font-size:11px;color:#3E4153;">
                &copy; ${new Date().getFullYear()} ImmoScorer. Alle Rechte vorbehalten.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
