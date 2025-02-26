import * as Brand from "effect/Brand"
import { pipe, identity } from "effect/Function";
import * as S from "@effect/schema/Schema";
import * as ParseResult from "@effect/schema/ParseResult";

// ---------------------------------------------
// From
// ---------------------------------------------

// $ExpectType never
export type FromNever = S.Schema.From<typeof S.never>

// ---------------------------------------------
// To
// ---------------------------------------------

// $ExpectType never
export type ToNever = S.Schema.To<typeof S.never>

// ---------------------------------------------
// Primitives
// ---------------------------------------------

// $ExpectType Schema<void, void>
S.void;

// $ExpectType Schema<undefined, undefined>
S.undefined;

// $ExpectType Schema<string, string>
S.string;

// $ExpectType Schema<number, number>
S.number;

// $ExpectType Schema<boolean, boolean>
S.boolean;

// $ExpectType Schema<bigint, bigint>
S.bigintFromSelf;

// $ExpectType Schema<string, bigint>
S.bigint;

// $ExpectType Schema<symbol, symbol>
S.symbolFromSelf;

// $ExpectType Schema<string, symbol>
S.symbol;

// $ExpectType Schema<unknown, unknown>
S.unknown;

// $ExpectType Schema<any, any>
S.any;

// $ExpectType Schema<object, object>
S.object;

// ---------------------------------------------
// literals
// ---------------------------------------------

// $ExpectType Schema<null, null>
S.null;

// $ExpectType Schema<never, never>
S.literal();

// $ExpectType Schema<"a", "a">
S.literal("a");

// $ExpectType Schema<"a" | "b" | "c", "a" | "b" | "c">
S.literal("a", "b", "c");

// $ExpectType Schema<1, 1>
S.literal(1);

// $ExpectType Schema<2n, 2n>
S.literal(2n); // bigint literal

// $ExpectType Schema<true, true>
S.literal(true);

// ---------------------------------------------
// strings
// ---------------------------------------------

// $ExpectType Schema<string, string>
pipe(S.string, S.maxLength(5));

// $ExpectType Schema<string, string>
pipe(S.string, S.minLength(5));

// $ExpectType Schema<string, string>
pipe(S.string, S.length(5));

// $ExpectType Schema<string, string>
pipe(S.string, S.pattern(/a/));

// $ExpectType Schema<string, string>
pipe(S.string, S.startsWith('a'));

// $ExpectType Schema<string, string>
pipe(S.string, S.endsWith('a'));

// $ExpectType Schema<string, string>
pipe(S.string, S.includes('a'));

// $ExpectType Schema<number, number>
pipe(S.number, S.greaterThan(5));

// $ExpectType Schema<number, number>
pipe(S.number, S.greaterThanOrEqualTo(5));

// $ExpectType Schema<number, number>
pipe(S.number, S.lessThan(5));

// $ExpectType Schema<number, number>
pipe(S.number, S.lessThanOrEqualTo(5));

// $ExpectType Schema<number, number>
pipe(S.number, S.int());

// $ExpectType Schema<number, number>
pipe(S.number, S.nonNaN()); // not NaN

// $ExpectType Schema<number, number>
pipe(S.number, S.finite()); // value must be finite, not Infinity or -Infinity

// ---------------------------------------------
// Native enums
// ---------------------------------------------

enum Fruits {
  Apple,
  Banana,
}

// $ExpectType Schema<Fruits, Fruits>
S.enums(Fruits);

//
// Nullables
//

// $ExpectType Schema<string | null, string | null>
S.nullable(S.string)

// $ExpectType Schema<string | null, number | null>
S.nullable(S.NumberFromString)

// ---------------------------------------------
// Unions
// ---------------------------------------------

// $ExpectType Schema<string | number, string | number>
S.union(S.string, S.number);

// $ExpectType Schema<string | boolean, number | boolean>
S.union(S.boolean, S.NumberFromString);

// ---------------------------------------------
// keyof
// ---------------------------------------------

// $ExpectType Schema<"a" | "b", "a" | "b">
S.keyof(S.struct({ a: S.string,  b: S.NumberFromString }));

// ---------------------------------------------
// Tuples
// ---------------------------------------------

// $ExpectType Schema<readonly [string, number], readonly [string, number]>
S.tuple(S.string, S.number);

// $ExpectType Schema<readonly [string, string], readonly [string, number]>
S.tuple(S.string, S.NumberFromString);

// ---------------------------------------------
// rest
// ---------------------------------------------

// $ExpectType Schema<readonly [string, number, ...boolean[]], readonly [string, number, ...boolean[]]>
pipe(S.tuple(S.string, S.number), S.rest(S.boolean))

// $ExpectType Schema<readonly [string, string, ...string[]], readonly [string, number, ...number[]]>
pipe(S.tuple(S.string, S.NumberFromString), S.rest(S.NumberFromString))

// ---------------------------------------------
// element
// ---------------------------------------------

// $ExpectType Schema<readonly [string, number, boolean], readonly [string, number, boolean]>
pipe(S.tuple(S.string, S.number), S.element(S.boolean))

// $ExpectType Schema<readonly [string, string, string], readonly [string, number, number]>
pipe(S.tuple(S.string, S.NumberFromString), S.element(S.NumberFromString))

// ---------------------------------------------
// optionalElement
// ---------------------------------------------

// $ExpectType Schema<readonly [string, number, boolean?], readonly [string, number, boolean?]>
pipe(S.tuple(S.string, S.number), S.optionalElement(S.boolean))

// $ExpectType Schema<readonly [string, string, string?], readonly [string, number, number?]>
pipe(S.tuple(S.string, S.NumberFromString), S.optionalElement(S.NumberFromString))

// ---------------------------------------------
// Arrays
// ---------------------------------------------

// $ExpectType Schema<readonly number[], readonly number[]>
S.array(S.number);

// $ExpectType Schema<readonly string[], readonly number[]>
S.array(S.NumberFromString);

// $ExpectType Schema<readonly [number, ...number[]], readonly [number, ...number[]]>
S.nonEmptyArray(S.number);

// $ExpectType Schema<readonly [string, ...string[]], readonly [number, ...number[]]>
S.nonEmptyArray(S.NumberFromString);

// ---------------------------------------------
// Structs
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; }, { readonly a: string; readonly b: number; }>
S.struct({ a: S.string,  b: S.number });

// $ExpectType Schema<{ readonly a: string; readonly b: string; }, { readonly a: string; readonly b: number; }>
const MyModel = S.struct({ a: S.string,  b: S.NumberFromString });

// $ExpectType { readonly a: string; readonly b: string; }
export type MyModelFrom = S.Schema.From<typeof MyModel>

// $ExpectType { readonly a: string; readonly b: number; }
export type MyModelTo = S.Schema.To<typeof MyModel>

// $ExpectType Schema<{ readonly a: never; }, { readonly a: never; }>
S.struct({ a: S.never })

// ---------------------------------------------
// optional
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: boolean; }, { readonly a: string; readonly b: number; readonly c?: boolean; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.boolean) });

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: string; }, { readonly a: string; readonly b: number; readonly c?: number; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.NumberFromString) });

// piping
// $ExpectType Schema<{ readonly a?: string; }, { readonly a?: string; }>
S.struct({ a: pipe(S.string, S.optional) })

// $ExpectType Schema<{ readonly a?: never; }, { readonly a?: never; }>
 S.struct({ a: S.optional(S.never) })

// ---------------------------------------------
// optional().withDefault()
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: boolean; }, { readonly a: string; readonly b: number; readonly c: boolean; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.boolean).withDefault(() => false) });

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: string; }, { readonly a: string; readonly b: number; readonly c: number; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.NumberFromString).withDefault(() => 0) });

// piping
// $ExpectType Schema<{ readonly a?: string; }, { readonly a: string; }>
S.struct({ a: pipe(S.string, S.optional).withDefault(() => '') })

// ---------------------------------------------
// optional().toOption()
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: boolean; }, { readonly a: string; readonly b: number; readonly c: Option<boolean>; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.boolean).toOption() });

// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: string; }, { readonly a: string; readonly b: number; readonly c: Option<number>; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.NumberFromString).toOption() });

// piping
// $ExpectType Schema<{ readonly a?: string; }, { readonly a: Option<string>; }>
S.struct({ a: pipe(S.string, S.optional).toOption() })

// ---------------------------------------------
// pick
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.string,  b: S.number, c: S.boolean }), S.pick('a', 'b'));

// $ExpectType Schema<{ readonly a: string; readonly b: string; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.string,  b: S.NumberFromString, c: S.boolean }), S.pick('a', 'b'));

// ---------------------------------------------
// pick - optional
// ---------------------------------------------

// $ExpectType Schema<{ readonly a?: string; readonly b: number; }, { readonly a?: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string),  b: S.number, c: S.boolean }), S.pick('a', 'b'));

// $ExpectType Schema<{ readonly a?: string; readonly b: string; }, { readonly a?: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string),  b: S.NumberFromString, c: S.boolean }), S.pick('a', 'b'));

// $ExpectType Schema<{ readonly a?: string; readonly b: string; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string).withDefault(() => ''),  b: S.NumberFromString, c: S.boolean }), S.pick('a', 'b'));

// ---------------------------------------------
// omit
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.string,  b: S.number, c: S.boolean }), S.omit('c'));

// $ExpectType Schema<{ readonly a: string; readonly b: string; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.string,  b: S.NumberFromString, c: S.boolean }), S.omit('c'));

// ---------------------------------------------
// omit - optional
// ---------------------------------------------

// $ExpectType Schema<{ readonly a?: string; readonly b: number; }, { readonly a?: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string),  b: S.number, c: S.boolean }), S.omit('c'));

// $ExpectType Schema<{ readonly a?: string; readonly b: string; }, { readonly a?: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string),  b: S.NumberFromString, c: S.boolean }), S.omit('c'));

// $ExpectType Schema<{ readonly a?: string; readonly b: string; }, { readonly a: string; readonly b: number; }>
pipe(S.struct({ a: S.optional(S.string).withDefault(() => ''),  b: S.NumberFromString, c: S.boolean }), S.omit('c'));

// ---------------------------------------------
// brand
// ---------------------------------------------

// $ExpectType BrandSchema<number, number & Brand<"Int">>
pipe(S.number, S.int(), S.brand('Int'))

// $ExpectType BrandSchema<string, number & Brand<"Int">>
pipe(S.NumberFromString, S.int(), S.brand('Int'))

// ---------------------------------------------
// Partial
// ---------------------------------------------

// $ExpectType Schema<{ readonly a?: string; readonly b?: number; }, { readonly a?: string; readonly b?: number; }>
S.partial(S.struct({ a: S.string,  b: S.number }));

// $ExpectType Schema<{ readonly a?: string; readonly b?: string; }, { readonly a?: string; readonly b?: number; }>
S.partial(S.struct({ a: S.string,  b: S.NumberFromString }));

// ---------------------------------------------
// Required
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: number; }, { readonly a: string; readonly b: number; }>
S.required(S.struct({ a: S.optional(S.string),  b: S.optional(S.number) }));

// $ExpectType Schema<{ readonly b: string; readonly a: string; readonly c: string; }, { readonly b: number; readonly a: string; readonly c: number; }>
S.required(S.struct({ a: S.optional(S.string),  b: S.NumberFromString, c: S.optional(S.NumberFromString) }));

// ---------------------------------------------
// Records
// ---------------------------------------------

// $ExpectType Schema<{ readonly [x: string]: string; }, { readonly [x: string]: string; }>
S.record(S.string, S.string)

// $ExpectType Schema<{ readonly [x: string]: string; }, { readonly [x: string]: number; }>
S.record(S.string, S.NumberFromString)

// $ExpectType Schema<{ readonly [x: string]: string; }, { readonly [x: string]: string; }>
S.record(pipe(S.string, S.minLength(2)), S.string)

// $ExpectType Schema<{ readonly a: string; readonly b: string; }, { readonly a: string; readonly b: string; }>
S.record(S.union(S.literal('a'), S.literal('b')), S.string)

// $ExpectType Schema<{ readonly [x: symbol]: string; }, { readonly [x: symbol]: string; }>
S.record(S.symbolFromSelf, S.string)

// $ExpectType Schema<{ readonly [x: `a${string}`]: string; }, { readonly [x: `a${string}`]: string; }>
S.record(S.templateLiteral(S.literal('a'), S.string), S.string)

// $ExpectType Schema<{ readonly [x: string]: string; }, { readonly [x: string & Brand<"UserId">]: string; }>
S.record(S.string.pipe(S.brand('UserId')), S.string)

// $ExpectType Schema<{ readonly [x: string]: string; }, { readonly [x: string & Brand<symbol>]: string; }>
S.record(S.string.pipe(S.brand(Symbol.for('UserId'))), S.string)

// ---------------------------------------------
// Extend
// ---------------------------------------------

// $ExpectType Schema<{ readonly a: string; readonly b: string; readonly c: string; }, { readonly a: string; readonly b: string; readonly c: string; }>
pipe(
  S.struct({ a: S.string, b: S.string }),
  S.extend(S.struct({ c: S.string })),
);

// dual
// $ExpectType Schema<{ readonly a: string; readonly b: string; readonly c: string; }, { readonly a: string; readonly b: string; readonly c: string; }>
S.extend(S.struct({ a: S.string, b: S.string }), S.struct({ c: S.string }));

// TODO: wait for ts `readonly` fix
// // $ExpectType Schema<{ readonly [x: string]: string; readonly a: string; readonly b: string; readonly c: string; }, { readonly [x: string]: string; readonly a: string; readonly b: string; readonly c: string; }>
// pipe(
//   S.struct({ a: S.string, b: S.string }),
//   S.extend(S.struct({ c: S.string })),
//   S.extend(S.record(S.string, S.string))
// );

// ---------------------------------------------
// lazy
// ---------------------------------------------

interface LazyTo1 {
  readonly a: number
  readonly as: ReadonlyArray<LazyTo1>
}
const lazy1: S.Schema<LazyTo1> = S.lazy(() =>
  S.struct({
    a: S.number,
    as: S.array(lazy1)
  })
)

interface LazyFrom2 {
  readonly a: string
  readonly as: ReadonlyArray<LazyFrom2>
}
interface LazyTo2 {
  readonly a: number
  readonly as: ReadonlyArray<LazyTo2>
}
const lazy2: S.Schema<LazyFrom2, LazyTo2> = S.lazy(() =>
  S.struct({
    a: S.NumberFromString,
    as: S.array(lazy2)
  })
)

// ---------------------------------------------
// optionFromSelf
// ---------------------------------------------

// $ExpectType Schema<Option<number>, Option<number>>
S.optionFromSelf(S.number)

// $ExpectType Schema<Option<string>, Option<number>>
S.optionFromSelf(S.NumberFromString)

// ---------------------------------------------
// optionFromNullable
// ---------------------------------------------

// $ExpectType Schema<number | null, Option<number>>
S.optionFromNullable(S.number)

// $ExpectType Schema<string | null, Option<number>>
S.optionFromNullable(S.NumberFromString)

// ---------------------------------------------
// instanceOf
// ---------------------------------------------

class Test {
  constructor(readonly name: string) {}
}

// $ExpectType Schema<Test, Test>
S.instanceOf(Test);

// ---------------------------------------------
// Template literals
// ---------------------------------------------

// $ExpectType Schema<`a${string}`, `a${string}`>
S.templateLiteral(S.literal('a'), S.string)

// example from https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
const EmailLocaleIDs = S.literal("welcome_email", "email_heading")
const FooterLocaleIDs = S.literal("footer_title", "footer_sendoff")

// $ExpectType Schema<"welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id", "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id">
S.templateLiteral(S.union(EmailLocaleIDs, FooterLocaleIDs), S.literal("_id"))

// ---------------------------------------------
// attachPropertySignature
// ---------------------------------------------

// $ExpectType Schema<{ readonly radius: number; }, { readonly radius: number; readonly kind: "circle"; }>
pipe(S.struct({ radius: S.number }), S.attachPropertySignature("kind", "circle"))

// $ExpectType Schema<{ readonly radius: string; }, { readonly radius: number; readonly kind: "circle"; }>
pipe(S.struct({ radius: S.NumberFromString }), S.attachPropertySignature("kind", "circle"))

// ---------------------------------------------
// filter
// ---------------------------------------------

const predicateFilter1 = (u: unknown) => typeof u === 'string'
const FromFilter = S.union(S.string, S.number)

// $ExpectType Schema<string | number, string | number>
pipe(FromFilter, S.filter(predicateFilter1))

const FromRefinement = S.struct({ a: S.optional(S.string), b: S.optional(S.number) })

// $ExpectType Schema<{ readonly a?: string; readonly b?: number; }, { readonly a?: string; readonly b?: number; } & { readonly b: number; }>
pipe(FromRefinement, S.filter(S.is(S.struct({ b: S.number }))))

const LiteralFilter = S.literal('a', 'b')
const predicateFilter2 = (u: unknown): u is 'a' => typeof u === 'string' && u === 'a'

// $ExpectType Schema<"a" | "b", "a">
pipe(LiteralFilter, S.filter(predicateFilter2))

// $ExpectType Schema<"a" | "b", "a">
pipe(LiteralFilter, S.filter(S.is(S.literal('a'))))

// $ExpectType Schema<"a" | "b", never>
pipe(LiteralFilter, S.filter(S.is(S.literal('c'))))

declare const UnionFilter: S.Schema<{ readonly a: string } | { readonly b: string }>

// $ExpectType Schema<{ readonly a: string; } | { readonly b: string; }, ({ readonly a: string; } | { readonly b: string; }) & { readonly b: string; }>
pipe(UnionFilter, S.filter(S.is(S.struct({ b: S.string }))))

// $ExpectType Schema<number, number & Brand<"MyNumber">>
pipe(S.number, S.filter((n): n is number & Brand.Brand<"MyNumber"> => n > 0))

// ---------------------------------------------
// compose
// ---------------------------------------------

// plain

// $ExpectType Schema<string, readonly number[]>
S.compose(S.split(S.string, ","), S.array(S.NumberFromString))

// $ExpectType Schema<string, readonly number[]>
S.split(S.string, ",").pipe(S.compose(S.array(S.NumberFromString)))

// decoding

// $ExpectType Schema<string | null, number>
S.compose(S.union(S.null, S.string), S.NumberFromString)

// $ExpectType Schema<string | null, number>
S.union(S.null, S.string).pipe(S.compose(S.NumberFromString))

// encoding

// $ExpectType Schema<string, number | null>
S.compose(S.NumberFromString, S.union(S.null, S.number))

// $ExpectType Schema<string, number | null>
S.NumberFromString.pipe(S.compose(S.union(S.null, S.number)))

// ---------------------------------------------
// fromBrand
// ---------------------------------------------

type Eur = number & Brand.Brand<"Eur">
const Eur = Brand.nominal<Eur>()

// $ExpectType Schema<number, number & Brand<"Eur">>
S.number.pipe(S.fromBrand(Eur))

// ---------------------------------------------
// mutable
// ---------------------------------------------

// $ExpectType Schema<string, string>
S.mutable(S.string)

// $ExpectType Schema<{ a: number; }, { a: number; }>
S.mutable(S.struct({ a: S.number }))

// $ExpectType Schema<{ [x: string]: number; }, { [x: string]: number; }>
S.mutable(S.record(S.string, S.number))

// $ExpectType Schema<string[], string[]>
S.mutable(S.array(S.string))

// $ExpectType Schema<string[] | { a: number; }, string[] | { a: number; }>
S.mutable(S.union(S.struct({ a: S.number }), S.array(S.string)))

// $ExpectType Schema<string[], string[]>
S.mutable(S.array(S.string).pipe(S.maxItems(2)))

// $ExpectType Schema<string[], string[]>
S.mutable(S.lazy(() => S.array(S.string)))

// $ExpectType Schema<string[], string[]>
S.mutable(S.transform(S.array(S.string), S.array(S.string), identity, identity))

// ---------------------------------------------
// transform
// ---------------------------------------------

// $ExpectType Schema<string, number>
S.string.pipe(S.transform(S.number, s => s.length, n => String(n)))

// $ExpectType Schema<string, number>
S.string.pipe(S.transform(S.number, s => s, n => n, { strict: false }))

// @ts-expect-error
S.string.pipe(S.transform(S.number, s => s, n => String(n)))

// @ts-expect-error
S.string.pipe(S.transform(S.number, s => s.length, n => n))

// ---------------------------------------------
// transformOrFail
// ---------------------------------------------

// $ExpectType Schema<string, number>
S.string.pipe(S.transformOrFail(S.number, s => ParseResult.success(s.length), n => ParseResult.success(String(n))))

// $ExpectType Schema<string, number>
S.string.pipe(S.transformOrFail(S.number, s => ParseResult.success(s), n => ParseResult.success(String(n)), { strict: false }))

// @ts-expect-error
S.string.pipe(S.transformOrFail(S.number, s => ParseResult.success(s), n => ParseResult.success(String(n))))

// @ts-expect-error
S.string.pipe(S.transformOrFail(S.number, s => ParseResult.success(s.length), n => ParseResult.success(n)))

// ---------------------------------------------
// split
// ---------------------------------------------

// should support subtypes of `string`
// $ExpectType Schema<`a${string}`, readonly string[]>
S.templateLiteral(S.literal('a'), S.string).pipe(S.split(':'))
