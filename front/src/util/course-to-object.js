export let courseToObj = course => {
  subject: course[0],
  number: course[1],
  title: course[2],
  courseNumber: course[3],
  section: course[4],
  lecLab: course[5],
  campcode: course[6],
  collcode: course[7],
  maxEnroll: course[8],
  currentEnroll: course[9],
  startTime: course[10],
  endTime: course[11],
  days: course[12],
  credits: course[13],
  building: course[14],
  room: course[15],
  instructor: course[16],
  netId: course[17],
  email: course[18],
}
