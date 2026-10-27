<template>
  <EmailLayout
    title="We zien je snel in Nooi!"
    preview="We zien je snel in Nooi!"
  >
    <Text class="my-4 text-sm/6">
      Graag herinneren wij je aan je
      <span v-pre
        >{{#event}}inschrijving voor
        <strong class="text-primary">{{ event }}</strong
        >{{/event}}{{^event}}boeking bij ons{{/event}}</span
      >
      op
      <strong v-pre class="text-primary">{{ date }}</strong
      ><span v-pre
        >{{#time}} om <strong class="text-primary">{{ time }}</strong
        >{{/time}}</span
      >.
    </Text>
    <Text class="my-4 text-sm/6">Heb je nog vragen? Laat het ons weten.</Text>
    <Text class="my-4 text-sm/6">
      Tot snel!
      <br />
      Thomas &amp; An
    </Text>
  </EmailLayout>
</template>
