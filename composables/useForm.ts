import type { PaginatedArray } from '~/types/types'

export type KeysOfUnion<T> = T extends T ? keyof T : never

export type ValidationFunction<T, K extends KeysOfUnion<T>, V extends T[K]> = (value: V, key: K, form: T, t: (key: string, values?: Record<string, unknown>) => string) => string | null | Promise<string | null>

export type ValidationsRules<Type> = {
  [Property in KeysOfUnion<Type>]?: Array<ValidationFunction<Type, Property, Type[Property]>>;
}
export type ValidationsMessages<Type> = {
  [Property in KeysOfUnion<Type>]?: Array<string>;
}

export type FormInfo<T> = ReturnType<typeof useForm<T>>['formInfo']

export function useForm<T>(initialValues: MaybeRef<T>, errorsRules: ValidationsRules<T> = {}, warningsRules: ValidationsRules<T> = {}) {
  const { t } = useI18n()

  const form = toRef(initialValues)
  const errors = ref({} as ValidationsMessages<T>)
  const warnings = ref({} as ValidationsMessages<T>)

  const removeErrorsAndWarnings = () => {
    errors.value = {}
    warnings.value = {}
  }

  const touch = async (key: KeysOfUnion<T>) => {
    errors.value[key] = []

    for (const rule of errorsRules[key] || []) {
      const result = await rule(form.value[key], key, form.value, t)
      if (result) errors.value[key].push(result)
    }

    warnings.value[key] = []
    for (const rule of warningsRules[key] || []) {
      const result = await rule(form.value[key], key, form.value, t)
      if (result) warnings.value[key].push(result)
    }
  }

  const getFirst = (bag: ValidationsMessages<T>, key: KeysOfUnion<T>): string | null => {
    if (!bag[key]) return null
    if (!bag[key].length) return null

    return bag[key][0]
  }
  const getFirstError = (key: KeysOfUnion<T>): string | null => getFirst(errors.value, key)
  const getFirstWarning = (key: KeysOfUnion<T>): string | null => getFirst(warnings.value, key)

  const warningsAsList = computed<Array<string>>(() => {
    return Object.keys(errors.value).flatMap(key => errors.value[key] || [])
  })
  const errorsAsList = computed<Array<string>>(() => {
    return Object.keys(errors.value).flatMap(key => errors.value[key] || [])
  })

  const validate = async () => {
    for (const key of Object.keys(form.value)) {
      await touch(key as KeysOfUnion<T>)
    }
    for (const key of Object.keys(form.value)) {
      if (getFirstError(key as KeysOfUnion<T>)) return false
    }

    return true
  }

  const formInfo = { errors, warnings, touch, getFirstError, getFirstWarning, validate, removeErrorsAndWarnings, warningsAsList, errorsAsList }
  return { form, formInfo, ...formInfo }
}

export function unique<Something, T, K extends KeysOfUnion<T>, V extends (string | null) & T[K]>(apiUrl: (value: V) => string, message: string | null = null): ValidationFunction<T, K, V> {
  return async (value: V, key: K, form: T, t) => {
    if (!value) return null

    const response = await useAPI<PaginatedArray<Something>>(apiUrl(value))
    if (!response.data.value) return null
    if (!response.data.value.total) return null

    return message || t('\'{value}\' existe déjà')
  }
}

export function required<T, K extends KeysOfUnion<T>, V extends T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!value || (Array.isArray(value) && !value.length)) return message || t('Le champ est requis.')

    return null
  }
}

export function ruleIf<T, K extends KeysOfUnion<T>, V extends T[K]>(condition: Ref<boolean>, rule: ValidationFunction<T, K, V>): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!condition.value) return null
    return rule(value, key, form, t)
  }
}

export function requiredIfFalsy<T, K extends KeysOfUnion<T>, V extends T[K]>(nonFalsyKey: keyof T, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[typeof nonFalsyKey], key: K, form: T, t) => {
    if ((!value || (Array.isArray(value) && !value.length)) && !form[nonFalsyKey]) return message || t('Le champ est requis.')

    return null
  }
}

export function minLength<T, K extends KeysOfUnion<T>, V extends (string | undefined) & T[K]>(min: number, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (value && value.length >= min) return null

    return message || t('Le champ doit être de {min} caractères minimum', { min })
  }
}

export function testNotAllowed<T, K extends KeysOfUnion<T>, V extends (string | undefined) & T[K]>(demoServer: string | undefined, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (demoServer && value && value.toLowerCase().split(' ').includes('test')) return message || t('Si vous voulez faire des tests, utilisez « {demoServer} ».', { demoServer })

    return null
  }
}

export function url<T, K extends KeysOfUnion<T>, V extends (string | undefined | null) & T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    }
    catch {
      return message || t('Le champ doit être une URL valide')
    }
  }
}

export function email<T, K extends KeysOfUnion<T>, V extends (string | undefined) & T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (!value) return null
    if (/^\S+@\S+\.\S+$/.exec(value)) return null

    return message || t('Le champ doit être une adresse e-mail valide')
  }
}
