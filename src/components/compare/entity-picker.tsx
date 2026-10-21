"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { Tabs } from "@/components/tabs";
import { entityToken, MAX_ENTITIES, serializeEntities, type EntityRef } from "@/lib/compare";
import { REGIONS, STATES, SUBSYSTEMS, subsystemName } from "@/lib/geo";

export interface PickerItem {
  ref: EntityRef;
  label: string;
  color: string;
}

interface PlantHit {
  slug: string;
  name: string;
  kind: "plant" | "cluster";
  state: string;
  source: "wind" | "solar";
}

const SUBSYSTEM_CHIPS: { id: string; label: string }[] = [
  { id: "SIN", label: subsystemName("SIN") },
  ...SUBSYSTEMS.map((subsystem) => ({ id: subsystem.id, label: subsystem.name })),
];

function Chip({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled && !selected}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line bg-surface text-ink hover:border-accent hover:bg-accent-soft"
      }`}
    >
      {selected ? <span aria-hidden>✓ </span> : null}
      {label}
    </button>
  );
}

function PlantSearch({
  selected,
  full,
  onAdd,
  onRemove,
}: {
  selected: Set<string>;
  full: boolean;
  onAdd: (ref: EntityRef) => void;
  onRemove: (ref: EntityRef) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [source, setSource] = useState("");
  const [hits, setHits] = useState<PlantHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const ready = query.trim().length >= 2 || state !== "";

  useEffect(() => {
    if (!ready) {
      setHits([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), state, source });
        const response = await fetch(`/api/search?${params}`, { signal: controller.signal });
        const body = (await response.json()) as { items?: PlantHit[]; total?: number };
        setHits(body.items ?? []);
        setTotal(body.total ?? 0);
      } catch {
        if (!controller.signal.aborted) setHits([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, state, source, ready]);

  const field =
    "border-line bg-surface text-ink focus-visible:border-accent w-full rounded-lg border px-3 py-2 text-sm";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor={`${id}-q`} className="mb-1 block text-sm font-medium">
            Nome da usina
          </label>
          <input
            id={`${id}-q`}
            type="search"
            autoComplete="off"
            value={query}
            placeholder="Ex.: Campo Largo, Boa Hora"
            onChange={(event) => setQuery(event.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${id}-state`} className="mb-1 block text-sm font-medium">
            Estado
          </label>
          <select
            id={`${id}-state`}
            value={state}
            onChange={(event) => setState(event.target.value)}
            className={field}
          >
            <option value="">Todos</option>
            {STATES.map((item) => (
              <option key={item.state} value={item.state}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-source`} className="mb-1 block text-sm font-medium">
            Fonte
          </label>
          <select
            id={`${id}-source`}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={field}
          >
            <option value="">Todas</option>
            <option value="wind">Eólica</option>
            <option value="solar">Solar</option>
          </select>
        </div>
      </div>

      {!ready ? (
        <p className="text-muted text-sm">
          Digite o nome da usina (2 letras ou mais) ou escolha um estado para listar as usinas.
        </p>
      ) : loading ? (
        <p className="text-muted text-sm">Buscando…</p>
      ) : hits.length === 0 ? (
        <p className="text-muted text-sm">Nenhuma usina encontrada. Tente outro nome ou filtro.</p>
      ) : (
        <>
          <ul className="border-grid divide-grid bg-surface divide-y rounded-xl border">
            {hits.map((hit) => {
              const ref: EntityRef = { kind: "plant", id: hit.slug };
              const added = selected.has(entityToken(ref));
              return (
                <li key={hit.slug} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{hit.name}</p>
                    <p className="text-muted text-xs">
                      {hit.kind === "cluster" ? "Conjunto" : "Usina"} ·{" "}
                      {hit.source === "wind" ? "Eólica" : "Solar"} · {hit.state}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`${added ? "Remover" : "Adicionar"} ${hit.name}`}
                    disabled={full && !added}
                    onClick={() => (added ? onRemove(ref) : onAdd(ref))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-40 ${
                      added
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line hover:border-accent hover:bg-accent-soft"
                    }`}
                  >
                    {added ? "✓ Adicionada" : "+ Adicionar"}
                  </button>
                </li>
              );
            })}
          </ul>
          {total > hits.length ? (
            <p className="text-muted text-xs">
              Mostrando {hits.length} de {total} usinas. Refine pelo nome para achar a que procura.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export function EntityPicker({ items }: { items: PickerItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const selected = useMemo(() => new Set(items.map((item) => entityToken(item.ref))), [items]);
  const full = items.length >= MAX_ENTITIES;

  function navigate(refs: EntityRef[]) {
    const params = new URLSearchParams(window.location.search);
    if (refs.length > 0) params.set("itens", serializeEntities(refs));
    else params.delete("itens");
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  const refs = items.map((item) => item.ref);
  const add = (ref: EntityRef) => navigate([...refs, ref]);
  const remove = (ref: EntityRef) =>
    navigate(refs.filter((other) => entityToken(other) !== entityToken(ref)));
  const toggle = (ref: EntityRef) => (selected.has(entityToken(ref)) ? remove(ref) : add(ref));

  return (
    <div className="space-y-5">
      <div
        className="border-grid bg-surface rounded-2xl border p-4 sm:p-5"
        aria-live="polite"
        aria-label="Itens escolhidos"
      >
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">
            Itens escolhidos{" "}
            <span className="text-muted font-normal">
              ({items.length} de {MAX_ENTITIES})
            </span>
          </p>
          <div className="flex items-center gap-3">
            {pending ? <span className="text-muted text-sm">Atualizando…</span> : null}
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => navigate([])}
                className="text-accent text-sm font-medium hover:underline"
              >
                Limpar tudo
              </button>
            ) : null}
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-muted text-sm">
            Nada escolhido ainda. Use as abas abaixo para adicionar estados, subsistemas ou usinas.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((item) => (
              <li
                key={entityToken(item.ref)}
                className="border-line bg-page inline-flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 text-sm font-medium"
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
                <button
                  type="button"
                  aria-label={`Remover ${item.label}`}
                  onClick={() => remove(item.ref)}
                  className="text-muted hover:bg-surface-2 hover:text-ink inline-flex size-6 items-center justify-center rounded-full"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="size-3.5">
                    <path
                      d="M5 5l10 10M15 5L5 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        {full ? (
          <p className="text-muted mt-3 text-xs">
            Limite de {MAX_ENTITIES} itens: remova um para adicionar outro.
          </p>
        ) : null}
      </div>

      <Tabs
        label="Tipo de item"
        panels={[
          {
            key: "states",
            label: "Estados",
            content: (
              <div className="space-y-4 pt-2">
                {REGIONS.map((region) => (
                  <div key={region}>
                    <h4 className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                      {region}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {STATES.filter((state) => state.region === region).map((state) => {
                        const ref: EntityRef = { kind: "state", id: state.state };
                        return (
                          <Chip
                            key={state.state}
                            label={state.name}
                            selected={selected.has(entityToken(ref))}
                            disabled={full}
                            onClick={() => toggle(ref)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            key: "subsystems",
            label: "Subsistemas",
            content: (
              <div className="space-y-3 pt-2">
                <p className="text-ink-2 text-sm">
                  Os subsistemas são as grandes regiões do sistema elétrico. O SIN é o total do
                  Brasil.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUBSYSTEM_CHIPS.map((subsystem) => {
                    const ref: EntityRef = { kind: "subsystem", id: subsystem.id };
                    return (
                      <Chip
                        key={subsystem.id}
                        label={subsystem.label}
                        selected={selected.has(entityToken(ref))}
                        disabled={full}
                        onClick={() => toggle(ref)}
                      />
                    );
                  })}
                </div>
              </div>
            ),
          },
          {
            key: "plants",
            label: "Usinas e conjuntos",
            content: (
              <div className="pt-2">
                <PlantSearch selected={selected} full={full} onAdd={add} onRemove={remove} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
