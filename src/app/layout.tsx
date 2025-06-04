import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";

export const metadata: Metadata = {
  title: "EVAL - College Esports Recruiting Platform",
  description: "The premier platform connecting student gamers with college esports programs and scholarships.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} bg-[#0f0f1a] text-white`}>
      <body className="min-h-screen flex flex-col">
        <ClerkProvider>
          <TRPCReactProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
