import type React from "react"
import { Sidebar } from "@/components/Sidebar"
import { getUserData } from "@/lib/server/getUserData"
import "./globals.css"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const userData = await getUserData();
    user = {
      email: userData.email,
      id: userData.id,
      name: userData.name
    };
  } catch (error) {
    console.error(error, '')
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {user && <Sidebar />}
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  )
}

