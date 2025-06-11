// app/kahon/page.tsx
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";
// import KahonManagement from "@/components/Kahon/KahonManagement";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/Kahon/LoadingScreen";

export default async function KahonPage() {
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
      <Suspense fallback={<LoadingScreen />}>
        {/* <KahonManagement /> */}
        <p>Hi</p>
      </Suspense>
    </div>
  );
}
