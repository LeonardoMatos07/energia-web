"use client";

import { useEffect } from "react";
import { Container, PageHeader } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <PageHeader title="Algo deu errado">
        <p>Não conseguimos montar esta página agora. Tente de novo em instantes.</p>
      </PageHeader>
      <button
        type="button"
        onClick={reset}
        className="bg-accent text-on-accent rounded-md px-4 py-2 font-semibold"
      >
        Tentar novamente
      </button>
    </Container>
  );
}
