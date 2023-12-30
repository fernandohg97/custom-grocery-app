'use strict'
const createError = require('http-errors')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')
const { defaultPurchaseStatus } = require('../../config/default-values')

module.exports = {
  sumPartialPaymentAmounts: async (req, res, next) => {
    try {
      await Sheet.loadInfo()

      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]

      const comprasRows = await comprasSheet.getRows()
      const pagosRows = await pagosSheet.getRows()
      const detallePagosRows = await detallePagosSheet.getRows()

      // OBTENER COMPRAS EN ESTATUS = PAGO_PARCIAL
      const comprasPagoParcial = comprasRows.filter(r => {
        return r.toObject().Estatus === defaultPurchaseStatus.PAGO_PARCIAL
      })

      // GUARD STATEMENT
      if (!comprasPagoParcial || !comprasPagoParcial.length) return next(createError(404, 'No se encontraron cuentas por pagar con pago parcial'))

      // console.log(comprasPagoParcial)

      // OBTENER FOLIOS DE PAGO de las compras de pago parcial
      const foliosDePago = comprasPagoParcial.flatMap(compra => {
        return detallePagosRows.filter(detallePago => {
          // console.log(`no nota compra: ${compra.toObject()['No Nota']} - no nota detalle pago: ${detallePago.toObject()['No Nota']}`)
          // TODO: update prop
          return compra.toObject()['No Nota'] === detallePago.toObject().FolioNota
          // if (compra['No Nota'] === detallePago['No Nota']) {
          //   const folio = detallePago['Folio de pago']
          //   return pagosRows.map(pago => {
          //     return pago.Folio === folio
          //   })
          // }
        }).map(r => r.toObject())
      })
      // console.log(foliosDePago)

      // Obtener los pagos correspondientes a las compras de pago parcial
      const pagosParciales = foliosDePago.flatMap(folio => {
        return pagosRows.filter(pago => {
          // console.log(folio)
          // console.log(`folio pago: ${pago.toObject().Folio} - folio detalle pago: ${folio['Folio de pago']}`)
          return folio['Folio de pago'] === pago.toObject().Folio
          // return folio.map(folioPago => folioPago['Folio de pago'] === pago.toObject().Folio)
        }).map(r => r.toObject())
      })
      // console.log('pagos parciales')
      // console.log(pagosParciales)

      // SUMAR LOS MONTOS DE PAGO DE TODAS LAS COMPRAS DE PAGO PARCIAL
      res.locals.sumPartialPayments = pagosParciales
        .map(pagoParcial => parseFloat(pagoParcial.Monto.split('$')[1].trim().split(',').join('')))
        .reduce((a, b) => {
          return parseFloat(a + b)
        }, 0)
      // console.log(res.locals.sumPartialPayments)
      // console.log(JSON.stringify(data))
      return next()
      // return res.json({ pagosParciales, totalBalance: sumPartialPayments })
      // res.end()
      // const totalAmount = cuentasPorPagar
      //   .map(cuenta => parseFloat(cuenta['Monto Total'].split('$')[1].trim().split(',').join('')))
      //   .reduce((a, b) => {
      //     return parseFloat(a + b)
      //   }, 0)
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json({
      //   accountsToPay: cuentasPorPagar,
      //   totalCount: cuentasPorPagar.length,
      //   totalAmount: totalAmount
      // })
      // const jsonResponse = JSON.stringify({
      //   accountsToPay: cuentasPorPagar,
      //   totalCount: cuentasPorPagar.length,
      //   totalAmount: totalAmount
      // })
      // return res.render('pages/purchases/accounts-to-pay', {
      //   jsonResponse
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
