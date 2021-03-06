import * as types from './action-types'

export function courses(state = null, action) {
  switch (action.type) {
    case types.COURSES_FETCH:
      return null

    case types.COURSES_SUCCESS:
      return action.courses
  }
  return state
}

// this is the id of  current loaded schedule
export function scheduleId(state = {}, action) {

  switch (action.type) {
    case types.LOAD_SCHEDULE:
      return action.scheduleId

    case types.DUPLICATE_SCHEDULE:
      return action.nextId
  }

  return state
}

// this is an object of metadata about schedules, does not contain queries
export function schedules(state = {}, action) {
  let nextState = Object.assign({}, state)
  nextState[action.scheduleId] = Object.assign({}, state[action.scheduleId])
  let ids

  switch (action.type) {
    case types.ADD_SCHEDULE:
      nextState[action.scheduleId] = {
        id: action.scheduleId,
        name: action.name,
        duplicate: null,
      }

      return nextState

    case types.DUPLICATE_SCHEDULE:
      let { name } = nextState[action.scheduleId]
      nextState[action.nextId] = {
        id: action.nextId,
        name: name + ' copy',
        duplicate: action.scheduleId,
      }

      return nextState

    case types.REMOVE_SCHEDULE:
      delete nextState[action.scheduleId]
      return nextState

    case types.LOAD_SCHEDULES:
      return Object.assign({}, action.schedules)

    case types.MODIFY_SCHEDULE_NAME:
      nextState[action.scheduleId].name = action.name
      return nextState
  }

  return state
}

export function queries(state = {}, action) {
  let disabledSections
  let nextState = Object.assign({}, state)
  console.log('nextState', nextState)
  console.log('state', state)
  nextState[action.queryId] = Object.assign({}, (state || {})[action.queryId])

  switch (action.type) {
    case types.ADD_QUERY:
      return Object.assign({
        [action.queryId]: {
          query: action.query,
          enabled: true,
          disabledSections: [], // fill with course ids
        }
      }, state)

    case types.DUPLICATE_SCHEDULE:
      const duplicate = {}
      Object.values(state)
        .map(query => [query, Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)])
        .forEach(([query, id]) => duplicate[id] = Object.assign({}, query))
      return duplicate

      // nextState = Object.assign({}, state)
      // Object.keys(nextState).forEach(key => nextState[key] = Object.assign({}, nextState[key]))
      //
      // return nextState


    case types.LOAD_QUERIES:
      return action.queries

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
        disabledSections.splice(disabledSections.indexOf(action.section), 1)
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

    case types.DUPLICATE_SCHEDULE:
    case types.LOAD_SCHEDULE:
      return {}

    case types.LOAD_QUERIES:
      nextState = {}
      for (let queryId in action.queries) {
        nextState[queryId] = {
          results: [],
        }
      }

      return nextState

    case types.UPDATE_RESULTS:
      nextState[action.queryId].results = action.results
      return nextState
  }

  return state
}
