<h3 align="center">
  <a href="https://effect-ts.github.io/schema/">
    <img src="./docs/example.png" width="500">
  </a>
</h3>

<p align="center">
Modeling the schema of data structures as first-class values
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@effect/schema">
    <img src="https://img.shields.io/npm/dm/@effect/schema.svg" alt="npm downloads" height="20">
  </a>
</p>

# Introduction

Welcome to the documentation for `@effect/schema`, **a library for defining and using schemas** to validate and transform data in TypeScript.

`@effect/schema` allows you to define a `Schema<I, A>` that provides a blueprint for describing the structure and data types of your data. Once defined, you can leverage this schema to perform a range of operations, including:

| Operation       | Description                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| Parsing         | Convert from `unknown` value to output type `A`.                                     |
| Decoding        | Transforming data from an input type `I`` to an output type `A`.                     |
| Encoding        | Converting data from an output type `A` back to an input type `I`.                   |
| Asserting       | Verifying that a value adheres to the schema's output type `A`.                      |
| Arbitraries     | Generate arbitraries for [fast-check](https://github.com/dubzzz/fast-check) testing. |
| Pretty printing | Support pretty printing for data structures.                                         |
| JSON Schemas    | Create JSON Schemas based on defined schemas.                                        |

If you're eager to learn how to define your first schema, jump straight to the [**Basic usage**](https://github.com/effect-ts/schema#basic-usage) section!

## Understanding Parsing, Decoding, and Encoding

We'll break down these concepts using an example with a `Schema<string, Date>`. This schema serves as a tool to transform a `string` into a `Date` and vice versa.

**Encoding**

When we talk about "encoding," we are referring to the process of changing a `Date` into a `string`. To put it simply, it's the act of converting data from one format to another.

**Decoding**

Conversely, "decoding" entails transforming a `string` back into a `Date`. It's essentially the reverse operation of encoding, where data is returned to its original form.

**Parsing**

Parsing involves two key steps:

1. **Checking:** Initially, we verify that the input data (which is of the `unknown` type) matches the expected structure. In our specific case, this means ensuring that the input is indeed a `string`.

2. **Decoding:** Following the successful check, we proceed to convert the `string` into a `Date`. This process completes the parsing operation, where the data is both validated and transformed.

> [!NOTE]
> As a general rule, schemas should be defined such that encode + decode return the original value.

## The Rule of Schemas: Keeping Encode and Decode in Sync

When working with schemas, there's an important rule to keep in mind: your schemas should be crafted in a way that when you perform both encoding and decoding operations, you should end up with the original value.

In simpler terms, if you encode a value and then immediately decode it, the result should match the original value you started with. This rule ensures that your data remains consistent and reliable throughout the encoding and decoding process.

# Credits

This library was inspired by the following projects:

- [io-ts](https://github.com/gcanti/io-ts)
- [zod](https://github.com/colinhacks/zod)
- [zio-schema](https://github.com/zio/zio-schema)

# Requirements

- TypeScript 5.0 or newer
- The `strict` flag enabled in your `tsconfig.json` file
- The `exactOptionalPropertyTypes` flag enabled in your `tsconfig.json` file
  ```
  {
    // ...
    "compilerOptions": {
      // ...
      "strict": true,
      "exactOptionalPropertyTypes": true
    }
  }
  ```
- Additionally, make sure to install the following packages, as they are peer dependencies. Note that some package managers might not install peer dependencies by default, so you need to install them manually:
  - `effect` package (peer dependency)
  - [fast-check](https://github.com/dubzzz/fast-check) package (peer dependency)

## Understanding `exactOptionalPropertyTypes`

The `@effect/schema` library takes advantage of the `exactOptionalPropertyTypes` option of `tsconfig.json`. This option affects how optional properties are typed (to learn more about this option, you can refer to the official [TypeScript documentation](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)).

Let's delve into this with an example.

**With `exactOptionalPropertyTypes` Enabled**

```ts
import * as Schema from "@effect/schema/Schema";

/*
const schema: Schema.Schema<{
    readonly myfield?: string; // the type is strict
}, {
    readonly myfield?: string; // the type is strict
}>
*/
const schema = Schema.struct({
  myfield: Schema.optional(Schema.string.pipe(Schema.nonEmpty()))
});

Schema.decodeSync(schema)({ myfield: undefined }); // Error: Type 'undefined' is not assignable to type 'string'.ts(2379)
```

Here, notice that the type of `myfield` is strict (`string`), which means the type checker will catch any attempt to assign an invalid value (like `undefined`).

**With `exactOptionalPropertyTypes` Disabled**

If, for some reason, you can't enable the `exactOptionalPropertyTypes` option (perhaps due to conflicts with other third-party libraries), you can still use `@effect/schema`. However, there will be a mismatch between the types and the runtime behavior:

```ts
import * as Schema from "@effect/schema/Schema";

/*
const schema: Schema.Schema<{
    readonly myfield?: string | undefined; // the type is widened to string | undefined
}, {
    readonly myfield?: string | undefined; // the type is widened to string | undefined
}>
*/
const schema = Schema.struct({
  myfield: Schema.optional(Schema.string.pipe(Schema.nonEmpty()))
});

Schema.decodeSync(schema)({ myfield: undefined }); // No type error, but a decoding failure occurs
/*
Error: error(s) found
└─ ["a"]
   └─ Expected string, actual undefined
*/
```

In this case, the type of `myfield` is widened to `string | undefined`, which means the type checker won't catch the invalid value (`undefined`). However, during decoding, you'll encounter an error, indicating that `undefined` is not allowed.

# Getting started

To install the **alpha** version:

```
npm install @effect/schema
```

Additionally, make sure to install the following packages, as they are peer dependencies. Note that some package managers might not install peer dependencies by default, so you need to install them manually:

- `effect` package (peer dependency)
- [fast-check](https://github.com/dubzzz/fast-check) package (peer dependency)

> [!WARNING]
> This package is primarily published to receive early feedback and for contributors, during this development phase we cannot guarantee the stability of the APIs, consider each release to contain breaking changes.

Once you have installed the library, you can import the necessary types and functions from the `@effect/schema/Schema` module.

```ts
import * as S from "@effect/schema/Schema";
```

# Defining a schema

To define a `Schema`, you can use the provided `struct` function to define a new `Schema` that describes an object with a fixed set of properties. Each property of the object is described by a `Schema`, which specifies the data type and validation rules for that property.

For example, consider the following `Schema` that describes a person object with a `name` property of type `string` and an `age` property of type `number`:

```ts
import * as S from "@effect/schema/Schema";

const Person = S.struct({
  name: S.string,
  age: S.number
});
```

You can also use the `union` function to define a `Schema` that describes a value that can be one of a fixed set of types. For example, the following `Schema` describes a value that can be either a `string` or a `number`:

```ts
const StringOrNumber = S.union(S.string, S.number);
```

In addition to the provided `struct` and `union` functions, `@effect/schema/Schema` also provides a number of other functions for defining `Schema`s, including functions for defining arrays, tuples, and records.

## Extracting Inferred Types

After you've defined a `Schema<I, A>`, you can extract the inferred type `A` that represents the data described by the schema using the `Schema.To` type.

For instance, with the `Person` schema we defined earlier, you can extract the inferred type of a `Person` object as demonstrated below:

```ts
import * as S from "@effect/schema/Schema";

interface Person extends S.Schema.To<typeof Person> {}
/*
Equivalent to:
interface Person {
  readonly name: string;
  readonly age: number;
}
*/
```

In cases where `I` differs from `A`, you can also extract the inferred `I` type using `Schema.From`.

## Parsing

To parse a value from the `unknown` type using the previously defined `Schema`, you can make use of the `parse*` functions provided by the `@effect/schema/Schema` module. Let's explore an example using the `parseEither` function:

```ts
import * as S from "@effect/schema/Schema";
import * as Either from "effect/Either";

const Person = S.struct({
  name: S.string,
  age: S.number
});

const parsePerson = S.parseEither(Person);

const input: unknown = { name: "Alice", age: 30 };

const result1 = parsePerson(input);
if (Either.isRight(result1)) {
  console.log(result1.right); // { name: "Alice", age: 30 }
}

const result2 = parsePerson(null);
if (Either.isLeft(result2)) {
  console.log(result2.left);
  /*
  {
  _tag: 'ParseError',
    errors: [
      {
        _tag: 'Type',
        expected: [Object],
        actual: null,
        message: [Object]
      }
    ]
  }
  */
}
```

The `parsePerson` function returns an `Either<ParseError, A>`, where `ParseError` is defined as follows:

```ts
interface ParseError {
  readonly _tag: "ParseError";
  // A non-empty list of errors
  readonly errors: ReadonlyArray.NonEmptyReadonlyArray<ParseErrors>;
}
```

`ParseError` represents a list of errors that may have occurred during the parsing process, and `A` is the inferred data type described by the `Schema`. A successful parse results in a `Right` value, containing the parsed data `A`. In the case of a failed parse, the result will be a `Left` value containing a non-empty list of `ParseErrors`.

Now, let's see another example using the `parseSync` function.

The `parseSync` function is used to parse a value and throw an error if the parsing fails. This is especially useful when you want to ensure that the parsed value adheres to the correct format and are ready to throw an error if it does not.

```ts
try {
  const person = S.parseSync(Person)({});
  console.log(person);
} catch (e) {
  console.error("Parsing failed:");
  console.error(e);
}
/*
Parsing failed:
Error: error(s) found
└─ ["name"]
   └─ is missing
*/
```

In this example, we attempt to parse an empty object, but the `name` property is missing, resulting in an error being thrown.

### Handling Async Transformations

When your schema involves asynchronous transformations, neither the `parseSync` nor the `parseEither` functions will work for you. In such cases, you must turn to the `parse` function, which returns an `Effect`.

```ts
import * as S from "@effect/schema/Schema";
import { Effect } from "effect";

const PersonId = S.number;

const Person = S.struct({
  id: PersonId,
  name: S.string,
  age: S.number
});

const asyncSchema = S.transformOrFail(
  PersonId,
  Person,
  // Simulate an async transformation
  (id) =>
    Effect.succeed({ id, name: "name", age: 18 }).pipe(
      Effect.delay("10 millis")
    ),
  (person) => Effect.succeed(person.id).pipe(Effect.delay("10 millis"))
);

const syncParsePersonId = S.parseEither(asyncSchema);

console.log(JSON.stringify(syncParsePersonId(1), null, 2));
/*
Output:
{
  "_id": "Either",
  "_tag": "Left",
  "left": {
    "_tag": "ParseError",
    "errors": [
      {
        "_tag": "Forbidden"
      }
    ]
  }
}
*/

const asyncParsePersonId = S.parse(asyncSchema);

Effect.runPromise(asyncParsePersonId(1)).then(console.log);
/*
Output:
{ id: 1, name: 'name', age: 18 }
*/
```

As shown in the code above, the first approach returns a `Forbidden` error, indicating that using `parseEither` with an async transformation is not allowed. However, the second approach works as expected, allowing you to handle async transformations and return the desired result.

### Excess properties

When using a `Schema` to parse a value, any properties that are not specified in the `Schema` will be stripped out from the output. This is because the `Schema` is expecting a specific shape for the parsed value, and any excess properties do not conform to that shape.

However, you can use the `onExcessProperty` option (default value: `"ignore"`) to trigger a parsing error. This can be particularly useful in cases where you need to detect and handle potential errors or unexpected values.

Here's an example of how you might use `onExcessProperty`:

```ts
import * as S from "@effect/schema/Schema";

const Person = S.struct({
  name: S.string,
  age: S.number
});

console.log(
  S.parseSync(Person)({
    name: "Bob",
    age: 40,
    email: "bob@example.com"
  })
);
/*
{ name: 'Bob', age: 40 }
*/

S.parseSync(Person)(
  {
    name: "Bob",
    age: 40,
    email: "bob@example.com"
  },
  { onExcessProperty: "error" }
);
/*
throws
Error: error(s) found
└─ ["email"]
   └─ is unexpected
*/
```

### All errors

The `errors` option allows you to receive all parsing errors when attempting to parse a value using a schema. By default only the first error is returned, but by setting the `errors` option to `"all"`, you can receive all errors that occurred during the parsing process. This can be useful for debugging or for providing more comprehensive error messages to the user.

Here's an example of how you might use `errors`:

```ts
import * as S from "@effect/schema/Schema";

const Person = S.struct({
  name: S.string,
  age: S.number
});

S.parseSync(Person)(
  {
    name: "Bob",
    age: "abc",
    email: "bob@example.com"
  },
  { errors: "all", onExcessProperty: "error" }
);
/*
throws
Error: error(s) found
├─ ["email"]
│  └─ is unexpected
└─ ["age"]
   └─ Expected number, actual "abc"
*/
```

## Encoding

To use the `Schema` defined above to encode a value to `unknown`, you can use the `encode` function:

```ts
import * as S from "@effect/schema/Schema";
import * as E from "effect/Either";

// Age is a schema that can decode a string to a number and encode a number to a string
const Age = S.NumberFromString;

const Person = S.struct({
  name: S.string,
  age: Age
});

const encoded = S.encodeEither(Person)({ name: "Alice", age: 30 });
if (E.isRight(encoded)) {
  console.log(encoded.right); // { name: "Alice", age: "30" }
}
```

Note that during encoding, the number value `30` was converted to a string `"30"`.

## Formatting Errors

When you're working with Effect Schema and encounter errors during parsing, decoding, or encoding functions, you can format these errors in two different ways: using the `TreeFormatter` or the `ArrayFormatter`.

### TreeFormatter (default)

The `TreeFormatter` is the default way to format errors. It arranges errors in a tree structure, making it easy to see the hierarchy of issues.

Here's an example of how it works:

```ts
import * as S from "@effect/schema/Schema";
import { formatErrors } from "@effect/schema/TreeFormatter";
import * as E from "effect/Either";

const Person = S.struct({
  name: S.string,
  age: S.number
});

const result = S.parseEither(Person)({});
if (E.isLeft(result)) {
  console.error("Parsing failed:");
  console.error(formatErrors(result.left.errors));
}
/*
Parsing failed:
error(s) found
└─ ["name"]
   └─ is missing
*/
```

### ArrayFormatter

The `ArrayFormatter` is an alternative way to format errors, presenting them as an array of issues. Each issue contains properties such as `_tag`, `path`, and `message`:

```ts
interface Issue {
  readonly _tag: ParseErrors["_tag"];
  readonly path: ReadonlyArray<PropertyKey>;
  readonly message: string;
}
```

Here's an example of how it works:

```ts
import * as S from "@effect/schema/Schema";
import { formatErrors } from "@effect/schema/ArrayFormatter";
import * as E from "effect/Either";

const Person = S.struct({
  name: S.string,
  age: S.number
});

const result = S.parseEither(Person)(
  { name: 1, foo: 2 },
  { errors: "all", onExcessProperty: "error" }
);
if (E.isLeft(result)) {
  console.error("Parsing failed:");
  console.error(formatErrors(result.left.errors));
}
/*
Parsing failed:
[
  {
    _tag: 'Unexpected',
    path: [ 'foo' ],
    message: 'Unexpected value 2'
  },
  {
    _tag: 'Type',
    path: [ 'name' ],
    message: 'Expected string, actual 1'
  },
  { _tag: 'Missing', path: [ 'age' ], message: 'Missing key or index' }
]
*/
```

## Assertions

The `is` function provided by the `@effect/schema/Schema` module represents a way of verifying that a value conforms to a given `Schema`. `is` is a refinement that takes a value of type `unknown` as an argument and returns a `boolean` indicating whether or not the value conforms to the `Schema`.

```ts
import * as S from "@effect/schema/Schema";

const Person = S.struct({
  name: S.string,
  age: S.number
});

// const isPerson: (u: unknown) => u is Person
const isPerson = S.is(Person);

console.log(isPerson({ name: "Alice", age: 30 })); // true
console.log(isPerson(null)); // false
console.log(isPerson({})); // false
```

The `asserts` function takes a `Schema` and returns a function that takes an input value and checks if it matches the schema. If it does not match the schema, it throws an error with a comprehensive error message.

```ts
import * as S from "@effect/schema/Schema";

const Person = S.struct({
  name: S.string,
  age: S.number
});

// const assertsPerson: (input: unknown, options?: ParseOptions) => asserts input is { readonly name: string; readonly age: number; }
const assertsPerson: S.Schema.ToAsserts<typeof Person> = S.asserts(Person);

try {
  assertsPerson({ name: "Alice", age: "30" });
} catch (e) {
  console.error("The input does not match the schema:");
  console.error(e);
}
/*
The input does not match the schema:
Error: error(s) found
└─ ["age"]
   └─ Expected number, actual "30"
*/

// this will not throw an error
assertsPerson({ name: "Alice", age: 30 });
```

## [fast-check](https://github.com/dubzzz/fast-check) arbitraries

The `arbitrary` function provided by the `@effect/schema/Arbitrary` module represents a way of generating random values that conform to a given `Schema`. This can be useful for testing purposes, as it allows you to generate random test data that is guaranteed to be valid according to the `Schema`.

```ts
import { pipe } from "effect/Function";
import * as S from "@effect/schema/Schema";
import * as A from "@effect/schema/Arbitrary";
import * as fc from "fast-check";

const Person = S.struct({
  name: S.string,
  age: S.string.pipe(S.numberFromString, S.int())
});

// Arbitrary for the To type
const PersonArbitraryTo = A.to(Person)(fc);

console.log(fc.sample(PersonArbitraryTo, 2));
/*
[
  { name: 'WJh;`Jz', age: 3.4028216409684243e+38 },
  { name: 'x&~', age: 139480325657985020 }
]
*/

// Arbitrary for the From type
const PersonArbitraryFrom = A.from(Person)(fc);

console.log(fc.sample(PersonArbitraryFrom, 2));
/*
[ { name: 'Q}"H@aT', age: ']P$8w' }, { name: '|', age: '"' } ]
*/
```

## Pretty print

The `to` function provided by the `@effect/schema/Pretty` module represents a way of pretty-printing values that conform to a given `Schema`.

You can use the `to` function to create a human-readable string representation of a value that conforms to a `Schema`. This can be useful for debugging or logging purposes, as it allows you to easily inspect the structure and data types of the value.

```ts
import * as S from "@effect/schema/Schema";
import * as P from "@effect/schema/Pretty";

const Person = S.struct({
  name: S.string,
  age: S.number
});

const PersonPretty = P.to(Person);

// returns a string representation of the object
console.log(PersonPretty({ name: "Alice", age: 30 })); // `{ "name": "Alice", "age": 30 }`
```

## Generating JSON Schemas

The `to` function, which is part of the `@effect/schema/JSONSchema` module, allows you to generate a JSON Schema based on a schema definition:

```ts
import * as S from "@effect/schema/Schema";
import * as JSONSchema from "@effect/schema/JSONSchema";

const Person = S.struct({
  name: S.string,
  age: S.number
});

const jsonSchema = JSONSchema.to(Person);

console.log(JSON.stringify(jsonSchema, null, 2));
/*
Output:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "name",
    "age"
  ],
  "properties": {
    "name": {
      "type": "string",
      "description": "a string",
      "title": "string"
    },
    "age": {
      "type": "number",
      "description": "a number",
      "title": "number"
    }
  },
  "additionalProperties": false
}
*/
```

In this example, we have created a schema for a "Person" with a name (a string) and an age (a number). We then use the `JSONSchema.to` function to generate the corresponding JSON Schema.

### Identifier Annotations

You can enhance your schemas with identifier annotations. If you do, your schema will be included within a "definitions" object property on the root and referenced from there:

```ts
import * as S from "@effect/schema/Schema";

const Name = S.string.pipe(S.identifier("Name"));
const Age = S.number.pipe(S.identifier("Age"));
const Person = S.struct({
  name: Name,
  age: Age
});

const jsonSchema = JSONSchema.to(Person);

console.log(JSON.stringify(jsonSchema, null, 2));
/*
Output:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "name",
    "age"
  ],
  "properties": {
    "name": {
      "$ref": "#/definitions/Name"
    },
    "age": {
      "$ref": "#/definitions/Age"
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Name": {
      "type": "string",
      "description": "a string",
      "title": "string"
    },
    "Age": {
      "type": "number",
      "description": "a number",
      "title": "number"
    }
  }
}
*/
```

This technique helps organize your JSON Schema by creating separate definitions for each identifier annotated schema, making it more readable and maintainable.

### Recursive and Mutually Recursive Schemas

Recursive and mutually recursive schemas are supported, but in these cases, identifier annotations are **required**:

```ts
import * as S from "@effect/schema/Schema";

interface Category {
  readonly name: string;
  readonly categories: ReadonlyArray<Category>;
}

const schema: S.Schema<Category> = S.lazy<Category>(() =>
  S.struct({
    name: S.string,
    categories: S.array(schema)
  })
).pipe(S.identifier("Category"));

const jsonSchema = JSONSchema.to(schema);

console.log(JSON.stringify(jsonSchema, null, 2));
/*
Output:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$ref": "#/definitions/Category",
  "definitions": {
    "Category": {
      "type": "object",
      "required": [
        "name",
        "categories"
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "a string",
          "title": "string"
        },
        "categories": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Category"
          }
        }
      },
      "additionalProperties": false
    }
  }
}
*/
```

In the example above, we define a schema for a "Category" that can contain a "name" (a string) and an array of nested "categories." To support recursive definitions, we use the `S.lazy` function and identifier annotations to name our schema.

This ensures that the JSON Schema properly handles the recursive structure and creates distinct definitions for each annotated schema, improving readability and maintainability.

# Basic usage

## Primitives

```ts
import * as S from "@effect/schema/Schema";

// primitive values
S.string;
S.number;
S.bigint; // Schema<string, bigint>
S.boolean;
S.symbol; // Schema<string, symbol>
S.object;

// empty types
S.undefined;
S.void; // accepts undefined

// catch-all types
// allows any value
S.any;
S.unknown;

// never type
// allows no values
S.never;

S.json;
S.UUID;
S.ULID;
```

## Literals

```ts
S.null; // same as S.literal(null)
S.literal("a");
S.literal("a", "b", "c"); // union of literals
S.literal(1);
S.literal(2n); // bigint literal
S.literal(true);
```

## Template literals

The `templateLiteral` combinator allows you to create a schema for a TypeScript template literal type.

```ts
// $ExpectType Schema<`a${string}`>
S.templateLiteral(S.literal("a"), S.string);

// example from https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
const EmailLocaleIDs = S.literal("welcome_email", "email_heading");
const FooterLocaleIDs = S.literal("footer_title", "footer_sendoff");

// $ExpectType Schema<"welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id">
S.templateLiteral(S.union(EmailLocaleIDs, FooterLocaleIDs), S.literal("_id"));
```

## Filters

**Note**. Please note that the use of filters do not alter the type of the `Schema`. They only serve to add additional constraints to the parsing process.

### String filters

```ts
S.string.pipe(S.maxLength(5));
S.string.pipe(S.minLength(5));
S.string.pipe(nonEmpty()); // same as S.minLength(1)
S.string.pipe(S.length(5));
S.string.pipe(S.pattern(regex));
S.string.pipe(S.startsWith(string));
S.string.pipe(S.endsWith(string));
S.string.pipe(S.includes(searchString));
S.string.pipe(S.trimmed()); // verifies that a string contains no leading or trailing whitespaces
S.string.pipe(S.lowercased()); // verifies that a string is lowercased
```

**Note**: The `trimmed` combinator does not make any transformations, it only validates. If what you were looking for was a combinator to trim strings, then check out the `trim` combinator ot the `Trim` schema.

### Number filters

```ts
S.number.pipe(S.greaterThan(5));
S.number.pipe(S.greaterThanOrEqualTo(5));
S.number.pipe(S.lessThan(5));
S.number.pipe(S.lessThanOrEqualTo(5));
S.number.pipe(S.between(-2, 2)); // -2 <= x <= 2

S.number.pipe(S.int()); // value must be an integer

S.number.pipe(S.nonNaN()); // not NaN
S.number.pipe(S.finite()); // ensures that the value being parsed is finite and not equal to Infinity or -Infinity

S.number.pipe(S.positive()); // > 0
S.number.pipe(S.nonNegative()); // >= 0
S.number.pipe(S.negative()); // < 0
S.number.pipe(S.nonPositive()); // <= 0

S.number.pipe(S.multipleOf(5)); // evenly divisible by 5
```

### Bigint filters

```ts
import * as S from "@effect/schema/Schema";

S.bigint.pipe(S.greaterThanBigint(5n));
S.bigint.pipe(S.greaterThanOrEqualToBigint(5n));
S.bigint.pipe(S.lessThanBigint(5n));
S.bigint.pipe(S.lessThanOrEqualToBigint(5n));
S.bigint.pipe(S.betweenBigint(-2n, 2n)); // -2n <= x <= 2n

S.bigint.pipe(S.positiveBigint()); // > 0n
S.bigint.pipe(S.nonNegativeBigint()); // >= 0n
S.bigint.pipe(S.negativeBigint()); // < 0n
S.bigint.pipe(S.nonPositiveBigint()); // <= 0n
```

### Array filters

```ts
import * as S from "@effect/schema/Schema";

S.array(S.number).pipe(S.maxItems(2)); // max array length
S.array(S.number).pipe(S.minItems(2)); // min array length
S.array(S.number).pipe(S.itemsCount(2)); // exact array length
```

## Branded types

TypeScript's type system is structural, which means that any two types that are structurally equivalent are considered the same. This can cause issues when types that are semantically different are treated as if they were the same.

```ts
type UserId = string
type Username = string

const getUser = (id: UserId) => { ... }

const myUsername: Username = "gcanti"

getUser(myUsername) // works fine
```

In the above example, `UserId` and `Username` are both aliases for the same type, `string`. This means that the `getUser` function can mistakenly accept a `Username` as a valid `UserId`, causing bugs and errors.

To avoid these kinds of issues, the `@effect` ecosystem provides a way to create custom types with a unique identifier attached to them. These are known as "branded types".

```ts
import type * as B from "effect/Brand"

type UserId = string & B.Brand<"UserId">
type Username = string

const getUser = (id: UserId) => { ... }

const myUsername: Username = "gcanti"

getUser(myUsername) // error
```

By defining `UserId` as a branded type, the `getUser` function can accept only values of type `UserId`, and not plain strings or other types that are compatible with strings. This helps to prevent bugs caused by accidentally passing the wrong type of value to the function.

There are two ways to define a schema for a branded type, depending on whether you:

- want to define the schema from scratch
- have already defined a branded type via `effect/Brand` and want to reuse it to define a schema

### Defining a schema from scratch

To define a schema for a branded type from scratch, you can use the `brand` combinator exported by the `@effect/schema/Schema` module. Here's an example:

```ts
import { pipe } from "effect/Function";
import * as S from "@effect/schema/Schema";

const UserId = S.string.pipe(S.brand("UserId"));
type UserId = S.Schema.To<typeof UserId>; // string & Brand<"UserId">
```

Note that you can use `unique symbol`s as brands to ensure uniqueness across modules / packages:

```ts
import { pipe } from "effect/Function";
import * as S from "@effect/schema/Schema";

const UserIdBrand = Symbol.for("UserId");
const UserId = S.string.pipe(S.brand(UserIdBrand));
type UserId = S.Schema.To<typeof UserId>; // string & Brand<typeof UserIdBrand>
```

### Reusing an existing branded type

If you have already defined a branded type using the `effect/Brand` module, you can reuse it to define a schema using the `fromBrand` combinator exported by the `@effect/schema/Schema` module. Here's an example:

```ts
import * as B from "effect/Brand";

// the existing branded type
type UserId = string & B.Brand<"UserId">;
const UserId = B.nominal<UserId>();

import { pipe } from "effect/Function";
import * as S from "@effect/schema/Schema";

// Define a schema for the branded type
const UserIdSchema = S.string.pipe(S.fromBrand(UserId));
```

## Native enums

```ts
enum Fruits {
  Apple,
  Banana
}

// $ExpectType Schema<Fruits>
S.enums(Fruits);
```

## Nullables

```ts
// $ExpectType Schema<string | null>
S.nullable(S.string);
```

## Unions

`@effect/schema/Schema` includes a built-in `union` combinator for composing "OR" types.

```ts
// $ExpectType Schema<string | number>
S.union(S.string, S.number);
```

### Union of literals

While the following is perfectly acceptable:

```ts
// $ExpectType Schema<"a" | "b" | "c">
const schema = S.union(S.literal("a"), S.literal("b"), S.literal("c"));
```

It is possible to use `literal` and pass multiple literals, which is less cumbersome:

```ts
// $ExpectType Schema<"a" | "b" | "c">
const schema = S.literal("a", "b", "c");
```

Under the hood, they are the same, as `literal(...literals)` will be converted into a union.

### Discriminated unions

TypeScript reference: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions

Discriminated unions in TypeScript are a way of modeling complex data structures that may take on different forms based on a specific set of conditions or properties. They allow you to define a type that represents multiple related shapes, where each shape is uniquely identified by a shared discriminant property.

In a discriminated union, each variant of the union has a common property, called the discriminant. The discriminant is a literal type, which means it can only have a finite set of possible values. Based on the value of the discriminant property, TypeScript can infer which variant of the union is currently in use.

Here is an example of a discriminated union in TypeScript:

```ts
type Circle = {
  readonly kind: "circle";
  readonly radius: number;
};

type Square = {
  readonly kind: "square";
  readonly sideLength: number;
};

type Shape = Circle | Square;
```

This code defines a discriminated union using the `@effect/schema` library:

```ts
import * as S from "@effect/schema/Schema";

const Circle = S.struct({
  kind: S.literal("circle"),
  radius: S.number
});

const Square = S.struct({
  kind: S.literal("square"),
  sideLength: S.number
});

const Shape = S.union(Circle, Square);
```

The `literal` combinator is used to define the discriminant property with a specific string literal value.

Two structs are defined for `Circle` and `Square`, each with their own properties. These structs represent the variants of the union.

Finally, the `union` combinator is used to create a schema for the discriminated union `Shape`, which is a union of `Circle` and `Square`.

### How to transform a simple union into a discriminated union

If you're working on a TypeScript project and you've defined a simple union to represent a particular input, you may find yourself in a situation where you're not entirely happy with how it's set up. For example, let's say you've defined a `Shape` union as a combination of `Circle` and `Square` without any special property:

```ts
import * as S from "@effect/schema/Schema";

const Circle = S.struct({
  radius: S.number
});

const Square = S.struct({
  sideLength: S.number
});

const Shape = S.union(Circle, Square);
```

To make your code more manageable, you may want to transform the simple union into a discriminated union. This way, TypeScript will be able to automatically determine which member of the union you're working with based on the value of a specific property.

To achieve this, you can add a special property to each member of the union, which will allow TypeScript to know which type it's dealing with at runtime. Here's how you can transform the `Shape` schema into another schema that represents a discriminated union:

```ts
import * as S from "@effect/schema/Schema";
import { pipe } from "effect/Function";

const Circle = S.struct({
  radius: S.number
});

const Square = S.struct({
  sideLength: S.number
});

const DiscriminatedShape = S.union(
  Circle.pipe(
    S.transform(
      Circle.pipe(S.extend(S.struct({ kind: S.literal("circle") }))), // Add a "kind" property with the literal value "circle" to Circle
      (circle) => ({ ...circle, kind: "circle" as const }), // Add the discriminant property to Circle
      ({ kind: _kind, ...rest }) => rest // Remove the discriminant property
    )
  ),
  Square.pipe(
    S.transform(
      Square.pipe(S.extend(S.struct({ kind: S.literal("square") }))), // Add a "kind" property with the literal value "square" to Square
      (square) => ({ ...square, kind: "square" as const }), // Add the discriminant property to Square
      ({ kind: _kind, ...rest }) => rest // Remove the discriminant property
    )
  )
);

expect(S.parseSync(DiscriminatedShape)({ radius: 10 })).toEqual({
  kind: "circle",
  radius: 10
});

expect(S.parseSync(DiscriminatedShape)({ sideLength: 10 })).toEqual({
  kind: "square",
  sideLength: 10
});
```

In this example, we use the `extend` function to add a "kind" property with a literal value to each member of the union. Then we use `transform` to add the discriminant property and remove it afterwards. Finally, we use `union` to combine the transformed schemas into a discriminated union.

However, when we use the schema to encode a value, we want the output to match the original input shape. Therefore, we must remove the discriminant property we added earlier from the encoded value to match the original shape of the input.

The previous solution works perfectly and shows how we can add and remove properties to our schema at will, making it easier to consume the result within our domain model. However, it requires a lot of boilerplate. Fortunately, there is an API called `attachPropertySignature` designed specifically for this use case, which allows us to achieve the same result with much less effort:

```ts
const Circle = S.struct({ radius: S.number });
const Square = S.struct({ sideLength: S.number });
const DiscriminatedShape = S.union(
  Circle.pipe(S.attachPropertySignature("kind", "circle")),
  Square.pipe(S.attachPropertySignature("kind", "square"))
);

// parsing
expect(S.parseSync(DiscriminatedShape)({ radius: 10 })).toEqual({
  kind: "circle",
  radius: 10
});

// encoding
expect(
  S.encodeSync(DiscriminatedShape)({
    kind: "circle",
    radius: 10
  })
).toEqual({ radius: 10 });
```

## Tuples

```ts
// $ExpectType Schema<readonly [string, number]>
S.tuple(S.string, S.number);
```

### Append a required element

```ts
// $ExpectType Schema<readonly [string, number, boolean]>
S.tuple(S.string, S.number).pipe(S.element(S.boolean));
```

### Append an optional element

```ts
// $ExpectType Schema<readonly [string, number, boolean?]>
S.tuple(S.string, S.number).pipe(S.optionalElement(S.boolean));
```

### Append a rest element

```ts
// $ExpectType Schema<readonly [string, number, ...boolean[]]>
S.tuple(S.string, S.number).pipe(S.rest(S.boolean));
```

## Arrays

```ts
// $ExpectType Schema<readonly number[]>
S.array(S.number);
```

### Mutable Arrays

By default, when you use `S.array`, it generates a type marked as readonly. The `mutable` combinator is a useful function for creating a new schema with a mutable type in a **shallow** manner:

```ts
// $ExpectType Schema<number[]>
S.mutable(S.array(S.number));
```

### Non empty arrays

```ts
// $ExpectType Schema<readonly [number, ...number[]]>
S.nonEmptyArray(S.number);
```

## Structs

```ts
// $ExpectType Schema<{ readonly a: string; readonly b: number; }>
S.struct({ a: S.string, b: S.number });
```

### Mutable Properties

By default, when you use `S.struct`, it generates a type with properties that are marked as readonly. The `mutable` combinator is a useful function for creating a new schema with properties made mutable in a **shallow** manner:

```ts
// $ExpectType Schema<{ a: string; b: number; }>
S.mutable(S.struct({ a: S.string, b: S.number }));
```

### Optional fields

```ts
// $ExpectType Schema<{ readonly a: string; readonly b: number; readonly c?: boolean; }>
S.struct({ a: S.string, b: S.number, c: S.optional(S.boolean) });
```

**Note**. The `optional` constructor only exists to be used in combination with the `struct` API to signal an optional field and does not have a broader meaning. This means that it is only allowed to use it as an outer wrapper of a `Schema` and **it cannot be followed by other combinators**, for example this type of operation is prohibited:

```ts
S.struct({
  // the use of S.optional should be the last step in the pipeline and not preceeded by other combinators like S.nullable
  c: S.boolean.pipe(S.optional, S.nullable) // type checker error
});
```

and it must be rewritten like this:

```ts
S.struct({
  c: S.boolean.pipe(S.nullable, S.optional) // ok
});
```

#### Default values

Optional fields can be configured to accept a default value, making the field optional in input and required in output:

```ts
// $ExpectType Schema<{ readonly a?: number; }, { readonly a: number; }>
const schema = S.struct({ a: S.optional(S.number).withDefault(() => 0) });

const parse = S.parseSync(schema);

parse({}); // { a: 0 }
parse({ a: 1 }); // { a: 1 }

const encode = S.encodeSync(schema);

encode({ a: 0 }); // { a: 0 }
encode({ a: 1 }); // { a: 1 }
```

#### Optional fields as `Option`s

Optional fields can be configured to transform a value of type `A` into `Option<A>`, making the field optional in input and required in output:

```ts
import * as O from "effect/Option"

// $ExpectType Schema<{ readonly a?: number; }, { readonly a: Option<number>; }>
const schema = S.struct({ a. S.optional(S.number).toOption() });

const parse = S.parseSync(schema)

parse({}) // { a: none() }
parse({ a: 1 }) // { a: some(1) }

const encode = S.encodeSync(schema)

encode({ a: O.none() }) // {}
encode({ a: O.some(1) }) // { a: 1 }
```

## Classes

When working with schemas, you have a choice beyond the `S.struct` constructor. You can leverage the power of classes through the `Class` utility, which comes with its own set of advantages tailored to common use cases.

### The Benefits of Using Classes

Classes offer several features that simplify the schema creation process:

- **All-in-One Definition**: With classes, you can define both a schema and an opaque type simultaneously.
- **Shared Functionality**: You can incorporate shared functionality using class methods or getters.
- **Value Equality and Hashing**: Utilize the built-in capability for checking value equality and applying hashing (thanks to `Class` implementing `Data.Case`).

Let's dive into an illustrative example to better understand how classes work:

```ts
import * as S from "@effect/schema/Schema";

// Define your schema by providing the type to `Class` and the desired fields
class Person extends S.Class<Person>()({
  id: S.number,
  name: S.string.pipe(S.nonEmpty())
}) {}
```

### Validation and Instantiation

The class constructor serves as a validation and instantiation tool. It ensures that the provided properties meet the schema requirements:

```ts
const tim = new Person({ id: 1, name: "Tim" });
```

Keep in mind that it throws an error for invalid properties:

```ts
new Person({ id: 1, name: "" });
/* throws
error(s) found
└─ ["name"]
   └─ Expected a string at least 1 character(s) long, actual ""
*/
```

### Custom Getters and Methods

For more flexibility, you can also introduce custom getters and methods:

```ts
import * as S from "@effect/schema/Schema";

class Person extends S.Class<Person>()({
  id: S.number,
  name: S.string.pipe(S.nonEmpty())
}) {
  get upperName() {
    return this.name.toUpperCase();
  }
}

const john = new Person({ id: 1, name: "John" });

john.upperName; // "JOHN"
```

### Accessing Related Schemas

The class constructor itself is a Schema, and can be assigned/provided anywhere a Schema is expected. There is also a `.struct` property, which can be used when the class prototype is not required.

```ts
// $ExpectType Schema<{ readonly id: number; name: string; }, Person>
S.lazy(() => Person);

// $ExpectType Schema<{ readonly id: number; name: string; }, { readonly id: number; name: string; }>
Person.struct;
```

### Extending existing Classes

In situations where you need to augment your existing class with more fields, the built-in `extend` utility comes in handy:

```ts
// Extend an existing schema `Class` using the `extend` utility
class PersonWithAge extends Person.extend<PersonWithAge>()({
  age: S.number
}) {
  get isAdult() {
    return this.age >= 18;
  }
}
```

### Transforms

You have the option to enhance a class with (effectful) transforms. This becomes valuable when you want to enrich or validate an entity sourced from a data store.

```ts
import * as Effect from "effect/Effect";
import * as S from "@effect/schema/Schema";
import * as O from "effect/Option";
import * as PR from "@effect/schema/ParseResult";

class Person extends S.Class({
  id: S.number,
  name: S.string
})

function fetchThing(id: number): Effect.Effect<never, Error, string> { ... }

class PersonWithTransform extends Person.transform<PersonWithTransform>()(
  {
    thing: S.optional(S.string).toOption(),
  },
  (input) =>
    Effect.mapBoth(fetchThing(input.id), {
      onFailure: (e) => PR.parseError([PR.type(S.string, input, e.message)]),
      onSuccess: (thing) => ({ ...input, thing: O.some(thing) })
    }),
  PR.success
) {}

class PersonWithTransformFrom extends Person.transformFrom<PersonWithTransformFrom>()(
  {
    thing: S.optional(S.string).toOption(),
  },
  (input) =>
    Effect.mapBoth(fetchThing(input.id), {
      onFailure: (e) => PR.parseError([PR.type(S.string, input, e.message)]),
      onSuccess: (thing) => ({ ...input, thing })
    }),
  PR.success
) {}
```

## Pick

```ts
// $ExpectType Schema<{ readonly a: string; }>
S.struct({ a: S.string, b: S.number }).pipe(S.pick("a"));
```

## Omit

```ts
// $ExpectType Schema<{ readonly b: number; }>
S.struct({ a: S.string, b: S.number }).pipe(S.omit("a"));
```

## Partial

```ts
// $ExpectType Schema<Partial<{ readonly a: string; readonly b: number; }>>
S.partial(S.struct({ a: S.string, b: S.number }));
```

## Required

```ts
// $ExpectType Schema<Required<{ readonly a?: string; readonly b?: number; }>>
S.required(S.struct({ a: S.optional(S.string), b: S.optional(S.number) }));
```

## Records

### String keys

```ts
// $ExpectType Schema<{ readonly [x: string]: string; }>
S.record(S.string, S.string);

// $ExpectType Schema<{ readonly a: string; readonly b: string; }>
S.record(S.union(S.literal("a"), S.literal("b")), S.string);
```

### Keys refinements

```ts
// $ExpectType Schema<{ readonly [x: string]: string; }>
S.record(S.string.pipe(S.minLength(2)), S.string);
```

### Symbol keys

```ts
// $ExpectType Schema<{ readonly [x: symbol]: string; }>
S.record(S.symbol, S.string);
```

### Template literal keys

```ts
// $ExpectType Schema<{ readonly [x: `a${string}`]: string; }>
S.record(S.templateLiteral(S.literal("a"), S.string), S.string);
```

### Mutable Records

By default, when you use `S.record`, it generates a type marked as readonly. The `mutable` combinator is a useful function for creating a new schema with a mutable type in a **shallow** manner:

```ts
// $ExpectType Schema<{ [x: string]: string; }>
S.mutable(S.record(S.string, S.string););
```

## Extend

The `extend` combinator allows you to add additional fields or index signatures to an existing `Schema`.

```ts
// $ExpectType Schema<{ [x: string]: string; readonly a: string; readonly b: string; readonly c: string; }>
S.struct({ a: S.string, b: S.string }).pipe(
  S.extend(S.struct({ c: S.string })), // <= you can add more fields
  S.extend(S.record(S.string, S.string)) // <= you can add index signatures
);
```

## Compose

Combining and reusing schemas is a common requirement, the `compose` combinator allows you to do just that. It enables you to combine two schemas, `Schema<A, B>` and `Schema<B, C>`, into a single schema `Schema<A, C>`:

```ts
// $ExpectType Schema<string, readonly string[]>
const schema1 = S.split(S.string, ",");

// $ExpectType Schema<readonly string[], readonly number[]>
const schema2 = S.array(S.NumberFromString);

// $ExpectType Schema<string, readonly number[]>
const composedSchema = S.compose(schema1, schema2);
```

In this example, we have two schemas, `schema1` and `schema2`. The first schema, `schema1`, takes a string and splits it into an array using a comma as the delimiter. The second schema, `schema2`, transforms an array of strings into an array of numbers.

Now, by using the `compose` combinator, we can create a new schema, `composedSchema`, that combines the functionality of both `schema1` and `schema2`. This allows us to parse a string and directly obtain an array of numbers as a result.

## InstanceOf

In the following section, we demonstrate how to use the `instanceOf` combinator to create a `Schema` for a class instance.

```ts
class Test {
  constructor(readonly name: string) {}
}

// $ExpectType Schema<Test>
S.instanceOf(Test);
```

## Recursive types

The `lazy` combinator is useful when you need to define a `Schema` that depends on itself, like in the case of recursive data structures. In this example, the `Category` schema depends on itself because it has a field `subcategories` that is an array of `Category` objects.

```ts
interface Category {
  readonly name: string;
  readonly subcategories: ReadonlyArray<Category>;
}

const Category: S.Schema<Category> = S.lazy(() =>
  S.struct({
    name: S.string,
    subcategories: S.array(Category)
  })
);
```

Here's an example of two mutually recursive schemas, `Expression` and `Operation`, that represent a simple arithmetic expression tree.

```ts
interface Expression {
  readonly type: "expression";
  readonly value: number | Operation;
}

interface Operation {
  readonly type: "operation";
  readonly operator: "+" | "-";
  readonly left: Expression;
  readonly right: Expression;
}

const Expression: S.Schema<Expression> = S.lazy(() =>
  S.struct({
    type: S.literal("expression"),
    value: S.union(S.number, Operation)
  })
);

const Operation: S.Schema<Operation> = S.lazy(() =>
  S.struct({
    type: S.literal("operation"),
    operator: S.union(S.literal("+"), S.literal("-")),
    left: Expression,
    right: Expression
  })
);
```

## Transformations

In some cases, we may need to transform the output of a schema to a different type. For instance, we may want to parse a string into a number, or we may want to transform a date string into a `Date` object.

To perform these kinds of transformations, the `@effect/schema` library provides the `transform` combinator.

### transform

```ts
declare const transform: <A, B, C, D>(
  from: Schema<A, B>,
  to: Schema<C, D>,
  decode: (b: B) => C,
  encode: (c: C) => B
) => Schema<A, D>;
```

```mermaid
flowchart TD
  schema1["from: Schema&lt;A, B&gt;"]
  schema2["to: Schema&lt;C, D&gt;"]
  schema1--decode: B -> C-->schema2
  schema2--encode: C -> B-->schema1
```

The `transform` combinator takes a source schema, a target schema, a transformation function from the source type to the target type, and a reverse transformation function from the target type back to the source type. It returns a new schema that applies the transformation function to the output of the original schema before returning it. If the original schema fails to parse a value, the transformed schema will also fail.

```ts
import * as S from "@effect/schema/Schema";

// use the transform combinator to convert the string schema into the tuple schema
export const transformedSchema: S.Schema<string, readonly [string]> =
  S.transform(
    S.string,
    S.tuple(S.string),
    // define a function that converts a string into a tuple with one element of type string
    (s) => [s] as const,
    // define a function that converts a tuple with one element of type string into a string
    ([s]) => s
  );
```

In the example above, we defined a schema for the `string` type and a schema for the tuple type `[string]`. We also defined the functions `decode` and `encode` that convert a `string` into a tuple and a tuple into a `string`, respectively. Then, we used the `transform` combinator to convert the string schema into a schema for the tuple type `[string]`. The resulting schema can be used to parse values of type `string` into values of type `[string]`.

#### Non-strict option

If you need to be less restrictive in your `decode` and `encode` functions, you can make use of the `{ strict: false }` option:

```ts
declare const transform: <A, B, C, D>(
  from: Schema<A, B>,
  to: Schema<C, D>,
  decode: (b: B) => unknown, // Less strict constraint
  encode: (c: C) => unknown, // Less strict constraint
  options: { strict: false }
) => Schema<A, D>;
```

This is useful when you want to relax the type constraints imposed by the `decode` and `encode` functions, making them more permissive.

### transformOrFail

The `transformOrFail` combinator works in a similar way, but allows the transformation function to return a `ParseResult` object, which can either be a success or a failure.

```ts
import * as ParseResult from "@effect/schema/ParseResult";
import * as S from "@effect/schema/Schema";

export const transformedSchema: S.Schema<string, boolean> = S.transformOrFail(
  S.string,
  S.boolean,
  // define a function that converts a string into a boolean
  (s) =>
    s === "true"
      ? ParseResult.success(true)
      : s === "false"
      ? ParseResult.success(false)
      : ParseResult.failure(
          ParseResult.type(S.literal("true", "false").ast, s)
        ),
  // define a function that converts a boolean into a string
  (b) => ParseResult.success(String(b))
);
```

The transformation may also be async:

```ts
import * as S from "@effect/schema/Schema";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Effect from "effect/Effect";
import * as TreeFormatter from "@effect/schema/TreeFormatter";

const api = (url: string) =>
  Effect.tryPromise({
    try: () =>
      fetch(url).then((res) => {
        if (res.ok) {
          return res.json() as Promise<unknown>;
        }
        throw new Error(String(res.status));
      }),
    catch: (e) => new Error(String(e))
  });

const PeopleId = S.string.pipe(S.brand("PeopleId"));

const PeopleIdFromString = S.transformOrFail(
  S.string,
  PeopleId,
  (s) =>
    Effect.mapBoth(api(`https://swapi.dev/api/people/${s}`), {
      onFailure: (e) =>
        ParseResult.parseError([ParseResult.type(PeopleId.ast, s, e.message)]),
      onSuccess: () => s
    }),
  ParseResult.success
);

const parse = (id: string) =>
  Effect.mapError(S.parse(PeopleIdFromString)(id), (e) =>
    TreeFormatter.formatErrors(e.errors)
  );

Effect.runPromiseExit(parse("1")).then(console.log);
// Exit.Success(1)

Effect.runPromiseExit(parse("fail")).then(console.log);
// Exit.Failure('error(s) found\n└─ Error: 404')
```

### String transformations

#### split

The `split` combinator allows splitting a string into an array of strings.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, string>
const schema = S.string.pipe(S.split(","));
const parse = S.parseSync(schema);

parse(""); // [""]
parse(","); // ["", ""]
parse("a,"); // ["a", ""]
parse("a,b"); // ["a", "b"]
```

#### Trim

The `Trim` schema allows removing whitespaces from the beginning and end of a string.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, string>
const schema = S.Trim;
const parse = S.parseSync(schema);

parse("a"); // "a"
parse(" a"); // "a"
parse("a "); // "a"
parse(" a "); // "a"
```

**Note**. If you were looking for a combinator to check if a string is trimmed, check out the `trimmed` combinator.

#### Lowercase

The `Lowercase` schema converts a string to lowercase.

```ts
import * as S from "@effect/schema/Schema";

// const schema: S.Schema<string, string>
const schema = S.Lowercase;
const parse = S.parseSync(schema);

parse("A"); // "a"
parse(" AB"); // " ab"
parse("Ab "); // "ab "
parse(" ABc "); // " abc "
```

**Note**. If you were looking for a combinator to check if a string is lowercased, check out the `lowercased` combinator.

#### ParseJson

The `ParseJson` schema offers a method to convert JSON strings into the `unknown` type using the underlying functionality of `JSON.parse`. It also employs `JSON.stringify` for encoding.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, unknown>
const schema = S.ParseJson;
const parse = S.parseSync(schema);

parse("{}"); // {}
parse(`{"a":"b"}`); // { "a": "b" }
parse(""); // throws Unexpected end of JSON input
```

You can also compose the `ParseJson` schema with other schemas to refine the parsing result:

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, { readonly a: number; }>
const schema = S.ParseJson.pipe(S.compose(S.struct({ a: S.number })));
```

In this example, we've composed the `ParseJson` schema with a struct schema to ensure that the result will have a specific shape, including an object with a numeric property "a".

### Number transformations

#### NumberFromString

Transforms a `string` into a `number` by parsing the string using `parseFloat`.

The following special string values are supported: "NaN", "Infinity", "-Infinity".

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, number>
const schema = S.NumberFromString;
const parse = S.parseSync(schema);

// success cases
parse("1"); // 1
parse("-1"); // -1
parse("1.5"); // 1.5
parse("NaN"); // NaN
parse("Infinity"); // Infinity
parse("-Infinity"); // -Infinity

// failure cases
parse("a"); // throws
```

#### clamp

Clamps a `number` between a minimum and a maximum value.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<number, number>
const schema = S.number.pipe(S.clamp(-1, 1)); // clamps the input to -1 <= x <= 1

const parse = S.parseSync(schema);
parse(-3); // -1
parse(0); // 0
parse(3); // 1
```

### Symbol transformations

#### symbol

Transforms a `string` into a `symbol` by parsing the string using `Symbol.for`.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, symbol>
const schema = S.symbol;
const parse = S.parseSync(schema);

parse("a"); // Symbol.for("a")
```

### Bigint transformations

#### bigint

Transforms a `string` into a `bigint` by parsing the string using `BigInt`.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, bigint>
const schema = S.bigint;
const parse = S.parseSync(schema);

// success cases
parse("1"); // 1n
parse("-1"); // -1n

// failure cases
parse("a"); // throws
parse("1.5"); // throws
parse("NaN"); // throws
parse("Infinity"); // throws
parse("-Infinity"); // throws
```

#### BigintFromNumber

Transforms a `number` into a `bigint` by parsing the number using `BigInt`.

```ts
import * as S from "@effect/schema/Schema";

// const schema: S.Schema<number, bigint>
const schema = S.BigintFromNumber;
const parse = S.parseSync(schema);
const encode = S.encodeSync(schema);

// success cases
parse(1); // 1n
parse(-1); // -1n
encode(1n); // 1
encode(-1n); // -1

// failure cases
parse(1.5); // throws
parse(NaN); // throws
parse(Infinity); // throws
parse(-Infinity); // throws
encode(BigInt(Number.MAX_SAFE_INTEGER) + 1n); // throws
encode(BigInt(Number.MIN_SAFE_INTEGER) - 1n); // throws
```

#### clamp

Clamps a `bigint` between a minimum and a maximum value.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<bigint, bigint>
const schema = S.bigint.pipe(S.clampBigint(-1n, 1n)); // clamps the input to -1n <= x <= 1n

const parse = S.parseSync(schema);
parse(-3n); // -1n
parse(0n); // 0n
parse(3n); // 1n
```

### Boolean transformations

#### not

Negates a boolean value.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<boolean, boolean>
const schema = S.boolean.pipe(S.not);

const parse = S.parseSync(schema);
parse(true); // false
parse(false); // true
```

### Date transformations

#### Date

Transforms a `string` into a valid `Date`.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<string, Date>
const schema = S.Date;
const parse = S.parseSync(schema);

parse("1970-01-01T00:00:00.000Z"); // new Date(0)

parse("a"); // throws

const validate = S.validateSync(schema);

validate(new Date(0)); // new Date(0)
validate(new Date("fail")); // throws
```

## Interop with `effect/Data`

The `effect/Data` module in the Effect ecosystem serves as a utility module that simplifies the process of comparing values for equality without the need for explicit implementations of the `Equal` and `Hash` interfaces. It provides convenient APIs that automatically generate default implementations for equality checks, making it easier for developers to perform equality comparisons in their applications.

```ts
import * as Data from "effect/Data";
import * as Equal from "effect/Equal";

const person1 = Data.struct({ name: "Alice", age: 30 });
const person2 = Data.struct({ name: "Alice", age: 30 });

console.log(Equal.equals(person1, person2)); // true
```

You can use the `Schema.data(schema)` combinator to build a schema from an existing schema that can decode a value `A` to a value `Data<A>`:

```ts
/*
S.Schema<{
    readonly name: string;
    readonly age: number;
}, Data.Data<{
    readonly name: string;
    readonly age: number;
}>>
*/
const schema = S.data(
  S.struct({
    name: S.string,
    age: S.number
  })
);

const decode = S.decode(schema);

const person1 = decode({ name: "Alice", age: 30 });
const person2 = decode({ name: "Alice", age: 30 });

console.log(Equal.equals(person1, person2)); // true
```

## Option

### Parsing from nullable fields

The `optionFromNullable` combinator in `@effect/schema/Schema` allows you to specify that a field in a schema is of type `Option<A>` and can be parsed from a required nullable field `A | null`. This is particularly useful when working with JSON data that may contain `null` values for optional fields.

When parsing a nullable field, the `option` combinator follows these conversion rules:

- `null` parses to `None`
- `A` parses to `Some<A>`

Here's an example that demonstrates how to use the `optionFromNullable` combinator:

```ts
import * as Schema from "@effect/schema/Schema";
import { Option } from "effect";

/*
const schema: Schema<{
    readonly a: string;
    readonly b: number | null;
}, {
    readonly a: string;
    readonly b: Option<number>;
}>
*/
const schema = Schema.struct({
  a: Schema.string,
  b: Schema.optionFromNullable(Schema.number)
});

// parsing
const parseOrThrow = Schema.parseSync(schema);

console.log(parseOrThrow({ a: "hello", b: null }));
/*
Output:
{
  a: "hello",
  b: {
    _id: "Option",
    _tag: "None"
  }
}
*/

console.log(parseOrThrow({ a: "hello", b: 1 }));
/*
Output:
{
  a: "hello",
  b: {
    _id: "Option",
    _tag: "Some",
    value: 1
  }
}
*/

parseOrThrow({ a: "hello", b: undefined });
/*
throws:
Error: error(s) found
└─ ["b"]
   ├─ union member
   │  └─ Expected null, actual undefined
   └─ union member
      └─ Expected number, actual undefined
*/

parseOrThrow({ a: "hello" });
/*
throws:
Error: error(s) found
└─ ["b"]
   └─ is missing
*/

// encoding
const encodeOrThrow = Schema.encodeSync(schema);

console.log(encodeOrThrow({ a: "hello", b: Option.none() }));
/*
Output:
{
  a: "hello",
  b: null
}
*/

console.log(encodeOrThrow({ a: "hello", b: Option.some(1) }));
/*
Output:
{
  a: "hello",
  b: 1
}
*/
```

## ReadonlySet

In the following section, we demonstrate how to use the `readonlySet` combinator to parse a `ReadonlySet` from an array of values.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<readonly number[], ReadonlySet<number>>
const schema = S.readonlySet(S.number); // define a schema for ReadonlySet with number values
const parse = S.parseSync(schema);

parse([1, 2, 3]); // new Set([1, 2, 3])
```

## ReadonlyMap

In the following section, we demonstrate how to use the `readonlyMap` combinator to parse a `ReadonlyMap` from an array of entries.

```ts
import * as S from "@effect/schema/Schema";

// $ExpectType Schema<readonly (readonly [number, string])[], ReadonlyMap<number, string>>
const schema = S.readonlyMap(S.number, S.string); // define the schema for ReadonlyMap with number keys and string values
const parse = S.parseSync(schema);

parse([
  [1, "a"],
  [2, "b"],
  [3, "c"]
]); // new Map([[1, "a"], [2, "b"], [3, "c"]])
```

# Adding new data types

The easiest way to define a new data type is through the `filter` combinator.

```ts
import * as S from "@effect/schema/Schema";

const LongString = S.string.pipe(
  S.filter((s) => s.length >= 10, {
    message: () => "a string at least 10 characters long"
  })
);

console.log(S.parseSync(LongString)("a"));
/*
error(s) found
└─ Expected a string at least 10 characters long, actual "a"
*/
```

It is good practice to add as much metadata as possible so that it can be used later by introspecting the schema.

```ts
const LongString = S.string.pipe(
  S.filter((s) => s.length >= 10, {
    message: () => "a string at least 10 characters long",
    identifier: "LongString",
    jsonSchema: { minLength: 10 },
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
  })
);
```

# Technical overview

## Understanding Schemas

A schema is a description of a data structure that can be used to generate various artifacts from a single declaration.

From a technical point of view a schema is just a typed wrapper of an `AST` value:

```ts
interface Schema<I, A> {
  readonly ast: AST;
}
```

The `AST` type represents a tiny portion of the TypeScript AST, roughly speaking the part describing ADTs (algebraic data types),
i.e. products (like structs and tuples) and unions, plus a custom transformation node.

This means that you can define your own schema constructors / combinators as long as you are able to manipulate the `AST` value accordingly, let's see an example.

Say we want to define a `pair` schema constructor, which takes a `Schema<A>` as input and returns a `Schema<readonly [A, A]>` as output.

First of all we need to define the signature of `pair`

```ts
import * as S from "@effect/schema/Schema";

declare const pair: <A>(schema: S.Schema<A>) => S.Schema<readonly [A, A]>;
```

Then we can implement the body using the APIs exported by the `@effect/schema/AST` module:

```ts
import * as S from "@effect/schema/Schema";
import * as AST from "@effect/schema/AST";
import * as Option from "effect/Option";

const pair = <A>(schema: S.Schema<A>): S.Schema<readonly [A, A]> => {
  const element = AST.createElement(
    schema.ast, // <= the element type
    false // <= is optional?
  );
  const tuple = AST.createTuple(
    [element, element], // <= elements definitions
    Option.none(), // <= rest element
    true // <= is readonly?
  );
  return S.make(tuple); // <= wrap the AST value in a Schema
};
```

This example demonstrates the use of the low-level APIs of the `AST` module, however, the same result can be achieved more easily and conveniently by using the high-level APIs provided by the `Schema` module.

```ts
const pair = <A>(schema: S.Schema<A>): S.Schema<readonly [A, A]> =>
  S.tuple(schema, schema);
```

## Annotations

One of the fundamental requirements in the design of `@effect/schema` is that it is extensible and customizable. Customizations are achieved through "annotations". Each node contained in the AST of `@effect/schema/AST` contains an `annotations: Record<symbol, unknown>` field that can be used to attach additional information to the schema.

Let's see some examples:

```ts
import { pipe } from "effect/Function";
import * as S from "@effect/schema/Schema";

const Password =
  // initial schema, a string
  S.string.pipe(
    // add an error message for non-string values (annotation)
    S.message(() => "not a string"),
    // add a constraint to the schema, only non-empty strings are valid
    // and add an error message for empty strings (annotation)
    S.nonEmpty({ message: () => "required" }),
    // add a constraint to the schema, only strings with a length less or equal than 10 are valid
    // and add an error message for strings that are too long (annotation)
    S.maxLength(10, { message: (s) => `${s} is too long` }),
    // add an identifier to the schema (annotation)
    S.identifier("Password"),
    // add a title to the schema (annotation)
    S.title("password"),
    // add a description to the schema (annotation)
    S.description(
      "A password is a string of characters used to verify the identity of a user during the authentication process"
    ),
    // add examples to the schema (annotation)
    S.examples(["1Ki77y", "jelly22fi$h"]),
    // add documentation to the schema (annotation)
    S.documentation(`
    jsDoc documentation...
  `)
  );
```

The example shows some built-in combinators to add meta information, but users can easily add their own meta information by defining a custom combinator.

Here's an example of how to add a `deprecated` annotation:

```ts
import * as S from "@effect/schema/Schema";
import * as AST from "@effect/schema/AST";

const DeprecatedId = Symbol.for(
  "some/unique/identifier/for/the/custom/annotation"
);

const deprecated = <I, A>(self: S.Schema<I, A>): S.Schema<I, A> =>
  S.make(AST.setAnnotation(self.ast, DeprecatedId, true));

const schema = deprecated(S.string);

console.log(schema);
/*
{
  ast: {
    _tag: 'StringKeyword',
    annotations: {
      [Symbol(@effect/schema/annotation/Title)]: 'string',
      [Symbol(@effect/schema/annotation/Description)]: 'a string',
      [Symbol(some/unique/identifier/for/the/custom/annotation)]: true
    }
  }
  ...
}
*/
```

Annotations can be read using the `getAnnotation` helper, here's an example:

```ts
import * as Option from "effect/Option";

const isDeprecated = <A>(schema: S.Schema<A>): boolean =>
  AST.getAnnotation<boolean>(DeprecatedId)(schema.ast).pipe(
    Option.getOrElse(() => false)
  );

console.log(isDeprecated(S.string)); // false
console.log(isDeprecated(schema)); // true
```

# Documentation

- [API Reference](https://effect-ts.github.io/schema/)

# License

The MIT License (MIT)

# Contributing Guidelines

Thank you for considering contributing to our project! Here are some guidelines to help you get started:

## Reporting Bugs

If you have found a bug, please open an issue on our [issue tracker](https://github.com/Effect-TS/schema/issues) and provide as much detail as possible. This should include:

- A clear and concise description of the problem
- Steps to reproduce the problem
- The expected behavior
- The actual behavior
- Any relevant error messages or logs

## Suggesting Enhancements

If you have an idea for an enhancement or a new feature, please open an issue on our [issue tracker](https://github.com/Effect-TS/schema/issues) and provide as much detail as possible. This should include:

- A clear and concise description of the enhancement or feature
- Any potential benefits or use cases
- Any potential drawbacks or trade-offs

## Pull Requests

We welcome contributions via pull requests! Here are some guidelines to help you get started:

1. Fork the repository and clone it to your local machine.
2. Create a new branch for your changes: `git checkout -b my-new-feature`
3. Install dependencies: `pnpm install` (`pnpm@8.x`)
4. Make your changes and add tests if applicable.
5. Run the tests: `pnpm test`
6. Create a changeset for your changes: before committing your changes, create a changeset to document the modifications. This helps in tracking and communicating the changes effectively. To create a changeset, run the following command: `pnpm changeset`.
7. Commit your changes: after creating the changeset, commit your changes with a descriptive commit message: `git commit -am 'Add some feature'`.
8. Push your changes to your fork: `git push origin my-new-feature`.
9. Open a pull request against our `main` branch.

### Pull Request Guidelines

- Please make sure your changes are consistent with the project's existing style and conventions.
- Please write clear commit messages and include a summary of your changes in the pull request description.
- Please make sure all tests pass and add new tests as necessary.
- If your change requires documentation, please update the relevant documentation.
- Please be patient! We will do our best to review your pull request as soon as possible.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
