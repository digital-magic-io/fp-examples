import { Functor1 } from 'fp-ts/Functor'
import { Eq, eqNumber, eqStrict, eqString, getStructEq } from 'fp-ts/Eq'
import { getEq } from 'fp-ts/Record'

// URI - keeps pair of TypeClass name and it's type (we'll use it for our functor)
export const URI = 'Response'
export type URI = typeof URI

// TypeScript way to use Higher-Kinded Types. The HKT type represents a type constructor of a kind.
declare module 'fp-ts/lib/HKT' {
  // URItoKind is type-level map,
  // it maps a URI to a concrete data type
  // and is populated using the module augmentation feature:
  // https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  interface URItoKind<A> {
    readonly Response: Response<A> // maps key 'Response' to type Response
  }
}

// Our object that will be used as an effect for A
export interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

// Function that maps Response using function: f: A => B
function map<A, B>(r: Response<A>, f: (a: A) => B): Response<B> {
  return { ...r, body: f(r.body) }
}

// Functor instance for Response
const functorResponse: Functor1<URI> = {
  URI,
  map
}

const resp: Response<string> = {
  url: 'http://devclub.eu',
  status: 200,
  headers: { 'ContentType': 'html/text' },
  body: 'Devclub rules!'
}

const arrayEq = getEq(eqString)

const eqResp: Eq<Response<any>> = getStructEq<Response<any>>({
  url: eqString,
  status: eqNumber,
  headers: arrayEq,
  body: eqStrict
})

// Update initial Response using functor passing function to convert string body to it's length
const targetResp: Response<number> = functorResponse.map(resp, body => body.length)

const expectedResp: Response<number> = {
  url: 'http://devclub.eu',
  status: 200,
  headers: { 'ContentType': 'html/text' },
  body: 14
}

console.assert(eqResp.equals(targetResp, expectedResp))
