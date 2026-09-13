<script setup>
import { convertUnit, defaultUnits, UNIT_CATEGORIES, unitEntries, units } from "../utils/units";

const { locale, t } = useI18n();
const category = ref("length");
const fromUnit = ref(defaultUnits.length[0]);
const toUnit = ref(defaultUnits.length[1]);
const fromValue = ref("1");
const copied = ref(false);
const categoryIcons = {
  length: "lucide:ruler",
  mass: "lucide:weight",
  temperature: "lucide:thermometer",
  speed: "lucide:gauge",
  data: "lucide:hard-drive",
};

const availableUnits = computed(() => unitEntries(category.value));
const rawResult = computed(() => convertUnit(category.value, fromValue.value, fromUnit.value, toUnit.value));
const formatter = computed(
  () => new Intl.NumberFormat(locale.value, { maximumSignificantDigits: 12, useGrouping: true }),
);
const result = computed(() => (rawResult.value === null ? "" : formatter.value.format(rawResult.value)));
const equation = computed(() => {
  const one = convertUnit(category.value, 1, fromUnit.value, toUnit.value);
  if (one === null) return "";
  return `1 ${units[category.value][fromUnit.value].symbol} = ${formatter.value.format(one)} ${units[category.value][toUnit.value].symbol}`;
});

watch(category, (nextCategory) => {
  [fromUnit.value, toUnit.value] = defaultUnits[nextCategory];
  fromValue.value = "1";
});

function swapUnits() {
  if (rawResult.value !== null) fromValue.value = String(rawResult.value);
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
}

async function copyResult() {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(`${result.value} ${units[category.value][toUnit.value].symbol}`);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1600);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <section class="unit-workspace">
    <div class="unit-categories" :aria-label="t('unitConverter.categoryLabel')">
      <button
        v-for="item in UNIT_CATEGORIES"
        :key="item"
        type="button"
        :class="{ 'is-active': category === item }"
        :aria-pressed="category === item"
        @click="category = item">
        <Icon :name="categoryIcons[item]" />
        {{ t(`unitConverter.categories.${item}`) }}
      </button>
    </div>

    <div class="unit-converter-card">
      <label class="unit-side">
        <span>{{ t("unitConverter.from") }}</span>
        <div class="unit-value-row">
          <input v-model="fromValue" type="number" inputmode="decimal" step="any" />
          <select v-model="fromUnit">
            <option v-for="unit in availableUnits" :key="unit.key" :value="unit.key">
              {{ t(`unitConverter.units.${unit.key}`) }} ({{ unit.symbol }})
            </option>
          </select>
        </div>
      </label>

      <button class="unit-swap" type="button" :aria-label="t('unitConverter.swap')" @click="swapUnits">
        <Icon name="lucide:arrow-left-right" />
      </button>

      <label class="unit-side unit-side--result">
        <span>{{ t("unitConverter.to") }}</span>
        <div class="unit-value-row">
          <output :class="{ 'is-empty': !result }">{{ result || t("unitConverter.invalid") }}</output>
          <select v-model="toUnit">
            <option v-for="unit in availableUnits" :key="unit.key" :value="unit.key">
              {{ t(`unitConverter.units.${unit.key}`) }} ({{ unit.symbol }})
            </option>
          </select>
        </div>
      </label>
    </div>

    <div class="unit-summary">
      <div>
        <p class="eyebrow">{{ t("unitConverter.equationLabel") }}</p>
        <strong>{{ equation }}</strong>
      </div>
      <button type="button" :disabled="!result" @click="copyResult">
        <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" />
        {{ copied ? t("unitConverter.copied") : t("unitConverter.copy") }}
      </button>
    </div>

    <p class="unit-note">
      <Icon name="lucide:info" />
      {{ t("unitConverter.note") }}
    </p>
  </section>
</template>

<style scoped>
.unit-workspace {
  display: grid;
  gap: 1.25rem;
}
.unit-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.unit-categories button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  padding: 0.65rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
}
.unit-categories button.is-active {
  border-color: #0d9488;
  background: #0d9488;
  color: white;
}
.unit-converter-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  gap: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: var(--ui-bg);
  padding: clamp(1.25rem, 4vw, 2.5rem);
  box-shadow: 0 14px 40px rgb(15 23 42 / 0.08);
}
.unit-side {
  display: grid;
  gap: 0.55rem;
  color: var(--ui-text);
  font-weight: 900;
}
.unit-value-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 0.8fr);
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: 0.9rem;
  background: var(--ui-bg-muted);
}
.unit-value-row input,
.unit-value-row output {
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ui-text-highlighted);
  padding: 1rem;
  font-size: clamp(1.25rem, 3vw, 1.8rem);
  font-weight: 900;
}
.unit-value-row input {
  outline: none;
}
.unit-value-row output {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unit-value-row output.is-empty {
  color: var(--ui-text-muted);
  font-size: 1rem;
}
.unit-value-row select {
  min-width: 0;
  border: 0;
  border-left: 1px solid var(--ui-border);
  background: var(--ui-bg);
  color: var(--ui-text);
  padding: 0.8rem;
  font-weight: 800;
}
.unit-swap {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 50%;
  background: var(--ui-bg-muted);
  color: var(--ui-text);
  cursor: pointer;
}
.unit-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  background: var(--ui-bg);
  padding: 1rem 1.25rem;
}
.unit-summary strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--ui-text-highlighted);
}
.unit-summary button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid #0d9488;
  border-radius: 0.75rem;
  background: #0d9488;
  color: white;
  padding: 0.7rem 0.9rem;
  font-weight: 900;
  cursor: pointer;
}
.unit-summary button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.unit-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}
.unit-note svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}
@media (max-width: 800px) {
  .unit-converter-card {
    grid-template-columns: 1fr;
  }
  .unit-swap {
    justify-self: center;
    transform: rotate(90deg);
  }
}
@media (max-width: 520px) {
  .unit-value-row {
    grid-template-columns: 1fr;
  }
  .unit-value-row select {
    border-top: 1px solid var(--ui-border);
    border-left: 0;
  }
  .unit-summary {
    align-items: stretch;
    flex-direction: column;
  }
  .unit-summary button {
    justify-content: center;
  }
}
</style>
