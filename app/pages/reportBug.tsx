import * as React from "react";

export default function ReportBugPage(): React.ReactElement {
  return (
    <div className="container-fluid pt-3 d-flex flex-row justify-content-center">
      <button className="btn btn-primary"
        onClick={() => window.open("https://github.com/e-sdf/b2note-widget/issues")}>
        Report bug on GitHub
      </button>
    </div>
  );
}
