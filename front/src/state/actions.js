import * as types from './action-types'

export let coursesFetch = () => ({
  type: types.COURSES_FETCH
})
export let coursesSuccess = (courses) => ({
  type: types.COURSES_SUCCESS,
  courses
})

export let addQuery = (queryId, query) => ({
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

export let addSections = (sectionId, query) => ({
  type: types.ADD_SECTIONS,
  sectionId, query
})
export let removeSections = (sectionId) => ({
  type: types.REMOVE_SECTIONS,
  sectionId
})
export let modifySections = (sectionId, query) => ({
  type: types.MODIFY_SECTIONS,
  sectionId, query
})
export let enableSections = (sectionId) => ({
  type: types.ENABLE_SECTIONS,
  sectionId
})
export let disableSections = (sectionId) => ({
  type: types.DISABLE_SECTIONS,
  sectionId
})
export let toggleSections = (sectionId) => ({
  type: types.TOGGLE_SECTIONS,
  sectionId
})
