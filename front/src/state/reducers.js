import * as types from './action-types'

export function courses(state = null, action) {
  switch (action.type) {
    case types.COURSES_FETCH:
      return null
      break;

    case types.COURSES_SUCCESS:
      return action.courses
      break;
  }
  return null
}

export function queries(state = {}, action) {
  switch (action.type) {
    case types.ADD_QUERY:
      const { queryId, query } = action
      state[queryId] = {
        queryId, query,
        enabled: true,
      }
      break

    case types.REMOVE_QUERY:
      delete state[action.queryId]
      break

    case types.MODIFY_QUERY:
      state[action.queryId].query = action.query
      break

    case types.ENABLE_QUERY:
      state[action.queryId].enabled = true
      break

    case types.DISABLE_QUERY:
      state[action.queryId].enabled = false
      break

    case types.TOGGLE_QUERY:
      state[action.queryId].enabled = !state[action.queryId].enabled
      break

  }
  return null
}

export function sections(state = {}, action) {
  switch (action.type) {
    case types.ADD_SECTIONS:
      const { sectionId, sections } = action
      state[sectionId] = {
        sectionId, sections,
        enabled: true,
      }
      break

    case types.REMOVE_SECTIONS:
      delete state[action.sectionId]
      break

    case types.MODIFY_SECTIONS:
      state[action.sectionId].sections = action.sections
      break

    case types.ENABLE_SECTIONS:
      state[action.sectionId].enabled = true
      break

    case types.DISABLE_SECTIONS:
      state[action.sectionId].enabled = false
      break

    case types.TOGGLE_SECTIONS:
      state[action.sectionId].enabled = !state[action.sectionId].enabled
      break

  }
  return null
}
