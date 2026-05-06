"use server";

import { Resend } from 'resend';
import { VerificationEmail } from '@/app/components/emails/VerificationEmail';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string, isOldEmail = false) {
  try {
    const html = renderToStaticMarkup(React.createElement(VerificationEmail, { code }));
    
    const subject = isOldEmail 
      ? '[WalletRoast] Verify your OLD email to change it' 
      : '[WalletRoast] Verify your identity';

    const { data, error } = await resend.emails.send({
      from: 'WalletRoast <onboarding@resend.dev>', // Change to your verified domain in production
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email Send Error:', err);
    return { success: false, error: 'Failed to send email' };
  }
}
