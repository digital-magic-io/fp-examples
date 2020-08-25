import { contramap, fromCompare, getDualOrd, Ord } from 'fp-ts/Ord'
import { getEq, sort } from 'fp-ts/Array'
import { eqNumber } from 'fp-ts/Eq'

// Eq has too limited functionality, let's try something more powerful
// But why I must write all these combinators and type classes if they are already written!

// But now we can build comparator (equals will be derived from compare function)
const ordNumber: Ord<number> = fromCompare(
  (x, y) => (x < y ? -1 : x > y ? 1 : 0)
)
// Notice familiar approach

console.assert(ordNumber.compare(1, 1) === 0)
console.assert(ordNumber.compare(1, 2) === -1)
console.assert(ordNumber.compare(2, 1) === 1)


// we can use Ord to define min / max functions:
function min<A>(ord: Ord<A>): (x: A, y: A) => A {
  return (x, y) => ord.compare(x, y) === 1 ? y : x
}
console.assert(min(ordNumber)(2, 1) === 1)
console.assert(min(ordNumber)(1, 2) === 1)
console.assert(min(ordNumber)(1, 1) === 1)


// Like we did with Eq we can build Ord instance for object using familiar contramap combinator

type User = {
  readonly name: string
  readonly age: number
}

// build order function
const ordByAge: Ord<User> = contramap((user: User) => user.age)(ordNumber)

// combine it with min funcion
const getYounger = min(ordByAge)
console.assert(getYounger({ name: 'Vasja', age: 34 }, { name: 'Petja', age: 36 }).name === 'Vasja')

// There could be dual function that produce inverted result, let's try define getOlder() function

function max<A>(ord: Ord<A>): (x: A, y: A) => A {
  return min(getDualOrd(ord))
}

const getOlder = max(ordByAge)
console.assert(getOlder({ name: 'Vasja', age: 34 }, { name: 'Petja', age: 36 }).name === 'Petja')

// We can just use Ord for sorting
const numericSort = sort(ordNumber)
const arrayEq = getEq(eqNumber)
console.assert(arrayEq.equals(numericSort([2, 1, 3]), [1, 2, 3]))
// Notice, we don't use JSON.stringify to compare arrays, we've built a better function
