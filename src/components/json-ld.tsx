/** Renders schema.org structured data. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
    /</g,
    "\\u003c",
  );
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
