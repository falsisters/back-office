import SalesReport from "@/components/SalesReport";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function SalesPage() {
  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/");
    }
    throw error;
  }
  const user = {id: userData.id}

  return (
    <SalesReport/>
  )
}