import { Providers } from './providers';
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}