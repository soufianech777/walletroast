import React from 'react';

interface VerificationEmailProps {
  code: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({ code }) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: '#09090b',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '40px 0',
    width: '100%',
    color: '#fafafa',
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '520px',
    margin: '0 auto',
    backgroundColor: '#111113',
    border: '1px solid #27272a',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
  };

  const logoStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    borderRadius: '12px',
    display: 'inline-block',
    marginBottom: '24px',
    lineHeight: '48px',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    margin: '0 0 8px 0',
    color: '#ffffff',
  };

  const roastBoxStyle: React.CSSProperties = {
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    border: '1px solid rgba(249, 115, 22, 0.1)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '32px',
  };

  const roastTextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#f97316',
    fontWeight: 600,
    margin: 0,
    fontStyle: 'italic',
  };

  const instructionStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#a1a1aa',
    lineHeight: '24px',
    marginBottom: '32px',
  };

  const codeBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 8px 16px rgba(249, 115, 22, 0.2)',
  };

  const codeTextStyle: React.CSSProperties = {
    fontSize: '42px',
    fontWeight: 800,
    letterSpacing: '0.2em',
    color: '#ffffff',
    margin: 0,
  };

  const securityStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#71717a',
    lineHeight: '18px',
    marginBottom: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          <span style={{ fontSize: '24px' }}>🔥</span>
        </div>
        
        <h1 style={headerStyle}>Verify your Identity</h1>
        
        <div style={roastBoxStyle}>
          <p style={roastTextStyle}>
            "Verify your account before you spend another $40 on 'emergency' Uber Eats."
          </p>
        </div>
        
        <p style={instructionStyle}>
          Enter the following 6-digit code in the app to complete your verification.
        </p>
        
        <div style={codeBoxStyle}>
          <p style={codeTextStyle}>{code}</p>
        </div>
        
        <p style={securityStyle}>
          This code expires in 10 minutes. If you didn't request this, just ignore it—though we recommend checking your pulse if you've forgotten your own app.
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '24px', padding: '0 20px' }}>
        <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
          &copy; 2026 WalletRoast. Stop wasting money, start roasting it.
        </p>
      </div>
    </div>
  );
};
