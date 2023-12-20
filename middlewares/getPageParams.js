
module.exports = {
  getAllProductsPageParams: (req, res, next) => {
    // Current API url called
    res.locals.apiUrl = req.baseUrl

    // Declare response variables.
    res.locals.resultsPerPage = req.query.page_size || 30
    res.locals.skipCount = req.query.Skip_count || 0
    res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

    // Assign currentUrl variable
    // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
    res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]
    console.log(req.originalUrl)
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
  },
  getAllSupplierProductPageParams: (req, res, next) => {
    const { supplierId, supplierName } = req.query
    // Current API url called
    res.locals.apiUrl = req.baseUrl.concat(req.path)

    // Declare response variables.
    res.locals.resultsPerPage = req.query.page_size || 50
    res.locals.skipCount = req.query.Skip_count || 0
    res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

    // Assign currentUrl variable
    // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
    res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]

    // 1. In case page is more than one or is one and it exists page param
    // 2. In case there is no page query params and page is one explicity
    if (res.locals.Skip_count > 0) {
      res.locals.previousUrl = res.locals.currentUrl.replace(
        `supplierId=${supplierId}&supplierName=${supplierName}&page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
        `?supplierId=${supplierId}&supplierName=${supplierName}&page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) - Number(res.locals.resultsPerPage)}`
      )
      res.locals.forwardUrl = res.locals.currentUrl.replace(
        `supplierId=${supplierId}&supplierName=${supplierName}&page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
        `?supplierId=${supplierId}&supplierName=${supplierName}&page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`
      )
    } else if (!req.query.Skip_count && res.locals.currentPage === 1) {
      res.locals.forwardUrl = res.locals.currentUrl.concat(`?supplierId=${supplierId}&supplierName=${supplierName}&page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`)
    }

    return next()
  },
  getProductTypesPageParams: (req, res, next) => {
    // Declare response variables.
    res.locals.resultsPerPage = req.query.page_size || 30
    res.locals.skipCount = req.query.Skip_count || 0
    res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

    // Assign currentUrl variable
    // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
    res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]
    console.log(req.originalUrl)
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
}
// function getAllProductsPageParams (req, res, next) {
//   // Declare response variables.
//   res.locals.resultsPerPage = req.query.page_size || 30
//   res.locals.skipCount = req.query.Skip_count || 0
//   res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

//   // Assign currentUrl variable
//   // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
//   res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]
//   console.log(req.originalUrl)
//   // 1. In case page is more than one or is one and it exists page param
//   // 2. In case there is no page query params and page is one explicity
//   if (res.locals.Skip_count > 0) {
//     res.locals.previousUrl = res.locals.currentUrl.replace(
//       `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
//       `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) - Number(res.locals.resultsPerPage)}`
//     )
//     res.locals.forwardUrl = res.locals.currentUrl.replace(
//       `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
//       `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`
//     )
//   } else if (!req.query.Skip_count && res.locals.currentPage === 1) {
//     res.locals.forwardUrl = res.locals.currentUrl.concat(`?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`)
//   }

//   console.log(res.locals)

//   return next()
// }

// function getProductTypesPageParams (req, res, next) {
//   // Declare response variables.
//   res.locals.resultsPerPage = req.query.page_size || 30
//   res.locals.skipCount = req.query.Skip_count || 0
//   res.locals.currentPage = (Number(res.locals.skipCount) / Number(res.locals.resultsPerPage)) + 1

//   // Assign currentUrl variable
//   // res.locals.currentUrl = !req.query.Skip_count && res.locals.currentPage === 1 ? '' : req.originalUrl.split('?')[1].split('&')[0]
//   res.locals.currentUrl = !req.query.Skip_count ? '' : req.originalUrl.split('?')[1]
//   console.log(req.originalUrl)
//   // 1. In case page is more than one or is one and it exists page param
//   // 2. In case there is no page query params and page is one explicity
//   if (res.locals.Skip_count > 0) {
//     res.locals.previousUrl = res.locals.currentUrl.replace(
//       `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
//       `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) - Number(res.locals.resultsPerPage)}`
//     )
//     res.locals.forwardUrl = res.locals.currentUrl.replace(
//       `page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}`,
//       `?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`
//     )
//   } else if (!req.query.Skip_count && res.locals.currentPage === 1) {
//     res.locals.forwardUrl = res.locals.currentUrl.concat(`?page_size=${res.locals.resultsPerPage}&Skip_count=${Number(res.locals.skipCount) + Number(res.locals.resultsPerPage)}`)
//   }

//   console.log(res.locals)

//   return next()
// }

// module.exports = {
//   getAllProductsPageParams,
//   getProductTypesPageParams
// }
