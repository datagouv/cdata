import { getShortDescription as getShortDescriptionFromPackage } from '@datagouv/components-next'

export function useDatasetShortDescription() {
  const getShortDescription = async (description: string | null | undefined, descriptionShort: string | null | undefined) => {
    return await getShortDescriptionFromPackage(description, descriptionShort)
  }
  
  return {
    getShortDescription
  }
}
