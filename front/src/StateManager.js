import React, { Component } from 'react';
import fuzzysearch from 'fuzzysearch'
import PropTypes from 'prop-types'
import { coursesSuccess, updateResults, loadQueries, loadSchedule, loadSchedules, addQuery, addSchedule } from './state/actions'
import { subscribe, unsubscribe } from './util/state'
import CSV from 'comma-separated-values'
import csvFile from './assets/courses-spring2019.csv'

export default class StateManager extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      queries: {},
      courses: [],
      schedules: {},
      scheduleId: null,
    }

    this.fetchingCourses = false

    this.fetchCourses()
  }

  componentDidMount() {
    const { store } = this.context

    subscribe(this)('courses', 'schedules')
    subscribe(this)('scheduleId', this.loadQueries)

    const unsubscribeCourses = store.subscribe(() => {
      const state = store.getState()
      if (!state.courses)
        this.fetchCourses()
    })

    this.unsubscribeQueries = store.subscribe(() => {
      const { queries } = store.getState()

      const differences = []
      for (let queryId in queries) {
        if (this.state.queries[queryId] !== queries[queryId]) {
          differences.push(queryId)
        }
      }

      if (queries !== this.state.queries) {
        this.setState({ queries }, () => {
          if (Object.keys(queries).length > 0)
            this.saveSchedule()

          differences
            // .filter(queryId => queries[queryId].enabled)
            .map(queryId => this.getResults(queryId))
        })
      }
    })

    this.unsubscribeSchedules = store.subscribe(() => {
      const { schedules } = store.getState()

      const differences = []
      for (let scheduleId in schedules) {
        if (this.state.schedules[scheduleId] !== schedules[scheduleId]) {
          differences.push(scheduleId)
        }
      }

      if (schedules !== this.state.schedules) {
        this.setState({ schedules }, () => {
          if (Object.keys(schedules).length > 0)
            this.saveSchedules()
        })
      }
    })

    this.loadSchedules()
  }

  componentWillUnmount() { unsubscribe(this) }

  fetchCourses = async () => {
    if (this.fetchingCourses) return

    this.fetchingCourses = true

    const cors = 'https://cors-anywhere.herokuapp.com/'
    const url = 'giraffe.uvm.edu:443/~rgweb/batch/curr_enroll_spring.txt'
    const s = 'String', n = 'Number', b = 'Boolean'

    // const text = await fetch(cors+url).then(response => response.text())
    const text = await fetch(csvFile).then(response => response.text())
    const rows = text.split('\n')
      .map(row => row.replace(/("|,| |\d\d:\d\d|@uvm.edu)/g, ''))

    let data

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      data = CSV.parse(text, {
        cast: [s, s, s, s, s, s, s, s, n, n, s, s, s, n, s, s, s, s, s],
        header: ['subject', 'number', 'title', 'courseNumber', 'section', 'lecLab', 'campcode', 'collcode', 'maxEnroll', 'currentEnroll', 'startTime', 'endTime', 'days', 'credits', 'building', 'room', 'instructor', 'netId', 'email']
      })

    else data = await fetch('/schedule-builder/public/index.php/api/scrape').then(res => res.json())

    data
      .map((elem, i) => { elem.text = rows[i]; return elem })
      // .filter(({courseNumber}, i, arr) => i > 0 && courseNumber !== arr[i-1].courseNumber)
      // .filter(({maxEnroll}) => maxEnroll === 0)
      .map((elem, i) => {

        elem.subjNumSec = (elem.subject + elem.number + elem.section).toLowerCase()

        const instructor = elem.instructor.split(',').reverse().join('').trim()
        elem.searchText = elem.subject + elem.number + elem.section + elem.title + elem.lecLab + elem.building + instructor
        elem.searchText = elem.searchText
          .replace(/( |\.|:)/g, '')
          .replace(/&/g, '&and')
          .toLowerCase()

        return elem
      })
      .filter((_, i) => i !== 0)
      .filter(course => course.number !== '491')
      .filter(course => course.number !== '391')

    console.log('data', data)

    this.context.store.dispatch(coursesSuccess(data))
    this.fetchingCourses = false
    Object.keys(this.state.queries)
      // .filter(queryId => this.state.queries[queryId].enabled)
      .map(queryId => this.getResults(queryId))
  }

  saveSchedule() {
    localStorage.setItem('schedule-' + this.state.scheduleId, JSON.stringify(this.state.queries))
  }

  saveSchedules() {
    localStorage.setItem('schedules', JSON.stringify(this.state.schedules))
  }

  loadSchedules() {
    const schedules = JSON.parse(localStorage.getItem('schedules'))
    const prevScheduleId = localStorage.getItem('scheduleId')
    const { dispatch } = this.context.store

    if (schedules) {
      dispatch(loadSchedules(schedules))
      dispatch(loadSchedule(prevScheduleId))
    } else {
      const scheduleId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const queryId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      dispatch(addSchedule(scheduleId))
      dispatch(addQuery(queryId))
      dispatch(loadSchedule(scheduleId))
    }
  }

  loadQueries() {
    const { scheduleId, schedules } = this.state
    if (!schedules[scheduleId]) return

    const { dispatch } = this.context.store
    const schedule = JSON.parse(localStorage.getItem('schedule-' + scheduleId))

    localStorage.setItem('scheduleId', scheduleId)

    if (!!schedules[scheduleId].duplicate) return

    if (schedule) {
      console.log('LOADING QUERIES BECAUSE THIS ALREADY EXISTS');
      dispatch(loadQueries(schedule))
    } else {
      console.log('loading nothing and adding a query')
      dispatch(loadQueries({}))
      dispatch(addQuery())
    }
  }

  getResults(queryId) {
    if (!this.state.courses.filter)
      console.log('this.state.courses', this.state.courses)
    if (!this.state.queries[queryId] || !this.state.courses) return

    let search = this.state.queries[queryId].query

    if (!this.state.courses || search === '' || !search || search.length < 2)
      return this.context.store.dispatch(updateResults(queryId, []))

    const courses = this.state.courses
    search = search.trim()
      .toLowerCase()
      .replace(/ /g, '')

    const isCourseNumber = !!search.match(/^\d{5}$/)
    const isSubjNumSec = !!search.match(/^[a-z]{2,4}\d{0,3}[a-z0-9]{0,3}$/)
    const isTitle = !!search.match(/^.*$/)

    let results;
    if (isCourseNumber)
      results = courses.filter(course => search === course.courseNumber)
    else if (isSubjNumSec)
      results = courses.filter(course => course.subjNumSec.startsWith(search))
    else if (isTitle)
      results = courses.filter(course => fuzzysearch(search, course.title.toLowerCase()))
    else results = []

    results = results.filter((course, i) =>
      results.findIndex(other =>
        course.subjNumSec === other.subjNumSec &&
        course.startTime === other.startTime &&
        course.endTime === other.endTime
      ) === i
    )

    this.context.store.dispatch(updateResults(queryId, results))
  }

  render() {
    return this.props.children
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}
