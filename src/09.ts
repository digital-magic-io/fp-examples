import { getEq, isNone, none, Option, some } from 'fp-ts/Option'
import { eqString } from 'fp-ts/Eq'

// unary operation: number => string
const fmapUnary: (a: number) => string = String

// The very simple Functor example: Option Functor (without HKT for easier understanding)
type OptionFunctor = {
  readonly map: <A, B>(fa: Option<A>, f: (a: A) => B) => Option<B>
}

// Option Functor implementation
const OF: OptionFunctor = {
  map: (fa, f) => isNone(fa) ? none : some(f(fa.value))
}

const functorResult: Option<string> = OF.map(some(1), fmapUnary)

const eqOptionString = getEq(eqString)
console.assert(eqOptionString.equals(functorResult, some('1')))

// binary operation: number => number => string
const fmapBinary: (a: number) => (b: number) => string = a => b => fmapUnary(a + b)

const functorResultBinary: Option<(b: number) => string> = OF.map(some(2), fmapBinary)

// Option Apply definition
type OptionApply = OptionFunctor & {
  readonly ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>) => Option<B>
}

// Option Apply implementation
const OAp: OptionApply = {
  map: OF.map,
  ap: (fab, fa) => isNone(fab) ? none : OAp.map(fa, fab.value)
}

const applyResult = OAp.ap(functorResultBinary, some(1))
console.assert(eqOptionString.equals(applyResult, some('3')))

// Option Applicative definition
type OptionApplicative = OptionApply & {
  readonly of: <A>(a: A) => Option<A>
}

// Option Applicative implementation
const OA: OptionApplicative = {
  map: OAp.map,
  ap: OAp.ap,
  of: some
}

const applicativeResult = OA.ap(OA.map(OA.of(2), fmapBinary), OA.of(1))
console.assert(eqOptionString.equals(applicativeResult, some('3')))





// What if we have more complicated case with 3 params?
const fmapTernary: (a: number) => (b: number) => (c: number) => string
  = a => b => c => fmapUnary(a + b + c)

const result = OA.ap(OA.ap(OA.map(OA.of(2), fmapTernary), OA.of(3)), OA.of(5))
console.assert(eqOptionString.equals(result, some('10')))


// It looks like very inconvenient solution,
// so let's define helper functions that use our Apply Functor for combination



const F = OAp

// Unary operation
const liftA1 = <A, B>(f: (a: A) => B) => (fb: Option<A>): Option<B> => F.map(fb, f)
const liftedA1 = liftA1(fmapUnary)
console.assert(eqOptionString.equals(liftedA1(some(1)), some('1')))

// Binary operation
const liftA2 = <A, B, C>(f: (a: A) => (b: B) => C) => (a: Option<A>, b: Option<B>): Option<C> => F.ap(F.map(a, f), b)
const liftedA2 = liftA2(fmapBinary)
console.assert(eqOptionString.equals(liftedA2(some(1), some(2)), some('3')))

// Ternary operation
const liftA3 = <A, B, C, D>(f: (a: A) => (b: B) => (c: C) => D) => (a: Option<A>, b: Option<B>, c: Option<C>): Option<D> =>
  F.ap(F.ap(F.map(a, f), b), c)
const liftedA3 = liftA3(fmapTernary)
console.assert(eqOptionString.equals(liftedA3(some(2), some(3), some(5)), some('5')))
