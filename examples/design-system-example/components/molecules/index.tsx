import type { ReactNode } from 'react';
import { AdminButton, AdminInput, StatusBadge } from '../atoms';

export function FormField({ label, error, ...props }: { label: string; error?: string; placeholder?: string; type?: string }) {
  return <label className="form-field"><span>{label}</span><AdminInput {...props} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>;
}

export function NavigationItem({ active, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) {
  return <AdminButton variant="ghost" aria-current={active ? 'page' : undefined} onClick={onClick}>{label}</AdminButton>;
}

export function StatCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><StatusBadge tone="success">{trend}</StatusBadge></article>;
}

export function UserListItem({ name, email, status, action }: { name: string; email: string; status: string; action?: ReactNode }) {
  return <article className="user-list-item"><div><strong>{name}</strong><span>{email}</span></div><StatusBadge tone={status === 'Активен' ? 'success' : 'warning'}>{status}</StatusBadge>{action}</article>;
}
