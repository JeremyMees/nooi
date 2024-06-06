<script setup lang="ts">
function enter(element: any): void {
  const width = getComputedStyle(element).width

  element.style.width = width
  element.style.position = 'absolute'
  element.style.visibility = 'hidden'
  element.style.height = 'auto'

  const height = getComputedStyle(element).height

  element.style.width = null
  element.style.position = null
  element.style.visibility = null
  element.style.height = 0

  getComputedStyle(element).height

  requestAnimationFrame(() => element.style.height = height)
}

function afterEnter(element: any): void {
  element.style.height = 'auto'
}

function leave(element: any): void {
  const height = getComputedStyle(element).height

  element.style.height = height

  getComputedStyle(element).height

  requestAnimationFrame(() => element.style.height = 0)
}
</script>

<template>
  <Transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot />
  </Transition>
</template>

<style scoped>
* {
  @apply will-change-[height] transform-gpu;
}

.expand-enter-active, .expand-leave-active {
  @apply overflow-hidden transition-all duration-500 ease-in-out;
}

.expand-enter, .expand-leave-to {
  @apply h-0;
}
</style>
