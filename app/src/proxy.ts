import { auth } from "@/auth";

const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/login",
  "/terms",
  "/privacy",
  "/api/auth",
  "/api/stripe/webhook",
  "/api/health",
  "/status",
];

// next-auth v5 beta: overload resolution doesn't infer req type in strict mode

export default auth((req: any) => {
  const pathname = req.nextUrl.pathname;

  // Logged-in users visiting /login → redirect to dashboard
  if (pathname === "/login" && req.auth) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // Public paths — no auth needed
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return;
  }

  // Unauthenticated → redirect to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // Admin routes require ADMIN role
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    req.auth.user?.role !== "ADMIN"
  ) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  // The proxy buffers request bodies before it runs. The upload routes skip it, so they must check
  // the session and Content-Length themselves before they read the body.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/content/upload$|api/admin/courses$).*)"],
};
