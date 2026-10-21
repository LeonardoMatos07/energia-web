import Link from "next/link";
import { Container, Notice, PageHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { MOTIVOS } from "@/lib/motivos";

export const metadata = pageMetadata({
  title: "Metodologia",
  description:
    "De onde vêm os dados (ONS), como o corte é distribuído entre usinas, como estimamos a perda em R$ e quais são as limitações.",
  path: "/metodologia",
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6">
      {children}
    </h2>
  );
}

export default function MetodologiaPage() {
  return (
    <Container>
      <PageHeader title="Metodologia">
        <p>
          Como transformamos os dados abertos do ONS nos números deste site — e onde eles têm
          limites.
        </p>
      </PageHeader>

      <div className="prose prose-neutral max-w-3xl prose-a:text-[var(--color-accent)]">
        <H2 id="o-que-e">O que é curtailment</H2>
        <p>
          <em>Curtailment</em> (ou <em>constrained-off</em>) é quando o Operador Nacional do
          Sistema Elétrico (ONS) manda uma usina produzir menos do que ela poderia. A usina tem
          vento ou sol, está disponível, mas a energia não é aproveitada. Medimos esse corte em
          megawatts-hora (MWh) ou gigawatts-hora (GWh; 1 GWh = 1.000 MWh).
        </p>
        <p>
          O <strong>percentual de corte</strong> é a energia cortada dividida pela soma da energia
          gerada com a energia cortada: <code>cortada ÷ (verificada + cortada) × 100</code>.
        </p>

        <H2 id="fontes">De onde vêm os dados</H2>
        <p>
          Todos os números vêm do{" "}
          <a href="https://dados.ons.org.br/" rel="noopener noreferrer" target="_blank">
            portal de dados abertos do ONS
          </a>
          , nos conjuntos de <strong>restrição de operação por constrained-off</strong> de usinas
          eólicas e fotovoltaicas. Para cada usina ou conjunto e cada intervalo de tempo, o ONS
          publica a geração verificada, a geração de referência e a{" "}
          <strong>geração não realizada (GNRa)</strong> — a energia que deixou de ser produzida por
          causa da restrição — junto com o motivo da restrição.
        </p>
        <p>
          Os arquivos são baixados automaticamente, guardados sem alteração e processados todo mês.
          Os totais por estado, subsistema e Brasil são somas desses dados.
        </p>

        <H2 id="motivos">Motivos de restrição</H2>
        <p>O ONS classifica cada restrição em um motivo. Agrupamos assim:</p>
        <ul>
          {MOTIVOS.map((m) => (
            <li key={m.key}>
              <strong>
                {m.nome} ({m.sigla})
              </strong>
              : {m.explicacao}
            </li>
          ))}
        </ul>

        <H2 id="rateio">Como o corte é distribuído entre as usinas</H2>
        <p>
          Muitas usinas são operadas pelo ONS em <strong>conjuntos</strong> — grupos de usinas
          ligadas ao mesmo ponto da rede. Nesses casos, o número oficial do ONS é o do conjunto, não
          o de cada usina. Para chegar à usina, fazemos um rateio em duas etapas:
        </p>
        <ol>
          <li>
            <strong>Por motivo:</strong> a GNRa oficial do conjunto em cada intervalo é dividida
            entre os motivos (REL, CNF, ENE, outros) na proporção dos minutos em que cada motivo
            esteve ativo.
          </li>
          <li>
            <strong>Por usina:</strong> a parte de cada motivo é distribuída entre as usinas do
            conjunto na proporção da perda estimada de cada uma — calculada a partir dos dados da
            própria usina (quanto ela poderia ter gerado menos o que gerou).
          </li>
        </ol>
        <p>
          O rateio é <strong>conservativo</strong>: a soma das usinas é sempre igual ao total
          oficial do conjunto, e os totais por estado e do Brasil batem com o ONS. Usinas
          despachadas individualmente pelo ONS não passam por rateio.
        </p>

        <H2 id="perda">Como estimamos a perda em R$</H2>
        <p>
          A perda estimada multiplica a energia cortada em cada período por um preço de referência
          do submercado da usina: o <strong>PLD</strong> (Preço de Liquidação das Diferenças, da
          CCEE) ou o <strong>CMO</strong> (Custo Marginal de Operação, do ONS). A página de cada
          usina mostra qual base predominou no mês; quando faltavam preços em parte do mês e as
          lacunas precisaram ser preenchidas, isso também é indicado.
        </p>
        <Notice>
          <strong>Premissa em validação.</strong> Esse valor é uma ordem de grandeza, não o prejuízo
          contábil de cada empresa. A receita real depende de contratos, do mercado em que a usina
          vende a energia e de eventuais ressarcimentos regulatórios, que não estão nos dados
          públicos. Ainda estamos validando a premissa de preço; os valores podem ser recalculados.
        </Notice>

        <H2 id="limitacoes">Limitações dos dados</H2>
        <ul>
          <li>
            <strong>Solar só a partir de abril de 2024.</strong> O ONS passou a publicar dados de
            restrição de usinas fotovoltaicas a partir desse mês. Antes disso, só há dados de
            eólicas — compare séries com cuidado.
          </li>
          <li>
            <strong>Meses recentes podem mudar.</strong> O ONS revisa os dados depois de
            publicá-los. Reprocessamos os meses recentes a cada carga, então os números podem
            mudar.
          </li>
          <li>
            <strong>Valores por usina em conjuntos são estimados.</strong> Veja o rateio acima.
          </li>
          <li>
            <strong>Cadastro.</strong> Nomes, potência e agentes vêm dos cadastros públicos e podem
            estar desatualizados.
          </li>
        </ul>

        <H2 id="atualizacao">Atualização</H2>
        <p>
          Os dados são processados quando o ONS publica novos arquivos. Ao fim de cada carga, as
          páginas do site são atualizadas automaticamente. Para receber um resumo mensal, assine a{" "}
          <Link href="/#newsletter">newsletter</Link>.
        </p>

        <H2 id="privacidade">Privacidade</H2>
        <p>
          Não há login público nem cookies de rastreamento. Se você assinar a newsletter, guardamos
          apenas seu e-mail e a data do seu consentimento, para o único fim de enviar os resumos
          (LGPD, art. 7º, I). A inscrição só vale depois que você confirma pelo link enviado por
          e-mail, e todo e-mail tem um link para cancelar em um clique. As estatísticas de visitas,
          quando ativas, são agregadas e não usam cookies.
        </p>
      </div>
    </Container>
  );
}
