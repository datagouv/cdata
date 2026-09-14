// A page slug addresses a file inside `pages/` of the pages repository. The
// fetched file is then compiled and rendered as a Vue template, so a slug able to
// climb out of `pages/` turns "read an arbitrary file" into "run arbitrary code
// in the server process": strict, allowlist-based validation is a security
// boundary, not a nicety. It runs before the upstream URL is ever built.
//
// Real slugs are letters, digits, `-`, `_`, `.` and `/` as a subdirectory
// separator, e.g. `donnees_sante` or `legal/licences/etalab-2.0` (the dot is why
// `.` is part of the charset). Validation is per path segment: each segment must
// start with an alphanumeric, which rejects `..`, `.`, hidden files and empty
// segments outright, and may only contain the safe charset, which rejects `\`,
// `%` and every encoded traversal — the blocklist those bypassed (`../`) never
// enters the picture.
const SLUG_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

export function isSafePageSlug(slug: string): boolean {
  return slug.split('/').every(segment => SLUG_SEGMENT.test(segment))
}
