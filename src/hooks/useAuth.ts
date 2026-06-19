"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { extractNestError } from "@/lib/api/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  LoginFormData,
  LoginPayload,
} from "../../utils/types/login.type";
import type {
  RegisterFormData,
  RegisterPayload,
} from "../../utils/types/register.type";
import type { UserDataPayload } from "../../utils/types/userData.type";

async function fetchUser(): Promise<UserDataPayload> {
  const { data } = await apiClient.get("/api/auth");
  return data;
}

async function loginUser(formData: LoginFormData): Promise<LoginPayload> {
  const { data } = await apiClient.post("/api/auth/login", formData);
  return data;
}

async function registerUser(
  formData: RegisterFormData
): Promise<RegisterPayload> {
  const { data } = await apiClient.post("/api/auth/register", formData);
  return data;
}

async function logoutUser(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

export function useUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.push("/");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.push("/");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
    onError: (error) => {
      toast.error(extractNestError(error));
    },
  });
}

export function useAuth() {
  const user = useUser();
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();

  return {
    user: user.data ?? null,
    isLoading: user.isLoading,
    isAuthenticated: !!user.data,
    login,
    register,
    logout,
  };
}
