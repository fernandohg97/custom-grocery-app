/* eslint-disable camelcase */
const createError = require('http-errors')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
const { defaultPurchaseStatus, defaultMassivePaymentValues, defaultAgainstReceiptValues } = require('../config/default-values')
const { defaultPaymentMethods } = require('../config/default-values')
const { defaultMoneyAccounts } = require('../config/default-values')

// const { getDaysPassedFromDate } = require('../middlewares/defaultMonthRange')
const PaymentModel = require('../models/payment.model')
const PurchaseModel = require('../models/purchase.model')

const moment = require('moment')

class Payment {
/** GET ALL PAGOS */
// OBTENER LOS PAGOS DE LOS ULTIMOS 6 MESES
  static async getAllPayments (req, res, next) {
    req.app.locals.defaultPaymentMethods = JSON.stringify(defaultPaymentMethods)
    req.app.locals.defaultMoneyAccounts = JSON.stringify(defaultMoneyAccounts)

    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const AllPaymentsResume = {
        totalCount: 0,
        records: [],
        totalAmountPayed: 0,
        totalEfectivoFondoFijo: {
          totalCount: 0,
          totalAmountPayed: 0
        },
        totalMercancia: {
          totalCount: 0,
          totalAmountPayed: 0
        },
        totalByPaymentMethod: {
          TotalPayedEfectivo: 0,
          TotalPayedTransferenciaElectronica: 0,
          TotalPayedTarjetaDebito: 0,
          TotalPayedTarjetaCredito: 0,
          TotalPayedCheque: 0,
          TotalPayedPorDefinir: 0
        },
        getTotalSum: () => {
          return AllPaymentsResume.totalByPaymentMethod.TotalPayedEfectivo +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTransferenciaElectronica +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaDebito +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedCheque +
          AllPaymentsResume.totalByPaymentMethod.TotalPayedPorDefinir
        }
      }

      // FILTER DATA
      AllPaymentsResume.records = rows.filter(r => {
        return moment(new Date(r.toObject()['Fecha de pago'])).format('YYYY-MM-DD') >= moment().subtract(6, 'months').format('YYYY-MM-DD')
      }).map(r => {
      // sum total amount payments
        AllPaymentsResume.totalAmountPayed += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        // Count and sum total amount in EFECTIVO - FONDO FIJO
        if (r.toObject()['Forma de pago'] === defaultPaymentMethods.EFECTIVO && r.toObject()['Cuenta de dinero'] === defaultMoneyAccounts.FONDO_FIJO.code) {
          AllPaymentsResume.totalEfectivoFondoFijo.totalCount++
          AllPaymentsResume.totalEfectivoFondoFijo.totalAmountPayed += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        }
        // TODO: Obtener pagos del dia de hoy de TIPO MERCANCIA

        // SUM TOTAL PAYMENTS BY PAYMENT METHOD
        if (r.toObject()['Forma de pago'] === defaultPaymentMethods.EFECTIVO) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedEfectivo += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TRANSFERENCIA_ELECTRONICA) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTransferenciaElectronica += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TARJETA_DE_DEBITO) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaDebito += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TARJETA_DE_CREDITO) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.CHEQUE) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedCheque += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.POR_DEFINIR) {
          AllPaymentsResume.totalByPaymentMethod.TotalPayedPorDefinir += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        }
        return r.toObject()
      })

      AllPaymentsResume.totalCount = AllPaymentsResume.records.length
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json({
      //   data: AllPaymentsResume,
      //   sumTotalPaymentMethod: AllPaymentsResume.getTotalSum()
      // })
      const jsonResponse = JSON.stringify({
        data: AllPaymentsResume,
        sumTotalPaymentMethod: AllPaymentsResume.getTotalSum()
      })
      return res.render('pages/payments/payments', {
        jsonResponse
      })
    // return res.status(200).json({
    //   purchasesData: res.locals.TodayPurchasesResume,
    //   paymentsData: {
    //     ...TodayPaymentsResume,
    //     sumTotalPaymentMethod: TodayPaymentsResume.getTotalSum()
    //   }
    // })
    // return res.json({
    //   totalPaymentsCount: TodayPaymentsResume.records.length,
    //   totalPurchasesCount: res.locals.todayPurchases.length,
    //   totalPayed: TodayPaymentsResume.getTotalSum(),
    //   totalByPaymentMethod: TodayPaymentsResume,
    //   records: TodayPaymentsResume.records
    // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GET TODAY PAGOS */
  static async getTodayPayments (req, res, next) {
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const TodayPaymentsResume = {
        totalCount: 0,
        records: [],
        totalAmountPayed: 0,
        totalEfectivoFondoFijo: {
          totalCount: 0,
          totalAmountPayed: 0
        },
        totalMercancia: {
          totalCount: 0,
          totalAmountPayed: 0
        },
        totalByPaymentMethod: {
          TotalPayedEfectivo: 0,
          TotalPayedTransferenciaElectronica: 0,
          TotalPayedTarjetaDebito: 0,
          TotalPayedTarjetaCredito: 0,
          TotalPayedCheque: 0,
          TotalPayedPorDefinir: 0
        },
        getTotalSum: () => {
          return TodayPaymentsResume.totalByPaymentMethod.TotalPayedEfectivo +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTransferenciaElectronica +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaDebito +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedCheque +
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedPorDefinir
        }
      }

      TodayPaymentsResume.records = rows.filter(r => {
        return moment(new Date(r.toObject()['Fecha de pago'])).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
      }).map(r => {
        // sum total amount payments
        TodayPaymentsResume.totalAmountPayed += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        // Count and sum total amount in EFECTIVO - FONDO FIJO
        if (r.toObject()['Forma de pago'] === defaultPaymentMethods.EFECTIVO && r.toObject()['Cuenta de dinero'] === defaultMoneyAccounts.FONDO_FIJO.code) {
          TodayPaymentsResume.totalEfectivoFondoFijo.totalCount++
          TodayPaymentsResume.totalEfectivoFondoFijo.totalAmountPayed += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        }
        // TODO: Obtener pagos del dia de hoy de TIPO MERCANCIA

        // SUM TOTAL PAYMENTS BY PAYMENT METHOD
        if (r.toObject()['Forma de pago'] === defaultPaymentMethods.EFECTIVO) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedEfectivo += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TRANSFERENCIA_ELECTRONICA) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTransferenciaElectronica += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TARJETA_DE_DEBITO) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaDebito += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.TARJETA_DE_CREDITO) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedTarjetaCredito += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.CHEQUE) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedCheque += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        } else if (r.toObject()['Forma de pago'] === defaultPaymentMethods.POR_DEFINIR) {
          TodayPaymentsResume.totalByPaymentMethod.TotalPayedPorDefinir += parseFloat(r.toObject().Monto.split('$')[1].trim().split(',').join(''))
        }
        return r.toObject()
      })

      TodayPaymentsResume.totalCount = TodayPaymentsResume.records.length
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json(data)
      const jsonResponse = JSON.stringify({
        purchasesData: res.locals.TodayPurchasesResume,
        paymentsData: {
          ...TodayPaymentsResume,
          sumTotalPaymentMethod: TodayPaymentsResume.getTotalSum()
        }
      })
      return res.render('pages/purchases/today-purchases', {
        jsonResponse
      })
      // return res.status(200).json({
      //   purchasesData: res.locals.TodayPurchasesResume,
      //   paymentsData: {
      //     ...TodayPaymentsResume,
      //     sumTotalPaymentMethod: TodayPaymentsResume.getTotalSum()
      //   }
      // })
      // return res.json({
      //   totalPaymentsCount: TodayPaymentsResume.records.length,
      //   totalPurchasesCount: res.locals.todayPurchases.length,
      //   totalPayed: TodayPaymentsResume.getTotalSum(),
      //   totalByPaymentMethod: TodayPaymentsResume,
      //   records: TodayPaymentsResume.records
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /**
   * OBTENER 1 CUENTA POR PAGAR PARA REALIZAR ABONO
   */
  // static async getAccountToPay (req, res, next) {
  //   // console.log('Path: ', req.originalUrl)

  //   const { note } = req.params
  //   console.log(note)
  //   try {
  //     await Sheet.loadInfo()

  //     const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
  //     const comprasRows = await comprasSheet.getRows()
  //     let purchaseToFind = comprasRows.filter(r => {
  //       // if (r.toObject().ID === id) return r
  //       return r.toObject()['No Nota'] === note ? r : null
  //     })
  //     // console.log(purchaseToFind)
  //     if (!purchaseToFind.length || !purchaseToFind) return next(createError(404, `Compra con No. Nota: ${note} no encontrado!`))

  //     purchaseToFind = purchaseToFind[0].toObject()
  //     console.log(purchaseToFind)
  //     // console.log(JSON.stringify(data))
  //     // const jsonResponse = JSON.stringify(purchaseToFind)
  //     // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
  //     // res.locals.purchaseById = purchaseToFind
  //     // return res.render('pages/purchases/edit-purchase', {
  //     //   jsonResponse
  //     // })
  //     return res.send(purchaseToFind)
  //     // req.params.note = purchaseToFind['No Nota']
  //     // return next()
  //     // return res.end()
  //   } catch (error) {
  //     console.log(`Hubo un error: ${error}`)
  //     if (error.response) {
  //       if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
  //     }
  //     // const { response } = error
  //     // console.log(response)
  //     return next(error)
  //   }
  // }

  /**
   * REALIZAR UN ABONO A UNA CUENTA POR PAGAR -----------------------------------
   */
  static async addAbono (req, res, next) {
    console.log(req.body)
    const {
      noteNumber,
      status,
      saldo,
      paymentAmount,
      paymentDate,
      paymentMethod,
      retirementAccount,
      user
    } = req.body

    const isSettleAmount = paymentAmount === saldo
    const newStatusValue = isSettleAmount ? defaultPurchaseStatus.LIQUIDADO : defaultPurchaseStatus.PAGO_PARCIAL

    // POR DEFECTO - Realizar un pago al mismo tiempo que se registra la compra
    // La columna 'Pago masivo' es false
    const isMassivePayment = false
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]

      const newPayment = await pagosSheet.addRow(PaymentModel.newPaymentModel(
        paymentAmount,
        paymentDate,
        paymentMethod,
        retirementAccount,
        user,
        isMassivePayment
      ))
      console.log(newPayment.toObject().Folio)

      // guard statement
      if (!newPayment) return next(createError(400, 'Ups, no se pudo crear el pago'))

      const newPaymentDetail = await detallePagosSheet.addRow(PaymentModel.newPaymentDetailModel(
        noteNumber,
        newPayment.toObject().Folio
      ))

      console.log(newPaymentDetail)
      // GUARD STATEMENT
      if (!newPaymentDetail) return next(createError(400, 'Ups, no se pudo crear el detalle de pago'))

      // CHANGE PURCHASE STATUS AFTER PAYMENT APPLIED -----------------
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      const purchaseIndex = comprasRows.findIndex(r => {
        return Number(r.toObject()['No Nota']) === Number(noteNumber)
      })

      console.log(purchaseIndex)
      // GUARD STATEMENT
      if (purchaseIndex < 0) return next(createError(404, `Compra con No. Nota: ${noteNumber} no encontrado!`))

      // make updates to purchase status
      comprasRows[purchaseIndex].set('Estatus', newStatusValue)
      await comprasRows[purchaseIndex].save()

      // ✅ EXITO EN ACTUALIZAR COMPRA, PAGO Y DETALLE DE PAGO
      return res.status(201).json({ message: `Folio de pago #${newPayment.toObject().Folio} a nota: #${noteNumber} creado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * OBTENER LAS NOTAS (COMPRAS) REFERIDAS A UN PAGO POR FOLIO - sin masivo - sin contrarecibo
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getAllPaymentNotesByFolio (req, res, next) {
    const { folio } = req.params
    console.log(folio)
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const pagosRows = await pagosSheet.getRows()

      // Obtener el pago del folio
      let pagoToFind = pagosRows.filter(r => r.toObject().Folio === folio)
      console.log(pagoToFind)

      // guard statement --------------
      if (!pagoToFind.length || !pagoToFind) return next(createError(404, `Pago con folio: ${folio} no encontrado!`))

      // destrcuture object
      pagoToFind = pagoToFind[0].toObject()
      console.log(pagoToFind)

      const validIsRegularPayment = pagoToFind['Pago masivo'] === defaultMassivePaymentValues.FALSO && pagoToFind['Pago contrarecibo'] === defaultAgainstReceiptValues.FALSO

      // guard statement - if is massive payment --------------
      if (!validIsRegularPayment) return next(createError(404, `Pago con folio: ${folio} no es un pago regular!`))

      // Detalle pagos
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const detallePagosRows = await detallePagosSheet.getRows()

      // notas con folio
      const notasConFolio = detallePagosRows.filter(detallePago => {
        return detallePago.toObject()['Folio de pago'] === folio
      }).map(r => r.toObject().FolioNota)
      console.log(notasConFolio)

      // GUARD STATEMENT
      if (!notasConFolio || !notasConFolio.length) {
        return next(createError(404, `No se encontraron notas con el folio: ${folio}`))
      }

      // OBTENER COMPRAS POR NOTAS OBTENIDAS
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()

      // compras por cada nota
      const comprasPorNota = notasConFolio.map(nota => {
        return comprasRows
          .filter(compra => {
            return compra.toObject()['No Nota'] === nota
          }).map(r => r.toObject())[0]
      })

      // guard statement - compras
      if (!comprasPorNota || !comprasPorNota.length) return next(createError(404, `No se encontraron compras con las notas: ${notasConFolio.join(', ')}`))
      console.log(comprasPorNota)

      // ✅ Exito en obtener la compras por folio de pago masivo
      return res.status(200).json(comprasPorNota)
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * OBTENER LAS NOTAS (COMPRAS) REFERIDAS A UN PAGO MASIVO POR FOLIO
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getAllMassivePaymentNotes (req, res, next) {
    const { folio } = req.params
    console.log(folio)
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const pagosRows = await pagosSheet.getRows()

      // Obtener el pago del folio
      let pagoToFind = pagosRows.filter(r => r.toObject().Folio === folio)
      console.log(pagoToFind)

      // guard statement --------------
      if (!pagoToFind.length || !pagoToFind) return next(createError(404, `Pago con folio: ${folio} no encontrado!`))

      pagoToFind = pagoToFind[0].toObject()
      console.log(pagoToFind)

      const isMassivePayment = pagoToFind['Pago masivo'] === defaultMassivePaymentValues.VERDADERO

      // guard statement - if is massive payment --------------
      if (!isMassivePayment) return next(createError(404, `Pago con folio: ${folio} no es un pago masivo!`))

      // Detalle pagos
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const detallePagosRows = await detallePagosSheet.getRows()

      // notas con folio
      const notasConFolio = detallePagosRows.filter(detallePago => {
        return detallePago.toObject()['Folio de pago'] === folio
      }).map(r => r.toObject().FolioNota)
      console.log(notasConFolio)

      // GUARD STATEMENT
      if (!notasConFolio || !notasConFolio.length) {
        return next(createError(404, `No se encontraron notas con el folio: ${folio}`))
      }

      // OBTENER COMPRAS POR NOTAS OBTENIDAS
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()

      // compras por cada nota
      const comprasPorNotaDePagoMasivo = notasConFolio.map(nota => {
        return comprasRows
          .filter(compra => {
            return compra.toObject()['No Nota'] === nota
          }).map(r => r.toObject())[0]
      })

      // guard statement - compras
      if (!comprasPorNotaDePagoMasivo || !comprasPorNotaDePagoMasivo.length) return next(createError(404, `No se encontraron compras con las notas: ${notasConFolio.join(', ')}`))
      console.log(comprasPorNotaDePagoMasivo)

      // ✅ Exito en obtener la compras por folio de pago masivo
      return res.status(200).json(comprasPorNotaDePagoMasivo)
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * OBTENER LAS NOTAS (COMPRAS) REFERIDAS A UN PAGO CONTRARECIBO POR FOLIO
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  static async getAllAgainstReceiptPaymentNotes (req, res, next) {
    const { folio } = req.params
    console.log(folio)
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const pagosRows = await pagosSheet.getRows()

      // Obtener el pago del folio
      let pagoToFind = pagosRows.filter(r => r.toObject().Folio === folio)
      console.log(pagoToFind)

      // guard statement --------------
      if (!pagoToFind.length || !pagoToFind) return next(createError(404, `Pago con folio: ${folio} no encontrado!`))

      pagoToFind = pagoToFind[0].toObject()
      console.log(pagoToFind)

      const isReceiptPayment = pagoToFind['Pago contrarecibo'] === defaultAgainstReceiptValues.VERDADERO

      // guard statement - if is massive payment --------------
      if (!isReceiptPayment) return next(createError(404, `Pago con folio: ${folio} no es un pago contrarecibo!`))

      // Detalle pagos
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const detallePagosRows = await detallePagosSheet.getRows()

      // notas con folio
      const receiptFolio = detallePagosRows.find(detallePago => {
        return detallePago.toObject()['Folio de pago'] === folio
      }).toObject().FolioNota
      // .map(r => r.toObject().FolioNota)
      console.log(receiptFolio)

      // GUARD STATEMENT
      if (!receiptFolio) {
        return next(createError(404, `No se encontró contrarecibo con folio: ${folio}`))
      }

      // CONTRA RECIBO POR FOLIO
      const contraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.contraRecibosSheet.SHEETNAME]
      const contraRecibosRows = await contraRecibosSheet.getRows()
      const oneContrareciboData = contraRecibosRows.find(cr => cr.toObject().Folio === receiptFolio).toObject()
      console.log(oneContrareciboData)
      // GUARD STATEMENT
      if (!Object.keys(oneContrareciboData).length || !oneContrareciboData) return next(createError(404, `No se encontro contrarecibo con folio: ${receiptFolio}`))

      // OBTENER NOTAS POR contrarecibo
      const detallesContraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesContraRecibosSheet.SHEETNAME]
      const detallesContraRecibosRows = await detallesContraRecibosSheet.getRows()
      const notas = detallesContraRecibosRows.filter(detalleCR => detalleCR.toObject().Folio.toString() === receiptFolio.toString()).map(r => r.toObject())
      console.log(notas)
      // // compras por cada nota
      // const comprasPorNotaDePagoMasivo = notasConFolio.map(nota => {
      //   return comprasRows
      //     .filter(compra => {
      //       return compra.toObject()['No Nota'] === nota
      //     }).map(r => r.toObject())[0]
      // })

      // guard statement - compras
      if (!notas || !notas.length) return next(createError(404, `No se encontraron notas del contrarecibo: ${receiptFolio}`))
      // console.log(comprasPorNotaDePagoMasivo)

      // ✅ Exito en obtener la compras por folio de pago masivo
      return res.status(200).json({
        data: { ...oneContrareciboData, totalCount: notas.length },
        records: notas
      })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * REALIZAR UN PAGO MASIVO -----------------------------------
   * TODO: CREATE PROMISE ALL in case one db action throwe an error: in progress
   */
  static async newMassivePayment (req, res, next) {
    // console.log(req.body)
    const { resume, accountsToPay, paymentMethod, user, isMassivePayment, isAgainstReceiptPayment } = req.body
    // const payments = JSON.parse(req.body.payments)
    console.log(resume)
    console.log(accountsToPay)
    console.log(paymentMethod)
    const retirementAccount = paymentMethod === defaultPaymentMethods.EFECTIVO ? defaultMoneyAccounts.FONDO_FIJO.code : defaultMoneyAccounts.BANAMEX_EMPRESA.code

    // POR DEFECTO - Realizar un pago masivo
    // La columna 'Pago masivo' es true en automatico
    // const isMassivePayment = true
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]

      // create payment
      const newPayment = await pagosSheet.addRow(PaymentModel.newPaymentModel(
        resume.totalAmountToPay,
        undefined,
        paymentMethod,
        retirementAccount,
        user,
        isMassivePayment,
        isAgainstReceiptPayment
      ))

      const massivePaymentFolio = newPayment.toObject().Folio
      console.log(massivePaymentFolio)

      // GUARD STATEMENT -------
      if (!newPayment) return next(createError(400, 'Ups, no se pudo crear el pago'))

      // ITERATE TO ALL ACCOUNTS TO PAY ------------
      for (let index = 0; index < accountsToPay.length; index++) {
        const noteNumber = accountsToPay[index]['No Nota']

        const newPaymentDetail = await detallePagosSheet.addRow(PaymentModel.newPaymentDetailModel(
          noteNumber,
          massivePaymentFolio
        ))

        console.log(newPaymentDetail)
        // GUARD STATEMENT
        if (!newPaymentDetail) return next(createError(400, 'Ups, no se pudo crear el detalle de pago'))
      }

      // const newPaymentDetail = await detallePagosSheet.addRow(PaymentModel.newPaymentDetailModel(
      //   noteNumber,
      //   newPayment.toObject().Folio
      // ))
      // return res.end()

      // CHANGE PURCHASE STATUS AFTER PAYMENT APPLIED -----------------
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      const comprasIndexes = []

      // iterate note numbers to update status column -----------------
      for (let i = 0; i < accountsToPay.length; i++) {
        const noteNumber = accountsToPay[i]['No Nota']
        // iterate compras rows google sheet
        comprasRows.forEach((curr, index) => {
          if (Number(curr.toObject()['No Nota']) === Number(noteNumber)) {
            comprasIndexes.push(index)
          }
          // return acc
        })
      }
      console.log(comprasIndexes)
      // const purchaseIndex = comprasRows.findIndex(r => {
      //   return Number(r.toObject()['No Nota']) === Number(noteNumber)
      // })

      // console.log(purchaseIndex)
      // GUARD STATEMENT -----------
      if (!comprasIndexes.length || comprasIndexes.length !== Number(resume.totalCount)) return next(createError(404, 'No se obtuvieron los indices de los No. Nota correctamente!'))

      // make updates to purchase status
      comprasIndexes.forEach(async compraIndex => {
        comprasRows[compraIndex].set('Estatus', defaultPurchaseStatus.LIQUIDADO)
        await comprasRows[compraIndex].save()
      })

      // // ✅ EXITO EN ACTUALIZAR COMPRA, PAGO Y DETALLE DE PAGO
      return res
        .status(201)
        .json({ message: `Pago masivo con folio #${massivePaymentFolio} a ${Number(resume.totalCount)} notas de ${resume.providerName.toUpperCase()} creado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /** GUARDAR NUEVA COMPRA con PAGO AL INSTANTE
   * MIDDLEWARE solo se ejecuta en la ruta de /purchases
   */
  static async addPayment (req, res, next) {
    console.log(req.body)
    const {
      noteNumber,
      totalAmount,
      partialAmount,
      dateRecord,
      paymentMethod,
      retirementAccount,
      user
    } = req.body

    // console.log('ESTATUS: ', status)

    // POR DEFECTO - Realizar un pago al mismo tiempo que se registra la compra
    // La columna 'Pago masivo' es false
    const isMassivePayment = false
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]

      const newPayment = await pagosSheet.addRow(PaymentModel.newPaymentModel(
        res.locals.status === defaultPurchaseStatus.PAGO_PARCIAL ? partialAmount : totalAmount,
        dateRecord,
        paymentMethod,
        retirementAccount,
        '',
        user,
        isMassivePayment
      ))
      console.log(newPayment.toObject().Folio)

      // guard statement
      if (!newPayment) return next(createError(400, 'Ups, no se pudo crear el pago'))

      const newPaymentDetail = await detallePagosSheet.addRow(PaymentModel.newPaymentDetailModel(
        noteNumber,
        newPayment.toObject().Folio
      ))
      console.log(newPaymentDetail)
      if (!newPaymentDetail) return next(createError(400, 'Ups, no se pudo crear el detalle de pago'))

      // ✅ EXITO EN REGISTRAR COMPRA, PAGO Y DETALLE DE PAGO
      return res.status(201).json({ message: `😉 Compra #${noteNumber} y pago #${newPayment.toObject().Folio} creada exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
    // return res.end()
  }
}

module.exports = Payment
