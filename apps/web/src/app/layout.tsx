import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atithira Business OS",
  description: "The operating system for how modern businesses run.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
