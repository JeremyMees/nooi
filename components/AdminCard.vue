<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api'
import { values } from '@/constants/admin'

const props = defineProps<{ type: DatabaseTable }>()

const store = useAdminStore()

// only get data from specific day
// multi select remove
// create records
// update records

const filters = ref<Record<string, TableFilter>>({
  global: {
    value: '',
    matchMode: FilterMatchMode.CONTAINS,
  },
})

watch(() => store.needsAuth, async (value) => {
  if (!value) store.fetchData(props.type)
}, { immediate: true })

function generateString(data: Record<string, any>, field: string): string {
  if (!data[field]) return ''
  else if (['start', 'end'].includes(field)) return formatHour(data[field])
  else if (['status', 'type'].includes(field)) return getType(data[field])
  else if (field === 'reservations') return data[field].length
  else if (field === 'event') return data[field].name
  else return data[field]
}

function getType(type: string): string {
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
      v-model:filters="filters"
      :value="store.data[type].data"
      paginator
      removable-sort
      :rows="10"
      :total-records="store.data[type].count"
      :loading="store.data[type].loading"
      :global-filter-fields="values.filter[type]"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} tot {last} van {totalRecords}"
    >
      <template #header>
        <div class="flex gap-4">
          <FormKit
            v-model="filters.global.value"
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
        sortable
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data }">
          <Icon
            v-if="column.field === 'exclusive'"
            :name="data.exclusive ? 'radix-icons:check' : 'radix-icons:cross-2'"
            :class="[data.exclusive ? 'text-teal' : 'text-secondary']"
            class="h-6 w-6"
          />
          <a
            v-else-if="['email', 'number'].includes(column.field)"
            :href="`${column.field === 'email' ? 'mailto' : 'tel'}:${data[column.field]}`"
            class="underline"
          >
            {{ data[column.field] }}
          </a>
          <span v-else>
            {{ generateString(data, column.field) }}
          </span>
        </template>
      </Column>

      <template #empty>
        <p class="text-center">
          Geen {{ values.title[type].toLowerCase() }} gevonden met deze filters
        </p>
      </template>
    </DataTable>
  </div>
</template>
