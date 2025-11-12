import type { Dataset, Organization, Owned, RegisteredSchema } from '@datagouv/components-next'

export type AssociateSchemaForm = {
  owned: (Owned & { organization: Organization }) | null
  existingDataset: Dataset | null
  selectedSchema: RegisteredSchema | null
}

export type ValidationError = {
  title: string
  message: string
  type: string
  rowNumber: number
  fieldName?: string
  fieldNumber?: number
  cell?: string
}

export type ValidationReport = {
  report?: {
    valid: boolean
    errors?: ValidationError[]
    warnings?: string[]
    stats?: {
      errors: number
      warnings: number
      rows_processed: number
    }
  }
}
