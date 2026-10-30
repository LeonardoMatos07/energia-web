import { ForecastFilters } from "@/components/forecast/forecast-filters";
import { ForecastResults } from "@/components/forecast/forecast-results";
import { ForecastView } from "@/components/forecast/forecast-view";
import { ProgressReveal } from "@/components/progress-reveal";
import { Container, DataUnavailable, PageHeader, Section } from "@/components/ui";
import { getForecast, getForecastModel, getForecastScopes } from "@/lib/api/queries";
import {
  groupScopes,
  parseScope,
  parseSource,
  scopeLabel,
  SOURCE_LABEL,
  windowLabel,
} from "@/lib/forecast";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Previsão de corte de energia",
  description:
    "Risco de corte de geração eólica e solar hora a hora nos próximos 7 dias, com os resultados do treino do modelo explicados.",
  path: "/previsao",
  noIndex: true,
});

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const source = parseSource(first(params.fonte));
  const [scopesResult, model] = await Promise.all([getForecastScopes(), getForecastModel()]);
  const scopes = scopesResult.ok ? scopesResult.data : [];
  const scope = parseScope(first(params.escopo), source, scopes);

  const forecast = await getForecast(scope, source);
  const groups = groupScopes(scopes, source);

  return (
    <Container>
      <PageHeader
        eyebrow="Previsão"
        title={
          forecast.ok
            ? `Risco de corte de energia: semana de ${windowLabel(forecast.data.valid_from, forecast.data.valid_to)}`
            : "Risco de corte de energia nos próximos dias"
        }
      >
        <p>
          Quando eólicas e solares costumam ser mandadas a gerar menos do que poderiam? Veja, hora a
          hora, o risco estimado para a região escolhida e, mais abaixo, como o modelo foi treinado
          e testado, com os limites dele.
        </p>
      </PageHeader>

      <ProgressReveal>
        <Section
          id="previsao"
          title={`${SOURCE_LABEL[source]}: ${scopeLabel(scope)}`}
          description="Escolha a fonte e a região para ver os próximos dias."
        >
          {groups.length > 0 ? (
            <div className="mb-6">
              <ForecastFilters source={source} scope={scope} groups={groups} />
            </div>
          ) : null}
          {forecast.ok ? (
            <ForecastView forecast={forecast.data} />
          ) : forecast.error.isNotFound ? (
            <DataUnavailable title="Ainda não há previsão para esta escolha">
              Nenhuma previsão foi publicada para esta fonte e região. Tente outra região ou volte
              mais tarde.
            </DataUnavailable>
          ) : (
            <DataUnavailable title="Previsão indisponível no momento">
              Não conseguimos carregar a previsão agora. Os demais dados do site continuam
              funcionando; tente novamente em alguns minutos.
            </DataUnavailable>
          )}
        </Section>

        <Section id="resultados" title="Como o modelo funciona e o que ele entrega">
          {model.ok ? (
            <ForecastResults meta={model.data} />
          ) : model.error.isNotFound ? (
            <DataUnavailable title="Resultados do treino ainda não publicados">
              Assim que o primeiro modelo for publicado, os resultados dos testes aparecem aqui.
            </DataUnavailable>
          ) : (
            <DataUnavailable title="Resultados do treino indisponíveis no momento" />
          )}
        </Section>
      </ProgressReveal>
    </Container>
  );
}
