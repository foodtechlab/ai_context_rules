import type { ReactNode } from 'react';
import { StatusBadge } from '../atoms';

export function UserListItem({ name, email, status, action }: { name: string; email: string; status: string; action?: ReactNode }) {
  return <article className="user-list-item"><div><strong>{name}</strong><span>{email}</span></div><StatusBadge tone={status === 'Активен' ? 'success' : 'warning'}>{status}</StatusBadge>{action}</article>;
}
