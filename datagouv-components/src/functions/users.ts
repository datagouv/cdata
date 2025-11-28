import type { UserReference } from '../types/users'
import { useComponentsConfig } from '../config'

export function useGetUserAvatar() {
  const config = useComponentsConfig()
  return (user: UserReference, size: number) => user.avatar_thumbnail || `${config.apiBase}/api/1/avatars/${user.id}/${size}`
}
