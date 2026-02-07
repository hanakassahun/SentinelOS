import React from 'react';
import '../styles/globals.css';
import RootProviders from '../providers/RootProviders';

export const metadata = { title: 'sentinelOS' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
