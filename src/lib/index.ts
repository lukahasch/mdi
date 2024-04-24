import { action, cache, redirect } from "@solidjs/router";
import { db } from "./db";
import { getSession, login, logout as logoutSession, register } from "./server";

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
    const user = await db.user.get(userId);
    if (!user) throw new Error("User not found");
    return user;
  } catch {
    await logoutSession();
    throw redirect("/login");
  }
}, "user");

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const name: string[] = String(formData.get("name"))
    .split(" ")
    .filter((n) => n.length > 0);
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = db.validatePassword(password);
  if (error) return error;
  try {
    const user =
      loginType === "login"
        ? await login(name, password)
        : await register(name, password);
    const session = await getSession();
    await session.update((d) => (d.userId = user!.id));
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
});
