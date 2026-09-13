<script setup>
import OpmlGenerator from "~/features/opml/components/OpmlGenerator.vue";

const { t } = useI18n();

useSeoMeta({
  title: () => `${t("opml.title")} | ${t("site.name")}`,
  description: () => t("opml.description"),
});
</script>

<template>
  <main class="opml-page">
    <header class="opml-page__header">
      <UiAppMark icon="lucide:file-code-2" color="#147da3" size="lg" />
      <div>
        <p class="eyebrow">{{ t("opml.label") }}</p>
        <h1>{{ t("opml.title") }}</h1>
        <p>{{ t("opml.description") }}</p>
      </div>
    </header>

    <OpmlGenerator />
  </main>
</template>
