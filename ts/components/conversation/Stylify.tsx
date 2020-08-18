// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';

import { RenderTextCallbackType } from '../../types/Util';
import { manyStyleTypes } from './StyleType';

export interface Props {
  text: string;
  /** Allows you to customize how non-styles are rendered. Simplest is just a <span>. */
  renderNonStyle?: RenderTextCallbackType;
}

/**
 * Stores the starting index, last index, and type of styling(s) (using a character to
 * identify each type) of each match that a rich text regular expression (see StyleType)
 * finds.
 *
 * @see StyleType
 * @see Stylify
 */
export interface Match {
  /** Inclusive. */
  index: number;
  /** Exclusive. */
  lastIndex: number;
  type: Array<string>;
}

/**
 * Applies rich text styling to messages.
 *
 * @see Match
 * @see StyleType
 */
export class Stylify extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    renderNonStyle: ({ text }) => text,
  };

  /**
   * To add a new style type, add it here and ensure its Quill formats are enabled on the
   * <ReactQuill /> component.
   *
   * NOTE: only one character should be used for styling since multi-character styles have
   * not been thoroughly tested.
   *
   * @see StyleType
   */
  public static readonly STYLES = manyStyleTypes([
    {
      name: 'bold',
      char: '*',
      jsx: content => <strong>{content}</strong>,
      qAttr: { bold: true },
      qAttrRev: { bold: false },
    },
    {
      name: 'italic',
      char: '_',
      jsx: content => <em>{content}</em>,
      qAttr: { italic: true },
      qAttrRev: { italic: false },
    },
    {
      name: 'strike',
      char: '~',
      jsx: content => <s>{content}</s>,
      qAttr: { strike: true },
      qAttrRev: { strike: false },
    },
  ]);

  public static readonly stylifyMatch = (text: string): Array<Match> => {
    let match;

    const styleArray: Array<Match> = [];

    Object.values(Stylify.STYLES).forEach(style => {
      // eslint-disable-next-line no-cond-assign
      while ((match = style.regex.exec(text)) != null) {
        const StylePair: Match = {
          index: match.index,
          lastIndex: style.regex.lastIndex - 1,
          type: [style.char],
        };
        styleArray.push(StylePair);
      }
    });

    return Stylify.mergeIntoArray(styleArray.sort((a, b) => a.index - b.index));
  };

  private static readonly mergeIntoArray = (arr: Array<Match>) => {
    const res: Array<Match> = [];

    arr.forEach(val => {
      Stylify.foldInNewMatch(res, {
        index: val.index,
        lastIndex: val.lastIndex,
        type: val.type.slice(),
      });
    });

    return res;
  };

  private static readonly foldInNewMatch = (
    arr: Array<Match>,
    match: Match
  ) => {
    let i = arr.length - 1;
    let prev = arr[i];

    if (prev) {
      /*
        If multiple styles apply to the same text, e.g. "~*_text_*~", we should merge the
        styles where possible. To do this, we need the maximum distance between the outer
        and inner style, which would be the total number of styles if both Match's types
        were merged. Any distance larger than this will be treated as nested styling,
        e.g. '*some _text_ here*'.

        NOTE: If multi-character styles are implemented in the future, this would have to
        be refactored to be the length of all styles in each Match added together.
       */
      const maxStyleDistance = prev.type.length + match.type.length;

      if (match.index < prev.lastIndex) {
        if (match.lastIndex < prev.lastIndex) {
          if (match.index - prev.index > maxStyleDistance) {
            arr.splice(i, 0, {
              index: prev.index,
              lastIndex: match.index - 1,
              type: prev.type.slice(),
            });
            i += 1;
            prev = arr[i];
            prev.index = match.index;
          }
          if (prev.lastIndex - match.lastIndex > maxStyleDistance) {
            arr.splice(
              i,
              1,
              {
                index: prev.index,
                lastIndex: match.lastIndex,
                type: prev.type.slice(),
              },
              {
                index: match.lastIndex + 1,
                lastIndex: prev.lastIndex,
                type: prev.type.slice(),
              }
            );
            prev = arr[i];
          }
          prev.type.push(...match.type);

          return;
        }
        if (match.lastIndex > prev.lastIndex) {
          return;
        }
      }
    }
    arr.push(match);
  };

  public render():
    | JSX.Element
    | string
    | null
    | Array<JSX.Element | string | null> {
    const { text, renderNonStyle } = this.props;

    // We have to do this, because renderNonLink is not required in our Props object,
    // but it is always provided via defaultProps.
    if (!renderNonStyle) {
      return null;
    }

    return Stylify.style(text, renderNonStyle);
  }

  public static readonly style = (
    text: string,
    renderNonStyle: RenderTextCallbackType
  ): string | JSX.Element | Array<string | JSX.Element> => {
    let missingStylesCount = 0;
    Object.values(Stylify.STYLES).forEach(style => {
      if (text.indexOf(style.char) === -1) {
        missingStylesCount += 1;
      }
    });
    if (missingStylesCount === Object.keys(Stylify.STYLES).length) {
      return renderNonStyle({ text, key: 0 });
    }

    const matchData = Stylify.stylifyMatch(text) || [];

    const results: Array<string | JSX.Element> = [];
    let last = 0;
    let count = 0;

    matchData.forEach(match => {
      if (last < match.index) {
        const textWithNoStyle = text.slice(last, match.index);
        results.push(renderNonStyle({ text: textWithNoStyle, key: count }));
        count += 1;
      }

      let contentText: string = text.slice(match.index, match.lastIndex + 1);

      // remove all styling characters from rendered text's start and end
      match.type.forEach(() => {
        if (match.type.includes(contentText[0])) {
          contentText = contentText.slice(1, contentText.length);
        }
        if (match.type.includes(contentText[contentText.length - 1])) {
          contentText = contentText.slice(0, contentText.length - 1);
        }
      });

      let content: string | JSX.Element = contentText;
      // apply styling to text
      match.type.reverse().forEach(type => {
        const style = Object.values(Stylify.STYLES).find(s => s.char === type);
        if (style) {
          content = style.jsx(content);
        }
      });

      results.push(<span key={count}>{content}</span>);
      count += 1;
      last = match.lastIndex + 1;
    });

    if (last < text.length) {
      results.push(renderNonStyle({ text: text.slice(last), key: count }));
      count += 1;
    }

    return results;
  };
}
