import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
