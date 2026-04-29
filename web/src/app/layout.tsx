import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { AuthProvider } from "@/components/AuthProvider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Pairs — Compléments alimentaires premium pour femmes",
    template: "%s | Pairs"
  },
  description:
    "Des compléments alimentaires premium, dosés au juste, pour accompagner chaque phase du cycle féminin. Sur abonnement ou à l'unité.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg"
  },
  openGraph: {
    title: "Pairs",
    description:
      "Compléments alimentaires premium pour les femmes, ajustés au cycle et aux objectifs.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <NewsletterPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
