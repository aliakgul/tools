<script setup>
import LanguageSwitch from "../ui/LanguageSwitch.vue";
import ThemeToggle from "../ui/ThemeToggle.vue";

const { t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const isVocalRoute = computed(() => route.path.split("/").includes("vocal"));
const isOpmlRoute = computed(() => route.path.split("/").includes("opml-generator"));
const isLineSorterRoute = computed(() => route.path.split("/").includes("line-sorter"));
const activeAppName = computed(() => {
  if (route.path.split("/").includes("table-viewer")) return t("tableViewer.title");
  if (route.path.split("/").includes("e-ink-feed")) return t("eInk.title");
  if (route.path.split("/").includes("spotify-playlist-printer")) return t("playlistPrinter.title");
  if (route.path.split("/").includes("pomodoro")) return t("pomodoro.title");
  if (route.path.split("/").includes("color-toolkit")) return t("colorToolkit.title");
  if (route.path.split("/").includes("qr-generator")) return t("qrGenerator.title");
  if (route.path.split("/").includes("date-calculator")) return t("dateCalculator.title");
  if (isVocalRoute.value) return t("suite.currentTool");
  if (isOpmlRoute.value) return t("opml.title");
  if (isLineSorterRoute.value) return t("lineSorter.title");
  return t("site.tagline");
});

function selectWorkspace(workspace) {
  window.dispatchEvent(new CustomEvent("vocal-workspace-change", { detail: workspace }));
}
</script>
<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink :to="localePath('/')" class="site-header__brand" :aria-label="t('site.name')">
        <span class="site-header__mark">
          <Icon name="lucide:blocks" />
        </span>
        <span class="site-header__brand-copy">
          <strong>{{ t("site.name") }}</strong>
          <span>{{ activeAppName }}</span>
        </span>
      </NuxtLink>

      <nav class="site-header__nav" :aria-label="t('components.headerNav')">
        <NuxtLink :to="localePath('/')">{{ t("suite.allApps") }}</NuxtLink>
        <template v-if="isVocalRoute">
          <button type="button" @click="selectWorkspace('practice')">{{ t("workspace.practice") }}</button>
          <button type="button" @click="selectWorkspace('tools')">{{ t("workspace.tools") }}</button>
        </template>
      </nav>

      <div class="header-actions">
        <ThemeToggle />
        <LanguageSwitch />
      </div>
    </div>
  </header>
</template>
