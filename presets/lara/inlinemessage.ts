export default {
  root: ({ props }: any) => ({
    class: [
      'inline-flex items-center justify-center align-top gap-2',
      'p-3 m-0 rounded-md',
      {
        'bg-blue-100/70': props.severity === 'info',
        'bg-green-100/70': props.severity === 'success',
        'bg-orange-100/70': props.severity === 'warn',
        'bg-red-100/70': props.severity === 'error',
      },
      {
        'text-blue-700': props.severity === 'info',
        'text-green-700': props.severity === 'success',
        'text-orange-700': props.severity === 'warn',
        'text-red-700': props.severity === 'error',
      },
    ],
  }),
  icon: {
    class: 'text-base',
  },
  text: {
    class: [
      // Font and Text
      'text-base leading-none',
      'font-medium',
    ],
  },
}
