import type { ButtonHTMLAttributes } from 'react';
import '../admin.css';

export function AdminButton({ variant = 'primary', loading, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; loading?: boolean }) {
  return <button {...props} className={`admin-button is-${variant}`} disabled={props.disabled || loading}>{loading ? 'Загрузка…' : children}</button>;
}
