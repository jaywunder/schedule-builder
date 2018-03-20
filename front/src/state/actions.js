import * as types from './action-types'

export let coursesFetch = () => ({
  type: types.COURSES_FETCH
})
export let coursesSuccess = (courses) => ({
  type: types.COURSES_SUCCESS,
  courses
})

export let addQuery = (queryId, query = '') => ({
  type: types.ADD_QUERY,
  queryId, query
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
