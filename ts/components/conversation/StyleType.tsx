// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

export interface QuillAttributes {
  [key: string]: any;
}

interface StyleInput {
  name: string;
  char: string;
  jsx: (content: React.ReactNode) => JSX.Element;
  qAttr: QuillAttributes;
  qAttrRev: QuillAttributes;
}

interface StyleOutput {
  [name: string]: StyleType;
}

/**
 * POSIX [:punct:], excluding the $ (otherwise we'd have to add all currency symbols for
 * international feature parity), and excluding \ (so one could escape styling if needed),
 * but including spaces.
 *
 * @see Stylify
 */
const REGEX_PUNCT = '[\\]!"#%&\'()*+,./:;<=>?@^_`{|}~-\\s';

/**
 * Stores the character, JSX styling, and precompiled regular expression for a style type.
 *
 * A regular expression for each style (as apposed to one universal rich text regex) is
 * used because it is faster, as a universal regex would lead to more backtracking and
 * potentially to an exponential effect called "catastrophic backtracking".
 *
 * @see Stylify
 */
class StyleType {
  public char: string;

  public jsx: (content: React.ReactNode) => JSX.Element;

  public regex: RegExp;

  public qAttr: QuillAttributes;

  public qAttrRev: QuillAttributes;

  constructor(
    char: string,
    jsx: (content: React.ReactNode) => JSX.Element,
    regexPunct: string = REGEX_PUNCT,
    qAttr: QuillAttributes = {},
    qAttrRev: QuillAttributes = {}
  ) {
    this.char = char;
    this.jsx = jsx;
    this.regex = new RegExp(
      `(?<![^${regexPunct}])\\${char}[^\\s][^\\${char}\\n\\r]*[^\\s]\\${char}(?![^${regexPunct}])`,
      'g'
    );
    this.qAttr = qAttr;
    this.qAttrRev = qAttrRev;
  }
}

export const manyStyleTypes = (inputArray: Array<StyleInput>): StyleOutput => {
  const output: StyleOutput = {};
  let regexPunct = REGEX_PUNCT;
  inputArray.forEach(style => {
    regexPunct += style.char;
  });
  inputArray.forEach(style => {
    output[style.name] = new StyleType(
      style.char,
      style.jsx,
      regexPunct,
      style.qAttr,
      style.qAttrRev
    );
  });

  return output;
};
