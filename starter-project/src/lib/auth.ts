import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { User } from "@prisma/client";
import { prisma } from "./db";
import { isRole, type Role } from "./constants";

const COOKIE_NAME = "hrms_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return process.env.AUTH_SECRET || "workshop-dev-secret-change-me";
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function makeToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): number | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      uid: number;
      exp: number;
    };
    if (decoded.exp < Date.now()) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// The home route for a given role, used after login and for redirects.
export function roleHome(role: Role): string {
  switch (role) {
    case "EMPLOYEE":
      return "/employee";
    case "SUPERVISOR":
      return "/supervisor";
    case "HR":
      return "/hr";
    case "ADMIN":
      return "/admin";
  }
}

// Reads the signed session cookie and returns the current user, or null.
export async function getCurrentUser(): Promise<User | null> {
  // Ensure the session check (which uses Date.now() for expiry) runs at request
  // time rather than during prerendering.
  await connection();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

// Requires a logged-in user, otherwise redirects to /login.
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Requires a logged-in user with one of the given roles, otherwise redirects
// to the login page or to the user's own home route.
export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!isRole(user.role) || !roles.includes(user.role)) {
    redirect(roleHome(user.role as Role));
  }
  return user;
}

// Starts a session by writing the signed cookie. Only call from a server
// action or route handler.
export async function startSession(user: User): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

// Ends a session by deleting the cookie. Only call from a server action or
// route handler.
export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
