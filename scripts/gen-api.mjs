import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "src/lib/api/schema.d.ts");
const localFile = resolve(root, "../spillway-api/openapi.json");

function pickSource() {
  const fromEnv = process.env.OPENAPI_SOURCE;
  if (fromEnv)
    return /^https?:\/\//.test(fromEnv) ? new URL(fromEnv) : pathToFileURL(resolve(fromEnv));
  if (existsSync(localFile)) return pathToFileURL(localFile);
  return new URL("http://localhost:8000/openapi.json");
}

function withoutComments(code) {
  const source = ts.createSourceFile("schema.d.ts", code, ts.ScriptTarget.Latest, true);
  return ts.createPrinter({ removeComments: true }).printFile(source);
}

const source = pickSource();
console.log(`Generating types from ${source.href}`);
try {
  const ast = await openapiTS(source);
  await writeFile(output, withoutComments(astToString(ast)), "utf8");
  console.log(`OK: ${output}`);
} catch (error) {
  console.error(`Failed to generate the types: ${error instanceof Error ? error.message : error}`);
  console.error(
    "Export the schema in spillway-api (uv run python -m app.export_openapi openapi.json) or start the API on http://localhost:8000.",
  );
  process.exit(1);
}
