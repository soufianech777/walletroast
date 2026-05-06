import { Resend } from 'resend';
import { VerificationEmail } from '../app/components/emails/VerificationEmail';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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
    // We render the component to a static string because Resend handles the HTML
    const html = renderToStaticMarkup(React.createElement(VerificationEmail, { code }));

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
