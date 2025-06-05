// app/kahon/page.tsx
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";
import KahonManagement from "@/components/Kahon/KahonManagement";

export default async function Kahon() {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <KahonManagement />
    </div>
  );
}