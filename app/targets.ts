import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { AnTarget } from "core/annotationsModel";
import { AnBodyItemType, mkTextSelector, mkSvgSelector } from "core/annotationsModel";

export interface TextSelection {
  selectedText: string;
  xPath: string;
  startOffset: number;
  endOffset: number;
}

export interface PageTarget {
  type: "PageTarget",
  pid: string; // URI of the landing page
}

export interface LinkTarget {
  type: "LinkTarget",
  pid: string; // URI of the landing page
  source: string; // The resource URI
}

export interface TextSelectionTarget {
  type: "TextSelectionTarget",
  pid: string; // URI of the landing page
  textSelection: TextSelection; // A selection on the landing page
}

export interface ImageSelectionTarget {
  type: "ImageSelectionTarget",
  pid: string; // URI of the landing page
  svgSelection: string; // SVG specifying a region of image
}

export interface ImageOnPageSelectionTarget {
  type: "ImageOnPageSelectionTarget",
  pid: string; // URI of the landing page
  source: string; // The resource URI
  svgSelection: string; // SVG specifying a region of image
}

export type Target = PageTarget|LinkTarget|TextSelectionTarget|ImageSelectionTarget|ImageOnPageSelectionTarget;

export function mkTarget(target: Target): AnTarget {
  const tBase = {
    id: target.pid, 
    type: AnBodyItemType.SPECIFIC_RESOURCE
  };
  const source = (target as LinkTarget).source;
  const ts = (target as TextSelectionTarget).textSelection;
  const svg = (target as ImageSelectionTarget).svgSelection;
  
  return matchSwitch(target.type, {
    ["PageTarget"]: () => tBase,
    ["LinkTarget"]: () => ({ ...tBase, source }),
    ["TextSelectionTarget"]: () => ({ 
      ...tBase,
      selector: mkTextSelector(ts.selectedText, ts.xPath, ts.startOffset, ts.endOffset) }),
    ["ImageSelectionTarget"]: () => ({ ...tBase, selector: mkSvgSelector(svg) }),
    ["ImageOnPageSelectionTarget"]: () => ({ ...tBase, source, selector: mkSvgSelector(svg) })
  });
}

export function guessTarget(
{pid, source, textSelection, svgSelection}: {
   pid: string|undefined;
   source: string|undefined;
   textSelection: TextSelection|undefined;
   svgSelection: string|undefined;
}): Target|null {
  return (
    pid ?
      !source && !textSelection && !svgSelection ? 
        { type: "PageTarget", pid } as PageTarget
      : source && !textSelection && !svgSelection ?
        { type: "LinkTarget", pid, source } as LinkTarget
      : !source && textSelection && !svgSelection ?
        { type: "TextSelectionTarget", pid, textSelection } as TextSelectionTarget
      : !source && !textSelection && svgSelection ?
        { type: "ImageSelectionTarget", pid, svgSelection } as ImageSelectionTarget
      : source && !textSelection && svgSelection ?
        { type: "ImageOnPageSelectionTarget", pid, source, svgSelection} as ImageOnPageSelectionTarget
      : null
    : null
  );
}