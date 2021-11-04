function getPageParams (req, res, next) {
  // Declare response variables.
  res.locals.resultsPerPage = req.query.page_size || 15
  res.locals.skipCount = req.query.Skip_count || 0
  res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

  // Assign currentUrl variable
  // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
  res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]
  // 1. In case page is more than one or is one and it exists page param
  // 2. In case there is no page query params and page is one explicity
  if (res.locals.Skip_count > 0) {
    res.locals.previousUrl = res.locals.currentUrl.replace(
      `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
      `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) - Number(res.locals.resultsPerPage)}`
    )
    res.locals.forwardUrl = res.locals.currentUrl.replace(
      `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
      `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`
    )
  } else if (!req.query.Skip_count && res.locals.currentPage === 1) {
    res.locals.forwardUrl = res.locals.currentUrl.concat(`?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`)
  }

  console.log(res.locals)

  return next()
}

module.exports = getPageParams
