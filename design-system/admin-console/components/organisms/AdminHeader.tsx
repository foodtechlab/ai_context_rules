import type { ReactNode } from 'react';
import { BodyText } from '../atoms';

export function AdminHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return <header className="admin-header"><div><BodyText muted>ADMIN CONSOLE</BodyText><h1>{title}</h1></div><div>{actions}</div></header>;
}
