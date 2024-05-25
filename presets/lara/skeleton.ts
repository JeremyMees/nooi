export default {
  root: ({ props }: any) => ({
    class: [
      'overflow-hidden',
      {
        'animate-pulse': props.animation !== 'none',
      },

      // Round
      { 'rounded-full': props.shape === 'circle', 'rounded-md': props.shape !== 'circle' },

      // Colors
      'bg-primary-200 dark:bg-surface-700',
    ],
  }),
}
