import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as anModel from "../core/annotationsModel";
import { AuthUser } from "../context";
import { shorten } from "../components/utils";
import { SemanticIcon, KeywordIcon, CommentIcon } from "./icons";

interface AnnotationProps {
  anRecord: anModel.AnRecord;
  mbUser: AuthUser|null;
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
  const itemStyle = 
    props.mbUser ? 
      props.mbUser.profile.id === anModel.getCreatorId(anRecord) ? {} : { fontStyle: "italic" }
    : { fontStyle: "italic" }; 

  function renderSemanticLabel(): React.ReactElement {
    const shortened = props.maxLen ? shorten(label, props.maxLen - 4) : label;
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
        onClick={props.onClick ? props.onClick : () => void(0)}
      >
        {`${shortened} (${ontologiesNo})`}
      </a>
    );
  }

  function renderOtherLabel(): React.ReactElement {
    const shortened = props.maxLen ? shorten(label, props.maxLen) : label;
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
    <div>
      {icon}
      <span> </span>
      {anModel.isSemantic(anRecord)
        ? renderSemanticLabel()
        : renderOtherLabel()}
    </div>
  );
}
