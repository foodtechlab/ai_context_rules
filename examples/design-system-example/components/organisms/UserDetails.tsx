import { StatusBadge } from '../atoms';

export function UserDetails({ name, email, role, status }: { name: string; email: string; role: string; status: string }) {
  return <section className="user-details"><h2>{name}</h2><dl><div><dt>Email</dt><dd>{email}</dd></div><div><dt>Роль</dt><dd>{role}</dd></div><div><dt>Статус</dt><dd><StatusBadge tone={status === 'Активен' ? 'success' : 'warning'}>{status}</StatusBadge></dd></div></dl></section>;
}
