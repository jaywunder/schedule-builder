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
  return state
}

export function queries(state = {}, action) {
  switch (action.type) {
    case types.ADD_QUERY:
      return Object.assign({
        [action.queryId]: {
          query: action.query,
          enabled: true,
          disabledSections: [], // fill with course ids
        }
      }, state)

    case types.REMOVE_QUERY:
      state = Object.assign({}, state)
      delete state[action.queryId]
      return state

    case types.MODIFY_QUERY:
      state[action.queryId].query = action.query
      return Object.assign({}, state)

    case types.ENABLE_QUERY:
      state[action.queryId].enabled = true
      return Object.assign({}, state)

    case types.DISABLE_QUERY:
      state[action.queryId].enabled = false
      return Object.assign({}, state)

    case types.TOGGLE_QUERY:
      state[action.queryId].enabled = !state[action.queryId].enabled
      return Object.assign({}, state)

  }
  return state
}

export function results(state = {}, action) {

  switch (action.type) {
    case types.ADD_QUERY:
      return Object.assign({
        [action.queryId]: {
          results: [],
        }
      }, state)

    case types.UPDATE_RESULTS:
      return Object.assign({}, state, {
        [action.queryId]: {
          results: action.results,
        }
      })
  }

  return state
}
