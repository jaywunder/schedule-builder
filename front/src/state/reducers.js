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
