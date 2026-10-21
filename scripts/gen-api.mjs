// Generates src/lib/api/schema.d.ts from the energia-api OpenAPI document.
// Source, in order: OPENAPI_SOURCE env (path or URL), ../energia-api/openapi.json,
// http://localhost:8000/openapi.json.
// In energia-api: `uv run python -m app.export_openapi openapi.json` writes the file.
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "src/lib/api/schema.d.ts");
const localFile = resolve(root, "../energia-api/openapi.json");

function pickSource() {
  const fromEnv = process.env.OPENAPI_SOURCE;
  if (fromEnv)
    return /^https?:\/\//.test(fromEnv) ? new URL(fromEnv) : pathToFileURL(resolve(fromEnv));
  if (existsSync(localFile)) return pathToFileURL(localFile);
  return new URL("http://localhost:8000/openapi.json");
}

const source = pickSource();
console.log(`Gerando tipos a partir de ${source.href}`);
try {
  const ast = await openapiTS(source);
  const header = "// Arquivo gerado por `pnpm gen:api` (openapi-typescript). Não edite à mão.\n\n";
  await writeFile(output, header + astToString(ast), "utf8");
  console.log(`OK: ${output}`);
} catch (error) {
  console.error(`Falha ao gerar os tipos: ${error instanceof Error ? error.message : error}`);
  console.error(
    "Exporte o schema no energia-api (uv run python -m app.export_openapi openapi.json) ou suba a API em http://localhost:8000.",
  );
  process.exit(1);
}
