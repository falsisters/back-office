import LoginForm from "@/components/Login/LoginForm";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  let isAuthenticated = false;
  
  try {
    const userData = await getUserData();
    isAuthenticated = !!userData;
  } catch (error) {
    console.error(error);
  }
  
  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-4">
      <LoginForm />
    </div>
  );
}
