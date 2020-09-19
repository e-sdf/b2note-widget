import * as React from "react";
import type { SectionProps } from "./defs";
import { imgHelpPath } from "./utils";
import * as icons from "app/components/icons";
import { renderFilterItemTr } from "./utils";

const btnCol = "#6c757d";

export default function AnnotationsSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        In the list of annotations you can
      </p>
      <ul>
        <li>browse existing annotations,</li>
        <li>view their details,</li>
        <li>filter the list of displayed annotations,</li>
        <li>export annotations to JSON-LD or RDF/XML.</li>
      </ul>

      <h3>Filtering the list of annotations</h3>
      <p>
        The Filters toolbar presents toggle buttons to filter the types of annotations displayed. Click on the buttons to switch on/off the individual filters.
      </p>
      <table className="table">
        <tbody>
          {renderFilterItemTr(<icons.AllFilesIcon style={{color: btnCol}}/>, "If on, annotations of all files are listed, otherwise just annotations of the currently annotated file are listed.")}
          {renderFilterItemTr(<icons.MineIcon style={{color: btnCol}}/>, "If on, annotations created by you are included, otherwise they are excluded.")}
          {renderFilterItemTr(<icons.OthersIcon style={{color: btnCol}}/>, "If selected, annotations created by others are included, otherwise they are exluded.")}
          {renderFilterItemTr(<icons.SemanticIcon style={{color: btnCol}}/>, "Include/exclude semantic type annotations")}
          {renderFilterItemTr(<icons.KeywordIcon style={{color: btnCol}}/>, "Include/exclude free-text keyword type annotation")}
          {renderFilterItemTr(<icons.CommentIcon style={{color: btnCol}}/>, "Include/exclude comment type annotations")}
        </tbody>
      </table>

      <h3>Exporting annotations</h3>
      <p>
        The list of annotations (filtered by the selected filters) can be exported and downloaded by clicking on the menu button:
      </p>
      <div className="dropdown ml-auto">
        <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <icons.DownloadIcon/>
        </button>
        <div className="dropdown-menu" aria-labelledby="anl-ddd">
          <button type="button"
            className="dropdown-item"
          >Download JSON-LD</button>
          <button type="button"
            className="dropdown-item"
          >Download RDF/XML</button>
        </div>
      </div>
      <p>
        The menu button offers two formats of exported file:
      </p>
      <ul>
        <li><a href="https://en.wikipedia.org/wiki/JSON-LD" target="_blank" rel="noopener noreferrer">JSON-LD</a></li>
        <li><a href="https://en.wikipedia.org/wiki/RDF/XML">RDF/XML</a></li>
      </ul>

      <h3>Annotation details</h3>
      <img src={imgHelpPath + "annotation.png"}/>
      <p>
        Annotations in the list follow the structure depicted in the figure. Initially, just the heaer line items (1)-(5) are displayed. When the line is made active on mouse-over, in case you are the author of the annotation, action buttons (6), (7) are displayed. On clicking the chevron (5), the detial line (8)-(10) is displayed. The individual pieces are:
      </p>
      <ul>
        <li>(1) ... Indication of annotation type, same symbols are used as in the filter buttons above</li>
        <li>(2) ... Annotation tag (value); in case of semantic type annotations, the tag can be clicked to obtain more details.</li>
        <li>(3) ... A number of ontologies defining the tag (semantic annotations only)</li>
        <li>(4) ... A number of files annotated with this tag.</li>
        <li>(5) ... A button for showing/hiding details of the annotation.</li>
        <li>(6) ... Edit annotation tag. After pressing, a tag label changes to an input field where the tag can be edited. It is not possible to change the type of annotation, just the label. In case you need to change the type of annotation, delete it and create a new one.</li>
        <li>(7) ... Delete the annotation. After pressing this button, a confirmation dialog appears below.</li>
        <li>(8) ... The annotation target (resource file) being annotated by this annotation.</li>
        <li>(9) ... Visit the landing page of the resource.</li>
        <li>(10) ... Download the annotation target file contents.</li>
      </ul>
    </>
  );
}
