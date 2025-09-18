export type Badge = {
  kind: string
}

export type TranslatedBadge = Badge & {
  label: string
}

export type Badges = Array<Badge>
