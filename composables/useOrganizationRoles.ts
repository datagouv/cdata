import type { OrganizationRole } from '~/types/types'

/**
 * The roles a member can hold in an organization, with the label and the description
 * to show for each one. Both are translated by the API.
 */
export async function useOrganizationRoles() {
  return await useAPI<Array<OrganizationRole>>('/api/1/organizations/roles/', { lazy: true })
}
