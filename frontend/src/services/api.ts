export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  url: string;
  body?: unknown;

  constructor(status: number, message: string, url: string, body?: unknown) {
    super(message);
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

export const request = async <T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> => {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  // رؤوس مرنة
  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");
  if (opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers,
      credentials: "include",
    });
  } catch (e) {
    throw new ApiError(0, "Network error", url);
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson
    ? await res.json().catch(() => undefined)
    : await res.text();

  if (!res.ok) {
    const msg =
      (isJson && body && (body as any).message) ||
      res.statusText ||
      `API ${res.status}`;
    throw new ApiError(res.status, msg, url, body);
  }

  return (body as T) ?? (undefined as unknown as T);
};

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, b?: any) =>
    request<T>(p, {
      method: "POST",
      body: b != null ? JSON.stringify(b) : undefined,
    }),
  put: <T>(p: string, b?: any) =>
    request<T>(p, {
      method: "PUT",
      body: b != null ? JSON.stringify(b) : undefined,
    }),
  patch: <T>(p: string, b?: any) =>
    request<T>(p, {
      method: "PATCH",
      body: b != null ? JSON.stringify(b) : undefined,
    }),
  delete: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};
