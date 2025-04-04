import type React from "react"
import { Sidebar } from "@/components/Sidebar"
import { getUserData } from "@/lib/server/getUserData"
import "./globals.css"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const userData = await getUserData()
    user = {
      email: userData.email,
      id: userData.id,
      name: userData.name,
    }
  } catch (error) {
    console.error(error, "")
  }

  return (
    <html lang="en">
      <body>
        {user ? (
          <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto md:p-8 p-4">{children}</main>
          </div>
        ) : (
          // When no user, render children without the sidebar
          <div className="min-h-screen">
            {children}
          </div>
        )}
      </body>
    </html>
  )
}