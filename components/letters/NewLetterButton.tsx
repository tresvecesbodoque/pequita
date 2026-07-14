"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLetter } from "@/lib/actions/letters";
import { Button } from "@/components/ui/Button";

export function NewLetterButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const letter = await createLetter();
      router.push(`/editor/${letter.id}`);
    });
  }

  return (
    <Button onClick={handleCreate} disabled={pending}>
      {pending ? "Creando…" : "✦ Nueva carta"}
    </Button>
  );
}
