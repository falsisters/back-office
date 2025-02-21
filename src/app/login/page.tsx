import LoginForm from "@/components/Login/LoginForm";
import { getUserData } from "@/lib/server/getUserData";
import { redirect } from "next/navigation";

export default async function LoginPage () {
  let userData;
  try {
    userData = await getUserData();
  } catch (error) {
    if (userData) {
      redirect("/");
    }
    console.error(error, "Unauthorized");
  }
  return (
    <LoginForm />
  )
}
