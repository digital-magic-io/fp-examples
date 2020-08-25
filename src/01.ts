export const elements: ReadonlyArray<any> = ['test', null, undefined, 1]

export const notEmpty = (v: any) => v !== null && v !== undefined

// match
const match = (pattern: RegExp) => (source: string) => source.match(pattern)
const matchEmail = match(/^.*@.*$/g)
console.assert(matchEmail('test@test.com') !== null)

// replace
export const replace = (pattern: RegExp) => (replacement: string) => (source: string) =>
  source.replace(pattern, replacement)
const replaceEmailSymbol = replace(/@/ig)
const protectEmail = replaceEmailSymbol('[at]')
console.assert(protectEmail('test@test.com') === 'test[at]test.com')

// filter
const filter = (f: (v: any) => boolean) => (xs: ReadonlyArray<any>) => xs.filter(f)
const compact = filter(notEmpty)
console.assert(compact(elements).length === 2)

// map
export const map = (f: (v: any) => any) => (xs: ReadonlyArray<any>) => xs.map(f)
const sizes = map(v => notEmpty(v) ? String(v).length : 0)
// Funny way to compare arrays
const result = JSON.stringify(sizes(elements))
const expected = JSON.stringify([4, 0, 0, 1])
console.assert(result === expected)
