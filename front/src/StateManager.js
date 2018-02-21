import React, { Component } from 'react';
import fuzzysearch from 'fuzzysearch'
import PropTypes from 'prop-types'
import { coursesSuccess, updateResults } from './state/actions'
import { subscribe, unsubscribe } from './util/state'
import CSV from 'comma-separated-values'
import csvFile from './assets/courses.csv'

export default class StateManager extends Component {
  constructor(...args) {
    super(...args)
    this.state = {
      queries: {},
      courses: {},
    }

    this.fetchingCourses = false

    this.fetchCourses()
  }

  componentDidMount() {
    const { store } = this.context

    const unsubscribeCourses = store.subscribe(() => {
      const state = store.getState()
      if (!state.courses)
        this.fetchCourses()
    })

    subscribe(this)('courses')

    this.unsubscribeQueries = subscribe(this)('queries', () => {
      const { queries } = store.getState()

      let differences = []
      for (let queryId in queries) {
        if (this.state[queryId] !== queries[queryId]) {
          differences.push(queryId)
        }
      }

      this.setState({ queries }, () => {
        differences
          .filter(queryId => queries[queryId].enabled)
          .map(queryId => this.getResults(queryId))
      })
    })
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

    const data = CSV.parse(text, {
        cast: [s, s, s, s, s, s, s, s, n, n, s, s, s, n, s, s, s, s, s],
        header: ['subject', 'number', 'title', 'courseNumber', 'section', 'lecLab', 'campcode', 'collcode', 'maxEnroll', 'currentEnroll', 'startTime', 'endTime', 'days', 'credits', 'building', 'room', 'instructor', 'netId', 'email']
      })
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

    this.context.store.dispatch(coursesSuccess(data))
    this.fetchingCourses = false
  }

  getResults(queryId) {
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

    this.context.store.dispatch(updateResults(queryId, results))
  }

  render() {
    return this.props.children
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}
