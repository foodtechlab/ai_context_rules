import { StatusBadge } from '../atoms';

export function StatCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><StatusBadge tone="success">{trend}</StatusBadge></article>;
}
