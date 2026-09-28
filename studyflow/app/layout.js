import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "StudyFlow — AI-Powered Study Notes & Flowcharts",
  description:
    "Transform any topic into concise key points and visual flowcharts. Powered by Google Gemini AI to help students understand complex subjects faster.",
  keywords: "study notes, flowcharts, AI study tool, key points, learning, Gemini AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
