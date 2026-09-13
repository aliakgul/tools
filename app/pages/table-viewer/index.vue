<script setup>
import TableViewer from "~/features/table-viewer/components/TableViewer.vue";
const { t } = useI18n();
useSeoMeta({
  title: () => `${t("tableViewer.title")} | ${t("site.name")}`,
  description: () => t("tableViewer.description"),
});
</script>
<template>
  <main class="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:table-2" color="#0f766e" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("tableViewer.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("tableViewer.title") }}</h1>
        <p class="mt-3 text-muted">{{ t("tableViewer.description") }}</p>
      </div>
    </header>
    <TableViewer />
  </main>
</template>
