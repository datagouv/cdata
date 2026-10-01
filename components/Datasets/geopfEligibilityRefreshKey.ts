import type { InjectionKey } from 'vue'

// Lets the Files tab (which mutates resources) tell the admin dataset layout
// (which decides whether the geopf tab is shown) to recheck eligibility, so a
// newly-added resource surfaces the tab without a full page reload.
export type GeopfEligibilityRefresh = () => void
export const geopfEligibilityRefreshKey = Symbol() as InjectionKey<GeopfEligibilityRefresh>
