import type { FormEvent } from 'react';
import { AdminButton, StatusBadge } from '../atoms';
import { FormField } from '../molecules';

export function AuthForm({ mode, loading, error, onSubmit }: { mode: 'login' | 'register'; loading?: boolean; error?: string; onSubmit?: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit?.(); };
  return <form className="auth-form" onSubmit={submit}><h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>{error && <StatusBadge tone="error">{error}</StatusBadge>}<FormField label="Email" type="email" placeholder="name@company.ru" />{mode === 'register' && <FormField label="Имя" placeholder="Анна Смирнова" />}<FormField label="Пароль" type="password" placeholder="••••••••" /><AdminButton type="submit" loading={loading}>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</AdminButton></form>;
}
