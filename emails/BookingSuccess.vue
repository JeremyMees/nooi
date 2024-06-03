<script lang="ts" setup>
defineProps<{
  name: string
  date: string
  time?: string
}>()
</script>

<template>
  <ETailwind
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
    <EHtml lang="nl">
      <EHead />
      <EPreview> Jouw boeking voor Nooi </EPreview>
      <EBody>
        <EContainer>
          <EText class="text-[60px] font-medium pb-10">
            NOOI
          </EText>
          <EText>
            Hallo {{ name }}
          </EText>
          <EText>
            We hebben je boeking goed ontvangen en kijken uit naar je komst. Fijn dat we je mogen verwelkomen op
            <span class="font-bold text-primary">
              {{ date }}
            </span>
            <template v-if="time">
              om
              <span class="font-bold text-primary">
                {{ time }}
              </span>
            </template>.
            Mocht je nog vragen hebben, aarzel dan niet om contact met ons op te nemen. Tot binnenkort!
          </EText>
          <EText>
            Thomas & An
          </EText>
          <EHr />
          <EText>
            <ELink
              href="https://www.google.be/maps/place/Nooi/@50.9845556,5.0496567,17z/data=!3m1!4b1!4m5!3m4!1s0x47c13f6fa13d98f1:0x204404adae3e0327!8m2!3d50.9845311!4d5.0519057"
              class="text-primary"
            >
              Schotelstraat 3, 3290 Diest
            </ELink>
            <span class="text-primary">
              |
            </span>
            <ELink
              href="tel:0496 67 23 61"
              class="text-primary"
            >
              0496 67 23 61
            </ELink>
            <span class="text-primary">
              |
            </span>
            <ELink
              href="https://nooi.be"
              class="text-primary"
            >
              nooi.be
            </ELink>
          </EText>
          <EText>
            <span class="text-primary">
              @nooidiest op
            </span>
            <ELink
              href="https://www.facebook.com/nooidiest"
              class="text-primary"
            >
              Facebook
            </ELink>
            <span class="text-primary">
              |
            </span>
            <ELink
              href="https://www.instagram.com/nooidiest/"
              class="text-primary"
            >
              Instagram
            </ELink>
            <span class="text-primary">
              |
            </span>
            <ELink
              href="https://www.tiktok.com/@nooidiest"
              class="text-primary"
            >
              TikTok
            </ELink>
          </EText>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>
