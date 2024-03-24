import type { Metadata } from 'next'
import { Libre_Baskerville } from "next/font/google";
import './globals.css'

import { getServerSession } from "next-auth";

import SessionProvider from "./components/SessionProvider";

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
  const session = await getServerSession();

  return (
    <html lang='en'>
      <body className={libre.className}>
        <SessionProvider session={session}>
          <main className='m-20'>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
