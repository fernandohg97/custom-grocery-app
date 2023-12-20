
function getDateRangeParams (req, res, next) {
  // let { fromDate, toDate } = req.query
  res.locals.fromDate = req.query.fromDate
  res.locals.toDate = req.query.toDate
  res.locals.invoiceDateFrom = undefined
  res.locals.invoiceDateTo = undefined

  if (!res.locals.fromDate || !res.locals.toDate) {
    console.log('no date')
    const currentDate = new Date()
    res.locals.fromDate = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate() < 10 ? '0'.concat(currentDate.getDate()) : currentDate.getDate()].join('-')
    res.locals.toDate = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate() < 10 ? '0'.concat(currentDate.getDate()) : currentDate.getDate()].join('-')
    res.locals.invoiceDateFrom = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate())).toISOString()
    res.locals.invoiceDateTo = new Date(currentDate.getFullYear(), currentDate.getMonth(), Number(currentDate.getDate()), 23, 59, 59).toISOString()
  } else {
    console.log('date from client')
    res.locals.invoiceDateFrom = new Date(res.locals.fromDate)
    res.locals.invoiceDateTo = new Date(res.locals.toDate)
    const fromMonth = (res.locals.invoiceDateFrom.getMonth()) < 10 ? '0'.concat(res.locals.invoiceDateFrom.getMonth()) : res.locals.invoiceDateFrom.getMonth()
    const toMonth = (res.locals.invoiceDateTo.getMonth()) < 10 ? '0'.concat(res.locals.invoiceDateTo.getMonth()) : res.locals.invoiceDateTo.getMonth()
    const fromDay = res.locals.invoiceDateFrom.getDate() < 10 ? '0'.concat(res.locals.invoiceDateFrom.getDate()) : res.locals.invoiceDateFrom.getDate()
    const toDay = res.locals.invoiceDateTo.getDate() < 10 ? '0'.concat(res.locals.invoiceDateTo.getDate()) : res.locals.invoiceDateTo.getDate()
    res.locals.invoiceDateFrom = new Date(res.locals.invoiceDateFrom.getFullYear(), fromMonth, Number(fromDay) + 1).toISOString()
    res.locals.invoiceDateTo = new Date(res.locals.invoiceDateTo.getFullYear(), toMonth, Number(toDay) + 1, 23, 59, 59).toISOString()
  }
  return next()
}

module.exports = getDateRangeParams
