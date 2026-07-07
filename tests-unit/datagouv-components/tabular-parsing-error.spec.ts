import { expect, test } from 'vitest'
import { getParsingErrorMessage, getParsingErrorStep, hasTabularParsingError } from '~/datagouv-components/src/functions/resources'
import type { Resource } from '~/datagouv-components/src/types/resources'

const resourceWithError = (error?: unknown): Resource =>
  ({ extras: error === undefined ? {} : { 'analysis:parsing:error': error } } as unknown as Resource)

test('no parsing error is not fatal for tabular data', () => {
  expect(hasTabularParsingError(resourceWithError())).toBe(false)
})

// A huge geometry makes the pmtiles export time out while the tabular table is
// still built: the tabular data must stay available (data.gouv.fr catalogue bug).
test('pmtiles_export timeout does not block tabular data', () => {
  expect(hasTabularParsingError(
    resourceWithError('pmtiles_export:Task exceeded maximum timeout value (3600 seconds)'),
  )).toBe(false)
})

test('geojson_export error does not block tabular data', () => {
  expect(hasTabularParsingError(
    resourceWithError('geojson_export:Task exceeded maximum timeout value (3600 seconds)'),
  )).toBe(false)
})

test('a tabular parsing error is fatal', () => {
  expect(hasTabularParsingError(
    resourceWithError('parse_error:could not detect a valid CSV'),
  )).toBe(true)
})

test('an unprefixed error is treated as fatal', () => {
  expect(hasTabularParsingError(resourceWithError('something went wrong'))).toBe(true)
})

test('getParsingErrorStep extracts the failed step', () => {
  expect(getParsingErrorStep(resourceWithError('pmtiles_export:Task exceeded maximum timeout value (3600 seconds)'))).toBe('pmtiles_export')
  expect(getParsingErrorStep(resourceWithError('unprefixed message'))).toBe('unprefixed message')
  expect(getParsingErrorStep(resourceWithError())).toBe(null)
})

// The message keeps everything after the step prefix, including colons in the
// message itself (e.g. a timestamp).
test('getParsingErrorMessage strips only the step prefix', () => {
  expect(getParsingErrorMessage(resourceWithError('pmtiles_export:Task exceeded maximum timeout value (3600 seconds)'))).toBe('Task exceeded maximum timeout value (3600 seconds)')
  expect(getParsingErrorMessage(resourceWithError('unprefixed message'))).toBe('unprefixed message')
  expect(getParsingErrorMessage(resourceWithError())).toBe(null)
})
