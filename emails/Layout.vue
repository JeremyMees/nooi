<script setup lang="ts">
import { Text, Container, Link, Hr, Html, Head, Preview, Body, Tailwind } from '@vue-email/components'

defineProps<{
  title: string
  preview: string
  name?: string
}>()
</script>

<template>
  <Tailwind
    :config="{
      theme: {
        extend: {
          colors: {
            white: '#FEFDF7',
            black: '#0F0E0A',
            primary: {
              DEFAULT: 'rgb(var(--primary-500))',
              50: 'rgb(var(--primary-50))',
              100: 'rgb(var(--primary-100))',
              200: 'rgb(var(--primary-200))',
              300: 'rgb(var(--primary-300))',
              400: 'rgb(var(--primary-400))',
              500: 'rgb(var(--primary-500))',
              600: 'rgb(var(--primary-600))',
              700: 'rgb(var(--primary-700))',
              800: 'rgb(var(--primary-800))',
              900: 'rgb(var(--primary-900))',
              950: 'rgb(var(--primary-950))',
            },
            secondary: '#C35200',
            teal: '#53A688',
            surface: {
              DEFAULT: 'rgb(var(--surface-500))',
              0: 'rgb(var(--surface-0))',
              50: 'rgb(var(--surface-50))',
              100: 'rgb(var(--surface-100))',
              200: 'rgb(var(--surface-200))',
              300: 'rgb(var(--surface-300))',
              400: 'rgb(var(--surface-400))',
              500: 'rgb(var(--surface-500))',
              600: 'rgb(var(--surface-600))',
              700: 'rgb(var(--surface-700))',
              800: 'rgb(var(--surface-800))',
              900: 'rgb(var(--surface-900))',
              950: 'rgb(var(--surface-950))',
            },
          },
        },
      },
    }"
  >
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
              class="text-primary"
            >
              Schotelstraat 3, 3290 Diest
            </Link>
            <span class="text-primary">
              |
            </span>
            <Link
              href="tel:0496 67 23 61"
              class="text-primary"
            >
              0496 67 23 61
            </Link>
            <span class="text-primary">
              |
            </span>
            <Link
              href="https://nooi.be"
              class="text-primary"
            >
              nooi.be
            </Link>
          </Text>
          <Text>
            <span class="text-primary">
              @nooidiest op
            </span>
            <Link
              href="https://www.facebook.com/nooidiest"
              class="text-primary"
            >
              Facebook
            </Link>
            <span class="text-primary">
              |
            </span>
            <Link
              href="https://www.instagram.com/nooidiest/"
              class="text-primary"
            >
              Instagram
            </Link>
            <span class="text-primary">
              |
            </span>
            <Link
              href="https://www.tiktok.com/@nooidiest"
              class="text-primary"
            >
              TikTok
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>
