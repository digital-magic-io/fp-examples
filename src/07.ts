import { Semigroup } from 'fp-ts/lib/Semigroup'
import { fold, getStructMonoid, Monoid } from 'fp-ts/Monoid'
import { getApplyMonoid, getEq, getFirstMonoid, getLastMonoid, none, Option, some } from 'fp-ts/Option'
import { eqNumber } from 'fp-ts/Eq'

// Most of Semigroup examples were actually Monoids:

// number `Monoid` under addition
const monoidSum: Monoid<number> = {
  concat: (x, y) => x + y,
  empty: 0
}

// number `Monoid` under multiplication
const monoidProduct: Monoid<number> = {
  concat: (x, y) => x * y,
  empty: 1
}

// string `Monoid` under concatenation
const monoidString: Monoid<string> = {
  concat: (x, y) => x + y,
  empty: ''
}

// boolean monoid under conjunction
const monoidAll: Monoid<boolean> = {
  concat: (x, y) => x && y,
  empty: true
}

// boolean monoid under disjunction
const monoidAny: Monoid<boolean> = {
  concat: (x, y) => x || y,
  empty: false
}


// But not every Semigroup can be monoid:
const semigroupSpace: Semigroup<string> = {
  concat: (x, y) => x + ' ' + y
}
console.assert(semigroupSpace.concat('a', 'b') === 'a b')

// We can't find an empty value such that: concat(x, empty) = x
// So, Monoids are more restrictive

// Monoid have the same set of combinators like Semigroup has:
// getStructMonoid - we used to sum Points and Vectors
// getJoinMonoid/getMeetMonoid - for min/max value retrieval



// Folding becomes even easier (we don't need provide initial value, because `empty` will be used instead):
console.assert(fold(monoidSum)([1, 2, 3, 4]) === 10)
console.assert(fold(monoidProduct)([1, 2, 3, 4]) === 24)
console.assert(fold(monoidString)(['a', 'b', 'c']) === 'abc')
console.assert(!fold(monoidAll)([true, false, true]))
console.assert(fold(monoidAny)([true, false, true]))



// Monoids for type constructors (remember: getApplySemigroup)

const MS = getApplyMonoid(monoidSum)
const E = getEq(eqNumber)

console.assert(E.equals(MS.concat(some(1), none), none))
console.assert(E.equals(MS.concat(some(1), some(2)), some(3)))
// Remember the rule: concat(x, empty) = x
console.assert(E.equals(MS.concat(some(1), MS.empty), some(1)))


// Always take most left non-None value:
const MF = getFirstMonoid<number>()

console.assert(E.equals(MF.concat(some(1), none), some(1)))
console.assert(E.equals(MF.concat(some(1), some(2)), some(1)))
console.assert(E.equals(MF.concat(none, some(2)), some(2)))

// And it's dual getLastMonoid that takes most right non-None value


// Useful example: We must merge environment and user settings where user's ones override environment if set

type Settings = {
  readonly language: Option<string> // 'en', 'ru', 'ee', etc.
  readonly timezone: Option<number> // +2, -2, etc.
  readonly twoFactorAuth: Option<boolean>
}

const envSettings: Settings = {
  language: some('en'),
  timezone: none,
  twoFactorAuth: some(false)
}

const userSettings: Settings = {
  language: some('ru'),
  timezone: some(-2),
  twoFactorAuth: none
}

const monoidSettings: Monoid<Settings> = getStructMonoid<Settings>({
  language: getLastMonoid<string>(),
  timezone: getLastMonoid<number>(),
  twoFactorAuth: getLastMonoid<boolean>()
})

const mergedSettings: Settings = {
  language: some('ru'),
  timezone: some(-2),
  twoFactorAuth: some(false)
}

console.assert(JSON.stringify(monoidSettings.concat(userSettings, envSettings)), JSON.stringify(mergedSettings))
