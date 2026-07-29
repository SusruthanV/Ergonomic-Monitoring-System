import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_otp_email(to_email: str, otp: str, name: str) -> bool:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL] SMTP not configured. Would send OTP {otp} to {to_email}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "ErgoGuard - Email Verification"
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        msg["To"] = to_email

        text = f"Hi {name},\n\nYour ErgoGuard email verification code is: {otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nErgoGuard Team"
        html = f"""\
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.08);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #818cf8, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ErgoGuard</span>
              </div>
              <h1 style="color: #f1f5f9; font-size: 20px; text-align: center; margin-bottom: 8px;">Verify your email</h1>
              <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-bottom: 24px;">Hi {name}, use the code below to verify your email address.</p>
              <div style="text-align: center; background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(129,140,248,0.15);">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #818cf8; font-family: 'Courier New', monospace;">{otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; text-align: center;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
            </div>
          </body>
        </html>
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL or settings.SMTP_USER, to_email, msg.as_string())

        print(f"[EMAIL] OTP sent to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False
