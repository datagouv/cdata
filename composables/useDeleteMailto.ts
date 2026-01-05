type ObjectType = 'dataset' | 'reuse' | 'dataservice' | 'organization' | 'user' | 'discussion' | 'comment'

export function useDeleteMailto() {
  const { t } = useTranslation()
  const config = useRuntimeConfig()

  const getObjectTypeLabel = (type: ObjectType): string => {
    const labels: Record<ObjectType, string> = {
      dataset: t('jeu de données'),
      reuse: t('réutilisation'),
      dataservice: t('API'),
      organization: t('organisation'),
      user: t('compte'),
      discussion: t('discussion'),
      comment: t('commentaire'),
    }
    return labels[type]
  }

  const generateMailtoLink = (
    recipientEmails: string[],
    objectType: ObjectType,
    objectTitle?: string,
  ): string => {
    const siteName = config.public.title || 'data.gouv.fr'
    const typeLabel = getObjectTypeLabel(objectType)

    const subject = t('Suppression de votre {type} sur {site}', {
      type: typeLabel,
      site: siteName,
    })

    const body = t(`Bonjour,

Votre {type}{title} a été supprimé(e) de {site}.

Nos conditions d'utilisation précisent au point 5.1.2 que la plateforme n'est pas « destinée à diffuser des contenus publicitaires, des promotions d'intérêts privés, des contenus contraires à l'ordre public, des contenus illicites, du spam et toute contribution violant le cadre légal applicable. L'Éditeur se réserve le droit, sans préavis, de supprimer ou rendre inaccessible tout contenu publié sur la Plateforme n'ayant aucun lien avec son Objet. L'Éditeur n'effectue pas de contrôle "a priori" sur les publications. Dès que l'Éditeur a connaissance de contenus contraires aux présentes conditions d'utilisation, il agit rapidement pour les supprimer ou les rendre inaccessibles ».

Vous pouvez contester cette décision dans un délai de deux mois à compter de sa notification en formant un recours administratif (recours gracieux ou hiérarchique). Vous pouvez également saisir le tribunal administratif via l'application « Télérecours citoyens » (https://www.telerecours.fr).

Cordialement,
L'équipe {site}`, {
      type: typeLabel,
      title: objectTitle ? ` « ${objectTitle} »` : '',
      site: siteName,
    })

    const recipients = recipientEmails.join(',')
    return `mailto:${encodeURIComponent(recipients)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return {
    generateMailtoLink,
    getObjectTypeLabel,
  }
}
