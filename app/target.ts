import type { Target } from "./context";
import type { AnTarget } from "core/annotationsModel";
import { AnBodyItemType } from "core/annotationsModel";

export function mkTarget(target: Target): AnTarget {
  const id = target.pid;
  const source = target.source;

  return {
    id,
    ... source ? { source } : {},
    type: AnBodyItemType.SPECIFIC_RESOURCE
    };
  }
