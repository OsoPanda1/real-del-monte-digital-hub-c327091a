import { clientEnv } from "@/lib/env"

const BASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json()
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: unknown; session: unknown }>("/auth/v1/token", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<{ user: unknown }>("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<void>("/auth/v1/logout", { method: "POST" }),
}

export const businessesApi = {
  list: () => request<unknown[]>("/rest/v1/businesses"),
  get: (id: string) => request<unknown>(`/rest/v1/businesses?id=eq.${id}`),
  create: (data: unknown) =>
    request<unknown>("/rest/v1/businesses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const paymentsApi = {
  createPayment: (data: unknown) =>
    request<unknown>("/functions/v1/create-payment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
