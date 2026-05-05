import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "AI system design studio for collaborative architecture and technical specs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "var(--bg-surface)",
          colorNeutral: "var(--text-secondary)",
          colorPrimary: "var(--accent-primary)",
          colorPrimaryForeground: "var(--text-inverse)",
          colorForeground: "var(--text-primary)",
          colorMutedForeground: "var(--text-muted)",
          colorInputForeground: "var(--text-primary)",
          colorInput: "var(--bg-surface)",
          colorDanger: "var(--state-error)",
          colorSuccess: "var(--state-success)",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
          fontFamilyButtons: "var(--font-geist-sans)",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
