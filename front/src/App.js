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
