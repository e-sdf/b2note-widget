export interface SelectionSnapshot {
  node: Node;
  textContent: string;
  startOffset: number;
  endOffset: number;
}

export function mkSelectionSnapshot(sel: Selection|null): SelectionSnapshot|null {
  const node = sel?.focusNode;
  if (node) {
    const range = sel?.getRangeAt(0);
    if (range) {
      const [startOffset, endOffset] = [range.startOffset, range.endOffset];
      if (startOffset < endOffset) {
        const textContent = sel?.focusNode?.textContent;
        return (
          textContent ?
            {
              node,
              textContent,
              startOffset: range.startOffset,
              endOffset: range.endOffset
            }
          : null
        );
      } else { return null; }
    } else { return null; }
  } else { return null; }
}

export function toString(ss: SelectionSnapshot): string {
  return ss.textContent.substring(ss.startOffset, ss.endOffset);
}
