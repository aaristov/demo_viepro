import { Providers } from './providers';
import NavBar from './components/NavBar';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health Survey App",
  description: "A secure health survey application",
};

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