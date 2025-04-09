"use client"

import { useState } from "react"
import { logout } from "../lib/server/logout"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleLogout = async () => {
    await logout()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-6 py-3 text-base text-white/90 relative transition-all duration-200 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left border indicator */}
      {isHovered && (
        <div className="absolute left-0 top-0 h-full w-1 bg-secondary/70 transform transition-transform duration-300 ease-out"></div>
      )}
      
      {/* Content with translation effect */}
      <div className={`
        flex items-center w-full
        ${isHovered ? "translate-x-1" : ""}
        transition-transform duration-200
      `}>
        <LogOut className={`
          h-5 w-5 mr-4
          ${isHovered ? "text-secondary scale-110" : ""}
          transition-all duration-200
        `} />
        <span className={`
          ${isHovered ? "text-white" : ""}
          transition-colors duration-200
        `}>
          Logout
        </span>
      </div>
      
      {/* Hover background effect */}
      <div 
        className={`
          absolute inset-0 bg-primary-foreground/5
          transform-gpu transition-opacity duration-200 ease-in-out
          ${isHovered ? "opacity-100" : "opacity-0"}
        `}
      ></div>
    </button>
  )
}