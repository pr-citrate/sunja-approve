"use client";
import { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "순자 신청서",
  description: "순자 신청서",
};

export default function RootLayout({ children }) {
  useEffect(() => {
    // 서비스 워커 등록
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker 등록 완료:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker 등록 실패:", error);
        });
    }
  }, []);

  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="citrate"
          data-description="Support me on Buy me a coffee!"
          data-message="삶이 힘든 개발자에게 커피 한 잔을 후원해주세요."
          data-color="#5F7FFF"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
