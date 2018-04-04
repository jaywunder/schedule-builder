import * as types from './action-types'

export let coursesFetch = () => ({
  type: types.COURSES_FETCH
})
export let coursesSuccess = (courses) => ({
  type: types.COURSES_SUCCESS,
  courses
})

export let addQuery = (
  queryId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  query = ''
) => ({
  type: types.ADD_QUERY,
  queryId, query
})
export let loadQueries = (queries) => ({
  type: types.LOAD_QUERIES,
  queries
})
export let removeQuery = (queryId) => ({
  type: types.REMOVE_QUERY,
  queryId
})
export let modifyQuery = (queryId, query) => ({
  type: types.MODIFY_QUERY,
  queryId, query
})
export let enableQuery = (queryId) => ({
  type: types.ENABLE_QUERY,
  queryId
})
export let disableQuery = (queryId) => ({
  type: types.DISABLE_QUERY,
  queryId
})
export let toggleQuery = (queryId) => ({
  type: types.TOGGLE_QUERY,
  queryId
})
export let enableSection = (queryId, section) => ({
  type: types.ENABLE_SECTION,
  queryId, section
})
export let disableSection = (queryId, section) => ({
  type: types.DISABLE_SECTION,
  queryId, section
})
export let toggleSection = (queryId, section) => ({
  type: types.TOGGLE_SECTION,
  queryId, section
})

export let updateResults = (queryId, results) => ({
  type: types.UPDATE_RESULTS,
  queryId, results
})

export let addSchedule = (
  scheduleId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  name = 'Untitled'
) => ({
  type: types.ADD_SCHEDULE,
  scheduleId, name
})
export let removeSchedule = (scheduleId) => ({
  type: types.REMOVE_SCHEDULE,
  scheduleId
})
export let switchSchedule = (scheduleId) => ({
  type: types.SWITCH_SCHEDULE,
  scheduleId
})
export let loadSchedules = (schedules) => ({
  type: types.LOAD_SCHEDULES,
  schedules
})
export let loadSchedule = (scheduleId) => ({
  type: types.LOAD_SCHEDULE,
  scheduleId
})
export let modifyScheduleName = (scheduleId, name) => ({
  type: types.MODIFY_SCHEDULE_NAME,
  scheduleId, name
})
