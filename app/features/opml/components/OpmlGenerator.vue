<script setup>
import { buildOpmlDocument, deduplicateFeeds, parseOpmlDocument, validateFeed } from "../utils/opml";

const { t } = useI18n();
const DRAFT_KEY = "alyuid-opml-draft-v1";
const MAX_IMPORT_SIZE = 2 * 1024 * 1024;

let nextId = 2;
let saveTimer;
let skipNextSave = false;
const documentTitle = ref(t("opml.defaultTitle"));
const feeds = ref([{ id: 1, title: "", xmlUrl: "", htmlUrl: "", category: "" }]);
const showErrors = ref(false);
const copyState = ref("idle");
const draftState = ref("idle");
const importMode = ref("replace");
const importState = ref("idle");
const duplicatesSkipped = ref(0);
const fileInput = ref(null);
const storageReady = ref(false);

const validations = computed(() => feeds.value.map(validateFeed));
const hasValidDocument = computed(() => {
  return (
    Boolean(documentTitle.value.trim()) &&
    feeds.value.length > 0 &&
    validations.value.every((result) => Object.values(result).every(Boolean))
  );
});

const opml = computed(() => {
  if (!import.meta.client || !hasValidDocument.value) return "";
  return buildOpmlDocument({ title: documentTitle.value, feeds: feeds.value });
});

watch(
  [documentTitle, feeds],
  () => {
    if (!storageReady.value) return;
    if (skipNextSave) {
      skipNextSave = false;
      return;
    }

    draftState.value = "saving";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          title: documentTitle.value,
          feeds: feeds.value.map(({ title, xmlUrl, htmlUrl, category }) => ({ title, xmlUrl, htmlUrl, category })),
        }),
      );
      draftState.value = "saved";
    }, 300);
  },
  { deep: true },
);

onMounted(() => {
  try {
    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (
      savedDraft &&
      typeof savedDraft.title === "string" &&
      Array.isArray(savedDraft.feeds) &&
      savedDraft.feeds.length
    ) {
      documentTitle.value = savedDraft.title;
      feeds.value = savedDraft.feeds.map(normalizeFeed);
      draftState.value = "restored";
    }
  } catch {
    localStorage.removeItem(DRAFT_KEY);
  } finally {
    storageReady.value = true;
  }
});

onBeforeUnmount(() => window.clearTimeout(saveTimer));

function normalizeFeed(feed) {
  return {
    id: nextId++,
    title: typeof feed.title === "string" ? feed.title : "",
    xmlUrl: typeof feed.xmlUrl === "string" ? feed.xmlUrl : "",
    htmlUrl: typeof feed.htmlUrl === "string" ? feed.htmlUrl : "",
    category: typeof feed.category === "string" ? feed.category : "",
  };
}

function isEmptyFeed(feed) {
  return !feed.title.trim() && !feed.xmlUrl.trim() && !feed.htmlUrl.trim() && !feed.category.trim();
}

function addFeed() {
  feeds.value.push({ id: nextId++, title: "", xmlUrl: "", htmlUrl: "", category: "" });
}

function removeFeed(id) {
  if (feeds.value.length === 1) {
    feeds.value[0] = { id: feeds.value[0].id, title: "", xmlUrl: "", htmlUrl: "", category: "" };
    return;
  }
  feeds.value = feeds.value.filter((feed) => feed.id !== id);
}

function clearDraft() {
  window.clearTimeout(saveTimer);
  skipNextSave = true;
  documentTitle.value = t("opml.defaultTitle");
  feeds.value = [normalizeFeed({})];
  showErrors.value = false;
  importState.value = "idle";
  localStorage.removeItem(DRAFT_KEY);
  draftState.value = "cleared";
}

function openImportPicker() {
  importState.value = "idle";
  duplicatesSkipped.value = 0;
  fileInput.value?.click();
}

async function importOpml(event) {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  if (file.size > MAX_IMPORT_SIZE) {
    importState.value = "tooLarge";
    return;
  }

  try {
    const imported = parseOpmlDocument(await file.text());
    const importedFeeds = imported.feeds.map(normalizeFeed);
    const currentIsBlank = feeds.value.length === 1 && isEmptyFeed(feeds.value[0]);

    if (importMode.value === "replace" || currentIsBlank) {
      feeds.value = deduplicateFeeds(importedFeeds);
      duplicatesSkipped.value = importedFeeds.length - feeds.value.length;
      if (imported.title) documentTitle.value = imported.title;
    } else {
      const mergedFeeds = deduplicateFeeds([...feeds.value, ...importedFeeds]);
      duplicatesSkipped.value = feeds.value.length + importedFeeds.length - mergedFeeds.length;
      feeds.value = mergedFeeds;
    }

    showErrors.value = false;
    importState.value = duplicatesSkipped.value ? "importedDuplicates" : "imported";
  } catch (error) {
    importState.value = error.message === "no-feeds" ? "noFeeds" : "invalid";
  }
}

function ensureValid() {
  showErrors.value = true;
  return hasValidDocument.value;
}

async function copyOpml() {
  if (!ensureValid()) return;

  try {
    await navigator.clipboard.writeText(opml.value);
    copyState.value = "copied";
    window.setTimeout(() => {
      copyState.value = "idle";
    }, 1800);
  } catch {
    copyState.value = "error";
  }
}

function downloadOpml() {
  if (!ensureValid()) return;

  const filename =
    documentTitle.value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "subscriptions";
  const blob = new Blob([opml.value], { type: "text/x-opml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.opml`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="opml-workspace">
    <section class="opml-editor" :aria-labelledby="'opml-editor-title'">
      <div class="opml-section-heading">
        <div>
          <p class="eyebrow">{{ t("opml.editorLabel") }}</p>
          <h2 id="opml-editor-title">{{ t("opml.editorTitle") }}</h2>
        </div>
        <div class="opml-draft-status">
          <Icon
            :name="draftState === 'saving' ? 'lucide:loader-circle' : 'lucide:hard-drive'"
            :class="{ 'is-spinning': draftState === 'saving' }" />
          <span>{{ t(`opml.draft.${draftState}`) }}</span>
        </div>
      </div>

      <div class="opml-import-bar">
        <div class="opml-import-mode" :aria-label="t('opml.importMode')">
          <button type="button" :class="{ 'is-active': importMode === 'replace' }" @click="importMode = 'replace'">
            {{ t("opml.replace") }}
          </button>
          <button type="button" :class="{ 'is-active': importMode === 'merge' }" @click="importMode = 'merge'">
            {{ t("opml.merge") }}
          </button>
        </div>
        <button class="opml-import" type="button" @click="openImportPicker">
          <Icon name="lucide:upload" />
          <span>{{ t("opml.import") }}</span>
        </button>
        <button
          class="opml-clear-draft"
          type="button"
          :title="t('opml.clearDraft')"
          :aria-label="t('opml.clearDraft')"
          @click="clearDraft">
          <Icon name="lucide:eraser" />
        </button>
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept=".opml,.xml,text/x-opml,application/xml,text/xml"
          @change="importOpml" />
      </div>

      <p
        v-if="importState !== 'idle'"
        class="opml-import-status"
        :class="{ 'opml-import-status--error': !['imported', 'importedDuplicates'].includes(importState) }"
        role="status">
        {{ t(`opml.importStates.${importState}`, { count: duplicatesSkipped }) }}
      </p>

      <label class="opml-field opml-document-title">
        <span>{{ t("opml.documentTitle") }}</span>
        <input v-model="documentTitle" type="text" :placeholder="t('opml.documentTitlePlaceholder')" />
        <small v-if="showErrors && !documentTitle.trim()">{{ t("opml.errors.titleRequired") }}</small>
      </label>

      <div class="opml-feed-list">
        <fieldset v-for="(feed, index) in feeds" :key="feed.id" class="opml-feed-row">
          <legend>{{ t("opml.feedNumber", { number: index + 1 }) }}</legend>

          <label class="opml-field opml-field--title">
            <span>{{ t("opml.feedTitle") }}</span>
            <input v-model="feed.title" type="text" :placeholder="t('opml.feedTitlePlaceholder')" />
            <small v-if="showErrors && !validations[index].title">{{ t("opml.errors.feedTitleRequired") }}</small>
          </label>

          <label class="opml-field opml-field--url">
            <span>{{ t("opml.feedUrl") }}</span>
            <input v-model="feed.xmlUrl" type="url" inputmode="url" placeholder="https://example.com/feed.xml" />
            <small v-if="showErrors && !validations[index].xmlUrl">{{ t("opml.errors.feedUrlInvalid") }}</small>
          </label>

          <label class="opml-field">
            <span>{{ t("opml.websiteUrl") }}</span>
            <input v-model="feed.htmlUrl" type="url" inputmode="url" placeholder="https://example.com" />
            <small v-if="showErrors && !validations[index].htmlUrl">{{ t("opml.errors.websiteUrlInvalid") }}</small>
          </label>

          <label class="opml-field">
            <span>{{ t("opml.category") }}</span>
            <input v-model="feed.category" type="text" :placeholder="t('opml.categoryPlaceholder')" />
          </label>

          <button
            class="opml-remove-feed"
            type="button"
            :title="t('opml.removeFeed')"
            :aria-label="t('opml.removeFeed')"
            @click="removeFeed(feed.id)">
            <Icon name="lucide:trash-2" />
          </button>
        </fieldset>
      </div>

      <button class="opml-add-feed" type="button" @click="addFeed">
        <Icon name="lucide:plus" />
        <span>{{ t("opml.addFeed") }}</span>
      </button>
      <span class="opml-feed-count">{{ t("opml.feedCount", { count: feeds.length }) }}</span>
    </section>

    <aside class="opml-output" :aria-labelledby="'opml-output-title'">
      <div class="opml-section-heading">
        <div>
          <p class="eyebrow">{{ t("opml.outputLabel") }}</p>
          <h2 id="opml-output-title">{{ t("opml.outputTitle") }}</h2>
        </div>
        <Icon name="lucide:file-code-2" />
      </div>

      <div class="opml-privacy-note">
        <Icon name="lucide:shield-check" />
        <span>{{ t("opml.privacy") }}</span>
      </div>

      <pre class="opml-preview"><code>{{ opml || t("opml.previewEmpty") }}</code></pre>

      <p v-if="showErrors && !hasValidDocument" class="opml-form-error" role="alert">
        {{ t("opml.errors.fixEntries") }}
      </p>
      <p v-if="copyState === 'error'" class="opml-form-error" role="alert">
        {{ t("opml.errors.copyFailed") }}
      </p>

      <div class="opml-actions">
        <button type="button" class="opml-copy" @click="copyOpml">
          <Icon :name="copyState === 'copied' ? 'lucide:check' : 'lucide:copy'" />
          <span>{{ copyState === "copied" ? t("opml.copied") : t("opml.copy") }}</span>
        </button>
        <button type="button" class="opml-download" @click="downloadOpml">
          <Icon name="lucide:download" />
          <span>{{ t("opml.download") }}</span>
        </button>
      </div>
    </aside>
  </div>
</template>
