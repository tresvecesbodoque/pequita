import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Si ya hay sesión válida, no tiene sentido mostrar el login.
  if (await isAuthenticated()) {
    redirect(next || "/editor");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <LoginForm next={next ?? "/editor"} />
    </main>
  );
}
