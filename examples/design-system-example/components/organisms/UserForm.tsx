import { AdminButton } from '../atoms';
import { FormField } from '../molecules';

export function UserForm({ loading, error }: { loading?: boolean; error?: string }) {
  return <form className="user-form"><FormField label="Имя" error={error} /><FormField label="Email" type="email" /><FormField label="Роль" /><AdminButton loading={loading}>Создать пользователя</AdminButton></form>;
}
