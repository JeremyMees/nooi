<template>
  <EmailLayout title="Jouw boeking voor Nooi" preview="Jouw boeking voor Nooi">
    <Text class="my-4 text-sm/6">
      We hebben je boeking goed ontvangen en kijken uit naar je komst. Fijn dat
      we je mogen verwelkomen op
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
