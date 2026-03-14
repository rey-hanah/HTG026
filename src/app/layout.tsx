import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpotAI - Smart Parking Finder",
  description: "AI-powered parking recommendations in Vancouver",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
