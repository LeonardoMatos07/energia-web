import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { Container, PageHeader } from "@/components/ui";
import { getCurrentMember } from "@/lib/members";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Criar conta gratuita",
  description:
    "Crie sua conta gratuita no Spillway para acessar o painel, a comparação de usinas, os relatórios mensais e as análises de curtailment.",
  path: "/cadastro",
});

const BENEFITS = [
  "Painel nacional com filtro de período",
  "Comparação de usinas, estados e subsistemas",
  "Um relatório para cada mês",
  "Análises: corte compensável, ranking por empresa e perfil horário",
];

export default async function SignupPage() {
  if (await getCurrentMember()) redirect("/painel");
  return (
    <Container>
      <PageHeader eyebrow="Acesso gratuito" title="Crie sua conta no Spillway">
        <p>
          Em troca de algumas informações sobre você, liberamos todas as funcionalidades. Isso nos
          ajuda a saber quem usa o site e o que mais interessa.
        </p>
      </PageHeader>
      <div className="grid gap-10 pb-12 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-3xl">
          <SignupForm />
        </div>
        <aside className="border-grid bg-surface shadow-card h-fit rounded-2xl border p-5 text-sm">
          <h2 className="text-base font-semibold">O que você libera</h2>
          <ul className="text-ink-2 mt-3 space-y-2">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span aria-hidden className="text-accent">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <p className="text-muted mt-4 text-xs">
            Os dados que você informa ficam protegidos pela LGPD. Você pode excluir sua conta a
            qualquer momento.
          </p>
        </aside>
      </div>
    </Container>
  );
}
