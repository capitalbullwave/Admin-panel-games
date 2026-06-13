import { redirect } from "next/navigation";

export default function Home() {
  // Redirect the root page to the admin dashboard (or login)
  redirect("/login");
}
