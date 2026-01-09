import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Deals",
  description: "Minimal Amazon tool and garage equipment deals."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
