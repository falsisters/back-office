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
      className="flex items-center w-full px-6 py-4 text-base text-gray-300 hover:bg-gray-700 hover:text-white"
    >
      <LogOut className="mr-4 h-6 w-6" />
      Logout
    </button>
  )
}

