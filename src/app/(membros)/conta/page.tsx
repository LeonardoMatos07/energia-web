import { DeleteAccountForm } from "@/components/auth-forms";
import { Container, PageHeader, Section } from "@/components/ui";
import { requireMember } from "@/lib/members";
import { INTEREST_OPTIONS, ROLE_OPTIONS, SEGMENT_OPTIONS } from "@/lib/member-options";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Minha conta",
  description: "Dados da sua conta no Spillway.",
  path: "/conta",
  noIndex: true,
});

function label(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? null;
}

export default async function AccountPage() {
  const member = await requireMember("/conta");
  const rows: [string, string | null][] = [
    ["Nome", member.name],
    ["E-mail", member.email],
    ["Perfil", label(ROLE_OPTIONS, member.role)],
    ["Empresa", member.organization],
    ["Cargo ou área", member.job_title],
    ["Segmento", label(SEGMENT_OPTIONS, member.segment)],
    ["Instituição", member.institution],
    ["Regiões de interesse", member.regions.join(", ") || null],
    [
      "Interesses",
      member.interests
        .map((interest) => label(INTEREST_OPTIONS, interest))
        .filter(Boolean)
        .join(", ") || null,
    ],
  ];

  return (
    <Container>
      <PageHeader title="Minha conta" />
      <Section id="dados" title="Seus dados">
        <dl className="border-grid bg-surface grid max-w-2xl gap-x-6 gap-y-3 rounded-2xl border p-5 sm:grid-cols-[10rem_1fr]">
          {rows
            .filter(([, value]) => value)
            .map(([name, value]) => (
              <div key={name} className="contents">
                <dt className="text-ink-2 text-sm">{name}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      </Section>
      <Section id="excluir" title="Privacidade">
        <div className="max-w-2xl">
          <DeleteAccountForm />
        </div>
      </Section>
    </Container>
  );
}
