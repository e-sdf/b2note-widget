// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//let Elements = {};
//Elements.DOMPath = {};

/**
 * @param {!Node} node
 * @param {boolean=} optimized
 * @return {string}
 */
//Elements.DOMPath.xPath = function (node, optimized) {
    //if (node.nodeType === Node.DOCUMENT_NODE) {
        //return '/';
    //}

    //const steps = [];
    //let contextNode = node;
    //while (contextNode) {
        //const step = Elements.DOMPath._xPathValue(contextNode, optimized);
        //if (!step) {
            //break;
        //}  // Error - bail out early.
        //steps.push(step);
        //if (step.optimized) {
            //break;
        //}
        //contextNode = contextNode.parentNode;
    //}

    //steps.reverse();
    //return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
//};

/**
 * @param {!Node} node
 * @param {boolean=} optimized
 * @return {?Elements.DOMPath.Step}
 */
//Elements.DOMPath._xPathValue = function (node, optimized) {
    //let ownValue;
    //const ownIndex = Elements.DOMPath._xPathIndex(node);
    //if (ownIndex === -1) {
        //return null;
    //}  // Error.

    //switch (node.nodeType) {
        //case Node.ELEMENT_NODE:
            //if (optimized && node.getAttribute('id')) {
                //return new Elements.DOMPath.Step('//*[@id="' + node.getAttribute('id') + '"]', true);
            //}
            //ownValue = node.localName;
            //break;
        //case Node.ATTRIBUTE_NODE:
            //ownValue = '@' + node.nodeName;
            //break;
        //case Node.TEXT_NODE:
        //case Node.CDATA_SECTION_NODE:
            //ownValue = 'text()';
            //break;
        //case Node.PROCESSING_INSTRUCTION_NODE:
            //ownValue = 'processing-instruction()';
            //break;
        //case Node.COMMENT_NODE:
            //ownValue = 'comment()';
            //break;
        //case Node.DOCUMENT_NODE:
            //ownValue = '';
            //break;
        //default:
            //ownValue = '';
            //break;
    //}

    //if (ownIndex > 0) {
        //ownValue += '[' + ownIndex + ']';
    //}

    //return new Elements.DOMPath.Step(ownValue, node.nodeType === Node.DOCUMENT_NODE);
//};

/**
 * @param {!Node} node
 * @return {number}
 */
//Elements.DOMPath._xPathIndex = function (node) {
    //// Returns -1 in case of error, 0 if no siblings matching the same expression,
    //// <XPath index among the same expression-matching sibling nodes> otherwise.
    //function areNodesSimilar(left, right) {
        //if (left === right) {
            //return true;
        //}

        //if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE) {
            //return left.localName === right.localName;
        //}

        //if (left.nodeType === right.nodeType) {
            //return true;
        //}

        //// XPath treats CDATA as text nodes.
        //const leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
        //const rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;
        //return leftType === rightType;
    //}

    //const siblings = node.parentNode ? node.parentNode.children : null;
    //if (!siblings) {
        //return 0;
    //}  // Root node - no siblings.
    //let hasSameNamedElements;
    //for (let i = 0; i < siblings.length; ++i) {
        //if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
            //hasSameNamedElements = true;
            //break;
        //}
    //}
    //if (!hasSameNamedElements) {
        //return 0;
    //}
    //let ownIndex = 1;  // XPath indices start with 1.
    //for (let i = 0; i < siblings.length; ++i) {
        //if (areNodesSimilar(node, siblings[i])) {
            //if (siblings[i] === node) {
                //return ownIndex;
            //}
            //++ownIndex;
        //}
    //}
    //return -1;  // An error occurred: |node| not found in parent's children.
//};

/**
 * @unrestricted
 */
//Elements.DOMPath.Step = class {
    /**
     * @param {string} value
     * @param {boolean} optimized
     */
    //constructor(value, optimized) {
        //this.value = value;
        //this.optimized = optimized || false;
    //}

    /**
     * @override
     * @return {string}
     */
    //toString() {
        //return this.value;
    //}
//};

////////////////////////////////////////////////////////////////////

function noOfElemSiblings(elem: Element): number {
  return (
    elem.parentNode ?
      [...elem.parentNode.children].filter(n => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === elem.tagName).length - 1
    : 0
  );
}

function noOfTextSiblings(node: Node): number {
  return (
    node.parentNode ?
      [...node.parentNode.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).length - 1
    : 0
  );
}

function elemIdx(node: Node, tagName: string, count: number = 1): number {
  return (
    node.previousSibling ?
      node.previousSibling.nodeType === Node.ELEMENT_NODE && (node.previousSibling as Element).tagName === tagName ?
        elemIdx(node.previousSibling, tagName, count + 1)
      : elemIdx(node.previousSibling, tagName, count)
    : count
  );
}

function textIdx(node: Node, count: number = 1): number {
  return (
    node.previousSibling ?
      node.previousSibling.nodeType === Node.TEXT_NODE ?
        textIdx(node.previousSibling, count + 1)
      : textIdx(node.previousSibling, count)
    : count
  );
}
function idxSel(node: Node): string {
  return (
    node.nodeType === Node.ELEMENT_NODE ?
      noOfElemSiblings(node as Element) > 0 ?
        `[${elemIdx(node, (node as Element).tagName)}]`
      : ""
    : node.nodeType === Node.TEXT_NODE ?
      noOfTextSiblings(node) > 0 ?
        `[${textIdx(node)}]`
      : ""
    : ""
  );
}

function mkPath(node: Node, acc: Array<string> = []): Array<string> {
  return (
    node.nodeType === Node.ELEMENT_NODE ?
      node.parentNode ?
        mkPath(node.parentNode, [(node as Element).tagName.toLowerCase() + idxSel(node), ...acc])
      : [(node as Element).tagName.toLowerCase() + idxSel(node), ...acc]
    : node.nodeType === Node.TEXT_NODE ?
      node.parentNode ?
        mkPath(node.parentNode, ["text()" + idxSel(node), ...acc])
      : ["text()" + idxSel(node), ...acc]
    : node.parentNode ?
      mkPath(node.parentNode, acc)
    : acc
  );
}

export function getXPathForElement(node: Node): string {
  return "/" + mkPath(node).join("/");
}

//function getElementByXPath(path) {
  //return (new XPathEvaluator())
    //.evaluate(path, document.documentElement, null,
      //XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    //.singleNodeValue;
//}

export function getElementByXPath(path: string) {
  const res = document.evaluate(path, document, null, XPathResult.ANY_TYPE, null).iterateNext();
  return res;
  //if (res.nodeType === Node.TEXT_NODE && res.parentNode.localName === "blockquote") {
    //return res.parentNode;
  //} else {
    //return res;
  //}
}

//export default {
  //Elements,
  //getXPathForElement,
  //getElementByXPath
//}
