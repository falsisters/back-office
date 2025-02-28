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
      <CreateCashier />
    </div>
  );
}
