import { getShortDescription as getShortDescriptionFromPackage } from '@datagouv/components-next'

export function useDatasetShortDescription() {
  const getShortDescription = (description: string | null | undefined, descriptionShort: string | null | undefined) => {
    return getShortDescriptionFromPackage(description, descriptionShort)
  }
  
  return {
    getShortDescription
  }
}
