export type Harvest = Record<string, unknown> & {
  backend?: string
  doi?: string | null
} | null
