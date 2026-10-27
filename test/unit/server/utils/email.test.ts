import { beforeEach, describe, expect, it } from 'vitest'
import { mockStorage, setStorageItem } from '~~/test/unit/stubs/storage'
import { fillEmailTemplate, renderEmail } from '~~/server/utils/email'

describe('fillEmailTemplate', () => {
  it('escapes values in html', () => {
    expect(
      fillEmailTemplate(
        '<p>Hallo {{ name }}</p>',
        { name: '<b>"Jef" & \'An\'</b>' },
        'html',
      ),
    ).toBe('<p>Hallo &lt;b&gt;&quot;Jef&quot; &amp; &#39;An&#39;&lt;/b&gt;</p>')
  })

  it('leaves values as typed in plain text', () => {
    expect(
      fillEmailTemplate('Hallo {{ name }}', { name: 'Jef & An' }, 'text'),
    ).toBe('Hallo Jef & An')
  })

  it('accepts placeholders with or without inner spaces', () => {
    expect(fillEmailTemplate('{{a}} {{ b }}', { a: '1', b: '2' }, 'html')).toBe(
      '1 2',
    )
  })

  it('keeps a section only when its value is filled in', () => {
    const template = 'op {{ date }}{{#time}} om {{ time }}{{/time}}.'

    expect(
      fillEmailTemplate(template, { date: 'vrijdag', time: '19:00' }, 'text'),
    ).toBe('op vrijdag om 19:00.')
    expect(fillEmailTemplate(template, { date: 'vrijdag' }, 'text')).toBe(
      'op vrijdag.',
    )
  })

  it('keeps an inverted section only when its value is missing', () => {
    const template =
      '{{#event}}inschrijving voor {{ event }}{{/event}}{{^event}}boeking{{/event}}'

    expect(fillEmailTemplate(template, { event: 'Quiz' }, 'text')).toBe(
      'inschrijving voor Quiz',
    )
    expect(fillEmailTemplate(template, {}, 'text')).toBe('boeking')
  })

  it('keeps sections that span several lines', () => {
    expect(
      fillEmailTemplate(
        '{{#time}}om\n{{ time }}{{/time}}',
        { time: '19:00' },
        'text',
      ),
    ).toBe('om\n19:00')
  })

  it('inserts a raw value in the matching format', () => {
    const list = { html: '<p>Jef</p>', text: 'Jef' }

    expect(fillEmailTemplate('{{{ list }}}', { list }, 'html')).toBe(
      '<p>Jef</p>',
    )
    expect(fillEmailTemplate('{{{list}}}', { list }, 'text')).toBe('Jef')
  })

  it('hides a section around an empty raw value', () => {
    expect(
      fillEmailTemplate(
        '{{#list}}Lijst: {{{ list }}}{{/list}}',
        { list: { html: '', text: '' } },
        'html',
      ),
    ).toBe('')
  })

  it('refuses a plain string where raw html is expected', () => {
    expect(() =>
      fillEmailTemplate('{{{ list }}}', { list: '<p>Jef</p>' }, 'html'),
    ).toThrow('Missing email value for "list"')
  })

  it('refuses to send a placeholder without a value', () => {
    expect(() => fillEmailTemplate('Hallo {{ name }}', {}, 'html')).toThrow(
      'Missing email value for "name"',
    )
  })
})

describe('renderEmail', () => {
  beforeEach(() => {
    mockStorage()
  })

  it('fills the compiled html and plain text of a template', async () => {
    setStorageItem('emails:Reminder.html', '<p>Hallo {{ name }}</p>')
    setStorageItem('emails:Reminder.txt', 'Hallo {{ name }}')

    await expect(
      renderEmail('Reminder', {
        name: 'Jef & An',
        date: 'vrijdag',
        time: '19:00',
      }),
    ).resolves.toEqual({
      html: '<p>Hallo Jef &amp; An</p>',
      text: 'Hallo Jef & An',
    })
  })

  it('fails when the template was not compiled', async () => {
    setStorageItem('emails:Reminder.txt', null)

    await expect(
      renderEmail('Reminder', { name: 'Jef', date: 'vrijdag', time: '19:00' }),
    ).rejects.toThrow('Compiled email template "Reminder" not found')
  })
})
