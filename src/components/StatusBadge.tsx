interface StatusBadgeProps {
  state: "idle" | "loading" | "healthy" | "error";
  label: string;
}

export function StatusBadge({ state, label }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${state}`} data-testid="status-badge">
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
