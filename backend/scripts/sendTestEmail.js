import 'dotenv/config';
import { sendEmail } from '../utils/mailer.js';

(async () => {
  try {
    const to = process.env.TEST_EMAIL || process.env.SMTP_USER;
    await sendEmail({
      to,
      subject: 'Test email from HomeBite',
      text: 'This is a test email from sendTestEmail.js',
+      html: '<p>This is a test email from <strong>sendTestEmail.js</strong></p>'
    });
    console.log('Test email sent to', to);
  } catch (err) {
    console.error('Test email failed:', err && err.message ? err.message : err);
    if (err && err.original) {
      console.error('Original error:', err.original);
    }
    process.exit(1);
  }
})();
