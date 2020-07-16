import * as React from "react";
import * as anModel from "core/annotationsModel";
import type { ApiComponent } from "client/components/defs";
import AnList from "client/components/anList";
import { LoaderFilter } from "./loaderFilter";

export default function AnnotationsPage(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
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
            context={props.context}
            annotationsLoadedHandler={setAnnotations}/>
        </div>
      : <></>}
      <div className="anl-table pt-1" style={showFilter ? {} : { height: "460px" }}>
        {annotations ? 
          <AnList
            context={props.context}
            annotations={annotations}
            changedHandler={reload}
            ontologyInfoHandler={(visible) => setShowFilter(!visible)}
            authErrAction={props.authErrAction}/>
          : <span className="font-italic">No annotations matching the filters</span>}
      </div>
    </>
  );
}
