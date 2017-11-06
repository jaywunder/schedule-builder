import React, { Component } from 'react'

export default class Delete extends Component {
  state = {
    clicked: false,
  }

  render () {
    return this.state.clicked
      ? <button
          onClick={() => this.setState({ clicked: false }, this.props.onDelete)}
          style={{ background: 'red' }}
        >×</button>
      : <button
          onClick={() => this.setState(
            { clicked: true },
            () => setTimeout(() => this.setState({ clicked: false }), 1500))}
        >×</button>
  }
}
