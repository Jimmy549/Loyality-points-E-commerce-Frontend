import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import ConditionalLayout from "./LayoutContent";

export const metadata: Metadata = {
  title: "Shopco - Your Fashion Destination",
  description: "Discover the latest fashion trends with our loyalty rewards program",
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.className}>
        <HolyLoader color="#868686" height="3px" speed={250} />
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}