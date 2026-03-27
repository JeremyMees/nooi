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
              href="https://www.google.be/maps/place/Nooi/@50.9845556,5.0496567,17z/data=!3m1!4b1!4m5!3m4!1s0x47c13f6fa13d98f1:0x204404adae3e0327!8m2!3d50.9845311!4d5.0519057"
              class="text-[#305445]"
            >
              Schotelstraat 3, 3290 Diest
            </Link>
            <span class="text-[#305445]">
              |
            </span>
            <Link
              href="tel:0496 67 23 61"
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
