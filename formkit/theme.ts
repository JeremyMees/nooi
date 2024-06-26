import type { FormKitNode } from '@formkit/core'

/**
 * @privateRemarks
 * This file was generated by the FormKit CLI and should not be manually
 * edited unless you’d like to "eject" from the CLI’s ability to update it.
 *
 * @checksum - 0f223ea99bdfd461efbed8896695b011b19b72cd2dbea962a1fe23b6b6d65557
 * @variables - radius=rounded,accentColor=primary,colorTemperature=surface,spacing=2,scale=base,inputShadow=shadow,baseColorShade=600,borderShadeLightMode=400,borderShadeDarkMode=500,inputMaxWidth=max-w-none,tagRadius=rounded,swatchRadius=rounded
 * @theme - regenesis
 **/

/**
 * This is the theme function itself, it should be imported and used as the
 * config.rootClasses function. For example:
 *
 * ```js
 * import { theme } from './formkit.theme'
 * import { defineFormKitConfig } from '@formkit/vue'
 *
 * export default defineFormKitConfig({
 *   config: {
 *     rootClasses: theme
 *   }
 * })
 * ```
 **/
export function rootClasses(sectionName: string, node: FormKitNode): Record<string, boolean> {
  const key = `${node.props.type}__${sectionName}`
  const semanticKey = `formkit-${sectionName}`
  const familyKey = node.props.family ? `family:${node.props.family}__${sectionName}` : ''
  const memoKey = `${key}__${familyKey}`
  if (!(memoKey in classes)) {
    const sectionClasses = classes[key] ?? globals[sectionName] ?? {}
    sectionClasses[semanticKey] = true
    if (familyKey in classes) {
      classes[memoKey] = { ...classes[familyKey], ...sectionClasses }
    }
    else {
      classes[memoKey] = sectionClasses
    }
  }
  return classes[memoKey] ?? { [semanticKey]: true }
}

/**
 * These classes have already been merged with globals using tailwind-merge
 * and are ready to be used directly in the theme.
 **/
const classes: Record<string, Record<string, boolean>> = {
  'family:button__wrapper': {
    'group-data-[disabled=true]:grayscale': true,
  },
  'family:button__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'font-bold': true,
    'rounded': true,
    'outline-none': true,
    'flex': true,
    '!text-sm': true,
    'px-4': true,
    'py-3': true,
    'items-center': true,
    'mb-1.5': true,
    'ring-primary-400/50': true,
    'focus:ring': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'group-data-[prefix-icon]:pl-5': true,
    'group-data-[suffix-icon]:pr-5': true,
    'border': true,
    'border-primary-600': true,
    'text-primary-600': true,
  },
  'family:box__wrapper': {
    'inline-flex': true,
    'items-center': true,
    'mb-1': true,
    'group-data-[multiple]:mb-0': true,
  },
  'family:box__legend': {
    'block': true,
    'text-black': true,
    'text-sm': true,
    'font-bold': true,
    'mb-2': true,
  },
  'family:box__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'peer': true,
    'pointer-events-none': true,
    'absolute': true,
    'h-0': true,
    'w-0': true,
    'overflow-hidden': true,
    'opacity-0': true,
  },
  'family:box__decorator': {
    'mr-1.5': true,
    'bg-white': true,
    'ring-primary-400/50': true,
    'peer-checked:border-primary-600': true,
    'relative': true,
    'block': true,
    'text-lg': true,
    'w-[1em]': true,
    'aspect-[1/1]': true,
    'border': true,
    'border-surface-400': true,
    'text-transparent': true,
    'peer-checked:bg-primary-50': true,
    'peer-checked:text-primary-600': true,
    'peer-focus-visible:ring': true,
    'peer-focus-visible:ring-offset-1': true,
    'select-none': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'peer-disabled:bg-surface-100': true,
    'group-data-[disabled]:grayscale': true,
    'peer-disabled:cursor-not-allowed': true,
  },
  'family:box__decoratorIcon': {
    'absolute': true,
    'left-1/2': true,
    'top-1/2': true,
    'flex': true,
    'h-full': true,
    'w-full': true,
    '-translate-x-1/2': true,
    '-translate-y-1/2': true,
  },
  'family:box__option': {
    'mb-1.5': true,
    'last:mb-0': true,
    'data-[disabled]:opacity-50': true,
    'data-[disabled]:select-none': true,
    'group-data-[disabled]:data-[disabled]:opacity-100': true,
  },
  'family:box__label': {
    'block': true,
    'text-black': true,
    'text-sm': true,
    'font-bold': true,
    'mb-1': true,
    '!mb-0': true,
    '!font-normal': true,
    '!text-sm': true,
  },
  'family:box__optionHelp': {
    'text-surface-500': true,
    'text-xs': true,
    '-mt-1': true,
    'mb-1.5': true,
    'ml-[min(2em,1.7rem)]': true,
    'relative': true,
    'left-px': true,
  },
  'family:box__help': {
    'text-surface-500': true,
    'text-xs': true,
    'mb-1': true,
    'group-data-[multiple]:mb-2': true,
    'group-data-[multiple]:-mt-1.5': true,
  },
  'family:text__wrapper': {
    'flex': true,
    'flex-col': true,
    'items-start': true,
    'justify-start': true,
    'mb-1.5': true,
    'last:mb-0': true,
  },
  'family:text__label': {
    'block': true,
    'text-black': true,
    'text-sm': true,
    'font-bold': true,
    '!inline-flex': true,
    'mb-1': true,
  },
  'family:text__inner': {
    'text-base': true,
    'flex': true,
    'items-center': true,
    'w-full': true,
    'py-2': true,
    'px-3': true,
    'min-h-[44px]': true,
    'rounded': true,
    'border': true,
    'border-surface-400': true,
    'bg-white': true,
    'focus-within:ring': true,
    'focus-within:!ring-primary-400/50': true,
    'focus-within:!border-primary-500': true,
    'group-data-[invalid]:border-red-400': true,
    'group-data-[invalid]:ring-1': true,
    'group-data-[invalid]:ring-red-400': true,
    'group-data-[disabled]:bg-surface-100': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
  },
  'family:text__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'text-base': true,
    'text-black': true,
    'min-w-0': true,
    'min-h-[1.5em]': true,
    'grow': true,
    'outline-none': true,
    'bg-transparent': true,
    'placeholder:text-surface-400': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'border-none': true,
    'p-0': true,
    'focus:ring-0': true,
  },
  'family:text__prefixIcon': {
    'flex': true,
    'items-center': true,
    '-ml-1': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'text-surface-600': true,
  },
  'family:text__suffixIcon': {
    'flex': true,
    'items-center': true,
    '-mr-1': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'text-surface-600': true,
  },
  'family:dropdown__wrapper': {
    'mb-1.5': true,
  },
  'family:dropdown__inner': {
    'relative': true,
    'flex': true,
    'items-center': true,
    'bg-white': true,
    'border': true,
    'border-surface-400': true,
    'rounded': true,
    'group-data-[is-multiline]:!rounded': true,
    'focus-within:ring': true,
    'focus-within:!ring-primary-400/50': true,
    'focus-within:!border-primary-500': true,
    'group-data-[invalid]:border-red-400': true,
    'group-data-[invalid]:ring-1': true,
    'group-data-[invalid]:ring-red-400': true,
    'group-data-[disabled]:bg-surface-100': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
  },
  'family:dropdown__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'grow': true,
    'p-2': true,
    'pr-0': true,
    'pl-3': true,
    'text-base': true,
    'text-black': true,
    'text-ellipsis': true,
    'min-w-0': true,
    'outline-none': true,
    'bg-transparent': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'group-data-[prefix-icon]:!pl-0': true,
    'group-data-[suffix-icon]:!pr-0': true,
    'placeholder:text-surface-400': true,
    'border-none': true,
    'focus:ring-0': true,
    'bg-none': true,
  },
  'family:dropdown__listboxButton': {
    'w-[2.5em]': true,
    'self-stretch': true,
    'text-base': true,
    'flex': true,
    'items-center': true,
    'text-black': true,
    'z-10': true,
    'data-[disabled]:cursor-not-allowed': true,
  },
  'family:dropdown__removeSelection': {
    'w-[2.5em]': true,
    'self-stretch': true,
    'text-base': true,
    'flex': true,
    'items-center': true,
    'text-black': true,
    'hover:text-red-400': true,
    'z-10': true,
  },
  'family:dropdown__controlLabel': {
    'absolute': true,
    'opacity-0': true,
    'pointer-events-none': true,
    'text-[0px]': true,
  },
  'family:dropdown__selectIcon': {
    'text-base': true,
    'inline-flex': true,
    'justify-center': true,
    'w-[2.5em]': true,
    'relative': true,
    'my-auto': true,
    '[&>svg]:w-[1em]': true,
    '[&>svg]:mx-auto': true,
  },
  'family:dropdown__closeIcon': {
    'text-base': true,
    'w-[0.75em]': true,
    'relative': true,
    'm-auto': true,
  },
  'family:dropdown__prefixIcon': {
    'flex': true,
    'items-center': true,
    '-ml-1': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    '!ml-2': true,
    '!mr-0': true,
    'text-surface-600': true,
  },
  'family:dropdown__suffixIcon': {
    'flex': true,
    'items-center': true,
    '-mr-1': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    '!mr-2': true,
    '!ml-0': true,
    'text-surface-600': true,
  },
  'family:dropdown__dropdownWrapper': {
    'rounded': true,
    'shadow-lg': true,
    'mt-1': true,
    'overflow-clip': true,
    'empty:hidden': true,
    'border': true,
    'border-surface-300': true,
    'group-data-[expanded]:opacity-100': true,
    'group-data-[overscroll]:m-0': true,
    'group-data-[overscroll]:shadow-none': true,
    'group-data-[overscroll]:border-none': true,
  },
  'family:dropdown__listbox': {
    'bg-white': true,
    'rounded': true,
    'empty:hidden': true,
    'group-data-[overscroll]:shadow-lg': true,
    'group-data-[overscroll]:border': true,
    'group-data-[overscroll]:border-surface-300': true,
  },
  'family:dropdown__listitem': {
    'relative': true,
    'flex': true,
    'items-center': true,
    'px-2': true,
    'py-1.5': true,
    'first:pt-2': true,
    'last:pb-2': true,
    'text-black': true,
    'text-base': true,
    'data-[is-active]:bg-primary-100': true,
    'before:content-[\'\']': true,
    'before:absolute': true,
    'before:inset-0': true,
    'data-[is-active]:first:before:rounded': true,
    'data-[is-active]:first:before:rounded-b-none': true,
    'data-[is-active]:last:before:rounded': true,
    'data-[is-active]:last:before:rounded-t-none': true,
    'data-[is-active]:first:last:before:rounded': true,
    'data-[is-active]:before:ring': true,
    'data-[is-active]:before:ring-primary-400/50': true,
    'data-[is-active]:before:ring-inset': true,
    'data-[is-active]:before:ring-offset-primary-100': true,
  },
  'family:dropdown__selectedIcon': {
    'flex': true,
    'absolute': true,
    'items-center': true,
    'text-primary-600': true,
    'left-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
  },
  'family:dropdown__option': {
    'ml-[1.5em]': true,
  },
  'family:dropdown__loadMoreInner': {
    'flex': true,
    'text-sm': true,
    'text-surface-500': true,
    'p-2': true,
    'items-center': true,
    'justify-center': true,
    '[&>span]:mr-2': true,
    'hover:text-primary-600': true,
    'cursor-pointer': true,
  },
  'family:dropdown__selectionWrapper': {
    'grow': true,
    'flex': true,
    'items-center': true,
    'text-black': true,
  },
  'family:dropdown__selection': {
    'grow': true,
    'text-black': true,
    'group-data-[multiple]:p-2': true,
  },
  'family:dropdown__tagsWrapper': {
    'w-full': true,
  },
  'family:dropdown__tagWrapper': {
    'group/tag': true,
    'rounded': true,
    'mr-1': true,
    'mb-1': true,
    'outline-none': true,
  },
  'family:dropdown__tags': {
    'inline-flex': true,
    'flex-wrap': true,
    'items-center': true,
    'w-full': true,
    '-mb-1': true,
    'empty:mb-0': true,
  },
  'family:dropdown__tag': {
    'flex': true,
    'items-center': true,
    'cursor-default': true,
    'rounded': true,
    'text-sm': true,
    'px-1.5': true,
    'py-0.5': true,
    'bg-primary-500': true,
    'text-white': true,
    '[&>[type=button]]:!w-[0.5em]': true,
    '[&>[type=button]]:aspect-[1/1]': true,
    '[&>[type=button]]:!text-inherit': true,
    '[&>[type=button]]:cursor-pointer': true,
  },
  'family:dropdown__tagLabel': {
    'mr-1': true,
  },
  'family:dropdown__emptyMessage': {
    'flex': true,
    'items-center': true,
    'px-2': true,
    'py-1.5': true,
    'first:pt-2': true,
    'last:pb-2': true,
    'text-black': true,
    'text-sm': true,
    'aria-selected:text-white': true,
    'aria-selected:bg-primary-500': true,
  },
  'button__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'bg-primary-50': true,
    'hover:bg-primary-100': true,
  },
  'checkbox__decorator': {
    rounded: true,
  },
  'checkbox__decoratorIcon': {
    'max-w-[66.66%]': true,
  },
  'date__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'focus:[&::-webkit-datetime-edit-day-field]:bg-primary-300': true,
    'focus:[&::-webkit-datetime-edit-month-field]:bg-primary-300': true,
    'focus:[&::-webkit-datetime-edit-year-field]:bg-primary-300': true,
  },
  'form__form': {
    'group/form': true,
  },
  'form__actions': {
    '': true,
  },
  'form__summaryInner': {
    'group/summary': true,
    'border': true,
    'border-surface-400': true,
    'bg-white': true,
    'rounded': true,
    'py-2': true,
    'px-3': true,
  },
  'form__summaryHeader': {
    'text-lg': true,
    'text-black': true,
    'font-bold': true,
    'mb-2': true,
  },
  'form__messages': {
    '': true,
  },
  'form__message': {
    'text-red-600': true,
    'mb-1.5': true,
    'text-xs': true,
    'group-[]/summary:text-sm': true,
  },
  'form__messageLink': {
    'group-[]/summary:outline-none': true,
    'group-[]/summary:focus-visible:ring': true,
    'group-[]/summary:ring-primary-600': true,
  },
  'radio__decorator': {
    'rounded-full': true,
  },
  'radio__decoratorIcon': {
    'max-w-[50%]': true,
  },
  'select__wrapper': {
    'mb-1.5': true,
  },
  'select__inner': {
    'relative': true,
    'flex': true,
    'items-center': true,
    'bg-white': true,
    'border': true,
    'border-surface-400': true,
    'rounded': true,
    'focus-within:ring': true,
    'focus-within:!ring-primary-400/50': true,
    'focus-within:!border-primary-500': true,
    'group-data-[invalid]:border-red-400': true,
    'group-data-[invalid]:ring-1': true,
    'group-data-[invalid]:ring-red-400': true,
    'group-data-[disabled]:bg-surface-100': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'group-data-[multiple]:rounded': true,
  },
  'select__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'grow': true,
    'p-2': true,
    'py-2': true,
    'px-3': true,
    'pr-[2em]': true,
    'text-base': true,
    'text-black': true,
    'text-ellipsis': true,
    'min-w-0': true,
    'outline-none': true,
    'bg-transparent': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'group-data-[prefix-icon]:!pl-0': true,
    'group-data-[suffix-icon]:!pr-0': true,
    'data-[placeholder]:text-surface-400': true,
    'group-data-[multiple]:!p-0': true,
    'border-none': true,
    'focus:ring-0': true,
    'bg-none': true,
  },
  'select__selectIcon': {
    'absolute': true,
    'w-[1em]': true,
    'text-black': true,
    'pointer-events-none': true,
    'right-2': true,
    'group-data-[suffix-icon]:mr-[1.5em]': true,
  },
  'select__optGroup': {
    'bg-white': true,
    'text-black': true,
    'group/optgroup': true,
    'group-data-[multiple]:px-1.5': true,
    'pt-1.5': true,
    'font-bold': true,
    'text-sm': true,
  },
  'select__option': {
    'bg-white': true,
    'text-black': true,
    'group-data-[disabled]:opacity-50': true,
    'group-data-[disabled]:select-none': true,
    'group-data-[multiple]:checked:bg-primary-100': true,
    'group-data-[multiple]:focus:bg-primary-100': true,
    'group-data-[multiple]:text-sm': true,
    'group-data-[multiple]:outline-none': true,
    'group-data-[multiple]:border-none': true,
    'group-data-[multiple]:py-1.5': true,
    'group-data-[multiple]:px-2': true,
  },
  'select__prefixIcon': {
    'flex': true,
    'items-center': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'ml-2': true,
    'text-surface-600': true,
  },
  'select__suffixIcon': {
    'flex': true,
    'items-center': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'mr-2': true,
    'text-surface-600': true,
  },
  'submit__outer': {
    'group': true,
    'max-w-none': true,
    'min-w-0': true,
    'grow': true,
    'mb-4': true,
    'data-[disabled]:select-none': true,
    'text-base': true,
    'data-[disabled]:opacity-100': true,
    'flex': true,
    'justify-end': true,
  },
  'submit__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'bg-primary-500': true,
    '!text-white': true,
    'active:text-primary-100': true,
    'active:bg-primary-600': true,
    'hover:bg-primary-600': true,
    'disabled:border-surface-400': true,
    'disabled:bg-surface-400': true,
    'disabled:text-surface-100': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'before:transition-all': true,
    'group-data-[loading=true]/form:before:content[\'\']': true,
    'group-data-[loading=true]/form:before:block': true,
    'group-data-[loading=true]/form:before:animate-spin': true,
    'group-data-[loading=true]/form:before:w-5': true,
    'group-data-[loading=true]/form:before:h-5': true,
    'group-data-[loading=true]/form:before:rounded-full': true,
    'group-data-[loading=true]/form:before:mr-3': true,
    'group-data-[loading=true]/form:before:-ml-1.5': true,
    'group-data-[loading=true]/form:before:border-2': true,
    'group-data-[loading=true]/form:before:border-solid': true,
    'group-data-[loading=true]/form:before:border-white': true,
    'group-data-[loading=true]/form:before:border-r-transparent': true,
  },
  'submit__prefixIcon': {
    'flex': true,
    'items-center': true,
    '-ml-1': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'text-surface-100': true,
  },
  'submit__suffixIcon': {
    'flex': true,
    'items-center': true,
    '-mr-1': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    'text-surface-100': true,
  },
  'textarea__inner': {
    'flex': true,
    'items-center': true,
    'mb-1.5': true,
    'bg-white': true,
    'border': true,
    'border-surface-400': true,
    'rounded': true,
    'focus-within:ring': true,
    'focus-within:!ring-primary-400/50': true,
    'focus-within:!border-primary-500': true,
    'group-data-[invalid]:border-red-400': true,
    'group-data-[invalid]:ring-1': true,
    'group-data-[invalid]:ring-red-400': true,
    'group-data-[disabled]:bg-surface-100': true,
  },
  'textarea__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'text-base': true,
    'h-24': true,
    'text-black': true,
    'min-w-0': true,
    'grow': true,
    'shrink': true,
    '!py-2': true,
    '!px-3': true,
    'outline-none': true,
    'bg-transparent': true,
    'placeholder:text-surface-400': true,
    'group-data-[disabled]:!cursor-not-allowed': true,
    'p-0': true,
    'border-none': true,
    'focus:ring-0': true,
  },
  'textarea__prefixIcon': {
    'flex': true,
    'items-center': true,
    '-ml-1': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    '!ml-2': true,
    '!mr-0': true,
    'text-surface-600': true,
  },
  'textarea__suffixIcon': {
    'flex': true,
    'items-center': true,
    '-mr-1': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
    '!mr-2': true,
    '!ml-0': true,
    'text-surface-600': true,
  },
  'time__input': {
    'appearance-none': true,
    '[color-scheme:light]': true,
    'focus:[&::-webkit-datetime-edit-hour-field]:bg-primary-300': true,
    'focus:[&::-webkit-datetime-edit-minute-field]:bg-primary-300': true,
    'focus:[&::-webkit-datetime-edit-ampm-field]:bg-primary-300': true,
  },
}

const globals: Record<string, Record<string, boolean>> = {
  outer: {
    'group': true,
    'max-w-none': true,
    'min-w-0': true,
    'grow': true,
    'mb-4': true,
    'data-[disabled]:select-none': true,
    'data-[disabled]:opacity-50': true,
    'text-base': true,
  },
  label: {
    'block': true,
    'text-black': true,
    'text-sm': true,
    'font-bold': true,
    'mb-1': true,
  },
  legend: {
    'block': true,
    'text-black': true,
    'text-sm': true,
    'font-bold': true,
  },
  input: {
    'appearance-none': true,
    '[color-scheme:light]': true,
  },
  prefixIcon: {
    'flex': true,
    'items-center': true,
    '-ml-1': true,
    'mr-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
  },
  suffixIcon: {
    'flex': true,
    'items-center': true,
    '-mr-1': true,
    'ml-2': true,
    'text-base': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
  },
  loaderIcon: {
    'animate-spin': true,
    'flex': true,
    'items-center': true,
    'my-auto': true,
    'ml-2': true,
    'text-base': true,
    'text-surface-500': true,
    'h-[1em]': true,
    'w-[1em]': true,
    'shrink-0': true,
    '[&>svg]:w-full': true,
  },
  loadMoreInner: {
    'flex': true,
    'text-sm': true,
    'text-surface-500': true,
    'p-2': true,
    'items-center': true,
    'justify-center': true,
    '[&>span]:mr-2': true,
  },
  help: {
    'text-surface-500': true,
    'text-xs': true,
  },
  message: {
    'text-red-600': true,
    'mb-1.5': true,
    'text-xs': true,
  },
  overlay: {
    'text-black': true,
  },
  overlayPlaceholder: {
    'text-surface-400': true,
  },
  overlayLiteral: {
    'text-black': true,
  },
  overlayChar: {
    'text-black': true,
  },
  overlayEnum: {
    'text-black': true,
  },
}
