import * as React from "react";
import * as anModel from "../../core/annotationsModel";
import { PrivateIcon, PublicIcon } from "../../components/icons";

export interface Props {
  visibility: anModel.VisibilityEnum;
  setVisibility(visibility: anModel.VisibilityEnum): void;
}

export default function VisibilitySwitcher(props: Props): React.FunctionComponentElement<Props> {

  const [visibility, setVisibility] = React.useState(props.visibility);

  React.useEffect(() => { props.setVisibility(visibility); }, [visibility]);

  function privateCls(): string {
    return visibility === anModel.VisibilityEnum.PRIVATE ? "btn-primary": "btn-outline-primary";
  }

  function publicCls(): string {
    return visibility === anModel.VisibilityEnum.PUBLIC ? "btn-primary": "btn-outline-primary";
  }

  return (
    <div className="btn-group d-flex flex-row justify-content-center mt-2"
      style={{margin: "10px 60px"}}
      role="group">
      <button className={"btn " + publicCls()} 
        disabled={visibility === anModel.VisibilityEnum.PUBLIC}
        onClick={() => setVisibility(anModel.VisibilityEnum.PUBLIC) }>
        Public <PublicIcon/>
      </button>
      <button className={"btn " + privateCls()} 
        disabled={visibility === anModel.VisibilityEnum.PRIVATE}
        onClick={() => setVisibility(anModel.VisibilityEnum.PRIVATE) }>
        Private <PrivateIcon/>
      </button>
    </div>
  );
}
