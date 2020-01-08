import * as React from "react";
import * as ReactDOM from "react-dom";
import { Page } from "../pages";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import { AnnotateHelp } from "./annotate";
import { AnnotationsHelp } from "./annotations";
import { SearchHelp } from "./search";
import { ProfileHelp } from "./profile";

export enum HelpSection {
  ANNOTATE = "annotate",
  ANNOTATIONS = "annotations",
  SEARCH = "search",
  PROFILE = "profile",
  TOC = "toc"
}

interface ToCProps {
  sectionHandle(section: HelpSection): void;
}

export function ToC(props: ToCProps): React.FunctionComponentElement<ToCProps> {
  return (
    <div className="mt-2">
      <h2>Table of Contents</h2>
      <ul>
        <li><a href="#" onClick={() => props.sectionHandle(HelpSection.ANNOTATE)}>Annotating</a></li>
        <li><a href="#" onClick={() => props.sectionHandle(HelpSection.ANNOTATIONS)}>Annotations List</a></li>
        <li><a href="#" onClick={() => props.sectionHandle(HelpSection.SEARCH)}>Searching Annotations</a></li>
        <li><a href="#" onClick={() => props.sectionHandle(HelpSection.PROFILE)}>User Profile</a></li>
      </ul>
    </div>
  );
}

interface HelpPageProps {
  section: HelpSection;
}

export function HelpPage(props: HelpPageProps): React.FunctionComponentElement<HelpPageProps> {
  const [section, setSection] = React.useState(props.section);

  function renderSection(section: HelpSection): React.ReactElement {
    return matchSwitch(section, {
      [HelpSection.ANNOTATE]: () => <AnnotateHelp/>,
      [HelpSection.ANNOTATIONS]: () => <AnnotationsHelp/>,
      [HelpSection.SEARCH]: () => <SearchHelp/>,
      [HelpSection.PROFILE]: () => <ProfileHelp/>,
      [HelpSection.TOC]: () => <ToC sectionHandle={setSection}/>
    });
  }

  function renderTocLink(): React.ReactElement {
    return (
      <div className="row mt-1 pb-2" style={{borderBottom: "1px solid gray"}}>
        <div className="col-sm">
          <a href="#" onClick={() => setSection(HelpSection.TOC)}>Table of Contents</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {section === HelpSection.TOC ? <></> : renderTocLink()}
      <div className="row">
        <div className="col-sm" style={{height: "422px", overflow: "auto"}}>
          {renderSection(section)}
        </div>
      </div>
    </div>
  );
}

export function render(section: HelpSection): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<HelpPage section={section}/>, container);
  } else {
    console.error("#page element missing");
  }
}

