"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Home, Users, ShoppingBag, FileText, Truck, Menu, X, Link2, DollarSign, BanknoteIcon, Package2, BoxIcon } from "lucide-react"
import LogoutButton from "./LogoutButton"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/cashiers", label: "Cashiers", icon: Users },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/sales", label: "Sales Report", icon: FileText },
  { href: "/deliveries", label: "Delivery", icon: Truck },
  { href: "/attachments", label: "Attachments", icon: Link2 },
  { href: "/expenses", label: "Expenses", icon: BanknoteIcon },
  { href: "/profits", label: "Profits", icon: DollarSign },
  { href: "/stocks", label: "Stocks", icon: Package2 },
  { href: "/kahon", label: "Kahon", icon: BoxIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between w-full bg-primary text-white p-4 md:hidden shadow-md">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-primary-foreground/10 text-white hover:bg-primary-foreground/20 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">FalSisters POS</h1>
          <p className="text-sm text-white/80">Backoffice</p>
        </div>
        <div className="w-11"></div> {/* Placeholder for layout balance */}
      </div>

      {/* Sidebar with Fixed Positioning */}
      <div
        className={`
          ${isOpen ? "block" : "hidden"}
          fixed inset-0 z-40
          md:block md:sticky md:top-0 md:h-screen md:w-64
          bg-primary text-white
          overflow-y-auto flex flex-col
        `}
      >
        {/* Close Button (Visible only in mobile mode) */}
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 p-2 rounded-md bg-primary-foreground/10 text-white md:hidden hover:bg-primary-foreground/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-7 w-7" />
          </button>
        )}

        {/* Sidebar Title - Desktop */}
        <div className="hidden md:flex flex-col items-center justify-center px-6 py-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">FalSisters POS</h1>
          <p className="text-sm text-white/80 mt-1">Backoffice</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          <ul className="mt-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-6 py-3 text-base relative
                      transition-all duration-200 ease-in-out
                      ${isActive 
                        ? "bg-primary-foreground/10 text-white font-medium border-l-2 border-secondary" 
                        : "text-white/90"
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {!isActive && isHovered && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-secondary/70 transform transition-transform duration-300 ease-out"></div>
                    )}
                    <div className={`
                      flex items-center w-full
                      ${!isActive && isHovered ? "translate-x-1" : ""}
                      transition-transform duration-200
                    `}>
                      <item.icon className={`
                        h-5 w-5 mr-4
                        ${!isActive && isHovered ? "text-secondary scale-110" : ""}
                        transition-all duration-200
                      `} />
                      <span className={`
                        ${!isActive && isHovered ? "text-white" : ""}
                      `}>
                        {item.label}
                      </span>
                    </div>
                    
                    {/* Hover Background Effect */}
                    {!isActive && (
                      <div 
                        className={`
                          absolute inset-0 bg-primary-foreground/5
                          transform-gpu transition-opacity duration-200 ease-in-out
                          ${isHovered ? "opacity-100" : "opacity-0"}
                        `}
                      ></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto border-t border-white/10">
          <LogoutButton />
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar} />}
    </>
  )
}