"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateCashier } from "@/components/CreateCashier"

export default function CreateCashierPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: { name: string; accessKey: string; permissions: string[] }) => {
    try {
      const response = await fetch("/api/cashiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          accessKey: data.accessKey,
          permissions: data.permissions.map((perm) => ({ name: perm })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create cashier")
      }

      alert("Cashier created successfully")
      router.push("/cashiers")
    } catch (error) {
      console.error("Error creating cashier:", error)
      setError("Failed to create cashier. Please try again.")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Cashier</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}
      <CreateCashier onSubmit={handleSubmit} />
    </div>
  )
}

