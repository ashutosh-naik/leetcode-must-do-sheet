import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { ErrorBoundary } from "@/components/common/error-boundary";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LeetCode Must-Do",
  description: "Track your LeetCode progress",
  icons: {
    icon: "/leetcode.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geist.variable, "h-full")}
    >
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ErrorBoundary>
            <AppLayout>{children}</AppLayout>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
