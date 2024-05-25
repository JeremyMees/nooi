<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />

    <main class="relative grow pt-10 pb-[140px] flex flex-col gap-[120px] overflow-hidden">
      <slot />
    </main>

    <Footer />
  </div>
</template>
