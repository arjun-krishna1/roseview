import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roseview",
  description: "A hotel memory companion for capturing trip stories and shareable reels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
