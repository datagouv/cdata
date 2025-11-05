import type { App, Plugin } from 'vue'
import type { Activity, ActivityKey } from './types/activity.js'
import type { PaginatedArray } from './types/api.js'
import type { ContactPoint, ContactPointRole } from './types/contact_point.js'
import type { Badge, Badges, TranslatedBadge } from './types/badges'
import type { Dataset, DatasetV2, DatasetV2WithFullObject, NewDataset, Quality, Rel } from './types/datasets'
import type { NewDataservice, Dataservice } from './types/dataservices'
import type { AccessType, AccessAudience, AccessAudienceCondition, AccessAudienceType, WithAccessType, AccessTypeForm } from './types/access_types'
import type { Frequency, Frequencies } from './types/frequency'
import type { Granularity, Granularities, SpatialZone } from './types/granularity'
import type { Harvest } from './types/harvest'
import type { License } from './types/licenses'
import type { Member, MemberRole, NewOrganization, Organization } from './types/organizations'
import type { Owned, OwnedWithId } from './types/owned'
import type { NewReuse, Reuse, ReuseTopic, ReuseType } from './types/reuses'
import type { TopicV2, TopicElement, TopicElementClass, TopicElementRel } from './types/topics'
import type { CommunityResource, FileResourceFileType, RemoteResourceFileType, ResourceFileType, ResourceType, Resource } from './types/resources'
import type { Site } from './types/site'
import type { Weight, WellType } from './types/ui'
import type { User } from './types/users'

import ActivityList from './components/ActivityList/ActivityList.vue'
import UserActivityList from './components/ActivityList/UserActivityList.vue'
import AnimatedLoader from './components/AnimatedLoader.vue'
import AppLink from './components/AppLink.vue'
import Avatar from './components/Avatar.vue'
import AvatarWithName from './components/AvatarWithName.vue'
import BannerAction from './components/BannerAction.vue'
import BrandedButton from './components/BrandedButton.vue'
import CopyButton from './components/CopyButton.vue'
import DataserviceCard from './components/DataserviceCard.vue'
import DatasetCard from './components/DatasetCard.vue'
import DateRangeDetails from './components/DateRangeDetails.vue'
import DatasetInformationPanel from './components/DatasetInformationPanel.vue'
import DatasetQuality from './components/DatasetQuality.vue'
import DatasetQualityInline from './components/DatasetQualityInline.vue'
import DatasetQualityItem from './components/DatasetQualityItem.vue'
import DatasetQualityScore from './components/DatasetQualityScore.vue'
import DatasetQualityTooltipContent from './components/DatasetQualityTooltipContent.vue'
import ExtraAccordion from './components/ExtraAccordion.vue'
import LabelTag from './components/DatasetLabelTag.vue'
import LoadingBlock from './components/LoadingBlock.vue'
import OrganizationCard from './components/OrganizationCard.vue'
import OrganizationNameWithCertificate from './components/OrganizationNameWithCertificate.vue'
import OwnerType from './components/OwnerType.vue'
import OwnerTypeIcon from './components/OwnerTypeIcon.vue'
import PaddedContainer from './components/PaddedContainer.vue'
import Pagination from './components/Pagination.vue'
import Placeholder from './components/Placeholder.vue'
import ReadMore from './components/ReadMore.vue'
import ResourceAccordion from './components/ResourceAccordion/ResourceAccordion.vue'
import ResourceIcon from './components/ResourceAccordion/ResourceIcon.vue'
import Swagger from './components/ResourceAccordion/Swagger.client.vue'
import ReuseCard from './components/ReuseCard.vue'
import ReuseDetails from './components/ReuseDetails.vue'
import SimpleBanner from './components/SimpleBanner.vue'
import StatBox from './components/StatBox.vue'
import Tab from './components/Tabs/Tab.vue'
import TabGroup from './components/Tabs/TabGroup.vue'
import TabList from './components/Tabs/TabList.vue'
import TabPanel from './components/Tabs/TabPanel.vue'
import TabPanels from './components/Tabs/TabPanels.vue'
import Tooltip from './components/Tooltip.vue'
import Toggletip from './components/Toggletip.vue'
import TranslationT from './components/TranslationT.vue'
import type { UseFetchFunction } from './functions/api.types'
import { configKey, useComponentsConfig, type PluginConfig } from './config.js'

export * from './composables/useActiveDescendant'
export * from './composables/useReuseType'
export * from './composables/useTranslation'

export * from './functions/activities'
export * from './functions/datasets'
export * from './functions/dates'
export * from './functions/helpers'
export * from './functions/markdown'
export * from './functions/matomo'
export * from './functions/never'
export * from './functions/organizations'
export * from './functions/owned'
export * from './functions/pagination'
export * from './functions/resources'
export * from './functions/reuses'
export * from './functions/schemas'
export * from './functions/users'
export * from './types/access_types'

export type {
  UseFetchFunction,
  AccessType,
  AccessAudience,
  AccessAudienceCondition,
  AccessAudienceType,
  WithAccessType,
  AccessTypeForm,
  Activity,
  ActivityKey,
  Badge,
  Badges,
  CommunityResource,
  ContactPoint,
  ContactPointRole,
  Dataset,
  DatasetV2,
  DatasetV2WithFullObject,
  Dataservice,
  NewDataservice,
  FileResourceFileType,
  Frequency,
  Frequencies,
  Granularity,
  Granularities,
  Harvest,
  License,
  Member,
  MemberRole,
  NewDataset,
  NewOrganization,
  NewReuse,
  Organization,
  Owned,
  OwnedWithId,
  PaginatedArray,
  Quality,
  Rel,
  RemoteResourceFileType,
  Resource,
  ResourceFileType,
  ResourceType,
  Reuse,
  ReuseTopic,
  ReuseType,
  Site,
  SpatialZone,
  TranslatedBadge,
  TopicV2,
  TopicElement,
  TopicElementClass,
  TopicElementRel,
  User,
  Weight,
  WellType,
}

// Vue Plugin
const datagouv: Plugin<PluginConfig> = {
  async install(app: App, options) {
    app.provide(configKey, options)
    if (!options.textClamp) {
      const textClamp = await import('vue3-text-clamp')
      options.textClamp = textClamp.default
    }
  },
}

export {
  datagouv,
  useComponentsConfig,
  ActivityList,
  AnimatedLoader,
  AppLink,
  Avatar,
  AvatarWithName,
  BannerAction,
  BrandedButton,
  CopyButton,
  DataserviceCard,
  DatasetCard,
  DatasetInformationPanel,
  DatasetQuality,
  DatasetQualityInline,
  DatasetQualityItem,
  DatasetQualityScore,
  DatasetQualityTooltipContent,
  DateRangeDetails,
  ExtraAccordion,
  LabelTag,
  LoadingBlock,
  OrganizationCard,
  OrganizationNameWithCertificate,
  OwnerType,
  OwnerTypeIcon,
  PaddedContainer,
  Pagination,
  Placeholder,
  ReadMore,
  ResourceAccordion,
  ResourceIcon,
  ReuseCard,
  ReuseDetails,
  SimpleBanner,
  StatBox,
  Swagger,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Tooltip,
  Toggletip,
  TranslationT,
  UserActivityList,
}
