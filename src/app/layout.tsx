import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ComplianceProvider } from "@/stores/ComplianceContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Compliance Auditor",
  description: "AI 기반 금융 광고 컴플라이언스 검사 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ComplianceProvider>
          {children}
        </ComplianceProvider>
      </body>
    </html>
  );
}
