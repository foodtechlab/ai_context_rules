import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import '../admin.css';

export function AdminButton({ variant = 'primary', loading, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; loading?: boolean }) {
  return <button {...props} className={`admin-button is-${variant}`} disabled={props.disabled || loading}>{loading ? 'Загрузка…' : children}</button>;
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="admin-input" />;
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info'; children: ReactNode }) {
  return <span className={`status-badge is-${tone}`} role="status">{children}</span>;
}

export function BodyText({ muted, children }: { muted?: boolean; children: ReactNode }) {
  return <p className={muted ? 'body-text is-muted' : 'body-text'}>{children}</p>;
}
