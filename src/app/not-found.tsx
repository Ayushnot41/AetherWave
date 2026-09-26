'use client';

import Link from 'next/link';
import { tokens } from '@/lib/design-tokens';

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: tokens.colors.paper,
        color: tokens.colors.ink,
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: tokens.fonts.body,
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          fontFamily: tokens.fonts.display,
          color: tokens.colors.authority,
          marginBottom: '8px',
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: tokens.fonts.display,
          fontSize: '1.5rem',
          color: tokens.colors.authority,
          marginBottom: '8px',
        }}
      >
        Page Not Found // पृष्ठ नहीं मिला
      </h1>
      <p
        style={{
          color: tokens.colors.slate,
          maxWidth: '480px',
          marginBottom: '24px',
          lineHeight: 1.6,
        }}
      >
        The requested agro-resilience dispatch node is unavailable or has been relocated within the National Grid.
        <br />
        अनुरोधित पृष्ठ ग्रिड में उपलब्ध नहीं है।
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '12px 24px',
          backgroundColor: tokens.colors.authority,
          color: tokens.colors.paper,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: '0 2px 8px rgba(21, 51, 80, 0.2)',
        }}
      >
        Return to Dashboard // डैशबोर्ड पर लौटें
      </Link>
    </div>
  );
}
