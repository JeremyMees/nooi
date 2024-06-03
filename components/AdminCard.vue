<script setup lang="ts">
import { values } from '@/constants/admin'

const props = defineProps<{ type: AdminDataTypes }>()

const store = useAdminStore()

watch(() => store.needsAuth, async (value) => {
  if (!value) store.fetchData(props.type)
}, { immediate: true })

function getType(type: string): string {
  console.log(type)

  switch (type) {
    case 'event':
      return 'evenement'
    case 'game':
      return 'reservering'
    default:
      return 'vehuur'
  }
}
</script>

<template>
  <div>
    <p class="head-2 pb-4">
      {{ values.title[type] }}
    </p>
    <DataTable
      :value="store.data[type].data"
      paginator
      :rows="10"
      :total-records="store.data[type].count"
      :loading="store.data[type].loading"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} tot {last} van {totalRecords}"
    >
      <template #header>
        <div class="flex gap-4">
          <FormKit
            v-model="store.data[type].search"
            type="search"
            prefix-icon="search"
            outer-class="$remove:mb-4 $remove:max-w-none max-w-sm mb-0"
          />
          <FormKit
            v-model="store.data[type].date"
            type="date"
            outer-class="$remove:mb-4 $remove:max-w-none max-w-sm mb-0"
          />
        </div>
      </template>

      <Column
        v-for="column in values.table[type]"
        :key="column.field"
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data }">
          <Icon
            v-if="column.field === 'exclusive'"
            :name="data.exclusive ? 'radix-icons:check' : 'radix-icons:cross-2'"
            :class="[data.exclusive ? 'text-green-400' : 'text-red-400']"
            class="h-6 w-6"
          />
          <span v-else-if="['status', 'type'].includes(column.field)">
            {{ getType(data[column.field]) }}
          </span>
          <span v-else>
            {{ data[column.field] }}
          </span>
        </template>
      </Column>

      <template #empty>
        <p class="text-center">
          Geen {{ values.title[type].toLowerCase() }} gevonden met deze filters
        </p>
      </template>
    </DataTable>

    <pre>
      {{ store.data[type].data[0] }}
    </pre>
  </div>
</template>
