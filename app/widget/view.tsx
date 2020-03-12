import * as React from "react";
import * as ReactDOM from "react-dom";
import * as config from "../config";
import { Context } from "../context";
import { Navbar } from "./navbar";

interface Props {
  context: Context;
}

function WidgetInfo(): React.ReactElement {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <p style={{fontStyle: "italic"}}>
        Use POST request to load the annotation target.
      </p>
    </div>
  );
}

function Widget(props: Props): React.FunctionComponentElement<Context> {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <div id="widget-version">
        <a href="https://github.com/e-sdf/b2note-reactjs/releases" target="_blank" rel="noopener noreferrer">
          {config.version}
        </a>
      </div>
      <Navbar context={props.context}/>
      <div id="page"></div>
    </div>
  );
}

export function canRenderWidgetInfo(): boolean {
 return document.getElementById("b2note-widget-info") ? true : false;
}

export function canRenderWidget(): boolean {
 return document.getElementById("b2note-widget") ? true : false;
}

export function renderWidgetInfo(): void {
  const container = document.getElementById("b2note-widget-info");
  if (container) {
    ReactDOM.render(<WidgetInfo/>, container);
  } else {
    console.error("widget DOM element missing");
  }
}

export function renderWidget(context: Context): void {
  const container = document.getElementById("b2note-widget");
  if (container) {
    ReactDOM.render(<Widget context={context}/>, container);
    console.log(`Annotating pid="${context.target.pid}" source="${context.target.source}"`);
  } else {
    console.error("widget DOM element missing");
  }
}
