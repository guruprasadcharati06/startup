import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  let { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  // Normalize/trimming to avoid accidental whitespace in env values
  SMTP_HOST = SMTP_HOST && SMTP_HOST.trim();
  SMTP_PORT = SMTP_PORT && SMTP_PORT.toString().trim();
  SMTP_USER = SMTP_USER && SMTP_USER.trim();
  SMTP_PASS = SMTP_PASS && SMTP_PASS.trim();
  SMTP_FROM = SMTP_FROM && SMTP_FROM.trim();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete');
  }

  const portNum = Number(SMTP_PORT) || 587;
  const secure = portNum === 465; // secure for SMTPS

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNum,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // Allow self-signed certs if necessary; safe for development
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    // Log detailed error server-side for debugging (do not leak to clients in production)
    console.error('Email send failed:', error && error.message ? error.message : error);

    const err = new Error(
      process.env.NODE_ENV === 'development'
        ? `Email send failed: ${error && error.message ? error.message : 'unknown error'}`
        : 'Email dispatch failure'
    );
    // Attach original for further inspection if needed
    err.original = error;
    throw err;
  }
};
