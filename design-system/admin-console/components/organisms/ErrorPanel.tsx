import type { ReactNode } from 'react';
import { BodyText } from '../atoms';

export function ErrorPanel({ code, title, action }: { code: '404' | '500'; title: string; action?: ReactNode }) {
  return <section className="error-panel"><strong>{code}</strong><h1>{title}</h1><BodyText muted>{code === '404' ? 'Страница не существует или была перемещена.' : 'Сервис временно недоступен. Данные не потеряны.'}</BodyText>{action}</section>;
}
