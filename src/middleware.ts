import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "./lib/auth";

const authRoutes = ["/login", "/crear-cuenta"];
const passwordRoutes = ["/resetear-clave", "/olvide-mi-clave", "/reset-password"];
const adminRoutes = ["/admin"];
const publicRoutes = ["/", "/about", "/contact", "/buscar-viaje"];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isAdminRoute = adminRoutes.some(route => pathName.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathName === route);

  // Manual cookie parsing as temporary workaround
  const cookieHeader = request.headers.get("cookie");
  const cookies = cookieHeader?.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc.set(key, value);
    return acc;
  }, new Map());

  const sessionCookie =
    cookies?.get("better-auth.session_token") ||
    cookies?.get("__Secure-better-auth.session_token");



  // If user is not authenticated
  if (!sessionCookie) {
    // Allow access to auth, password reset, and public routes
    if (isAuthRoute || isPasswordRoute || isPublicRoute) {
      return NextResponse.next();
    }

    // For protected routes, redirect to login with the intended URL as redirect_url parameter
    const url = request.nextUrl.clone();
    const intendedUrl = url.pathname + url.search;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", intendedUrl);

    return NextResponse.redirect(loginUrl);
  }


  // User is authenticated but trying to access auth or password routes
  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // User trying to access admin routes without admin role
  if (isAdminRoute) {

    const { data: session } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!session || session.user.role !== "admin") {

      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Allow access to all other routes for authenticated users
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico|sw.js|manifest.webmanifest|.*\\.json$).*)'],
};