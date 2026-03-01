import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "EI Assessment – Gestão da Mudança",
    template: "%s | EI Assessment",
  },
  description:
    "Plataforma de Assessment de Inteligência Emocional aplicada à Gestão da Mudança Organizacional.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
