import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  chip?: string;
}

export function Panel({ title, children, actions, chip }: PanelProps) {
  return (
    <section className="panel">
      <header className="panel__header">
        <div className="panel__heading">
          <h2>{title}</h2>
          {chip ? <span className="panel-chip">{chip}</span> : null}
        </div>
        {actions}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
