import { ExpenseList } from "@/components/Expenses/ExpenseList"
import { getUserData } from "@/lib/server/getUserData"
import { redirect } from "next/navigation"

export default async function ExpensesPage() {
  let userData
  try {
    userData = await getUserData()
  } catch (error) {
    if (!userData) {
      redirect("/")
    }
    console.error(error, "Unauthorized")
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Expenses</h1>
      </div>
      <ExpenseList />
    </div>
  )
}