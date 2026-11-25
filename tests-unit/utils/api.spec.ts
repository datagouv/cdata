import { describe, expect, it, vi } from 'vitest'
import { getApiErrorMessage } from '~/utils/api'

describe('getApiErrorMessage', () => {
  it('returns an empty string for string response data and logs a warning excerpt', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = '<html>Server Error</html>'

    expect(getApiErrorMessage(html)).toBe('')
    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith('[API] Non-JSON error response:', html)

    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('returns an empty string for null or undefined response data', () => {
    expect(getApiErrorMessage(null)).toBe('')
    expect(getApiErrorMessage(undefined)).toBe('')
  })

  it('extracts the `error` field when present', () => {
    expect(getApiErrorMessage({ error: 'Something went wrong' })).toBe('Something went wrong')
  })

  it('extracts the `message` field when present', () => {
    expect(getApiErrorMessage({ message: 'A message' })).toBe('A message')
  })

  it('prefers `error` over `message`', () => {
    expect(getApiErrorMessage({ error: 'First', message: 'Second' })).toBe('First')
  })

  it('formats an `errors` object into a human readable string', () => {
    expect(getApiErrorMessage({ errors: { name: 'required', email: 'invalid' } })).toBe('name: required ; email: invalid')
  })

  it('joins response.errors array when present', () => {
    expect(getApiErrorMessage({ response: { errors: ['bad', 'worse'] } })).toBe('bad ; worse')
  })
})
