<script setup lang="ts">
const toast = useToast()

function showMultiple (): void {
  toast.add({ severity: 'success', summary: 'Success', detail: 'Message Content', life: 3000 })
  toast.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3050 })
  toast.add({ severity: 'warn', summary: 'Warning', detail: 'Message Content', life: 3100 })
  toast.add({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3150 })
}
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col gap-y-6 py-20 items-start">
      <FormKit
        type="submit"
        label="Checkout my label"
      />
      <FormKit
        type="submit"
        disabled
        label="disabled"
      />
      <div class="flex flex-wrap gap-2">
        <FormKit
          type="text"
          label="Text field"
          validation-visibility="live"
          validation="length:10|required"
        />
        <FormKit
          type="time"
          label="Time field"
        />
        <FormKit
          type="email"
          label="Email field"
          placeholder="Your email here"
        />
        <FormKit
          type="tel"
          label="Phone number"
        />
        <FormKit
          type="number"
          label="Number field"
          name="temperature"
        />
        <FormKit
          type="date"
          label="Date field"
        />
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <Button
          v-tooltip="'Enter your username'"
          label="Multiple toasts"
          severity="secondary"
          @click="showMultiple()"
        />
        <Button label="Primary" />
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
  </NuxtLayout>
</template>
