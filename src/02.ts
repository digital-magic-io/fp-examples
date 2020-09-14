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

// First make it lower case, then substitute whitespaces with underscore
const snakeCase = compose(replace(/\s+/ig)('_'), toLowerCase)
console.assert(snakeCase('Test Tool') === 'test_tool')

// More complicated example
const capitalizeHead = compose(toUpperCase, head)
const initials = compose(join('. '), compose(map(capitalizeHead), split(' ')))
console.assert(initials('Ivan Dulin') === 'I. D')

// But there are ways to make this code even simpler!
