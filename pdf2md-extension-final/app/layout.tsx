// app/layout.tsx
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'PDF to Excel App',
  description: 'Resume processing tool with OCR and Excel mapping capabilities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
