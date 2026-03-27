export default {
  root: ({ props, context, parent }: any) => ({
    class: [
      'relative',

      // Alignments
      'items-center inline-flex text-center align-bottom justify-center',

      // Sizes & Spacing
      'leading-[normal]',
      {
        'px-4 py-3 text-sm': props.size === null,
        'text-sm py-2 px-3': props.size === 'small',
        'text-xl py-3 px-4': props.size === 'large',
      },
      {
        'w-12 p-0 py-3': props.label == null && props.icon !== null,
      },

      // Shapes
      { 'shadow-lg': props.raised },
      { 'rounded-md': !props.rounded, 'rounded-full': props.rounded },
      { 'rounded-none first:rounded-l-md last:rounded-r-md': parent.instance.$name == 'InputGroup' },

      // Link Button
      { 'text-primary-600 bg-transparent border-transparent': props.link },

      // Plain Button
      { 'text-white bg-gray-500 border border-gray-500': props.plain && !props.outlined && !props.text },
      // Plain Text Button
      { 'text-surface-500': props.plain && props.text },
      // Plain Outlined Button
      { 'text-surface-500 border border-gray-500': props.plain && props.outlined },

      // Text Button
      { 'bg-transparent border-transparent': props.text && !props.plain },

      // Outlined Button
      { 'bg-transparent border': props.outlined && !props.plain },

      // --- Severity Buttons ---

      // Primary Button
      {
        'text-white': !props.link && props.severity === null && !props.text && !props.outlined && !props.plain,
        'bg-primary-500': !props.link && props.severity === null && !props.text && !props.outlined && !props.plain,
        'border border-primary-500': !props.link && props.severity === null && !props.text && !props.outlined && !props.plain,
      },
      // Primary Text Button
      { 'text-primary-500': props.text && props.severity === null && !props.plain },
      // Primary Outlined Button
      { 'text-primary-500 border border-primary-500 hover:bg-primary-300/20': props.outlined && props.severity === null && !props.plain },

      // Secondary Button
      {
        'text-white': props.severity === 'secondary' && !props.text && !props.outlined && !props.plain,
        'bg-secondary': props.severity === 'secondary' && !props.text && !props.outlined && !props.plain,
        'border border-secondary': props.severity === 'secondary' && !props.text && !props.outlined && !props.plain,
      },
      // Secondary Text Button
      { 'text-secondary': props.text && props.severity === 'secondary' && !props.plain },
      // Secondary Outlined Button
      { 'text-secondary border border-secondary hover:bg-surface-300/20': props.outlined && props.severity === 'secondary' && !props.plain },

      // Success Button
      {
        'text-white': props.severity === 'success' && !props.text && !props.outlined && !props.plain,
        'bg-green-500': props.severity === 'success' && !props.text && !props.outlined && !props.plain,
        'border border-green-500': props.severity === 'success' && !props.text && !props.outlined && !props.plain,
      },
      // Success Text Button
      { 'text-green-500': props.text && props.severity === 'success' && !props.plain },
      // Success Outlined Button
      { 'text-green-500 border border-green-500 hover:bg-green-300/20': props.outlined && props.severity === 'success' && !props.plain },

      // Info Button
      {
        'text-white': props.severity === 'info' && !props.text && !props.outlined && !props.plain,
        'bg-blue-500': props.severity === 'info' && !props.text && !props.outlined && !props.plain,
        'border border-blue-500': props.severity === 'info' && !props.text && !props.outlined && !props.plain,
      },
      // Info Text Button
      { 'text-blue-500': props.text && props.severity === 'info' && !props.plain },
      // Info Outlined Button
      { 'text-blue-500 border border-blue-500 hover:bg-blue-300/20 ': props.outlined && props.severity === 'info' && !props.plain },

      // Warning Button
      {
        'text-white': props.severity === 'warning' && !props.text && !props.outlined && !props.plain,
        'bg-orange-500': props.severity === 'warning' && !props.text && !props.outlined && !props.plain,
        'border border-orange-500': props.severity === 'warning' && !props.text && !props.outlined && !props.plain,
      },
      // Warning Text Button
      { 'text-orange-500': props.text && props.severity === 'warning' && !props.plain },
      // Warning Outlined Button
      { 'text-orange-500 border border-orange-500 hover:bg-orange-300/20': props.outlined && props.severity === 'warning' && !props.plain },

      // Help Button
      {
        'text-white': props.severity === 'help' && !props.text && !props.outlined && !props.plain,
        'bg-purple-500': props.severity === 'help' && !props.text && !props.outlined && !props.plain,
        'border border-purple-500': props.severity === 'help' && !props.text && !props.outlined && !props.plain,
      },
      // Help Text Button
      { 'text-purple-500': props.text && props.severity === 'help' && !props.plain },
      // Help Outlined Button
      { 'text-purple-500 border border-purple-500 hover:bg-purple-300/20': props.outlined && props.severity === 'help' && !props.plain },

      // Danger Button
      {
        'text-white': props.severity === 'danger' && !props.text && !props.outlined && !props.plain,
        'bg-red-500': props.severity === 'danger' && !props.text && !props.outlined && !props.plain,
        'border border-red-500': props.severity === 'danger' && !props.text && !props.outlined && !props.plain,
      },
      // Danger Text Button
      { 'text-red-500': props.text && props.severity === 'danger' && !props.plain },
      // Danger Outlined Button
      { 'text-red-500 border border-red-500 hover:bg-red-300/20': props.outlined && props.severity === 'danger' && !props.plain },

      // --- Severity Button States ---
      'focus:outline-none focus:outline-offset-0 focus:ring',

      // Link
      { 'focus:ring-primary-400/50': props.link },

      // Plain
      { 'hover:bg-gray-600 hover:border-gray-600': props.plain && !props.outlined && !props.text },
      // Text & Outlined Button
      { 'hover:bg-surface-300/20': props.plain && (props.text || props.outlined) },

      // Primary
      { 'hover:bg-primary-600 hover:border-primary-600': !props.link && props.severity === null && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-primary-400/50': props.severity === null },
      // Text & Outlined Button
      { 'hover:bg-primary-300/20': (props.text || props.outlined) && props.severity === null && !props.plain },

      // Secondary
      { 'hover:bg-surface-600 hover:border-surface-600': props.severity === 'secondary' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-surface-400/50': props.severity === 'secondary' },
      // Text & Outlined Button
      { 'hover:bg-surface-300/20': (props.text || props.outlined) && props.severity === 'secondary' && !props.plain },

      // Success
      { 'hover:bg-green-600 hover:border-green-600': props.severity === 'success' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-green-400/50': props.severity === 'success' },
      // Text & Outlined Button
      { 'hover:bg-green-300/20': (props.text || props.outlined) && props.severity === 'success' && !props.plain },

      // Info
      { 'hover:bg-blue-600 hover:border-blue-600': props.severity === 'info' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-blue-400/50': props.severity === 'info' },
      // Text & Outlined Button
      { 'hover:bg-blue-300/20': (props.text || props.outlined) && props.severity === 'info' && !props.plain },

      // Warning
      { 'hover:bg-orange-600 hover:border-orange-600': props.severity === 'warning' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-orange-400/50': props.severity === 'warning' },
      // Text & Outlined Button
      { 'hover:bg-orange-300/20': (props.text || props.outlined) && props.severity === 'warning' && !props.plain },

      // Help
      { 'hover:bg-purple-600 hover:border-purple-600': props.severity === 'help' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-purple-400/50': props.severity === 'help' },
      // Text & Outlined Button
      { 'hover:bg-purple-300/20': (props.text || props.outlined) && props.severity === 'help' && !props.plain },

      // Danger
      { 'hover:bg-red-600 hover:border-red-600': props.severity === 'danger' && !props.text && !props.outlined && !props.plain },
      { 'focus:ring-red-400/50': props.severity === 'danger' },
      // Text & Outlined Button
      { 'hover:bg-red-300/20': (props.text || props.outlined) && props.severity === 'danger' && !props.plain },

      // Disabled
      { 'opacity-50 !cursor-not-allowed': context.disabled },

      // Transitions
      'transition duration-200 ease-in-out',

      // Misc
      'cursor-pointer overflow-hidden select-none',
    ],
  }),
  label: ({ props }: any) => ({
    class: [
      'duration-200',
      'font-bold',
      {
        'hover:underline': props.link,
      },
      { 'flex-1': props.label !== null, 'invisible w-0': props.label == null },
    ],
  }),
  icon: ({ props }: any) => ({
    class: [
      'mx-0',
      {
        'mr-2': props.iconPos === 'left' && props.label != null,
        'ml-2 order-1': props.iconPos === 'right' && props.label != null,
        'mb-2': props.iconPos === 'top' && props.label != null,
        'mt-2': props.iconPos === 'bottom' && props.label != null,
      },
    ],
  }),
  loadingIcon: ({ props }: any) => ({
    class: [
      'h-4 w-4',
      'mx-0',
      {
        'mr-2': props.iconPos === 'left' && props.label != null,
        'ml-2 order-1': props.iconPos === 'right' && props.label != null,
        'mb-2': props.iconPos === 'top' && props.label != null,
        'mt-2': props.iconPos === 'bottom' && props.label != null,
      },
      'animate-spin',
    ],
  }),
  pcBadge: ({ props }: any) => ({
    class: [{ 'ml-2 w-4 h-4 leading-none flex items-center justify-center': props.badge }],
  }),
}
