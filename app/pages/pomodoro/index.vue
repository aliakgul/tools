<script setup>
import PomodoroTimer from "~/features/pomodoro/components/PomodoroTimer.vue";

const { t } = useI18n();
useSeoMeta({
  title: () => `${t("pomodoro.title")} | ${t("site.name")}`,
  description: () => t("pomodoro.description"),
});
</script>

<template>
  <main class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:py-12">
    <header class="flex items-start gap-4">
      <UiAppMark icon="lucide:timer" color="#e45757" size="lg" />
      <div class="min-w-0">
        <p class="eyebrow mb-1.5">{{ t("pomodoro.category") }}</p>
        <h1 class="text-3xl font-black sm:text-4xl">{{ t("pomodoro.title") }}</h1>
        <p class="mt-3 max-w-2xl text-muted">{{ t("pomodoro.description") }}</p>
      </div>
    </header>
    <PomodoroTimer />
  </main>
</template>
