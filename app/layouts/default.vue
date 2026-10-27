<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />

    <UMain class="relative grow pb-35 flex flex-col gap-15 overflow-hidden">
      <slot />
    </UMain>

    <Footer />
  </div>
</template>
