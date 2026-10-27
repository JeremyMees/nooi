<template>
  <EmailLayout
    title="Herinneringen {{ date }}"
    preview="{{ sentCount }} verstuurd, {{ failedCount }} mislukt"
    :greeting="false"
  >
    <Text class="my-4 text-sm/6">
      Overzicht van de herinneringsmails voor
      <strong v-pre class="text-primary">{{ date }}</strong
      >.
    </Text>
    <Text class="my-4 text-sm/6">
      <strong v-pre class="text-primary">{{ total }}</strong> reservatie(s)
      gevonden &middot;
      <strong v-pre class="text-primary">{{ sentCount }}</strong> verstuurd
      &middot;
      <strong v-pre class="text-primary">{{ failedCount }}</strong> mislukt
      &middot;
      <strong v-pre class="text-primary">{{ skippedCount }}</strong>
      overgeslagen
    </Text>
    <span v-pre>{{#failedList}}</span>
    <Hr class="my-6.5 bg-divider" />
    <Text class="my-4 text-sm/6 font-bold text-primary">Mislukt</Text>
    <div v-pre>{{{ failedList }}}</div>
    <span v-pre>{{/failedList}}</span>
    <span v-pre>{{#skippedList}}</span>
    <Hr class="my-6.5 bg-divider" />
    <Text class="my-4 text-sm/6 font-bold text-primary">
      Overgeslagen (geen geldig e-mailadres)
    </Text>
    <div v-pre>{{{ skippedList }}}</div>
    <span v-pre>{{/skippedList}}</span>
    <span v-pre>{{#sentList}}</span>
    <Hr class="my-6.5 bg-divider" />
    <Text class="my-4 text-sm/6 font-bold text-primary">Verstuurd</Text>
    <div v-pre>{{{ sentList }}}</div>
    <span v-pre>{{/sentList}}</span>
    <span v-pre>{{#nothingToDo}}</span>
    <Hr class="my-6.5 bg-divider" />
    <Text class="my-4 text-sm/6">
      Er waren vandaag geen reservaties om aan te herinneren.
    </Text>
    <span v-pre>{{/nothingToDo}}</span>
  </EmailLayout>
</template>
