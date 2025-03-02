"use server"

import { cookies } from "next/headers"
import type { NestApiError } from "../../../utils/types/error.type"
import type { GetAllCashiersByUserIdPayload } from "../../../utils/types/getAllCashiersByUserId.type"

export const getAllCashiersByUserId = async (): Promise<GetAllCashiersByUserIdPayload> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")
  if (!accessToken) {
    throw new Error("Unauthorized")
  }
  const response = await fetch(`${process.env.API_URL}/cashier`, {
    headers: {
      Authorization: `Bearer ${accessToken.value}`,
    },
    method: "GET",
    next: {
      revalidate: 60,
    },
  })
  if (!response.ok) {
    if (response.status === 204) {
      return []
    }
    const data: NestApiError = await response.json()
    throw new Error(data.message[0] || "Unexpected error occurred")
  }
  const payload: GetAllCashiersByUserIdPayload = await response.json()
  return payload
}

