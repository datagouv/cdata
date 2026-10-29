import { describe, expect, it, vi } from 'vitest'
import type { TabularProfileResponse } from '~/datagouv-components/src/components/TabularExplorer/types'
import { useResourceColumns } from '~/components/Charts/useResourceColumns'

function profileFor(names: Array<string>): TabularProfileResponse {
  return {
    profile: {
      header: names,
      columns: Object.fromEntries(names.map(name => [name, { format: 'int', python_type: 'int' }])),
      total_lines: 0,
      categorical: [],
    },
    deleted_at: null,
    dataset_id: 'dataset-1',
    indexes: null,
  }
}

describe('useResourceColumns', () => {
  it('builds the columns from the resource profile and fetches each resource once', async () => {
    const getProfile = vi.fn(async (id: string) => profileFor([`col-${id}`]))
    const { resourceColumns, loadColumnsForResource } = useResourceColumns(getProfile)

    await loadColumnsForResource('res-1')
    expect(resourceColumns.value.map(column => column.name)).toEqual(['col-res-1'])
    expect(resourceColumns.value[0]!.type).toBe('number')

    await loadColumnsForResource('res-1')
    expect(getProfile).toHaveBeenCalledTimes(1)
  })

  it('retries the same resource when the profile request fails', async () => {
    const getProfile = vi.fn()
      .mockRejectedValueOnce(new Error('tabular-api down'))
      .mockResolvedValueOnce(profileFor(['year', 'rate']))
    const { resourceColumns, loadColumnsForResource } = useResourceColumns(getProfile)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await loadColumnsForResource('res-1')
    expect(resourceColumns.value).toEqual([])

    await loadColumnsForResource('res-1')
    expect(getProfile).toHaveBeenCalledTimes(2)
    expect(resourceColumns.value.map(column => column.name)).toEqual(['year', 'rate'])
    error.mockRestore()
  })

  it('ignores a profile that resolves after the resource changed', async () => {
    let resolveFirst!: (profile: ReturnType<typeof profileFor>) => void
    const getProfile = vi.fn((id: string) => {
      if (id === 'res-1') {
        return new Promise<ReturnType<typeof profileFor>>((resolve) => {
          resolveFirst = resolve
        })
      }
      return Promise.resolve(profileFor(['col-res-2']))
    })
    const { resourceColumns, loadColumnsForResource } = useResourceColumns(getProfile)

    const first = loadColumnsForResource('res-1')
    await loadColumnsForResource('res-2')
    resolveFirst(profileFor(['col-res-1']))
    await first

    expect(resourceColumns.value.map(column => column.name)).toEqual(['col-res-2'])
  })

  it('ignores a failure from a resource that is no longer selected', async () => {
    let rejectSecond!: (error: Error) => void
    const getProfile = vi.fn((id: string) => {
      if (id === 'res-2') {
        return new Promise<ReturnType<typeof profileFor>>((_, reject) => {
          rejectSecond = reject
        })
      }
      return Promise.resolve(profileFor([`col-${id}`]))
    })
    const { resourceColumns, loadColumnsForResource } = useResourceColumns(getProfile)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await loadColumnsForResource('res-1')
    const second = loadColumnsForResource('res-2')
    await loadColumnsForResource('res-3')
    rejectSecond(new Error('tabular-api down'))
    await second

    expect(resourceColumns.value.map(column => column.name)).toEqual(['col-res-3'])
    error.mockRestore()
  })
})
