import type { FormEvent, ReactNode } from 'react';
import { AdminButton, BodyText, StatusBadge } from '../atoms';
import { FormField, NavigationItem, UserListItem } from '../molecules';

export function AuthForm({ mode, loading, error, onSubmit }: { mode: 'login' | 'register'; loading?: boolean; error?: string; onSubmit?: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit?.(); };
  return <form className="auth-form" onSubmit={submit}><h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>{error && <StatusBadge tone="error">{error}</StatusBadge>}<FormField label="Email" type="email" placeholder="name@company.ru" />{mode === 'register' && <FormField label="Имя" placeholder="Анна Смирнова" />}<FormField label="Пароль" type="password" placeholder="••••••••" /><AdminButton type="submit" loading={loading}>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</AdminButton></form>;
}

export function AdminHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return <header className="admin-header"><div><BodyText muted>ADMIN CONSOLE</BodyText><h1>{title}</h1></div><div>{actions}</div></header>;
}

export function AdminNavigation({ active }: { active: 'dashboard' | 'users' }) {
  return <nav className="admin-navigation" aria-label="Основная навигация"><NavigationItem active={active === 'dashboard'} label="Дашборд" /><NavigationItem active={active === 'users'} label="Пользователи" /></nav>;
}

export function UserTable({ users, onOpen }: { users: Array<{ id: string; name: string; email: string; status: string }>; onOpen?: (id: string) => void }) {
  return <section className="user-table">{users.map((user) => <UserListItem key={user.id} {...user} action={<AdminButton variant="ghost" onClick={() => onOpen?.(user.id)}>Открыть</AdminButton>} />)}</section>;
}

export function UserForm({ loading, error }: { loading?: boolean; error?: string }) {
  return <form className="user-form"><FormField label="Имя" error={error} /><FormField label="Email" type="email" /><FormField label="Роль" /><AdminButton loading={loading}>Создать пользователя</AdminButton></form>;
}

export function ErrorPanel({ code, title, action }: { code: '404' | '500'; title: string; action?: ReactNode }) {
  return <section className="error-panel"><strong>{code}</strong><h1>{title}</h1><BodyText muted>{code === '404' ? 'Страница не существует или была перемещена.' : 'Сервис временно недоступен. Данные не потеряны.'}</BodyText>{action}</section>;
}
