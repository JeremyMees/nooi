<template>
  <nav class="pt-[10px]">
    <div
      class="flex flex-col sm:flex-row sm:items-center max-w-[750px] mx-auto py-[10px]"
    >
      <div class="h-[100px] flex flex-col justify-center flex-1">
        <div class="flex flex-wrap justify-center gap-x-16">
          <NuxtLink to="/" test-id="nav-kalender" class="nav-link">
            kalender
          </NuxtLink>
          <NuxtLink
            to="https://nooi.be/aanbod/"
            test-id="nav-aanbod"
            class="nav-link"
          >
            aanbod
          </NuxtLink>
        </div>
      </div>
      <NuxtLink
        to="https://nooi.be/"
        test-id="nav-home"
        class="h-[100px] flex flex-col justify-center flex-1 text-[60px] font-medium text-center"
      >
        NOOI
      </NuxtLink>
      <div class="h-[100px] flex flex-col justify-center flex-1">
        <div class="flex flex-wrap justify-center gap-x-16">
          <NuxtLink
            to="https://nooi.be/locatie/"
            test-id="nav-locatie"
            class="nav-link"
          >
            locatie
          </NuxtLink>
          <NuxtLink
            to="https://nooi.be/info/"
            test-id="nav-info"
            class="nav-link"
          >
            info
          </NuxtLink>
        </div>
      </div>
    </div>
    <hr class="pt-[15px] border-surface-200 my-[10px]" />
  </nav>
</template>
