import { success, failure, Parser, Result } from "./parser";
// match an exact string or fail
export function str(match: string): Parser<string> {
  return ctx => {
    const endIdx = ctx.index + match.length;
    if (ctx.text.substring(ctx.index, endIdx) === match) {
      return success({ ...ctx, index: endIdx }, match);
    } else {
      return failure(ctx, match);
    }
  };
}

// match a regexp or fail
export function regex(re: RegExp, expected: string): Parser<string> {
  return ctx => {
    re.lastIndex = ctx.index;
    const res = re.exec(ctx.text);
    if (res && res.index === ctx.index) {
      return success({ ...ctx, index: ctx.index + res[0].length }, res[0]);
    } else {
      return failure(ctx, expected);
    }
  };
}

// try each matcher in order, starting from the same point in the input. return the first one that succeeds.
// or return the failure that got furthest in the input string.
// which failure to return is a matter of taste, we prefer the furthest failure because.
// it tends be the most useful / complete error message.
export function any<T>(parsers: Parser<T>[]): Parser<T> {
  return ctx => {
    let furthestRes: Result<T> | null = null;
    for (const parser of parsers) {
      const res = parser(ctx);
      if (res.success) return res;
      if (!furthestRes || furthestRes.ctx.index < res.ctx.index) furthestRes = res;
    }
    return furthestRes!;
  };
}

// match a parser, or succeed with null
export function optional<T>(parser: Parser<T>): Parser<T | null> {
  return any([parser, ctx => success(ctx, null)]);
}

// look for 0 or more of something, until we can't parse any more. note that this function never fails, it will instead succeed with an empty array.
export function many<T>(parser: Parser<T>): Parser<T[]> {
  return ctx => {
    let values: T[] = [];
    let nextCtx = ctx;
    while (true) {
      const res = parser(nextCtx);
      if (!res.success) break;
      values.push(res.value);
      nextCtx = res.ctx;
    }
    return success(nextCtx, values);
  };
}

// look for an exact sequence of parsers, or fail
export function sequence<T>(parsers: Parser<T>[]): Parser<T[]> {
  return ctx => {
    let values: T[] = [];
    let nextCtx = ctx;
    for (const parser of parsers) {
      const res = parser(nextCtx);
      if (!res.success) return res;
      values.push(res.value);
      nextCtx = res.ctx;
    }
    return success(nextCtx, values);
  };
}

export interface Mid<TMid, TLeft, TRight> {
  mid: TMid;
  left: TLeft;
  right: TRight;
}
// // TODO: tidy
export function mid<TMid, TLeft, TRight, TNotMid>(
  notMidParser: Parser<TNotMid>,
  midParser: Parser<TMid>,
  leftParser: Parser<TLeft>,
  rightParser: Parser<TRight>
): Parser<Mid<TMid, TLeft, TRight>> {
  return ctx => {
    let values: Partial<Mid<TMid, TLeft, TRight>> = {};
    let nextCtx = ctx;

    // console.log("test notmid");
    const notMid = notMidParser(nextCtx);
    if (!notMid.success) return notMid;
    nextCtx = notMid.ctx;
    // console.log("success notmid");

    // console.log("test mid");
    const midRes = midParser(nextCtx);
    if (!midRes.success) return midRes;
    values.mid = midRes.value;
    nextCtx = midRes.ctx;
    // console.log("success mid");

    // console.log("test left");
    const leftCtx = { index: 0, text: ctx.text.substring(ctx.index, midRes.ctx.index - 1) };
    const leftRes = leftParser(leftCtx);
    if (!leftRes.success) return leftRes;
    values.left = leftRes.value;
    // console.log("success left");
    // nextCtx = leftRes.ctx;

    // console.log("test right");
    const rightRes = rightParser(nextCtx);
    if (!rightRes.success) return rightRes;
    values.right = rightRes.value;
    nextCtx = rightRes.ctx;
    // console.log("success right");

    const v = values as Mid<TMid, TLeft, TRight>;
    if (v === null) {
      console.error("v is null??");
    }
    return success(nextCtx, v);
  };
}

// a convenience method that will map a Success to callback, to let us do common things like build AST nodes from input strings.
export function map<A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> {
  return ctx => {
    const res = parser(ctx);

    return res.success ? success(res.ctx, fn(res.value)) : (res as Result<B>);
  };
}
