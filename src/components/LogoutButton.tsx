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
      className="flex items-center w-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
    >
      <LogOut className="mr-3 h-5 w-5" />
      Logout
    </button>
  )
}

