<script setup>
import { computed } from "vue";

const { t } = useI18n();
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

function toggleTheme() {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="isDark ? t('components.themeLight') : t('components.themeDark')" @click="toggleTheme">
    <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" />
  </button>
</template>
