import { map, replace } from './01'

type fType = (v: any) => any
const compose = (f: fType, g: fType) => (v: any) => f(g(v))

const reverse = (s: string) => [...s].reverse().join('')
const toUpperCase = (s: string) => s.toUpperCase()
const toLowerCase = (s: string) => s.toLowerCase()
const head = (s: string) => s.length > 0 ? s[0] : ''
const split = (separator: string) => (s: string) => s.split(separator)
const join = (separator: string) => (xs: ReadonlyArray<any>) => xs.join(separator)

// First convert to upper case then reverse string
const upperReverse = compose(reverse, toUpperCase)
console.assert(upperReverse('root') === 'TOOR')

// First reverse string then take first element
const last = compose(head, reverse)
console.assert(last('xyz') === 'z')





// Point free functions - functions that hide the data they are working with - more generic

// not pointfree because we mention the data: word of type String
const snakeCase1 = (word: String) => word.toLowerCase()
  .replace(/\s+/ig, '_')
console.assert(snakeCase1('Test Tool') === 'test_tool')

// point free
const snakeCase2 = compose(replace(/\s+/ig)('_'), toLowerCase)
console.assert(snakeCase2('Test Tool') === 'test_tool')


// not pointfree because we mention the data: name
const initials1 = (name: String) => name.split(' ')
  .map(compose(toUpperCase, head)).join('. ')
console.assert(initials1('Ivan Dulin') === 'I. D')

// pointfree
const initials2 = compose(join('. '),
  compose(map(compose(toUpperCase, head)), split(' ')))
console.assert(initials2('Ivan Dulin') === 'I. D')

// NB! Notice that we use only one test to ensure correctness of composition - we don't have to test invariants

