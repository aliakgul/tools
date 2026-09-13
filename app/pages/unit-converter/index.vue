<script setup>
import UnitConverter from "~/features/unit-converter/components/UnitConverter.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("unitConverter.title")} | ${t("site.name")}`,
  description: () => t("unitConverter.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:scale" color="#0d9488" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("unitConverter.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("unitConverter.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("unitConverter.description") }}</p>
      </div>
    </header>
    <UnitConverter />
  </main>
</template>
