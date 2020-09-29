import { Functor1 } from 'fp-ts/Functor'
import { Eq, eqNumber, eqStrict, eqString, getStructEq } from 'fp-ts/Eq'
import { getEq } from 'fp-ts/Record'

export const URI = 'Response'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>
  }
}

export interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

function mapResponse<A, B>(r: Response<A>, f: (a: A) => B): Response<B> {
  return { ...r, body: f(r.body) }
}

const functorResponse: Functor1<URI> = {
  URI,
  map: mapResponse
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

const targetResp: Response<number> = functorResponse.map(resp, body => body.length)

const expectedResp: Response<number> = {
  url: 'http://devclub.eu',
  status: 200,
  headers: { 'ContentType': 'html/text' },
  body: 14
}

console.assert(eqResp.equals(targetResp, expectedResp))
