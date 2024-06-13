<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />

    <main class="relative grow pb-[140px] flex flex-col gap-[80px] overflow-hidden">
      <slot />
    </main>

    <Footer />
  </div>
</template>
