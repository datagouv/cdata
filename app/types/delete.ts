import type { Dataservice, DatasetV2, DatasetV2WithFullObject, Organization, Reuse, User } from '@datagouv/components-next'
import type { Comment, Thread } from '~/types/discussions'

export type ObjectType = 'dataset' | 'reuse' | 'dataservice' | 'organization' | 'user' | 'discussion' | 'comment'
export type MailOption = 'auto' | 'custom'
export type DeletableObject = DatasetV2 | DatasetV2WithFullObject | Reuse | Dataservice | Organization | User | Thread | Comment
