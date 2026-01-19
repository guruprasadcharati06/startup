import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete');
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};
