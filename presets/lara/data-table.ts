export default {
  root: ({ props }: any) => ({
    class: [
      'relative bg-[#fff] rounded-lg shadow-lg',
      // Flex & Alignment
      { 'flex flex-col': props.scrollable && props.scrollHeight === 'flex' },
      // Size
      { 'h-full': props.scrollable && props.scrollHeight === 'flex' },
    ],
  }),
  mask: {
    class: ['absolute', 'top-0 left-0', 'z-20', 'flex items-center justify-center', 'w-full h-full', 'bg-surface-100/40', 'transition duration-200'],
  },
  loadingIcon: {
    class: 'w-8 h-8 animate-spin',
  },
  tableContainer: ({ props }: any) => ({
    class: [
      { 'relative': props.scrollable, 'flex flex-col grow': props.scrollable && props.scrollHeight === 'flex' },
      // Size
      { 'h-full': props.scrollable && props.scrollHeight === 'flex' },
    ],
  }),
  header: ({ props }: any) => ({
    class: [
      'font-bold',
      // Shape
      props.showGridlines ? 'border-x border-t border-b-0' : 'border-b border-x-0',
      // Spacing
      'p-4',
      // Color
      'border-surface-200',
      'text-surface-700',
    ],
  }),
  table: {
    class: 'w-full border-spacing-0 border-separate',
  },
  thead: ({ context }: any) => ({
    class: [
      {
        'bg-surface-50 top-0 z-40 sticky': context.scrollable,
      },
    ],
  }),
  tbody: ({ instance, context }: any) => ({
    class: [
      {
        'sticky z-20': instance.frozenRow && context.scrollable,
      },
      'bg-surface-50',
    ],
  }),
  tfoot: ({ context }: any) => ({
    class: [
      {
        'bg-surface-50 bottom-0 z-0': context.scrollable,
      },
    ],
  }),
  footer: {
    class: ['font-bold', 'border-t-0 border-b border-x-0', 'p-4', 'bg-surface-50', 'border-surface-200', 'text-surface-700'],
  },
  column: {
    headerCell: ({ context, props }: any) => ({
      class: [
        'font-bold',
        // Position
        { 'sticky z-20 border-b': props.frozen || props.frozen === '' },
        { relative: context.resizable },
        // Alignment
        'text-left',
        // Shape
        { 'first:border-l border-y border-r': context == null ? void 0 : context.showGridlines },
        'border-0 border-b border-solid',
        // Spacing
        (context == null ? void 0 : context.size) === 'small' ? 'p-2' : (context == null ? void 0 : context.size) === 'large' ? 'p-5' : 'p-4',
        // Color
        (props.sortable === '' || props.sortable) && context.sorted ? 'bg-primary-highlight text-primary-highlight-inverse bg-primary/10' : 'text-surface-700',
        'border-surface-200 ',
        // States
        { 'hover:bg-surface-100': (props.sortable === '' || props.sortable) && !(context != null && context.sorted) },
        'focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring focus-visible:ring-inset focus-visible:ring-primary-400/50',
        // Transition
        { 'transition duration-200': props.sortable === '' || props.sortable },
        // Misc
        { 'cursor-pointer': props.sortable === '' || props.sortable },
        {
          'overflow-hidden space-nowrap border-y bg-clip-padding': context.resizable,
          // Resizable
        },
      ],
    }),
    columnHeaderContent: {
      class: 'flex items-center',
    },
    sort: ({ context }: any) => ({
      class: [context.sorted ? 'text-primary' : 'text-surface-700'],
    }),
    bodyCell: ({ props, context, state, parent }: any) => ({
      class: [
        // Position
        { 'sticky box-border border-b': parent.instance.frozenRow },
        { 'sticky box-border border-b z-20': props.frozen || props.frozen === '' },
        // Alignment
        'text-left',
        // Shape
        'border-0 border-b border-solid',
        { 'first:border-l border-r border-b': context == null ? void 0 : context.showGridlines },
        { 'bg-surface-0': parent.instance.frozenRow || props.frozen || props.frozen === '' },
        // Spacing
        { 'p-2': (context == null ? void 0 : context.size) === 'small' && !state.d_editing },
        { 'p-5': (context == null ? void 0 : context.size) === 'large' && !state.d_editing },
        { 'p-4': (context == null ? void 0 : context.size) !== 'large' && (context == null ? void 0 : context.size) !== 'small' && !state.d_editing },
        { 'py-[0.6rem] px-2': state.d_editing },
        // Color
        'border-surface-200',
      ],
    }),
    footerCell: ({ context }: any) => ({
      class: [
        // Font
        'font-bold',
        // Alignment
        'text-left',
        // Shape
        'border-0 border-b border-solid',
        { 'border-x border-y': context == null ? void 0 : context.showGridlines },
        // Spacing
        (context == null ? void 0 : context.size) === 'small' ? 'p-2' : (context == null ? void 0 : context.size) === 'large' ? 'p-5' : 'p-4',
        // Color
        'border-surface-200',
        'text-surface-700',
        'bg-surface-50',
      ],
    }),
    sortIcon: ({ context }: any) => ({
      class: ['ml-2', context.sorted ? 'text-primary-highlight-inverse' : 'text-surface-700'],
    }),
    pcSortBadge: {
      class: ['flex items-center justify-center align-middle', 'rounded-full', 'w-[1.143rem] leading-[1.143rem]', 'ml-2', 'text-primary-highlight-inverse', 'bg-primary-highlight'],
    },
    filter: {
      class: 'inline-flex items-center ml-auto',
    },
    filterOverlay: {
      class: ['absolute top-0 left-0', 'border-0', 'rounded-md', 'shadow-md', 'min-w-[12.5rem]', 'bg-surface-0', 'text-surface-800', ''],
    },
    pcFilterConstraintDropdown: {
      root: ({ state }: any) => ({
        class: [
          // Display and Position
          'flex',
          'relative',
          // Spacing
          'my-2',
          // Shape
          'w-full',
          'rounded-md',
          // Color and Background
          'bg-surface-0',
          'border border-surface-300',
          'text-surface-800',
          'placeholder:text-surface-400',
          // Transitions
          'transition-all',
          'duration-200',
          // States
          'hover:border-primary',
          { 'outline-none outline-offset-0 ring ring-primary-400/50': state.focused },
          // Misc
          'cursor-pointer',
          'select-none',
        ],
      }),
    },
    filterConstraintList: {
      class: 'm-0 p-0 py-3 list-none',
    },
    filterConstraint: ({ context }: any) => ({
      class: [
        // Font
        'font-normal',
        'leading-none',
        // Position
        'relative',
        // Shape
        'border-0',
        'rounded-none',
        // Spacing
        'm-0',
        'py-3 px-5',
        // Color
        { 'bg-surface-0 text-surface-700': !(context != null && context.highlighted) },
        { 'bg-primary-highlight text-primary-highlight-inverse': context == null ? void 0 : context.highlighted },
        // States
        { 'hover:bg-surface-100': !(context != null && context.highlighted) },
        { 'hover:text-surface-700 hover:bg-surface-100': !(context != null && context.highlighted) },
        'focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring focus-visible:ring-inset focus-visible:ring-primary-400/50',
        // Transitions
        'transition-shadow',
        'duration-200',
        // Misc
        'cursor-pointer',
        'overflow-hidden',
        'whitespace-nowrap',
      ],
    }),
    filterOperator: {
      class: ['px-5 py-3', 'border-b border-solid', 'rounded-t-md', 'text-surface-700', 'border-surface-200', 'bg-surface-0'],
    },
    pcFilterOperatorDropdown: {
      root: ({ state }: any) => ({
        class: [
          // Display and Position
          'inline-flex',
          'relative',
          // Shape
          'w-full',
          'rounded-md',
          // Color and Background
          'bg-surface-0',
          'border border-surface-300',
          // Transitions
          'transition-all',
          'duration-200',
          // States
          'hover:border-primary',
          { 'outline-none outline-offset-0 ring ring-primary-400/50': state.focused },
          // Misc
          'cursor-pointer',
          'select-none',
        ],
      }),
      input: ({ props }: any) => ({
        class: [
          // Font
          'leading-[normal]',
          // Display
          'block',
          'flex-auto',
          // Color and Background
          'bg-transparent',
          'border-0',
          { 'text-surface-800': props.modelValue, 'text-surface-400': !props.modelValue },
          'placeholder:text-surface-400',
          // Sizing and Spacing
          'w-[1%]',
          'p-3',
          // Shape
          'rounded-none',
          // Transitions
          'transition',
          'duration-200',
          // States
          'focus:outline-none focus:shadow-none',
          // Misc
          'relative',
          'cursor-pointer',
          'overflow-hidden overflow-ellipsis',
          'whitespace-nowrap',
          'appearance-none',
        ],
      }),
      trigger: {
        class: ['flex items-center justify-center', 'shrink-0', 'bg-transparent', 'text-surface-500', 'w-12', 'rounded-tr-md', 'rounded-br-md'],
      },
      panel: {
        class: ['absolute top-0 left-0', 'border-0', 'rounded-md', 'shadow-md', 'bg-surface-0', 'text-surface-800', ''],
      },
      item: ({ context }: any) => ({
        class: [
          // Font
          'font-normal',
          'leading-none',
          // Position
          'relative',
          // Shape
          'border-0',
          'rounded-none',
          // Spacing
          'm-0',
          'py-3 px-5',
          // Color
          { 'text-surface-700': !context.focused && !context.selected },
          { 'bg-surface-50 text-surface-700': context.focused && !context.selected },
          { 'bg-primary-highlight text-primary-highlight-inverse': !context.focused && context.selected },
          // States
          { 'hover:bg-surface-100': !context.focused && !context.selected },
          { 'hover:text-surface-700 hover:bg-surface-100': context.focused && !context.selected },
          // Transitions
          'transition-shadow',
          'duration-200',
          // Misc
          'cursor-pointer',
          'overflow-hidden',
          'whitespace-nowrap',
        ],
      }),
    },
    filterRule: {
      class: ['py-3 px-5', 'border-b border-solid', 'border-surface-200'],
    },
    filterAddButtonContainer: {
      class: 'py-3 px-5',
    },
    pcFilterAddRuleButton: {
      root: {
        class: ['relative', 'items-center inline-flex text-center align-bottom justify-center', 'text-sm py-2 px-3 w-full', 'rounded-md', 'bg-transparent border-transparent', 'text-primary', 'hover:bg-primary-300/20', 'transition duration-200 ease-in-out', 'cursor-pointer overflow-hidden select-none'],
      },
      label: {
        class: 'flex-auto grow-0',
      },
      icon: {
        class: 'mr-2',
      },
    },
    pcFilterRemoveRuleButton: {
      root: {
        class: ['relative', 'items-center inline-flex text-center align-bottom justify-center', 'text-sm py-2 px-3 w-full mt-2', 'rounded-md', 'bg-transparent border-transparent', 'text-red-500', 'hover:bg-red-300/20', 'transition duration-200 ease-in-out', 'cursor-pointer overflow-hidden select-none'],
      },
      label: {
        class: 'flex-auto grow-0',
      },
      icon: {
        class: 'mr-2',
      },
    },
    filterButtonbar: {
      class: ['flex items-center justify-between', 'py-3 px-5'],
    },
    pcFilterClearButton: {
      root: {
        class: ['relative', 'items-center inline-flex text-center align-bottom justify-center', 'text-sm py-2 px-3', 'rounded-md', 'text-primary-500 border border-primary', 'hover:bg-primary-300/20', 'transition duration-200 ease-in-out', 'cursor-pointer overflow-hidden select-none'],
      },
    },
    pcFilterApplyButton: {
      root: {
        class: ['relative', 'items-center inline-flex text-center align-bottom justify-center', 'text-sm py-2 px-3', 'rounded-md', 'text-primary-inverse', 'bg-primary', 'hover:bg-primary-hover hover:border-primary-hover', 'transition duration-200 ease-in-out', 'cursor-pointer overflow-hidden select-none'],
      },
    },
    pcColumnFilterButton: ({ context }: any) => ({
      class: [
        'relative',
        // Flex & Alignment
        'inline-flex items-center justify-center',
        // Size
        'w-8 h-8',
        // Spacing
        'ml-2',
        // Shape
        'rounded-full',
        // Color
        { 'bg-primary-highlight text-highlight-inverse': context.active },
        // States
        'hover:text-surface-700 hover:bg-surface-300/20',
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50',
        // Transition
        'transition duration-200',
        // Misc
        'cursor-pointer no-underline overflow-hidden',
      ],
    }),
    pcColumnFilterClearButton: ({ context }: any) => ({
      class: [
        'relative',
        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',
        // Shape
        'border-none',
        // Spacing
        'm-0 p-0 ml-2',
        // Color
        'bg-transparent',
        // Misc
        'cursor-pointer no-underline overflow-hidden select-none',
        {
          invisible: !context.hidden,
        },
      ],
    }),
    rowToggleButton: {
      class: ['relative', 'inline-flex items-center justify-center', 'text-left', 'm-0 p-0', 'w-8 h-8', 'border-0 rounded-full', 'text-surface-500', 'bg-transparent', 'focus-visible:outline-none focus-visible:outline-offset-0', 'focus-visible:ring focus-visible:ring-primary-400/50', 'transition duration-200', 'overflow-hidden', 'cursor-pointer select-none'],
    },
    columnResizer: {
      class: ['block', 'absolute top-0 right-0', 'w-2 h-full', 'm-0 p-0', 'border border-transparent', 'cursor-col-resize'],
    },
    reorderableRowHandle: {
      class: 'cursor-move',
    },
    pcRowEditorInit: {
      class: ['relative', 'inline-flex items-center justify-center', 'text-left', 'w-8 h-8', 'border-0 rounded-full', 'text-surface-700', 'border-transparent', 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50', 'hover:text-surface-700 hover:bg-surface-300/20', 'transition duration-200', 'overflow-hidden', 'cursor-pointer select-none'],
    },
    pcRowEditorSave: {
      class: ['relative', 'inline-flex items-center justify-center', 'text-left', 'w-8 h-8', 'border-0 rounded-full', 'text-surface-700', 'border-transparent', 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50', 'hover:text-surface-700 hover:bg-surface-300/20', 'transition duration-200', 'overflow-hidden', 'cursor-pointer select-none'],
    },
    pcRowEditorCancel: {
      class: ['relative', 'inline-flex items-center justify-center', 'text-left', 'w-8 h-8', 'border-0 rounded-full', 'text-surface-700', 'border-transparent', 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50', 'hover:text-surface-700 hover:bg-surface-300/20', 'transition duration-200', 'overflow-hidden', 'cursor-pointer select-none'],
    },
    pcRowRadiobutton: {
      root: {
        class: ['relative', 'inline-flex', 'align-bottom', 'w-[1.571rem] h-[1.571rem]', 'cursor-pointer', 'select-none'],
      },
      box: ({ props }: any) => ({
        class: [
          // Flexbox
          'flex justify-center items-center',
          // Size
          'w-[1.571rem] h-[1.571rem]',
          // Shape
          'border-2',
          'rounded-full',
          // Transition
          'transition duration-200 ease-in-out',
          // Colors
          {
            'text-surface-700': !props.modelValue,
            'bg-surface-0': !props.modelValue,
            'border-surface-300': !props.modelValue,
            'border-primary': props.modelValue,
            'bg-primary': props.modelValue,
          },
          // States
          {
            'peer-hover:border-primary': !props.disabled,
            'peer-hover:border-primary-hover peer-hover:bg-primary-hover': !props.disabled && props.modelValue,
            'peer-focus-visible:border-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400/20': !props.disabled,
            'opacity-60 cursor-default': props.disabled,
          },
        ],
      }),
      input: {
        class: ['peer', 'w-full ', 'h-full', 'absolute', 'top-0 left-0', 'z-10', 'p-0', 'm-0', 'opacity-0', 'rounded-md', 'outline-none', 'border-2 border-surface-200', 'appearance-none', 'cursor-pointer'],
      },
      icon: ({ props }: any) => ({
        class: [
          'block',
          // Shape
          'rounded-full',
          // Size
          'w-[0.857rem] h-[0.857rem]',
          // Colors
          'bg-surface-0',
          // Conditions
          {
            'backface-hidden scale-10 invisible': !props.modelValue,
            'transform visible scale-[1.1]': props.modelValue,
          },
          // Transition
          'transition duration-200',
        ],
      }),
    },
    pcHeaderCheckbox: {
      root: {
        class: ['relative', 'inline-flex', 'align-bottom', 'w-6', 'h-6', 'cursor-pointer', 'select-none'],
      },
      box: ({ props, context }: any) => ({
        class: [
          // Alignment
          'flex',
          'items-center',
          'justify-center',
          // Size
          'w-6',
          'h-6',
          // Shape
          'rounded-md',
          'border-2',
          // Colors
          {
            'border-surface-200 bg-surface-0': !context.checked,
            'border-primary bg-primary': context.checked,
          },
          // States
          {
            'peer-hover:border-primary': !props.disabled && !context.checked,
            'peer-hover:bg-primary-hover peer-hover:border-primary-hover': !props.disabled && context.checked,
            'peer-focus-visible:border-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400/20': !props.disabled,
            'cursor-default opacity-60': props.disabled,
          },
          // Transitions
          'transition-colors',
          'duration-200',
        ],
      }),
      input: {
        class: ['peer', 'w-full ', 'h-full', 'absolute', 'top-0 left-0', 'z-10', 'p-0', 'm-0', 'opacity-0', 'rounded-md', 'outline-none', 'border-2 border-surface-200', 'appearance-none', 'cursor-pointer'],
      },
      icon: {
        class: ['text-base leading-none', 'w-4', 'h-4', 'text-white', 'transition-all', 'duration-200'],
      },
    },
    pcRowCheckbox: {
      root: {
        class: ['relative', 'inline-flex', 'align-bottom', 'w-6', 'h-6', 'cursor-pointer', 'select-none'],
      },
      box: ({ props, context }: any) => ({
        class: [
          // Alignment
          'flex',
          'items-center',
          'justify-center',
          // Size
          'w-6',
          'h-6',
          // Shape
          'rounded-md',
          'border-2',
          // Colors
          {
            'border-surface-200 bg-surface-0': !context.checked,
            'border-primary bg-primary': context.checked,
          },
          // States
          {
            'peer-hover:border-primary': !props.disabled && !context.checked,
            'peer-hover:bg-primary-hover peer-hover:border-primary-hover': !props.disabled && context.checked,
            'peer-focus-visible:border-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400/20': !props.disabled,
            'cursor-default opacity-60': props.disabled,
          },
          // Transitions
          'transition-colors',
          'duration-200',
        ],
      }),
      input: {
        class: ['peer', 'w-full ', 'h-full', 'absolute', 'top-0 left-0', 'z-10', 'p-0', 'm-0', 'opacity-0', 'rounded-md', 'outline-none', 'border-2 border-surface-200', 'appearance-none', 'cursor-pointer'],
      },
      icon: {
        class: ['text-base leading-none', 'w-4', 'h-4', 'text-white', 'transition-all', 'duration-200'],
      },
    },
    transition: {
      enterFromClass: 'opacity-0 scale-y-[0.8]',
      enterActiveClass: 'transition-[transform,opacity] duration-[120ms] ease-[cubic-bezier(0,0,0.2,1)]',
      leaveActiveClass: 'transition-opacity duration-100 ease-linear',
      leaveToClass: 'opacity-0',
    },
  },
  bodyrow: ({ context, props }: any) => ({
    class: [
      // Color
      { 'bg-primary-highlight text-primary-highlight-inverse': context.selected },
      { 'bg-surface-0 text-surface-600': !context.selected },
      { 'font-bold bg-surface-0 z-20': props.frozenRow },
      { 'odd:bg-surface-0 odd:text-surface-600 even:bg-surface-50 even:text-surface-600': context.stripedRows },
      // State
      { 'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ring-inset': context.selectable },
      { 'hover:bg-surface-300/20 hover:text-surface-600': props.selectionMode && !context.selected },
      // Transition
      { 'transition duration-200': (props.selectionMode && !context.selected) || props.rowHover },
      // Misc
      { 'cursor-pointer': props.selectionMode },
    ],
  }),
  rowexpansion: {
    class: 'bg-surface-0 text-surface-600',
  },
  rowgroupheader: {
    class: ['sticky z-20', 'bg-surface-0 text-surface-600', ''],
  },
  rowgroupfooter: {
    class: ['sticky z-20', 'bg-surface-0 text-surface-600', ''],
  },
  rowgrouptoggler: {
    class: ['relative', 'inline-flex items-center justify-center', 'text-left', 'm-0 p-0', 'w-8 h-8', 'border-0 rounded-full', 'text-surface-500', 'bg-transparent', 'focus-visible:outline-none focus-visible:outline-offset-0', 'focus-visible:ring focus-visible:ring-primary-400/50', 'transition duration-200', 'overflow-hidden', 'cursor-pointer select-none'],
  },
  rowgrouptogglericon: {
    class: 'inline-block w-4 h-4',
  },
  columnResizeIndicator: {
    class: 'absolute hidden w-[2px] z-20 bg-primary',
  },
}
