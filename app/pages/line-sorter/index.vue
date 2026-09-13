<script setup>
import LineSorter from "~/features/line-sorter/components/LineSorter.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("lineSorter.title")} | ${t("site.name")}`,
  description: () => t("lineSorter.description"),
});
</script>

<template>
  <main class="line-sorter-page">
    <header class="line-sorter-page__header">
      <UiAppMark icon="lucide:arrow-down-a-z" color="#5d5bd4" size="lg" />
      <div>
        <p class="eyebrow">{{ t("lineSorter.label") }}</p>
        <h1>{{ t("lineSorter.title") }}</h1>
        <p>{{ t("lineSorter.description") }}</p>
      </div>
    </header>
    <LineSorter />
  </main>
</template>
