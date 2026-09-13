<script setup>
import QrGenerator from "~/features/qr-generator/components/QrGenerator.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("qrGenerator.title")} | ${t("site.name")}`,
  description: () => t("qrGenerator.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:qr-code" color="#0891b2" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("qrGenerator.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("qrGenerator.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("qrGenerator.description") }}</p>
      </div>
    </header>
    <QrGenerator />
  </main>
</template>
