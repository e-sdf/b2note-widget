import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as anModel from "core/annotationsModel";
import { shorten } from "./utils";
import { SemanticIcon, KeywordIcon, CommentIcon, QuestionIcon } from "./icons";

interface TagDisplayProps {
  maxLen?: number;
  onClick?: () => void;
}

interface AnTagDisplayProps extends TagDisplayProps {
  anBody: anModel.AnBody;
}
export function AnTagDisplay(props: AnTagDisplayProps): React.FunctionComponentElement<AnTagDisplayProps> {
  const anBody = props.anBody;
  const label = anModel.getLabelFromBody(anBody);

  const icon = matchSwitch(anModel.getAnBodyType(anBody), {
    [anModel.AnBodyType.SEMANTIC]: () => <SemanticIcon className="text-secondary" />,
    [anModel.AnBodyType.KEYWORD]: () => <KeywordIcon className="text-secondary" />,
    [anModel.AnBodyType.COMMENT]: () => <CommentIcon className="text-secondary" />,
    [anModel.AnBodyType.TRIPLE]: () => <QuestionIcon className="text-secondary" />,
    [anModel.AnBodyType.UNKNOWN]: () => <QuestionIcon className="text-secondary" />,
  });

  function renderSemanticLabel(): React.ReactElement {
    const shortened = props.maxLen ? shorten(label, props.maxLen - 4) : label;
    const ontologiesNo = anModel.getSourcesFromAnBody(anBody).length;
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
        title={label}>
        {shortened}
      </span>
    );
  }

  return (
    <div>
      {icon}
      <span> </span>
      {anModel.isSemanticAnBody(anBody)
        ? renderSemanticLabel()
        : renderOtherLabel()}
    </div>
  );
}
