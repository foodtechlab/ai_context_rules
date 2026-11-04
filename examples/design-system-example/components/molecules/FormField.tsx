import { AdminInput } from '../atoms';

export function FormField({ label, error, ...props }: { label: string; error?: string; placeholder?: string; type?: string }) {
  return <label className="form-field"><span>{label}</span><AdminInput {...props} aria-invalid={Boolean(error)} />{error && <small>{error}</small>}</label>;
}
