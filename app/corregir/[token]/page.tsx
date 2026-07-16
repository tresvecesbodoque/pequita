import type { Metadata } from "next";
import Link from "next/link";
import { getEditableLetter } from "@/lib/actions/guest";
import { NavBar } from "@/components/layout/NavBar";
import { CorregirForm } from "./CorregirForm";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Corregir tu carta" };

export default async function CorregirPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const letter = await getEditableLetter(token);

  return (
    <main className="maximal-tile flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <NavBar />
      {!letter ? (
        <Message
          emoji="🔍"
          title="No encontramos esa carta"
          body="El enlace no es válido o la carta ya no existe."
        />
      ) : letter.published ? (
        <Message
          emoji="🌟"
          title="Ya está en el álbum"
          body={`Tu carta ya fue revisada y publicada en el álbum de ${SITE.recipientName}, así que ya no se puede editar.`}
        />
      ) : (
        <CorregirForm
          token={token}
          initialMessage={letter.message}
          recipientName={SITE.recipientName}
        />
      )}
    </main>
  );
}

function Message({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="sketch-card sketch-card--gira max-w-lg p-8 text-center sm:p-10">
      <div className="text-4xl">{emoji}</div>
      <h1 className="mt-3 text-3xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-[var(--muted)]">{body}</p>
      <Link href="/" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
