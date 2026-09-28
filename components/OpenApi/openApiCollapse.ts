import type { InjectionKey } from 'vue'

export type CollapseSignal = {
  target: boolean
  version: number
}

export const collapseSignalKey: InjectionKey<CollapseSignal> = Symbol('openApiCollapseSignal')

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
