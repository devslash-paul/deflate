import React, { Component } from 'react';
import LogLifecyle from 'react-log-lifecycle';

/**
 * Each node needs to mount. And tell its parent its bounding box. Then callback
 */
class Node extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { val } = this.props
    const { left, right } = val;
    const posX = val.x;
    const posY = val.y;
    let x = posX * 20 + 30
    let y = posY * 100 + 30

    const id = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

    const leftLine = left ? <g>
      <path id={`${id}L`} d={`M${x} ${y} Q${x - 25} ${y}, ${left.x * 20 + 30} ${left.y * 100 + 30}`} fill="transparent" stroke="black" strokeWidth="2px" />
      <text dy="15">
        <textPath offset="5" startOffset="50%" href={`#${id}L`}>0</textPath>
      </text>
    </g> : null
    const nextLeft = left ? <Node val={left} /> : null
    const rightLine = right ? <g>
      <path id={`${id}R`} d={`M${x} ${y} Q${x + 25} ${y}, ${right.x * 20 + 30} ${right.y * 100 + 30}`} stroke="black" strokeWidth="2px" fill="transparent" />
      <text dy="-8">
        <textPath offset="5" startOffset="50%" href={`#${id}R`}>1</textPath>
      </text>
    </g> : null
    const nextRight = right ? <Node val={right} /> : null

    const rectX = x - 15
    const rectY = y - 11

    const sq = !left && !right ? <g>
      <rect x={`${rectX}px`} y={`${rectY}px`} width="30px" height="20px" rx="3" fill="black"/>
      <rect x={`${rectX + 1}px`} y={`${rectY + 1}px`} width="28px" height="18px" rx="3" fill="white"/>
      <text x={`${x}px`} y={`${y}px`} textAnchor="middle" dominantBaseline="middle">{val.val}</text>
    </g> : <g>
        <circle cx={`${x}px`} cy={`${y}px`} r="12" />
        <circle cx={`${x}px`} cy={`${y}px`} r="11" fill="white" />
      </g>

    return <g ref={this.svgRef}>
      {leftLine}
      {rightLine}
      {sq}
      {nextLeft}
      {nextRight}
    </g>
  }
}

export class Huffman extends Component {
  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0,
      w: 1000,
      h: 1000
    }
    this.svgRef = React.createRef();
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    const b = this.svgRef.current.getBBox()
    this.setState({
      x: b.x,
      y: b.y,
      w: b.width,
      h: b.height
    })
  }

  knuth(node, depth, glob) {
    if (node.left) {
      this.knuth(node.left, depth + 1, glob)
    }
    node.x = glob.i
    node.y = depth
    glob.i += 1
    if (node.right) {
      this.knuth(node.right, depth + 1, glob)
    }
  }

  render() {
    const { tree } = this.props;
    const { x, y, w, h } = this.state;
    this.knuth(tree, 1, { i: 0 })

    return (
      <svg ref={this.svgRef} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio='xMidYMid meet'
        style={{ width: "100%", height: "100%" }}>
        <Node val={tree} />
      </svg>
    )
  }
}
