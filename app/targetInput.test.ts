import { processTargetInput } from "./targetInput";
import { TargetInputType as TIT } from "core/targetInput";
import { TableRangeType as TRT } from "core/annotationsModel";

test("Empty input returns null", () => {
  const ti = {};
  expect(processTargetInput(ti)).toBe(null);
});

test("Accepts PID and returns PageTarget", () => {
  const ti = { pid: "Some pid" };
  const t = { type: TIT.PAGE , pid: "Some pid" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("Accepts pid and pidName and returns PageTarget", () => {
  const ti = { pid: "Some pid", pidName: "Some pid name" };
  const t = { type: TIT.PAGE, pid: "Some pid", pidName: "Some pid name" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("Accepts pid and source and returns LinkTarget", () => {
  const ti = { pid: "Some pid", source: "Some source" };
  const t = { type: TIT.LINK, pid: "Some pid", source: "Some source" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("Accepts pid, pidName and source and returns LinkTarget", () => {
  const ti = { pid: "Some pid", pidName: "Some pid name", source: "Some source" };
  const t = { type: TIT.LINK, pid: "Some pid", pidName: "Some pid name", source: "Some source" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("Accepts pid, pidName, source and sourceName and returns LinkTarget", () => {
  const ti = { pid: "Some pid", pidName: "Some pid name", source: "Some source", sourceName: "Some source name" };
  const t = { type: TIT.LINK, pid: "Some pid", pidName: "Some pid name", source: "Some source", sourceName: "Some source name" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with JSON error fails", () => {
  const ti = { targetString: '{ "JSON error": bla }' };
  const t = { type: TIT.PAGE, pid: "Some pid" };
  expect(processTargetInput(ti)).toHaveProperty("error");
});

test("targetString with pid returns PageTarget", () => {
  const ti = { targetString: '{ "type": "PageTarget", "pid": "Some pid" }' };
  const t = { type: TIT.PAGE, pid: "Some pid" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with pid and pidName returns PageTarget", () => {
  const ti = { targetString: '{ "type": "PageTarget", "pid": "Some pid", "pidName": "Some pid name" }' };
  const t = { type: TIT.PAGE, pid: "Some pid", pidName: "Some pid name" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with pid and source returns LinkTarget", () => {
  const ti = { targetString: '{ "type": "LinkTarget", "pid": "Some pid", "source": "Some source" }' };
  const t = { type: TIT.LINK, pid: "Some pid", source: "Some source" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with pid, pidName, source and sourceName returns LinkTarget", () => {
  const ti = { targetString: '{ "type": "LinkTarget", "pid": "Some pid", "pidName": "Some pid name", "source": "Some source", "sourceName": "Some source name" }' };
  const t = { type: TIT.LINK, pid: "Some pid", pidName: "Some pid name", source: "Some source", sourceName: "Some source name" };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with TextSelection", () => {
  const ti = { targetString: `
    {
      "type": "TextSelectionTarget",
      "pid": "some pid",
      "xPath": "some xpath",
      "startOffset": 3,
      "endOffset": 5,
      "selectedText": "some selected text"
    }`
  };
  const t = {
    type: TIT.TEXT_SELECTION,
    pid: "some pid",
    xPath: "some xpath",
    startOffset: 3,
    endOffset: 5,
    selectedText: "some selected text"
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with ImageRegion", () => {
  const ti = { targetString: `
    {
      "type": "ImageRegionTarget",
      "pid": "some pid",
      "svgSelector": "some svg"
    }`
  };
  const t = {
    type: TIT.IMAGE_REGION,
    pid: "some pid",
    svgSelector: "some svg"
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with ImageRegionOnPage", () => {
  const ti = { targetString: `
    {
      "type": "ImageRegionOnPageTarget",
      "pid": "some pid",
      "source": "some source",
      "svgSelector": "some svg"
    }`
  };
  const t = {
    type: TIT.IMAGE_REGION_ON_PAGE,
    pid: "some pid",
    source: "some source",
    svgSelector: "some svg"
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with TableTarget with sheet", () => {
  const ti = { targetString: `
    {
      "type": "TableTarget",
      "pid": "some pid",
      "sheet": "some sheet"
    }`
  };
  const t = {
    type: TIT.TABLE, 
    pid: "some pid",
    sheet: "some sheet"
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with TableTarget with sheet and row range", () => {
  const ti = { targetString: `
    {
      "type": "TableTarget",
      "pid": "some pid",
      "sheet": "some sheet",
      "range": {
        "type": "RowRange",
        "startRow": 1,
        "endRow": 10
      }
    }`
  };
  const t = {
    type: TIT.TABLE, 
    pid: "some pid",
    sheet: "some sheet",
    range: {
      type: TRT.ROWS,
      startRow: 1,
      endRow: 10
    }
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with TableTarget with sheet and column range", () => {
  const ti = { targetString: `
    {
      "type": "TableTarget",
      "pid": "some pid",
      "sheet": "some sheet",
      "range": {
        "type": "ColumnRange",
        "startColumn": 1,
        "endColumn": 10
      }
    }`
  };
  const t = {
    type: TIT.TABLE, 
    pid: "some pid",
    sheet: "some sheet",
    range: {
      type: TRT.COLUMNS,
      startColumn: 1,
      endColumn: 10
    }
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with TableTarget with sheet and cell range", () => {
  const ti = { targetString: `
    {
      "type": "TableTarget",
      "pid": "some pid",
      "sheet": "some sheet",
      "range": {
        "type": "CellRange",
        "startColumn": 1,
        "endColumn": 10,
        "startRow": 2,
        "endRow": 9 
      }
    }`
  };
  const t = {
    type: TIT.TABLE, 
    pid: "some pid",
    sheet: "some sheet",
    range: {
      type: TRT.CELLS,
      startColumn: 1,
      endColumn: 10,
      startRow: 2,
      endRow: 9
    }
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with PdfTarget with page number", () => {
  const ti = { targetString: `
    {
      "type": "PdfTarget",
      "pid": "some pid",
      "pageNumber": 100
    }`
  };
  const t = {
    type: TIT.PDF,
    pid: "some pid",
    pageNumber: 100
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});

test("targetString with PdfTarget with page number and SVG selector", () => {
  const ti = { targetString: `
    {
      "type": "PdfTarget",
      "pid": "some pid",
      "pageNumber": 100,
      "svgSelector": "some svg"
    }`
  };
  const t = {
    type: TIT.PDF,
    pid: "some pid",
    pageNumber: 100,
    svgSelector: "some svg"
  };
  expect(processTargetInput(ti)).toStrictEqual(t);
});