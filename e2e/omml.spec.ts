import { test, expect } from "@playwright/test";
import { latexToOmml } from "../src/lib/omml";

/**
 * LaTeX → Word equation (src/lib/omml.ts), run in the Playwright Node process.
 * Each repair the module makes to mathml2omml's output has a case here, and so
 * does the guard that sends a formula back to its picture.
 */

const convert = (latex: string, display = false) => {
  const omml = latexToOmml(latex, display);
  expect(omml, latex).not.toBeNull();
  return omml!;
};

test.describe("latexToOmml", () => {
  test("common structures become their Word equation elements", () => {
    expect(convert("\\frac{a}{b}")).toContain("<m:f>");
    expect(convert("\\sqrt{x}")).toContain("<m:rad>");
    expect(convert("x^2")).toContain("<m:sSup>");
    expect(convert("x_i")).toContain("<m:sSub>");
    expect(convert("\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", true)).toContain("<m:m>");
    expect(convert("\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}", true)).toContain("<m:mr>");
  });

  test("a big operator holds its body, up to the next relation", () => {
    // KaTeX emits the summand as loose siblings; the converter only fills the
    // operator's body from one following <mrow>
    const sum = convert("\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}", true);
    const nary = /<m:nary>[\s\S]*?<\/m:nary>/.exec(sum)![0];
    expect(nary).toContain('<m:chr m:val="∑"/>');
    expect(nary, "the summand is inside the operator").toMatch(/<m:e>[\s\S]*<m:sSup>/);
    expect(nary, "the right-hand side is not").not.toContain("<m:f>");
    expect(sum.indexOf("<m:f>")).toBeGreaterThan(sum.indexOf("</m:nary>"));

    const integral = convert("\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}", true);
    expect(integral).not.toMatch(/<m:e\s*\/>\s*<\/m:nary>|<m:e><\/m:e><\/m:nary>/);
  });

  test("an operator without limits is still an operator, its empty limits hidden", () => {
    // KaTeX writes `\int f(x)\,dx` with a bare <mo>∫</mo>, which the converter
    // would turn into an ordinary character
    const omml = convert("\\int f(x)\\,dx", true);
    expect(omml).toContain('<m:chr m:val="∫"/>');
    expect(omml).toContain('<m:subHide m:val="on"/>');
    expect(omml).toContain('<m:supHide m:val="on"/>');
    expect(omml, "the integrand is inside").toMatch(/<m:e><m:r><m:t xml:space="preserve">f/);
    // With one limit, only the missing one is hidden
    const sub = convert("\\sum_{i} x_i");
    expect(sub).toContain('<m:subHide m:val="off"/>');
    // ∪ on its own is binary, not a big operator
    expect(convert("A \\cup B")).not.toContain("<m:nary>");
  });

  test("the converter's schema errors are repaired", () => {
    // ∇ and ∞ come out with m:sty "undefined"; aligned rows with a doubled
    // m:argPr; styled runs with w:rPr ahead of m:rPr
    const omml = convert("\\begin{aligned} \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\ \\int_0^\\infty f &= 1 \\end{aligned}", true);
    expect(omml).not.toContain("undefined");
    expect(omml).not.toMatch(/(<m:argPr>(?:(?!<\/m:argPr>)[\s\S])*<\/m:argPr>)\s*\1/);
    expect(omml).not.toMatch(/<m:r>\s*<w:rPr/);
    expect(omml, "namespaces come from the document root").not.toContain("xmlns:");
  });

  test("text inside a formula, CJK included, stays text", () => {
    const omml = convert("P(\\text{雨} \\mid \\text{云})");
    expect(omml).toContain('<m:t xml:space="preserve">雨</m:t>');
    expect(omml).toContain("<m:nor/>");
  });

  test("returns null, so the picture stays, when the result can't be trusted", () => {
    // KaTeX can't parse it
    expect(latexToOmml("\\notacommand{x}", false)).toBeNull();
    // The converter's big-operator test matches a ∪ anywhere in a script base
    // and would make "{A∪B}" an operator character
    expect(latexToOmml("{A \\cup B}^c", false)).toBeNull();
    expect(latexToOmml("{\\int f}^2", false)).toBeNull();
    // …while the same characters in an ordinary position convert
    expect(latexToOmml("(A \\cup B)^c", false)).not.toBeNull();
    expect(latexToOmml("\\bigcup_{i=1}^n A_i", false)).toContain('<m:chr m:val="⋃"/>');
  });
});
