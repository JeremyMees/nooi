<template>
  <EmailLayout
    title="Jouw reservatie voor Nooi"
    preview="Jouw reservatie voor Nooi"
  >
    <Text class="my-4 text-sm/6">
      We hebben je reservatie goed ontvangen en kijken uit naar je komst. Fijn
      dat we je mogen verwelkomen op
      <strong v-pre class="text-primary">{{ date }}</strong
      ><span v-pre
        >{{#time}} om <strong class="text-primary">{{ time }}</strong
        >{{/time}}</span
      >. Mocht je nog vragen hebben, aarzel dan niet om contact met ons op te
      nemen. Tot binnenkort!
    </Text>
    <Text class="my-4 text-sm/6">Thomas &amp; An</Text>
  </EmailLayout>
</template>
