# unit tests

- given a column / row / cell, assert that it is:
  positive (something to do with the value)
  containing $A$5 (something to do with the formula)
- mock an input value
  simulate worksheet based off this value, then revert
- watch for anomalies - custom function?
  given a set of Xs and Ys, and an algorithm (linear, quadratic, log), look for outliers of Y

# resharper

- given a column
  check reference types - if they are not all the same, highlight and give a button to fix
- given a selected range from a formula somewhere
  if there are now values below, extend the range down (with option to autoextend)
- auto conversions
  convert VLOOKUP / INDEXMATCH to XLOOKUP
  SUM(Jan!D5, Feb!D5) => Jan:Feb!D5
- wrap in error checks
  check for DIV/0 and add an IFERR
- auto date formatting

export to file for git diffing?

function - fetch??
