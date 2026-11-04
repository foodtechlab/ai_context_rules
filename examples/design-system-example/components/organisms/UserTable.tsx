import { AdminButton } from '../atoms';
import { UserListItem } from '../molecules';

export function UserTable({ users, onOpen }: { users: Array<{ id: string; name: string; email: string; status: string }>; onOpen?: (id: string) => void }) {
  return <section className="user-table">{users.map((user) => <UserListItem key={user.id} {...user} action={<AdminButton variant="ghost" onClick={() => onOpen?.(user.id)}>Открыть</AdminButton>} />)}</section>;
}
