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
      <EPreview> Reservatie Nooi </EPreview>
      <EBody>
        <EContainer>
          <EText class="text-[60px] font-medium pb-10">
            NOOI
          </EText>
          <EText>
            Hey {{ name }},
          </EText>
          <EText>
            Wij hebben je reservatie met veel plezier goed ontvangen. We kijken er alvast enorm naar uit om je te mogen verwelkomen op
            <span class="font-bold text-primary">
              {{ date }}
            </span>
            <template v-if="time">
              om
              <span class="font-bold text-primary">
                {{ time }}
              </span>
            </template>.
            Mocht je nog vragen hebben of aanvullende wensen, aarzel dan niet om contact met ons op te nemen. Tot dan!
          </EText>
          <EText>
            Het Nooi team
          </EText>
          <EHr />
          <EText>
            <ELink
              href="https://www.google.be/maps/place/Nooi/@50.9845556,5.0496567,17z/data=!3m1!4b1!4m5!3m4!1s0x47c13f6fa13d98f1:0x204404adae3e0327!8m2!3d50.9845311!4d5.0519057"
              class="text-primary"
            >
              Schotelstraat 3, 3290 Diest
            </ELink>
            <span class="mx-4 text-gray-light">
              -
            </span>
            <ELink
              href="tel:0496 67 23 61"
              class="text-primary"
            >
              0496 67 23 61
            </ELink>
          </EText>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>
