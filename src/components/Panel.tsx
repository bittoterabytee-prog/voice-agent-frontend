import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Panel({ title, children, actions }: PanelProps) {
  return (
    <section className="panel">
      <header className="panel__header">
        <h2>{title}</h2>
        {actions}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
