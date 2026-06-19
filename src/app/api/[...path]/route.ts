import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3001";

const AUTH_COOKIE = "access_token";

const AUTH_ROUTES: Record<string, { setCookies?: string[]; deleteCookies?: string[] }> = {
  "auth/login": { setCookies: [AUTH_COOKIE, "name", "permissions"] },
  "auth/register": { setCookies: [AUTH_COOKIE, "name"] },
  "auth/logout": { deleteCookies: [AUTH_COOKIE, "name", "permissions"] },
};

function buildBackendUrl(path: string, searchParams: URLSearchParams): string {
  const queryString = searchParams.toString();
  return `${API_URL}/${path}${queryString ? `?${queryString}` : ""}`;
}

async function buildHeaders(request: NextRequest): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

function extractPath(pathname: string): string {
  const prefix = "/api/";
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length);
  }
  return pathname;
}

async function setAuthCookies(response: Response, cookieNames: string[]) {
  const cookieStore = await cookies();
  try {
    const body = await response.clone().json();

    for (const name of cookieNames) {
      if (name === "permissions" && body.permissions) {
        cookieStore.set(name, JSON.stringify(body.permissions), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      } else if (body[name]) {
        cookieStore.set(name, body[name], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      } else if (body.access_token && name === AUTH_COOKIE) {
        cookieStore.set(name, body.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }
    }
  } catch {
    // Response body may not be JSON (e.g., for auth endpoints returning tokens)
  }
}

async function deleteAuthCookies(cookieNames: string[]) {
  const cookieStore = await cookies();
  for (const name of cookieNames) {
    cookieStore.delete(name);
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const path = extractPath(request.nextUrl.pathname);
  const method = request.method;
  const searchParams = request.nextUrl.searchParams;
  const backendUrl = buildBackendUrl(path, searchParams);

  try {
    const headers = await buildHeaders(request);

    const body =
      method !== "GET" && method !== "HEAD"
        ? await request.text()
        : undefined;

    const contentType = request.headers.get("content-type") || "";

    const fetchHeaders: Record<string, string> = {
      ...headers,
    };

    if (body && !contentType.includes("multipart/form-data")) {
      fetchHeaders["Content-Type"] = contentType || "application/json";
    }

    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      cache: "no-store",
    };

    if (body) {
      fetchOptions.body = body;
    }

    const response = await fetch(backendUrl, fetchOptions);

    // Handle auth cookie operations
    const authConfig = AUTH_ROUTES[path];
    if (authConfig && response.ok) {
      if (authConfig.setCookies) {
        await setAuthCookies(response, authConfig.setCookies);
      }
      if (authConfig.deleteCookies) {
        await deleteAuthCookies(authConfig.deleteCookies);
      }
    }

    // Handle 401 — delete auth cookie
    if (response.status === 401) {
      await deleteAuthCookies([AUTH_COOKIE, "name", "permissions"]);
    }

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`Proxy error for ${method} ${path}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
