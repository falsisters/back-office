import { CreateCashier } from "@/components/Cashiers/CreateCashier";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function CreateCashierPage() {
  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    if (!userData) {
      redirect("/");
    }
    console.error(error, "Unauthorized");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Cashier</h1>
      <CreateCashier />
    </div>
  );
}
