<script lang="ts" setup>
import { Text, Hr } from '@vue-email/components'
import Layout from './Layout.vue'
import type { ReminderOutcome } from '~~/shared/types/mails'

defineProps<{
  date: string
  total: number
  sent: ReminderOutcome[]
  failed: ReminderOutcome[]
  skipped: ReminderOutcome[]
}>()
</script>

<template>
  <Layout
    :title="`Herinneringen ${date}`"
    :preview="`${sent.length} verstuurd, ${failed.length} mislukt`"
  >
    <Text>
      Overzicht van de herinneringsmails voor
      <span class="font-bold text-[#305445]">{{ date }}</span
      >.
    </Text>
    <Text>
      <span class="font-bold text-[#305445]">{{ total }}</span> reservatie(s)
      gevonden &middot;
      <span class="font-bold text-[#305445]">{{ sent.length }}</span> verstuurd
      &middot;
      <span class="font-bold text-[#305445]">{{ failed.length }}</span> mislukt
      &middot;
      <span class="font-bold text-[#305445]">{{ skipped.length }}</span>
      overgeslagen
    </Text>

    <template v-if="failed.length">
      <Hr />
      <Text class="font-bold text-[#305445]"> Mislukt </Text>
      <Text v-for="item in failed" :key="item.id">
        {{ item.name }} &middot; {{ item.email }} &middot; #{{ item.id }}
        <br />
        <span class="text-[#305445]">{{ item.reason }}</span>
      </Text>
    </template>

    <template v-if="skipped.length">
      <Hr />
      <Text class="font-bold text-[#305445]">
        Overgeslagen (geen geldig e-mailadres)
      </Text>
      <Text v-for="item in skipped" :key="item.id">
        {{ item.name }} &middot; #{{ item.id }}
        <template v-if="item.email">
          &middot; <span class="text-[#305445]">{{ item.email }}</span>
        </template>
      </Text>
    </template>

    <template v-if="sent.length">
      <Hr />
      <Text class="font-bold text-[#305445]"> Verstuurd </Text>
      <Text v-for="item in sent" :key="item.id">
        {{ item.name }} &middot; {{ item.email }} &middot; #{{ item.id }}
      </Text>
    </template>

    <template v-if="!total">
      <Hr />
      <Text> Er waren vandaag geen reservaties om aan te herinneren. </Text>
    </template>
  </Layout>
</template>
