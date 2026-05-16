import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roseview",
  description: "A guest memory companion for luxury hotel stays.",
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
