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
  pidName?: string;
}

export interface LinkTarget {
  type: "LinkTarget",
  pid: string; // URI of the landing page
  pidName?: string;
  source: string; // The resource URI
  sourceName?: string;
}

export interface TextSelectionTarget {
  type: "TextSelectionTarget",
  pid: string; // URI of the landing page
  pidName?: string;
  textSelection: TextSelection; // A selection on the landing page
}

export interface ImageSelectionTarget {
  type: "ImageSelectionTarget",
  pid: string; // URI of the landing page
  pidName?: string;
  svgSelection: string; // SVG specifying a region of image
}

export interface ImageOnPageSelectionTarget {
  type: "ImageOnPageSelectionTarget",
  pid: string; // URI of the landing page
  pidName?: string;
  source: string; // The resource URI
  sourceName?: string;
  svgSelection: string; // SVG specifying a region of image
}

export type Target = PageTarget|LinkTarget|TextSelectionTarget|ImageSelectionTarget|ImageOnPageSelectionTarget;

export function mkTarget(target: Target): AnTarget {
  const tBase = {
    id: target.pid, 
    ... target.pidName ? { idName: target.pidName } : {},
    type: AnBodyItemType.SPECIFIC_RESOURCE
  };
  const source = (target as LinkTarget).source;
  const sourceName = (target as LinkTarget).sourceName;
  const ts = (target as TextSelectionTarget).textSelection;
  const svg = (target as ImageSelectionTarget).svgSelection;
  
  return matchSwitch(target.type, {
    ["PageTarget"]: () => tBase,
    ["LinkTarget"]: () => ({ ...tBase, source, sourceName }),
    ["TextSelectionTarget"]: () => ({ 
      ...tBase,
      selector: mkTextSelector(ts.selectedText, ts.xPath, ts.startOffset, ts.endOffset) }),
    ["ImageSelectionTarget"]: () => ({ ...tBase, selector: mkSvgSelector(svg) }),
    ["ImageOnPageSelectionTarget"]: () => ({ ...tBase, source, sourceName, selector: mkSvgSelector(svg) })
  });
}

export function guessTarget(
{pid, pidName, source, sourceName, textSelection, svgSelection}: {
   pid: string|undefined;
   pidName: string|undefined;
   source: string|undefined;
   sourceName: string|undefined;
   textSelection: TextSelection|undefined;
   svgSelection: string|undefined;
}): Target|null {
  return (
    pid ?
      !source && !textSelection && !svgSelection ? 
        { type: "PageTarget", pid, pidName } as PageTarget
      : source && !textSelection && !svgSelection ?
        { type: "LinkTarget", pid, pidName, source, sourceName } as LinkTarget
      : !source && textSelection && !svgSelection ?
        { type: "TextSelectionTarget", pid, pidName, textSelection } as TextSelectionTarget
      : !source && !textSelection && svgSelection ?
        { type: "ImageSelectionTarget", pid, pidName, svgSelection } as ImageSelectionTarget
      : source && !textSelection && svgSelection ?
        { type: "ImageOnPageSelectionTarget", pid, pidName, source, sourceName, svgSelection} as ImageOnPageSelectionTarget
      : null
    : null
  );
}