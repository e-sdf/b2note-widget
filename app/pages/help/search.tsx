import * as React from "react";
import type { SectionProps } from "./defs";
import * as icons from "../../components/icons";

export function SearchSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        Search functionality serves for finding resources with specified annotations. Two types are available:
      </p>
      <ul>
        <li>Basic Search</li>
        <li>Advanced Search</li>
      </ul>
      
      <h3>Basic Search</h3>
      <p>
        Basic Search offers various types of searches and simple logic expressions.
      </p>
      <ul>
        <li><strong>Any (regular expression)</strong> ... Matches all three types of annotation tags. The expression is expected to be a <a href="https://www.regextester.com/jssyntax.html" target="_blank" rel="noopener noreferrer">JavaScript regular expression</a>.</li>
        <li><strong>Semantic tag</strong> ... Search for a specific semantic tag. The field uses ontology autocomplete similarly to creating a semantic tag.</li>
        <li><strong>Free-text keyword</strong> ... Search for a specific keyword. Note that the match is exact, if you want to search for a part of a keyword, use <em>&quot;Any (regular expression)&quot;</em>.</li>
        <li><strong>Comment</strong> ... Search for a specific comment. Note that the match is exact, if you want to search for a part of a comment, use <em>&quot;ny (regular expression)&quot;</em>.</li>
      </ul>
      <p>
        Searching for multiple tags is possible by pressing <span className="btn btn-secondary btn-sm"><icons.AddIcon/></span>. In that case a choice between &quot;Match any&quot; and &quot;Match all&quot; is presented.  
      </p>

      <h3>Advanced Search</h3>
      <p>
        &quot;Match all&quot; and &quot;Match any&quot; effectively create AND/OR logic formulas. If more complex logic formulas are needed, Advanced Search offers more expressive power. It consists of terms representing tags and logical operators. All binary operators have the same precedence; it is  possible to change it using parentheses. An example of a search expression (syntax explained below):
      </p>
      <p style={{fontFamily: "monospace"}}>
        s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;) XOR r:/regex/
      </p>
      <p>
        An error in the search expression is indicated by the <icons.ErrorIcon style={{color: "red"}}/> sign, while a well-formed expression is indicated by the <icons.OKIcon style={{color: "green"}}/> sign right to the expression text area.
      </p>
      <h4>Terms</h4>
      <p>
        Term type is denoted by &quot;x:&quot;, where &quot;x&quot; specifies the type:
      </p>
      <ul>
        <li><span style={{fontFamily: "monospace"}}>s:aSemanticTag</span> ... semantic tag</li>
        <li><span style={{fontFamily: "monospace"}}>k:aKeywordTag</span> ... free-text keyword tag</li>
        <li><span style={{fontFamily: "monospace"}}>c:aComment</span> ... comment tag</li>
        <li><span style={{fontFamily: "monospace"}}>r:/regex/</span> ... <a href="https://www.regextester.com/jssyntax.html" target="_blank" rel="noopener noreferrer">regular expression matching any tag</a></li>
      </ul>
      <p>
        Semantic tags need to be identified in the ontology index. As such, in case a semantic tag term &quot;s:aSemanticTag&quot; is present in the expression, an input box appears below enabling to search for the respective tag, i.e. &quot;aSemanticTag&quot; is effectively not the tag itself, but a mere identifier enabling to pair the actual semantic tag in the autocomplete input to be matched with the proper term.
      </p>
      <p>
        The &quot;s:&quot;, &quot;k:&quot; and &quot;c:&quot; terms <em>must not contain spaces</em> or must be enclosed in double quotes, e.g. <span style={{fontFamily: "monospace"}}>k:&quot;two words&quot;</span>.
      </p>
      <h4>Operators</h4>
      <p>
        The terms are connected by operators:
      </p>
      <ul>
        <li><em>Unary operator:</em> <span style={{fontFamily: "monospace"}}>NOT</span> ... a logical negation, i.e. the following term <em>must not</em> be used as the annotation</li>
        <li><em>Binary operators:</em><span style={{fontFamily: "monospace"}}>AND</span> (conjunction), <span style={{fontFamily: "monospace"}}>OR</span> (disjunction), <span style={{fontFamily: "monospace"}}>XOR</span> (exclusive OR)</li>
      </ul>
    </>
  );
}

