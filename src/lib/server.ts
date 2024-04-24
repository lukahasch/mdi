import { useSession } from "vinxi/http";
import { db } from "./db";

/// this is unsafe cause names could be double but this is a school project so it's fin
export async function login(name: string[], password: string) {
  const user = await db.user.find(name);
  if (!user || user.password !== password) throw new Error("Invalid login");
  return user;
}

export async function logout() {
  const session = await getSession();
  await session.update((d) => (d.userId = undefined));
}

export async function register(name: string[], password: string) {
  const user = await db.user.create(name, password, false, []);
  return user;
}

export function getSession() {
  return useSession({
    password:
      process.env.SESSION_SECRET ?? "TEST1234&&TEST5678&ABCDEFGHIJKLMNOP",
  });
}
