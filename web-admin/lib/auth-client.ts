import { apiFetch, setAuthTokens, clearAuthTokens, getRefreshToken } from "@/lib/api";

export interface LoyaltyTier {
  tier_id: number;
  tier_name: string;
  min_points: number;
}

export interface AdminUser {
  user_id: number;
  full_name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  loyalty_tier_id: number;
  loyalty_points: number;
  created_at: string;
  loyalty_tier?: LoyaltyTier;
}

interface LoginResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    auth: false,
  });
  setAuthTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  clearAuthTokens();
  if (refreshToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        auth: false,
      });
    } catch {
      // best-effort; tokens are already cleared client-side
    }
  }
}

export async function getCurrentUser(): Promise<AdminUser> {
  return apiFetch<AdminUser>("/auth/me");
}
