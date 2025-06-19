import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ありがとうお父さんお母さん - あなたの経験が、誰かの羅針盤になる",
  description: "現役大学生がリアルな受験体験や学生生活について語るWebメディア。個別インタビューやオンライン座談会も開催。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
