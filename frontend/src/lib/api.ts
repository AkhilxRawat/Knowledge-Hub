import { Resource, ResourceFormData } from "@/types";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...opts, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const login = (email: string, password: string) =>
  req<{ token: string; user: { id: string; name: string; email: string } }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );

export const signup = (name: string, email: string, password: string) =>
  req<{ token: string; user: { id: string; name: string; email: string } }>(
    "/api/auth/signup",
    { method: "POST", body: JSON.stringify({ name, email, password }) }
  );

export const getResources = (search?: string, tags?: string) => {
  const p = new URLSearchParams();
  if (search) p.set("search", search);
  if (tags)   p.set("tags", tags);
  const qs = p.toString();
  return req<Resource[]>(`/api/resources${qs ? `?${qs}` : ""}`);
};

export const createResource = (data: ResourceFormData) =>
  req<Resource>("/api/resources", { method: "POST", body: JSON.stringify(data) });

export const updateResource = (id: string, data: Partial<ResourceFormData>) =>
  req<Resource>(`/api/resources/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteResource = (id: string) =>
  req<void>(`/api/resources/${id}`, { method: "DELETE" });
