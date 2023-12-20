'use strict'
// const authSheets = require('../authSheets')
// const { google } = require('googleapis')
// const SPREADHSHEET_ID = '15GhIMqxcLP956e1c9qpNxGfU3UBoTzODIL73CH8g0No'
const createError = require('http-errors')
const Sheet = require('./authSheets')
const WORKSHEETS = require('../config/worksheets')
const { getFirstDayOfMonthToLastDayOfCurrentMonth } = require('./defaultMonthRange')

const getTotalCountElements = {
  /**
   * GET TOTAL NUMBER OF ALL SUPPLIERS
   * @returns
   */
  totalNumberOfSuppliers: async (req, res, next) => {
    // Get auth client

    // // Instance of google sheets api
    // const googleSheets = google.sheets({ version: 'v4', auth: authClient })

    // // Sheetname and range to be updated
    // const sheetName = 'Datos Proveedores'
    // const range = '!A4:A'

    // // Set options to send request
    // const options = {
    //   auth: authClient,
    //   spreadsheetId: SPREADHSHEET_ID,
    //   range: sheetName + range,
    //   valueRenderOption: 'FORMATTED_VALUE'

    try {
      await Sheet.loadInfo()

      // // Get rows from spreadsheet
      // const response = (await googleSheets.spreadsheets.values.get(options)).data
      // // console.log(response)
      // const totalCount = response.values.length
      // // let jsonResponse = JSON.stringify({providersData: response.values})
      // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      console.log(rows.length)

      res.locals.totalCountSuppliers = rows.length
      next()
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  },
  /**
   * GET TOTAL NUMBER OF ALL SUPPLIERS
   * @returns
   */
  totalNumberOfPurchases: async (req, res, next) => {
    // // Get auth client
    // const authClient = await authSheets()

    // // Instance of google sheets api
    // const googleSheets = google.sheets({ version: 'v4', auth: authClient })

    // // Sheetname and range to be updated
    // const sheetName = 'Compras'
    // const range = '!A12:A'

    // // Set options to send request
    // const options = {
    //   auth: authClient,
    //   spreadsheetId: SPREADHSHEET_ID,
    //   range: sheetName + range,
    //   valueRenderOption: 'FORMATTED_VALUE'
    // }

    try {
      await Sheet.loadInfo()

      // // Get rows from spreadsheet
      // const response = (await googleSheets.spreadsheets.values.get(options)).data
      // // console.log(response)
      // const totalCount = response.values.length
      // // let jsonResponse = JSON.stringify({providersData: response.values})
      // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      // console.log(totalCount)
      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      console.log(rows.length)
      res.locals.totalCountPurchases = rows.length
      next()
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  },
  // OBTENER EL TOTAL NUMERO DE PAGOS EN EL MES ACTUAL
  totalNumberOfPayments: async (req, res, next) => {
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const [firstDay, lastDay] = getFirstDayOfMonthToLastDayOfCurrentMonth(0)
      const thisMonth = rows.filter(r => {
        return new Date(r.toObject()['Fecha de pago']) >= new Date(firstDay) && new Date(r.toObject()['Fecha de pago']) <= new Date(lastDay)
      })
      // console.log(thisMonth)
      // console.log(thisMonth.length)

      res.locals.totalCountPayments = thisMonth.length
      return next()
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

}

module.exports = getTotalCountElements
