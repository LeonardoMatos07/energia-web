import type { Metadata } from "next";
import { PlantView, plantMetadata } from "@/components/views/plant-view";

export const revalidate = 3600;

type Params = { slug: string };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return plantMetadata((await params).slug);
}

export default async function PlantPage({ params }: { params: Promise<Params> }) {
  return <PlantView slug={(await params).slug} query={{}} />;
}
