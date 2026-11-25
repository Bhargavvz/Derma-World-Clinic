import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE } from "./lib/auth/constants";

const intl = createIntlMiddleware(routing);

function buildCsp(nonce: string, isAdmin: boolean): string {
  const dev = process.env.NODE_ENV !== "production";
  const emulator = process.env.USE_FIREBASE_EMULATORS === "true" ? " http://127.0.0.1:* ws://127.0.0.1:*" : "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? ` https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}` : "";
  const ga = isAdmin ? "" : " https://www.googletagmanager.com";
  const gaConnect = isAdmin ? "" : " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/${ga}${
      isAdmin ? " https://apis.google.com" : ""
    }${dev ? " 'unsafe-eval'" : ""}`,
    // next/image and next/font emit inline style attributes; scripts never get 'unsafe-inline'.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com${gaConnect}`,
    "font-src 'self'",
    `connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseappcheck.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google.com https://firebasestorage.googleapis.com${gaConnect}${emulator}${
      dev ? " ws:" : ""
    }`,
    `frame-src https://www.google.com https://recaptcha.google.com${authDomain}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/** Forward extra request headers to the app (same mechanism as NextResponse.next({ request: { headers } })). */
function forwardRequestHeaders(res: NextResponse, req: NextRequest, extra: Record<string, string>) {
  const merged = new Headers(req.headers);
  const existing = res.headers.get("x-middleware-override-headers");
  if (existing) {
    for (const name of existing.split(",")) {
      const v = res.headers.get(`x-middleware-request-${name}`);
      if (v !== null) merged.set(name, v);
    }
  }
  for (const [k, v] of Object.entries(extra)) merged.set(k, v);
  const names: string[] = [];
  merged.forEach((v, k) => {
    names.push(k);
    res.headers.set(`x-middleware-request-${k}`, v);
  });
  res.headers.set("x-middleware-override-headers", names.join(","));
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const csp = buildCsp(nonce, isAdmin);

  // Trailing slash → no slash (301).
  if (pathname.length > 1 && pathname.endsWith("/")) {
    // Build the URL by hand: NextURL can re-apply the trailing slash when serialised.
    const target = new URL(pathname.replace(/\/+$/, "") + req.nextUrl.search, req.url);
    return NextResponse.redirect(target.toString(), 301);
  }

  let res: NextResponse;
  if (isAdmin) {
    const isLogin = pathname === "/admin/login";
    if (!isLogin && !req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  } else {
    res = intl(req);
  }

  forwardRequestHeaders(res, req, { "x-nonce": nonce, "content-security-policy": csp });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
