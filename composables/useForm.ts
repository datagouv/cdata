export type KeysOfUnion<T> = T extends T ? keyof T : never

export type ValidationFunction<T, K extends KeysOfUnion<T>, V extends T[K]> = (value: V, key: K, form: T, t: (key: string, values?: Record<string, unknown>) => string) => string | null

export type ValidationsRules<Type> = {
  [Property in KeysOfUnion<Type>]?: Array<ValidationFunction<Type, Property, Type[Property]>>;
}
export type ValidationsMessages<Type> = {
  [Property in KeysOfUnion<Type>]?: Array<string>;
}

export type Validate = () => boolean

export type FormInfo<T> = ReturnType<typeof useForm<T>>['formInfo']

export type FormRegister = {
  registerSubform: (id: string, validate: Validate) => void
  unregisterSubform: (id: string) => void
}

export function useForm<T>(initialValues: MaybeRef<T>, errorsRules: ValidationsRules<T> = {}, warningsRules: ValidationsRules<T> = {}) {
  const { t } = useI18n()

  const form = toRef(initialValues)
  const subformValidations: { [key: string]: Validate } = {}
  type KeyofSubform = keyof typeof subformValidations
  const errors = ref({} as ValidationsMessages<T>)
  const warnings = ref({} as ValidationsMessages<T>)

  const injectionKey = Symbol() as InjectionKey<FormRegister>
  const registerSubform = (key: string, validate: Validate) => {
    subformValidations[key] = validate
  }

  const unregisterSubform = (key: KeyofSubform) => {
    if (key in subformValidations) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete subformValidations[key]
    }
  }

  provide(injectionKey, {
    registerSubform,
    unregisterSubform,
  })

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

  const validate: Validate = () => {
    for (const key of Object.keys(form.value)) {
      touch(key as KeysOfUnion<T>)
    }
    let subFormError = false
    for (const key of Object.keys(subformValidations)) {
      if (key in subformValidations) {
        const fn = subformValidations[key as KeyofSubform]
        if (fn) {
          subFormError = subFormError || !fn()
        }
      }
    }
    for (const key of Object.keys(form.value)) {
      if (getFirstError(key as KeysOfUnion<T>)) return false
    }

    return !subFormError
  }

  const formInfo = { errors, warnings, touch, getFirstError, getFirstWarning, validate, removeErrorsAndWarnings, warningsAsList, errorsAsList }
  return { form, formInfo, injectionKey, ...formInfo }
}

export function required<T, K extends KeysOfUnion<T>, V extends T[K]>(message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!value || (Array.isArray(value) && !value.length)) return message || t('Le champ est requis.')

    return null
  }
}

export function requiredIf<T, K extends KeysOfUnion<T>, V extends T[K]>(condition: Ref<boolean>, message: string | null = null): ValidationFunction<T, K, V> {
  return (value: T[keyof T], key: K, form: T, t) => {
    if (!condition.value) return null
    if (!value || (Array.isArray(value) && !value.length)) return message || t('Le champ est requis.')

    return null
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
