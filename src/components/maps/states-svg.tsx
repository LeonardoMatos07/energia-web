"use client";

import { geoMercator, geoPath } from "d3-geo";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { GeoStateCurtailment } from "@/lib/api/types";
import { findState } from "@/lib/geo";
import { classIndex, STATE_METRICS, type StateMetric } from "@/lib/maps";

export const STATES_TOPOLOGY_URL = "/geo/brazil-states.2025.topo.json";
const WIDTH = 600;
const HEIGHT = 620;

interface StateProps {
  uf: string;
  name: string;
}

type States = FeatureCollection<Geometry, StateProps>;

let topologyPromise: Promise<States> | null = null;

function loadStates(): Promise<States> {
  topologyPromise ??= fetch(STATES_TOPOLOGY_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`outlines: ${response.status}`);
      return response.json() as Promise<Topology>;
    })
    .then((topology) => {
      const layer = Object.values(topology.objects)[0] as GeometryCollection<StateProps>;
      return feature(topology, layer) as States;
    })
    .catch((error: unknown) => {
      topologyPromise = null;
      throw error;
    });
  return topologyPromise;
}

export interface StatesSvgProps {
  items: GeoStateCurtailment[];
  metric: StateMetric;
  limits: number[];
  active: string | null;
  onActive: (state: string | null) => void;
}

/** Choropleth of the 27 states: SVG drawn with d3-geo, no map tiles and no WebGL. */
export default function StatesSvg({ items, metric, limits, active, onActive }: StatesSvgProps) {
  const [states, setStates] = useState<States | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStates().then(
      (collection) => !cancelled && setStates(collection),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const paths = useMemo(() => {
    if (!states) return [];
    const projection = geoMercator().fitExtent(
      [
        [4, 4],
        [WIDTH - 4, HEIGHT - 4],
      ],
      states,
    );
    const draw = geoPath(projection);
    return states.features.map((f: Feature<Geometry, StateProps>) => ({
      uf: f.properties.uf,
      d: draw(f) ?? "",
    }));
  }, [states]);

  const byState = useMemo(() => new Map(items.map((item) => [item.state, item])), [items]);
  const read = STATE_METRICS[metric];

  if (failed) {
    return (
      <p role="status" className="text-ink-2 p-6 text-center text-sm">
        Não foi possível carregar os contornos dos estados. Use a tabela abaixo.
      </p>
    );
  }
  if (!states) return <div className="bg-surface-2 aspect-[600/620] animate-pulse rounded-xl" />;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="group"
      aria-label="Mapa do Brasil por estado. A tabela abaixo traz os mesmos valores."
    >
      {paths.map(({ uf, d }) => {
        const item = byState.get(uf);
        const value = item ? read.value(item) : null;
        const cls = classIndex(value, limits);
        const name = findState(uf)?.name ?? uf;
        const isActive = active === uf;
        return (
          <Link
            key={uf}
            href={`/estados/${uf.toLowerCase()}`}
            aria-label={`${name}: ${value === null ? "sem dados" : read.format(value)}. Abrir a página do estado.`}
            onMouseEnter={() => onActive(uf)}
            onMouseLeave={() => onActive(null)}
            onFocus={() => onActive(uf)}
            onBlur={() => onActive(null)}
          >
            <path
              d={d}
              data-state={uf}
              fill={cls === null ? "var(--map-nodata)" : `var(--map-c${cls})`}
              stroke={isActive ? "var(--color-ink)" : "var(--color-surface)"}
              strokeWidth={isActive ? 2 : 0.8}
              strokeLinejoin="round"
            />
          </Link>
        );
      })}
    </svg>
  );
}
