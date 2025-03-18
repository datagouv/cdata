export type KeysOfUnion<T> = T extends T ? keyof T : never

export type ValidationFunction<T, K extends KeysOfUnion<T>, V extends T[K]> = (value: V, key: K, form: T, t: (key: string, values?: Record<string, unknown>) => string) => string | null

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

  const touch = (key: KeysOfUnion<T>) => {
    errors.value[key] = []

    for (const rule of errorsRules[key] || []) {
      const result = rule(form.value[key], key, form.value, t)
      if (result) errors.value[key].push(result)
    }

    warnings.value[key] = []
    for (const rule of warningsRules[key] || []) {
      const result = rule(form.value[key], key, form.value, t)
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

  const validate = () => {
    for (const key of Object.keys(form.value)) {
      touch(key as KeysOfUnion<T>)
    }
    for (const key of Object.keys(form.value)) {
      if (getFirstError(key as KeysOfUnion<T>)) return false
    }

    return true
  }

  const formInfo = { errors, warnings, touch, getFirstError, getFirstWarning, validate, removeErrorsAndWarnings, warningsAsList, errorsAsList }
  return { form, formInfo, ...formInfo }
}

export function required<T, K extends KeysOfUnion<T>, V extends T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!value || (Array.isArray(value) && !value.length)) return message || t('The field {property} is required.', { property: t(key.toString()) })

    return null
  }
}

export function requiredIf<T, K extends KeysOfUnion<T>, V extends T[K]>(condition: Ref<boolean>, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!condition.value) return null
    if (!value || (Array.isArray(value) && !value.length)) return message || t('The field {property} is required.', { property: t(key.toString()) })

    return null
  }
}

export function requiredIfFalsy<T, K extends KeysOfUnion<T>, V extends T[K]>(nonFalsyKey: keyof T, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[typeof nonFalsyKey], key: K, form: T, t) => {
    if ((!value || (Array.isArray(value) && !value.length)) && !form[nonFalsyKey]) return message || t('The field {property} is required.', { property: t(key.toString()) })

    return null
  }
}

export function minLength<T, K extends KeysOfUnion<T>, V extends (string | undefined) & T[K]>(min: number, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (value && value.length >= min) return null

    return message || t('The field {property} should be of at least {min} characters', { property: t(key.toString()), min })
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
      return message || t('The field {property} should be a valid URL', { property: t(key.toString()) })
    }
  }
}

export function email<T, K extends KeysOfUnion<T>, V extends (string | undefined) & T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: V, key: K, form: T, t) => {
    if (!value) return null
    if (/^\S+@\S+\.\S+$/.exec(value)) return null

    return message || t('The field {property} should be a valid email', { property: t(key.toString()) })
  }
}
