import type { User } from '@datagouv/components-next'

type UploadAvatarResponse = {
  image: string
  success: boolean
}

export async function uploadProfilePicture(file: File, user: User | null) {
  const api = useNuxtApp().$fileApi
  const formData = new FormData()
  formData.append('file', file)
  const resp = await api<UploadAvatarResponse>(user ? `/api/1/users/${user.id}/avatar/` : `/api/1/me/avatar/`, {
    method: 'POST',
    body: formData,
  })
  return resp
}
