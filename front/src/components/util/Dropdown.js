import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { addSchedule, loadSchedule } from '../../state/actions'
import Delete from './Delete'

import { Collapse } from 'react-collapse'

import './Dropdown.css'

export default class Dropdown extends Component {

  constructor(...args) {
    super(...args)

    this.state = {
      collapsed: false
    }
  }

  toggleExpando = () => this.setState(({ collapsed }) => ({ collapsed: !collapsed }))

  handleSelectSchedule = option => () => {
    this.props.onScheduleChange(option)
    this.toggleExpando()
  }

  handleAddSchedule = () => {
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    this.context.store.dispatch(addSchedule(id))
    this.context.store.dispatch(loadSchedule(id))
  }
  handleRemoveSchedule = () => {
    // this.context.store.dispatch(addSchedule(id))
    // this.context.store.dispatch(loadSchedule(id))
    console.log('remove please')
  }

  render () {

    return <div className="Dropdown">
      <input
        type="text"
        onChange={this.props.onTitleChange}
        value={this.props.scheduleName}
      ></input>

      <button
        onClick={this.toggleExpando}
      >{ this.state.collapsed ? '▲' : '▼'}</button>

      <button
        onClick={this.handleAddSchedule}
      >+</button>

      <button
        onClick={this.handleRemoveSchedule}
      >-</button>

      <div className="relative">
        <div className="absolute">
          <Collapse isOpened={this.state.collapsed}>
            <div className="absolute-collapse">
              {this.props.options.map((option, i) =>
                <div
                  key={i}
                  onClick={this.handleSelectSchedule(option)}
                  >
                    { option.label }
                  </div>
                )}
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}
