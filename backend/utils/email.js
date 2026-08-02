const nodemailer = require('nodemailer');
const { getCircuitBreaker } = require('./circuitBreaker');

const emailBreaker = getCircuitBreaker('SMTP_Email_Service', {
  failureThreshold: 3,
  timeoutMs: 5000,
  resetTimeoutMs: 15000,
  maxConcurrency: 5
});

/**
 * Configure Nodemailer Transporter
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return { transporter: null, user: null };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 3000,
    socketTimeout: 5000
  });

  return { transporter, user };
};

/**
 * Verify Transporter SMTP Connection
 */
const verifySmtpConnection = async () => {
  const { transporter, user } = getTransporter();
  if (!transporter) {
    console.log('ℹ️ SMTP Info: EMAIL_USER / EMAIL_PASS not configured in .env. OTP will log to console in dev mode.');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`✅ SMTP Connection Verified Successfully! Connected as: ${user}`);
    return true;
  } catch (err) {
    console.error(`⚠️ SMTP Verification Error: ${err.message}`);
    return false;
  }
};

/**
 * Send Professional HTML Email with OTP (Protected by CircuitBreaker)
 */
const sendOtpEmail = async (email, otp, name = 'Valued User', type = 'registration') => {
  const { transporter, user } = getTransporter();
  const subject = type === 'reset' 
    ? '🔐 AgroConnect Password Reset Code' 
    : '🌾 AgroConnect Email Verification Code';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1FA64B, #047857); padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; color: #334155; line-height: 1.6; }
        .otp-box { background: #F0FDF4; border: 2px dashed #1FA64B; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
        .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1FA64B; margin: 8px 0; font-family: monospace; }
        .expiry { font-size: 13px; color: #64748B; font-weight: 600; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 AgroConnect</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">India's Premier AgriTech Ecosystem</p>
        </div>
        <div class="content">
          <h3 style="color: #0F172A; margin-top: 0;">Hello ${name},</h3>
          <p>Thank you for registering with AgroConnect. Please use the 6-digit verification code below to ${type === 'reset' ? 'reset your account password' : 'verify your account'}:</p>

          <div class="otp-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #166534; font-weight: 800; letter-spacing: 1px;">Your OTP Code</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry">⏰ Code expires in 5 minutes</div>
          </div>

          <p style="font-size: 13px; color: #64748B;">If you did not request this verification, please ignore this email or contact support immediately.</p>
        </div>
        <div class="footer">
          &copy; 2026 AgroConnect HQ, Nashik, Maharashtra, India. All rights reserved.<br>
          Contact Support: harishp.mca_iom@bkc.met.edu | +91 8010616229
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`🔑 [DEV MODE] OTP generated for ${email}: ${otp}`);
    return { success: true, method: 'console' };
  }

  // Execute via CircuitBreaker
  return await emailBreaker.execute(
    async () => {
      await transporter.sendMail({
        from: `"AgroConnect Verification" <${user}>`,
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log(`[SMTP LOG] Verification OTP email successfully delivered to ${email}`);
      return { success: true, method: 'smtp' };
    },
    async (err) => {
      console.error(`⚠️ [EMAIL CIRCUIT BREAKER FALLBACK] Fast-failing SMTP delivery for ${email}. Falling back to console OTP logging:`, err.message);
      console.log(`🔑 [FALLBACK LOG] OTP for ${email}: ${otp}`);
      return { success: false, fallbackLogged: true, error: err.message };
    }
  );
};

module.exports = {
  verifySmtpConnection,
  sendOtpEmail
};
