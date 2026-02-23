import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gathering Governorships Dashboard",
  description: "Campus governorship and bacenta statistics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
