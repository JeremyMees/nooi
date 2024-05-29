<template>
  <nav class="pt-[10px]">
    <div class="flex flex-col sm:flex-row sm:items-center max-w-[750px] mx-auto py-[10px]">
      <div class="h-[100px] flex flex-col justify-center flex-1">
        <div class="flex flex-wrap justify-center gap-x-16 font-bold body-normal">
          <NuxtLink to="/">
            kalender
          </NuxtLink>
          <NuxtLink to="https://nooi.be/aanbod/">
            aanbod
          </NuxtLink>
        </div>
      </div>
      <NuxtLink
        to="https://nooi.be/"
        class="h-[100px] flex flex-col justify-center flex-1 text-[60px] font-medium text-center"
      >
        NOOI
      </NuxtLink>
      <div class="h-[100px] flex flex-col justify-center flex-1">
        <div class="flex flex-wrap justify-center gap-x-16 font-bold body-normal">
          <NuxtLink to="https://nooi.be/locatie/">
            locatie
          </NuxtLink>
          <NuxtLink to="/">
            info
          </NuxtLink>
        </div>
      </div>
    </div>
    <hr class="py-[15px] border-surface-200 my-[10px]">
  </nav>
</template>
