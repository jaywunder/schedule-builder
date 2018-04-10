import React, { Component } from 'react'

export default class Delete extends Component {
  state = {
    clicked: false,
  }

  render () {
    return this.state.clicked
      ? <button
          onClick={() => this.setState({ clicked: false }, this.props.onDelete)}
          style={{
            background: 'rgb(221, 90, 82)',
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            margin: '0 0',
            padding: '0 0',
            lineHeight: '0'
          }}
        >×</button>
      : <button
          onClick={() => this.setState(
            { clicked: true },
            () => this.timeoutId = setTimeout(() => this.setState({ clicked: false }), 1500))}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            margin: '0 0',
            padding: '0 0',
            lineHeight: '0'
          }}
        >×</button>
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId)
  }
}
