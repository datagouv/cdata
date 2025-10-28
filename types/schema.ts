import type { DatasetV2, Organization, RegisteredSchema } from '@datagouv/components-next'
import type { DatasetSuggest } from './types'

export type AssociateSchemaForm = {
  owned: Organization | null
  existingDataset: DatasetV2 | DatasetSuggest | null
  selectedSchema: RegisteredSchema | null
}
