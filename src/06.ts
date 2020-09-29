import { Eq, eqNumber, getStructEq } from 'fp-ts/Eq'
import { fold, getFunctionSemigroup, getStructSemigroup, Semigroup, semigroupAll, semigroupAny } from 'fp-ts/Semigroup'
import { getApplySemigroup, getEq as getOptionEq, none, some } from 'fp-ts/Option'
import { contramap, max, min, Ord, ordNumber } from 'fp-ts/Ord'
import { getEq as getArrayEq } from 'fp-ts/Array'
import { Predicate } from 'fp-ts/function'

const arrayEq = getArrayEq(eqNumber)

// Let's define semigroup instance for multiplication: (number, *)
const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y
}
console.assert(semigroupProduct.concat(1, 2) === 2)

// The same for addition
const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y
}
console.assert(semigroupSum.concat(1, 2) === 3)

// Or strings concatenation
const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y
}
console.assert(semigroupString.concat('Functional ', 'programming') === 'Functional programming')

// And of course we can build generic/polymorphic Semigroups (when we don't care about the type)

// Always return the first argument
function getFirstSemigroup<A = never>(): Semigroup<A> {
  return { concat: (x, _) => x }
}
console.assert(getFirstSemigroup<string>().concat('1', '2') === '1')

// Combine 2 arrays into single one
// tslint:disable-next-line:readonly-array
function getArraySemigroup<A = never>(): Semigroup<Array<A>> {
  return { concat: (x, y) => x.concat(y) }
}
console.assert(arrayEq.equals(getArraySemigroup<number>().concat([1, 2], [3, 4]), [1, 2, 3, 4]))


// And we can build our semigroups using Ord instances

// We need some combinators for that:

export function getMeetSemigroup<A>(ord: Ord<A>): Semigroup<A> {
  return {
    concat: min(ord)
  }
}

export function getJoinSemigroup<A>(ord: Ord<A>): Semigroup<A> {
  return {
    concat: max(ord)
  }
}

// Let's rewrite our example for min/max functions, because they are also cases when semigroup can be used
const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber)
console.assert(semigroupMin.concat(1, 2) === 1)

const semigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber)
console.assert(semigroupMax.concat(1, 2) === 2)


// We already tried Eq for complex types, what about semigroups?

// Let's write function to sum Point objects (sum x and y values)

type Point = {
  readonly x: number
  readonly y: number
}

// Already familiar construction from last examples
const eqPoint: Eq<Point> = getStructEq<Point>({
  x: eqNumber,
  y: eqNumber
})

// Imperative way
const sumPoints = (p1: Point, p2: Point) => {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  }
}

console.assert(eqPoint.equals(sumPoints({ x: 1, y: 2 }, { x: 3, y: 4 }), { x: 4, y: 6 }))

// Functional way (just use combinator like we did before)
const semigroupPoint: Semigroup<Point> = getStructSemigroup<Point>({
  x: semigroupSum,
  y: semigroupSum
})


console.assert(eqPoint.equals(semigroupPoint.concat({ x: 1, y: 2 }, { x: 3, y: 4 }), { x: 4, y: 6 }))

type Vector = {
  readonly from: Point
  readonly to: Point
}

const eqVector: Eq<Vector> = getStructEq<Vector>({
  from: eqPoint,
  to: eqPoint
})

const semigroupVector: Semigroup<Vector> = getStructSemigroup<Vector>({
  from: semigroupPoint,
  to: semigroupPoint
})

console.assert(eqVector.equals(semigroupVector.concat({ from: { x: 1, y: 2 }, to: { x: 2, y: 3 } }, { from: { x: 4, y: 5 }, to: { x: 6, y: 7 } }), { from: { x: 5, y: 7 }, to: { x: 8, y: 10 } }))


// We can even build Semigroup of function (in this case boolean conjunction of functions results)
type PointPredicate = Predicate<Point>
const semigroupPredicate: Semigroup<PointPredicate> = getFunctionSemigroup(semigroupAll)<Point>()

// Let's verify that both Point attributes are positive
const isPositive: Predicate<number> = n => n >= 0
const isPositiveX: PointPredicate = p => isPositive(p.x)
const isPositiveY: PointPredicate = p => isPositive(p.y)

const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY)

console.assert(isPositiveXY({ x: 1, y: 1 }))
console.assert(!isPositiveXY({ x: 1, y: -1 }))
console.assert(isPositiveXY({ x: 0, y: 0 }))
console.assert(!isPositiveXY({ x: -1, y: 1 }))
console.assert(!isPositiveXY({ x: -1, y: -1 }))


// Semigroups work only with 2 elements, but what if we need more?
// The fold function takes a semigroup instance, an initial value and an array of elements

// Sum array of numbers
const sum = fold(semigroupSum)
console.assert(sum(0, [1, 2, 3, 4]) === 10)

// Multiply array of numbers
const product = fold(semigroupProduct)
console.assert(product(1, [1, 2, 3, 4]) === 24)





// Semigroups for type constructors
// For example: A => Option<A> - is a type constructor

// What if we want to merge two Option<A>?

// concat(none, none) = none
// concat(none, some(a)) = none
// concat(some(a), none) = none
// concat(some(a), some(b)) = ? - we need some merge function here

// But wait! Merging - it is what Semigroup does!
// So if we give semigroup for A - we can derive Semigroup for Option<A>

const sumOpts = getApplySemigroup(semigroupSum)

const E = getOptionEq(eqNumber)
console.assert(E.equals(sumOpts.concat(some(1), none), none))
console.assert(E.equals(sumOpts.concat(some(1), some(2)), some(3)))


// Another example with merging structures! For example we want to merge duplicate records using some strategy.


type Customer = {
  readonly name: string
  // tslint:disable-next-line:readonly-array
  readonly favouriteThings: Array<string>
  readonly registeredAt: number // since epoch
  readonly lastUpdatedAt: number // since epoch
  readonly hasMadePurchase: boolean
}

// We just need to use combinators that we've learned before!

const semigroupCustomer: Semigroup<Customer> = getStructSemigroup<Customer>({
  // Keep longer name
  name: getJoinSemigroup(contramap((s: string) => s.length)(ordNumber)),
  // Join arrays
  favouriteThings: getArraySemigroup(),
  // keep the least recent date
  registeredAt: getMeetSemigroup(ordNumber),
  // keep the most recent date
  lastUpdatedAt: getJoinSemigroup(ordNumber),
  // Boolean semigroup under disjunction
  hasMadePurchase: semigroupAny
})

const mergedResult = semigroupCustomer.concat(
  {
    name: 'Jevgeni',
    favouriteThings: ['math', 'music'],
    registeredAt: new Date(2018, 1, 20).getTime(),
    lastUpdatedAt: new Date(2018, 2, 18).getTime(),
    hasMadePurchase: false
  },
  {
    name: 'Jevgeni Goloborodko',
    favouriteThings: ['functional programming'],
    registeredAt: new Date(2018, 1, 22).getTime(),
    lastUpdatedAt: new Date(2018, 2, 9).getTime(),
    hasMadePurchase: true
  }
)

const expectedResult: Customer = {
  name: 'Jevgeni Goloborodko',
  favouriteThings: [ 'math', 'music', 'functional programming' ],
  registeredAt: 1519077600000 , // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521324000000 , // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true
}

console.assert(JSON.stringify(mergedResult) === JSON.stringify(expectedResult))
