<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api'
import { sameDay } from '@formkit/tempo'
import { reset } from '@formkit/core'
import { values } from '@/constants/admin'

const props = defineProps<{ type: DatabaseTable }>()

const store = useAdminStore()

const content = ref<string>('')
const creating = ref<boolean>(false)
const selected = ref<any[]>([])
const expandedRows = ref<Record<string, boolean>>()

const filters = ref<Record<string, TableFilter>>({
  global: {
    value: '',
    matchMode: FilterMatchMode.CONTAINS,
  },
})

const isToday = computed<boolean>(() => {
  return sameDay(store.data[props.type].date, new Date())
})

watch(() => store.data[props.type].date, async (value) => {
  if (value) store.fetchData(props.type)
}, { immediate: true })

function generateString(data: Record<string, any>, field: string): string {
  if (!data[field]) return ''
  else if (['start', 'end'].includes(field)) return formatHour(data[field])
  else if (field === 'type') return getType(data[field])
  else if (field === 'status') return getStatus(data[field])
  else if (field === 'reservations') return data[field].length
  else if (field === 'event') return data[field].name
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

  reset(form?.id ? `${props.type}-${form.id}` : props.type)
  content.value = ''
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
</script>

<template>
  <div class="space-y-4">
    <p class="head-2 pb-4">
      {{ values[type].title }}
    </p>
    <DataTable
      v-model:filters="filters"
      v-model:selection="selected"
      v-model:expandedRows="expandedRows"
      data-key="id"
      size="small"
      :value="store.data[type].data"
      paginator
      removable-sort
      :rows="10"
      :total-records="store.data[type].count"
      :loading="store.data[type].loading"
      :global-filter-fields="values[type].filter"
      paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      current-page-report-template="{first} tot {last} van {totalRecords}"
      @row-expand="onRowExpand"
      @row-collapse="onRowCollapse"
    >
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4 justify-between flex-wrap">
            <div class="flex gap-4 items-center flex-wrap">
              <FormKit
                v-model="filters.global.value"
                :disabled="creating || !!Object.keys(expandedRows || {}).length"
                type="search"
                prefix-icon="search"
                outer-class="$remove:mb-4 $remove:max-w-none max-w-[200px] mb-0"
              />
              <FormKit
                v-model="store.data[type].date"
                :disabled="creating || !!Object.keys(expandedRows || {}).length"
                type="date"
                outer-class="$remove:mb-4 $remove:max-w-none max-w-[150px] mb-0"
              />
              <AnimationReveal>
                <Button
                  v-if="!isToday"
                  :disabled="creating || !!Object.keys(expandedRows || {}).length"
                  text
                  icon="pi pi-directions"
                  label="Vandaag tonen"
                  @click="store.data[type].date = formatDay(new Date())"
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
                    <span class="text-secondary relative -left-[2px]">*</span>
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
        :sortable="column.field !== 'update'"
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
                  <span class="text-secondary relative -left-[2px]">*</span>
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
        }"
      />
    </AnimationReveal>
  </div>
</template>
