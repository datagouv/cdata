import type { InjectionKey } from 'vue'

// Provided by EditoBlocs to tell the blocs whether search engines may follow the links leaving
// the site. Only for blocs written by the team, which keep helping the sites they point to:
// links chosen by users must not pass on the site's search ranking, or they become worth
// spamming for.
export const followLinksKey = Symbol() as InjectionKey<boolean>
