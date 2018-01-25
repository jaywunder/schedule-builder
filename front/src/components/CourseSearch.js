import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'react-collapse'
import fuzzysearch from 'fuzzysearch'
import { subscribe, unsubscribe } from '../util/state'
import { modifyQuery } from '../state/actions'
import Course from './Course'
import Toggle from './util/Toggle'
import Delete from './util/Delete'
import './CourseSearch.css'

export default class CourseSearch extends Component {

  static propTypes = {
    queryId: PropTypes.string.isRequired,
  }

  componentWillMount() {
    const state = this.context.store.getState()
    this.state = {
      query: '',
      enabled: true,
      collapsed: true,
      courses: state.courses,
      sectionStates: {},
      suggestions: []
    }
  }

  componentDidMount() {
    this.unsubscribeStore = subscribe(this)('courses')
    this.unsubscribeQueries = subscribe(this)('queries', () => {
      const state = this.context.store.getState()
      console.log('IN THE SIBSCIPTION HERE');
      console.log(state.queries[this.props.queryId])
      this.setState(state.queries[this.props.queryId])
    })
  }

  componentWillUnmount() { unsubscribe(this) }

  componentDidUpdate(prevProps, prevState) {
    // if (prevState.query !== this.state.query)
    //   this.onQueryChange(this.state.query)
  }

  // TODO: Move this out to SOMEHWERE else
  getSuggestions(search) {
    if (!this.state.courses || search === '' || !search || search.length < 2) return []
    const courses = this.state.courses
    search = search.trim()
      .toLowerCase()
      .replace(/ /g, '')

    const isCourseNumber = !!search.match(/^\d{5}$/)
    const isSubjNumSec = !!search.match(/^[a-z]{2,4}\d{0,3}[a-z0-9]{0,3}$/)
    const isTitle = !!search.match(/^.*$/)

    if (isCourseNumber)
      return courses.filter(course => search === course.courseNumber)
    else if (isSubjNumSec)
      return courses.filter(course => course.subjNumSec.startsWith(search))
    else if (isTitle)
      return courses.filter(course => fuzzysearch(search, course.title.toLowerCase()))
    else return []
  }

  onQueryChange = event => {

    console.log('EVENT:', event.target.value);

    this.context.store.dispatch(modifyQuery(this.props.queryId, event.target.value))

    // const suggestions = this.getSuggestions(query)
    // const sectionStates = suggestions.map(() => true)
    // this.setState({ suggestions, sectionStates }, () => {
    //   if (!this.hasOneCourse()) {
    //     return this.props.onChange({ query: this.state.query, courses: [] })
    //   }
    //
    //   this.props.onChange({
    //     query: this.state.query,
    //     courses: this.state.suggestions
    //   })
    //
    //   this.props.onHasOneCourse()
    //
    //   this.setState({
    //     sectionStates: this.groupCourses()
    //       .map(([c]) => c.section)
    //       .filter((sec, i, arr) => i === 0 || sec !== arr[i-1])
    //       .reduce((sum, elem, i) => Object.assign(sum, { [elem]: true }), {})
    //   })
    // })
  }

  onAllToggle = () => this.setState(({ enabled }) => {
    if (enabled) this.props.onChange([])
    else this.props.onChange(this.state.suggestions)
    return { enabled: !enabled }
  })

  onSectionToggle = section => () =>
    this.setState(({ sectionStates }) => ({
      sectionStates: Object.assign(sectionStates, { [section]: !sectionStates[section] })
    }), () => this.props.onChange(
      this.state.suggestions.filter(sugg => this.state.sectionStates[sugg.section])
    ))

  reduceCourses = () =>
    this.state.suggestions.reduce((sum, sugg) =>
      sum.findIndex(elem =>
        elem.subject + elem.number === sugg.subject + sugg.number
      ) > -1
        ? sum
        : sum.concat(sugg)
    , [])

  groupCourses = () => {
    const { suggestions } = this.state
    const groups = [[suggestions[0]]]
    for (let i = 1; i < suggestions.length; i++) {
      const sugg = suggestions[i]
      const group = groups[groups.length-1]

      if (sugg.section === group[0].section)
        group.push(sugg)
      else groups.push([sugg])
    }
    return groups
  }

  hasOneCourse = () => this.reduceCourses().length === 1

  onCollapseToggle = () =>
    this.setState( ({collapsed}) => ({ collapsed: !collapsed }) )

  render() {
    const { suggestions, courses } = this.state;
    const hasOneCourse = this.hasOneCourse()
    // const isOpened = true
    const isOpened = hasOneCourse && !this.state.collapsed && this.state.enabled

    return <div
        className="CourseSearch"
        onMouseEnter={() => this.setState({ collapsed: false })}
        onMouseLeave={() => this.setState({ collapsed: true })}
      >
      { !hasOneCourse && <div>
        <div className="search-wrapper">
          <input
            value={this.state.query}
            className="search-input"
            onChange={ this.onQueryChange }
            type="text"
            placeholder="Search 'CS 120B', 'Adv Programming: C++', or '94803'"
          ></input>

        </div>
        <table>
          <tbody>
            { this.reduceCourses().map((course, i) =>
              <tr
                key={i}
                className="search-listing"
                onClick={() => this.setState({ query: course.subject + course.number })}
                // onClick={() => console.log(i, course)}
              >
                <td>{ course.subject }</td>
                <td>{ course.number }</td>
                <td>{ course.title }</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      { hasOneCourse && <div>
        <div className="util vertical-center">
          <Toggle state={this.state.enabled} onToggle={this.onAllToggle}/>
          <Delete onDelete={() => {this.props.onChange([]); this.props.onDelete()}}/>
          <h4 className="title">
            { suggestions[0].subject }&nbsp;
            { suggestions[0].number }&nbsp;
            { suggestions[0].title }
          </h4>
        </div>

        <Collapse isOpened={isOpened}>

          { this.groupCourses().map((group, i) =>
            <div key={i} className="course-group">

              <hr style={i === 0 ? { border: 'none' } : {}}/>

              <Toggle
                state={this.state.sectionStates[group[0].section]}
                onToggle={this.onSectionToggle(group[0].section)}
              />

              <div className="course-info">
                { group.map((course, j) =>  <Course key={j} course={course} showSection={j === 0}/> )}
              </div>

            </div> )}
        </Collapse>

        {!isOpened && <div className="arrow-down">
          ▼
        </div>}
      </div>}
    </div>
  }

  static contextTypes = {
    store: PropTypes.object,
  }
}
