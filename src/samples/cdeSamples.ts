import type { CdeDocument } from '@/types/cde'
import nhgriAgeFirstUsedNeedle from '@/samples/cde/nhgri-age-first-used-needle.json'

export interface CdeSample {
  id: string
  name: string
  menuLabel: string
  cde: CdeDocument
}

export const cdeSamples = [
  {
    id: 'nhgri-age-first-used-needle',
    name: 'sample.nhgri-age-first-used-needle.json',
    menuLabel: 'NHGRI: Age First Used Needle',
    cde: nhgriAgeFirstUsedNeedle as CdeDocument,
  },
] satisfies CdeSample[]

export type CdeSampleId = (typeof cdeSamples)[number]['id']
