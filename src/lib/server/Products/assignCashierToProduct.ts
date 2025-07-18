"use server";
import { cookies } from "next/headers";
import { NestApiError } from "../../../../utils/types/error.type";
import { revalidatePath } from "next/cache";

export const assignCashierToProduct = async (
  productId: string,
  cashierId: string
) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${process.env.API_URL}/product/user/${productId}/assign-cashier/${cashierId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const data: NestApiError = await response.json();
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Failed to assign cashier to product"
      );
    }

    revalidatePath("/products");
    return await response.json();
  } catch (error) {
    console.error("Assign cashier to product error:", error);
    throw error;
  }
};
