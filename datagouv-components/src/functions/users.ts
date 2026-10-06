import type { User, UserReference } from '../types/users'
import { useComponentsConfig } from '../config'

// Accept UserReference or UserSuggest (which has avatar_url instead of avatar_thumbnail)
type UserWithAvatar = UserReference | (Pick<UserReference, 'id'> & { avatar_url?: string | null })

/**
 * Deleting an account anonymises it in place: the names become `DELETED` and the slug
 * `deleted-<id>`. The slug is what identifies it, being unique and out of the user's
 * reach, where someone may legitimately be named DELETED.
 */
export function isDeletedUser(user: User | UserReference): boolean {
  return user.slug.startsWith('deleted-')
}

export function useGetUserAvatar() {
  const config = useComponentsConfig()
  return (user: UserWithAvatar, size: number) => {
    if ('avatar_thumbnail' in user && user.avatar_thumbnail) return user.avatar_thumbnail
    if ('avatar_url' in user && user.avatar_url) return user.avatar_url
    return `${config.apiBase}/api/1/avatars/${user.id}/${size}`
  }
}
