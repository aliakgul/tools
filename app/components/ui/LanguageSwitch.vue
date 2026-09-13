<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const { locale, locales, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const isOpen = ref(false);
const languageSwitch = ref(null);

const languageOptions = computed(() => {
  const configuredLocales = Array.isArray(locales.value) ? locales.value : locales;

  return configuredLocales.map((language) => {
    const code = typeof language === "string" ? language : language.code;
    const name = typeof language === "string" ? language.toUpperCase() : language.name || language.code.toUpperCase();

    return { code, name };
  }).sort((first, second) => first.name.localeCompare(second.name));
});

const currentLanguage = computed(() => languageOptions.value.find((language) => language.code === locale.value) || languageOptions.value[0]);

function closeLanguageMenu() {
  isOpen.value = false;
}

function toggleLanguageMenu() {
  isOpen.value = !isOpen.value;
}

function handleOutsideClick(event) {
  if (!languageSwitch.value?.contains(event.target)) {
    closeLanguageMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>
<template>
  <div ref="languageSwitch" class="language-switch">
    <button
      type="button"
      class="language-switch__trigger"
      :aria-label="`${t('components.languageSwitch')}: ${currentLanguage?.name}`"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click.stop="toggleLanguageMenu"
      @keydown.escape="closeLanguageMenu"
    >
      <Icon name="lucide:languages" />
      <span>{{ currentLanguage?.code?.toUpperCase() }}</span>
    </button>
    <div v-if="isOpen" class="language-switch__menu" role="menu">
      <NuxtLink
        v-for="language in languageOptions"
        :key="language.code"
        class="language-switch__option"
        :class="{ 'language-switch__option--active': language.code === locale }"
        :to="switchLocalePath(language.code)"
        role="menuitem"
        @click="closeLanguageMenu"
      >
        <span>{{ language.code.toUpperCase() }}</span>
        <strong>{{ language.name }}</strong>
      </NuxtLink>
    </div>
  </div>
</template>
