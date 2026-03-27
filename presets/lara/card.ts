export default {
  root: {
    class: [
      // Shape
      'rounded-md',
      'shadow-md',

      // Color
      'bg-surface-0',
      'text-surface-700',
    ],
  },
  body: {
    class: 'flex flex-col gap-2 pb-5',
  },
  caption: {
    class: 'flex flex-col gap-2',
  },
  title: {
    class: 'text-2xl font-bold mb-2',
  },
  subtitle: {
    class: [
      // Font
      'font-normal',

      // Spacing
      'mb-2 px-5',

      // Color
      'text-surface-600',
    ],
  },
  content: {
    class: 'py-5', // Vertical padding.
  },
  footer: {
    class: 'pt-0 flex flex-wrap justify-between items-start gap-2 px-5', // Top padding.
  },
}
