import React, { Component } from 'react';
import PropTypes from 'prop-types'
import BigCalendar from 'react-big-calendar'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Select from 'react-select'
import moment from 'moment'
import randomColor from 'randomcolor'

import generateSchedule from './algo'
import tower from './assets/uvm_tower.svg'
import { subscribe, unsubscribe } from './util/state'
import { addQuery, toggleQuery, removeQuery, modifyQuery, toggleSection, loadSchedule, addSchedule, modifyScheduleName } from './state/actions'
import CourseSearch from './components/CourseSearch'
import Delete from './components/util/Delete'
import Dropdown from './components/util/Dropdown'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-select/dist/react-select.css';
import './App.css';

const colors = [
  'rgb(40,107,176)', 'rgb(166,116,171)', 'rgb(202,180,145)', 'rgb(170,178,177)', 'rgb(167,204,182)',
  'rgb(146,150,198)', 'rgb(177,203,229)','rgb(248,212,72)','rgb(231,131,81)','rgb(216,109,105)']

// const colors = [
//   "#8ef2e0", "#7bf287", "#b5f78f", "#98f99b", "#deff75", "#69eaaa", "#6fedc7", "#70f9d9",
//   "#ddff93", "#ccef7a", "#74f781", "#88efcf", "#abfce8", "#77f977", "#77efa9", "#9af9a7",
//   "#79fc7f", "#88f791", "#daf99a", "#d2ffaf", "#a7f28a", "#86f473", "#b3f9a7", "#aefcd4",
//   "#d0ffa8", "#7efc99", "#86f99c", "#a4f9bf", "#f1f79e", "#6ff29f", "#7bfcd7", "#b7f98b",
//   "#adf986", "#b3f473", "#ebfc94", "#adffae", "#c9ef83", "#7fffd4", "#7df2c9", "#b6ffad",
//   "#e4f995", "#8ef9ac", "#85ef81", "#d1f771", "#9bf7de", "#c6f291", "#afffce", "#a3ff89",
//   "#9cfcbe", "#69eaa5", "#acfca1", "#b4f99f", "#aefca9", "#99fcf4", "#8ff7b9", "#8af2e6",
//   "#b6ed7b", "#c2f975", "#a7f9de", "#81ef95", "#f9ffb2", "#98f28c", "#a5ffdc", "#96ed71",
//   "#74fcb1", "#d1ff77", "#bbf79b", "#8bf46e", "#dbfc9f", "#cff497", "#dcffa0", "#ebffaa",
//   "#e1ff82", "#e0f47a", "#d0f78c", "#8af2d6", "#7cefa8", "#9ef7b1", "#84f489", "#eff484",
//   "#d3f79e", "#bdef6b", "#b9ef77", "#80f2bf", "#aef79e", "#88fc97", "#9ef274", "#ddf291",
//   "#9ff9cf", "#d0f9a7", "#a2f98e", "#86f4a0", "#a3ffb8", "#a4fcdc", "#a9fcd9", "#e0fc99",
//   "#bfff91", "#aaff89", "#c4fca6", "#d8ffad",
//
//
//   "#edb576", "#f4b375", "#fcc78a", "#ffe9ad", "#ffd6b5", "#f7c299", "#ffc593", "#f2ce8c",
//   "#f7e3af", "#f9c78e", "#fcc476", "#ffeebc", "#f2cb79", "#fcb77e", "#f9ba9a", "#f2c182",
//   "#ffdea3", "#ffcaa3", "#fcca9c", "#f2d185", "#f9d6bb", "#f7ddb4", "#f4c197", "#ffe7c9",
//   "#f9c998", "#f4be92", "#f9d4b6", "#f7b78c", "#fcc174", "#fce5ba", "#f9eabd", "#ffe8b2",
//   "#f9d3a2", "#f9ab77", "#fcdac2", "#edb389", "#f9bc9d", "#f7e3a8", "#ffccad", "#fcbc7b",
//   "#f7da7b", "#f9ce98", "#f7d274", "#ffe7ad", "#f2d482", "#fcbd83", "#f9af81", "#f7d0b2",
//   "#f7cead", "#f79c71", "#ffd196", "#f7b591", "#ffebb2", "#f9c495", "#f7b58f", "#f9ce89",
//   "#f4dd90", "#f4bf70", "#ffdcba", "#ffddb7", "#ffdbc9", "#ffd0b7", "#fce2a1", "#f9d0ae",
//   "#ffb87f", "#ffd47f", "#ffdbc9", "#f9cfbb", "#f4d77f",
//   "#fcc480", "#fce5b8", "#ffe3a8", "#f7c494", "#f4a46e", "#efb07c", "#efad6b", "#fcbc9c",
//   "#f4af81", "#ffe6cc", "#f9ddac", "#ffd387", "#f9ac70", "#f9c381", "#fce4c4", "#ed9c6d",
//   "#fcd297", "#fcd9bd", "#f7c896", "#fcbc88", "#fce1a4", "#f7c9a0", "#f7ce8c", "#ffd0aa",
//   "#f2c685", "#edc982", "#f4d29a", "#f2bb6f", "#f7dda5", "#f7bda0", "#fff0c4",
//
// ]

class App extends Component {
  componentWillMount() {
    const state = this.context.store.getState()
    this.state = {
      courses: state.courses,
      queries: state.queries,
      schedules: state.schedules,
      scheduleId: state.scheduleId,
      results: [],
      events: [],
    }
  }

  componentDidMount() {
    this.unsubscribeStore = subscribe(this)('courses', 'scheduleId', 'schedules')
    this.unsubscribeQueries = subscribe(this)('queries', this.coursesToEvents)
    this.unsubscribeResults = subscribe(this)('results', () => {
      this.coursesToEvents()
      this.handleResultsChange()
    })
  }

  componentWillUnmount() { unsubscribe(this) }

  addQuery = () => {
    const queryId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    this.context.store.dispatch(addQuery(queryId))
  }

  resultsHaveOneCourse = ({results}) =>
    results.reduce((sum, sugg) =>
      sum.findIndex(elem =>
        elem.subject + elem.number === sugg.subject + sugg.number
      ) > -1
        ? sum
        : sum.concat(sugg)
    , []).length === 1

  handleResultsChange = () => {
    const results = Object.values(this.state.results)

    if (results.filter(this.resultsHaveOneCourse).length === results.length && results.length > 0) {
      this.addQuery()
    }
  }

  handleCalendarToggle = queryId => section => () => {
    this.context.store.dispatch(toggleSection(queryId, section))
  }

  handleSheduleTitleChange = event => {
    this.context.store.dispatch(modifyScheduleName(this.state.scheduleId, event.target.value))
  }

  coursesToEvents() {
    const { queries } = this.state
    const courses = Object.entries(this.state.results)
      .filter(([queryId, results]) => !!queries[queryId])
      .filter(([queryId, results]) => queries[queryId].enabled)
      .filter(([queryId, results]) => this.resultsHaveOneCourse(results))
      .map(([queryId, results]) => results.results.map(result => Object.assign({}, result, { queryId })))
      .reduce((sum, elem) => sum.concat(elem), [])
      .filter(result => !queries[result.queryId].disabledSections.includes(result.section))

    const baseTime = moment().startOf('week')
    const days = { M: 1, T: 2, W: 3, R: 4, F: 5, S: 6 }
    const events = []
    let currentColor = 0
    let prevSubjNum = ''

    for (let course of courses) {
      for (let day of course.days) {
        if (day === ' ') continue

        const time = baseTime.clone().add(days[day], 'days')
        const start = course.startTime.split(':').map(n => parseInt(n))
        const end = course.endTime.split(':').map(n => parseInt(n))
        const number = (course.subject + course.number).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

        events.push({
          queryId: course.queryId,
          section: course.section,
          title: course.subjNumSec.toUpperCase(),
          start: time.clone().hour(start[0]).minute(start[1]).second(0).toDate(),
          end: time.clone().hour(end[0]).minute(end[1]).second(0).toDate(),
          // color: queries[course.queryId].color,
          color: colors[number % colors.length]
        })
      }
    }

    this.setState({ events })
  }

  render() {
    const events = this.state.events.reduce((sum, arr) => arr ? sum.concat(arr) : sum, [])

    if (!this.state.schedules[this.state.scheduleId]) return null

    return (
      <div className="App">
        <div className="header util vertical-center">
          <img className="logo" src={tower}></img>
          <h1>Fall 2018</h1>

          <Dropdown
            onTitleChange={this.handleSheduleTitleChange} // TODO: CHANGE THIS UGH
            scheduleName={this.state.schedules[this.state.scheduleId].name}
            scheduleId={this.state.scheduleId}
            onScheduleChange={next => next
              && next.value !== this.state.scheduleId
              && this.context.store.dispatch(loadSchedule(next.value))}
            options={Object.values(this.state.schedules)
              .map(schedule => ({ value: schedule.id, label: schedule.name }))
            }
          />
        </div>
        <div className="calendar">
          <BigCalendar
            min={moment().hour(8).minute(0).second(0).toDate()}
            max={moment().hour(21).minute(0).second(0).toDate()}
            defaultView="week"
            toolbar={false}
            events={events}
            eventPropGetter={event => ({
              style: { background: event.color, outline: '0px solid rgba(0,0,0,0)', color: '#000000' }
            })}
            formats={{
              dayHeaderFormat() { return '' },
              dayFormat() { return '' },
              eventTimeRangeFormat() { return '' },
            }}
            components={{
              event: ({ event }) => <span>
                <Delete singleClick={true}
                  onDelete={this.handleCalendarToggle(event.queryId)(event.section)}
                />
                {event.title}
              </span>
            }}
          />
        </div>
        <div className="queries">
          {Object.keys(this.state.queries).map(queryId =>
            <CourseSearch key={queryId} queryId={queryId}/>
          )}
        </div>
      </div>
    );
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}

export default App;
