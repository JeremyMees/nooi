interface Mail {
  props: Record<string, any>
  from: string
  to: string
  subject: string
  template: string
}
