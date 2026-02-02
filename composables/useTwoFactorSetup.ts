import { toast } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'
import { usePostApiWithCsrf } from '~/utils/api'
import { renderSVG } from 'uqr'

export function useTwoFactorSetup() {
  const { t } = useTranslation()

  const qrcode = ref('')
  const totpKey = ref('')
  const code = ref('')
  const loading = ref(false)
  const errors = ref<FieldsErrors>({})

  const postApiWithCsrf = usePostApiWithCsrf()

  const fetchQRCode = async () => {
    if (qrcode.value || loading.value) return

    loading.value = true
    try {
      const { response } = await postApiWithCsrf<{ response: { tf_authr_issuer: string, tf_authr_username: string, tf_authr_key: string } }>('/tf-setup', {
        setup: 'authenticator',
      })
      qrcode.value = renderSVG(`otpauth://totp/${response.tf_authr_issuer}:${response.tf_authr_username}?secret=${response.tf_authr_key}&issuer=${response.tf_authr_issuer}`)
      totpKey.value = response.tf_authr_key
    }
    catch {
      toast.error(t('Erreur de récupération du qrcode'))
    }
    finally {
      loading.value = false
    }
  }

  const validateCode = async (onSuccess?: () => void) => {
    loading.value = true
    errors.value = {}

    try {
      await postApiWithCsrf('/tf-validate', {
        code: code.value,
      })

      if (onSuccess) onSuccess()

      // Reset form state
      qrcode.value = ''
      totpKey.value = ''
      code.value = ''

      return true
    }
    catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldsErrors = (e as any)?.response?._data?.response?.field_errors
      if (fieldsErrors) errors.value = fieldsErrors
      return false
    }
    finally {
      loading.value = false
    }
  }

  return {
    qrcode,
    totpKey,
    code,
    loading,
    errors,
    fetchQRCode,
    validateCode,
  }
}
