import axios, { AxiosError } from "axios";
import { ApiError } from "@/types";

const BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    const apiError: ApiError = {
      message: data?.message ?? data?.error ?? error.message ?? "Erro desconhecido",
      status: error.response?.status,
    };
    return Promise.reject(apiError);
  }
);
