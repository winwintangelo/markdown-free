import katex from "katex";
import { mml2omml } from "mathml2omml";
import { katexOptions } from "./markdown";

/**
 * LaTeX → Word equation (OMML), for editable formulas in the DOCX export.
 *
 *   LaTeX ──KaTeX──▶ MathML ──regroup──▶ mathml2omml ──repair──▶ OMML
 *
 * KaTeX already typesets every formula on the site, so it parses here with the
 * same options and macros. mathml2omml (LGPL-3.0, runs on the server only)
 * turns its MathML into Word's math markup; four of its habits are corrected
 * around it:
 *  - a big operator's body (the integrand of ∫, the summand of ∑) arrives from
 *    KaTeX as loose siblings, and the converter only fills the operator's body
 *    from a following <mrow>, so the siblings are wrapped in one; an operator
 *    without limits gets empty ones, hidden, or it would come out as an
 *    ordinary character;
 *  - runs come out with m:sty "undefined" (a style it has no name for), a
 *    repeated m:argPr, and w:rPr before m:rPr, all of which break the schema;
 *  - its big-operator test matches a ∪ or ∫ anywhere in a sub/superscript
 *    base, so `(A \cup B)^c` would turn "(A∪B)" into an operator. The result is
 *    checked, and a formula that fails returns null.
 *
 * null means "keep the picture": the caller falls back to the formula image
 * the browser rendered, which is what Word got before equations existed.
 */

interface XmlElement {
  name: string;
  /** Raw attribute text, re-emitted unchanged */
  attrs: string;
  children: XmlNode[];
}
type XmlNode = XmlElement | string;

// KaTeX's MathML and the converter's OMML are plain XML: elements, double-
// quoted attributes and escaped text, no comments, CDATA or declarations.
const TOKEN_RE = /<(\/?)([A-Za-z][\w:.-]*)((?:\s+[^\s=/>]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|([^<]+)/g;

/** Parse one element of simple XML; null when anything doesn't fit. */
function parseXml(xml: string): XmlElement | null {
  const root: XmlElement = { name: "", attrs: "", children: [] };
  const stack = [root];
  let consumed = 0;
  for (const match of xml.matchAll(TOKEN_RE)) {
    if (match.index !== consumed) return null;
    consumed += match[0].length;
    const [, closing, name, attrs, selfClosing, text] = match;
    const top = stack[stack.length - 1];
    if (text !== undefined) {
      top.children.push(text);
    } else if (closing) {
      if (top.name !== name) return null;
      stack.pop();
    } else {
      const element: XmlElement = { name, attrs: attrs ?? "", children: [] };
      top.children.push(element);
      if (!selfClosing) stack.push(element);
    }
  }
  if (consumed !== xml.length || stack.length !== 1) return null;
  const elements = root.children.filter((child): child is XmlElement => typeof child !== "string");
  return elements.length === 1 ? elements[0] : null;
}

/** `selfClose` writes empty elements as <x/>, as Word does; the converter's MathML parser wants <x></x>. */
function serialize(node: XmlNode, selfClose = false): string {
  if (typeof node === "string") return node;
  if (selfClose && node.children.length === 0) return `<${node.name}${node.attrs}/>`;
  return `<${node.name}${node.attrs}>${node.children.map((child) => serialize(child, selfClose)).join("")}</${node.name}>`;
}

const elementsOf = (node: XmlElement) => node.children.filter((child): child is XmlElement => typeof child !== "string");
const textOf = (node: XmlNode): string => (typeof node === "string" ? node : node.children.map(textOf).join("")).trim();

const SCRIPTS = new Set(["msub", "msup", "msubsup", "munder", "mover", "munderover"]);
// ∏∐∑ ∫∬∭∮∯∰∱∲∳ ⋀⋁⋂⋃ and ∩∪: the characters the converter treats as big operators
const BIG_OPERATOR = /^[∏-∑∩-∳⋀-⋃]$/u;
// The same without ∩ and ∪, which on their own are binary (A ∪ B), not big
const BARE_BIG_OPERATOR = /^[∏-∑∫-∳⋀-⋃]$/u;
// Where a big operator's body ends: a relation, or a separator between terms
const BODY_END = /^[=<>≤≥≠≈≡∼≃≅≪≫∝→←↔⇒⇐⇔⟶⟵⟷⟹⟸⟺↦∈∉∋⊂⊃⊆⊇⊊⊋∣∥⊥≺≻⪯⪰≦≧⩽⩾,;]$/u;

function isBigOperatorWithLimits(node: XmlElement): boolean {
  const base = elementsOf(node)[0];
  return SCRIPTS.has(node.name) && base?.name === "mo" && BIG_OPERATOR.test(textOf(base));
}

const emptyRow = (): XmlElement => ({ name: "mrow", attrs: "", children: [] });

/**
 * Wrap each big operator's body in an <mrow>, so the converter puts it inside
 * the operator. A big operator without limits (`\int f\,dx`, `\sum x_i`) is
 * a bare <mo>, which the converter would write as an ordinary character, so it
 * first gets empty limits; hideEmptyLimits hides them again in the output.
 */
function groupOperatorBodies(node: XmlElement): void {
  if (!SCRIPTS.has(node.name)) {
    node.children = node.children.map((child) =>
      typeof child !== "string" && child.name === "mo" && BARE_BIG_OPERATOR.test(textOf(child))
        ? { name: "msubsup", attrs: "", children: [child, emptyRow(), emptyRow()] }
        : child
    );
  }
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (typeof child === "string" || !isBigOperatorWithLimits(child)) continue;
    let end = i + 1;
    while (end < children.length) {
      const next = children[end];
      if (typeof next !== "string" && next.name === "mo" && BODY_END.test(textOf(next))) break;
      end++;
    }
    const body = children.slice(i + 1, end);
    const alreadyGrouped = body.length === 1 && typeof body[0] !== "string" && body[0].name === "mrow";
    if (body.length > 0 && !alreadyGrouped) {
      children.splice(i + 1, body.length, { name: "mrow", attrs: "", children: body });
    }
  }
  for (const child of elementsOf(node)) groupOperatorBodies(child);
}

/** Drop KaTeX's <annotation> (the LaTeX source), which the converter can't place. */
function dropAnnotations(node: XmlElement): void {
  node.children = node.children.filter((child) => typeof child === "string" || !child.name.startsWith("annotation"));
  for (const child of elementsOf(node)) dropAnnotations(child);
}

/** Correct the converter's schema errors; see the module comment. */
function repairOmml(omml: string): string {
  return (
    omml
      // The document root declares both prefixes
      .replace(/\s+xmlns:(?:m|w)="[^"]*"/g, "")
      .replace(/<m:sty m:val="undefined"\s*\/>|<m:sty m:val="undefined"><\/m:sty>/g, "")
      .replace(/(<m:argPr>(?:(?!<\/m:argPr>)[\s\S])*<\/m:argPr>)(?:\s*\1)+/g, "$1")
      // CT_R is a sequence: m:rPr, then w:rPr, then the text
      .replace(
        /<m:r>(\s*)(<w:rPr\s*\/>|<w:rPr>(?:(?!<\/w:rPr>)[\s\S])*<\/w:rPr>)(\s*)(<m:rPr\s*\/>|<m:rPr>(?:(?!<\/m:rPr>)[\s\S])*<\/m:rPr>)/g,
        "<m:r>$1$4$3$2"
      )
  );
}

/** An operator's empty limit is hidden; shown, Word draws a placeholder box for it. */
function hideEmptyLimits(node: XmlElement): void {
  if (node.name === "m:nary") {
    const parts = elementsOf(node);
    const properties = parts.find((part) => part.name === "m:naryPr");
    for (const limit of ["sub", "sup"]) {
      const empty = parts.find((part) => part.name === `m:${limit}`)?.children.length === 0;
      const hide = properties && elementsOf(properties).find((p) => p.name === `m:${limit}Hide`);
      if (empty && hide) hide.attrs = ' m:val="on"';
    }
  }
  for (const child of elementsOf(node)) hideEmptyLimits(child);
}

// A formula this large is pathological; the picture is the safer rendering
const MAX_OMML_CHARS = 200_000;

/** Whether converted OMML is well-formed and free of the converter's known faults. */
function trustworthy(omml: string): boolean {
  if (omml.length > MAX_OMML_CHARS || omml.includes("undefined")) return false;
  const root = parseXml(omml);
  if (!root || root.name !== "m:oMath") return false;
  // Every operator, accent and grouping character is one character
  for (const [, value] of omml.matchAll(/<m:chr m:val="([^"]*)"/g)) {
    if (Array.from(value).length !== 1) return false;
  }
  return true;
}

/**
 * Convert one formula to an <m:oMath> element (no namespace declarations: the
 * document root carries them). Display formulas still return a bare
 * <m:oMath>; the caller wraps them in <m:oMathPara>. null when the formula
 * can't be converted faithfully.
 */
export function latexToOmml(latex: string, display: boolean): string | null {
  try {
    const html = katex.renderToString(latex, { ...katexOptions, output: "mathml", throwOnError: true, displayMode: display });
    const mathml = /<math[\s\S]*<\/math>/.exec(html)?.[0];
    const tree = mathml ? parseXml(mathml) : null;
    if (!tree) return null;
    dropAnnotations(tree);
    groupOperatorBodies(tree);
    const converted = parseXml(repairOmml(mml2omml(serialize(tree)).trim()));
    if (!converted) return null;
    hideEmptyLimits(converted);
    const omml = serialize(converted, true);
    return trustworthy(omml) ? omml : null;
  } catch {
    return null;
  }
}
