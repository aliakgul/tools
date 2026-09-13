<script setup>
import DateCalculator from "~/features/date-calculator/components/DateCalculator.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("dateCalculator.title")} | ${t("site.name")}`,
  description: () => t("dateCalculator.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:calendar-range" color="#2563eb" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("dateCalculator.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("dateCalculator.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("dateCalculator.description") }}</p>
      </div>
    </header>
    <DateCalculator />
  </main>
</template>
