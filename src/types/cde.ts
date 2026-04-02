export interface Concept {
  name: string
  origin: string
  originId: string
}

export interface Designation {
  designation: string
  tags: string[]
  sources: string[]
}

export interface Definition {
  definition: string
  tags: string[]
  sources: string[]
}

export interface PermissibleValue {
  permissibleValue: string
  valueMeaning: string
}

export interface ValueDomain {
  datatype: string
  uom: string
  permissibleValues: PermissibleValue[]
  identifiers: unknown[]
  ids: unknown[]
}

export interface CdeSource {
  sourceName: string
  imported?: string
  registrationStatus?: string
  administrativeStatus?: string
  datatype?: string
}

export interface ReferenceDocument {
  document: string
  uri: string
  source: string
}

export interface CdeProperty {
  key: string
  value: string
  source: string
}

export interface ClassificationElement {
  name: string
  elements: ClassificationElement[]
}

export interface Classification {
  stewardOrg: { name: string }
  elements: ClassificationElement[]
}

export interface CdeDocument {
  _id: string
  tinyId: string
  elementType: string
  stewardOrg: { name: string }
  createdBy: { username: string }
  nihEndorsed: boolean
  archived: boolean
  registrationState: {
    registrationStatus: string
    administrativeStatus: string
  }
  designations: Designation[]
  definitions: Definition[]
  valueDomain: ValueDomain
  dataElementConcept: { concepts: Concept[] }
  objectClass: { concepts: Concept[] }
  property: { concepts: Concept[] }
  sources: CdeSource[]
  referenceDocuments: ReferenceDocument[]
  properties: CdeProperty[]
  classification: Classification[]
  ids: unknown[]
  partOfBundles: string[]
  // preserve any extra fields from the JSON
  [key: string]: unknown
}
