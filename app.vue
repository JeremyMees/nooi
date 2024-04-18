<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const date = ref()
const visible = ref<boolean>(false)
const checked = ref<boolean>(false)
const radio = ref<string>('')
const anyValue = ref<any>()

const options = ref<string[]>(['New York', 'Paris', 'Rome'])

function showMultiple () {
  toast.add({ severity: 'success', summary: 'Success', detail: 'Message Content', life: 3000 })
  toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3050 })
  toast.add({ severity: 'warn', summary: 'Warning', detail: 'Message Content', life: 3100 })
  toast.add({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3150 })
}
</script>

<template>
  <div class="flex flex-col gap-6 py-20 px-10 items-start">
    <Toast />
    <Button v-tooltip="'Enter your username'" label="Multiple toasts" severity="warning" @click="showMultiple()" />
    <div class="flex flex-wrap gap-2 items-center">
      <Button label="Primary" />
      <Button label="Secondary" severity="secondary" />
      <Button label="Success" severity="success" />
      <Button label="Info" severity="info" />
      <Button label="Warning" severity="warning" />
      <Button label="Help" severity="help" />
      <Button label="Danger" severity="danger" />
      <Button label="Submit" icon="pi pi-check" />
      <Button label="Link" link />
      <Button label="Primary" text />
      <Button label="Secondary" severity="secondary" text />
      <Button label="Success" severity="success" text />
      <Button label="Info" severity="info" text />
      <Button label="Warning" severity="warning" text />
      <Button label="Help" severity="help" text />
      <Button label="Danger" severity="danger" text />
      <Button label="Primary" outlined />
      <Button label="Secondary" severity="secondary" outlined />
      <Button label="Success" severity="success" outlined />
      <Button label="Info" severity="info" outlined />
      <Button label="Warning" severity="warning" outlined />
      <Button label="Help" severity="help" outlined />
      <Button label="Danger" severity="danger" outlined />
    </div>
    <div class="flex gap-2 w-full">
      <DatePicker />
    </div>
    <Card>
      <template #title>
        Simple Card
      </template>
      <template #content>
        <p class="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
          quas!
        </p>
      </template>
    </Card>
    <Button label="Show modal" icon="pi pi-external-link" @click="visible = true" />
    <Dialog
      v-model:visible="visible"
      modal
      header="Header"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </Dialog>
    <Dropdown v-model="anyValue" :options="options" placeholder="Select a City" />
    <div class="flex flex-wrap gap-2 items-center">
      <InlineMessage severity="success">
        Success Message
      </InlineMessage>
      <InlineMessage severity="info">
        Info Message
      </InlineMessage>
      <InlineMessage severity="warn">
        Warning Message
      </InlineMessage>
      <InlineMessage severity="error">
        Error Message
      </InlineMessage>
    </div>
    <div class="flex flex-wrap gap-2 items-center">
      <Calendar v-model="date" placeholder="Calendar" />
      <InputText v-model="anyValue" placeholder="Placeholder" />
      <InputText v-model="anyValue" invalid placeholder="Invalid" />
      <InputText v-model="anyValue" disabled placeholder="Disabled" />
      <span class="relative">
        <i class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600" />
        <InputText v-model="anyValue" placeholder="Search" class="pl-10" />
      </span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Checkbox v-model="checked" binary label="checkbox" input-id="checkbox" />
      <label for="checkbox"> checkbox </label>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div
        v-for="(option, i) in options"
        :key="option"
        class="flex items-center"
      >
        <RadioButton
          v-model="radio"
          :input-id="option"
          name="City"
          :value="option"
          :disabled="i === 1"
          :invalid="i === 2"
        />
        <label :for="option" class="ml-2">{{ option }}</label>
      </div>
    </div>
    <Stepper>
      <StepperPanel header="Header I">
        <template #content="{ nextCallback }">
          <div class="flex flex-col h-[12rem]">
            <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-md bg-surface-0 dark:bg-surface-900 flex-auto flex justify-center items-center font-medium">
              Content I
            </div>
          </div>
          <div class="flex pt-4 justify-end">
            <Button label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="nextCallback" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Header II">
        <template #content="{ prevCallback, nextCallback }">
          <div class="flex flex-col h-[12rem]">
            <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-md bg-surface-0 dark:bg-surface-900 flex-auto flex justify-center items-center font-medium">
              Content II
            </div>
          </div>
          <div class="flex pt-4 justify-between">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
            <Button label="Next" icon="pi pi-arrow-right" icon-pos="right" @click="nextCallback" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Header III">
        <template #content="{ prevCallback }">
          <div class="flex flex-col h-[12rem]">
            <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-md bg-surface-0 dark:bg-surface-900 flex-auto flex justify-center items-center font-medium">
              Content III
            </div>
          </div>
          <div class="flex pt-4 justify-start">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
    <div class="flex flex-wrap items-center gap-2">
      <Message severity="success">
        Success Message
      </Message>
      <Message severity="info">
        Info Message
      </Message>
      <Message severity="warn">
        Warning Message
      </Message>
      <Message severity="error">
        Error Message
      </Message>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Skeleton class="mb-2" />
      <Skeleton width="10rem" class="mb-2" />
      <Skeleton width="5rem" class="mb-2" />
      <Skeleton height="2rem" class="mb-2" />
      <Skeleton width="10rem" height="4rem" />
    </div>
  </div>
</template>
