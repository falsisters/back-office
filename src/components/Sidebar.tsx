"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Home, Users, ShoppingBag, FileText, Truck, Menu, X } from "lucide-react"
import LogoutButton from "./LogoutButton"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/cashiers", label: "Cashiers", icon: Users },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/sales", label: "Sales Report", icon: FileText },
  { href: "/deliveries", label: "Delivery", icon: Truck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-2 left-2 z-50 block md:hidden p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle menu"
      >
        {isOpen ? "" : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleSidebar} />}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">FalSisters POS</h1>
        </div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm ${
                    pathname === item.href ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4">
          <LogoutButton />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">FalSisters POS</h1>
            <button onClick={toggleSidebar} className="p-2 rounded-md text-white" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1">
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm ${
                      pathname === item.href ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto p-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  )
}

