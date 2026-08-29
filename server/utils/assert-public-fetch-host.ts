/**
 * Ensures a hostname is safe for server-initiated HTTP(S) fetches (SSRF mitigation).
 * Blocks literal private/reserved IPs and hostnames whose DNS answers include any such address.
 */

import type { LookupAddress } from 'node:dns'
import { lookup } from 'node:dns/promises'
import net from 'node:net'

function isForbiddenIPv4(ip: string): boolean {
  const parts = ip.split('.').map(p => Number(p))
  // Reject malformed strings (SSRF tricks, octal confusion, etc.): require four decimal octets 0–255.
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true
  }
  const [a, b] = parts

  // 127.0.0.0/8 — loopback (localhost, internal services bound to loopback only).
  if (a === 127) {
    return true
  }
  // 10.0.0.0/8 — RFC 1918 private class A.
  if (a === 10) {
    return true
  }
  // 172.16.0.0/12 — RFC 1918 private (172.16.x.x through 172.31.x.x).
  if (a === 172 && b >= 16 && b <= 31) {
    return true
  }
  // 192.168.0.0/16 — RFC 1918 private class C space.
  if (a === 192 && b === 168) {
    return true
  }
  // 169.254.0.0/16 — link-local (includes cloud instance metadata endpoints such as 169.254.169.254).
  if (a === 169 && b === 254) {
    return true
  }
  // 0.0.0.0/8 — "this network", non-routable / ambiguous on many stacks.
  if (a === 0) {
    return true
  }
  // 224.0.0.0/4 — multicast; 240.0.0.0/4 — reserved / future use. Not suitable targets for outbound fetches.
  if (a >= 224) {
    return true
  }
  return false
}

/** RFC 4291 IPv4-mapped IPv6: ::ffff: followed by 32 bits (dotted quad or two hextets). */
const IPV4_MAPPED_COMPRESSED = '::ffff:'
/** Same mapping in fully expanded form (no :: compression before ffff). */
const IPV4_MAPPED_EXPANDED = '0:0:0:0:0:ffff:'

const DOTTED_IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/
const TWO_HEXTETS = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i

function tailAfterIpv4MappedPrefix(normalizedIpv6: string): string | null {
  if (normalizedIpv6.startsWith(IPV4_MAPPED_COMPRESSED)) {
    return normalizedIpv6.slice(IPV4_MAPPED_COMPRESSED.length)
  }
  if (normalizedIpv6.startsWith(IPV4_MAPPED_EXPANDED)) {
    return normalizedIpv6.slice(IPV4_MAPPED_EXPANDED.length)
  }
  return null
}

/** Last 32 bits of an IPv4-mapped address given as two 16-bit words (e.g. c0a8 and 0001 → 192.168.0.1). */
function dottedIpv4FromMappedWords(highU16: number, lowU16: number): string | null {
  const o1 = (highU16 >> 8) & 0xff
  const o2 = highU16 & 0xff
  const o3 = (lowU16 >> 8) & 0xff
  const o4 = lowU16 & 0xff
  const dotted = `${o1}.${o2}.${o3}.${o4}`
  return net.isIP(dotted) === 4 ? dotted : null
}

/**
 * If `ipv6` is an IPv4-mapped address in a strict canonical form, returns the embedded IPv4 string.
 * Only `::ffff:…` and `0:0:0:0:0:ffff:…` prefixes are accepted so unrelated `ffff` labels are ignored.
 */
function ipv4MappedEmbedded(ipv6: string): string | null {
  const norm = ipv6.toLowerCase()
  const payload = tailAfterIpv4MappedPrefix(norm)
  if (!payload) {
    return null
  }
  if (DOTTED_IPV4.test(payload)) {
    return payload
  }
  const parts = TWO_HEXTETS.exec(payload)
  if (!parts) {
    return null
  }
  const high = Number.parseInt(parts[1], 16)
  const low = Number.parseInt(parts[2], 16)
  if (!Number.isFinite(high) || !Number.isFinite(low)) {
    return null
  }
  return dottedIpv4FromMappedWords(high, low)
}

function ipv6FirstHextet(ipv6: string): number {
  const s = ipv6.toLowerCase()
  const doubleIdx = s.indexOf('::')
  if (doubleIdx === -1) {
    const seg = s.split(':')[0] || '0'
    return Number.parseInt(seg, 16) || 0
  }
  if (doubleIdx === 0) {
    return 0
  }
  const left = s.slice(0, doubleIdx)
  const first = left.split(':').filter(Boolean)[0] ?? '0'
  return Number.parseInt(first, 16) || 0
}

function isForbiddenIPv6(ip: string): boolean {
  if (net.isIP(ip) !== 6) {
    return true
  }
  const norm = ip.toLowerCase()
  if (norm === '::1' || norm === '0:0:0:0:0:0:0:1') {
    return true
  }
  const mapped = ipv4MappedEmbedded(norm)
  if (mapped) {
    return isForbiddenIPv4(mapped)
  }
  const first = ipv6FirstHextet(norm)
  if (first >= 0xfe80 && first <= 0xfebf) {
    return true
  }
  if (first >= 0xfc00 && first <= 0xfdff) {
    return true
  }
  return false
}

function isForbiddenHostAddress(address: string, family: number): boolean {
  if (family === 4) {
    return isForbiddenIPv4(address)
  }
  if (family === 6) {
    return isForbiddenIPv6(address)
  }
  return true
}

/**
 * @param hostname - `URL.hostname` (already punycode for IDN)
 * @param rejectedErrorMessage - thrown when the host must not be fetched
 */
export async function assertPublicFetchHost(hostname: string, rejectedErrorMessage: string): Promise<void> {
  if (!hostname) {
    throw new Error(rejectedErrorMessage)
  }

  const literalKind = net.isIP(hostname)
  if (literalKind === 4) {
    if (isForbiddenIPv4(hostname)) {
      throw new Error(rejectedErrorMessage)
    }
    return
  }
  if (literalKind === 6) {
    if (isForbiddenIPv6(hostname)) {
      throw new Error(rejectedErrorMessage)
    }
    return
  }

  let records: LookupAddress[]
  try {
    records = await lookup(hostname, { all: true, verbatim: true })
  }
  catch {
    throw new Error(rejectedErrorMessage)
  }
  if (!records.length) {
    throw new Error(rejectedErrorMessage)
  }
  for (const r of records) {
    if (isForbiddenHostAddress(r.address, r.family)) {
      throw new Error(rejectedErrorMessage)
    }
  }
}
