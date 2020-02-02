import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../context";
import { Navbar } from "./navbar";

interface Props {
  context: Context;
}

function Widget(props: Props): React.FunctionComponentElement<Context> {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <Navbar context={props.context}/>
      <div id="page"></div>
    </div>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("widget");
  if (container) {
    ReactDOM.render(<Widget context={context}/>, container);
    console.log(`Annotating pid="${context.target.pid}" source="${context.target.source}"`);
  } else {
    console.error("widget DOM element missing");
  }
}

