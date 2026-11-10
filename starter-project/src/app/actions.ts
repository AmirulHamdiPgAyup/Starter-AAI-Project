"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { startSession, endSession, roleHome } from "@/lib/auth";
import { verifyHCaptcha } from "@/lib/captcha";
import type { Role } from "@/lib/constants";

// Server actions: functions that run on the server when a button is pressed.
// The Leave Request module adds its own actions here in Session 2.

export type ActionResult = { error?: string; ok?: boolean; message?: string };

// Design §12c: the human check runs BEFORE any credential is looked at, and
// fails closed — anything but an explicit "success" from hCaptcha refuses
// the request (missing token, bad token, unreachable service).
const CAPTCHA_ERROR = "Please complete the CAPTCHA challenge.";

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const captchaOk = await verifyHCaptcha(
    String(formData.get("h-captcha-response") ?? ""),
  );
  if (!captchaOk) {
    return { error: CAPTCHA_ERROR };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await startSession(user);
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-out layout and land on the dashboard with no frame.
  revalidatePath("/", "layout");
  redirect(roleHome(user.role as Role));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  // The sidebar frame lives in the root layout; without this the client can
  // reuse the cached logged-in layout and show the frame around the login page.
  revalidatePath("/", "layout");
  redirect("/login");
}

// Self sign-up (design §12b, requirements U13/AC-24..26). The role is pinned
// to EMPLOYEE here — the form has no role field and nothing posted by the
// browser can choose another one.
export async function signupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const captchaOk = await verifyHCaptcha(
    String(formData.get("h-captcha-response") ?? ""),
  );
  if (!captchaOk) {
    return { error: CAPTCHA_ERROR };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const division = String(formData.get("division") ?? "").trim();

  if (!name || !email || !password || !division) {
    return { error: "Please fill in every field." };
  }
  if (password.length < 8) {
    return { error: "The password must be at least 8 characters." };
  }
  // The dropdown offers only divisions that already exist; re-check it here.
  const divisionInUse = await prisma.user.findFirst({ where: { division } });
  if (!divisionInUse) {
    return { error: "Choose a division from the list." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "EMPLOYEE",
        division,
        designation: "",
        identificationNo: "",
      },
    });
  } catch (err) {
    // P2002 = unique violation on email (also covers two people signing up
    // at the same moment); anything else is a real failure and must surface.
    if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    throw err;
  }

  await startSession(user);
  revalidatePath("/", "layout");
  redirect("/employee?joined=1");
}
