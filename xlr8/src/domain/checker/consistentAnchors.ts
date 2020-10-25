import { CellRef, ExcelExpr, CellToCellRef, Eval, Expression, EntireColumnRef, Calc, FnCall } from "../parser/language";
export const consistentAchors = (formulae: ExcelExpr[]) => {
  // SUM(B4:B10)
  // C10/$B$2
  // flatten to find cell references
  // check length same
  // compare index 0s, index 1s, index 2s...
  const firstFormula = formulae[0];
  const flattened = flattenOuter(firstFormula);
  const anchors = flattened.map(c => {
    return { col: c.colAnchored, row: c.rowAnchored };
  });

  for (let i = 1; i < formulae.length; i++) {
    const formula = formulae[i];
    const cells = flattenOuter(formula).map(c => {
      return { col: c.colAnchored, row: c.rowAnchored };
    });
    const failedCells = [];
    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      if (cell.row !== anchors[c].row || cell.col !== anchors[c].col) {
        failedCells.push({ index: i }); // TODO: more info about the cellref
      }
    }
  }
};
const flattenOuter = (formula: ExcelExpr): CellRef[] => {
  const f = formula as Eval;
  if (f === null) return [];
  const expr = f.expr;
  return flatten(expr);
};
const flatten = (expr: Expression): CellRef[] => {
  if (typeof expr === "string") {
    return [];
  }
  if (is<EntireColumnRef>(expr, "startColumn")) {
    return [];
  }

  if (is<Calc>(expr, "symbol")) {
    return [...flatten(expr.left), ...flatten(expr.right)];
  }
  if (is<FnCall>(expr, "target")) {
    return expr.args.map(f => flatten(f)).reduce((prev, curr) => [...prev, ...curr]);
  }
  if (is<CellToCellRef>(expr, "startCell")) {
    return [expr.startCell, expr.endCell];
  }
  if (is<CellRef>(expr, "colAnchored")) {
    return [expr];
  }
  console.error("something went wrong");
  console.log(expr);
  return [];
};

const is = <T extends Expression>(expr: Expression, propertyName: keyof T): expr is T => {
  return (expr as T)[propertyName] !== undefined;
};
