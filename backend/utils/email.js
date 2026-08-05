const nodemailer = require('nodemailer');
const { getCircuitBreaker } = require('./circuitBreaker');

// ── SMTP timeout values ──────────────────────────────────────────────────────
const SMTP_CONNECTION_TIMEOUT = Number(process.env.SMTP_CONNECTION_TIMEOUT) || 15000;
const SMTP_GREETING_TIMEOUT   = Number(process.env.SMTP_GREETING_TIMEOUT)   || 15000;
const SMTP_SOCKET_TIMEOUT     = Number(process.env.SMTP_SOCKET_TIMEOUT)     || 15000;
const SMTP_TIMEOUT = Math.max(SMTP_CONNECTION_TIMEOUT, SMTP_GREETING_TIMEOUT, SMTP_SOCKET_TIMEOUT);

const emailBreaker = getCircuitBreaker('SMTP_Email_Service', {
  failureThreshold: 3,
  timeoutMs: 30000,
  resetTimeoutMs: 15000,
  maxConcurrency: 5
});

const CIRCUIT_BREAKER_TIMEOUT = emailBreaker.timeoutMs;

console.log(`SMTP Timeout: ${SMTP_TIMEOUT} ms`);
console.log(`Circuit Breaker Timeout: ${CIRCUIT_BREAKER_TIMEOUT} ms`);

if (CIRCUIT_BREAKER_TIMEOUT > SMTP_TIMEOUT) {
  console.log(`✅ Verification: Circuit Breaker Timeout (${CIRCUIT_BREAKER_TIMEOUT} ms) is greater than SMTP Timeout (${SMTP_TIMEOUT} ms).`);
} else {
  console.warn(`⚠️ WARNING: Circuit Breaker Timeout (${CIRCUIT_BREAKER_TIMEOUT} ms) is NOT greater than SMTP Timeout (${SMTP_TIMEOUT} ms)! This may cause premature timeouts.`);
}

/**
 * Configure Nodemailer Transporter
 * Reads EMAIL_USER / EMAIL_PASS (or SMTP_USER / SMTP_PASS as aliases).
 * Returns { transporter, user } when credentials are present,
 * or { transporter: null, user: null } when they are not.
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
    // Use TLS SNI servername instead of rejectUnauthorized:false.
    // This correctly identifies the target host during the TLS handshake,
    // which is required by Gmail's SMTP servers.
    tls: {
      servername: 'smtp.gmail.com'
    },
    // Use the module-level constants so all timeout values are defined in one place
    // and the Circuit Breaker calculation above can reference them.
    connectionTimeout: SMTP_CONNECTION_TIMEOUT,
    greetingTimeout:   SMTP_GREETING_TIMEOUT,
    socketTimeout:     SMTP_SOCKET_TIMEOUT
  });

  return { transporter, user };
};

/**
 * Verify Transporter SMTP Connection — called once at server startup.
 * Logs clearly if credentials are missing so the operator knows exactly what to fix.
 */
const verifySmtpConnection = async () => {
  const dns  = require('dns').promises;
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost  = process.env.SMTP_HOST  || 'smtp.gmail.com';

  if (!emailUser) {
    console.error('❌ CRITICAL ERROR: EMAIL_USER (or SMTP_USER) is missing in .env — OTP emails will NOT be sent!');
    return false;
  }

  if (!emailPass) {
    console.error('❌ CRITICAL ERROR: EMAIL_PASS (or SMTP_PASS) is missing in .env — OTP emails will NOT be sent!');
    return false;
  }

  // ── DNS probe: confirm which IP address Render resolves smtp.gmail.com to ──
  // This tells us whether IPv4 or IPv6 was chosen, proving whether the
  // dns.setDefaultResultOrder('ipv4first') fix at startup actually took effect.
  try {
    const addresses = await dns.lookup(smtpHost, { all: true });
    const summary = addresses.map(a => `${a.address} (IPv${a.family})`).join(', ');
    console.log(`🔍 [SMTP DNS] ${smtpHost} resolves to: ${summary}`);
    const usedAddress = await dns.lookup(smtpHost);
    console.log(`🔍 [SMTP DNS] Active address used for connection: ${usedAddress.address} (IPv${usedAddress.family})`);
    if (usedAddress.family === 6) {
      console.warn('⚠️  [SMTP DNS] IPv6 address selected — Gmail SMTP may not respond. Force IPv4 in dns.setDefaultResultOrder.');
    }
  } catch (dnsErr) {
    console.warn(`⚠️  [SMTP DNS] Could not resolve ${smtpHost}: ${dnsErr.message}`);
  }

  const { transporter, user } = getTransporter();

  try {
    await transporter.verify();
    console.log(`✅ SMTP Connection Verified Successfully! Connected as: ${user}`);
    return true;
  } catch (err) {
    // Log every useful field so we can distinguish:
    //   ETIMEDOUT  → network block (cloud firewall / IPv6 unreachable)
    //   ECONNREFUSED → port closed
    //   ESOCKET    → TLS/SSL error
    //   535        → bad credentials (App Password wrong / not enabled)
    console.error(
      `❌ CRITICAL ERROR: SMTP Verification Failed for ${user}:\n` +
      `  message : ${err.message}\n` +
      `  code    : ${err.code    || '—'}\n` +
      `  errno   : ${err.errno   || '—'}\n` +
      `  address : ${err.address || '—'}  ← the resolved IP that was dialled\n` +
      `  port    : ${err.port    || '—'}\n` +
      `  command : ${err.command || '—'}  ← SMTP command that failed\n` +
      `  response: ${err.response || '—'}  ← raw SMTP server response`
    );
    return false;
  }
};

/**
 * Send Professional HTML Email with OTP (Protected by CircuitBreaker).
 *
 * Throws an Error if:
 *  - EMAIL_USER / EMAIL_PASS are not configured in .env
 *  - SMTP delivery fails (after circuit-breaker exhaustion)
 *
 * Returns { success: true, method: 'smtp' } on confirmed delivery.
 */
const sendOtpEmail = async (email, otp, name = 'Valued User', type = 'registration') => {
  const { transporter, user } = getTransporter();

  // Hard fail — never silently swallow missing credentials
  if (!transporter) {
    const missingVar = !(process.env.EMAIL_USER || process.env.SMTP_USER)
      ? 'EMAIL_USER'
      : 'EMAIL_PASS';
    throw new Error(
      `SMTP not configured: ${missingVar} is missing in environment variables. ` +
      `Set EMAIL_USER and EMAIL_PASS in your .env file (or Render Environment Variables) to enable OTP delivery.`
    );
  }

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

  // Execute via CircuitBreaker — throws on failure (no silent fallback)
  return await emailBreaker.execute(
    async () => {
      try {
        await transporter.sendMail({
          from: `"AgroConnect Verification" <${user}>`,
          to: email,
          subject: subject,
          html: htmlContent
        });
        console.log(`✅ [SMTP LOG] OTP email successfully delivered to ${email} via ${user}`);
        return { success: true, method: 'smtp' };
      } catch (smtpErr) {
        // Log the full Nodemailer error so real causes are visible in Render logs.
        // smtpErr.code identifies the failure class:
        //   ETIMEDOUT    → network block or IPv6 unreachable
        //   ECONNREFUSED → port closed (firewall)
        //   ESOCKET      → TLS/certificate failure
        //   (smtp code)  → e.g. 535 = wrong App Password, 534 = need App Password
        console.error(
          `❌ [SMTP ERROR] Delivery failed to ${email}:\n` +
          `  message : ${smtpErr.message}\n` +
          `  code    : ${smtpErr.code     || '—'}\n` +
          `  errno   : ${smtpErr.errno    || '—'}\n` +
          `  address : ${smtpErr.address  || '—'}  ← resolved IP that was dialled\n` +
          `  port    : ${smtpErr.port     || '—'}\n` +
          `  command : ${smtpErr.command  || '—'}  ← SMTP command that failed\n` +
          `  response: ${smtpErr.response || '—'}  ← raw SMTP server response`
        );
        throw smtpErr; // re-throw original — preserves all diagnostic fields
      }
    },
    async (err) => {
      // Fallback: re-throw the ORIGINAL error from Nodemailer (or the CB timeout
      // error if the CB fired first). Do NOT wrap in `new Error()` — that destroys
      // err.code, err.errno, err.address, err.port, err.command which are essential
      // for diagnosing whether the failure is a network block or a credential error.
      console.error(
        `❌ [EMAIL CIRCUIT BREAKER] SMTP delivery failed for ${email}.\n` +
        `  CB state: ${emailBreaker.state} | failures: ${emailBreaker.failureCount}/${emailBreaker.failureThreshold}\n` +
        `  error   : ${err.message}\n` +
        `  code    : ${err.code    || '—'}\n` +
        `  address : ${err.address || '—'}\n` +
        `  command : ${err.command || '—'}`
      );
      // Attach a human-readable prefix to the message while keeping all fields
      err.message = `Email delivery failed: ${err.message}`;
      throw err;  // throw original object — caller sees code/errno/address intact
    }
  );
};

module.exports = {
  verifySmtpConnection,
  sendOtpEmail
};
