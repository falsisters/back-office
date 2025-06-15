"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const createProduct = async (formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");
    if (!accessToken) throw new Error("Unauthorized");

    const response = await fetch(`${process.env.API_URL}/product/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create product");
    }

    revalidatePath("/products");
    return await response.json();
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};
