import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import { $enum } from "ts-enum-util";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HelpSection } from "./defs";
import { AboutSection } from "./about";
import { MenuSection } from "./menu";
import { AnnotateSection } from "./annotate";
import { AnnotationsSection } from "./annotations";
import { SearchSection } from "./search";
import { ProfileSection } from "./profile";
import { SupportSection } from "./support";

interface ToCProps {
  sectionHandle(section: HelpSection): void;
  header: string;
}

export function header(section: HelpSection): string {
  return matchSwitch(section, {
    [HelpSection.ABOUT]: () => "About B2NOTE",
    [HelpSection.MENU]: () => "The Main Menu",
    [HelpSection.ANNOTATE]: () => "Annotating",
    [HelpSection.ANNOTATIONS]: () => "List of Annotations",
    [HelpSection.SEARCH]: () => "Searching Annotations",
    [HelpSection.PROFILE]: () => "User Profile",
    [HelpSection.SUPPORT]: () => "Support",
    [HelpSection.TOC]: () => "Table of Contents"
  });
}

export function ToC(props: ToCProps): React.FunctionComponentElement<ToCProps> {

  function butLast<T>(arr: T[]): T[] {
    return arr.filter(i => i !== _.last(arr));
  }

  return (
    <div className="mt-2">
      <h2>{props.header}</h2>
      <ul>
        {butLast($enum(HelpSection).getKeys()).map(section =>
          <li key={section}>
            <a href="#" onClick={() => props.sectionHandle(HelpSection[section])}>{header(HelpSection[section])}</a>
          </li>
        )}
      </ul>
    </div>
  );
}

interface HelpPageProps {
  section: HelpSection;
}

export function HelpPage(props: HelpPageProps): React.FunctionComponentElement<HelpPageProps> {
  const [section, setSection] = React.useState(props.section);
  const sectionRef = React.useRef(null);

  function renderSection(): React.ReactElement {
    if (sectionRef.current) {
      const sectionDOM = (sectionRef.current as unknown) as Element;
      sectionDOM.scrollTop = 0;
    }
    return matchSwitch(section, {
      [HelpSection.ABOUT]: () => <AboutSection header={header(HelpSection.ABOUT)} redirectFn={setSection}/>,
      [HelpSection.MENU]: () => <MenuSection header={header(HelpSection.MENU)} redirectFn={setSection}/>,
      [HelpSection.ANNOTATE]: () => <AnnotateSection header={header(HelpSection.ANNOTATE)} redirectFn={setSection}/>,
      [HelpSection.ANNOTATIONS]: () => <AnnotationsSection header={header(HelpSection.ANNOTATIONS)} redirectFn={setSection}/>,
      [HelpSection.SEARCH]: () => <SearchSection header={header(HelpSection.SEARCH)} redirectFn={setSection}/>,
      [HelpSection.PROFILE]: () => <ProfileSection header={header(HelpSection.PROFILE)} redirectFn={setSection}/>,
      [HelpSection.SUPPORT]: () => <SupportSection header={header(HelpSection.SUPPORT)} redirectFn={setSection}/>,
      [HelpSection.TOC]: () => <ToC sectionHandle={setSection} header={header(HelpSection.TOC)}/>
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
        <div ref={sectionRef} className="col-sm" style={{height: "422px", overflow: "auto"}}>
          {renderSection()}
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

