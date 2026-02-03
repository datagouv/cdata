import type { InjectionKey, Ref } from 'vue'

export type RadioGroupContext = {
  name: Ref<string>
  modelValue: Ref<string>
  select: (value: string) => void
}

export const radioGroupInjectionKey: InjectionKey<RadioGroupContext> = Symbol('radioGroup')
