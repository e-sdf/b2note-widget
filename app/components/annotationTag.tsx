import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as anModel from "../core/annotationsModel";
import { shorten } from "./utils";
import { SemanticIcon, KeywordIcon, CommentIcon } from "./icons";
import { Context } from "./context";

interface AnnotationProps {
  anRecord: anModel.AnRecord;
  context: Context;
  maxLen?: number;
  onClick?: () => void;
}

export default function AnnotationTag(props: AnnotationProps): React.FunctionComponentElement<AnnotationProps> {
  const anRecord = props.anRecord;
  const label = anModel.getLabel(anRecord);

  const icon = matchSwitch(anModel.getAnType(anRecord), {
    [anModel.AnRecordType.SEMANTIC]: () => <SemanticIcon className="text-secondary" />,
    [anModel.AnRecordType.KEYWORD]: () => <KeywordIcon className="text-secondary" />,
    [anModel.AnRecordType.COMMENT]: () => <CommentIcon className="text-secondary" />,
  });
  const itemStyle = anRecord.creator.id === props.context.user.id ? {} : { fontStyle: "italic" };
  const shortened = props.maxLen ? shorten(label, props.maxLen) : label;

  function renderSemanticLabel(): React.ReactElement {
    const ontologiesNo = anModel.getSources(anRecord).length;
    return (
      <a
        href="#"
        style={itemStyle}
        data-toggle="tooltip"
        data-placement="bottom"
        title={`${label} (present in ${ontologiesNo} ${
          ontologiesNo > 1 ? "ontologies" : "ontology"
        })`}
        onClick={props.onClick ? props.onClick : () => "nop"}
      >
        {`${shortened} (${ontologiesNo})`}
      </a>
    );
  }

  function renderOtherLabel(): React.ReactElement {
    return (
      <span
        style={itemStyle}
        data-toggle="tooltip"
        data-placement="bottom"
        title={label}
      >
        {shortened}
      </span>
    );
  }

  return (
    <React.Fragment>
      {icon}
      <span> </span>
      {anModel.isSemantic(anRecord)
        ? renderSemanticLabel()
        : renderOtherLabel()}
    </React.Fragment>
  );
}
