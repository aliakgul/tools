import test from "node:test";
import assert from "node:assert/strict";
import { parseTable, filterAndSortRows, MAX_BYTES, MAX_ROWS } from "./table.js";

test("detects supported separators and honors manual override", () => {
  for (const [delimiter, separator] of [
    ["comma", ","],
    ["tab", "\t"],
    ["semicolon", ";"],
  ]) {
    const result = parseTable(`Name${separator}Value\nAda${separator}12`);
    assert.equal(result.delimiter, delimiter);
    assert.deepEqual(result.rows, [
      ["Name", "Value"],
      ["Ada", "12"],
    ]);
  }
  assert.deepEqual(parseTable("a;b,c\n1;2,3", "semicolon").rows, [
    ["a", "b,c"],
    ["1", "2,3"],
  ]);
});

test("handles BOM, CRLF, quoted delimiters, escaped quotes, multiline cells and trailing empty fields", () => {
  const result = parseTable('\uFEFFName,Note,Value\r\nAda,"First, line\r\nSecond ""quoted"" line",\r\n\r\n');
  assert.deepEqual(result.rows, [
    ["Name", "Note", "Value"],
    ["Ada", 'First, line\r\nSecond "quoted" line', ""],
  ]);
});

test("preserves duplicate/blank headers, leading zeroes, formulas, and uneven rows", () => {
  const result = parseTable("ID,ID,\n001,=SUM(A1),<script>\n002,3\n003,4,5,extra", "comma");
  assert.equal(result.columns, 4);
  assert.equal(result.uneven, true);
  assert.deepEqual(result.rows[0], ["ID", "ID", ""]);
  assert.deepEqual(result.rows[1], ["001", "=SUM(A1)", "<script>"]);
  assert.deepEqual(result.rows[2], ["002", "3"]);
});

test("accepts one-column and header-only inputs and rejects malformed quoting", () => {
  assert.equal(parseTable("Name\nAda\nAlex").columns, 1);
  assert.equal(parseTable("Name,Value").rows.length, 1);
  assert.equal(parseTable('a,b\n"unfinished,x').error, "malformed");
  assert.equal(parseTable("   \n").error, "empty");
});

test("limits reject oversized data instead of truncating it", () => {
  assert.equal(parseTable("x".repeat(MAX_BYTES + 1)).error, "tooLarge");
  assert.equal(parseTable("x\n".repeat(MAX_ROWS + 2)).error, "tooManyRows");
  assert.equal(parseTable(Array(201).fill("x").join(",")).error, "tooManyCells");
  assert.equal(parseTable("x\0y").error, "encoding");
});

test("sorts numbers including negative decimals, keeps blanks last, and restores original order", () => {
  const rows = [["100"], ["-2.5"], ["10"], [""], ["-10"], ["10"]];
  assert.deepEqual(
    filterAndSortRows(rows, { column: 0 }).map((row) => row.index),
    [4, 1, 2, 5, 0, 3],
  );
  assert.deepEqual(
    filterAndSortRows(rows, { column: 0, direction: "descending" }).map((row) => row.index),
    [0, 2, 5, 1, 4, 3],
  );
  assert.deepEqual(
    filterAndSortRows(rows).map((row) => row.index),
    [0, 1, 2, 3, 4, 5],
  );
  assert.deepEqual(rows, [["100"], ["-2.5"], ["10"], [""], ["-10"], ["10"]]);
});

test("search covers all columns and sorting remains stable for text ties", () => {
  const rows = [
    ["item10", "Istanbul"],
    ["item2", "Ankara"],
    ["ITEM2", "Madrid"],
  ];
  assert.deepEqual(
    filterAndSortRows(rows, { search: "MADRID" }).map((row) => row.index),
    [2],
  );
  assert.deepEqual(
    filterAndSortRows(rows, { column: 0 }).map((row) => row.index),
    [1, 2, 0],
  );
  assert.deepEqual(
    filterAndSortRows([["İstanbul"], ["Ankara"]], { search: "istanbul", locale: "tr" }).map((row) => row.index),
    [0],
  );
});
