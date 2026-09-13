<script setup>
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const repositoryUrl = runtimeConfig.public.githubRepositoryUrl;
</script>
<template>
  <footer class="border-t border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div class="grid gap-1">
        <p>{{ t("footer.tagline") }}</p>
        <p>{{ t("footer.scope") }}</p>
      </div>
      <a v-if="repositoryUrl" class="footer-support" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
        <Icon name="lucide:github" />
        <span>{{ t("footer.starOnGitHub") }}</span>
        <Icon name="lucide:star" />
      </a>
    </div>
  </footer>
</template>
