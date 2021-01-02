import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import * as icons from "./icons";
import * as anModel from "core/annotationsModel";
import * as anApi from "../api/annotations";
import { AnBodyTagEditor  } from "./tagEditor";
import SpinningWheel from "../components/spinningWheel";
import Alert from "./alert";
import { ActionEnum, anNotify } from "app/notify";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  annotation: anModel.Annotation;
  editedHandler?: (edited: boolean) => void;
  anChangedHandler?: (newAn: anModel.Annotation) => void;
}

export default function AnTagView(props: Props): React.FunctionComponentElement<Props> {
  const [edited, setEdited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const annotation = props.annotation;
  const mbUser = props.appContext.mbUser;

  React.useEffect(() => props.editedHandler ? props.editedHandler(edited) : undefined, [edited]);

  function updateAn(newBody: anModel.AnBody): void {
    if (mbUser) {
      setLoading(true);
      anApi.patchAnnotationBody(mbUser, props.annotation.id, newBody, props.appContext.authErrAction).then(
        (newAn) => {
          setLoading(false);
          anNotify(props.sysContext.config, ActionEnum.EDIT, newAn);
          if (props.anChangedHandler) { props.anChangedHandler(newAn); }
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  return (
    <>
      {edited ?
        <div style={{marginLeft: "5px"}}>
          <AnBodyTagEditor
            appContext={props.appContext}
            anBody={annotation.body}
            cancelledHandler={() => setEdited(false)}
            updateHandler={(newBody) => { setEdited(false); updateAn(newBody); }}/>
        </div>
      :
        <button type="button"
          className="btn btn-sm btn-outline-primary"
          data-toggle="tooltip" data-placement="bottom" title="Change annotation"
          onClick={() => setEdited(true)}>
          <icons.EditIcon/>
        </button>
      }
      {errorMessage || loading ?
        <div className="row mt-2 justify-content-center">
          <SpinningWheel show={loading}/>
          <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
        </div>
      : <></>
      }
    </>
  );
}
