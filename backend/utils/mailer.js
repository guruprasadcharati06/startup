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

  // Clean up any hidden spaces from the environment variable just in case
  let fromAddress = process.env.SMTP_FROM ? process.env.SMTP_FROM.trim() : null;

  // Resend free tier strictly requires sending FROM onboarding@resend.dev
  // If the user hasn't verified a custom domain, force it to the safe default
  if (!fromAddress || fromAddress.includes('gmail.com')) {
    fromAddress = 'onboarding@resend.dev';
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
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
