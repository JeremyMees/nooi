<template>
  <nav class="pt-[10px]">
    <div class="flex flex-col sm:flex-row sm:items-center max-w-[750px] mx-auto py-[10px]">
      <div class="h-[100px] flex flex-col justify-center flex-1">
        <div class="flex flex-wrap justify-center gap-x-16">
          <NuxtLink
            to="/"
            class="nav-link"
          >
            kalender
          </NuxtLink>
          <NuxtLink
            to="https://nooi.be/aanbod/"
            class="nav-link"
          >
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
        <div class="flex flex-wrap justify-center gap-x-16">
          <NuxtLink
            to="https://nooi.be/locatie/"
            class="nav-link"
          >
            locatie
          </NuxtLink>
          <NuxtLink
            to="https://nooi.be/info/"
            class="nav-link"
          >
            info
          </NuxtLink>
        </div>
      </div>
    </div>
    <hr class="pt-[15px] border-surface-200 my-[10px]">
  </nav>
</template>
