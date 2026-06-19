import type React from "react";
import { Poppins } from "next/font/google";
import { QueryProvider } from "@/lib/api/query-provider";
import { LayoutClient } from "@/components/LayoutClient";
import "./globals.css";

export const metadata = {
  title: "Falsisters",
  description: "Back Office for Falsisters",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <QueryProvider>
          <LayoutClient>{children}</LayoutClient>
        </QueryProvider>
      </body>
    </html>
  );
}
