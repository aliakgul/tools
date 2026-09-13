<script setup>
import ColorToolkit from "~/features/color-toolkit/components/ColorToolkit.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("colorToolkit.title")} | ${t("site.name")}`,
  description: () => t("colorToolkit.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:palette" color="#7c3aed" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("colorToolkit.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("colorToolkit.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("colorToolkit.description") }}</p>
      </div>
    </header>
    <ColorToolkit />
  </main>
</template>
