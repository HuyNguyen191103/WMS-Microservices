import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/home",
  "/default",
  "/products",
  "/warehouses",
  "/activity-logs",
  "/inbound",
  "/outbound",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/activity-logs")) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      const data = (await response.json()) as {
        user?: { roles?: { role_name?: string }[] };
      };
      const roles = (data.user?.roles ?? []).map((role) =>
        (role.role_name ?? "").toUpperCase(),
      );

      if (!roles.some((role) => ["ADMIN", "DIRECTOR"].includes(role))) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/default/:path*",
    "/products/:path*",
    "/warehouses/:path*",
    "/activity-logs/:path*",
    "/inbound/:path*",
    "/outbound/:path*",
  ],
};
