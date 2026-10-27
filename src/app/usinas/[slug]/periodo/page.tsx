import type { Metadata } from "next";
import { PlantView, plantMetadata } from "@/components/views/plant-view";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return plantMetadata((await params).slug, true);
}

export default async function PlantPeriodPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PlantView slug={(await params).slug} query={await searchParams} />;
}
