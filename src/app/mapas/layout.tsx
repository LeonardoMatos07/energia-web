import type { ReactNode } from "react";
import { MapTabs } from "@/components/maps/map-tabs";
import { Container } from "@/components/ui";

export default function MapsLayout({ children }: { children: ReactNode }) {
  return (
    <Container>
      <MapTabs />
      {children}
    </Container>
  );
}
