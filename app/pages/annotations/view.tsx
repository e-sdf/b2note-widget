import * as React from "react";
import * as anModel from "core/annotationsModel";
import type { SysContext, AppContext } from "app/context";
import AnList from "app/components/anList";
import { LoaderFilter } from "./loaderFilter";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function AnnotationsPage(props: Props): React.FunctionComponentElement<Props> {
  const loaderRef = React.useRef(null as any);
  const [showFilter, setShowFilter] = React.useState(true);
  const [annotations, setAnnotations] = React.useState(null as Array<anModel.Annotation>|null);

  function reload(): void {
    if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
  }

  return (
    <>
      {showFilter ?
        <div className="container-fluid bg-light border-bottom pb-2">
          <LoaderFilter
            ref={loaderRef}
            sysContext={props.sysContext}
            appContext={props.appContext}
            annotationsLoadedHandler={setAnnotations}/>
        </div>
      : <></>}
      <div className="anl-table pt-1" style={showFilter ? {} : { height: "460px" }}>
        {annotations ?
          <AnList
            sysContext={props.sysContext}
            appContext={props.appContext}
            annotations={annotations}
            changedHandler={reload}
            ontologyInfoHandler={(visible) => setShowFilter(!visible)}/>
          : <span className="font-italic">No annotations matching the filters</span>}
      </div>
    </>
  );
}
