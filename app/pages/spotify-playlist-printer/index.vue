<script setup>
import PlaylistPrinter from "~/features/spotify-playlist-printer/components/PlaylistPrinter.vue";
const { t } = useI18n();
useSeoMeta({
  title: () => `${t("playlistPrinter.title")} | ${t("site.name")}`,
  description: () => t("playlistPrinter.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:printer" color="#168a62" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("suite.apps.spotifyPlaylistPrinter.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("playlistPrinter.title") }}</h1>
        <p class="mt-3 text-slate-600 dark:text-slate-300">{{ t("playlistPrinter.description") }}</p>
      </div>
    </header>
    <PlaylistPrinter />
  </main>
</template>
