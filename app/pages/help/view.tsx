import * as React from "react";
import * as ReactDOM from "react-dom";
import { Page } from "../pages";

function AnnotateText(): React.ReactElement {
  return (
    <>
      <h2>Annotating</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam pharetra volutpat leo, quis posuere ex tempus et. Nam volutpat mauris nec quam vulputate, ut posuere nunc lacinia. Aliquam vulputate non mi suscipit elementum. Nam suscipit turpis non tellus viverra faucibus. Suspendisse enim ligula, rhoncus quis odio in, elementum gravida massa. Nullam eu enim porta, hendrerit orci sed, rhoncus nibh. Nullam commodo cursus sollicitudin. Nam nisl lectus, pellentesque nec ante id, tincidunt dapibus justo. Vestibulum et orci vel tortor convallis laoreet vestibulum at nibh. Quisque interdum lectus ipsum, vel gravida metus ornare ut. Praesent ac turpis luctus dolor sagittis consequat. Duis commodo massa et magna volutpat finibus. Suspendisse laoreet metus tincidunt ornare tristique. Nunc sit amet velit aliquet, tempus erat ut, vestibulum nisl. Suspendisse venenatis mollis nulla.
      </p>
    </>
  );
}

function AnnotationsText(): React.ReactElement {
  return (
    <>
      <h2>List of Annotations</h2>
      <p>
        Vestibulum libero magna, volutpat sit amet lorem id, dignissim lobortis tortor. Nullam accumsan vel lacus ac faucibus. Morbi dignissim rhoncus massa. Nam sit amet hendrerit nisi, nec varius mauris. Duis bibendum nisl vulputate rhoncus tincidunt. Vivamus efficitur facilisis quam, id aliquam massa fringilla ut. Nunc a tellus nec tellus fringilla accumsan sed sed sapien. Mauris id elementum turpis. In consectetur sodales tortor eget ultrices. Maecenas eget ex quam. Donec vel ligula tempor, posuere lectus non, auctor nulla.
      </p>
    </>
  );
}

function SearchText(): React.ReactElement {
  return (
    <>
      <h2>Search</h2>
      <p>
        Etiam volutpat odio et rhoncus ultrices. Ut dapibus porttitor dolor, nec porttitor nulla accumsan at. Nullam dictum nunc ex, quis egestas mauris blandit sed. Integer rhoncus ipsum eu dictum mattis. Aenean vitae enim ex. Quisque a nibh quis nibh interdum convallis nec nec elit. Vivamus ultrices enim a fringilla congue.
      </p>
    </>
  );
}

function ProfileText(): React.ReactElement {
  return (
    <>
      <h2>User Profile</h2>
      <p>
        Nullam feugiat, elit vel volutpat lacinia, mauris nisl pulvinar urna, ultricies pellentesque lacus enim ac augue. Donec mattis pretium nulla, euismod venenatis sem vestibulum a. Suspendisse aliquam pulvinar purus a vehicula. Quisque lacinia tortor mi, vitae tristique nunc congue quis. Aenean dolor urna, venenatis vel pharetra et, accumsan nec lectus. Duis dapibus posuere suscipit. Integer vitae pellentesque metus. Praesent sit amet erat semper, fringilla nulla id, dictum lectus. Quisque a bibendum quam. Sed lobortis, odio sit amet gravida pellentesque, sapien enim molestie arcu, non tincidunt ex libero blandit odio. Morbi dictum magna in felis blandit semper. Nulla commodo tempor massa in iaculis. Morbi aliquet, nisl non consequat fermentum, augue nisi malesuada orci, sit amet lacinia ex lectus efficitur quam. Maecenas sed ornare diam. Nunc at varius nunc. Etiam ligula odio, vestibulum id elit vel, dapibus porttitor dolor.
      </p>
    </>
  );
}

function ToC(): React.ReactElement {
  return (
    <div className="row mt-1 pb-2" style={{borderBottom: "1px solid gray"}}>
      <div className="col-sm">
        <a href="#">Table of Contents</a>
      </div>
    </div>
  );
}

function renderSection(section: Page): React.ReactElement {
  return (
    section === "annotate" ? <AnnotateText/>
    : section === "annotations" ? <AnnotationsText/>
    : section === "search" ? <SearchText/>
    : section === "profile" ? <ProfileText/>
    : <></>
  );
}

interface HelpPageProps {
  section: Page;
}

export function HelpPage(props: HelpPageProps): React.FunctionComponentElement<HelpPageProps> {
  return (
    <div className="container-fluid">
      <ToC/>
      <div className="row">
        <div className="col-sm" style={{height: "422px", overflow: "auto"}}>
          {renderSection(props.section)}
        </div>
      </div>
    </div>
  );
}

export function render(section: Page): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<HelpPage section={section}/>, container);
  } else {
    console.error("#page element missing");
  }
}

