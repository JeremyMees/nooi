import type { DataTablePageEvent, DataTableFilterEvent, DataTableSortEvent } from 'primevue/datatable'

export interface TableColumn {
  header: string
  field: string
}

export interface TableFilter {
  value: string
  matchMode: string
}

export type TableEvent = DataTablePageEvent | DataTableSortEvent | DataTableFilterEvent
