import type { ReactNode } from 'react';
import '../admin.css';

export function BodyText({ muted, children }: { muted?: boolean; children: ReactNode }) {
  return <p className={muted ? 'body-text is-muted' : 'body-text'}>{children}</p>;
}
