import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { coursesSuccess } from './state/actions'
import { subscribe, unsubscribe } from './util/state'
import CSV from 'comma-separated-values'
import csvFile from './assets/courses.csv'

export default class StateManager extends Component {
  componentWillMount() {
    this.state = {}

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
  }

  componentWillUnmount() { unsubscribe(this) }

  fetchCourses = async () => {
    if (this.fetchingCourses) return

    this.fetchingCourses = true

    const cors = 'https://cors-anywhere.herokuapp.com/'
    const url = 'giraffe.uvm.edu:443/~rgweb/batch/curr_enroll_spring.txt'
    const s = 'String', n = 'Number', b = 'Boolean'

    const text = await fetch(cors+url).then(response => response.text())
    // const text = await fetch(csvFile).then(response => response.text())
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

  render() {
    return this.props.children
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}
