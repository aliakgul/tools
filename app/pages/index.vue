<script setup>
const { t, locale } = useI18n();
const { apps } = useAppRegistry();
const query = ref("");

const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase(locale.value));
const filteredApps = computed(() => {
  if (!normalizedQuery.value) return apps.value;

  return apps.value.filter((app) =>
    [app.name, app.description, app.category].some((value) =>
      value.toLocaleLowerCase(locale.value).includes(normalizedQuery.value),
    ),
  );
});
const availableApps = computed(() => filteredApps.value.filter((app) => app.status === "available"));
const plannedApps = computed(() => filteredApps.value.filter((app) => app.status === "planned"));

useSeoMeta({
  title: () => t("suite.meta.title"),
  description: () => t("suite.meta.description"),
});
</script>

<template>
  <section class="tool-directory">
    <div class="tool-directory__header">
      <div class="tool-directory__intro">
        <p class="eyebrow">{{ t("suite.directory.label") }}</p>
        <h1>{{ t("suite.directory.title") }}</h1>
        <p>{{ t("suite.directory.description") }}</p>
      </div>

      <label class="tool-directory__search">
        <Icon name="lucide:search" />
        <span class="sr-only">{{ t("suite.directory.searchLabel") }}</span>
        <input v-model="query" type="search" :placeholder="t('suite.directory.searchPlaceholder')" />
        <span aria-hidden="true">{{ filteredApps.length }}</span>
      </label>
    </div>

    <div v-if="filteredApps.length" class="tool-directory__groups">
      <section v-if="availableApps.length" class="tool-group">
        <div class="tool-group__heading">
          <h2>{{ t("suite.directory.availableTitle") }}</h2>
          <span>{{ availableApps.length }}</span>
        </div>
        <div class="tool-grid">
          <NuxtLink
            v-for="app in availableApps"
            :key="app.slug"
            :to="app.path"
            class="tool-card"
            :class="{ 'tool-card--featured': app.featured }">
            <UiAppMark :icon="app.icon" :color="app.markColor" :foreground="app.markForeground" />
            <div class="tool-card__body">
              <div class="tool-card__meta">
                <span class="tool-card__category">{{ app.category }}</span>
                <span v-if="app.featured" class="tool-card__featured-label">
                  <Icon name="lucide:sparkles" />
                  {{ t("suite.featured") }}
                </span>
              </div>
              <h3>{{ app.name }}</h3>
              <p>{{ app.description }}</p>
            </div>
            <Icon class="tool-card__arrow" name="lucide:arrow-up-right" />
          </NuxtLink>
        </div>
      </section>

      <section v-if="plannedApps.length" class="tool-group">
        <div class="tool-group__heading">
          <h2>{{ t("suite.directory.plannedTitle") }}</h2>
          <span>{{ plannedApps.length }}</span>
        </div>
        <div class="tool-grid">
          <article v-for="app in plannedApps" :key="app.slug" class="tool-card tool-card--planned">
            <UiAppMark :icon="app.icon" :color="app.markColor" :foreground="app.markForeground" />
            <div class="tool-card__body">
              <span class="tool-card__category">{{ app.category }}</span>
              <h3>{{ app.name }}</h3>
              <p>{{ app.description }}</p>
            </div>
            <Icon class="tool-card__arrow" name="lucide:clock-3" />
          </article>
        </div>
      </section>
    </div>

    <div v-else class="tool-directory__empty">
      <Icon name="lucide:search-x" />
      <div>
        <h2>{{ t("suite.directory.emptyTitle") }}</h2>
        <p>{{ t("suite.directory.emptyDescription") }}</p>
      </div>
      <button type="button" @click="query = ''">{{ t("suite.directory.clearSearch") }}</button>
    </div>
  </section>
</template>
