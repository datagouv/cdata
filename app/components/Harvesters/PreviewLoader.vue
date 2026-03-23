<template>
  <div class="w-full">
    <SimpleBanner
      type="primary"
      class="mb-4 flex items-center space-x-5"
    >
      <AnimatedLoader class="size-14" />

      <div class="w-full">
        <p class="font-bold mb-1">
          {{ $t("La prévisualisation de votre moissonneur est en cours.") }}
        </p>
        <p class="m-0 text-xs/5">
          {{ $t('Cela peut prendre quelques instants, merci de votre patience !') }}
        </p>
      </div>
    </SimpleBanner>
    <div class="animate-pulse-placeholder space-y-8 mt-3.5">
      <div class="space-y-1.5 mb-5">
        <div class="bg-gray-200 w-72 h-5" />
        <div class="bg-gray-200 w-72 h-5" />
        <div class="bg-gray-200 w-32 h-5" />
        <div class="bg-gray-200 w-56 h-5" />
      </div>
      <div class="bg-gray-200 w-96 h-5 mb-2.5" />
      <AdminTable class="!pt-0">
        <thead>
          <tr>
            <AdminTableTh scope="col">
              <div class="bg-gray-200 w-32 h-4 mb-0.5" />
            </AdminTableTh>
            <AdminTableTh scope="col">
              <div class="bg-gray-200 w-12 h-4 mb-0.5" />
            </AdminTableTh>
            <AdminTableTh scope="col">
              <div class="bg-gray-200 w-32 h-4 mb-0.5" />
            </AdminTableTh>
            <AdminTableTh scope="col">
              <div class="bg-gray-200 w-8 h-4 mb-0.5" />
            </AdminTableTh>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="i in 2"
            :key="i"
          >
            <td>
              <div class="bg-gray-200 w-80 h-4 " />
            </td>
            <td>
              <div class="bg-gray-200 w-12 h-4 " />
            </td>
            <td>
              <div class="bg-gray-200 w-32 h-4 " />
            </td>
            <td class="font-mono !text-right">
              <div class="bg-gray-200 w-8 h-4 " />
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, SimpleBanner } from '@datagouv/components-next'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
</script>
