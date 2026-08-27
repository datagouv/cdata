import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h } from 'vue'
import FormattedDate from '~/datagouv-components/src/components/FormattedDate.vue'

// The bugs this component exists for only show up away from UTC: a value read as
// midnight UTC lands on the day before here, and "now" is a different day too.
beforeAll(() => {
  vi.stubEnv('TZ', 'America/Cayenne')
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 5, 10, 12, 0, 0))
})

afterAll(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

// The SSR output also carries the template's comments and Vue's fragment markers, and
// one of those comments spells out `data-allow-mismatch`: assert on the element alone.
async function render(props: InstanceType<typeof FormattedDate>['$props']) {
  const html = await renderToString(createSSRApp({ render: () => h(FormattedDate, props) }))
  return html.match(/<(time|span)[^>]*>.*?<\/\1>/s)?.[0] ?? html
}

describe('a plain date', () => {
  it('is not shifted by the reader being west of UTC', async () => {
    // `new Date('2026-04-24')` is midnight UTC, which is the 23rd here — the day the
    // value never mentioned.
    expect(await render({ date: '2026-04-24' })).toContain('24 avril 2026')
    expect(await render({ date: '2026-04' })).toContain('avril 2026')
  })

  it('announces its own precision and nothing finer', async () => {
    expect(await render({ date: '2026-04-24' })).toContain('datetime="2026-04-24"')
    expect(await render({ date: '2026-04' })).toContain('datetime="2026-04"')
    expect(await render({ date: '2026' })).toContain('datetime="2026"')
  })

  it('carries no title, having no moment to reveal', async () => {
    expect(await render({ date: '2026-04-24' })).not.toContain('title=')
    expect(await render({ date: '2026-04' })).not.toContain('title=')
  })

  it('claims no hydration mismatch, since nothing about it varies', async () => {
    expect(await render({ date: '2026-04-24' })).not.toContain('data-allow-mismatch')
  })

  it('still allows a mismatch on the relative forms, measured against now', async () => {
    expect(await render({ date: '2026-06-10', format: 'from-now' })).toContain('data-allow-mismatch')
  })
})

describe('an instant', () => {
  it('is rendered in the reader timezone, and says so', async () => {
    // 00:30 UTC on the 25th is still the 24th at 21:30 here: the shift is the point.
    const html = await render({ date: '2026-04-25T00:30:00Z' })
    expect(html).toContain('24 avril 2026')
    expect(html).toContain('datetime="2026-04-25T00:30:00.000Z"')
    expect(html).toContain('data-allow-mismatch')
  })

  it('reveals the exact moment on hover', async () => {
    expect(await render({ date: '2026-04-25T00:30:00Z' })).toContain('title="24 avril 2026 à 21:30"')
  })
})

describe('an unusable value', () => {
  it('renders an empty span rather than throwing in Intl', async () => {
    // Regression: formatting the raw prop made a truthy non-date reach
    // `Intl.DateTimeFormat.format(new Date(NaN))`, which throws a RangeError.
    expect(await render({ date: 'not a date' })).toEqual('<span></span>')
    expect(await render({ date: null })).toEqual('<span></span>')
    expect(await render({ date: undefined })).toEqual('<span></span>')
  })
})
