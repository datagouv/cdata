export type DSFRFormDefaultState = 'default'

export type DSFRFormFunctionalState = 'error' | 'success'

export type DSFRFormState = DSFRFormDefaultState | DSFRFormFunctionalState

export type FormFunctionalState = DSFRFormFunctionalState | 'warning'

export type AccordionFunctionalState = FormFunctionalState | 'disabled'

export type DSFRInfoState = 'info'

export type PublishingFormAccordionState = AccordionFunctionalState | DSFRInfoState

export type AccordionState = DSFRFormDefaultState | AccordionFunctionalState | DSFRInfoState

export type DatasetSearchParams = {
  q?: string
  sort?: string
  organization?: string
  page?: string
  organization_badge?: string
  tag?: string
  badge?: string
  format?: string
  license?: string
  schema?: string
  geozone?: string
  granularity?: string
  page_size?: string
}

export type DataserviceSearchParams = {
  q?: string
  sort?: string
  is_restricted?: boolean
  organization?: string
  page?: string
  page_size?: string
}

export type OrganizationSearchParams = {
  q?: string
  sort?: string
  page?: string
  page_size?: string
}

export type ReuseSearchParams = {
  q?: string
  sort?: string
  tag?: string
  topic?: string
  page?: string
  page_size?: string
}

export type FieldsErrors = Record<string, Array<string>>
