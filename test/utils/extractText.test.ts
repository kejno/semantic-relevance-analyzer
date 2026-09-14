import { describe, it, expect } from 'vitest'
import { extractText } from '../../src/utils/extractText.ts'

describe('extractText', () => {
  it('returns empty string for empty input', () => {
    expect(extractText('')).toBe('')
  })

  it('strips <script> tags and their content', () => {
    expect(extractText('<script>alert(1)</script><p>Hello</p>')).toBe('Hello')
  })

  it('strips <style> tags and their content', () => {
    expect(extractText('<style>p{color:red}</style><p>World</p>')).toBe('World')
  })

  it('strips both script and style leaving only body text', () => {
    expect(
      extractText('<script>var x=1</script><style>p{color:red}</style><p>content</p>'),
    ).toBe('content')
  })

  it('collapses whitespace and newlines to a single space', () => {
    expect(extractText('<p>foo   bar\n\nbaz</p>')).toBe('foo bar baz')
  })

  it('handles plain text (no HTML tags)', () => {
    expect(extractText('plain text input')).toBe('plain text input')
  })

  it('returns empty string for script/style-only HTML', () => {
    expect(extractText('<script>var x=1</script><style>body{}</style>')).toBe('')
  })

  it('strips <noscript> tags and their content', () => {
    expect(extractText('<noscript><p>JS required</p></noscript><p>Content</p>')).toBe('Content')
  })
})
