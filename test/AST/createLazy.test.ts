import * as S from "@effect/schema/Schema"
import * as Util from "@effect/schema/test/util"
import { describe, expect, it } from "vitest"

describe("AST/createLazy", () => {
  it("should memoize the thunk", async () => {
    let log = 0
    interface A {
      readonly a: string
      readonly as: ReadonlyArray<A>
    }
    const schema: S.Schema<A> = S.lazy(() => {
      log++
      return S.struct({
        a: S.string,
        as: S.array(schema)
      })
    })
    await Util.expectParseSuccess(schema, { a: "a1", as: [] })
    await Util.expectParseSuccess(schema, { a: "a1", as: [{ a: "a2", as: [] }] })
    expect(log).toEqual(1)
  })
})
