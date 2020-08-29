import { flatten, fromNullable, getOrElse, map, none, Option, some } from 'fp-ts/Option'
import { findFirst, head } from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

// tslint:disable-next-line:readonly-array
const testArray: Array<number> = [1, 2, 3, 4, 5]

// Imperative example
function findI(arr: ReadonlyArray<number>, value: number): number | undefined {
  for (let i = 0; i < testArray.length; i++) {
    if (arr[i] === value) {
      return arr[i]
    }
  }
  return undefined
}
console.assert(findI(testArray, 3))


// More functional way:
console.assert(testArray.find(v => v === 3) === 3)

// But it isn't really convenient to combine results of multiple searches
const firstResult = testArray.find(v => v === 3)
const secondResult = testArray.find(v => v === 5)
// Let's try multiply them
// firstResult * secondResult // Oooops!

// So we need:
function multiplySearchesI(x: number | undefined, y: number | undefined): number {
  return (x === undefined ? 1 : x) * (y === undefined ? 1 : y)
}
console.assert(multiplySearchesI(firstResult, secondResult) === 15)
console.assert(multiplySearchesI(firstResult, testArray.find(v => v === 10)) === 3)
// So simple case and so much boilerplate


// Let's redefine our function using Option:
function multiplySearches(...values: ReadonlyArray<Option<number>>): number {
  return values.map(getOrElse(() => 1))
    .reduce((a, b) => a * b)
}

const findInTest = (value: number) => findFirst<number>(v => v === value)(testArray)
console.assert(multiplySearches(findInTest(3), findInTest(5)) === 15)
// No big win yet?



// But what if we try to build function sequence where every function may return undefined?
// Parsing JSON is common case: Imagine we are parsing person address in a structure:
type Address = {
  readonly country?: string;
  readonly city?: string;
  readonly addressLine?: string;
}

type Person = {
  readonly name: string,
  readonly age: number,
  readonly addresses?: ReadonlyArray<Address>
}

// tslint:disable-next-line:readonly-array
const users: Array<Person> = [
  { name: 'Vasja', age: 18, addresses: [{ country: 'Estonia', city: 'Tallinn', addressLine: 'Viru 1' }] },
  { name: 'Petja', age: 19, addresses: [{ country: 'Finland', city: 'Helsinki', addressLine: 'Bulevardi 1' }] },
  { name: 'Ivan', age: 17 },
  { name: 'Misha', age: 20, addresses: [] },
  { name: 'Vova', age: 21, addresses: [{}] }
]

// We have to output city of the first user's address for each user

// Imperative way:
// tslint:disable-next-line:readonly-array
function countryNamesI(users: Array<Person>) {
  // tslint:disable-next-line:readonly-array
  let results = []
  for (let i = 0; i < users.length; i++) {
    const addresses = users[i].addresses
    // tslint:disable-next-line:strict-type-predicates
    if (addresses === undefined || addresses[0] === undefined) {
      results.push(undefined)
      continue
    }
    const countryName = addresses[0].country
    if (countryName === undefined) {
      results.push(undefined)
      continue
    }
    results.push(countryName)
  }
  return results
}
console.assert(JSON.stringify(countryNamesI(users)) === JSON.stringify(['Estonia', 'Finland', undefined, undefined, undefined]))
// ugly code, isn't it?

// Functional approah:
const prop = (key: any) => (obj: any): Option<any> => fromNullable(obj[key])

const countryName: (p: Person) => Option<string> = flow(
  prop('addresses'),
  map(head),
  flatten,
  map(prop('country')),
  flatten
)

console.assert(JSON.stringify(users.map(countryName)) === JSON.stringify([some('Estonia'), some('Finland'), none, none, none]))
