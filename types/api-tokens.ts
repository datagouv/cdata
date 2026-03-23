export type ApiTokenScope = 'admin'

export type ApiToken = {
  id: string
  token_prefix: string
  name: string | null
  scopes: ApiTokenScope[]
  kind: 'api_key'
  created_at: string
  last_used_at: string | null
  user_agents: string[]
  expires_at: string | null
}

export type ApiTokenCreated = ApiToken & {
  token: string
}
