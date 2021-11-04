// const fs = require('fs/promises')
// const url = require('url')
const getAllUrl = 'https://api.hikeup.com/api/v1/sales/get_all'
const axios = require('axios').default
const createError = require('http-errors')

class Sale {
  static async allSales (req, res, next) {
    let { fromDate, toDate } = req.query
    console.log(fromDate, toDate)
    if (!fromDate || !toDate) {
      const currentDate = new Date()
      fromDate = toDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()).toISOString()
    } else {
      fromDate = new Date(fromDate)
      toDate = new Date(toDate)
      const fromMonth = (fromDate.getMonth()) < 10 ? '0'.concat(fromDate.getMonth()) : fromDate.getMonth()
      const toMonth = (toDate.getMonth()) < 10 ? '0'.concat(toDate.getMonth()) : toDate.getMonth()
      const fromDay = fromDate.getDate() < 10 ? '0'.concat(fromDate.getDate()) : fromDate.getDate()
      const toDay = toDate.getDate() < 10 ? '0'.concat(toDate.getDate()) : toDate.getDate()
      fromDate = new Date(fromDate.getFullYear(), fromMonth, Number(fromDay) + 1).toISOString()
      toDate = new Date(toDate.getFullYear(), toMonth, Number(toDay) + 1, 23, 59, 59).toISOString()
    }

    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    console.log(fromDate, toDate)
    try {
      // Call API to get all products
      const data = await axios.get(`${getAllUrl}?page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}&Sorting=transactionDate&invoice_range_from=${fromDate}&invoice_range_to=${toDate}`, opts)
      // console.log(data)
      const sales = data.data
      const totalCount = sales.totalCount
      const numberOfPages = Math.ceil(totalCount / res.locals.resultsPerPage)
      // const netAmounts = sales.items.map(sale => sale.netAmount).reduce((a, b) => a + b, 0)
      // console.log(netAmounts)
      // return res.status(200).send(sales.items)

      return res.render('pages/sales/sales', { sales: sales.items, totalCount, resultsPerPage: res.locals.resultsPerPage, currentPage: res.locals.currentPage, numPages: numberOfPages })
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
