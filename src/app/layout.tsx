import type React from "react";
import { Sidebar } from "@/components/Sidebar";
import { getUserData } from "@/lib/server/getUserData";
import { Poppins } from "next/font/google";
import AgGridProvider from "@/components/providers/AgGridProvider";
import { QueryProvider } from "@/lib/api/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Falsisters",
  description: "Back Office for Falsisters",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const userData = await getUserData();
    user = {
      email: userData.email,
      id: userData.id,
      name: userData.name,
    };
  } catch (error) {
    console.error(error, "");
  }

  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <QueryProvider>
          <AgGridProvider>
            {user ? (
              <div className="min-h-screen flex flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 overflow-y-auto md:p-8 p-4">
                  {children}
                </main>
              </div>
            ) : (
              // When no user, render children without the sidebar
              <div className="min-h-screen">{children}</div>
            )}
          </AgGridProvider>
          <Toaster richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
