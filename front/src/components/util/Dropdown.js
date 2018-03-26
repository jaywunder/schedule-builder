import React, { Component } from 'react'

export default class Dropdown extends Component {

  constructor(...args) {
    super(...args)

    this.state = {
      collapsed: false
    }
  }

  render () {
    return <div>
      {/* <input
        type="text"
        onChange={this.handleSheduleTitleChange}
        value={this.state.schedules[this.state.scheduleId].name}
      ></input>
      <button
        onClick={() => this.expanded = !this.expanded}
      ></button>
      <div style={{width: '200px'}}>
        <Select
          name="form-field-name"
          value={this.state.scheduleId}
          onChange={next => next
            && next.value !== this.state.scheduleId
            && this.context.store.dispatch(loadSchedule(next.value))}
          options={
            Object.values(this.state.schedules)
              .map(schedule => ({ value: schedule.id, label: schedule.name }))
            }
        />
      </div> */}
    </div>
  }
}
