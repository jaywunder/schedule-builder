import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { addSchedule, removeSchedule, loadSchedule, duplicateSchedule } from '../../state/actions'
import Delete from './Delete'

import { Collapse } from 'react-collapse'

import './Dropdown.css'

export default class Dropdown extends Component {

  constructor(...args) {
    super(...args)
    this.state = {
      collapsed: true
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

    setTimeout(() => {
      this.refs.textInput.focus()
      this.refs.textInput.setSelectionRange(0, this.refs.textInput.value.length)
    }, 100)
  }

  handleRemoveSchedule = () => {
    if (this.props.options.length === 1) return

    this.context.store.dispatch(removeSchedule(this.props.scheduleId))
    this.context.store.dispatch(loadSchedule(this.props.options[0].value))
  }

  handleDuplicateSchedule = () => {
    this.context.store.dispatch(duplicateSchedule(this.props.scheduleId))
  }

  render () {
    return <div className="Dropdown">
      <input
        type="text"
        ref='textInput'
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
      >–</button>

      {/* <button
        onClick={this.handleDuplicateSchedule}
      >d</button> */}

      <div className="relative">
        <div className={"absolute " + (this.state.collapsed ? 'collapsed' : 'expanded')}>
          <Collapse isOpened={!this.state.collapsed}>
            <div className=''>
              {this.props.options
                .filter(option => option.value !== this.props.scheduleId)
                .map((option, i) =>
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
