import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { FCMProvider } from "@/components/FCMContext"; // FCM Context 추가

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "순자 신청서",
  description: "순자 신청서",
};

export default function RootLayout({ children }) {
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
        {/* 서비스 워커 등록 */}
        <ServiceWorkerRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* FCMProvider로 앱 전체를 감싸 전역에서 FCM 토큰을 사용할 수 있도록 */}
          <FCMProvider>
            {children}
            <Toaster />
          </FCMProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
