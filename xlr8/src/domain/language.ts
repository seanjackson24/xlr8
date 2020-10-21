import { Result, Context } from "./parser";
import { map, sequence, str, many, any, regex, optional, Mid, mid } from "./tokens";

type ExcelExpr = Eval | string;

interface FnCall {
  target: string;
  args: Expression[];
}
interface Eval {
  expr: Expression;
}
type Expression = FnCall | CellToCelRef | EntireColumnRef | CellRef | Calc | Val;
type Val = string;
interface Calc {
  symbol: string;
  left: Expression;
  right: Expression;
}
interface SheetRef {
  sheetName: string;
}
interface CellRef {
  sheetRef: SheetRef | null;
  colAnchored: boolean;
  colRef: ColRef;
  rowAnchored: boolean;
  rowRef: RowRef;
}
interface CellToCelRef {
  startCell: CellRef;
  endCell: CellRef;
}
interface EntireColumnRef {
  sheetRef: SheetRef | null;
  startColumn: string;
  endColumn: string;
}
interface ColRef {
  column: string;
}
interface RowRef {
  row: string;
}
// our top level parsing function that takes care of creating a `Ctx`,
// and unboxing the final AST (or throwing)
export function parse(text: string): ExcelExpr {
  const res = excelExpr({
    text,
    index: 0
  });
  if (res.success) return res.value;
  throw `Parse error, expected ${res.expected} at char ${res.ctx.index}`;
}

function excelExpr(ctx: Context): Result<ExcelExpr> {
  return any<ExcelExpr>([evaluation, textLiteral])(ctx);
}

function evaluation(ctx: Context): Result<Eval> {
  //   console.log("evaluation");
  return map(
    sequence<any>([str("="), expression]),
    ([_eq, expr]): Eval => ({
      expr: expr
    })
  )(ctx);
}

const ident = regex(/[a-zA-Z0-9]*/g, "identifier");
const symbol = any([str("+"), str("-"), str("*"), str("/"), str("^")]);
const notSymbol = regex(/[^\+-/\*\^]+/g, "not");
const columnRef = regex(/[a-zA-Z]{1,3}/g, "column ref");
const rowRef = regex(/[0-9]{1,7}/g, "column ref");

function sheetRef(ctx: Context): Result<SheetRef> {
  return map(
    sequence([ident, str("!")]),
    ([sheetName, _exc]): SheetRef => ({
      sheetName: sheetName
    })
  )(ctx);
}

function cellRef(ctx: Context): Result<CellRef> {
  //   console.log("cell ref");
  return map(
    sequence<any>([optional(sheetRef), optional(str("$")), columnRef, optional(str("$")), rowRef]),
    ([sheetRef, colAnchor, colRef, rowAchor, rowRef]): CellRef => ({
      sheetRef: sheetRef,
      colAnchored: colAnchor !== null,
      colRef: { column: colRef ?? "" },
      rowAnchored: rowAchor !== null,
      rowRef: { row: rowRef ?? "" }
    })
  )(ctx);
}

function cellToCellRef(ctx: Context): Result<CellToCelRef> {
  //   console.log("cell to cell ref");
  return map(
    sequence<any>([cellRef, str(":"), cellRef]),
    ([startCell, _colon, endCell]): CellToCelRef => ({
      startCell: startCell,
      endCell: endCell
    })
  )(ctx);
}

function entireColumnRef(ctx: Context): Result<EntireColumnRef> {
  //   console.log("entire column ref");
  return map(
    sequence<any>([optional(sheetRef), columnRef, str(":"), columnRef]),
    ([sheetRef, start, _colon, end]): EntireColumnRef => ({
      sheetRef: sheetRef,
      startColumn: start,
      endColumn: end
    })
  )(ctx);
}

function trailingArg(ctx: Context): Result<Expression[]> {
  //   console.log("trailing arg");
  return map(
    sequence<any>([str(","), many(str(" ")), expression]),
    ([_comma, _space, argExpr]): Expression[] => argExpr
  )(ctx);
}

function args(ctx: Context): Result<Expression[]> {
  //   console.log("args");
  return map(
    sequence<any>([expression, many(trailingArg)]),
    // we combine the first argument and the trailing arguments into a single array
    ([arg1, rest]): Expression[] => [arg1, ...rest]
  )(ctx);
}

function fnCall(ctx: Context): Result<FnCall> {
  //   console.log("fn call");
  return map(
    sequence<any>([ident, str("("), optional(args), str(")")]),
    ([fnName, _lparen, argList, _rparen]): FnCall => ({
      target: fnName,
      args: argList || []
    })
  )(ctx);
}

function calc(ctx: Context): Result<Calc> {
  //   console.log("calc");
  return map(
    mid(notSymbol, symbol, expression, expression),
    (mid: Mid<string, Expression, Expression>): Calc => ({
      left: mid.left,
      right: mid.right,
      symbol: mid.mid
    })
  )(ctx);
}

function expression(ctx: Context): Result<Expression> {
  return any<Expression>([fnCall, calc, cellToCellRef, entireColumnRef, cellRef, val])(ctx);
}

function val(ctx: Context): Result<Val> {
  return map(
    sequence<any>([optional(str('"')), ident, optional(str('"'))]),
    ([openQuote, val, closeQuote]): Val => (openQuote ?? "") + val + (closeQuote ?? "")
  )(ctx);
}

const textLiteral = regex(/[^=]+\w*/g, "string");

// sheet formula
// array formulas?
// r1c1 format
