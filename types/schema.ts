import type { Dataset, Organization, Owned, RegisteredSchema } from '@datagouv/components-next'

export type AssociateSchemaForm = {
  owned: (Owned & { organization: Organization }) | null
  existingDataset: Dataset | null
  selectedSchema: RegisteredSchema | null
}
