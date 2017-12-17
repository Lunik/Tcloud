import React from 'react'
import List from '@react-mdc/list'
import classnames from 'classnames'

import Color from '../../../style/theme'

import { CrossIcon } from '../../image/svg'

export default class ToolboxItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      hover: false
    })
  }

  componentWillReceiveProps (props) {
    if (props.id !== this.props.id) {
      this.initState(props)
    }
  }

  handleMouseLeave () {
    if (!this.props.disabled) {
      this.setState({hover: false})
    }
  }

  handleMouseEnter () {
    if (!this.props.disabled) {
      this.setState({hover: true})
    }
  }

  handleClick (e) {
    if (!this.props.disabled) {
      this.props.onClick(e)
    }
  }

  render () {
    const itemStyle = Object.assign({}, style.item, this.state.hover ? style.hover : {}, this.props.style, this.props.disabled ? style.disabled : {})
    return (
      <List.Item
        style={itemStyle}
        className={classnames('toolbox-item', this.props.className)}
        id={this.props.id}
        onClick={(e) => this.handleClick(e)}
        onMouseEnter={() => this.handleMouseEnter()}
        onMouseLeave={() => this.handleMouseLeave()}>
        <p style={style.text}>{this.props.text}</p>
        <this.props.icon style={style.icon} />
        {this.props.children}
      </List.Item>
    )
  }
}

ToolboxItem.defaultProps = {
  icon: CrossIcon,
  text: 'item',
  disabled: false,
  onClick: () => {}
}

const style = {
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 10px',
    cursor: 'pointer',
    height: '30px'
  },
  disabled: {
    display: 'none'
  },
  hover: {
    backgroundColor: Color.orange
  },
  text: {
    flex: '5',
    marginRight: '5px',
    textAlign: 'left'
  },
  icon: {
    flex: '1',
    fill: Color.white,
    float: 'right'
  }
}
