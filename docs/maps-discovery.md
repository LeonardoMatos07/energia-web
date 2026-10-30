# Mapas do Spillway: Etapa 0 (descoberta)

Data da consulta: 2026-10-30. Licenças avaliadas de forma prática, não jurídica; conferir termos atuais antes de publicar. Nenhum código de produção, conta ou chave foi criado; consultas ao banco foram somente leitura.

## Resumo

| Item                         | Resultado                                                                                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Malha IBGE                   | Malha Territorial 2025 (publicada em 2026-03-26); dados públicos, uso comercial com atribuição ao IBGE (fonte secundária); termos oficiais não puderam ser lidos (site do IBGE devolveu 403) |
| Mapa-base recomendado        | Opção 1, sem mapa-base, para o mapa A; para B/C/D decidir depois (ver seção 2), com PMTiles próprio como caminho sem conta                                                                   |
| Peso medido (MapLibre)       | 301 KB gzip (247 KB brotli) para um mapa mínimo; D3-geo + topojson-client: 9 KB gzip                                                                                                         |
| Coordenadas                  | Reservatórios 158/158; subestações 1.681/1.690 (9 nulas)                                                                                                                                     |
| Casamento usina e subestação | 90,4% das usinas (1.468/1.624), 106 de 125 pontos de conexão distintos                                                                                                                       |
| Geometria ANEEL              | Há camadas no SIGEL (ArcGIS) para geração; linhas de transmissão e áreas de distribuidoras não confirmadas; licença não verificada                                                           |
| Mapa E viável?               | Não confirmado. Depende de o dono verificar o SIGEL (seção 6)                                                                                                                                |

## 1. Malhas do IBGE

| Aspecto   | Achado                                                                                                                                                                                      | Fonte                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Versão    | Malha Territorial 2025 (pasta `municipio_2025`, modificada em 2026-03-26; contém `Brasil/` e `UFs/`)                                                                                        | [geoftp IBGE](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/) (consulta 2026-10-30) |
| Licença   | Arquivos "públicos"; sem licença nomeada. Catálogo do Earth Engine descreve como dado aberto (Lei 12.527/2011), uso, modificação e distribuição inclusive comercial, com atribuição ao IBGE | [Earth Engine IBGE/UF/V2025](https://developers.google.com/earth-engine/datasets/catalog/IBGE_UF_V2025)                          |
| CRS       | Não confirmado nas páginas acessíveis. Esperado SIRGAS 2000 (EPSG:4674), praticamente igual a WGS84 para web; confirmar no metadado do shapefile ao baixar                                  | pendente                                                                                                                         |
| Formato   | Shapefile no geoftp (`UFs/`); a API de malhas v3 serve GeoJSON, TopoJSON e SVG em 3 qualidades, versão 3.0.0, malhas simplificadas, sem termos explícitos                                   | [API malhas](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3)                                                          |
| Bloqueios | Páginas `ibge.gov.br/geociencias/...` e `/termo-de-uso` devolveram 403; `geoftp.ibge.gov.br/robots.txt` deu 404. Não contornado                                                             |                                                                                                                                  |

O que o dono precisa fazer: abrir no navegador a página de malhas e o termo de uso do IBGE, copiar a frase de licença/atribuição, e baixar `UFs` 2025 (shapefile) para o script de `scripts/geo/` (que registra versão e CRS). Alternativa: API v3 com `qualidade=minima` (sem termos explícitos; preferível o shapefile oficial). Atribuição sugerida: "Fonte: IBGE, Malha Territorial 2025".

## 2. Mapa-base (só B, C, D)

| Opção                                           | Termos (fonte, 2026-10-30)                                                                                                                                                                                                                  | Custo/risco                                                                                | Avaliação                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 1. Sem mapa-base                                | n/a                                                                                                                                                                                                                                         | Zero; contornos IBGE sobre fundo liso                                                      | Suficiente para A; em B/C/D perde-se contexto, mas os estados dão referência |
| 2. PMTiles próprio (Protomaps) em S3/CloudFront | Mapa-base é "Produced Work" ODbL, atribuição OSM obrigatória; planeta cerca de 120 GB, `pmtiles extract` recorta região e `--maxzoom` reduz; não fazer hotlink dos builds ([docs Protomaps](https://docs.protomaps.com/basemaps/downloads)) | Sem conta em provedor; custo de armazenamento/egress; tamanho do recorte do Brasil a medir | Melhor de longo prazo; exige tarefa de infra                                 |
| 3a. MapTiler Free                               | Plano gratuito "para teste, PoC, pessoal ou não comercial"; 100 mil requisições/mês; logo obrigatório ([pricing](https://www.maptiler.com/cloud/pricing/))                                                                                  | Uso comercial não coberto; exige conta e chave                                             | Não recomendado                                                              |
| 3b. Stadia Maps Free                            | "Commercial use not allowed" no plano gratuito ([pricing](https://stadiamaps.com/pricing/))                                                                                                                                                 | Idem                                                                                       | Não serve                                                                    |
| Tiles públicos OSM                              | Sem proibição formal de produção, mas best-effort, bloqueio sem aviso; exige User-Agent identificado, Referer, cache; proíbe prefetch e uso pesado ([política](https://operations.osmfoundation.org/policies/tiles/))                       | Risco de bloqueio                                                                          | Não usar, conforme spec                                                      |

Recomendação: começar com a opção 1 em todos os mapas; se B/C/D pedirem mapa-base, planejar a opção 2 em etapa própria. Nenhum provedor com plano gratuito comercial foi confirmado.

## 3. Peso da biblioteca (medido)

Pasta temporária fora do repositório (`maplibre-gl@6.16.0`, `d3-geo@3.1.1`, `topojson-client@3.1.0`), bundle com esbuild (`--bundle --minify --splitting`, ESM). O worker do MapLibre vem dentro do bundle.

| Bundle mínimo                                      | Bruto    | gzip -9 | brotli |
| -------------------------------------------------- | -------- | ------- | ------ |
| MapLibre (cria `Map` com estilo vazio)             | 1.107 KB | 301 KB  | 247 KB |
| D3-geo (`geoMercator`+`geoPath`) + topojson-client | 23,8 KB  | 9,3 KB  | 8,4 KB |

Mais o CSS do MapLibre (não medido; poucos KB). MapLibre passa do alvo de 250 KB do mapa por estado em gzip (301 KB) e fica no limite em brotli (247 KB); a medição real no bundler do Next deve ser refeita na Etapa 1. Para o mapa A (choropleth), D3-geo com SVG custa cerca de 9 KB (3% do peso). Mapas B/C/D (milhares de pontos, zoom) justificam MapLibre (301 KB gzip, abaixo do alvo de 500 KB, com folga para mapa-base).

Decisão para o dono: A em SVG com D3-geo e MapLibre só em B/C/D, contra a proposta da spec de MapLibre em todos. Exige dois caminhos de código, mas respeita o orçamento e dispensa fallback de WebGL no A.

## 4. Cobertura de coordenadas (warehouse local, leitura)

| Tabela                          | Linhas (atuais) | Sem lat/lon | Fora do Brasil | Observação                                                                                                                                                   |
| ------------------------------- | --------------- | ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| substation (`valid_to is null`) | 1.690           | 9 (0,5%)    | 0              | 27 UFs; nenhuma coordenada zero                                                                                                                              |
| reservoir                       | 158             | 0           | 0              | `useful_volume_hm3` preenchido em todos                                                                                                                      |
| transmission_line (atuais)      | 2.337           | n/a         | n/a            | 48 sem subestação de origem ou destino; 2.225 (95,2%) têm as duas pontas casadas com subestação com coordenada (por `station_id`, `substation_id` ou `name`) |

Linhas sem as duas pontas (cerca de 112) ficam fora do mapa C e entram em `meta.omitted`.

## 5. Casamento usina e subestação (mapa D)

Universo: 1.624 usinas (`kind='plant'`: 1.059 eólicas, 565 solares; os 273 clusters têm `connection_point`, mas ficam fora). Todas têm `connection_point` e `ceg`; nenhuma tem coordenada. Casamento: normalização (maiúsculas, sem acento/pontuação), remoção de sufixo de tensão e de `(A)`, comparação do nome com `substation.name` na mesma UF, desempate pela tensão. Script de leitura mantido só no scratchpad da sessão (não versionado).

Dado sujo no `connection_point`: dois formatos, "NOME - 230 kV (A)" e "NOME230kVA" (tensão colada ao nome mais "A" de barra; ex.: "PIRAPORA 2345kVA" = PIRAPORA 2 + 345 kV). Quando o nome termina em dígito o parse erra com facilidade; recomenda-se fazer o parse no data, não no web.

| Métrica                                      | Valor                                                                                                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usinas com casamento                         | 1.468 de 1.624 (90,4%)                                                                                                                                                      |
| Pontos de conexão distintos casados          | 106 de 125 (84,8%)                                                                                                                                                          |
| Por nome+UF / só nome (UF diferente)         | 101 pontos / 5 pontos (os de só nome devem ser descartados por risco)                                                                                                       |
| Casamentos ambíguos (mais de uma subestação) | 28 usinas                                                                                                                                                                   |
| Sem casamento                                | 156 usinas (9,6%), 19 pontos; nome com dígito colado à tensão ("JAIBA 4138kVA"), abreviações ("COL BOA HORA", "SER D. ALMAS II"), subestação ausente ("TABOCAS", "DRACENA") |

Amostra de 20 pontos de conexão (aleatória, semente fixa):

| Ponto de conexão (plant)     | UF  | Subestação casada                                                |
| ---------------------------- | --- | ---------------------------------------------------------------- |
| RIO BRILHANTE230kVA          | MS  | RIO BRILHANTE MS 230 kV                                          |
| QUINTA - 138 kV (A)          | RS  | QUINTA RS 138 kV                                                 |
| JAIBA138kVA                  | MG  | JAIBA MG 138 kV                                                  |
| TOUROS - 230 kV (A)          | RN  | TOUROS RN 230 kV                                                 |
| GILBUES II500kVA             | PI  | GILBUES II PI 500 kV                                             |
| B.JESUS LAPA - 230 kV (A)    | BA  | B.JESUS LAPA BA 230 kV                                           |
| PARACATU 4 - 500 kV (A)      | MG  | PARACATU 4 MG 500 kV                                             |
| QUEIMADA NOVA 2500kVA        | BA  | QUEIMADA NOVA 2 **PI** 500 kV (só nome; UF diferente: descartar) |
| CAMPO FORMOSO - 230 kV (A)   | BA  | CAMPO FORMOSO BA 230 kV                                          |
| CURRAL PIAUI II - 500 kV (A) | PI  | CURRAL PIAUI II PI 500 kV                                        |
| JAGUARUANA II230kVA          | CE  | JAGUARUANA II CE 230 kV                                          |
| JAIBA 4138kVA                | MG  | sem casamento                                                    |
| U.SOBRADINHO - 230 kV (A)    | BA  | U.SOBRADINHO BA 230 kV                                           |
| BOM NOME - 230 kV (A)        | PE  | BOM NOME PE 230 kV                                               |
| MORRO CHAPEU II500kVA        | BA  | MORRO CHAPEU II BA 500 kV                                        |
| ICO230kVA                    | CE  | ICO CE 230 kV                                                    |
| IGAPORA II - 230 kV (B)      | BA  | IGAPORA II BA 230 kV                                             |
| LIVRAMENTO 3230kVA           | RS  | LIVRAMENTO 3 RS 230 kV                                           |
| BRUMADO II - 230 kV (A)      | BA  | BRUMADO II BA 230 kV                                             |
| ACU II - 230 kV (A)          | RN  | ACU II RN 230 kV                                                 |

Leitura: com a regra nome+UF a taxa fica em cerca de 90%; na amostra há 1 falso positivo em 20 no modo "só nome", por isso esse modo deve ser proibido. Muitas usinas compartilham o mesmo ponto (ex.: 35 usinas em MONTE VERDE), então o mapa D terá pontos sobrepostos; é preciso agrupar ou espalhar, com aviso. A taxa não foi validada contra coordenada oficial (seção 6).

## 6. Geometria oficial ANEEL/SIGEL

| Tema                              | Achado                                                                                                                                                                                                                                              | Fonte                                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal de Dados Abertos           | 72 conjuntos listados; filtro de formatos sem SHP/GeoJSON; licença exibida `odc-odbl` (ODbL) em 69 conjuntos. robots.txt: bloqueia `/api` e páginas de histórico; pede espera de 10 s entre requisições                                             | [dadosabertos](https://dadosabertos.aneel.gov.br/dataset/) e [robots](https://dadosabertos.aneel.gov.br/robots.txt)                                   |
| SIGA (empreendimentos de geração) | CSV e XML, atualização mensal/diária, licença ODbL; presença de lat/lon e CEG **não confirmada** (ler o dicionário de dados em PDF)                                                                                                                 | [SIGA](https://dadosabertos.aneel.gov.br/dataset/siga-sistema-de-informacoes-de-geracao-da-aneel)                                                     |
| SIGEL (ArcGIS)                    | Serviço REST `https://sigel.aneel.gov.br/arcgis/rest/services`; camadas de geração (EOL, UFV, UTE, PCH, UHE etc.) e GGT (gestão geoespacializada da transmissão); download em shapefile; licença e termos **não encontrados**; `robots.txt` deu 404 | [guia open-geodata](https://open-geodata.readthedocs.io/pt-br/latest/pages/dados/br/aneel_arcgis/)                                                    |
| Áreas de distribuidoras           | Nenhuma camada ou conjunto com área de concessão encontrado; o portal lista alimentadores, linhas e subestações de distribuição (2024) sem termos claros                                                                                            | [Cenário Energia](https://cenarioenergia.com.br/2024/02/27/aneel-abre-suas-portas-digitais-descubra-as-ultimas-novidades-no-portal-de-dados-abertos/) |
| Linhas de transmissão             | Base do IBGE de 2015 derivada do SIGEL (sem licença indicada); camada oficial atual não confirmada                                                                                                                                                  | [IBGE metadados](https://metadadosgeo.ibge.gov.br/geonetwork_ibge/srv/api/records/5f3db3bc-53ba-4474-8668-b7ddaf9a13d5)                               |

Conclusão: há indícios de pontos oficiais de usinas eólicas/solares (SIGEL/SIGA, chave CEG), o que permitiria `precision='official'` no lugar do proxy da subestação, mas licença e campos precisam de confirmação humana. Para o mapa E não achei fonte; tratar como não viável por ora.

## 7. Viabilidade por mapa

| Mapa              | Viável?            | Observação                                                                       |
| ----------------- | ------------------ | -------------------------------------------------------------------------------- |
| A. Estados        | Sim                | IBGE 2025; D3-geo SVG recomendado; falta registrar licença/CRS                   |
| B. Reservatórios  | Sim                | 158/158 com coordenada; sem mapa-base no início                                  |
| C. Rede           | Sim, com ressalvas | 1.681 subestações; 95,2% das linhas desenháveis como segmento reto "esquemático" |
| D. Usinas         | Sim, com ressalvas | 90% casam; pontos sobrepostos; só nome+UF; avaliar SIGA/SIGEL                    |
| E. Distribuidoras | Não confirmado     | Sem geometria oficial encontrada; depende de verificação no SIGEL                |

## 8. Implicações para a estrutura /mapas

Estrutura pedida: `/mapas` redireciona para `/mapas/estados`; uma rota por camada (`estados`, `reservatorios`, `rede`, `usinas`, `distribuidoras` se entrar), estado na URL (`?mes=&fonte=`); mapas embutidos nas áreas (`/estados`, `/agua`, `/usinas`, `/qualidade`, `/painel`) com o mesmo componente.

| Camada         | Biblioteca                      | Custo de JS (gzip, medido) | Dados                                          |
| -------------- | ------------------------------- | -------------------------- | ---------------------------------------------- |
| estados        | D3-geo + topojson (ou MapLibre) | 9 KB (ou 301 KB)           | contornos IBGE (alvo ≤150 KB) + valores por UF |
| reservatorios  | MapLibre                        | 301 KB                     | 158 pontos                                     |
| rede           | MapLibre                        | 301 KB                     | 1.681 pontos + cerca de 2.200 segmentos        |
| usinas         | MapLibre                        | 301 KB                     | cerca de 1.470 pontos localizados              |
| distribuidoras | MapLibre ou D3-geo              | a definir                  | sem fonte                                      |

O que o code-splitting por rota economiza:

- Cada rota de camada importa seu componente com `import()` dinâmico; as abas viram links (rotas), não painéis montados juntos. Quem abre `/mapas/estados` baixa apenas contornos e, com D3-geo, cerca de 9 KB de JS de mapa.
- Se as 4 camadas fossem carregadas juntas (uma página com abas internas), o custo seria 301 KB mais os dados de todas; com rota por camada, MapLibre só é baixado ao abrir reservatórios, rede ou usinas (1 vez por visita, e fica em cache na troca de aba, pois o chunk é compartilhado). Economia na entrada: cerca de 292 KB gzip (301 menos 9) para quem só olha estados; e nenhum dado de pontos fora da camada aberta.
- O chunk do MapLibre deve ser um só, compartilhado por B, C e D (evitar duplicação por rota); o `MapView` carrega a camada apenas quando visível (IntersectionObserver), valendo também para o mapa embutido em `/agua` (alternância Gráfico/Mapa: só baixa ao escolher "Mapa") e em `/usinas` (padrão celular = lista, sem custo).
- Riscos: manter D3-geo para o A e MapLibre para B/C/D cria dois componentes (`MapView` precisa de uma interface comum de legenda/painel/atribuição, com motores diferentes); se o dono preferir MapLibre em todos, `/mapas/estados` e o mapa embutido em `/estados` e `/painel` passam a custar 301 KB (acima do alvo de 250 KB), o que no `/painel` reduz bastante a vantagem de ser "versão reduzida". Por isso a recomendação do A em SVG vale ainda mais com a nova estrutura.
- Medições do repositório (rota real do Next, CSS do MapLibre, brotli na Vercel) ficam para a Etapa 1, que inclui menu e estrutura de /mapas.

## 9. Decisões que dependem do usuário

1. Aceitar a divisão: D3-geo/SVG no mapa A e MapLibre em B/C/D (ou MapLibre em todos, aceitando 301 KB gzip no A).
2. Baixar `UFs` 2025 do IBGE (shapefile) e copiar a frase de licença/atribuição do site (bloqueado a robôs); confirmar o CRS.
3. Mapa-base: confirmar começar sem mapa-base; decidir se B/C/D usarão PMTiles próprio depois (tarefa de infra, custo S3/CloudFront).
4. SIGEL/ANEEL: abrir `https://sigel.aneel.gov.br` no navegador, conferir termos e se há camadas de EOL/UFV com CEG e coordenada, linhas e áreas de distribuidoras; ler o dicionário de dados do SIGA. Só então decidir `plant_location` (`precision='official'`) e o mapa E.
5. Aprovar `plant_location` (migração na API, grants na infra, tarefa no data) e a regra de casamento nome+UF; o parse do `connection_point` deve ser feito no data.
