import React, { Component } from 'react';
import LogLifecyle from 'react-log-lifecycle';

const Node = ({ val, at, left, right, scale, step = 1 }) => {
  const { x, y } = at;
  const id = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  const len = 1000 / scale / step * 2
  const lenY = 1000 / scale

  const leftLine = left ? <g>
    <path id={`${id}L`} d={`M${x} ${y} q -${len / 2} 0, -${len} ${lenY}`} fill="transparent" stroke="black" strokeWidth="2px" />
    <text dy="15">
      <textPath offset="5" startOffset="50%" href={`#${id}L`}>0</textPath>
    </text>
  </g> : null
  const nextLeft = left ? <Node step={step + 1} scale={scale} val={left.val} left={left.left} right={left.right} at={{ x: x - len, y: y + lenY }} /> : null
  const rightLine = right ? <g>
    <path id={`${id}R`} d={`M${x} ${y} q${len / 2} 0,${len} ${lenY}`} stroke="black" strokeWidth="2px" fill="transparent" />
    <text dy="-8">
      <textPath offset="5" startOffset="50%" href={`#${id}R`}>1</textPath>
    </text>
  </g> : null
  const nextRight = right ? <Node step={step + 1} scale={scale} val={right.val} left={right.left} right={right.right} at={{ x: x + len, y: y + lenY }} /> : null
  return <g>
    {leftLine}
    {rightLine}
    <circle cx={`${x}px`} cy={`${y}px`} r="12" />
    <circle cx={`${x}px`} cy={`${y}px`} r="11" fill="white" />
    <text x={`${x}px`} y={`${y}px`} textAnchor="middle" dominantBaseline="middle">{val}</text>
    {nextLeft}
    {nextRight}
  </g>
}

export class Huffman extends LogLifecyle {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0,
      w: 1000,
      h: 1000
    }
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    const cur = this.svgRef.current;
    const b = cur.getBBox();
    this.setState({
      x: b.x,
      y: b.y,
      w: b.width,
      h: b.height
    })
  }

  render() {
    const {tree, len} = this.props;
    const scale = len;
    const {x,y,w,h} = this.state;
    return (
      <svg ref={this.svgRef} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio='xMidYMid meet'>
        <Node scale={scale} val={tree.val} at={{ x: 500, y: 25 }} left={tree.left} right={tree.right} />
      </svg>
    )
  }
}
