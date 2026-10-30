// Builds public/geo/brazil-states.2025.topo.json from the IBGE state mesh (shapefile).
//
//   node scripts/geo/build-brazil-states.mjs <path/to/BR_UF_2025.shp>
//
// Source: IBGE, Malha Territorial 2025, unidades da federação (BR_UF_2025.zip, shapefile,
// SIRGAS 2000 geographic, EPSG:4674). The IBGE README says that using the mesh implies accepting
// its Nota Metodológica. Credit shown on screen: "IBGE, Malha Territorial 2025".
// The shapefile is third-party data: it is only parsed by mapshaper, never executed.
import { spawnSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const MAPSHAPER = "mapshaper@0.7.101";
const SIMPLIFY = "3%"; // Visvalingam, keep-shapes: every state keeps its islands and its shape
const QUANTIZATION = 10000;
const MAX_GZIP_BYTES = 150_000;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/geo/build-brazil-states.mjs <BR_UF_2025.shp>");
  process.exit(1);
}
const out = resolve(root, "public/geo/brazil-states.2025.topo.json");

const win = process.platform === "win32";
// On Windows npx is a .cmd and needs a shell, which splits paths with spaces: quote every argument.
const q = (arg) => (win ? JSON.stringify(arg) : arg);
const run = spawnSync(
  "npx",
  [
    "--yes",
    MAPSHAPER,
    resolve(input),
    "-simplify",
    "visvalingam",
    SIMPLIFY,
    "keep-shapes",
    "-filter-fields",
    "SIGLA_UF,NM_UF,SIGLA_RG",
    "-rename-fields",
    "uf=SIGLA_UF,name=NM_UF,region=SIGLA_RG",
    "-o",
    out,
    "format=topojson",
    `quantization=${QUANTIZATION}`,
    "id-field=uf",
  ].map(q),
  { stdio: "inherit", shell: win },
);
if (run.status !== 0) process.exit(run.status ?? 1);

const topo = JSON.parse(readFileSync(out, "utf8"));
const layer = Object.values(topo.objects)[0];
const gz = gzipSync(readFileSync(out), { level: 9 }).length;
if (layer.geometries.length !== 27)
  throw new Error(`expected 27 states, got ${layer.geometries.length}`);
if (gz > MAX_GZIP_BYTES)
  throw new Error(`file is ${gz} bytes gzipped, budget is ${MAX_GZIP_BYTES}`);

writeFileSync(
  out.replace(".topo.json", ".source.json"),
  `${JSON.stringify(
    {
      file: "brazil-states.2025.topo.json",
      source: "IBGE, Malha Territorial 2025, unidades da federação (BR_UF_2025.zip)",
      sourceUrl:
        "https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/",
      attribution: "IBGE, Malha Territorial 2025",
      version: "2025",
      sourceCrs: "SIRGAS 2000 geographic (EPSG:4674); coordinates kept as longitude/latitude",
      format: "TopoJSON, object key = first layer, one geometry per state, id = UF code",
      properties: { uf: "SIGLA_UF", name: "NM_UF", region: "SIGLA_RG" },
      simplification: `${MAPSHAPER}: -simplify visvalingam ${SIMPLIFY} keep-shapes; quantization ${QUANTIZATION}`,
      sourceBytes: statSync(resolve(input)).size,
      bytes: statSync(out).size,
      gzipBytes: gz,
      note: "Simplified for a thematic map: not for measuring areas or borders.",
    },
    null,
    2,
  )}\n`,
);
console.log(
  `${out}: ${statSync(out).size} bytes, ${gz} gzipped, ${layer.geometries.length} states`,
);
