/** Credit for the ONS open data (dados.ons.org.br), shown under every block that uses it. */
export function OnsAttribution({ dataset }: { dataset: string }) {
  return (
    <p className="text-muted mt-3 text-xs leading-5" data-testid="ons-attribution">
      Fonte: Operador Nacional do Sistema Elétrico (ONS), dados abertos, {dataset}. Termos de uso e
      licença de cada conjunto em{" "}
      <a
        className="underline underline-offset-2"
        href="https://dados.ons.org.br/"
        target="_blank"
        rel="noopener noreferrer"
      >
        dados.ons.org.br
      </a>
      . Processado pelo Spillway.
    </p>
  );
}
