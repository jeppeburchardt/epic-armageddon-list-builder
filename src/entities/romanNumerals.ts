/**
 * Converts a positive whole number to an uppercase Roman numeral.
 * Throws when the input is not a positive integer.
 */
export function toRomanNumeral(value: number): string {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError('toRomanNumeral expects a positive integer')
  }

  const numerals: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let remaining = value
  let roman = ''

  for (const [num, symbol] of numerals) {
    while (remaining >= num) {
      roman += symbol
      remaining -= num
    }
  }

  return roman
}
