const getAllUrl = 'https://api.hikeup.com/api/v1/sales/get_all'
const getAllRegisters = 'https://api.hikeup.com/api/v1/registerClosures/get_all'
const axios = require('axios').default
const createError = require('http-errors')
const salesTotal = require('../middlewares/sales/salesTotals')

class Sale {
  static async allSales (req, res, next) {
    console.log(res.locals.invoiceDateFrom, res.locals.invoiceDateTo)

    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    console.log(res.locals.fromDate, res.locals.toDate)
    try {
      // Call API to get all products
      const data = await axios.get(
        `${getAllUrl}?page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}&Sorting=transactionDate&invoice_range_from=${res.locals.invoiceDateFrom}&invoice_range_to=${res.locals.invoiceDateTo}`,
        opts)
      // console.log(data)
      const sales = data.data
      const totalCount = sales.totalCount
      const numberOfPages = Math.ceil(totalCount / res.locals.resultsPerPage)
      const netAmount = salesTotal.getTotalNetAmount(sales.items)

      return res.render('pages/sales/sales', {
        sales: sales.items,
        totalCount,
        netAmount,
        apiUrl: res.locals.apiUrl,
        resultsPerPage: res.locals.resultsPerPage,
        currentPage: res.locals.currentPage,
        numPages: numberOfPages,
        fromDate: res.locals.fromDate || res.locals.invoiceDateFrom,
        toDate: res.locals.toDate || res.locals.invoiceDateTo
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  static async allRegisterClosures (req, res, next) {
    console.log(res.locals.invoiceDateFrom, res.locals.invoiceDateTo)

    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    // console.log(res.locals.fromDate, res.locals.toDate)
    try {
      // Call API to get all products
      const data = await axios.get(
        `${getAllRegisters}?page_size=${500}&Skip_count=${0}&closure_range_from=2021-10-01T07:00:00.000Z&closure_range_to=2021-11-01T06:59:59.000Z`,
        opts)
      // console.log(data)
      const registers = data.data
      // const totalCount = sales.totalCount
      // const numberOfPages = Math.ceil(totalCount / res.locals.resultsPerPage)
      const totalSoldAmount = salesTotal.getTotalRegisterSales(registers.items)
      console.log(totalSoldAmount)
      return res.status(200).send(registers)
      // return res.render('pages/sales/sales', {
      //   sales: sales.items,
      //   totalCount,
      //   netAmount,
      //   resultsPerPage: res.locals.resultsPerPage,
      //   currentPage: res.locals.currentPage,
      //   numPages: numberOfPages,
      //   fromDate: res.locals.fromDate || res.locals.invoiceDateFrom,
      //   toDate: res.locals.toDate || res.locals.invoiceDateTo
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }
}

module.exports = Sale
