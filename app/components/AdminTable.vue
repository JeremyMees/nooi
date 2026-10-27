<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { values } from '~~/shared/constants/admin'

type Row = EventReservation | AdminReservationRow | RosterRow

const props = defineProps<{ type: DatabaseTable }>()

const store = useAdminStore()

const perPage = 10
const sortable = ['name', 'day']

const creating = ref<boolean>(false)
const rowSelection = ref<Record<string, boolean>>({})
const expandedRows = ref<Record<string, boolean>>({})

const filters = ref<{
  search: string
  date?: string
  page: number
  sort?: SbSort
}>({
  search: '',
  page: 1,
})

const rows = computed<Row[]>(() => store.data[props.type].data)

const selected = computed<Row[]>(() =>
  rows.value.filter(({ id }) => rowSelection.value[id]),
)

const editing = computed<boolean>(
  () => !!Object.keys(expandedRows.value).length,
)

const columns = computed<TableColumn<Row>[]>(() => [
  { id: 'select' },
  { id: 'expand' },
  ...values[props.type].table.map(({ field, header }) => ({
    id: field,
    accessorKey: field,
    header,
  })),
])

const range = computed<string>(() => {
  const total = store.data[props.type].count ?? 0
  const first = total ? (filters.value.page - 1) * perPage + 1 : 0
  const last = Math.min(filters.value.page * perPage, total)

  return `${first} tot ${last} van ${total}`
})

watchDebounced(
  [() => filters.value.search, () => filters.value.date],
  async () => {
    filters.value.page = 1
    await load()
  },
  { debounce: 500, maxWait: 1000 },
)

onMounted(async () => {
  await store.fetchData(props.type)
})

function cellValue(row: Row, field: string): unknown {
  return Reflect.get(row, field)
}

function generateString(data: Row, field: string): string {
  const value = cellValue(data, field)

  if (!value) return ''
  else if (['start', 'end'].includes(field)) return formatHour(String(value))
  else if (field === 'type') return getType(String(value))
  else if (field === 'status') return getStatus(String(value))
  else if (field === 'reservations')
    return getReservedSpots(
      value as EventReservation['reservations'],
    ).toString()
  else if (field === 'event') return (value as { name: string }).name
  else if (field === 'day') return formatDateUI(String(value))
  else return String(value)
}

async function submit(
  form: RosterInsert | EventInsert | ReservationInsert,
): Promise<void> {
  if (form.id) {
    const { id, ...payload } = form

    await store.updateData(id, props.type, payload)
    expandedRows.value = {}
  } else {
    await store.createData(props.type, form)
  }

  clearFilters()
  creating.value = false
}

async function load(): Promise<void> {
  const { search, date, page, sort } = filters.value

  await store.fetchData(props.type, {
    fuzzy: true,
    page: page - 1,
    search,
    ...(date ? { eq: [{ field: 'day', value: date }] } : {}),
    fields: values[props.type].filter,
    sort,
  })
}

async function changePage(page: number): Promise<void> {
  filters.value.page = page
  await load()
}

async function toggleSort(field: string): Promise<void> {
  const { sort } = filters.value

  filters.value.sort =
    sort?.field !== field
      ? { field, order: 'asc' }
      : sort.order === 'asc'
        ? { field, order: 'desc' }
        : undefined
  filters.value.page = 1

  await load()
}

function sortIcon(field: string): string {
  const { sort } = filters.value

  if (sort?.field !== field) return 'i-lucide-arrow-up-down'

  return sort.order === 'asc'
    ? 'i-lucide-arrow-up-narrow-wide'
    : 'i-lucide-arrow-down-wide-narrow'
}

function toggleRow(data: Row): void {
  if (expandedRows.value[data.id]) {
    expandedRows.value = {}

    return
  }

  expandedRows.value = { [data.id]: true }
}

async function removeSelected(): Promise<void> {
  const items = selected.value

  rowSelection.value = {}
  clearFilters()

  await store.removeData(props.type, items as never)
}

function clearFilters(): void {
  filters.value.search = ''
  filters.value.date = undefined
  filters.value.page = 1
}
</script>

<template>
  <div class="space-y-4">
    <p test-id="admin-title" class="head-2 pb-4">
      {{ values[type].title }}
    </p>
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4 justify-between flex-wrap">
        <div class="flex gap-4 flex-wrap items-center">
          <UInput
            v-if="values[type].filter.length"
            v-model="filters.search"
            test-id="admin-search"
            :disabled="creating || editing"
            type="search"
            icon="i-lucide-search"
            placeholder="Zoeken"
            aria-label="Zoeken"
            class="w-full sm:w-62.5"
          />
          <FormDateInput
            v-model="filters.date"
            test-id="admin-date"
            :disabled="creating || editing"
            class="w-full sm:w-62.5"
          />
          <AnimationReveal>
            <UButton
              v-if="filters.search || filters.date"
              test-id="admin-clear-filters"
              :disabled="creating || editing"
              icon="i-lucide-trash-2"
              label="Filters verwijderen"
              color="error"
              variant="ghost"
              @click="clearFilters"
            />
          </AnimationReveal>
        </div>
        <UButton
          test-id="admin-create-toggle"
          :disabled="editing"
          :icon="creating ? 'i-lucide-x' : 'i-lucide-plus'"
          :color="creating ? 'error' : 'primary'"
          :label="creating ? 'Annuleer toevoegen' : 'Toevoegen'"
          @click="creating = !creating"
        />
      </div>
      <ClientOnly>
        <AnimationExpand>
          <FormRoster
            v-if="creating && !editing && type === 'rosters'"
            submit-label="Toevoegen"
            @submit="submit"
          />
          <FormEvent
            v-else-if="creating && !editing && type === 'events'"
            submit-label="Toevoegen"
            @submit="submit"
          />
          <FormAdminReservation
            v-else-if="creating && !editing"
            submit-label="Toevoegen"
            @submit="submit"
          />
        </AnimationExpand>
      </ClientOnly>
    </div>

    <UTable
      v-model:row-selection="rowSelection"
      v-model:expanded="expandedRows"
      :data="rows"
      :columns="columns"
      :loading="store.data[type].loading"
      :get-row-id="(row: Row) => String(row.id)"
      :ui="{
        root: 'rounded-lg border border-surface-200 bg-surface-0 shadow-lg',
        thead: 'bg-surface-50',
        tbody: 'divide-surface-200',
        tr: 'hover:bg-surface-100 data-[selected=true]:bg-primary/10',
        th: 'px-3 py-2 text-sm font-bold text-surface-700',
        td: 'px-3 py-2 text-sm text-surface-700',
      }"
    >
      <template #select-header="{ table }">
        <UCheckbox
          :model-value="
            table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : table.getIsAllPageRowsSelected()
          "
          aria-label="Alles selecteren"
          @update:model-value="table.toggleAllPageRowsSelected(!!$event)"
        />
      </template>
      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="row.getIsSelected()"
          aria-label="Rij selecteren"
          @update:model-value="row.toggleSelected(!!$event)"
        />
      </template>
      <template #expand-cell="{ row }">
        <UButton
          test-id="admin-row-toggle"
          :icon="
            row.getIsExpanded()
              ? 'i-lucide-chevron-down'
              : 'i-lucide-chevron-right'
          "
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="row.getIsExpanded() ? 'Sluiten' : 'Bewerken'"
          @click="toggleRow(row.original)"
        />
      </template>
      <template
        v-for="column in values[type].table"
        :key="column.field"
        #[`${column.field}-header`]
      >
        <UButton
          v-if="sortable.includes(column.field)"
          :label="column.header"
          :trailing-icon="sortIcon(column.field)"
          color="neutral"
          variant="ghost"
          size="sm"
          class="-mx-3 font-bold"
          @click="toggleSort(column.field)"
        />
        <span v-else>{{ column.header }}</span>
      </template>
      <template
        v-for="column in values[type].table"
        :key="column.field"
        #[`${column.field}-cell`]="{ row }"
      >
        <UIcon
          v-if="['exclusive', 'allowReservation'].includes(column.field)"
          :name="
            cellValue(row.original, column.field)
              ? 'i-lucide-check'
              : 'i-lucide-x'
          "
          :class="[
            cellValue(row.original, column.field)
              ? 'text-teal'
              : 'text-secondary',
          ]"
          class="size-6"
        />
        <span v-else>
          {{ generateString(row.original, column.field) }}
        </span>
      </template>

      <template #expanded="{ row }">
        <div class="p-3">
          <ClientOnly>
            <FormRoster
              v-if="type === 'rosters'"
              :roster="row.original as RosterRow"
              submit-label="Bijwerken"
              @submit="submit({ ...$event, id: row.original.id })"
            />
            <FormEvent
              v-else-if="type === 'events'"
              :event="row.original as EventRow"
              submit-label="Bijwerken"
              @submit="submit({ ...$event, id: row.original.id })"
            />
            <FormAdminReservation
              v-else
              :reservation="row.original as AdminReservationRow"
              submit-label="Bijwerken"
              @submit="submit({ ...$event, id: row.original.id })"
            />
          </ClientOnly>
        </div>
      </template>

      <template #empty>
        <p class="text-center">
          Geen {{ values[type].title.toLowerCase() }} gevonden met deze filters
        </p>
      </template>
    </UTable>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <span test-id="admin-range" class="text-sm text-surface-500">
        {{ range }}
      </span>
      <UPagination
        :page="filters.page"
        :total="store.data[type].count ?? 0"
        :items-per-page="perPage"
        :sibling-count="1"
        show-edges
        @update:page="changePage"
      />
    </div>

    <AnimationReveal>
      <UButton
        v-if="selected.length"
        test-id="admin-remove-selected"
        color="error"
        icon="i-lucide-trash-2"
        label="Verwijder geselecteerde"
        @click="removeSelected"
      />
    </AnimationReveal>
  </div>
</template>
