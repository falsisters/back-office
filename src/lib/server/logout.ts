"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logout = async () => {
  const cookieStore = await cookies();
  
  // Clear authentication cookies
  cookieStore.delete("access_token");
  cookieStore.delete("name");
  
  // Redirect to login page
  redirect("/login");
};
