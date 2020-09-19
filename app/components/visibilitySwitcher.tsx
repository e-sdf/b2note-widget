import * as React from "react";
import * as anModel from "core/annotationsModel";
import { PrivateIcon, PublicIcon } from "./icons";

export interface Props {
  text: boolean;
  small?: boolean;
  visibility: anModel.VisibilityEnum;
  setVisibility(visibility: anModel.VisibilityEnum): void;
}

export default function VisibilitySwitcher(props: Props): React.FunctionComponentElement<Props> {

  const [visibility, setVisibility] = React.useState(props.visibility);
  const isPrivate = () => visibility === anModel.VisibilityEnum.PRIVATE; 
  const isPublic = () => visibility === anModel.VisibilityEnum.PUBLIC; 

  function privateCls(): string {
    return isPrivate() ? "btn-primary": "btn-outline-primary";
  }

  function publicCls(): string {
    return isPublic() ? "btn-primary": "btn-outline-primary";
  }

  function renderPrivateBtn(): React.ReactElement {
    return (
      <button 
        className={`btn ${privateCls()} ${props.small ? "btn-sm" : ""}`} 
        style={{borderTopLeftRadius: "40%", borderBottomLeftRadius: "40%"}}
        data-toggle="tooltip" data-placement="bottom" title={`${isPublic() ? "Make p" : "P"}rivate`}
        disabled={isPrivate()}
        onClick={() => {
          setVisibility(anModel.VisibilityEnum.PRIVATE);
          props.setVisibility(anModel.VisibilityEnum.PRIVATE);
        }}>
        {props.text ? "Private " : ""}
        <PrivateIcon/>
      </button>
    );
  }

  function renderPublicBtn(): React.ReactElement {
    return (
      <button 
        className={`btn ${publicCls()} ${props.small ? "btn-sm" : ""}`} 
        style={{borderTopRightRadius: "40%", borderBottomRightRadius: "40%"}}
        data-toggle="tooltip" data-placement="bottom" title={`${isPrivate() ? "Make p" : "P"}ublic`}
        disabled={isPublic()}
        onClick={() => {
          setVisibility(anModel.VisibilityEnum.PUBLIC);
          props.setVisibility(anModel.VisibilityEnum.PUBLIC);
        }}>
        {props.text ? "Public " : ""}
        <PublicIcon/>
      </button>
    );
  }

  return (
    <div className="btn-group" role="group">
      {renderPrivateBtn()}
      {renderPublicBtn()}
    </div>
  );
}
