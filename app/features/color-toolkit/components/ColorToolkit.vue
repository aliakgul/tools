<script setup>
import { contrastRatio, createPalette, parseHex, readableTextColor, rgbToHex, rgbToHsl } from "../utils/color";

const { t } = useI18n();
const color = ref("#5D5BD4");
const input = ref(color.value);
const error = ref(false);
const copied = ref("");

const rgb = computed(() => parseHex(color.value));
const hsl = computed(() => rgbToHsl(rgb.value));
const formats = computed(() => [
  { label: "HEX", value: color.value },
  { label: "RGB", value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
  { label: "HSL", value: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` },
]);
const palette = computed(() => createPalette(rgb.value));
const contrastSamples = computed(() =>
  [
    { key: "white", color: "#FFFFFF" },
    { key: "black", color: "#000000" },
  ].map((sample) => ({
    ...sample,
    ratio: contrastRatio(rgb.value, parseHex(sample.color)),
  })),
);

function applyTextColor() {
  const parsed = parseHex(input.value);
  if (!parsed) {
    error.value = true;
    return;
  }
  color.value = rgbToHex(parsed);
  input.value = color.value;
  error.value = false;
}

function applyPickerColor(event) {
  color.value = event.target.value.toUpperCase();
  input.value = color.value;
  error.value = false;
}

async function copyValue(value) {
  try {
    await navigator.clipboard.writeText(value);
    copied.value = value;
    window.setTimeout(() => {
      if (copied.value === value) copied.value = "";
    }, 1600);
  } catch {
    copied.value = "error";
  }
}

function grade(ratio, large = false) {
  if (ratio >= (large ? 4.5 : 7)) return "AAA";
  if (ratio >= (large ? 3 : 4.5)) return "AA";
  return t("colorToolkit.fail");
}
</script>

<template>
  <section class="color-workspace">
    <div class="color-editor">
      <div class="color-preview" :style="{ backgroundColor: color, color: readableTextColor(rgb) }">
        <span>{{ t("colorToolkit.preview") }}</span>
        <strong>{{ color }}</strong>
        <small>{{ t("colorToolkit.previewText") }}</small>
      </div>

      <div class="color-input-panel">
        <div>
          <p class="eyebrow">{{ t("colorToolkit.chooseLabel") }}</p>
          <h2>{{ t("colorToolkit.choose") }}</h2>
        </div>
        <label class="color-picker-control">
          <input :value="color" type="color" :aria-label="t('colorToolkit.picker')" @input="applyPickerColor" />
          <span>{{ t("colorToolkit.picker") }}</span>
        </label>
        <form class="color-text-control" @submit.prevent="applyTextColor">
          <label for="color-value">{{ t("colorToolkit.hexInput") }}</label>
          <div>
            <input
              id="color-value"
              v-model="input"
              type="text"
              maxlength="7"
              spellcheck="false"
              :aria-invalid="error"
              placeholder="#5D5BD4"
              @input="error = false" />
            <button type="submit">{{ t("colorToolkit.apply") }}</button>
          </div>
          <small v-if="error" role="alert">{{ t("colorToolkit.invalid") }}</small>
        </form>
      </div>
    </div>

    <section class="color-section">
      <div class="color-section__heading">
        <div>
          <p class="eyebrow">{{ t("colorToolkit.valuesLabel") }}</p>
          <h2>{{ t("colorToolkit.values") }}</h2>
        </div>
        <p>{{ t("colorToolkit.copyHelp") }}</p>
      </div>
      <div class="color-values">
        <button v-for="format in formats" :key="format.label" type="button" @click="copyValue(format.value)">
          <span>{{ format.label }}</span>
          <strong>{{ format.value }}</strong>
          <Icon :name="copied === format.value ? 'lucide:check' : 'lucide:copy'" />
        </button>
      </div>
      <p v-if="copied === 'error'" class="color-error" role="alert">{{ t("colorToolkit.copyFailed") }}</p>
    </section>

    <section class="color-section">
      <div class="color-section__heading">
        <div>
          <p class="eyebrow">{{ t("colorToolkit.paletteLabel") }}</p>
          <h2>{{ t("colorToolkit.palette") }}</h2>
        </div>
        <p>{{ t("colorToolkit.paletteHelp") }}</p>
      </div>
      <div class="color-palette">
        <button
          v-for="swatch in palette"
          :key="swatch"
          type="button"
          :style="{ backgroundColor: swatch, color: readableTextColor(parseHex(swatch)) }"
          @click="copyValue(swatch)">
          <Icon v-if="copied === swatch" name="lucide:check" />
          <span>{{ swatch }}</span>
        </button>
      </div>
    </section>

    <section class="color-section">
      <div class="color-section__heading">
        <div>
          <p class="eyebrow">{{ t("colorToolkit.contrastLabel") }}</p>
          <h2>{{ t("colorToolkit.contrast") }}</h2>
        </div>
        <p>{{ t("colorToolkit.contrastHelp") }}</p>
      </div>
      <div class="contrast-grid">
        <article
          v-for="sample in contrastSamples"
          :key="sample.key"
          :style="{ backgroundColor: color, color: sample.color }">
          <span>{{ t(`colorToolkit.on.${sample.key}`) }}</span>
          <strong>{{ sample.ratio.toFixed(2) }}:1</strong>
          <div>
            <span>
              {{ t("colorToolkit.normalText") }}
              <b>{{ grade(sample.ratio) }}</b>
            </span>
            <span>
              {{ t("colorToolkit.largeText") }}
              <b>{{ grade(sample.ratio, true) }}</b>
            </span>
          </div>
        </article>
      </div>
    </section>

    <p class="color-privacy">
      <Icon name="lucide:shield-check" />
      {{ t("colorToolkit.privacy") }}
    </p>
  </section>
</template>

<style scoped>
.color-workspace {
  display: grid;
  gap: 1.25rem;
}
.color-editor {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(18rem, 1.2fr);
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: var(--ui-bg);
  box-shadow: 0 12px 35px rgb(15 23 42 / 0.07);
}
.color-preview {
  min-height: 18rem;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.45rem;
  padding: 2rem;
  text-align: center;
}
.color-preview span {
  font-weight: 800;
  opacity: 0.78;
}
.color-preview strong {
  font-size: clamp(2.4rem, 7vw, 4.5rem);
  line-height: 1;
  letter-spacing: -0.06em;
}
.color-preview small {
  max-width: 18rem;
  line-height: 1.5;
  opacity: 0.8;
}
.color-input-panel {
  display: grid;
  align-content: center;
  gap: 1.25rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
}
.color-input-panel h2,
.color-section h2 {
  margin: 0.2rem 0 0;
  color: var(--ui-text-highlighted);
  font-size: 1.35rem;
  font-weight: 900;
}
.color-picker-control {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--ui-text);
  font-weight: 800;
}
.color-picker-control input {
  width: 4rem;
  height: 3rem;
  padding: 0.2rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.7rem;
  background: var(--ui-bg);
  cursor: pointer;
}
.color-text-control {
  display: grid;
  gap: 0.45rem;
  color: var(--ui-text);
  font-weight: 800;
}
.color-text-control > div {
  display: grid;
  grid-template-columns: 1fr auto;
}
.color-text-control input {
  min-width: 0;
  border: 1px solid var(--ui-border);
  border-radius: 0.7rem 0 0 0.7rem;
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  padding: 0.75rem;
  font: inherit;
  text-transform: uppercase;
}
.color-text-control button {
  border: 1px solid #5d5bd4;
  border-radius: 0 0.7rem 0.7rem 0;
  background: #5d5bd4;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: 900;
  cursor: pointer;
}
.color-text-control small,
.color-error {
  color: #be123c;
}
.color-section {
  display: grid;
  gap: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: var(--ui-bg);
  padding: clamp(1.25rem, 3vw, 1.75rem);
}
.color-section__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}
.color-section__heading > p {
  max-width: 30rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}
.color-values {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
.color-values button {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 0.75rem;
  text-align: left;
  border: 1px solid var(--ui-border);
  border-radius: 0.8rem;
  background: var(--ui-bg-muted);
  color: var(--ui-text);
  padding: 0.9rem;
  cursor: pointer;
}
.color-values button span {
  grid-column: 1;
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: 900;
}
.color-values button strong {
  grid-column: 1;
  overflow-wrap: anywhere;
}
.color-values button svg {
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
}
.color-palette {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 8rem;
  overflow: hidden;
  border-radius: 0.9rem;
}
.color-palette button {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  padding: 0.75rem 0.3rem;
  cursor: pointer;
}
.color-palette span {
  font-size: 0.7rem;
  font-weight: 900;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.contrast-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
.contrast-grid article {
  min-height: 11rem;
  display: grid;
  align-content: center;
  gap: 0.4rem;
  border-radius: 0.9rem;
  padding: 1.25rem;
}
.contrast-grid article > span {
  font-weight: 800;
}
.contrast-grid article > strong {
  font-size: 2rem;
}
.contrast-grid article > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
.contrast-grid article > div span {
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 0.3rem 0.55rem;
  font-size: 0.75rem;
}
.color-privacy {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.85rem;
}
@media (max-width: 700px) {
  .color-editor,
  .color-values,
  .contrast-grid {
    grid-template-columns: 1fr;
  }
  .color-section__heading {
    align-items: start;
    flex-direction: column;
  }
  .color-palette {
    grid-template-columns: repeat(4, 1fr);
  }
  .color-palette button {
    min-height: 6rem;
  }
}
</style>
