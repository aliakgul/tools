<script setup>
import NewsPageBuilder from "~/features/e-ink-feed/components/NewsPageBuilder.vue";
const { t } = useI18n();
useSeoMeta({ title: () => `${t("eInk.title")} | ${t("site.name")}`, description: () => t("eInk.description") });
</script>
<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:book-open-text" color="#e2ae35" foreground="#172033" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("suite.apps.eInkFeed.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("eInk.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("eInk.description") }}</p>
      </div>
    </header>
    <NewsPageBuilder />
  </main>
</template>
