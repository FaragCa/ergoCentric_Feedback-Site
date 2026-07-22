import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chair Recommendation Review",
  description: "SME review of AI ergonomic chair recommendations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
