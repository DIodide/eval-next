import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { type Metadata } from "next";
import { Inter, Orbitron, Rajdhani } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import BackgroundManager from "@/app/_components/BackgroundManager";
import { PostHogProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { dark, neobrutalism } from "@clerk/themes";
import { cn } from "@/lib/utils";
import { staticPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...staticPageMetadata.home,
  metadataBase: new URL("https://evalgaming.com"),
  title: {
    template: "%s",
    default: "EVAL - College Esports Recruiting Platform",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} bg-black text-white`}>
      <body className="min-h-screen flex flex-col font-rajdhani">
        <ClerkProvider appearance={{ 
          baseTheme: [dark, neobrutalism],
          variables: {
            colorPrimary: '#719bf0'
          }
        }}>
          <PostHogProvider>
          <TRPCReactProvider>
            <BackgroundManager />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster richColors position="bottom-left" />
          </TRPCReactProvider>
          </PostHogProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
