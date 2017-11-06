const timeToScalar = time => time.split(':')
  .map(n => parseInt(n))
  .reduce((sum, elem, i) => i === 0 ? sum + elem * 60 : sum + elem, 0)

const scalarToTime = scalar => [Math.floor(scalar / 60), scalar % 60]
  .map(n => n + '').join(':')

const toString = function(){ return `${this.subjNumSec} (${this.courseNumber})` }
const courseFormatter = course => {
  course = Object.assign({}, course)
  course.toString = toString.bind(course)
  return course
}

const setDifference = (A, B) => {
    const difference = new Set(A)
    for (const elem of B) {
        difference.delete(elem)
    }
    return difference
}

function findConflicting(courses) {
  const conflicts = {}

  for (let i in courses) { const target = courses[i]
    const store = conflicts[target] = (conflicts[target] || [])
    const regex = new RegExp(`(${target.days.replace(/ /g, '').split('').join('|')})`, 'g')

    for (let j in courses) { const compare = courses[j]
      if (i === j) continue

      if (
        ( // time interference
          (target.startTime >= compare.startTime && target.startTime <= compare.endTime) ||
          (target.endTime >= compare.startTime && target.endTime <= compare.endTime)
        ) && (
          // day interference
          regex.test(compare.days)
        ) && (
          // no duplicates
          !store.includes(compare.toString())
        )
      ) store.push(compare.toString())
    }
  }

  return conflicts
}

function findAmicable (courses, conflicts) {
  const amicable = {}

  for (let i in courses) { const target = courses[i]
    amicable[target] = (amicable[target] || [])
    const store = amicable[target]

    for (let j in courses) { const compare = courses[j]
      if (i === j) continue

      if (
        !conflicts[target].includes(compare.toString()) &&
        target.courseNumber !== compare.courseNumber &&
        target.subject + target.number !== compare.subject + compare.number &&
        !store.includes(compare.toString())
      )
        store.push(compare.toString())
    }
  }

  return amicable
}

function buildSchedules(courses, amicable) {
  let paths = []

  for (let course of courses)
    paths.push(traverse(
      amicable, course.toString(), 5, [], paths
    ))

  return paths
}

function traverse(amicable, current, maxLength, visited, paths) {
  visited = visited.concat(current)

  if (maxLength === visited.length) {
    paths.push(visited)
    return
  }

  let done = true
  for (let node of amicable[current]) {
    if (consider(amicable, visited, node)) {
      done = false
      traverse(amicable, node, maxLength, visited, paths)
    }
  }

  if (done) paths.push(visited)
}

function consider(amicable, visited, current) {
  const adjacent = amicable[current]

  for (let other of visited)
    if (!adjacent.includes(other)) return false
  return true
}

const removeDuplicates = schedules => schedules
  .map(s => new Set(s))
  .filter(set => set.size > 0)
  .filter((target, i, arr) => !arr
      .map((other, j) =>
        j > i &&
        target !== other &&
        setDifference(target, other).size === 0
      ).includes(true)
  )

export default function (courses) {
  courses = courses.map(courseFormatter)

  const conflicts = findConflicting(courses)
  const amicable = findAmicable(courses, conflicts)
  // console.log('conflicts', conflicts)
  // console.log('amicable', amicable)
  const schedules = buildSchedules(courses, amicable)

  return removeDuplicates(schedules)

}
