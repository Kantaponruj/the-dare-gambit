// Vite exposes env vars via import.meta.env
import { API_URL } from "../../config/api";
const BASE_URL = API_URL;

export interface ApiError extends Error {
  status?: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = (data.error as string) || message;
    } catch {}
    const err: ApiError = Object.assign(new Error(message), {
      status: res.status,
    });
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export function getToken(): string | null {
  return localStorage.getItem("auth.token");
}

export function setToken(token: string) {
  localStorage.setItem("auth.token", token);
}

export function clearToken() {
  localStorage.removeItem("auth.token");
}

export async function login(username: string, password: string) {
  return request<{ token: string }>(`/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export interface TournamentPayload {
  name: string;
}

export interface TournamentDTO {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: string;
}

export async function createTournamentRemote(
  name: string
): Promise<TournamentDTO> {
  const token = getToken();
  return request<TournamentDTO>(`/tournaments`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function listTournaments(): Promise<TournamentDTO[]> {
  return request<TournamentDTO[]>(`/tournaments`);
}

export async function getTournament(id: string): Promise<TournamentDTO> {
  return request<TournamentDTO>(`/tournaments/${id}`);
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
