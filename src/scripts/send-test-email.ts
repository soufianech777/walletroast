import { Resend } from 'resend';
// Using a string template instead of React to avoid Next.js Server Action build errors
const renderEmail = (code: string) => `
  <div style="background-color: #09090b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 0; width: 100%; color: #fafafa;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #111113; border: 1px solid #27272a; border-radius: 24px; padding: 48px; text-align: center;">
      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: inline-block; margin-bottom: 24px; line-height: 48px;">
        <span style="font-size: 24px;">🔥</span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0 0 8px 0; color: #ffffff;">Verify your Identity</h1>
      <div style="background-color: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.1); border-radius: 16px; padding: 16px; margin-bottom: 32px;">
        <p style="font-size: 13px; color: #f97316; font-weight: 600; margin: 0; font-style: italic;">
          &quot;Verify your account before you spend another $40 on 'emergency' Uber Eats.&quot;
        </p>
      </div>
      <p style="font-size: 15px; color: #a1a1aa; line-height: 24px; margin-bottom: 32px;">
        Enter the following 6-digit code in the app to complete your verification.
      </p>
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 16px; padding: 24px; margin-bottom: 32px; box-shadow: 0 8px 16px rgba(249, 115, 22, 0.2);">
        <p style="font-size: 42px; font-weight: 800; letter-spacing: 0.2em; color: #ffffff; margin: 0;">${code}</p>
      </div>
      <p style="font-size: 12px; color: #71717a; line-height: 18px; margin-bottom: 0;">
        This code expires in 10 minutes. If you didn't request this, just ignore it—though we recommend checking your pulse if you've forgotten your own app.
      </p>
    </div>
    <div style="text-align: center; margin-top: 24px; padding: 0 20px;">
      <p style="font-size: 11px; color: #52525b; margin: 0;">
        &copy; 2026 WalletRoast. Stop wasting money, start roasting it.
      </p>
    </div>
  </div>
`;

// This script can be run with: npx tsx src/scripts/send-test-email.ts
// Make sure you have RESEND_API_KEY in your .env.local

async function sendTest() {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('❌ Error: RESEND_API_KEY is not defined in your environment.');
    console.log('Please add it to your .env.local file.');
    return;
  }

  const resend = new Resend(resendApiKey);
  const email = 'pankauedith939@gmail.com'; // Authorized recipient
  const code = '802949';

  console.log(`🚀 Sending test verification email to ${email}...`);

  try {
    const html = renderEmail(code);

    const { data, error } = await resend.emails.send({
      from: 'WalletRoast <onboarding@resend.dev>', // Use a verified domain in production
      to: [email],
      subject: '[WalletRoast] Verify your identity',
      html: html,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('ID:', data?.id);
    }
  } catch (err) {
    console.error('💥 Unexpected Error:', err);
  }
}

sendTest();
