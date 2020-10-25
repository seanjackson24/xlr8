import { parse } from "./language";

const testFormulae = () => {
  const formulae = [
    "hello",
    "123",
    "=A9",
    "=SUM(B6)",
    "=A4:A7",
    "=$B2",
    "=B$2",
    "=$B$2",
    "=A:A",
    "=SUM(A4:A7)",
    "=SUM(A:B)",
    "=IFERROR(B7, A3)",
    '=IFERROR(B7,"asd")',
    "=3+5",
    "=C19/2",
    "=C10/B7",
    "=SUM(C10:C12)*2",
    "=SUM(C10*5)",
    "=IFERROR(SUM(C13),10/2)",
    "IFERROR(SUM(C14),10/2)",
    "=SUM(C11 *5)",
    "=Sheet2!A1"
  ];
  for (let i = 0; i < formulae.length; i++) {
    const formula = formulae[i];
    const result = parse(formula);
    console.log(JSON.stringify(result));
  }
};
