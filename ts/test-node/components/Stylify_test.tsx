// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';
import React from 'react';

import { Match, Stylify } from '../../components/conversation/Stylify';
import { RenderTextCallbackType } from '../../types/Util';

const renderNonStyle: RenderTextCallbackType = ({ text }) => text;

describe('Stylify', () => {
  it('should detect text with style only', () => {
    // test stylifyMatch

    const text = '*bold*';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 5, type: ['*'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <strong>bold</strong>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text featuring every style', () => {
    const text = '*bold* _italic_ ~strikethrough~';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 5, type: ['*'] },
      { index: 7, lastIndex: 14, type: ['_'] },
      { index: 16, lastIndex: 30, type: ['~'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <strong>bold</strong>
      </span>,
      ' ',
      <span key={2}>
        <em>italic</em>
      </span>,
      ' ',
      <span key={4}>
        <s>strikethrough</s>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text with double overlapped style', () => {
    const text = '*_bold and italic_*';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 18, type: ['*', '_'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <strong>
          <em>bold and italic</em>
        </strong>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text with triple overlapped style', () => {
    const text = '~*_strikethrough bold and italic_*~';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 34, type: ['~', '*', '_'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <s>
          <strong>
            <em>strikethrough bold and italic</em>
          </strong>
        </s>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text with nested styles', () => {
    const text = '*bold text _with italic_ inside*';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 10, type: ['*'] },
      { index: 11, lastIndex: 23, type: ['*', '_'] },
      { index: 24, lastIndex: 31, type: ['*'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <strong>bold text </strong>
      </span>,
      <span key={1}>
        <strong>
          <em>with italic</em>
        </strong>
      </span>,
      <span key={2}>
        <strong> inside</strong>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text starting and ending with style', () => {
    const text = '*bold* Yes? No? *another bold*';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 0, lastIndex: 5, type: ['*'] },
      { index: 16, lastIndex: 29, type: ['*'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      <span key={0}>
        <strong>bold</strong>
      </span>,
      ' Yes? No? ',
      <span key={2}>
        <strong>another bold</strong>
      </span>,
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect text with a style in the middle', () => {
    const text = 'Before. *bold* After.';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 8, lastIndex: 13, type: ['*'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      'Before. ',
      <span key={1}>
        <strong>bold</strong>
      </span>,
      ' After.',
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should detect styles with surrounding punctuation', () => {
    const text = '(*bold*) _italic_,';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [
      { index: 1, lastIndex: 6, type: ['*'] },
      { index: 9, lastIndex: 16, type: ['_'] },
    ];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [
      '(',
      <span key={1}>
        <strong>bold</strong>
      </span>,
      ') ',
      <span key={3}>
        <em>italic</em>
      </span>,
      ',',
    ];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should not detect text with no style', () => {
    const text = 'Plain text';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    assert.deepEqual(styledText, text);
  });

  it('should not detect text with invalid styles', () => {
    const text = 'd*bold* _ italic_ ~strikethrough~d \\*more bold*';
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [text];

    assert.deepEqual(styledText, expectedStyledText);
  });

  it('should not detect text with style over multiple lines', () => {
    const text = `
        _italic
        over
        multiple
        lines_
        `;
    const matchData = Stylify.stylifyMatch(text);

    const expectedData: Array<Match> = [];

    assert.deepEqual(matchData, expectedData);

    // test style

    const styledText = Stylify.style(text, renderNonStyle);

    const expectedStyledText = [text];

    assert.deepEqual(styledText, expectedStyledText);
  });
});
