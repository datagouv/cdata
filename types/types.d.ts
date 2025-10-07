import type { AccessTypeForm, WithAccessType, Dataset, CommunityResource, Dataservice, DataserviceAccessAudience, Reuse, User, Frequency, Organization, License, ReuseType, RegisteredSchema, Resource, DataserviceAccessAudienceType, DataserviceAccessAudienceCondition, ContactPoint, PaginatedArray } from '@datagouv/components-next'

// Some types from @datagouv/components-next are exported here to avoid 50+ files refactors
export type {
  PaginatedArray,
}

export type AxisAlignment = 'start' | 'center' | 'end'

export type SortDirection = 'asc' | 'desc'

export type Sort = {
  name: string
  key: string
}

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type DSFRFormDefaultState = 'default'

export type DSFRFormFunctionalState = 'error' | 'success'

export type DSFRFormState = DSFRFormDefaultState | DSFRFormFunctionalState

export type FormFunctionalState = DSFRFormFunctionalState | 'warning'

export type AccordionFunctionalState = FormFunctionalState | 'disabled'

export type DSFRInfoState = 'info'

export type PublishingFormAccordionState = AccordionFunctionalState | DSFRInfoState

export type AccordionState = DSFRFormDefaultState | AccordionFunctionalState | DSFRInfoState

export type AdminBadgeState = DSFRFormDefaultState | FormFunctionalState | DSFRInfoState

export type AdminBadgeType = 'primary' | 'secondary' | 'warning' | 'danger' | 'success' | 'default' | 'pink'

export type DatasetSortedBy = 'title' | 'created' | 'last_update' | 'reuses' | 'followers' | 'views'

export type ResourceSortedBy = 'title' | 'type' | 'format' | 'created_at' | 'last_modified'

export type DataserviceSortedBy = 'title'

export type ReuseSortedBy = 'title' | 'created' | 'datasets' | 'followers' | 'views'

export type CommunityResourceSortedBy = 'created_at_internal' | 'last_modified_internal' | 'title'

// MEMBERS

export type MembershipStatus = 'pending' | 'accepted' | 'refused'

export type PendingMembershipRequest = {
  id: string
  user: User & { email: string }
  status: MembershipStatus
  created: string
  comment: string
}

export type MembershipRequest = PendingMembershipRequest & {
  handled_on: Date
  handled_by: User
}

export type RefusedMembershipRequest = MembershipRequest & {
  refusal_comment: string
}

export type MemberRole = 'admin' | 'editor'

// In org endpoint we get these two private information if we have edit rights on the org.
export type MemberUser = User & {
  email: string | null
  last_login_at: string | null
}

export type Member = {
  role: MemberRole
  user: MemberUser
  since: string
}

export type EditingMember = Member & {
  newRole?: MemberRole
}

export type MultiSelectOption = {
  label: string
  value: string
  image?: string
  hidden?: boolean
  selected?: boolean
  helper?: string
  description?: string
  recommended?: string
}

export type UserSuggest = Omit<User, 'avatar' | 'avatar_thumbnail' | 'roles' | 'pages'> & { avatar_url: string | null }
export type DatasetSuggest = Pick<Dataset, 'acronym' | 'id' | 'slug' | 'title' | 'page'> & { image_url: string | null }
export type DatasetReference = Dataservice['datasets'][0]
export type SpatialZone = {
  code: string
  id: string
  level: string
  name: string
  uri: string
}

export type SpatialGranularity = {
  id: string
  name: string
}

export type Tag = {
  text: string
}

type Owned = { organization: Organization, owner: null } | { owner: User, organization: null }

export type DatasetForm = {
  owned: Owned | null
  title: string
  acronym: string
  description: string
  tags: Array<Tag>
  license: License | null
  contact_points: Array<NewContactPoint | ContactPoint | null>
  temporal_coverage: { start: null | string, end: null | string }
  frequency: Frequency | null
  spatial_zones: Array<SpatialZone>
  spatial_granularity: SpatialGranularity | null
  private: boolean
  featured: boolean
} & AccessTypeForm

export type NewDatasetForApi = {
  title: string
  private?: boolean
  archived?: string | null
  deleted?: null
  acronym?: string
  description: string
  organization?: string
  owner?: string
  tags: Array<string>
  license?: string
  contact_points?: Array<string> | null
  temporal_coverage?: { start: string, end: string | null }
  frequency?: string
  spatial?: {
    granularity?: string
    zones?: Array<string> | null
  }
} & WithAccessType

export type ReuseSuggest = Pick<Reuse, 'acronym' | 'id' | 'slug' | 'title' | 'page'> & { image_url: string | null }

export type ReuseForm = {
  featured: boolean
  owned: Owned | null
  title: string
  url: string
  type: ReuseType | null
  topic: ReuseTopic | null
  description: string
  tags: Array<Tag>
  image: File | string | null
  private: boolean
  archived: string | null
}

export type NewReuseForApi = {
  organization?: string
  owner?: string
  title: string
  private?: boolean
  archived?: string | null
  deleted?: null
  description: string
  datasets: Array<string> | undefined
  url: string
  type: string | null
  topic: string | null
  tags: Array<string>
}

export type DataserviceForm = {
  featured: boolean
  owned: Owned | null
  title: string
  acronym: string
  description: string
  contact_points: Array<NewContactPoint | ContactPoint | null>
  base_api_url: string
  machine_documentation_url: string | null
  technical_documentation_url: string | null
  business_documentation_url: string | null
  rate_limiting: string
  availability: string
  private: boolean
} & AccessTypeForm

export type NewDataserviceForApi = {
  organization?: string
  owner?: string
  title: string
  archived_at?: string | null
  deleted_at?: null
  private?: boolean
  acronym?: string
  description: string
  datasets?: Array<string>
  contact_points?: Array<string> | null
  base_api_url: string | null
  machine_documentation_url: string | null
  technical_documentation_url: string | null
  business_documentation_url: string | null
  rate_limiting: string
  availability: number | null
} & WithAccessType

export type EnrichedLicense = License & { group: string, recommended?: boolean, code?: string, description?: string }

export type RemoteResourceFileType = 'remote'

export type FileResourceFileType = 'file'

export type ResourceFileType = RemoteResourceFileType | FileResourceFileType

export type BaseResourceForm = {
  resource: Resource | CommunityResource | null // Use to know if we update an existing resource or create a new resource
  title: string
  type: ResourceType
  description: string
  schema: RegisteredSchema | null
  schema_url: string | null

  checksum_type: string | null
  checksum_value: string | null
}

export type ResourceFormRemote = BaseResourceForm & {
  filetype: RemoteResourceFileType
  url: string
  mime: { text: string } | null
  format: string | null
}

export type UnknownResourceForm = BaseResourceForm & {
  filetype: null
  url?: string
  mime?: { text: string } | null
  format?: string | null
}

export type FileLoadingState = { status: 'waiting' } | { status: 'loading', percentage_between_0_and_1: number } | { status: 'failed', message: string } | { status: 'uploaded', resource: Resource }
export type FileInfo = { raw: File, state: FileLoadingState }

export type ResourceFormLocal = BaseResourceForm & {
  filetype: FileResourceFileType
  file: FileInfo | null
}

export type ResourceForm = ResourceFormRemote | ResourceFormLocal

export type AdditionalDataForCommunityResourceForm = {
  owned: Owned | null
  dataset: Dataset | DatasetV2 | DatasetSuggest | null
}
// Useful to be able to exclude by resource.type = 'remote' | 'file' some data
export type CommunityResourceForm = (ResourceFormRemote & AdditionalDataForCommunityResourceForm) | (ResourceFormLocal & AdditionalDataForCommunityResourceForm) | (UnknownResourceForm & AdditionalDataForCommunityResourceForm)

export type NewOrganization = {
  acronym: string | null
  name: string
  business_number_id: string | null
  description: string
  url: string | null
  logo: string
}

export type NewContactPoint = Omit<ContactPoint, 'id'>
export type ContactPointInForm = ContactPoint | NewContactPoint

export type LinkToSubject = {
  title: string
} & ({ page: string, self_web_url?: undefined } | { self_web_url: string, page?: undefined })

export type TransferRequest = {
  id: string
  user: User | null // TODO add this in API
  owner: (User & { class: 'User' }) | (Organization & { class: 'Organization' })
  recipient: (User & { class: 'User' }) | (Organization & { class: 'Organization' })
  subject: (Dataset & { class: 'Dataset' }) | (Reuse & { class: 'Reuse' }) | (LinkToSubject & Dataservice & { class: 'Dataservice' })
  comment: string
  created: string
  status: 'pending' | 'accepted' | 'refused'
  responded: string | null
  reponse_comment: string | null
}
