import type { InputHTMLAttributes } from 'react';
import '../admin.css';

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="admin-input" />;
}
