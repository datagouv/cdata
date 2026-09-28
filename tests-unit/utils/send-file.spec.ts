import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FileInfo, ResourceForm } from '~/types/types'
import { sendFile } from '~/utils/datasets'

const CHUNK_SIZE = 100

type RecordedCall = { url: string, fields: Record<string, FormDataEntryValue> }

function setupFileApi(impl?: () => Promise<unknown>) {
  const calls: RecordedCall[] = []
  const fileApi = vi.fn(async (url: string, options: { body: FormData }) => {
    calls.push({ url, fields: Object.fromEntries(options.body.entries()) })
    if (impl) return await impl()
    return { id: 'resource-1' }
  })
  vi.stubGlobal('useNuxtApp', () => ({ $fileApi: fileApi }))
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { resourceFileUploadChunk: CHUNK_SIZE } }))
  return { calls, fileApi }
}

function makeForm(size: number): { resourceForm: ResourceForm, fileInfo: FileInfo } {
  const fileInfo = {
    raw: new File(['x'.repeat(size)], 'data.bin', { type: 'application/octet-stream' }),
    state: null,
  } as unknown as FileInfo
  const resourceForm = { filetype: 'file', title: 'My file', file: fileInfo } as ResourceForm
  return { resourceForm, fileInfo }
}

// These tests pin the udata chunked-upload protocol: the complementary e2e
// test (tests/datasets/chunked-upload.spec.ts) checks the end result but not
// the fields of each chunk request.
describe('sendFile', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends a small file in a single multipart request', async () => {
    const { calls } = setupFileApi()
    const { resourceForm, fileInfo } = makeForm(CHUNK_SIZE)

    const resource = await sendFile('/upload/', resourceForm, fileInfo)

    // A file of exactly the chunk size is NOT chunked (strict `>`)
    expect(calls).toHaveLength(1)
    expect(calls[0].fields.filename).toEqual('data.bin')
    expect(calls[0].fields.file).toBeInstanceOf(File)
    expect(calls[0].fields.totalparts).toBeUndefined()
    expect(fileInfo.state).toEqual({ status: 'uploaded', resource })
  })

  it('splits a large file in chunks then sends a final request without the file', async () => {
    const { calls } = setupFileApi()
    const { resourceForm, fileInfo } = makeForm(250)

    await sendFile('/upload/', resourceForm, fileInfo)

    expect(calls).toHaveLength(4)

    const chunks = calls.slice(0, 3)
    expect(chunks.map(c => c.fields.partindex)).toEqual(['0', '1', '2'])
    expect(chunks.map(c => c.fields.partbyteoffset)).toEqual(['0', '100', '200'])
    expect(chunks.map(c => c.fields.chunksize)).toEqual(['100', '100', '50'])
    for (const chunk of chunks) {
      expect(chunk.fields.totalparts).toEqual('3')
      expect(chunk.fields.filename).toEqual('data.bin')
      expect(chunk.fields.uuid).toEqual(calls[0].fields.uuid)
    }

    const finalCall = calls[3]
    expect(finalCall.fields.file).toBeUndefined()
    expect(finalCall.fields.totalparts).toEqual('3')
    expect(finalCall.fields.uuid).toEqual(calls[0].fields.uuid)
  })

  it('retries a failing chunk 3 times before giving up', async () => {
    const { fileApi } = setupFileApi(() => Promise.reject(new Error('boom')))
    const { resourceForm, fileInfo } = makeForm(250)

    await expect(sendFile('/upload/', resourceForm, fileInfo)).rejects.toThrowError('Échec du téléchargement du fichier My file')
    // 1 attempt + 3 retries on the first chunk, then the upload stops
    expect(fileApi).toHaveBeenCalledTimes(4)
    expect(fileInfo.state).toMatchObject({ status: 'failed' })
  })

  it('surfaces the server error message in the failed state', async () => {
    setupFileApi(() => Promise.reject(Object.assign(new Error('boom'), { data: { message: 'Fichier invalide' } })))
    const { resourceForm, fileInfo } = makeForm(10)

    await expect(sendFile('/upload/', resourceForm, fileInfo)).rejects.toThrowError('Échec du téléchargement du fichier My file')
    expect(fileInfo.state).toEqual({ status: 'failed', message: 'Fichier invalide' })
  })

  it('does not re-upload an already uploaded file', async () => {
    const { fileApi } = setupFileApi()
    const { resourceForm, fileInfo } = makeForm(10)
    const resource = { id: 'resource-1' }
    fileInfo.state = { status: 'uploaded', resource } as FileInfo['state']

    expect(await sendFile('/upload/', resourceForm, fileInfo)).toEqual(resource)
    expect(fileApi).not.toHaveBeenCalled()
  })

  it('refuses remote resources and foreign file infos', async () => {
    setupFileApi()
    const { resourceForm, fileInfo } = makeForm(10)

    await expect(sendFile('/upload/', { ...resourceForm, filetype: 'remote' } as ResourceForm, fileInfo))
      .rejects.toThrowError('`sendFile` needs to be called only with local files')

    const { fileInfo: otherFileInfo } = makeForm(10)
    await expect(sendFile('/upload/', resourceForm, otherFileInfo))
      .rejects.toThrowError('`sendFile` was called with a `fileInfo` not belonging to this `resourceForm`')
  })
})
