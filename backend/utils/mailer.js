import { Resend } from 'resend';

let resendClient;

const getResendClient = () => {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.SMTP_FROM || 'HomeBite Security <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Resend API returned an error:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Email send failed:', error && error.message ? error.message : error);

    const err = new Error(
      process.env.NODE_ENV === 'development'
        ? `Email send failed: ${error && error.message ? error.message : 'unknown error'}`
        : 'Email dispatch failure'
    );
    err.original = error;
    throw err;
  }
};
