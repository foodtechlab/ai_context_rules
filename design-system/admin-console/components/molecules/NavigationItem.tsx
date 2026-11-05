import { AdminButton } from '../atoms';

export function NavigationItem({ active, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) {
  return <AdminButton variant="ghost" aria-current={active ? 'page' : undefined} onClick={onClick}>{label}</AdminButton>;
}
