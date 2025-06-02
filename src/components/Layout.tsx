import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Legal Battle Arena</title>
        <meta name="description" content="Enter the digital arena of justice" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>

      <div className="page-container">
        <div className="main-content">
          {/* Scanline effect overlay */}
          <div className="page-overlay" />
          
          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 