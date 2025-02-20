"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, ShoppingBag, FileText, Truck } from "lucide-react"
import LogoutButton from "./LogoutButton"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/cashiers", label: "Cashiers", icon: Users },
  { href: "/inventory", label: "Inventory", icon: ShoppingBag },
  { href: "/sales", label: "Sales Report", icon: FileText },
  { href: "/deliveries", label: "Delivery", icon: Truck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-800 text-white">
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
      <div className="p-4">
        <LogoutButton />
      </div>
    </div>
  )
}

