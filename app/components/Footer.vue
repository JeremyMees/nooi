<template>
  <footer class="bg-secondary pt-[50px] pb-5">
    <div class="container flex flex-col items-center gap-5">
      <img
        src="/assets/images/kolibri.png"
        alt="Nooi logo"
        class="w-[85px]"
      >
      <div class="flex gap-1">
        <a
          href="https://www.google.be/maps/place/Nooi/@50.9845556,5.0496567,17z/data=!3m1!4b1!4m5!3m4!1s0x47c13f6fa13d98f1:0x204404adae3e0327!8m2!3d50.9845311!4d5.0519057"
          target="_blank"
          aria-label="Locatie"
          class="bg-black w-8 h-8 flex flex-col justify-center items-center rounded hover:opacity-80 transition-opacity duration-300 ease-in-out"
        >
          <Icon
            name="carbon:location-filled"
            class="text-white text-lg"
          />
        </a>
        <a
          href="https://www.instagram.com/nooidiest/"
          target="_blank"
          aria-label="Instagram"
          class="bg-black w-8 h-8 flex flex-col justify-center items-center rounded hover:opacity-80 transition-opacity duration-300 ease-in-out"
        >
          <Icon
            name="radix-icons:instagram-logo"
            class="text-white text-lg"
          />
        </a>
        <a
          href="https://www.facebook.com/nooidiest"
          target="_blank"
          aria-label="Facebook"
          class="bg-black w-8 h-8 flex flex-col justify-center items-center rounded hover:opacity-80 transition-opacity duration-300 ease-in-out"
        >
          <Icon
            name="ic:baseline-facebook"
            class="text-white text-lg"
          />
        </a>
        <a
          href="https://www.tiktok.com/@nooidiest"
          target="_blank"
          aria-label="Tiktok"
          class="bg-black w-8 h-8 flex flex-col justify-center items-center rounded hover:opacity-80 transition-opacity duration-300 ease-in-out"
        >
          <Icon
            name="ic:baseline-tiktok"
            class="text-white text-lg"
          />
        </a>
        <a
          href="https://api.whatsapp.com/send/?phone=32496672361&text&type=phone_number&app_absent=0"
          target="_blank"
          aria-label="Tiktok"
          class="bg-black w-8 h-8 flex flex-col justify-center items-center rounded hover:opacity-80 transition-opacity duration-300 ease-in-out"
        >
          <Icon
            name="ic:baseline-whatsapp"
            class="text-white text-lg"
          />
        </a>
      </div>
      <div class="body-normal">
        Nooi |
        <a
          href="https://www.google.be/maps/place/Nooi/@50.9845556,5.0496567,17z/data=!3m1!4b1!4m5!3m4!1s0x47c13f6fa13d98f1:0x204404adae3e0327!8m2!3d50.9845311!4d5.0519057"
          target="_blank"
          aria-label="Adres"
        >
          Schotelstraat 3, 3290 Diest
        </a> |
        <a
          href="tel:0496672361"
          aria-label="Telefoonnummer"
        >
          0496 67 23 61
        </a>
      </div>
    </div>
    <hr class="border-black my-10">
    <div class="container flex justify-center">
      <NuxtLink
        to="https://nooi.be/av-privacy/"
        class="body-normal"
      >
        Algemene voorwaarden & privacy
      </NuxtLink>
    </div>
  </footer>
</template>
