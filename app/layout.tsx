import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tcg-deck-builder-idn.vercel.app"
  ),
  title: {
    default: "Pokémon TCG Indonesia Deck Builder",
    template: "%s | TCG ID Builder",
  },
  description:
    "The ultimate tool for Pokémon TCG Indonesia players. Build, analyze, and share your decks with comprehensive card data.",
  keywords: [
    "Pokemon TCG",
    "Pokemon Indonesia",
    "Kartu Pokemon",
    "Deck Builder",
    "TCG Builder",
    "Pokemon Card Indonesia",
  ],
  authors: [{ name: "Sulthan Qintara" }],
  creator: "Sulthan Qintara",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "Pokémon TCG Indonesia Deck Builder",
    description:
      "Build, analyze, and manage your Pokémon TCG Indonesia decks with ease. Features comprehensive database and advanced search.",
    siteName: "TCG Deck Builder IDN",
    images: [
      {
        url: "/Gemini_Generated_Image_ro97daro97daro97.webp",
        width: 1200,
        height: 630,
        alt: "Pokemon TCG Deck Builder Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokémon TCG Indonesia Deck Builder",
    description:
      "Build, analyze, and manage your Pokémon TCG Indonesia decks with ease.",
    images: ["/Gemini_Generated_Image_ro97daro97daro97.webp"],
    creator: "@sulthanqintara",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
