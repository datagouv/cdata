import type { ComputedRef, Ref, WatchSource } from 'vue'

export type UseFetchOptions<DataT> = {
  key?: string
  method?: string
  query?: Record<string, unknown>
  params?: Record<string, unknown>
  body?: RequestInit['body'] | Record<string, unknown>
  headers?: Record<string, string> | [key: string, value: string][] | Headers
  baseURL?: string
  server?: boolean
  lazy?: boolean
  immediate?: boolean
  getCachedData?: (key: string, nuxtApp: unknown) => DataT
  deep?: boolean
  dedupe?: 'cancel' | 'defer'
  default?: () => DataT
  transform?: (input: DataT) => DataT | Promise<DataT>
  pick?: string[]
  watch?: WatchSource[] | false
}

export type AsyncData<DataT, ErrorT> = {
  data: Ref<DataT | null>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  clear: () => void
  error: Ref<ErrorT | null>
  status: Ref<AsyncDataRequestStatus>
}

export type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type UseFetchFunction = (<DataT, ErrorT>(
  url: string | Request | Ref<string | Request> | ComputedRef<string | null> | (() => string | Request),
  options?: UseFetchOptions<DataT>
) => Promise<AsyncData<DataT, ErrorT>>)
