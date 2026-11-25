<template>
  <div class="container mb-7">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ title }}
      </BreadcrumbItem>
    </Breadcrumb>
    <article :class="markdownClasses">
      <h1>{{ $t('Politique de confidentialité') }}</h1>
      <p>
        {{ $t('La DINUM est responsable de traitement des données à caractère personnel réalisés par data.gouv.fr. Elle s’engage à assurer un traitement de ces données conforme au Règlement (UE) 2016/679 relatif à la protection des données à caractère personnel et à la libre circulation de ces données et à la loi n° 78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés.') }}
      </p>

      <h2>{{ $t('Quelles sont les données traitées ?') }}</h2>
      <p>
        {{ $t('Ne sont traitées que les données strictement nécessaires au fonctionnement du service. Ces données ne pourront en aucun cas servir au contrôle et à la surveillance de l’activité des Utilisateurs et Utilisatrices. Les données à caractère personnel concernées sont les suivantes :') }}
      </p>
      <ul>
        <li><strong>{{ $t('Données relatives au Contributeur qui s’inscrit') }}</strong>{{ $t(' : nom, prénom, adresse e-mail ;') }}</li>
        <li><strong>{{ $t('Données relatives à la newsletter') }}</strong>{{ $t(' : adresse e-mail.') }}</li>
      </ul>

      <h2>{{ $t('Pourquoi traitons-nous des données à caractère personnel ?') }}</h2>
      <p>
        <TranslationT keypath="{site} est la plateforme nationale ouverte et communautaire qui vise à centraliser et structurer les données ouvertes présentant un intérêt public. Elle s’adresse à ceux qui produisent des données et qui souhaitent ouvrir leurs données, à ceux qui exploitent des données et qui veulent télécharger des données et partager leurs réalisations, à toute personne qui souhaite découvrir des données ou trouver une information. La plateforme traite des données identifiantes pour permettre à des Contributeurs de publier des jeux de données et des réutilisations.">
          <template #site>
            <CdataLink to="/">
              data.gouv.fr
            </CdataLink>
          </template>
        </TranslationT>
      </p>

      <h2>{{ $t('Qu’est-ce qui nous autorise à traiter des données à caractère personnel ?') }}</h2>
      <p>
        <TranslationT keypath="{site} traite des données à caractère personnel en se basant sur :">
          <template #site>
            <CdataLink to="/">
              data.gouv.fr
            </CdataLink>
          </template>
        </TranslationT>
      </p>
      <ul>
        <li>{{ $t('L’exécution d’une mission d’intérêt public dont est investi le responsable de traitement au sens de l’article 6-1 e) du RGPD.') }}</li>
      </ul>
      <p>
        {{ $t('Cette mission d’intérêt public se traduit en pratique par :') }}
      </p>
      <ul>
        <li>
          <TranslationT keypath="Le {decree} relatif au système d’information et de communication de l’Etat et à la direction interministérielle du numérique, notamment son article 6 ;">
            <template #decree>
              <CdataLink
                to="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000039281619"
                external
              >
                {{ $t('décret n° 2019-1088 du 25 octobre 2019') }}
              </CdataLink>
            </template>
          </TranslationT>
        </li>
        <li>
          <TranslationT keypath="La {circular} relative à la création du portail unique des informations publiques de l’État “data.gouv.fr” ;">
            <template #circular>
              <CdataLink
                to="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000024072788"
                external
              >
                {{ $t('circulaire du 26 mai 2011') }}
              </CdataLink>
            </template>
          </TranslationT>
        </li>
        <li>
          <TranslationT keypath="La {circular} relative à la politique publique de la donnée, des algorithmes et des codes sources.">
            <template #circular>
              <CdataLink
                to="https://www.legifrance.gouv.fr/circulaire/id/45162"
                external
              >
                {{ $t('circulaire du 27 avril 2021') }}
              </CdataLink>
            </template>
          </TranslationT>
        </li>
      </ul>

      <h2>{{ $t('Pendant combien de temps conservons-nous ces données ?') }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ $t('Catégories de données') }}</th>
            <th>{{ $t('Durées de conservation') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $t('Données relatives au Contributeur qui s’inscrit') }}</td>
            <td>{{ $t('Les données sont supprimées 3 ans après le dernier contact avec le Contributeur inscrit') }}</td>
          </tr>
          <tr>
            <td>{{ $t('Données relatives à la newsletter') }}</td>
            <td>{{ $t('Jusqu’à la désinscription de l’abonné') }}</td>
          </tr>
        </tbody>
      </table>

      <h2>{{ $t('Qui peut avoir accès à ces données ?') }}</h2>
      <p>
        {{ $t('Les accès aux données à caractère personnel sont strictement encadrés et juridiquement justifiés. Les personnes suivantes vont avoir accès aux données :') }}
      </p>
      <ul>
        <li>{{ $t('Les équipes de l’Opérateur des produits interministériels de la DINUM ;') }}</li>
        <li>
          <TranslationT keypath="Les équipes de {transport} et {ecologie}.">
            <template #transport>
              <CdataLink
                to="https://transport.data.gouv.fr"
                external
              >
                transport.data.gouv.fr
              </CdataLink>
            </template>
            <template #ecologie>
              <CdataLink
                to="https://ecologie.data.gouv.fr"
                external
              >
                ecologie.data.gouv.fr
              </CdataLink>
            </template>
          </TranslationT>
        </li>
      </ul>

      <h2>{{ $t('Qui nous aide à traiter vos données à caractère personnel ?') }}</h2>
      <p>
        {{ $t('Certaines données sont envoyées à des sous-traitants. Le responsable de traitement s’est assuré de la mise en œuvre par ses sous-traitants de garanties adéquates et du respect de conditions strictes de confidentialité, d’usage et de protection des données.') }}
      </p>
      <table>
        <thead>
          <tr>
            <th>{{ $t('Partenaires') }}</th>
            <th>{{ $t('Traitement réalisé') }}</th>
            <th>{{ $t('Pays destinataire') }}</th>
            <th>{{ $t('Garanties') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="processor in processors"
            :key="processor.name"
          >
            <td>{{ processor.name }}</td>
            <td>{{ processor.processing }}</td>
            <td>{{ processor.country }}</td>
            <td>
              <CdataLink
                :to="processor.guarantees"
                external
              >
                {{ $t('Lien') }}
              </CdataLink>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>{{ $t('Quels sont vos droits ?') }}</h2>
      <p>
        <TranslationT keypath="Vous disposez d’un droit d’accès et de rectification des données à caractère personnel qui vous concernent. Vous disposez également d’un droit d’opposition et de limitation du traitement de vos données. Pour exercer vos droits ou pour toute question sur le traitement de vos données, vous pouvez nous écrire à l’adresse : {support}.">
          <template #support>
            <CdataLink to="/support/">
              https://data.gouv.fr/support/
            </CdataLink>
          </template>
        </TranslationT>
      </p>
      <p>
        {{ $t('Vous pouvez également contacter la déléguée à la protection des données (DPD) des services du Premier Ministre :') }}
      </p>
      <ul>
        <li>
          <TranslationT keypath="par mail à {email}">
            <template #email>
              <a href="mailto:dpd@pm.gouv.fr">dpd@pm.gouv.fr</a>
            </template>
          </TranslationT>
        </li>
        <li>
          {{ $t('ou par courrier à l’adresse suivante :') }}<br>
          Services du Premier Ministre<br>
          {{ $t('À l’attention du délégué à la protection des données (DPD)') }}<br>
          56 rue de Varenne<br>
          75007 Paris
        </li>
      </ul>
      <p>
        {{ $t('Si vous estimez, après nous avoir contactés, que vos droits Informatiques et Libertés ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL :') }}<br>
        Commission nationale informatique et libertés<br>
        3 place de Fontenoy – TSA 80715 –<br>
        75334 PARIS CEDEX 07<br>
        <TranslationT keypath="Les modalités de réclamation sont précisées sur le site de la CNIL : {cnil}.">
          <template #cnil>
            <CdataLink
              to="https://www.cnil.fr"
              external
            >
              www.cnil.fr
            </CdataLink>
          </template>
        </TranslationT>
      </p>

      <h2>{{ $t('Cookies et traceurs') }}</h2>
      <p>
        {{ $t('Un cookie est un fichier déposé sur votre terminal lors de la visite d’un site. Il a pour but de collecter des informations relatives à votre navigation et de vous adresser des services adaptés à votre terminal (ordinateur, mobile ou tablette). En application de l’article 5(3) de la directive 2002/58/CE modifiée concernant le traitement des données à caractère personnel et la protection de la vie privée dans le secteur des communications électroniques, transposée à l’article 82 de la loi n°78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés, les traceurs ou cookies suivent deux régimes distincts. Les cookies strictement nécessaires au service ou ayant pour finalité exclusive de faciliter la communication par voie électronique sont dispensés de consentement préalable au titre de l’article 82 de la loi n°78-17 du 6 janvier 1978. Les cookies n’étant pas strictement nécessaires au service ou n’ayant pas pour finalité exclusive de faciliter la communication par voie électronique doivent être consenti par l’utilisateur.') }}
      </p>
      <p>
        {{ $t('Ce consentement de la personne concernée pour une ou plusieurs finalités spécifiques constitue une base légale au sens du RGPD et doit être entendu au sens de l\'article 6-a du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel et à la libre circulation de ces données. Nous utilisons l’outil de mesure d’audience Matomo, configuré en mode exempté et ne nécessitant pas le recueil de votre consentement conformément aux recommandations de la CNIL.') }}
      </p>

      <!-- The exemption from consent requires visitors to be able to object: this form,
           served by Matomo, stores their choice. -->
      <iframe
        class="w-full my-4"
        height="150"
        :title="$t('Refuser le suivi d’audience')"
        src="https://stats.data.gouv.fr/index.php?module=CoreAdminHome&action=optOut&language=fr"
      />

      <h2>{{ $t('Pour aller plus loin, vous pouvez consulter les fiches proposées par la CNIL :') }}</h2>
      <ul>
        <li>
          <CdataLink
            to="https://www.cnil.fr/fr/cookies-traceurs-que-dit-la-loi"
            external
          >
            {{ $t('Cookies & traceurs : que dit la loi ?') }}
          </CdataLink>
        </li>
        <li>
          <CdataLink
            to="https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser"
            external
          >
            {{ $t('Cookies : les outils pour les maîtriser') }}
          </CdataLink>
        </li>
      </ul>
    </article>
  </div>
</template>

<script setup lang="ts">
import { markdownClasses, TranslationT } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'

const { t } = useTranslation()

const title = t('Suivi d\'audience et vie privée')

useSeoMeta({
  title,
  description: t('Suivi d\'audience et vie privée sur data.gouv.fr'),
})

const processors = [
  { name: 'OVH', processing: t('Hébergement'), country: t('France'), guarantees: 'https://us.ovhcloud.com/legal/data-processing-agreement/' },
  { name: 'Brevo', processing: t('Envoi newsletter'), country: t('France'), guarantees: 'https://www.brevo.com/legal/termsofuse/#annex' },
  { name: 'Tally', processing: t('Formulaires'), country: t('Belgique'), guarantees: 'https://tally.so/help/data-processing-agreement' },
  { name: 'Empreinte Digitale', processing: t('Suivi d’erreurs'), country: t('France'), guarantees: 'https://empreintedigitale.fr/cgps/' },
  { name: 'Crisp', processing: t('Support utilisateurs et utilisatrices'), country: t('Pays-Bas & Allemagne'), guarantees: 'https://crisp.chat/fr/privacy/' },
]
</script>
