import { createAsync } from "@solidjs/router";
import { getUser } from "~/lib";

export default function Manage() {
  const user = createAsync(() => getUser(), { deferStream: true });
  return (
    <div>
      <h1>{user()?.name}</h1>
    </div>
  );
}
