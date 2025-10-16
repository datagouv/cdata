import type { User } from '../types/users'
import { useComponentsConfig } from '../config'

export function useGetUserAvatar() {
  const config = useComponentsConfig()
  return (user: User, size: number) => user.avatar_thumbnail || `${config.apiBase}/api/1/avatars/${user.id}/${size}`
}
