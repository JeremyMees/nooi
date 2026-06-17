<script setup lang="ts">
import { Text, Container, Link, Hr, Html, Head, Preview, Body, Tailwind } from '@vue-email/components'

defineProps<{
  title: string
  preview: string
  name?: string
}>()
</script>

<template>
  <Tailwind>
    <Html lang="nl">
      <Head>
        <title> {{ title }} </title>
      </Head>
      <Preview> {{ preview }} </Preview>
      <Body>
        <Container>
          <Text class="text-[60px] font-medium pb-10">
            NOOI
          </Text>
          <Text v-if="name">
            Hallo {{ name }},
          </Text>
          <slot />
          <Hr />

          <Text>
            <Link
              href="https://nooi.be/locatie/"
              class="text-[#305445]"
            >
              Schotelstraat 3, 3290 Diest
            </Link>
            <span class="text-[#305445]">
              |
            </span>
            <Link
              href="tel:+32496672361"
              class="text-[#305445]"
            >
              0496 67 23 61
            </Link>
            <span class="text-[#305445]">
              |
            </span>
            <Link
              href="https://nooi.be"
              class="text-[#305445]"
            >
              nooi.be
            </Link>
          </Text>
          <Text>
            <span class="text-[#305445]">
              @nooidiest op
            </span>
            <Link
              href="https://www.facebook.com/nooidiest"
              class="text-[#305445]"
            >
              Facebook
            </Link>
            <span class="text-[#305445]">
              |
            </span>
            <Link
              href="https://www.instagram.com/nooidiest/"
              class="text-[#305445]"
            >
              Instagram
            </Link>
            <span class="text-[#305445]">
              |
            </span>
            <Link
              href="https://www.tiktok.com/@nooidiest"
              class="text-[#305445]"
            >
              TikTok
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>
