import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as anModel from "../core/annotationsModel";
import { AuthUser } from "../context";
import { shorten } from "../components/utils";
import { SemanticIcon, KeywordIcon, CommentIcon } from "./icons";

interface Props {
  annotation: anModel.Annotation;
  mbUser: AuthUser|null;
  maxLen?: number;
  onClick?: () => void;
}

export default function AnTag(props: Props): React.FunctionComponentElement<Props> {
  const annotation = props.annotation;
  const label = anModel.getLabel(annotation);

  const icon = matchSwitch(anModel.getAnType(annotation), {
    [anModel.AnnotationType.SEMANTIC]: () => <SemanticIcon className="text-secondary" />,
    [anModel.AnnotationType.KEYWORD]: () => <KeywordIcon className="text-secondary" />,
    [anModel.AnnotationType.COMMENT]: () => <CommentIcon className="text-secondary" />,
  });

  function renderSemanticLabel(): React.ReactElement {
    const shortened = props.maxLen ? shorten(label, props.maxLen - 4) : label;
    const ontologiesNo = anModel.getSources(annotation).length;
    return (
      <a
        href="#"
        data-toggle="tooltip"
        data-placement="bottom"
        title={`${label} (present in ${ontologiesNo} ${
          ontologiesNo > 1 ? "ontologies" : "ontology"
        })`}
        onClick={props.onClick ? props.onClick : () => void(0)}>
        {`${shortened} (${ontologiesNo})`}
      </a>
    );
  }

  function renderOtherLabel(): React.ReactElement {
    const shortened = props.maxLen ? shorten(label, props.maxLen) : label;
    return (
      <span
        data-toggle="tooltip"
        data-placement="bottom"
        title={label}
      >
        {shortened}
      </span>
    );
  }

  return (
    <div>
      {icon}
      <span> </span>
      {anModel.isSemantic(annotation)
        ? renderSemanticLabel()
        : renderOtherLabel()}
    </div>
  );
}
