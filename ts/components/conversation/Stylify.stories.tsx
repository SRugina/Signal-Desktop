// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';

import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { Stylify, Props } from './Stylify';

const story = storiesOf('Components/Conversation/Stylify', module);

const createProps = (overrideProps: Partial<Props> = {}): Props => ({
  renderNonStyle: overrideProps.renderNonStyle,
  text: text('text', overrideProps.text || ''),
});

story.add('Only Style', () => {
  const props = createProps({
    text: '*bold*',
  });

  return <Stylify {...props} />;
});

story.add('No Style', () => {
  const props = createProps({
    text: 'Plain text',
  });

  return <Stylify {...props} />;
});

story.add('Featuring every Style', () => {
  const props = createProps({
    text: '*bold* _italic_  ~strikethrough~',
  });

  return <Stylify {...props} />;
});

story.add('Double Overlapped Style', () => {
  const props = createProps({
    text: '*_bold and italic_*',
  });

  return <Stylify {...props} />;
});

story.add('Triple Overlapped Style', () => {
  const props = createProps({
    text: '~*_strikethrough bold and italic_*~',
  });

  return <Stylify {...props} />;
});

story.add('Nested Styles', () => {
  const props = createProps({
    text: '*bold text _with italic_ inside*',
  });

  return <Stylify {...props} />;
});

story.add('Starting and Ending with Style', () => {
  const props = createProps({
    text: '*bold* Yes? No? *another bold*',
  });

  return <Stylify {...props} />;
});

story.add('With a Style in the Middle', () => {
  const props = createProps({
    text: 'Before. *bold* After.',
  });

  return <Stylify {...props} />;
});

story.add('Should Render as Style when Surrounded by Punctuation', () => {
  const props = createProps({
    text: '(*bold*) _italic_,',
  });

  return <Stylify {...props} />;
});

story.add('Should not Render Invalid formatting as Style', () => {
  const props = createProps({
    text: 'd*bold* _ italic_ ~strikethrough~d *more bold*',
  });

  return <Stylify {...props} />;
});

story.add('Should not Render as Style over Multiple Lines', () => {
  const props = createProps({
    text: `
    _italic
    over
    multiple
    lines_
    `,
  });

  return <Stylify {...props} />;
});

story.add('Custom Text Render', () => {
  const props = createProps({
    text: 'Before *bold* After.',
    renderNonStyle: ({ text: theText, key }) => (
      <div key={key} style={{ backgroundColor: 'aquamarine' }}>
        {theText}
      </div>
    ),
  });

  return <Stylify {...props} />;
});
