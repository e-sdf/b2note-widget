export interface SelectionSnapshot {
  XPath: string;
  textContent: string;
  startOffset: number;
  endOffset: number;
}

export function toString(ss: SelectionSnapshot): string {
  return ss.textContent.substring(ss.startOffset, ss.endOffset);
}
