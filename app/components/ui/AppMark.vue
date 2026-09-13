<script setup>
const props = defineProps({
  icon: { type: String, required: true },
  color: { type: String, required: true },
  foreground: { type: String, default: "#ffffff" },
  size: { type: String, default: "md" },
});

const markStyle = computed(() => ({
  "--app-mark-color": props.color,
  "--app-mark-foreground": props.foreground,
}));
</script>

<template>
  <span class="app-mark" :class="`app-mark--${size}`" :style="markStyle" aria-hidden="true">
    <Icon :name="icon" />
  </span>
</template>
