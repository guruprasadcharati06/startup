import sgMail from '@sendgrid/mail';

const getSgClient = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  sgMail.setApiKey(apiKey);
  return sgMail;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const mail = getSgClient();

  try {
    const msg = {
      to,
      from: process.env.SMTP_FROM || 'HomeBite Security <noreply@homebite.com>',
      subject,
      text,
      html,
    };

    await mail.send(msg);
  } catch (error) {
    console.error('Email send failed:', error && error.message ? error.message : error);

    if (error.response) {
      console.error(error.response.body);
    }

    const err = new Error(
      process.env.NODE_ENV === 'development'
        ? `Email send failed: ${error && error.message ? error.message : 'unknown error'}`
        : 'Email dispatch failure'
    );
    err.original = error;
    throw err;
  }
};
