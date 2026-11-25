import { useTranslation } from '../composables/useTranslation'
import type { Activity } from '../types/activity'

export function getActivityTranslation(activity: Activity): string {
  const { t } = useTranslation()

  // Simple mapping of activity keys to human-readable text
  const translations: Record<string, string> = {
    'dataset:created': t('a créé le jeu de données'),
    'dataset:updated': t('a mis à jour le jeu de données'),
    'dataset:deleted': t('a supprimé le jeu de données'),
    'dataset:discussed': t('a discuté du jeu de données'),
    'dataset:followed': t('suit le jeu de données'),
    'dataset:resource:added': t('a ajouté la ressource'),
    'dataset:resource:updated': t('a mis à jour la ressource'),
    'dataset:resource:deleted': t('a supprimé la ressource'),
    'dataservice:created': t('a créé le service de données'),
    'dataservice:updated': t('a mis à jour le service de données'),
    'dataservice:deleted': t('a supprimé le service de données'),
    'dataservice:discussed': t('a discuté du service de données'),
    'dataservice:followed': t('suit le service de données'),
    'organization:created': t('a créé l\'organisation'),
    'organization:updated': t('a mis à jour l\'organisation'),
    'organization:followed': t('suit l\'organisation'),
    'reuse:created': t('a créé la réutilisation'),
    'reuse:updated': t('a mis à jour la réutilisation'),
    'reuse:deleted': t('a supprimé la réutilisation'),
    'reuse:discussed': t('a discuté de la réutilisation'),
    'reuse:followed': t('suit la réutilisation'),
    'user:followed': t('suit l\'utilisateur'),
    'topic:created': t('a créé le sujet'),
    'topic:updated': t('a mis à jour le sujet'),
  }

  return translations[activity.key] || activity.label || activity.key
}

/**
 * `changes` holds the model attribute paths the backend recorded, which are neither
 * translated nor meant to be read as is.
 */
function getChangeLabels(): Record<string, string> {
  const { t } = useTranslation()

  return {
    // Shared across the models an activity can be about
    'title': t('Titre'),
    'name': t('Nom'),
    'acronym': t('Sigle'),
    'slug': t('Identifiant d\'URL'),
    'description': t('Description'),
    'description_short': t('Description courte'),
    'tags': t('Mots-clés'),
    'license': t('Licence'),
    'private': t('Visibilité'),
    'featured': t('Mise en avant'),
    'badges': t('Badges'),
    'owner': t('Propriétaire'),
    'organization': t('Organisation'),
    'archived': t('Archivage'),
    'archived_at': t('Archivage'),
    'archived_reason': t('Motif d\'archivage'),
    'deleted': t('Suppression'),
    'deleted_at': t('Suppression'),
    'extras': t('Données supplémentaires'),
    'url': t('URL'),
    'created_at': t('Date de création'),
    'created_at_internal': t('Date de création'),
    'last_modified_internal': t('Date de modification'),
    'spatial': t('Couverture géographique'),
    'spatial.zones': t('Couverture géographique (zones)'),
    'spatial.geom': t('Couverture géographique (tracé)'),
    'spatial.granularity': t('Granularité géographique'),
    'contact_points': t('Points de contact'),

    // Dataset
    'frequency': t('Fréquence de mise à jour'),
    'frequency_date': t('Date de prochaine mise à jour'),
    'temporal_coverage': t('Couverture temporelle'),
    'schema': t('Schéma'),
    'last_update': t('Date de dernière mise à jour'),
    'access_type': t('Type d\'accès'),
    'access_audiences': t('Publics concernés'),
    'access_type_reason_category': t('Motif de restriction d\'accès'),

    // Reuse
    'type': t('Type'),
    'image': t('Image'),
    'datasets': t('Jeux de données'),
    'dataservices': t('Services de données'),
    'topic': t('Thématique'),

    // Organization
    'image_url': t('Logo'),
    'logo': t('Logo'),
    'business_number_id': t('Numéro SIRET'),
    'presentation_blocs': t('Blocs de présentation'),
    'presentation_blocs_published_at': t('Publication des blocs de présentation'),
    'members': t('Membres'),
    'teams': t('Équipes'),
    'zone': t('Zone'),

    // Dataservice
    'base_api_url': t('URL de base de l\'API'),
    'machine_documentation_url': t('Documentation machine'),
    'technical_documentation_url': t('Documentation technique'),
    'business_documentation_url': t('Documentation fonctionnelle'),
    'rate_limiting': t('Limitation de débit'),
    'rate_limiting_url': t('URL de la limitation de débit'),
    'availability': t('Disponibilité'),
    'availability_url': t('URL de la disponibilité'),
    'format': t('Format'),
    'uri': t('URI'),
    'issued_at': t('Date de publication'),
    'modified_at': t('Date de modification'),
    'metadata_modified_at': t('Date de modification des métadonnées'),
    'backend': t('Moissonnage : connecteur'),
    'domain': t('Moissonnage : domaine'),
    'source_id': t('Moissonnage : identifiant de la source'),
    'source_url': t('Moissonnage : URL de la source'),
    'remote_id': t('Moissonnage : identifiant distant'),
    'remote_url': t('Moissonnage : URL distante'),

    // Topic
    'color': t('Couleur'),
    'elements': t('Éléments'),
  }
}

/**
 * The same attribute name can mean different things depending on what the activity is
 * about, `related_to_kind` being what tells them apart.
 */
const CHANGE_LABELS_BY_KIND: Record<string, Record<string, string>> = {
  Organization: { url: 'Site web' },
}

export function getActivityChangeLabel(activity: Activity, change: string): string {
  const { t } = useTranslation()
  const perKind = CHANGE_LABELS_BY_KIND[activity.related_to_kind]?.[change]
  if (perKind) return t(perKind)

  const labels = getChangeLabels()
  // An embedded attribute the backend reports on its own (`spatial.zones`) falls back
  // to the label of the attribute holding it rather than to its raw path.
  return labels[change] ?? labels[change.split('.')[0]!] ?? change
}
