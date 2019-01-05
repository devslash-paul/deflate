import React, { Component } from 'react';
import LogLifecyle from 'react-log-lifecycle';

const getDepth = (node) => {
  if(!node || node.val !== undefined) {
    return 0
  }
  let max = 0
  if(node.left) {
    let left = getDepth(node.left) + 1
    if(left > max) {
      max= left
    }
  }
  if(node.right) {
    let right = getDepth(node.right)  + 1
    if(right > max)
      max = right
  }
  return max
}

const getCount = (node) => {
  if(!node) {
    return 0
  }
  if (node.val !== undefined) {
    return 1
  }
  let max = 0
  if(node.left) {
    let left = getCount(node.left) 
    max += left
  }
  if(node.right) {
    let right = getCount(node.right) 
    max += right
  }
  return max
}

const Node = ({ maxDepth, val, at, left, right, scale, step = 1 }) => {
  const { x, y } = at;
  const id = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  const depthL = getDepth(left)
  const depthR = getDepth(right)
  const countLeft = getCount(left)
  const countRight = getCount(right)

  // so if i have two left. Then i need to go 
  // min * 3
  // 2 ^ DEPTH is max. How many didn't we use is 
  // 2 ^ DEPTH - count
  let lenL = Math.pow(2, depthL) * 20
  lenL -= (Math.pow(2, depthL) - countLeft) * 20

  let lenR = Math.pow(2, depthR) * 20
  lenR -= (Math.pow(2, depthR) - countRight) * 20

  const lenY = 1000 / scale

  const leftLine = left ? <g>
    <path id={`${id}L`} d={`M${x} ${y} q -${lenL / 2} 0, -${lenL} ${lenY}`} fill="transparent" stroke="black" strokeWidth="2px" />
    <text dy="15">
      <textPath offset="5" startOffset="50%" href={`#${id}L`}>0</textPath>
    </text>
  </g> : null
  const nextLeft = left ? <Node maxDepth={maxDepth} step={step + 1} scale={scale} val={left.val} left={left.left} right={left.right} at={{ x: x - lenL, y: y + lenY }} /> : null
  const rightLine = right ? <g>
    <path id={`${id}R`} d={`M${x} ${y} q${lenR / 2} 0,${lenR} ${lenY}`} stroke="black" strokeWidth="2px" fill="transparent" />
    <text dy="-8">
      <textPath offset="5" startOffset="50%" href={`#${id}R`}>1</textPath>
    </text>
  </g> : null
  const nextRight = right ? <Node maxDepth={maxDepth} step={step + 1} scale={scale} val={right.val} left={right.left} right={right.right} at={{ x: x + lenR, y: y + lenY }} /> : null
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
    const maxdepth = getDepth(tree)
    console.log("DEPTH")
    console.log(maxdepth)
    return (
      <svg ref={this.svgRef} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio='xMidYMid meet'>
        <Node maxDepth={maxdepth} scale={scale} val={tree.val} at={{ x: 500, y: 25 }} left={tree.left} right={tree.right} />
      </svg>
    )
  }
}
