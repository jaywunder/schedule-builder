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
  let disabledSections
  let nextState = Object.assign({}, state)
  nextState[action.queryId] = Object.assign({}, state[action.queryId])

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
      delete nextState[action.queryId]
      return nextState

    case types.MODIFY_QUERY:
      nextState[action.queryId].query = action.query
      return Object.assign({}, nextState)

    case types.ENABLE_QUERY:
      nextState[action.queryId].enabled = true
      return nextState

    case types.DISABLE_QUERY:
      nextState[action.queryId].enabled = false
      return nextState

    case types.TOGGLE_QUERY:
      nextState[action.queryId].enabled = !nextState[action.queryId].enabled
      return nextState

    case types.ENABLE_SECTION:
      disabledSections = nextState[action.queryId].disabledSections
      if (!disabledSections.includes(action.section))
        disabledSections.push(action.section)
      return nextState

    case types.DISABLE_SECTION:
      disabledSections = nextState[action.queryId].disabledSections
      if (disabledSections.includes(action.section))
        disabledSections.splice(disabledSections.indexOf(action.section))
      return nextState

    case types.TOGGLE_SECTION:
      disabledSections = nextState[action.queryId].disabledSections
      if (!disabledSections.includes(action.section))
        disabledSections.push(action.section)
      else
        disabledSections.splice(disabledSections.indexOf(action.section))
      return nextState
  }
  return state
}

export function results(state = {}, action) {
  let nextState = Object.assign({}, state)
  nextState[action.queryId] = Object.assign({}, state[action.queryId])

  switch (action.type) {
    case types.ADD_QUERY:
      return Object.assign({
        [action.queryId]: {
          results: [],
        }
      }, state)

    case types.REMOVE_QUERY:
      delete nextState[action.queryId]
      return nextState

    case types.UPDATE_RESULTS:
      nextState[action.queryId].results = action.results
      return nextState
  }

  return state
}
