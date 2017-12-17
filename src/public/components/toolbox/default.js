import React from 'react'
import List from '@react-mdc/list'
import classnames from 'classnames'

import Color from '../../style/theme'

import { ThreeDotsIcon } from '../image/svg'

export default class Toolbox extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      hover: false,
      hidden: true
    })
  }

  componentWillReceiveProps (props) {
    if (props.id !== this.props.id) {
      this.initState(props)
    }
  }

  open () {
    this.setState({
      hidden: false
    })
  }

  close () {
    this.setState({
      hidden: true
    })
  }

  switch () {
    this.setState({
      hidden: !this.state.hidden
    })
  }
  render () {
    const divStyle = Object.assign({}, style.div, this.state.hover ? style.divHover : {})
    const listStyle = Object.assign({}, style.list, this.state.hidden ? style.listHidden : {})
    return (
      <div className="toolbox" id="file" style={divStyle}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
        onClick={() => this.switch()}>
        <ThreeDotsIcon style={style.dots} />
        <List
          className={classnames('toolbox-list', this.props.className)}
          id={this.props.id}
          style={listStyle}
          onMouseLeave={() => this.close()}>
          {this.props.children}
        </List>
      </div>
    )
  }
}

const style = {
  div: {
    borderRadius: '100%',
    paddingTop: '2px',
    width: '30px',
    height: '28px',
    textAlign: 'center',
    transition: 'background-color 0.1s ease-in',
    cursor: 'pointer',
    marginTop: '-3px'
  },
  divHover: {
    backgroundColor: Color.darkGrey
  },
  dots: {
    fill: Color.white,
    verticalAlign: 'bottom'
  },
  list: {
    position: 'relative',
    right: '115px',
    width: '150px',
    backgroundColor: Color.darkGrey,
    padding: '0px',
    borderRadius: '2px',
    boxShadow: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)'
  },
  listHidden: {
    visibility: 'hidden'
  }
}
