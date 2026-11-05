import { NavigationItem } from '../molecules';

export function AdminNavigation({ active }: { active: 'dashboard' | 'users' }) {
  return <nav className="admin-navigation" aria-label="Основная навигация"><NavigationItem active={active === 'dashboard'} label="Дашборд" /><NavigationItem active={active === 'users'} label="Пользователи" /></nav>;
}
