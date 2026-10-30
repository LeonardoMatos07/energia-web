/** Placeholder with a fixed height while a block loads, so the page does not jump. */
export function BlockSkeleton({
  height = 320,
  label = "Carregando",
}: {
  height?: number;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="border-grid bg-surface-2/60 animate-pulse rounded-2xl border"
      style={{ height }}
    />
  );
}
