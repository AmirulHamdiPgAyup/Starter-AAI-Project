import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { isRole } from "@/lib/constants";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isRole(user.role)) redirect("/login");
  redirect(roleHome(user.role));
}
