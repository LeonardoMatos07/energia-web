"use client";

import { useState, type Dispatch } from "react";
import { renderPng, renderSvg } from "@/lib/plotter/export";
import type { FitResult } from "@/lib/plotter/fit";
import {
  clearLocal,
  encodeHash,
  fromPlotJson,
  StateFormatError,
  toCsv,
  toPlotJson,
} from "@/lib/plotter/share";
import { emptyState, type PlotterAction, type PlotterState } from "@/lib/plotter/state";

const BUTTON = "border-grid hover:bg-surface-2 rounded-full border px-3 py-1.5 text-sm font-medium";

function download(name: string, href: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
}

function downloadBlob(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  download(name, url);
  URL.revokeObjectURL(url);
}

/** Save, share and export. The data never leaves the browser: links carry it in the #hash. */
export function ShareBar({
  state,
  fit,
  dispatch,
}: {
  state: PlotterState;
  fit: FitResult | null;
  dispatch: Dispatch<PlotterAction>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [transparent, setTransparent] = useState(false);

  async function copyLink() {
    const { hash, tooLong } = encodeHash(state);
    if (tooLong) {
      setMessage("O gráfico é grande demais para um link. Baixe o arquivo .plot.json.");
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    window.history.replaceState(null, "", `#${hash}`);
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copiado. Ele leva os dados dentro do endereço, sem passar pelo servidor.");
    } catch {
      setMessage("Copie o endereço da barra do navegador.");
    }
  }

  async function exportImage(format: "png" | "svg") {
    try {
      if (format === "png") {
        download("grafico.png", await renderPng(state, scale, fit, transparent));
      } else {
        downloadBlob("grafico.svg", await renderSvg(state, fit, transparent), "image/svg+xml");
      }
    } catch {
      setMessage("Não foi possível exportar a imagem neste navegador.");
    }
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      dispatch({ type: "load", state: fromPlotJson(await file.text()) });
      setMessage("Gráfico aberto.");
    } catch (error) {
      setMessage(error instanceof StateFormatError ? error.message : "Arquivo inválido.");
    }
  }

  return (
    <section aria-label="Salvar, compartilhar e exportar" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BUTTON} onClick={() => void copyLink()}>
          Copiar link
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => downloadBlob("grafico.plot.json", toPlotJson(state), "application/json")}
        >
          Baixar .plot.json
        </button>
        <label className={`${BUTTON} cursor-pointer`}>
          Abrir .plot.json
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          className={BUTTON}
          onClick={() => downloadBlob("dados.csv", toCsv(state), "text/csv;charset=utf-8")}
        >
          Baixar CSV
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            clearLocal();
            window.history.replaceState(null, "", window.location.pathname);
            dispatch({ type: "load", state: emptyState() });
            setMessage(null);
          }}
        >
          Novo gráfico
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Resolução
          <select
            className="border-grid bg-surface rounded-md border px-2 py-1"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          >
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4× (300 dpi em A4)</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={transparent}
            onChange={(event) => setTransparent(event.target.checked)}
          />
          Fundo transparente
        </label>
        <button type="button" className={BUTTON} onClick={() => void exportImage("png")}>
          Baixar PNG
        </button>
        <button type="button" className={BUTTON} onClick={() => void exportImage("svg")}>
          Baixar SVG
        </button>
      </div>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
