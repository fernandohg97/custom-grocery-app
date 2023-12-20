'use strict'
const createError = require('http-errors')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')

const getSupplierBasicData = {
  /**
   * OBTENER TODOS LOS NOMBRES DE LOS PROVEEDORES
   */
  getAllProviderNames: async (req, res, next) => {
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const data = rows.map(r => r.toObject().Proveedor)
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // res.locals.providerNames = JSON.stringify({ providerNames: data })
      res.locals.providerNames = data

      return next()
    } catch (error) {
      // console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }
}

module.exports = getSupplierBasicData
