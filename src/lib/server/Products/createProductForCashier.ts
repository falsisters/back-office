"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";

export const createProductForCashier = async (
  cashierId: string,
  formData: FormData
) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");
    if (!accessToken) throw new Error("Unauthorized");

    const response = await fetch(
      `${process.env.API_URL}/product/user/create/${cashierId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error: NestApiError = await response.json();
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Failed to create product"
      );
    }

    revalidatePath("/products");
    return await response.json();
  } catch (error) {
    console.error("Create product for cashier error:", error);
    throw error;
  }
};
