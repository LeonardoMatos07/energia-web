import Link from "next/link";
import { StatesMapPanel } from "@/components/maps/states-map-panel";
import { Card, DataUnavailable, Notice, PageHeader } from "@/components/ui";
import { getGeoStatesCurtailment } from "@/lib/api/queries";
import { parseStatesMapParams } from "@/lib/maps";
import { getCurrentMember } from "@/lib/members";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Mapa do curtailment por estado",
  description:
    "Mapa do Brasil com o corte de energia eólica e solar em cada estado, mês a mês, com tabela equivalente.",
  path: "/mapas/estados",
  noIndex: true,
});

export default async function StatesMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseStatesMapParams(await searchParams);
  const member = await getCurrentMember();

  if (!member) {
    const next = `/mapas/estados${params.mes ? `?mes=${params.mes}` : ""}`;
    return (
      <>
        <PageHeader title="Curtailment por estado, no mapa">
          <p>O mapa usa os mesmos dados da página Estados e é parte da área de contas gratuitas.</p>
        </PageHeader>
        <Card className="max-w-2xl p-6">
          <h2 className="text-ink text-lg font-semibold">
            Crie uma conta gratuita para ver o mapa
          </h2>
          <p className="text-ink-2 mt-2 text-sm leading-6">
            Com a conta você vê o mapa do Brasil por mês, a tabela dos 27 estados e as páginas de
            cada estado e usina. Leva um minuto e não custa nada.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/cadastro"
              className="bg-accent text-on-accent inline-flex min-h-11 items-center rounded-lg px-5 font-medium"
            >
              Criar conta gratuita
            </Link>
            <Link
              href={`/entrar?proximo=${encodeURIComponent(next)}`}
              className="border-line hover:bg-surface-2 inline-flex min-h-11 items-center rounded-lg border px-5 font-medium"
            >
              Já tenho conta: entrar
            </Link>
          </div>
        </Card>
      </>
    );
  }

  const result = await getGeoStatesCurtailment(params.fonte, params.mes ?? undefined);

  return (
    <>
      <PageHeader title="Curtailment por estado, no mapa">
        <p>
          Quanto da energia eólica e solar foi cortada em cada estado, mês a mês. A tabela abaixo do
          mapa traz os mesmos números.
        </p>
      </PageHeader>
      {result.ok ? (
        <>
          <Notice>
            Os valores são os publicados pelo ONS somados por estado; estados sem usinas eólicas ou
            solares despachadas pelo ONS ficam sem cor.
          </Notice>
          <div className="mt-5 pb-12">
            <StatesMapPanel initial={result.data} initialMetric={params.metrica} />
          </div>
        </>
      ) : (
        <DataUnavailable />
      )}
    </>
  );
}
