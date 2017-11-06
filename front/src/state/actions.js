import * as types from './action-types'

export function coursesFetch() {
  return { type: types.COURSES_FETCH }
}
export function coursesSuccess(courses) {
  return { type: types.COURSES_SUCCESS, courses }
}
