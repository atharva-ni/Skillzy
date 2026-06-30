import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Skillzy — Career-Focused Learning & Placement Platform",
  description:
    "Master in-demand tech skills, practice coding with AI feedback, and land your dream job. Courses, coding labs, mock interviews, and job placement all in one platform.",
  keywords: "online learning, coding courses, job placement, career skills, tech education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
