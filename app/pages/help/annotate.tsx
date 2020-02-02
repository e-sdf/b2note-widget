import * as React from "react";
import { serverUrl } from "../../config";
import { SectionProps } from "./defs";
import * as icons from "../../components/icons";

const imgUrl = serverUrl + "/img/help/";

export function AnnotateSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        The main panel is divided into 3 tabs. Each tab contains a simple form for creating an annotation of one of the 3 types supported by B2NOTE:
      </p>
      <img src={imgUrl + "annotateTypes.jpg"}/>
      <ol>
        <li>
          <strong><a href="#semantic">Semantic tag:</a></strong> Create an annotation that uses a term defined in a controlled vocabulary
            as a tag. Semantic tags are distinguished in B2NOTE by symbol <icons.SemanticIcon />.
            </li>
        <li>
          <strong><a href="#keyword">Free-text keyword:</a></strong> Create an annotation that uses your own keyword as a plain-text tag. Keyword tags are distinguished in B2NOTE by symbol <icons.KeywordIcon />.
            </li>
        <li>
          <strong><a href="#comment">Comment:</a></strong> Create an annotation containing a longer piece of text. Comments are distinguished in B2NOTE by symbol <icons.CommentIcon />.
            </li>
      </ol>

      <h3 id="semantic">Creating a semantic tag annotation</h3>
      <p>
        The semantic tag annotations use a term defined in a controlled vocabulary as a tag. This type of annotations thus benefits from a curated and uniquely identified linked-data material.
      </p>
      <p>
        Clicking the text-area then typing-in the first letters of the term you want triggers the autocomplete functionality, which provides a list of suggestions.
      </p>
      <img src={imgUrl + "autocomplete.png"} style={{marginBottom: "1em"}}/>
      <p>
        From the list of suggestions, you can then select your term of interest amongst the extensive B2NOTE index.
      </p>
      <p>
        After selecting one of the suggestions, click <span className="btn btn-sm btn-primary"><icons.CreateIcon/></span>&nbsp;to create the annotation.
      </p>
      <p>
        If case the requested term is not found in the index, a &quot;New selection:&quot; is indicated. When you select it, you are given an option to create a free-text keyword instead or select a different term.
      </p>
      <img src={imgUrl + "semanticKeyword.png"}/>
      <img src={imgUrl + "semanticKeyword2.png"}/>
      
      <h3 id="keyword">Creating a free-text keyword annotation</h3>
      <p>
        Free-text keyword annotations are designed for cases when the exact term you want is missing from the <a href="#semantic">&quot;Semantic tag&quot; autocomplete</a> and you want a plain-text tag to be used in the annotation.
      </p>
      <p>
        Annotations of this type contain plain text information as opposed to linked-data, thus not allowing the full range of benefits provided by the <a href="#semantic">&quot;Semantic tag&quot; type</a>.
      </p>
      <img src={imgUrl + "keyword.png"}/>
      <p>
        After typing the text for your custom keyword in the input, click <span className="btn btn-sm btn-primary"><icons.CreateIcon/></span>&nbsp;to create the annotation.
      </p>
      <p>
        B2NOTE then checks if the provided keyword is not present in the index of semantic tags. In case it finds a match, it offers to create a semantic tag instead of the keyword, which is highly advised.
      </p>
      <img src={imgUrl + "keywordSemantic.png"}/>

      <h3 id="comment">Creating a comment annotation</h3>
      <p>
        Comment annotations are designed for annotating using longer pieces of text. That is possibly a more verbose text not intended for the purpose of tagging, such as commenting or leaving evaluation or a general feedback.
      </p>
      <p>
        Similarly to &quot;free-text keyword&quot;, annotations of this type contain plain text information as opposed to linked-data, thus not allowing the full range of benefits provided by the <a href="#semantic">&quot;Semantic tag&quot; type</a>.
      </p>
      <img src={imgUrl + "comment.png"}/>
      <p>
        After typing-in the text of the comment, click <span className="btn btn-sm btn-primary"><icons.CreateIcon/></span>&nbsp;to create the annotation.
      </p>
    </>
  );
}

