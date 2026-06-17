import { apiPost, apiGet } from "./client";
import type { AuthResponse, OtpResponse, User } from "@/lib/types";

export const authApi = {
  signup: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => apiPost<OtpResponse>("/auth/signup", data, { isAnonymous: true }),

  sendOtp: (phone: string) =>
    apiPost<OtpResponse>("/auth/resend-otp", { phone }, { isAnonymous: true }),

  verifyOtp: (phone: string, otp: string) =>
    apiPost<AuthResponse>("/auth/verify-otp", { phone, code: otp }, { isAnonymous: true }),

  login: (identifier: string, password: string) =>
    apiPost<AuthResponse>("/auth/login", { email: identifier, password }, { isAnonymous: true }),

  forgotPassword: (email: string) =>
    apiPost<{ message: string }>("/auth/forgot-password", { email }, { isAnonymous: true }),

  resetPassword: (token: string, password: string) =>
    apiPost<{ message: string }>("/auth/reset-password", { token, password }, { isAnonymous: true }),

  me: () => apiGet<User>("/auth/me"),
};
