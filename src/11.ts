import { getEq, option, Option, some } from 'fp-ts/Option'
import { task, Task } from 'fp-ts/Task'
import { getApplicativeComposition } from 'fp-ts/Applicative'
import { eqNumber } from 'fp-ts/Eq'

const eqOptionString = getEq(eqNumber)

// But we can also do Functor & Applicative composition:

// an Applicative instance for Task<Option<A>>
const A = getApplicativeComposition(task, option)

const x: Task<Option<number>> = task.of(some(1))
const y: Task<Option<number>> = task.of(some(2))

const sum = (a: number) => (b: number): number => a + b

const result: Task<Option<number>> = A.ap(A.map(x, sum), y)

result().then(r => console.assert(eqOptionString.equals(r, some(3))))
