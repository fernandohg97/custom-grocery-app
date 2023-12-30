/* eslint-disable camelcase */
const createError = require('http-errors')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
const { defaultPurchaseStatus, defaultMassivePaymentValues, METRIC_GOALS } = require('../config/default-values')
// const { getDaysPassedFromDate } = require('../middlewares/defaultMonthRange')
const PurchaseModel = require('../models/purchase.model')
const moment = require('moment')

class Purchase {
  /** GET ALL COMPRAS */
  static async getAllPurchases (req, res, next) {
    req.app.locals.defaultPurchaseStatus = JSON.stringify(defaultPurchaseStatus)
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const data = rows.map(r => r.toObject())
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json(data)
      const jsonResponse = JSON.stringify({ purchasesData: data })
      return res.render('pages/purchases/purchases', {
        jsonResponse
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GET TODAY COMPRAS */
  static async getTodayPurchases (req, res, next) {
    const TodayPurchasesResume = {
      records: [],
      totalCount: 0,
      totalAmount: 0
    }
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      TodayPurchasesResume.records = rows.filter(r => {
        return moment(new Date(r.toObject()['Fecha Recibido'])).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
      }).map(r => {
        TodayPurchasesResume.totalAmount += parseFloat(r.toObject()['Monto Total'].split('$')[1].trim().split(',').join(''))
        return r.toObject()
      })

      // console.log(TodayPurchasesResume)
      TodayPurchasesResume.totalCount = TodayPurchasesResume.records.length
      res.locals.TodayPurchasesResume = { ...TodayPurchasesResume }
      // console.log(res.locals.TodayPurchasesResume)
      return next()
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json(data)
      // const jsonResponse = JSON.stringify({ purchasesData: todayPurchases })
      // return res.json(TodayPurchasesResume)
      // return res.render('pages/purchases/today-purchases', {
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

  static async getAllPurchasesWithPayments (req, res, next) {
    try {
      await Sheet.loadInfo()

      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallesPagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      const pagosRows = await pagosSheet.getRows()
      const detallesPagosRows = await detallesPagosSheet.getRows()

      // const comprasConPagos = compras.map((compra) => {
      //   return detallesPagos
      //     .filter((detallePago) => detallePago.toObject()['No Nota'] === compra.toObject()['No Nota'])
      //     .map(r => r.toObject())
      // })

      const comprasConPagos = comprasRows.map((compra) => {
        const pagosRelacionados = detallesPagosRows
          .filter((detallePago) => detallePago.toObject()['No Nota'] === compra.toObject()['No Nota'])
          .map((detallePago) => {
            return pagosRows.filter(pago => {
              return pago.toObject().Folio === detallePago.toObject()['Folio de pago']
            }).map(pago => ({
              FolioDePago: pago.toObject().Folio,
              Monto: pago.toObject().Monto,
              FechaDePago: pago.toObject()['Fecha de pago'],
              FormaDePago: pago.toObject()['Forma de pago'],
              CuentaDeDinero: pago.toObject()['Cuenta de dinero'],
              Comprobante: pago.toObject().Comprobante,
              Usuario: pago.toObject().Usuario
            }))
            // FolioDePago: detallePago.toObject()['Folio de pago'],
            // FechaDePago: detallePago.toObject()['Fecha de pago'],
            // Monto: detallePago.toObject().Monto
          })
        return {
          NoNota: compra.toObject()['No Nota'],
          Proveedor: compra.toObject().Proveedor,
          FechaRecibido: compra.toObject()['Fecha Recibido'],
          MontoTotal: compra.toObject()['Monto Total'],
          Estatus: compra.toObject().Estatus,
          Pagos: pagosRelacionados
        }
      })

      // console.log(data[0])
      // console.log(JSON.stringify(data))
      return res.json(comprasConPagos)
      // const jsonResponse = JSON.stringify({ providersData: data })
      // return res.render('pages/suppliers/all', {
      //   jsonResponse
      // })
    } catch (error) {
      console.log(error)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  }

  static async getOnePurchasePayments (req, res, next) {
    console.log('Path: ', req.originalUrl)
    const routePath = req.originalUrl

    const { note: noteNumber } = req.params
    let totalAbonado = 0
    let hasMassivePayment = false
    // console.log(typeof noteNumber)
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallesPagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const pagosRows = await pagosSheet.getRows()

      const detallesPagosRows = await detallesPagosSheet.getRows()
      const foliosDeLaNota = detallesPagosRows.filter(detallePago => detallePago.toObject().FolioNota === noteNumber)

      // GUARD STATEMENT
      if (!foliosDeLaNota || !foliosDeLaNota.length) {
        if (!routePath.includes('edit') && !routePath.includes('add-payment')) {
          return next(createError(404, `No se encontraron pagos con el No. Nota: ${noteNumber}`))
        }
      }
      console.log(foliosDeLaNota)

      // obtener pagos relacionados a la compra
      const pagosDeLaNota = foliosDeLaNota.map(folio => {
        return pagosRows.filter(pago => {
          return folio.toObject()['Folio de pago'] === pago.toObject().Folio
        }).map(r => {
          totalAbonado += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
          // console.log(r.toObject()['Pago masivo'])
          // check if a payment was massive payment
          if (r.toObject()['Pago masivo'] === 'TRUE') hasMassivePayment = true
          return {
            Folio: r.toObject().Folio,
            Monto: r.toObject().Monto,
            FechaDePago: r.toObject()['Fecha de pago'],
            FormaDePago: r.toObject()['Forma de pago'],
            CuentaDeDinero: r.toObject()['Cuenta de dinero'],
            Comprobante: r.toObject().Comprobante,
            Usuario: r.toObject().Usuario,
            EsPagoMasivo: r.toObject()['Pago masivo'] === defaultMassivePaymentValues.VERDADERO,
            Creado: r.toObject().Creado
          }
        })[0]
      })
      // console.log(totalAbonado)
      // console.log('massive payment: ')
      // console.log(hasMassivePayment)
      // console.log(pagosDeLaNota)

      if (routePath.includes('edit')) {
        res.locals.purchaseById.TotalPagado = totalAbonado
        // check if has MASSIVE PAYMENT to set Saldo
        res.locals.purchaseById.Saldo = hasMassivePayment ? 0 : parseFloat(res.locals.purchaseById['Monto Total'].split('$')[1].trim().split(',').join('')) - totalAbonado
        res.locals.purchaseById.EsPagoMasivo = hasMassivePayment
        const jsonResponse = JSON.stringify({
          purchaseById: res.locals.purchaseById,
          pagosDeLaNota: pagosDeLaNota
        })
        return res.render('pages/purchases/edit-purchase', {
          jsonResponse
        })
        // test in postman
        // return res.status(200).json({
        //   purchaseById: res.locals.purchaseById,
        //   pagosDeLaNota: pagosDeLaNota
        // })
      } else if (routePath.includes('add-payment')) {
        res.locals.purchaseByNoteNumber.TotalPagado = totalAbonado
        // check if has MASSIVE PAYMENT to set Saldo
        res.locals.purchaseByNoteNumber.Saldo = hasMassivePayment ? 0 : (parseFloat(res.locals.purchaseByNoteNumber['Monto Total'].split('$')[1].trim().split(',').join('')) - totalAbonado)
        res.locals.purchaseByNoteNumber.EsPagoMasivo = hasMassivePayment
        // return res.json({
        //   purchaseByNoteNumber: res.locals.purchaseByNoteNumber,
        //   pagosDeLaNota: pagosDeLaNota
        // })
        const jsonResponse = JSON.stringify({
          purchaseByNoteNumber: res.locals.purchaseByNoteNumber,
          pagosDeLaNota: pagosDeLaNota
        })
        return res.render('pages/purchases/add-payment', {
          jsonResponse
        })
      } else {
        // GUARD STATEMENT
        if (!pagosDeLaNota || !pagosDeLaNota.length) return next(createError(404, `No se encontraron pagos con el No. Nota: ${noteNumber}`))
        // check if has MASSIVE PAYMENT to set Saldo
        const saldo = hasMassivePayment ? 0 : parseFloat(res.locals.purchaseByNoteNumber['Monto Total'].split('$')[1].trim().split(',').join('')) - totalAbonado

        // successfull response
        return res.status(200).json({
          totalCount: pagosDeLaNota.length,
          totalAmount: parseFloat(res.locals.purchaseByNoteNumber['Monto Total'].split('$')[1].trim().split(',').join('')),
          totalPayed: totalAbonado,
          balance: saldo,
          hasMassivePayment,
          payments: pagosDeLaNota || []
        })
      }
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  static async getAllAccountsToPay (req, res, next) {
    try {
      req.app.locals.defaultPurchaseStatus = JSON.stringify(defaultPurchaseStatus)
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await sheet.getRows()
      // obtener todas las cuentas por pagar
      // solamente en estatus: PENDIENTE DE PAGO, PAGO PARCIAL Y COMPROMISO DE PAGO
      const cuentasPorPagar = comprasRows.filter(r => {
        return r.toObject().Estatus === defaultPurchaseStatus.PENDIENTE_DE_PAGO ||
          r.toObject().Estatus === defaultPurchaseStatus.PAGO_PARCIAL || r.toObject().Estatus === defaultPurchaseStatus.COMPROMISO_DE_PAGO
      }).map(r => r.toObject())
      // console.log(daysPassed)
      // GUARD STATEMENT
      if (!cuentasPorPagar || !cuentasPorPagar.length) return next(createError(404, 'No se encontraron cuentas por pagar'))

      // console.log(cuentasPorPagar)
      // OBTENER EL MONTO TOTAL DE LAS CUENTAS POR PAGAR
      const totalAmount = cuentasPorPagar
        .map(cuenta => parseFloat(cuenta['Monto Total'].split('$')[1].trim().split(',').join('')))
        .reduce((a, b) => {
          return parseFloat(a + b)
        }, 0)
      // console.log(totalAmount)
      // MONTO TOTAL - TOTAL ABONADO = SALDO
      const totalBalanceAmount = totalAmount - res.locals.sumPartialPayments
      // TODO: fix percentage operation
      const percentageBalanceProgress = totalAmount / METRIC_GOALS.SALDO_MINIMO_CUENTAS_POR_PAGAR
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json({
      //   accountsToPay: cuentasPorPagar,
      //   totalCount: cuentasPorPagar.length,
      //   totalAmount: totalAmount,
      //   totalPayed: res.locals.sumPartialPayments,
      //   totalBalanceAmount,
      //   percentageBalanceProgress,
      //   creditAccounts: res.locals.creditAccounts
      // })
      const jsonResponse = JSON.stringify({
        accountsToPay: cuentasPorPagar,
        totalCount: cuentasPorPagar.length,
        totalAmount: totalAmount,
        totalPayed: res.locals.sumPartialPayments,
        totalBalanceAmount,
        percentageBalanceProgress,
        creditAccounts: res.locals.creditAccounts
      })
      return res.render('pages/purchases/accounts-to-pay', {
        jsonResponse
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** OBTENER COMPRA POR ID */
  static async getPurchaseById (req, res, next) {
    // console.log('Path: ', req.originalUrl)

    const { id } = req.params
    console.log(id)
    try {
      await Sheet.loadInfo()

      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      let purchaseToFind = comprasRows.filter(r => {
        // if (r.toObject().ID === id) return r
        return r.toObject().ID === id ? r : null
      })
      // console.log(purchaseToFind)
      if (!purchaseToFind.length || !purchaseToFind) return next(createError(404, `Compra con ID: ${id} no encontrado!`))

      purchaseToFind = purchaseToFind[0].toObject()
      console.log(purchaseToFind)
      // console.log(JSON.stringify(data))
      // const jsonResponse = JSON.stringify(purchaseToFind)
      // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      res.locals.purchaseById = purchaseToFind
      // return res.render('pages/purchases/edit-purchase', {
      //   jsonResponse
      // })
      req.params.note = purchaseToFind['No Nota']
      return next()
      // return res.end()
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  }

  /** OBTENER COMPRA POR NO NOTA */
  static async getPurchaseByNoteNumber (req, res, next) {
    // console.log('Path: ', req.originalUrl)

    const { note } = req.params
    console.log(note)
    try {
      await Sheet.loadInfo()

      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      let purchaseToFind = comprasRows.filter(r => {
        // if (r.toObject().ID === id) return r
        return r.toObject()['No Nota'] === note ? r : null
      })
      // console.log(purchaseToFind)
      // GUARD STATEMENT
      if (!purchaseToFind.length || !purchaseToFind) return next(createError(404, `Compra con No. Nota: ${note} no encontrado!`))

      purchaseToFind = purchaseToFind[0].toObject()
      console.log(purchaseToFind)
      // console.log(JSON.stringify(data))
      // const jsonResponse = JSON.stringify(purchaseToFind)
      // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      res.locals.purchaseByNoteNumber = purchaseToFind
      // return res.render('pages/purchases/edit-purchase', {
      //   jsonResponse
      // })
      // req.params.note = purchaseToFind['No Nota']
      return next()
      // return res.end()
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  }

  /** GUARDAR NUEVA COMPRA */
  static async newPurchase (req, res, next) {
    console.log(req.body)
    const {
      noteNumber,
      providerName,
      type,
      dateRecord,
      totalAmount,
      status,
      dateToPayRecord,
      user,
      purchaseDetails
    } = req.body

    console.log('ESTATUS: ', status)
    res.locals.status = status
    console.log(req.file)
    // guard statement
    // return res.end()
    try {
      await Sheet.loadInfo()

      // guard statement
      if (status === defaultPurchaseStatus.LIQUIDADO) { // REGISTRAR COMPRA, PAGO Y DETALLE PAGO
        const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
        const newPurchase = await sheet.addRow(PurchaseModel.newPurchaseModel(
          noteNumber,
          providerName,
          totalAmount,
          dateRecord,
          dateToPayRecord,
          status,
          type,
          user,
          purchaseDetails
          // paymentMethod,
          // retirementAccount
        ))
        console.log('compra')
        console.log(newPurchase.toObject())
        if (!newPurchase) return next(createError(409, 'Ups, no se pudo crear la compra'))

        return next()
        // return res.status(201).json({ message: `😉 Compra #${newPurchase.toObject()['No Nota']} creada exitosamente!` })
      } else if (status === defaultPurchaseStatus.PAGO_PARCIAL) {
        const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
        const newPurchase = await sheet.addRow(PurchaseModel.newPurchaseModel(
          noteNumber,
          providerName,
          totalAmount,
          dateRecord,
          dateToPayRecord,
          status,
          type,
          user,
          purchaseDetails
        ))
        console.log(newPurchase)
        if (!newPurchase) return next(createError(400, 'Ups, no se pudo crear la compra'))

        return next()
      } else {
        const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
        const newPurchase = await sheet.addRow(PurchaseModel.newPurchaseModel(
          noteNumber,
          providerName,
          totalAmount,
          dateRecord,
          dateToPayRecord,
          status,
          type,
          user,
          purchaseDetails
        ))
        console.log(newPurchase)
        if (!newPurchase) return next(createError(400, 'Ups, no se pudo crear la compra'))

        return res.status(201).json({ message: `😉 Compra #${newPurchase.toObject()['No Nota']} creada exitosamente!` })
      }
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
    // return res.end()
  }

  /**
   * UPDATE ONE PURCHASE
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async updatePurchase (req, res, next) {
    // const data = req.body
    console.log('updatingPurchase...')
    // console.log(req.body)
    // console.log(req.params)
    const { id } = req.params
    console.log(id)
    const {
      type,
      totalAmount,
      dateRecord,
      dateToPayRecord,
      purchaseDetails
    } = req.body
    // console.log(req.body)

    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const purchaseIndex = rows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })
      // return
      console.log(purchaseIndex)
      // GUARD STATEMENT
      if (purchaseIndex < 0) return next(createError(404, `Compra con ID: ${id} no encontrado!`))

      const providerName = rows[purchaseIndex].get('Proveedor')
      const noteNumber = rows[purchaseIndex].get('No Nota')
      // set new values
      rows[purchaseIndex].assign(PurchaseModel.updatePurchaseModel(
        totalAmount,
        dateRecord,
        dateToPayRecord,
        type,
        purchaseDetails
      ))

      // Save row data
      await rows[purchaseIndex].save()
      return res.status(201).json({ message: `😉 Compra #${noteNumber} de ${providerName.toUpperCase()} actualizada exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * REMOVE ONE PURCHASE - PENDIENTE DE PAGO
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async removePurchase (req, res, next) {
    // const data = req.body
    console.log('remove...')
    // console.log(req.body)
    // console.log(req.params)
    const { id } = req.params
    // const { passwordConfirm } = req.body
    // console.log(id)
    try {
      await Sheet.loadInfo()

      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      const purchaseIndex = comprasRows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })
      console.log(purchaseIndex)
      if (purchaseIndex < 0) return next(createError(404, `Compra con ID: ${id} no encontrado!`))

      // get provider name
      const purchaseNoteNumber = comprasRows[purchaseIndex].get('No Nota')
      // delete row data
      await comprasRows[purchaseIndex].delete()
      return res.status(201).json({ message: `😉 Compra: ${purchaseNoteNumber} eliminada exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }
}

module.exports = Purchase
