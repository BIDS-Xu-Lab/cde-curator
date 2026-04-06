import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCdeStore } from '@/stores/cdeStore'
import type { CdeDocument } from '@/types/cde'

const minimalCde: CdeDocument = {
  _id: 'test-id',
  tinyId: 'test-tiny',
  elementType: 'cde',
  stewardOrg: { name: 'TEST' },
  createdBy: { username: 'user' },
  nihEndorsed: false,
  archived: false,
  registrationState: { registrationStatus: 'Draft', administrativeStatus: 'Not Endorsed' },
  designations: [],
  definitions: [],
  valueDomain: { datatype: 'Text', uom: '', permissibleValues: [], identifiers: [], ids: [] },
  dataElementConcept: { concepts: [] },
  objectClass: { concepts: [] },
  property: { concepts: [] },
  sources: [],
  referenceDocuments: [],
  properties: [],
  classification: [],
  ids: [],
  partOfBundles: [],
}

function mockFileHandle(name: string, cde: CdeDocument): FileSystemFileHandle {
  return {
    name,
    kind: 'file' as const,
    getFile: vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(cde)),
    }),
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as FileSystemFileHandle
}

describe('cdeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty with no active file', () => {
    const store = useCdeStore()
    expect(store.files).toHaveLength(0)
    expect(store.activeIndex).toBeNull()
    expect(store.activeFile).toBeNull()
  })

  it('loadFiles adds entries and auto-selects the first', async () => {
    const store = useCdeStore()
    const handle = mockFileHandle('test.json', minimalCde)
    await store.loadFiles([handle])
    expect(store.files).toHaveLength(1)
    expect(store.files[0].name).toBe('test.json')
    expect(store.files[0].dirty).toBe(false)
    expect(store.activeIndex).toBe(0)
    expect(store.activeFile?.name).toBe('test.json')
  })

  it('loadFiles appends to existing list without resetting activeIndex', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('a.json', minimalCde)])
    await store.loadFiles([mockFileHandle('b.json', minimalCde)])
    expect(store.files).toHaveLength(2)
    expect(store.activeIndex).toBe(0) // unchanged
  })

  it('selectFile sets activeIndex', async () => {
    const store = useCdeStore()
    await store.loadFiles([
      mockFileHandle('a.json', minimalCde),
      mockFileHandle('b.json', minimalCde),
    ])
    store.selectFile(1)
    expect(store.activeIndex).toBe(1)
    expect(store.activeFile?.name).toBe('b.json')
  })

  it('updateCde merges patch into active CDE and marks dirty', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('test.json', minimalCde)])
    store.updateCde({ archived: true })
    expect(store.files[0].cde.archived).toBe(true)
    expect(store.files[0].dirty).toBe(true)
  })

  it('updateCde does nothing when no active file', () => {
    const store = useCdeStore()
    expect(() => store.updateCde({ archived: true })).not.toThrow()
  })

  it('saveActive writes JSON to file handle and clears dirty flag', async () => {
    const store = useCdeStore()
    const handle = mockFileHandle('test.json', minimalCde)
    await store.loadFiles([handle])
    store.updateCde({ archived: true })
    expect(store.files[0].dirty).toBe(true)
    await store.saveActive()
    const writableMock = await (handle.createWritable as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(writableMock.write).toHaveBeenCalledWith(
      expect.stringContaining('"archived": true')
    )
    expect(store.files[0].dirty).toBe(false)
  })

  it('saveActive does nothing when no active file', async () => {
    const store = useCdeStore()
    await expect(store.saveActive()).resolves.toBeUndefined()
  })

  it('loadSample adds the bundled sample and selects it', () => {
    const store = useCdeStore()
    store.loadSample('nhgri-age-first-used-needle')
    expect(store.files).toHaveLength(1)
    expect(store.files[0].source).toBe('sample')
    expect(store.files[0].name).toBe('sample.nhgri-age-first-used-needle.json')
    expect(store.activeIndex).toBe(0)
    expect(store.canSaveActive).toBe(false)
  })

  it('loadSample replaces an existing bundled sample instead of appending duplicates', () => {
    const store = useCdeStore()
    store.loadSample('nhgri-age-first-used-needle')
    store.updateCde({ archived: true })
    expect(store.files[0].dirty).toBe(true)
    store.loadSample('nhgri-age-first-used-needle')
    expect(store.files).toHaveLength(1)
    expect(store.files[0].cde.archived).toBe(false)
    expect(store.files[0].dirty).toBe(false)
  })

  it('saveActive does nothing for a bundled sample without a file handle', async () => {
    const store = useCdeStore()
    store.loadSample('nhgri-age-first-used-needle')
    store.updateCde({ archived: true })
    await expect(store.saveActive()).resolves.toBeUndefined()
    expect(store.files[0].dirty).toBe(true)
  })

  it('loadFolder loads only .json files from a directory handle', async () => {
    const store = useCdeStore()
    const jsonHandle = mockFileHandle('a.json', minimalCde)
    const txtHandle = { name: 'readme.txt', kind: 'file' as const } as unknown as FileSystemFileHandle
    const dirHandle = {
      values: vi.fn().mockReturnValue(
        (async function* () {
          yield jsonHandle
          yield txtHandle
        })()
      ),
    } as unknown as FileSystemDirectoryHandle
    await store.loadFolder(dirHandle)
    expect(store.files).toHaveLength(1)
    expect(store.files[0].name).toBe('a.json')
  })

  it('saveActive calls close on the writable stream', async () => {
    const store = useCdeStore()
    const handle = mockFileHandle('test.json', minimalCde)
    await store.loadFiles([handle])
    await store.saveActive()
    const writableMock = await (handle.createWritable as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(writableMock.close).toHaveBeenCalled()
  })

  it('replaceCde fully replaces the CDE and marks dirty', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('test.json', minimalCde)])
    const replacement = { ...minimalCde, tinyId: 'replaced', archived: true }
    store.replaceCde(replacement)
    expect(store.files[0].cde.tinyId).toBe('replaced')
    expect(store.files[0].cde.archived).toBe(true)
    expect(store.files[0].dirty).toBe(true)
  })
})
