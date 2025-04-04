"use client"

import { logout } from "../lib/server/logout"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-6 py-3 text-base text-white/90 hover:bg-primary-foreground/5 hover:text-white transition-colors"
    >
      <LogOut className="h-5 w-5 mr-4" />
      Logout
    </button>
  )
}

