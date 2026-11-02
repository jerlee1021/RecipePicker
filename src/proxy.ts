import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Stopgap lock: one shared password via HTTP Basic Auth, checked before every
// page and server action. Real user accounts come in Milestone 4.
export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;

  // Fail closed: if the password isn't configured, nobody gets in.
  if (!password) {
    return new NextResponse("APP_PASSWORD is not set", { status: 500 });
  }

  if (getBasicAuthPassword(request) === password) {
    return NextResponse.next();
  }

  // 401 plus WWW-Authenticate makes the browser show its built-in login prompt.
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Recipe Planner"' },
  });
}

// The header looks like "Basic <base64 of username:password>". The username is ignored.
function getBasicAuthPassword(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return null; // malformed base64
  }
  const colon = decoded.indexOf(":");
  return colon === -1 ? null : decoded.slice(colon + 1);
}

export const config = {
  // Run on everything except static build files and the favicon.
  // Server actions POST to page URLs, so they're covered too.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
