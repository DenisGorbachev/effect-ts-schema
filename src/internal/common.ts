/**
 * @since 1.0.0
 */

import type * as AST from "../AST"

// ---------------------------------------------
// hooks
// ---------------------------------------------

/** @internal */
export const ArbitraryHookId = Symbol.for("@effect/schema/ArbitraryHookId")

/** @internal */
export const PrettyHookId = Symbol.for("@effect/schema/PrettyHookId")

// ---------------------------------------------
// Schema APIs
// ---------------------------------------------

/** @internal */
export const getKeysForIndexSignature = (
  input: { readonly [x: PropertyKey]: unknown },
  parameter: AST.Parameter
): ReadonlyArray<string> | ReadonlyArray<symbol> => {
  switch (parameter._tag) {
    case "StringKeyword":
    case "TemplateLiteral":
      return Object.keys(input)
    case "SymbolKeyword":
      return Object.getOwnPropertySymbols(input)
    case "Refinement":
      return getKeysForIndexSignature(input, parameter.from)
  }
}

// ---------------------------------------------
// general helpers
// ---------------------------------------------

/** @internal */
export const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER)

/** @internal */
export const minSafeInteger = BigInt(Number.MIN_SAFE_INTEGER)

/** @internal */
export const ownKeys = (o: object): ReadonlyArray<PropertyKey> =>
  (Object.keys(o) as ReadonlyArray<PropertyKey>).concat(Object.getOwnPropertySymbols(o))

/** @internal */
export const memoizeThunk = <A>(f: () => A): () => A => {
  let done = false
  let a: A
  return () => {
    if (done) {
      return a
    }
    a = f()
    done = true
    return a
  }
}
