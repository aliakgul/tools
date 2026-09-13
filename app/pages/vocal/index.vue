<script setup>
import TrainingWorkspace from "~/features/vocal/components/TrainingWorkspace.vue";

const { locale, t } = useI18n();

const { data: vocal } = await useAsyncData(
  () => `vocal-${locale.value}`,
  async () => {
    const contentPath = locale.value === "en" ? "/" : `/${locale.value}`;
    return queryCollection("content").path(contentPath).first();
  },
  { watch: [locale] },
);

useSeoMeta({
  title: () => `${vocal.value?.title || "Vocal Practice"} | ${t("site.name")}`,
  description: () => vocal.value?.description || vocal.value?.meta?.description || "",
});
</script>

<template>
  <div v-if="vocal">
    <TrainingWorkspace :data="vocal.meta" />
  </div>
</template>
