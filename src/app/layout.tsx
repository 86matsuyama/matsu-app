import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export { viewport } from "./viewport";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "マネジメント・リフレクション",
  description: "音声録音とAI分析によるマネジメント振り返り支援アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "リフレクション",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
