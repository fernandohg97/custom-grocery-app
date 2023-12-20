'use strict'
// const authSheets = require('../authSheets')
// const { google } = require('googleapis')
// const SPREADHSHEET_ID = '15GhIMqxcLP956e1c9qpNxGfU3UBoTzODIL73CH8g0No'
const createError = require('http-errors')
const Sheet = require('./authSheets')
const WORKSHEETS = require('../config/worksheets')
// const { nanoid } = require('nanoid')
const { customAlphabet } = require('nanoid')

module.exports = {
  /**
   * Obtener el ID MAXIMO de proveedores
   */
  getProvidersMaxId: async (req, res, next) => {
  // Declare maxID Number to be inserted
    let maxIDNumber = 0

    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const uniqueIds = rows.map(r => Number(r.toObject().ID))
      console.log(uniqueIds)

      // Loop to get the max id number
      uniqueIds.forEach(id => {
        maxIDNumber = id > maxIDNumber ? id : maxIDNumber
      })

      // Add 1 to the maximun id number
      res.locals.newID = (maxIDNumber + 1).toString()

      return next()
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  },
  /**
   * Obtener el NO NOTA maximo de compras
   */
  getPurchasesMaxNoteNumber: async (req, res, next) => {
    // Declare maxID Number to be inserted
    let maxNoteNumber = 0

    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const noteNumbers = rows.map(r => Number(r.toObject()['No Nota']))

      // Loop to get the max id number
      noteNumbers.forEach(id => {
        maxNoteNumber = id > maxNoteNumber ? id : maxNoteNumber
      })

      // Add 1 to the maximun id number
      res.locals.newNoteNumber = (maxNoteNumber + 1).toString()
      // res.locals.newID = nanoid()
      // console.log(res.locals.newID)
      return next()
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  },
  /**
   * Obtener el NO NOTA maximo de compras
   */
  getMermasMaxId: async (req, res, next) => {
    // Declare maxID Number to be inserted
    let maxIDNumber = 0
    const letter = 'M'
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.mermasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const mermas = rows.map(r => Number(r.toObject().ID.split(letter)[1]))
      console.log(mermas)

      // Loop to get the max id number
      mermas.forEach(merma => {
        maxIDNumber = merma > maxIDNumber ? merma : maxIDNumber
      })

      // Add 1 to the maximun id number
      res.locals.newID = letter.concat(maxIDNumber + 1).toString()

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
