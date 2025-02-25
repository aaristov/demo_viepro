import { Providers } from './providers';
import NavBar from './components/NavBar';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'ONE LIFE+ | AI-Powered Health Assessment',
  description: 'ONE LIFE+ provides real-time global health audits and AI-assisted medical recommendations for healthcare professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <NavBar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}