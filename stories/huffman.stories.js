import React from 'react';

import { storiesOf } from '@storybook/react';
import {Huffman} from '../src/huffmantree';

storiesOf('Huffman', module)
  .add('Filled Nicely', () => <div style={{width: "50%", height: "50%"}}><Huffman tree={{"left":{"val":12},"right":{"left":{"left":{"val":5},"right":{"val":4}},"right":{"left":{"left":{"val":16},"right":{"val":17}},"right":{"left":{"val":18},"right":{"val":3}}}}}} len={10}/></div>)
  .add('Super Filled', () => <div style={{}}><Huffman tree={{"left":{"left":{"left":{"val":257},"right":{"left":{"val":32},"right":{"val":97}}},"right":{"left":{"left":{"val":101},"right":{"val":105}},"right":{"left":{"val":114},"right":{"val":117}}}},"right":{"left":{"left":{"left":{"left":{"val":99},"right":{"val":100}},"right":{"left":{"val":108},"right":{"val":109}}},"right":{"left":{"left":{"val":110},"right":{"val":111}},"right":{"left":{"val":115},"right":{"val":116}}}},"right":{"left":{"left":{"left":{"val":258},"right":{"val":259}},"right":{"left":{"left":{"val":44},"right":{"val":46}},"right":{"left":{"val":103},"right":{"val":112}}}},"right":{"left":{"left":{"left":{"val":118},"right":{"val":260}},"right":{"left":{"val":261},"right":{"left":{"val":98},"right":{"val":102}}}},"right":{"left":{"left":{"left":{"val":104},"right":{"val":113}},"right":{"left":{"val":262},"right":{"val":264}}},"right":{"left":{"left":{"left":{"left":{"val":65},"right":{"val":67}},"right":{"left":{"val":69},"right":{"val":76}}},"right":{"left":{"left":{"val":77},"right":{"val":78}},"right":{"left":{"val":79},"right":{"val":80}}}},"right":{"left":{"left":{"left":{"val":83},"right":{"val":85}},"right":{"left":{"val":106},"right":{"val":120}}},"right":{"left":{"left":{"val":256},"right":{"val":263}},"right":{"left":{"val":265},"right":{"val":266}}}}}}}}}}} len={10}/></div>)
  .add('Hard', () => <div style={{width: "50%", height: "50%"}}><Huffman tree={
    {right: {left: {right: {right: {right:{val: "A"}}}}}}
  } len={10}/></div>);