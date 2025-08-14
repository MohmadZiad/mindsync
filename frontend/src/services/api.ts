export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(`API ${status}`);
    this.status = status;
    this.data = data;
  }
}
export const request = async <T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // send HTTP-only cookies
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
};

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, b?: any) =>
    request<T>(p, { method: "POST", body: b ? JSON.stringify(b) : undefined }),
  put: <T>(p: string, b?: any) =>
    request<T>(p, { method: "PUT", body: JSON.stringify(b) }),
  patch: <T>(p: string, b?: any) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(b) }),
  delete: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};
