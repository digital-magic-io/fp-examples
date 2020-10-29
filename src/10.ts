import fs from 'fs'
import { chain, io, IO, map } from 'fp-ts/IO'
import { now } from 'fp-ts/Date'
import { Show } from 'fp-ts/Show'
import { pipe } from 'fp-ts/pipeable'

const readFile = (filename: string): IO<string> =>
  io.fromIO(() => fs.readFileSync(filename, 'utf-8'))

const print = (msg: string): IO<string> => io.fromIO(() => {
  console.log(msg)
  return msg
})

// We have to combine:
// reaFile::String => IO string (A => F A)
// and
// print::String => IO string (A => F A)

// print(readFile('README.md')) // won't work

// Chain (flatMap in TS) helps us to compose 2 functions that return value with effect
io.chain(readFile('README.md'), print)

// Unix time command analogue
const time = <A>(ma: IO<A>): IO<readonly [A, number]> =>
  io.chain(now, start => io.chain(ma, a => io.map(now, end => [a, end - start])))

// Show is another FP abstraction that turns whatever what to human readable string
const fileReadResultShow: Show<readonly [string, number]> = {
  show: ([content, timePassed]: readonly [string, number]): string =>
    `${timePassed}ms: ${content.substring(0, 11)}`
}

// Let's compose our functions
const chained = pipe(
  readFile('LICENSE'),
  time,
  map(fileReadResultShow.show),
  chain(print)
)

// Execute whole composed result at once
chained()
