export default {
  root: ({ state }: any) => ({
    class: [
      // Shape
      'rounded-lg',
      'shadow-lg',
      'border-0',
      // Size
      'max-h-[90vh]',
      'w-[50vw]',
      'm-0',
      // Color
      'dark:border',
      'dark:border-surface-700',
      // Transitions
      'transform',
      'scale-100',
      // Maximized State
      {
        'transition-none': state.maximized,
        'transform-none': state.maximized,
        '!w-screen': state.maximized,
        '!h-screen': state.maximized,
        '!max-h-full': state.maximized,
        '!top-0': state.maximized,
        '!left-0': state.maximized,
      },
    ],
  }),
  header: {
    class: ['flex items-center justify-between', 'shrink-0', 'p-6', 'border-t-0', 'rounded-tl-lg', 'rounded-tr-lg', 'bg-surface-0 dark:bg-surface-800', 'text-surface-700 dark:text-surface-0/80'],
  },
  title: {
    class: ['font-bold text-lg'],
  },
  icons: {
    class: ['flex items-center'],
  },
  closeButton: {
    class: ['relative', 'flex items-center justify-center', 'mr-2', 'last:mr-0', 'w-8 h-8', 'border-0', 'rounded-full', 'text-surface-500', 'bg-transparent', 'transition duration-200 ease-in-out', 'hover:text-surface-700 dark:hover:text-white/80', 'hover:bg-surface-100 dark:hover:bg-surface-800/80', 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-inset', 'focus:ring-primary-400/50 dark:focus:ring-primary-300/50', 'overflow-hidden'],
  },
  maximizablebutton: {
    class: ['relative', 'flex items-center justify-center', 'mr-2', 'last:mr-0', 'w-8 h-8', 'border-0', 'rounded-full', 'text-surface-500', 'bg-transparent', 'transition duration-200 ease-in-out', 'hover:text-surface-700 dark:hover:text-white/80', 'hover:bg-surface-100 dark:hover:bg-surface-800/80', 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-inset', 'focus:ring-primary-400/50 dark:focus:ring-primary-300/50', 'overflow-hidden'],
  },
  closeButtonIcon: {
    class: ['inline-block', 'w-4', 'h-4'],
  },
  maximizableicon: {
    class: ['inline-block', 'w-4', 'h-4'],
  },
  content: ({ state, instance }: any) => ({
    class: [
      // Spacing
      'px-6',
      'pb-8',
      'pt-0',
      // Shape
      {
        'grow': state.maximized,
        'rounded-bl-lg': !instance.$slots.footer,
        'rounded-br-lg': !instance.$slots.footer,
      },
      // Colors
      'bg-surface-0 dark:bg-surface-800',
      'text-surface-700 dark:text-surface-0/80',
      // Misc
      'overflow-y-auto',
    ],
  }),
  footer: {
    class: ['flex items-center justify-end', 'shrink-0', 'text-right', 'gap-2', 'px-6', 'pb-6', 'border-t-0', 'rounded-b-lg', 'bg-surface-0 dark:bg-surface-800', 'text-surface-700 dark:text-surface-0/80'],
  },
  mask: ({ props }: any) => ({
    class: [
      // Transitions
      'transition-all',
      'duration-300',
      { 'p-5': !props.position == 'full' },
      // Background and Effects
      { 'has-[.mask-active]:bg-transparent bg-black/40': props.modal, 'has-[.mask-active]:backdrop-blur-none backdrop-blur-sm': props.modal },
    ],
  }),
  transition: ({ props }: any) => props.position === 'top'
    ? {
        enterFromClass: 'opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0 mask-active',
        enterActiveClass: 'transition-all duration-200 ease-out',
        leaveActiveClass: 'transition-all duration-200 ease-out',
        leaveToClass: 'opacity-0 scale-75 translate-x-0 -translate-y-full translate-z-0 mask-active',
      }
    : props.position === 'bottom'
      ? {
          enterFromClass: 'opacity-0 scale-75 translate-y-full mask-active',
          enterActiveClass: 'transition-all duration-200 ease-out',
          leaveActiveClass: 'transition-all duration-200 ease-out',
          leaveToClass: 'opacity-0 scale-75 translate-x-0 translate-y-full translate-z-0 mask-active',
        }
      : props.position === 'left' || props.position === 'topleft' || props.position === 'bottomleft'
        ? {
            enterFromClass: 'opacity-0 scale-75 -translate-x-full translate-y-0 translate-z-0 mask-active',
            enterActiveClass: 'transition-all duration-200 ease-out',
            leaveActiveClass: 'transition-all duration-200 ease-out',
            leaveToClass: 'opacity-0 scale-75  -translate-x-full translate-y-0 translate-z-0 mask-active',
          }
        : props.position === 'right' || props.position === 'topright' || props.position === 'bottomright'
          ? {
              enterFromClass: 'opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0 mask-active',
              enterActiveClass: 'transition-all duration-200 ease-out',
              leaveActiveClass: 'transition-all duration-200 ease-out',
              leaveToClass: 'opacity-0 scale-75 translate-x-full translate-y-0 translate-z-0 mask-active',
            }
          : {
              enterFromClass: 'opacity-0 scale-75 mask-active',
              enterActiveClass: 'transition-all duration-200 ease-out',
              leaveActiveClass: 'transition-all duration-200 ease-out',
              leaveToClass: 'opacity-0 scale-75 mask-active',
            },
}
