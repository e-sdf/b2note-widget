import * as React from "react";
import { SectionProps } from "./defs";
import * as icons from "../../components/icons";

export function AnnotateSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {

  return (
    <>
      <h2>{props.header}</h2>
      <p>
        The main panel is divided into 3 tabs. Each tab contains a simple form for creating an annotation of one of the 3 types defined in B2NOTE:
      </p>
      <table className="table">
        <tbody>
          <tr>
            <th>Semantic tag:</th>
            <td>
              Create an annotation that uses a term defined in a controlled vocabulary as a tag. Semantic tags are distinguished in B2NOTE by symbol <icons.SemanticIcon/>.
            </td>
          </tr>
          <tr>
            <th>Free-text keyword:</th>
            <td>
              Create an annotation that uses your own keyword as a plain-text tag. Keyword tags are distinguished in B2NOTE by symbol <icons.KeywordIcon/>.
            </td>
          </tr>
          <tr>
            <th>Comment:</th>
            <td>
              Create an annotation containing a longer piece of text. Comments are distinguished in B2NOTE by symbol <icons.CommentIcon/>.
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

