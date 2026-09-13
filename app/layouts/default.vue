<template>
  <div class="min-h-screen flex flex-col">
    <LayoutsHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutsFooter />
  </div>
</template>
