import * as React from "react";
import type { SectionProps } from "./defs";
import * as icons from "client/components/icons";

export default function SearchSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        Search functionality serves for finding resources with specified annotations. There are two ways of constructing search queries:
      </p>
      <ol>
        <li>Using the Query Builder</li>
        <li>Writing a search query directly</li>
      </ol>
      <p>
        These two approaches may be combined, i.e. it is possible to construct the query using the Query Builder and then edit it manually.
      </p>
      
      <h3>Query Builder</h3>
      <p>
        The Query Builder enables to add search terms and logical connectives that form a search query (see below for its syntax). The <span className="text-primary"><icons.AddIcon/></span> button adds the term into the query. Next, you can add one of the logical connectives AND, OR, XOR, NOT and another term. You can build a complex query by repeating these steps.
      </p>
      <p>
        The following types of terms are available:
      </p>
      <ul>
        <li><strong>Any (regular expression)</strong> ... Matches all three types of annotation tags. The expression is expected to be a <a href="https://www.regextester.com/jssyntax.html" target="_blank" rel="noopener noreferrer">JavaScript regular expression</a>.</li>
        <li><strong>Semantic tag</strong> ... Search for a specific semantic tag. The field uses ontology autocomplete similarly to creating a semantic tag.</li>
        <li><strong>Free-text keyword</strong> ... Search for a specific keyword. Note that the match is exact, if you want to search for a part of a keyword, use <em>&quot;Any (regular expression)&quot;</em>.</li>
        <li><strong>Comment</strong> ... Search for a specific comment. Note that the match is exact, if you want to search for a part of a comment, use <em>&quot;ny (regular expression)&quot;</em>.</li>
      </ul>

      <h3>Query Editor</h3>
      <p>
        The query editor contains the resulting search query. The Query Builder adds the syntax of terms and logical connectives:
      </p>

      <h4>Terms</h4>
      <p>
        Term type is denoted by &quot;x:&quot;, where &quot;x&quot; specifies the type:
      </p>
      <ul>
        <li><span style={{fontFamily: "monospace"}}>s:aSemanticTag</span> ... semantic tag</li>
        <li><span style={{fontFamily: "monospace"}}>k:aKeywordTag</span> ... free-text keyword tag</li>
        <li><span style={{fontFamily: "monospace"}}>c:aComment</span> ... search for a text contained in a comment</li>
        <li><span style={{fontFamily: "monospace"}}>r:/regex/</span> ... <a href="https://www.regextester.com/jssyntax.html" target="_blank" rel="noopener noreferrer">regular expression matching any tag</a></li>
      </ul>
      <p>
        Semantic tags need to be identified in the ontology index. As such, it is advisable to use the Query Builder that offers terms autocomplete from the ontology index.
      </p>
      <p>
        The &quot;s:&quot;, &quot;k:&quot; and &quot;c:&quot; terms <em>must not contain spaces</em> or must be enclosed in double quotes, e.g. <span style={{fontFamily: "monospace"}}>k:&quot;two words&quot;</span>. The Query Builder automatically adds the quotes where needed.
      </p>

      <h4>Logical Connectives</h4>
      <p>
        The terms are connected by connectives:
      </p>
      <ul>
        <li><em>Unary connective:</em> <span style={{fontFamily: "monospace"}}>NOT</span> ... a logical negation, i.e. the following term <em>must not</em> be used as the annotation</li>
        <li><em>Binary connectives:</em> <span style={{fontFamily: "monospace"}}>AND</span> (conjunction), <span style={{fontFamily: "monospace"}}>OR</span> (disjunction), <span style={{fontFamily: "monospace"}}>XOR</span> (exclusive OR)</li>
      </ul>
      <p>
        All connectives have the same precedence, i.e. the expression is evaluated from left to right. It is possible to change the precedence using parentheses, such as in this schematic example:
      </p>
      <p style={{fontFamily: "monospace"}}>
        s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;) XOR r:/regex/
      </p>
      <p>
        An error in the search expression grammar is indicated by the <icons.ErrorIcon style={{color: "red"}}/> sign. With mouse hover, you can display the parse error. A well-formed expression is indicated by the <icons.OKIcon style={{color: "green"}}/> sign right to the expression text area.
      </p>

      <h3>Search Results</h3>
      <p>
        By pressing the <span className="btn btn-sm btn-primary"><icons.SearchIcon/> Search</span> button, the search is started. After it is finished, either "No results" is shown or the results list is shown.
      </p>
      <p>
        The results structure, icons and features are similar to the Annotations list.
      </p>
      <p>
        To repeat the search, press the <span className="btn btn-sm btn-primary"><icons.SearchIcon/></span> button in the main menu again.
      </p>
    </>
  );
}

