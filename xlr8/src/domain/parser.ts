// every parsing function will have this signature
export type Parser<T> = (ctx: Context) => Result<T>;

// to track progress through our input string.
// we should make this immutable, because we can.
export type Context = Readonly<{
  text: string; // the full input string
  index: number; // our current position in it
}>;

// our result types
export type Result<T> = Success<T> | Failure;

// on success we'll return a value of type T, and a new Ctx
// (position in the string) to continue parsing from
export type Success<T> = Readonly<{
  success: true;
  value: T;
  ctx: Context;
}>;

// when we fail we want to know where and why
export type Failure = Readonly<{
  success: false;
  expected: string;
  ctx: Context;
}>;

// some convenience methods to build `Result`s for us
export function success<T>(ctx: Context, value: T): Success<T> {
  //   console.log("true " + value);
  return {
    success: true,
    value,
    ctx
  };
}

export function failure(ctx: Context, expected: string): Failure {
  //   console.log("false " + expected);
  return {
    success: false,
    expected,
    ctx
  };
}
