import type { ReactNode } from 'react';
import '../admin.css';

export function StatusBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info'; children: ReactNode }) {
  return <span className={`status-badge is-${tone}`} role="status">{children}</span>;
}
