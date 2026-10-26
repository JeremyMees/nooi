export default defineAppConfig({
  ui: {
    button: {
      slots: { base: 'rounded-md' },
      variants: {
        size: {
          sm: { base: 'px-3 py-2 text-sm gap-1.5' },
          md: { base: 'px-4 py-3 text-sm gap-2' },
        },
      },
    },
    slideover: {
      slots: {
        overlay: 'bg-black/40 backdrop-blur-sm',
        content: 'divide-y-0 bg-surface-0 text-surface-700 sm:ring-0',
        header: 'p-5',
        body: 'p-5 pt-0',
        close: 'top-5 end-5',
      },
      variants: {
        side: {
          right: { content: 'w-full sm:max-w-none md:max-w-[500px]' },
          bottom: { content: 'mx-auto max-w-3xl rounded-t-lg' },
        },
      },
    },
  },
})
