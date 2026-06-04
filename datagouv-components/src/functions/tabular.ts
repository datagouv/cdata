import type { Component } from 'vue'
import {
  RiHashtag,
  RiPriceTag3Line,
  RiText,
  RiCalendarLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiCheckboxLine,
  RiMapPin2Line,
  RiGlobalLine,
  RiFocus3Line,
  RiFingerprintLine,
  RiMailLine,
  RiLinksLine,
  RiPhoneLine,
  RiUserLine,
  RiMoneyEuroCircleLine,
  RiPercentLine,
  RiBracesLine,
  RiCodeLine,
} from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import type { ColumnFilters, ColumnType } from '../components/TabularExplorer/types'

export function hasFilterForColumn(filters: Record<string, ColumnFilters>, column: string): boolean {
  const f = filters[column]
  if (!f) return false
  return !!(f.in?.length || f.exact != null || f.contains || f.null || f.min != null || f.max != null)
}

export interface TypeDisplay {
  icon: Component
  label: string
}

export function buildTypeConfig(t: (s: string) => string): Record<ColumnType, TypeDisplay> {
  return {
    number: { icon: RiHashtag, label: t('Nombre') },
    categorical: { icon: RiPriceTag3Line, label: t('Catégoriel') },
    text: { icon: RiText, label: t('Texte') },
    date: { icon: RiCalendarLine, label: t('Date') },
    boolean: { icon: RiCheckboxLine, label: t('Booléen') },
  }
}

// csv-detective formats that carry no semantic meaning beyond the generic
// display type already resolved by `ColumnType` — these fall back to
// `buildTypeConfig` (Texte / Nombre / Date / Booléen) in the header.
export const GENERIC_FORMATS = new Set(['string', 'int', 'float', 'date', 'bool', 'booleen'])

// Semantic types detected by csv-detective (see ../../../csv-detective/csv_detective/formats).
// The list is intentionally exhaustive, but unknown formats are tolerated:
// `getColumnDisplay` humanizes any format missing from this map.
export function buildFormatConfig(t: (s: string) => string): Record<string, TypeDisplay> {
  return {
    // Geo — territories & addresses
    adresse: { icon: RiMapPin2Line, label: t('Adresse') },
    commune: { icon: RiMapPin2Line, label: t('Commune') },
    code_commune: { icon: RiMapPin2Line, label: t('Code INSEE commune') },
    code_commune_insee: { icon: RiMapPin2Line, label: t('Code INSEE commune') },
    departement: { icon: RiMapPin2Line, label: t('Département') },
    code_departement: { icon: RiMapPin2Line, label: t('Code département') },
    region: { icon: RiMapPin2Line, label: t('Région') },
    code_region: { icon: RiMapPin2Line, label: t('Code région') },
    code_epci: { icon: RiMapPin2Line, label: t('Code EPCI') },
    code_postal: { icon: RiMapPin2Line, label: t('Code postal') },
    insee_canton: { icon: RiMapPin2Line, label: t('Canton') },
    code_fantoir: { icon: RiMapPin2Line, label: t('Code FANTOIR') },
    id_rnb: { icon: RiMapPin2Line, label: t('Identifiant RNB') },
    // Geo — countries
    pays: { icon: RiGlobalLine, label: t('Pays') },
    iso_country_code_alpha2: { icon: RiGlobalLine, label: t('Code pays (ISO α-2)') },
    iso_country_code_alpha3: { icon: RiGlobalLine, label: t('Code pays (ISO α-3)') },
    iso_country_code_numeric: { icon: RiGlobalLine, label: t('Code pays (ISO num.)') },
    // Geo — coordinates
    latitude_wgs: { icon: RiFocus3Line, label: t('Latitude') },
    latitude_wgs_fr_metropole: { icon: RiFocus3Line, label: t('Latitude') },
    longitude_wgs: { icon: RiFocus3Line, label: t('Longitude') },
    longitude_wgs_fr_metropole: { icon: RiFocus3Line, label: t('Longitude') },
    latitude_l93: { icon: RiFocus3Line, label: t('Latitude (Lambert 93)') },
    longitude_l93: { icon: RiFocus3Line, label: t('Longitude (Lambert 93)') },
    latlon_wgs: { icon: RiFocus3Line, label: t('Latitude / longitude') },
    lonlat_wgs: { icon: RiFocus3Line, label: t('Longitude / latitude') },
    // Identifiers
    siren: { icon: RiFingerprintLine, label: t('SIREN') },
    siret: { icon: RiFingerprintLine, label: t('SIRET') },
    code_rna: { icon: RiFingerprintLine, label: t('Identifiant RNA') },
    code_waldec: { icon: RiFingerprintLine, label: t('Identifiant WALDEC') },
    code_import: { icon: RiFingerprintLine, label: t('Code Import') },
    uai: { icon: RiFingerprintLine, label: t('UAI') },
    insee_ape700: { icon: RiFingerprintLine, label: t('Code APE') },
    code_csp_insee: { icon: RiFingerprintLine, label: t('Code CSP') },
    uuid: { icon: RiFingerprintLine, label: t('UUID') },
    mongo_object_id: { icon: RiFingerprintLine, label: t('Identifiant Mongo') },
    // Contact
    email: { icon: RiMailLine, label: t('Email') },
    url: { icon: RiLinksLine, label: t('URL') },
    tel_fr: { icon: RiPhoneLine, label: t('Téléphone') },
    username: { icon: RiUserLine, label: t('Nom d\'utilisateur') },
    // People
    sexe: { icon: RiUserLine, label: t('Sexe') },
    csp_insee: { icon: RiUserLine, label: t('Catégorie socio-pro.') },
    // Quantities
    money: { icon: RiMoneyEuroCircleLine, label: t('Montant') },
    percent: { icon: RiPercentLine, label: t('Pourcentage') },
    // Temporal
    year: { icon: RiCalendarLine, label: t('Année') },
    date_fr: { icon: RiCalendarLine, label: t('Date') },
    jour_de_la_semaine: { icon: RiCalendarEventLine, label: t('Jour de la semaine') },
    mois_de_lannee: { icon: RiCalendarEventLine, label: t('Mois de l\'année') },
    datetime_naive: { icon: RiTimeLine, label: t('Date et heure') },
    datetime_aware: { icon: RiTimeLine, label: t('Date et heure') },
    datetime_rfc822: { icon: RiTimeLine, label: t('Date et heure') },
    // Structured
    json: { icon: RiBracesLine, label: t('JSON') },
    geojson: { icon: RiBracesLine, label: t('GeoJSON') },
    binary: { icon: RiCodeLine, label: t('Binaire') },
  }
}

// Tolerant fallback for a semantic format we don't explicitly know about:
// "code_truc_machin" -> "Code truc machin".
export function humanizeFormat(format: string): string {
  const spaced = format.replace(/_/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function useFormatTabular() {
  const { locale } = useTranslation()

  function formatNumber(value: unknown): string {
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(locale)
  }

  function formatCellDate(value: unknown): string {
    if (value == null || value === '') return '–'
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
  }

  return { formatNumber, formatCellDate }
}

const TRUTHY_VALUES = ['true', '1', 'oui', 'yes']
const FALSY_VALUES = ['false', '0', 'non', 'no']

export function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return TRUTHY_VALUES.includes(value.toLowerCase())
  return Boolean(value)
}

export function isFalsy(value: unknown): boolean {
  if (typeof value === 'boolean') return !value
  if (typeof value === 'string') return FALSY_VALUES.includes(value.toLowerCase())
  return !value
}
