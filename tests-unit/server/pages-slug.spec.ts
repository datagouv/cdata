import { describe, expect, it } from 'vitest'
import { isSafePageSlug } from '~/server/utils/pages-slug'

describe('isSafePageSlug', () => {
  // Real slugs taken from datagouv/datagouvfr-pages (extension stripped). The dot
  // in the etalab licences is the reason `.` is allowed at all.
  it.each([
    'donnees-energie',
    'donnees_actualites',
    'roadmap',
    'legal/cgu',
    'legal/licences/etalab-2.0',
    'legal/licences/etalab-1.0',
    'onboarding/prise_appel_secours',
    'udata/3/the-road-to-udata-3',
    'about/a-propos_data-gouv',
  ])('accepts the legitimate slug %j', (slug) => {
    expect(isSafePageSlug(slug)).toBe(true)
  })

  // Slugs as they reach the handler, i.e. already URL-decoded by h3. The report's
  // working exploit uses backslashes (`..%5c` decoded to `..\`), which the WHATWG
  // URL parser treats as a path separator; the others are the encodings it also
  // tried. All must be rejected, decoded or not.
  it.each([
    '..\\..\\..\\..\\microsoft/vscode/main/README', // the exploit that reaches raw.githubusercontent.com root
    '..\\..\\..\\..\\rudyzulemie/render-fixtures/main/page',
    '../../../../microsoft/vscode/main/README',
    '..%2f..%2f..%2f..%2fx', // percent kept literal: still rejected
    '%2e%2e/x',
    '..;/x',
    '../etc/passwd',
    'foo/../bar',
    'foo/..', // trailing traversal segment
    '.git/config', // hidden file, not a page
    'foo\\bar',
    'foo%2e%2ebar',
    '', // empty slug
    '/leading-slash',
    'trailing-slash/',
    'double//slash',
  ])('rejects the traversal or malformed slug %j', (slug) => {
    expect(isSafePageSlug(slug)).toBe(false)
  })
})
