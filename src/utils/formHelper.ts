export function isFalsy(input?: string) {
  if (!input) {
    return true
  }

  input = input.trim()

  return input === '0' || input === 'false' || input === 'off'
}

export function isTruly(input?: string) {
  return !isFalsy(input)
}
