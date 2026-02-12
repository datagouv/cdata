import type { App, Plugin } from 'vue'
import type { Activity, ActivityKey } from './types/activity.js'
import type { PaginatedArray } from './types/api.js'
import type { ContactPoint, ContactPointRole } from './types/contact_point.js'
import type { Badge, Badges, TranslatedBadge } from './types/badges'
import type { DatasetReference, Dataset, DatasetV2, DatasetV2WithFullObject, NewDataset, Quality, Rel } from './types/datasets'
import type { DataserviceReference, NewDataservice, Dataservice } from './types/dataservices'
import type { AccessType, AccessAudience, AccessAudienceCondition, AccessAudienceType, WithAccessType, AccessTypeForm } from './types/access_types'
import type { Frequency, Frequencies } from './types/frequency'
import type { Granularity, Granularities, SpatialZone } from './types/granularity'
import type { Harvest } from './types/harvest'
import type { License } from './types/licenses'
import type { Member, MemberRole, NewOrganization, Organization, OrganizationOrSuggest, OrganizationReference, OrganizationSuggest } from './types/organizations'
import type { Owned, OwnedWithFullObject, OwnedWithId } from './types/owned'
import type { Comment, Thread } from './types/discussions'
import type { Page, PageBloc, ContentBloc, BlocWithTitle, DatasetsListBloc, DataservicesListBloc, ReusesListBloc, LinkInBloc, LinksListBloc, MarkdownBloc, AccordionItemBloc, AccordionListBloc, HeroBloc } from './types/pages'
import type { Post } from './types/posts'
import type { ReuseReference, NewReuse, Reuse, ReuseTopic, ReuseType } from './types/reuses'
import type { RegisteredSchema, Schema, SchemaDetails, SchemaField, SchemaPath, SchemaPublicationMode, SchemaResponseData, SchemaVersion, ValidataError } from './types/schemas'
import type { TopicV2, TopicElement, TopicElementClass, TopicElementRel } from './types/topics'
import type { CommunityResource, FileResourceFileType, RemoteResourceFileType, ResourceFileType, ResourceGroup, ResourceType, Resource } from './types/resources'
import type { Site } from './types/site'
import type { Weight, WellType } from './types/ui'
import type { User, UserReference } from './types/users'
import type { Report, ReportSubject, ReportReason } from './types/reports'
import type { GlobalSearchConfig, SearchType, SortOption } from './types/search'
import { getDefaultDatasetConfig, getDefaultDataserviceConfig, getDefaultReuseConfig, getDefaultGlobalSearchConfig, defaultDatasetSortOptions, defaultDataserviceSortOptions, defaultReuseSortOptions } from './types/search'

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
import DiscussionMessageCard from './components/DiscussionMessageCard.vue'
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
import MarkdownViewer from './components/MarkdownViewer.vue'
import OrganizationCard from './components/OrganizationCard.vue'
import OrganizationLogo from './components/OrganizationLogo.vue'
import OrganizationNameWithCertificate from './components/OrganizationNameWithCertificate.vue'
import OwnerType from './components/OwnerType.vue'
import OwnerTypeIcon from './components/OwnerTypeIcon.vue'
import PaddedContainer from './components/PaddedContainer.vue'
import Pagination from './components/Pagination.vue'
import Placeholder from './components/Placeholder.vue'
import RadioGroup from './components/RadioGroup.vue'
import RadioInput from './components/RadioInput.vue'
import PostCard from './components/PostCard.vue'
import ReadMore from './components/ReadMore.vue'
import ResourceAccordion from './components/ResourceAccordion/ResourceAccordion.vue'
import ResourceIcon from './components/ResourceAccordion/ResourceIcon.vue'
import ResourceExplorer from './components/ResourceExplorer/ResourceExplorer.vue'
import ResourceExplorerSidebar from './components/ResourceExplorer/ResourceExplorerSidebar.vue'
import ResourceExplorerViewer from './components/ResourceExplorer/ResourceExplorerViewer.vue'
import Swagger from './components/ResourceAccordion/Swagger.client.vue'
import ReuseCard from './components/ReuseCard.vue'
import ReuseHorizontalCard from './components/ReuseHorizontalCard.vue'
import ReuseDetails from './components/ReuseDetails.vue'
import SchemaCard from './components/SchemaCard.vue'
import SimpleBanner from './components/SimpleBanner.vue'
import SmallChart from './components/SmallChart.vue'
import StatBox from './components/StatBox.vue'
import Tab from './components/Tabs/Tab.vue'
import TabGroup from './components/Tabs/TabGroup.vue'
import TabList from './components/Tabs/TabList.vue'
import TabPanel from './components/Tabs/TabPanel.vue'
import TabPanels from './components/Tabs/TabPanels.vue'
import Tooltip from './components/Tooltip.vue'
import Toggletip from './components/Toggletip.vue'
import TopicCard from './components/TopicCard.vue'
import TranslationT from './components/TranslationT.vue'
import GlobalSearch from './components/Search/GlobalSearch.vue'
import SearchInput from './components/Search/SearchInput.vue'
import SearchableSelect from './components/Form/SearchableSelect.vue'
import SelectGroup from './components/Form/SelectGroup.vue'
import type { UseFetchFunction } from './functions/api.types'
import { configKey, useComponentsConfig, type PluginConfig } from './config.js'

export { Toaster, toast } from 'vue-sonner'

export * from './composables/useActiveDescendant'
export * from './composables/useMetrics'
export * from './composables/useReuseType'
export * from './composables/useTranslation'

export * from './functions/activities'
export * from './functions/datasets'
export * from './functions/dates'
export * from './functions/description'
export * from './functions/helpers'
export * from './functions/markdown'
export * from './functions/matomo'
export * from './functions/metrics'
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
  GlobalSearchConfig,
  SearchType,
  SortOption,
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
  DatasetReference,
  Dataset,
  DatasetV2,
  DatasetV2WithFullObject,
  DataserviceReference,
  Dataservice,
  Comment,
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
  OrganizationReference,
  OrganizationSuggest,
  OrganizationOrSuggest,
  Owned,
  OwnedWithFullObject,
  OwnedWithId,
  Page,
  PageBloc,
  ContentBloc,
  BlocWithTitle,
  DatasetsListBloc,
  DataservicesListBloc,
  ReusesListBloc,
  LinkInBloc,
  LinksListBloc,
  MarkdownBloc,
  AccordionItemBloc,
  AccordionListBloc,
  HeroBloc,
  PaginatedArray,
  Post,
  Thread,
  Quality,
  RegisteredSchema,
  Rel,
  RemoteResourceFileType,
  Report,
  ReportSubject,
  ReportReason,
  Resource,
  ResourceFileType,
  ResourceGroup,
  ResourceType,
  ReuseReference,
  Reuse,
  ReuseTopic,
  ReuseType,
  Schema,
  SchemaDetails,
  SchemaField,
  SchemaPath,
  SchemaPublicationMode,
  SchemaResponseData,
  SchemaVersion,
  Site,
  SpatialZone,
  TranslatedBadge,
  TopicV2,
  TopicElement,
  TopicElementClass,
  TopicElementRel,
  User,
  UserReference,
  ValidataError,
  Weight,
  WellType,
}

export {
  getDefaultDatasetConfig,
  getDefaultDataserviceConfig,
  getDefaultReuseConfig,
  getDefaultGlobalSearchConfig,
  defaultDatasetSortOptions,
  defaultDataserviceSortOptions,
  defaultReuseSortOptions,
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
  DiscussionMessageCard,
  DatasetQuality,
  DatasetQualityInline,
  DatasetQualityItem,
  DatasetQualityScore,
  DatasetQualityTooltipContent,
  DateRangeDetails,
  ExtraAccordion,
  LabelTag,
  LoadingBlock,
  MarkdownViewer,
  OrganizationCard,
  OrganizationLogo,
  OrganizationNameWithCertificate,
  OwnerType,
  OwnerTypeIcon,
  PaddedContainer,
  Pagination,
  Placeholder,
  PostCard,
  RadioGroup,
  RadioInput,
  ReadMore,
  ResourceAccordion,
  ResourceExplorer,
  ResourceExplorerSidebar,
  ResourceExplorerViewer,
  ResourceIcon,
  ReuseCard,
  ReuseDetails,
  ReuseHorizontalCard,
  SchemaCard,
  SimpleBanner,
  SmallChart,
  StatBox,
  Swagger,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Tooltip,
  Toggletip,
  TopicCard,
  TranslationT,
  UserActivityList,
  GlobalSearch,
  SearchInput,
  SearchableSelect,
  SelectGroup,
}
