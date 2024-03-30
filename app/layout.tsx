import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/react";

import { Libre_Baskerville } from "next/font/google";

import "./globals.css";

const libre = Libre_Baskerville({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wordsmith",
  description:
    "Battle against your friends in a head to head story telling game",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={libre.className}>
        <main className='m-8 sm:m-20'>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
