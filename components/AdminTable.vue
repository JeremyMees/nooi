<script setup lang="ts">
import { reset } from '@formkit/core'
import DataTable from 'primevue/datatable'
import { values } from '@/constants/admin'

const props = defineProps<{ type: DatabaseTable }>()

const store = useAdminStore()

const content = ref<string>('')
const creating = ref<boolean>(false)
const selected = ref<any[]>([])
const expandedRows = ref<Record<string, boolean>>()

const filters = ref<Record<string, any>>({
  search: '',
  date: null,
  first: 0,
  sortField: null,
  sortOrder: null,
})

watchDebounced([() => filters.value.search, () => filters.value.date], async () => {
  await onTableEvent()
}, { debounce: 500, maxWait: 1000 })

onMounted(async () => {
  await store.fetchData(props.type)
})

function generateString(data: Record<string, any>, field: string): string {
  if (!data[field]) return ''
  else if (['start', 'end'].includes(field)) return formatHour(data[field])
  else if (field === 'type') return getType(data[field])
  else if (field === 'status') return getStatus(data[field])
  else if (field === 'reservations') return countSpots(data).toString()
  else if (field === 'event') return data[field].name
  else if (field === 'day') return formatDateUI(data[field])
  else return data[field]
}

async function submit(form: RosterInsert | EventInsert | ReservationInsert): Promise<void> {
  if (props.type === 'events') {
    form = {
      ...form,
      description: content.value,
    }
  }
  else if (props.type === 'reservations') {
    const event = store.events.find(({ id }) => id === (form as ReservationInsert).event)

    form = {
      ...form,
      ...(event
        ? { day: event.day, start: event.start, end: event.end }
        : {}
      ),
    } as ReservationInsert
  }

  if (form.id) {
    const { id, created_at, ...payload } = form

    if ('reservations' in payload) {
      delete payload.reservations
    }

    await store.updateData(id, props.type, payload)
    expandedRows.value = {}
  }
  else {
    await store.createData(props.type, form)
  }

  clearFilters()
  reset(form?.id ? `${props.type}-${form.id}` : props.type)
  content.value = ''
  creating.value = false
}

async function onTableEvent(data?: TableEvent): Promise<void> {
  filters.value = { ...filters.value, ...(data || {}) }
  const page = data ? filters.value.first ? filters.value.first / 10 : 0 : 0

  const options: Partial<SbQueryOptions> = {
    fuzzy: true,
    page,
    search: filters.value.search,
    ...(filters.value.date ? { eq: [{ field: 'day', value: filters.value.date }] } : {}),
    fields: values[props.type].filter,
    sort: filters.value.sortField
      ? [
          {
            field: filters.value.sortField,
            order: filters.value.sortOrder === 1 ? 'asc' : 'desc',
          },
        ]
      : undefined,
  }

  await store.fetchData(props.type, options)
}

function onRowExpand({ data }: { data: Record<string, any> }): void {
  expandedRows.value = { [data.id]: true }

  if (props.type === 'events') {
    content.value = data.description
  }
}

function onRowCollapse({ data }: { data: Record<string, any> }): void {
  reset(`${props.type}-${data.id}`)

  if (props.type === 'events') {
    content.value = ''
  }
}

function clearFilters(): void {
  filters.value.search = ''
  filters.value.date = null
  filters.value.first = 0
}
</script>

<template>
  <div class="space-y-4">
    <p class="head-2 pb-4">
      {{ values[type].title }}
    </p>
    <DataTable
      v-model:selection="selected"
      v-model:expandedRows="expandedRows"
      data-key="id"
      size="small"
      :value="store.data[type].data"
      paginator
      removable-sort
      lazy
      sort-field="day"
      :sort-order="1"
      :first="filters.first"
      :rows="10"
      :total-records="store.data[type].count"
      :loading="store.data[type].loading"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} tot {last} van {totalRecords}"
      @page="onTableEvent"
      @sort="onTableEvent"
      @row-expand="onRowExpand"
      @row-collapse="onRowCollapse"
    >
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4 justify-between flex-wrap">
            <div class="flex gap-4 flex-wrap items-center">
              <FormKit
                v-if="values[type].filter.length"
                v-model="filters.search"
                :disabled="creating || !!Object.keys(expandedRows || {}).length"
                type="search"
                prefix-icon="search"
                outer-class="$remove:mb-4 $remove:max-w-none max-w-[250px] mb-0"
              />
              <FormKit
                v-model="filters.date"
                :disabled="creating || !!Object.keys(expandedRows || {}).length"
                type="date"
                outer-class="$remove:mb-4 $remove:max-w-none max-w-[250px] mb-0"
              />
              <AnimationReveal>
                <Button
                  v-if="filters.search || filters.date"
                  :disabled="creating || !!Object.keys(expandedRows || {}).length"
                  icon="pi pi-trash"
                  label="Filters verwijderen"
                  severity="danger"
                  text
                  @click="clearFilters"
                />
              </AnimationReveal>
            </div>
            <Button
              :disabled="!!Object.keys(expandedRows || {}).length"
              :icon="`pi pi-${creating ? 'times' : 'plus'}`"
              :severity="creating ? 'danger' : undefined"
              :label="creating ? 'Annuleer toevoegen' : 'Toevoegen'"
              @click="creating = !creating"
            />
          </div>
          <ClientOnly>
            <AnimationExpand>
              <FormKit
                v-if="creating && !Object.keys(expandedRows || {}).length"
                :id="type"
                type="form"
                submit-label="Toevoegen"
                :config="{ validationVisibility: 'blur' }"
                @submit="submit"
              >
                <FormRoster v-if="type === 'rosters'" />
                <FormEvent v-else-if="type === 'events'" />
                <FormAdminReservation v-else-if="type === 'reservations'" />
                <div
                  v-if="type === 'events'"
                  class="h-[400px] mb-10"
                >
                  <span class="text-sm text-black">
                    Omscrijving
                  </span>
                  <Editor v-model:content="content" />
                </div>
              </FormKit>
            </AnimationExpand>
          </ClientOnly>
        </div>
      </template>

      <Column
        selection-mode="multiple"
        header-style="width: 2rem"
      />
      <Column expander />
      <Column
        v-for="column in values[type].table"
        :key="column.field"
        :sortable="['name', 'day'].includes(column.field)"
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
          <Button
            v-else-if="column.field === 'update'"
            icon="pi pi-cog"
            outlined
            size="small"
          />
          <span v-else>
            {{ generateString(data, column.field) }}
          </span>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3">
          <ClientOnly>
            <FormKit
              :id="`${type}-${slotProps.data.id}`"
              type="form"
              submit-label="Bijwerken"
              :value="slotProps.data"
              :config="{ validationVisibility: 'blur' }"
              @submit="submit"
            >
              <FormRoster v-if="type === 'rosters'" />
              <FormEvent v-else-if="type === 'events'" />
              <FormAdminReservation v-else-if="type === 'reservations'" />
              <div
                v-if="type === 'events'"
                class="h-[400px] mb-10"
              >
                <span class="text-sm text-black">
                  Omscrijving
                </span>
                <Editor v-model:content="content" />
              </div>
            </FormKit>
          </ClientOnly>
        </div>
      </template>

      <template #empty>
        <p class="text-center">
          Geen {{ values[type].title.toLowerCase() }} gevonden met deze filters
        </p>
      </template>
    </DataTable>
    <AnimationReveal>
      <Button
        v-if="selected.length"
        severity="danger"
        icon="pi pi-trash"
        label="Verwijder geselecteerde"
        @click="() => {
          store.removeData(type, selected)
          selected = []
          clearFilters()
        }"
      />
    </AnimationReveal>
  </div>
</template>
