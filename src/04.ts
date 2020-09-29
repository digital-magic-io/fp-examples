import { Eq, getStructEq } from 'fp-ts/Eq'

// Combinator: Eq type instance constructor based on equality function
export function fromEquals<A>(equals: (x: A, y: A) => boolean): Eq<A> {
  return {
    equals: (x, y) => x === y || equals(x, y)
  }
}

// instance for type number
const eqNumber: Eq<number> = fromEquals((x, y) => x === y)
console.assert(eqNumber.equals(1, 1))
console.assert(!eqNumber.equals(1, 2))


// What about Array that has own type?

// In FP we use combinators to derive Eq for more complex types
const getArrayEq = <A>(eq: Eq<A>): Eq<ReadonlyArray<A>> => fromEquals((ax, ay) =>
  // Compare length and each element equality
  ax.length === ay.length && ax.every((v, i) => eq.equals(v, ay[i]))
)

// Array of numbers
const eqArrayOfNumber: Eq<ReadonlyArray<number>> = getArrayEq(eqNumber)
console.assert(eqArrayOfNumber.equals([1, 2, 3], [1, 2, 3]))
console.assert(!eqArrayOfNumber.equals([1, 2, 3], [3, 2, 1]))

// What if we need go deeper? Array of Array of numbers
const eqArrayOfArrayOfNumber: Eq<ReadonlyArray<ReadonlyArray<number>>> = getArrayEq(eqArrayOfNumber)
console.assert(eqArrayOfArrayOfNumber.equals([[1, 2], [3, 4]], [[1, 2], [3, 4]]))



// More complex examples

// Combinator that derives instance for Eq<B> based on instance for Eq<A> and function B => A
const contramap = <A, B>(f: (b: B) => A) => (eq: Eq<A>): Eq<B> =>
  fromEquals((x, y) => eq.equals(f(x), f(y)))

// Comparing string number representation

// tslint:disable-next-line
const eqStrNum: Eq<string> = contramap(Number.parseInt)(eqNumber)

console.assert(eqStrNum.equals('1', '1'))
console.assert(eqStrNum.equals('01', '001'))
console.assert(eqStrNum.equals('01.0', '001.00'))
console.assert(!eqStrNum.equals('1', '2'))
console.assert(!eqStrNum.equals('1', 'x'))
console.assert(eqStrNum.equals('x', 'x'))

// Comparing entity instances by ID

export interface User {
  readonly id: number
  readonly name: string
}

const eqUser: Eq<User> = contramap((user: User) => user.id)(eqNumber)
console.assert(eqUser.equals({ id: 1, name: 'Vasja' }, { id: 1, name: 'Petja' }))
console.assert(!eqUser.equals({ id: 1, name: 'Vasja' }, { id: 2, name: 'Vasja' }))




// What about comparing structures that must be compared by every field?

type Point = {
  readonly x: number;
  readonly y: number;
}

// Firstly check reference and then values
const eqPoint_ = (a: Point, b: Point) => a === b || a.x === b.x && a.y === b.y
console.assert(eqPoint_({ x: 1, y: 2 }, { x: 1, y: 2 }))
// Imagine 5 or more fields in a structure :)




// And here magic begins :)

const eqPoint: Eq<Point> = getStructEq<Point>({
  x: eqNumber, // compare x using eqNumber (Eq<number>)
  y: eqNumber  // compare y using eqNumber (Eq<number>)
})

console.assert(eqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 }))
console.assert(!eqPoint.equals({ x: 1, y: 2 }, { x: 2, y: 2 }))
console.assert(!eqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 1 }))

// And we can build Eq instance for structure of any complexity even with nesting

type Vector = {
  readonly from: Point;
  readonly to: Point;
}

const eqVector: Eq<Vector> = getStructEq<Vector>({
  from: eqPoint,
  to: eqPoint
})

console.assert(eqVector.equals({ from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }, { from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }))
console.assert(!eqVector.equals({ from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }, { from: { x: 2, y: 2 }, to: { x: 3, y: 3 } }))


// tslint:disable-next-line:readonly-array
const eqArrayOfVector: Eq<Array<Vector>> = getArrayEq(eqVector) // So simple? :)

console.assert(eqArrayOfVector.equals([{ from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }], [{ from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }]))
console.assert(!eqArrayOfVector.equals([{ from: { x: 1, y: 2 }, to: { x: 3, y: 3 } }], [{ from: { x: 2, y: 2 }, to: { x: 3, y: 3 } }]))

// Notice that I must write lesser code in more complex examples, because I re-use my code as much as possible
