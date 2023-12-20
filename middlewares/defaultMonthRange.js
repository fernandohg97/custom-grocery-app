'use strict'
module.exports = {
// OBTENER PRIMER Y ULTIMO DIA DE LA SEMANA ACTUAL
  getFirstAndLastDayOfCurrentWeek: (weeksFromCurrent = 0) => {
    const curr = new Date() // get current date
    const weeksToSum = weeksFromCurrent * 7
    curr.setDate(curr.getDate() + weeksToSum)
    curr.setHours(0, 0, 0, 0)
    const first = (curr.getDate() - curr.getDay()) + 1 // First day is the day of the month - the day of the week
    // let last = first + 6; // last day is the first day +let

    const firstday = new Date(curr.setDate(first))
    curr.setHours(11, 59, 59)
    const lastday = new Date(curr.setDate(curr.getDate() + 6))
    console.log(firstday)
    console.log(lastday)
    return [firstday, lastday]
  },

  // OBTENER PRIMER Y ULTIMO DIA DEL MES ACTUAL
  getFirstAndLastDayOfCurrentMonth: (monthsFromCurrent = 0) => {
    const now = new Date()

    const currentMonth = now.getMonth()
    const nextMonthWithPrevious = now.getMonth() + 1

    const firstDay = new Date(now.getFullYear(), currentMonth + monthsFromCurrent, 1)
    console.log(firstDay) // 👉️ Sun Jan 01 2023 ...

    const lastDay = new Date(now.getFullYear(), nextMonthWithPrevious + monthsFromCurrent, 0)
    lastDay.setHours(11, 59, 59)
    console.log(lastDay) // 👉️ Tue Jan 31 2023 ...

    return [firstDay, lastDay]
  },

  // OBTENER PRIMER Y ULTIMO DIA DEL MES ACTUAL
  getFirstDayOfMonthToLastDayOfCurrentMonth: (monthsFromCurrent = 6) => {
    const now = new Date()

    const nextMonthWithPrevious = now.getMonth() + 1

    let lastDay = new Date(now.getFullYear(), nextMonthWithPrevious, 0)
    lastDay.setHours(11, 59, 59)
    // 👉️ Tue Jan 31 2023 ...
    // console.log(lastDay)
    let firstDay = subtractMonths(lastDay, monthsFromCurrent)
    firstDay.setDate(1)
    firstDay.setHours(0, 0, 0)

    firstDay = firstDay.toISOString().split('T')[0]
    lastDay = lastDay.toISOString().split('T')[0]

    console.log(firstDay, lastDay)
    return [firstDay, lastDay]
  },

  // OBTENER PRIMER DIA DEL MES ANTERIOR Y ULTIMO DIA DEL MES ACTUAL (60 DIAS)
  getLastTwoMonths: (monthsFromCurrent = 0) => {
    const now = new Date()

    const currentMonth = now.getMonth() - 1
    const nextMonthWithPrevious = now.getMonth() + 1

    const firstDay = new Date(now.getFullYear(), currentMonth + monthsFromCurrent, 1)
    console.log(firstDay) // 👉️ Sun Jan 01 2023 ...

    const lastDay = new Date(now.getFullYear(), nextMonthWithPrevious + monthsFromCurrent, 0)
    lastDay.setHours(11, 59, 59)
    console.log(lastDay) // 👉️ Tue Jan 31 2023 ...

    return [firstDay, lastDay]
  },
  getDaysPassedFromDate: (userDate) => {
    userDate = new Date(userDate)
    userDate.setHours(0, 0, 0)
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0)

    const difference = currentDate.getTime() - userDate.getTime()
    const TotalDays = Math.ceil(difference / (1000 * 3600 * 24))
    console.log(TotalDays + ' dias han transcurrido hasta hoy')

    return TotalDays
  }

}

// RESTAR MESES A FECHA
function subtractMonths (date, months) {
  const date2 = new Date()
  date2.setMonth(date.getMonth() - months)
  return date2
}
