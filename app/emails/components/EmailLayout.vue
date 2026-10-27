<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    preview: string
    greeting?: boolean
  }>(),
  { greeting: true },
)
</script>

<template>
  <Html lang="nl">
    <Head>
      <title>{{ title }}</title>
      <style>
        @import '@maizzle/tailwindcss';

        @theme {
          --color-primary: #305445;
          --color-divider: #eaeaea;
        }
      </style>
    </Head>
    <Body class="m-0 bg-white">
      <Preheader>{{ preview }}</Preheader>
      <Container class="max-w-150 px-3">
        <Text class="pb-10 text-[60px] font-medium">NOOI</Text>
        <Text v-if="greeting" class="my-4 text-sm/6">
          Hallo <span v-pre>{{ name }}</span
          >,
        </Text>
        <slot />
        <Hr class="my-6.5 bg-divider" />
        <Text class="my-4 text-sm/6">
          <Link href="https://nooi.be/locatie/" class="text-primary">
            Schotelstraat 3, 3290 Diest
          </Link>
          <span class="text-primary"> | </span>
          <Link href="tel:+32496672361" class="text-primary">
            0496 67 23 61
          </Link>
          <span class="text-primary"> | </span>
          <Link href="https://nooi.be" class="text-primary">nooi.be</Link>
        </Text>
        <Text class="my-4 text-sm/6">
          <span class="text-primary">@nooidiest op </span>
          <Link href="https://www.facebook.com/nooidiest" class="text-primary">
            Facebook
          </Link>
          <span class="text-primary"> | </span>
          <Link
            href="https://www.instagram.com/nooidiest/"
            class="text-primary"
          >
            Instagram
          </Link>
          <span class="text-primary"> | </span>
          <Link href="https://www.tiktok.com/@nooidiest" class="text-primary">
            TikTok
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
</template>
