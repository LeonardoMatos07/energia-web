import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <PageHeader title="Página não encontrada">
        <p>O endereço pode ter mudado ou a usina não existe no cadastro do ONS.</p>
      </PageHeader>
      <p className="flex flex-wrap gap-4">
        <Link href="/" className="text-[var(--color-accent)] underline">
          Ir para o painel
        </Link>
        <Link href="/usinas" className="text-[var(--color-accent)] underline">
          Buscar uma usina
        </Link>
      </p>
    </Container>
  );
}
