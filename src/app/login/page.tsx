import LoginForm from "@/components/LoginForm";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function LoginPage () {
  try {
    const userData = await getUserData();
    if (userData) {
      redirect('/');
    }
  } catch (error) {
    if (!(error instanceof Error && error.message === "Unauthorized")) {
      throw error;
    }
  }


  return (
    <LoginForm />
  )
}
